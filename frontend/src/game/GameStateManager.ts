import { EntityStateManager } from './EntityStateManager';
import { MapStateManager } from './MapStateManager';
import { createDefaultGameState, type GameAsset, type GameEntity, type GameMapState, type GameState, type Vector3 } from './types';

export type { AssetFormat, EntityKind, GameAsset, GameEntity, GameState } from './types';

export class GameStateManager {
  private static sequence = 1;

  private history: GameState[] = [];
  private future: GameState[] = [];
  private state: GameState;
  private readonly entityManager = new EntityStateManager((prefix) => GameStateManager.createId(prefix));
  private readonly mapManager = new MapStateManager();

  constructor(initialState?: Partial<GameState>) {
    this.state = createDefaultGameState(initialState);
  }

  static createId(prefix: string): string {
    const current = GameStateManager.sequence;
    GameStateManager.sequence += 1;
    return `${prefix}-${current}`;
  }

  snapshot(): GameState {
    return structuredClone(this.state);
  }

  canUndo(): boolean {
    return this.history.length > 0;
  }

  canRedo(): boolean {
    return this.future.length > 0;
  }

  listEntities(): GameEntity[] {
    return [...this.state.entities];
  }

  getEntity(entityId: string): GameEntity | undefined {
    return this.state.entities.find((entity) => entity.id === entityId);
  }

  listAssets(): GameAsset[] {
    return [...this.state.assets];
  }

  getAsset(assetId: string): GameAsset | undefined {
    return this.state.assets.find((asset) => asset.id === assetId);
  }

  getMap(): GameMapState {
    return { ...this.state.map };
  }

  getState(): GameState {
    return this.snapshot();
  }

  private commit(nextState: GameState): GameState {
    this.history.push(this.snapshot());
    this.future = [];
    this.state = nextState;
    return this.snapshot();
  }

  private setState(nextState: GameState, recordHistory = true): GameState {
    if (recordHistory) {
      return this.commit(nextState);
    }

    this.state = nextState;
    return this.snapshot();
  }

  createEntity(
    kind: GameEntity['kind'],
    name: string,
    position: Vector3,
    overrides: Partial<Omit<GameEntity, 'id' | 'kind' | 'name' | 'position' | 'createdAt' | 'updatedAt'>> = {}
  ): GameEntity {
    const nextEntities = this.entityManager.createEntity(this.state.entities, kind, name, position, overrides);
    const created = nextEntities[nextEntities.length - 1];
    const nextState: GameState = {
      ...this.state,
      entities: nextEntities
    };

    this.setState(nextState);
    return created!;
  }

  updateEntity(
    entityId: string,
    patch: Partial<Pick<GameEntity, 'name' | 'position' | 'rotation' | 'scale' | 'layer' | 'properties' | 'assetId' | 'character'>>
  ): GameEntity | undefined {
    const exists = this.getEntity(entityId);
    if (!exists) {
      return undefined;
    }

    const nextState: GameState = {
      ...this.state,
      entities: this.entityManager.updateEntity(this.state.entities, entityId, patch)
    };

    this.setState(nextState);
    return this.getEntity(entityId);
  }

  deleteEntity(entityId: string): boolean {
    const previousLength = this.state.entities.length;
    const nextState: GameState = {
      ...this.state,
      entities: this.entityManager.deleteEntity(this.state.entities, entityId)
    };

    this.setState(nextState);
    return this.state.entities.length !== previousLength;
  }

  duplicateEntity(entityId: string): GameEntity | undefined {
    const previousLength = this.state.entities.length;
    const nextEntities = this.entityManager.duplicateEntity(this.state.entities, entityId);

    if (nextEntities.length === previousLength) {
      return undefined;
    }

    const duplicated = nextEntities[nextEntities.length - 1];
    this.setState({
      ...this.state,
      entities: nextEntities
    });

    return duplicated;
  }

  createAsset(asset: Omit<GameAsset, 'id' | 'entityIds' | 'createdAt' | 'updatedAt'>): GameAsset {
    const now = new Date().toISOString();
    const nextAsset: GameAsset = {
      id: GameStateManager.createId('asset'),
      entityIds: [],
      createdAt: now,
      updatedAt: now,
      ...asset
    };

    const nextState: GameState = {
      ...this.state,
      assets: [...this.state.assets, nextAsset]
    };

    this.setState(nextState);
    return nextAsset;
  }

  deleteAsset(assetId: string): boolean {
    const previousLength = this.state.assets.length;
    const nextState: GameState = {
      ...this.state,
      assets: this.state.assets.filter((asset) => asset.id !== assetId),
      entities: this.state.entities.map((entity) =>
        entity.assetId === assetId ? { ...entity, assetId: null } : entity
      )
    };

    this.setState(nextState);
    return this.state.assets.length !== previousLength;
  }

  assignAssetToEntity(entityId: string, assetId: string | null): GameEntity | undefined {
    const updated = this.updateEntity(entityId, { assetId });

    if (!updated) {
      return undefined;
    }

    this.state = {
      ...this.state,
      assets: this.state.assets.map((asset) => {
        if (asset.id === assetId) {
          return {
            ...asset,
            entityIds: Array.from(new Set([...asset.entityIds, entityId])),
            updatedAt: new Date().toISOString()
          };
        }

        return {
          ...asset,
          entityIds: asset.entityIds.filter((id) => id !== entityId)
        };
      })
    };

    return updated;
  }

  updateMap(patch: Partial<GameMapState>): GameMapState {
    const nextMap = this.mapManager.updateMap(this.state.map, patch);
    this.setState({
      ...this.state,
      map: nextMap
    });
    return nextMap;
  }

  serialize(): string {
    return JSON.stringify(this.state, null, 2);
  }

  deserialize(rawState: string): GameState {
    const parsed = JSON.parse(rawState) as Partial<GameState>;
    const nextState = createDefaultGameState(parsed);
    this.setState(nextState);
    return this.snapshot();
  }

  rebuildFromState(nextState: GameState): GameState {
    const normalizedState = createDefaultGameState(nextState);
    this.setState(normalizedState);
    return this.snapshot();
  }

  undo(): GameState | undefined {
    const previous = this.history.pop();

    if (!previous) {
      return undefined;
    }

    this.future.push(this.snapshot());
    this.state = previous;
    return this.snapshot();
  }

  redo(): GameState | undefined {
    const next = this.future.pop();

    if (!next) {
      return undefined;
    }

    this.history.push(this.snapshot());
    this.state = next;
    return this.snapshot();
  }
}

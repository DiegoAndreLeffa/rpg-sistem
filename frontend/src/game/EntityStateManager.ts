import type { GameEntity, Vector3 } from './types';

type EntityOverrides = Partial<Omit<GameEntity, 'id' | 'kind' | 'name' | 'position' | 'createdAt' | 'updatedAt'>>;

export class EntityStateManager {
  constructor(private readonly createId: (prefix: string) => string) {}

  createEntity(entities: GameEntity[], kind: GameEntity['kind'], name: string, position: Vector3, overrides: EntityOverrides = {}): GameEntity[] {
    const now = new Date().toISOString();
    const entityBase: GameEntity = {
      id: this.createId(kind.toLowerCase()),
      kind,
      name,
      layer: overrides.layer ?? 'objects',
      position: { ...position },
      rotation: overrides.rotation ?? { x: 0, y: 0, z: 0 },
      scale: overrides.scale ?? { x: 1, y: 1, z: 1 },
      properties: overrides.properties ?? {},
      createdAt: now,
      updatedAt: now
    };
    const entityWithAsset: GameEntity =
      overrides.assetId !== undefined ? { ...entityBase, assetId: overrides.assetId } : entityBase;
    const entity: GameEntity =
      overrides.character !== undefined ? { ...entityWithAsset, character: overrides.character } : entityWithAsset;

    return [...entities, entity];
  }

  updateEntity(
    entities: GameEntity[],
    entityId: string,
    patch: Partial<Pick<GameEntity, 'name' | 'position' | 'rotation' | 'scale' | 'layer' | 'properties' | 'assetId' | 'character'>>
  ): GameEntity[] {
    return entities.map((entity) => {
      if (entity.id !== entityId) {
        return entity;
      }

      return {
        ...(patch.assetId !== undefined ? { ...entity, assetId: patch.assetId } : entity),
        ...(patch.character !== undefined ? { character: patch.character } : {}),
        name: patch.name ?? entity.name,
        layer: patch.layer ?? entity.layer,
        position: patch.position ? { ...patch.position } : { ...entity.position },
        rotation: patch.rotation ? { ...patch.rotation } : { ...entity.rotation },
        scale: patch.scale ? { ...patch.scale } : { ...entity.scale },
        properties: patch.properties ?? entity.properties ?? {},
        updatedAt: new Date().toISOString()
      };
    });
  }

  deleteEntity(entities: GameEntity[], entityId: string): GameEntity[] {
    return entities.filter((entity) => entity.id !== entityId);
  }

  duplicateEntity(entities: GameEntity[], entityId: string): GameEntity[] {
    const original = entities.find((entity) => entity.id === entityId);
    if (!original) {
      return entities;
    }

    return this.createEntity(entities, original.kind, `${original.name} Copy`, {
      x: original.position.x + 1,
      y: original.position.y,
      z: original.position.z + 1
    }, {
      layer: original.layer,
      rotation: { ...original.rotation },
      scale: { ...original.scale },
      properties: { ...(original.properties ?? {}) },
      ...(original.character !== undefined ? { character: structuredClone(original.character) } : {}),
      ...(original.assetId !== undefined ? { assetId: original.assetId } : {})
    });
  }
}

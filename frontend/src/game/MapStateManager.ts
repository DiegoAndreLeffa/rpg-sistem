import type { GameMapState } from './types';

export class MapStateManager {
  updateMap(currentMap: GameMapState, patch: Partial<GameMapState>): GameMapState {
    return {
      ...currentMap,
      ...patch
    };
  }
}


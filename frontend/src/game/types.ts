export type EntityKind =
  | 'PLAYER'
  | 'ENEMY'
  | 'NPC'
  | 'OBJECT'
  | 'BUILDING'
  | 'DOOR'
  | 'LIGHT'
  | 'AUDIO_SOURCE';

export type EntityLayer =
  | 'terrain'
  | 'buildings'
  | 'objects'
  | 'players'
  | 'enemies'
  | 'npcs'
  | 'lighting'
  | 'audio'
  | 'gm';

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export type CharacterVisibility = 'public' | 'owner' | 'gm';

export interface CharacterData {
  name: string;
  archetype?: string;
  level: number;
  metadata?: Record<string, unknown>;
}

export interface CharacterHealth {
  current: number;
  max: number;
}

export interface CharacterState {
  ownerUserId: string;
  visibility: CharacterVisibility;
  data: CharacterData;
  hp: CharacterHealth;
  status: string[];
}

export interface GameEntity {
  id: string;
  kind: EntityKind;
  name: string;
  layer: EntityLayer;
  assetId?: string | null;
  character?: CharacterState;
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
  properties?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export type AssetFormat = 'GLB' | 'GLTF' | 'OBJ' | 'UNKNOWN';

export interface GameAsset {
  id: string;
  campaignId?: string;
  uploadedByUserId?: string;
  name: string;
  provider: 'cloudinary';
  publicId: string;
  format: AssetFormat;
  mimeType: string;
  size: number;
  sourceUrl: string;
  texturePublicId?: string | null;
  textureSourceUrl?: string | null;
  textureMimeType?: string | null;
  mtlPublicId?: string | null;
  mtlSourceUrl?: string | null;
  entityIds: string[];
  retainWithoutEntity?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlayerState {
  userId: string;
  entityId?: string;
  role: 'MASTER' | 'PLAYER' | 'SPECTATOR';
  connected: boolean;
}

export interface LightState {
  entityId: string;
  intensity: number;
  color: string;
  range: number;
}

export interface VisionState {
  fogEnabled: boolean;
  revealMode: 'global' | 'per-player';
}

export interface AudioState {
  musicTrackUrl?: string;
  ambientTrackUrl?: string;
  masterVolume: number;
}

export interface DiceState {
  history: Array<{
    id: string;
    userId: string;
    expression: string;
    result: number;
    createdAt: string;
  }>;
}

export interface CombatState {
  active: boolean;
  round: number;
  turnEntityId?: string;
}

export interface GameMapState {
  id: string;
  name: string;
  width: number;
  height: number;
  terrainTextureUrl?: string | null;
}

export interface GameState {
  campaignId: string;
  map: GameMapState;
  assets: GameAsset[];
  entities: GameEntity[];
  players: PlayerState[];
  lights: LightState[];
  vision: VisionState;
  audio: AudioState;
  dice: DiceState;
  combat: CombatState;
  settings: Record<string, unknown>;
}

export function createDefaultGameState(initialState?: Partial<GameState>): GameState {
  return {
    campaignId: initialState?.campaignId ?? 'campaign-demo',
    map: initialState?.map ?? {
      id: 'map-demo',
      name: 'Sala de Jogo',
      width: 20,
      height: 20,
      terrainTextureUrl: null
    },
    assets: initialState?.assets ?? [],
    entities: initialState?.entities ?? [],
    players: initialState?.players ?? [],
    lights: initialState?.lights ?? [],
    vision: initialState?.vision ?? {
      fogEnabled: false,
      revealMode: 'global'
    },
    audio: initialState?.audio ?? {
      masterVolume: 1
    },
    dice: initialState?.dice ?? {
      history: []
    },
    combat: initialState?.combat ?? {
      active: false,
      round: 1
    },
    settings: initialState?.settings ?? {}
  };
}

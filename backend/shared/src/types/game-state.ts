import { EntityKind } from '../enums/entity-kind';

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

export interface MapState {
  id: string;
  name: string;
  width: number;
  height: number;
  terrainTextureUrl?: string | null;
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

export interface GameState {
  campaignId: string;
  map: MapState;
  entities: GameEntity[];
  players: PlayerState[];
  lights: LightState[];
  vision: VisionState;
  audio: AudioState;
  dice: DiceState;
  combat: CombatState;
  settings: Record<string, unknown>;
}

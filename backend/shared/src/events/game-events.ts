export const GameEvents = {
  PlayerJoined: 'PLAYER_JOINED',
  PlayerLeft: 'PLAYER_LEFT',
  PresenceSync: 'PRESENCE_SYNC',
  StateSync: 'STATE_SYNC',
  EntityCreated: 'ENTITY_CREATED',
  EntityUpdated: 'ENTITY_UPDATED',
  EntityDeleted: 'ENTITY_DELETED',
  MapUpdated: 'MAP_UPDATED',
  HpChanged: 'HP_CHANGED',
  StatusChanged: 'STATUS_CHANGED',
  DiceRolled: 'DICE_ROLLED',
  AudioPlay: 'AUDIO_PLAY',
  AudioStop: 'AUDIO_STOP'
} as const;

export type GameEventName = (typeof GameEvents)[keyof typeof GameEvents];

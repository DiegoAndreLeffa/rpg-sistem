import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { isValidObjectId, type Model } from 'mongoose';
import type {
  CharacterData,
  CharacterState,
  CharacterVisibility,
  EntityKind,
  GameEntity,
  GameState,
  PlayerState,
  Vector3
} from '@rpg/shared';
import { EntityKind as SharedEntityKind } from '@rpg/shared';
import { AssetsService } from '../assets/assets.service';
import { CampaignAccessService, type CampaignRole } from '../common/campaign-access/campaign-access.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import type { ApplyCharacterStatusDto } from './dto/apply-character-status.dto';
import type { CreateCampaignDto } from './dto/create-campaign.dto';
import type { CharacterPayloadDto, CreateCharacterDto } from './dto/create-character.dto';
import type { SaveCampaignStateDto } from './dto/save-campaign-state.dto';
import type { UpdateCampaignDto } from './dto/update-campaign.dto';
import type { UpdateCharacterHpDto } from './dto/update-character-hp.dto';
import type { UpdateCharacterModelDto } from './dto/update-character-model.dto';
import { Campaign } from './schemas/campaign.schema';
import type { CampaignDocument } from './schemas/campaign.schema';

type CharacterKind = EntityKind.Player | EntityKind.Enemy | EntityKind.Npc;
type CharacterLayer = 'players' | 'enemies' | 'npcs';
type UploadedCharacterFiles = {
  model?: Express.Multer.File[];
  texture?: Express.Multer.File[];
  mtl?: Express.Multer.File[];
};

const CHARACTER_LAYER_BY_KIND: Record<CharacterKind, CharacterLayer> = {
  [SharedEntityKind.Player]: 'players',
  [SharedEntityKind.Enemy]: 'enemies',
  [SharedEntityKind.Npc]: 'npcs'
};

@Injectable()
export class CampaignsService {
  constructor(
    @InjectModel(Campaign.name)
    private readonly campaignModel: Model<CampaignDocument>,
    @Inject(AssetsService)
    private readonly assetsService: AssetsService,
    @Inject(CampaignAccessService)
    private readonly campaignAccess: CampaignAccessService,
    @Inject(RealtimeGateway)
    private readonly realtimeGateway: RealtimeGateway
  ) {}

  async create(ownerId: string, dto: CreateCampaignDto) {
    const campaign = new this.campaignModel({
      name: dto.name,
      ownerId,
      settings: dto.settings ?? {},
      playerIds: []
    });

    const savedCampaign = await campaign.save();
    savedCampaign.gameState = {
      ...savedCampaign.gameState,
      campaignId: savedCampaign.id
    };
    return savedCampaign.save();
  }

  findAllByOwner(ownerId: string) {
    return this.campaignModel.find({ ownerId }).sort({ createdAt: -1 }).exec();
  }

  async findOneForOwner(ownerId: string, campaignId: string) {
    const campaign = await this.campaignModel.findById(campaignId).exec();

    if (!campaign) {
      throw new NotFoundException('Campaign not found.');
    }

    this.assertOwner(ownerId, campaign.ownerId);
    return campaign;
  }

  async update(ownerId: string, campaignId: string, dto: UpdateCampaignDto) {
    const campaign = await this.findOneForOwner(ownerId, campaignId);

    if (dto.name !== undefined) {
      campaign.name = dto.name;
    }

    if (dto.settings !== undefined) {
      campaign.settings = dto.settings;
    }

    return campaign.save();
  }

  async remove(ownerId: string, campaignId: string) {
    const campaign = await this.findOneForOwner(ownerId, campaignId);
    await campaign.deleteOne();

    return { deleted: true };
  }

  async getState(campaignId: string, userId: string): Promise<GameState> {
    const campaign = await this.findOrCreateStateCampaign(campaignId);

    if (!campaign) {
      throw new NotFoundException('Campaign not found.');
    }

    const role = await this.campaignAccess.requireAccess(campaignId, userId);
    return this.filterStateForRole(this.normalizeState(campaign.gameState, campaignId), role, userId);
  }

  setMember(campaignId: string, actorId: string, userId: string, role: Exclude<CampaignRole, 'MASTER'>) {
    return this.campaignAccess.setMember(campaignId, actorId, userId, role);
  }

  removeMember(campaignId: string, actorId: string, userId: string) {
    return this.campaignAccess.removeMember(campaignId, actorId, userId);
  }

  async saveState(campaignId: string, userId: string, dto: SaveCampaignStateDto): Promise<GameState> {
    await this.campaignAccess.requireMaster(campaignId, userId);
    const campaign = await this.findOrCreateStateCampaign(campaignId);

    if (!campaign) {
      throw new NotFoundException('Campaign not found.');
    }

    const state = dto.state;
    const normalizedState = this.normalizeState({
      ...state,
      campaignId
    } as GameState, campaignId);
    return this.persistGameState(campaignId, campaign, normalizedState);
  }

  async listCharacters(campaignId: string, userId: string) {
    const campaign = await this.findOrCreateStateCampaign(campaignId);
    if (!campaign) {
      throw new NotFoundException('Campaign not found.');
    }

    const role = await this.campaignAccess.requireAccess(campaignId, userId);
    const state = this.filterStateForRole(this.normalizeState(campaign.gameState, campaignId), role, userId);
    return state.entities.filter(
      (entity) => this.isCharacterKind(entity.kind) && entity.character
    );
  }

  async createCharacter(campaignId: string, userId: string, dto: CreateCharacterDto) {
    const campaign = await this.findOrCreateStateCampaign(campaignId);
    if (!campaign) {
      throw new NotFoundException('Campaign not found.');
    }

    const role = await this.campaignAccess.requireAccess(campaignId, userId);
    this.validateCreateCharacterInput(dto);
    if (role !== 'MASTER' && (role !== 'PLAYER' || dto.payload.ownerUserId !== userId || dto.payload.kind === SharedEntityKind.Enemy || dto.payload.kind === SharedEntityKind.Npc)) {
      throw new ForbiddenException('Players may only create their own player character.');
    }
    await this.validateAssetOwnership(campaignId, dto.assetId);

    const state = this.normalizeState(campaign.gameState, campaignId);
    const kind = this.toCharacterKind(dto.payload.kind ?? SharedEntityKind.Player);
    const maxHp = dto.payload.maxHp;
    const currentHp = dto.payload.currentHp ?? maxHp;
    if (currentHp > maxHp) {
      throw new BadRequestException('currentHp não pode ser maior que maxHp.');
    }

    const characterDataBase: CharacterData = {
      name: dto.payload.name,
      level: dto.payload.level
    };
    const characterData: CharacterData = {
      ...characterDataBase,
      ...(dto.payload.archetype ? { archetype: dto.payload.archetype } : {}),
      ...(dto.payload.metadata ? { metadata: dto.payload.metadata } : {})
    };

    const character: CharacterState = {
      ownerUserId: dto.payload.ownerUserId,
      visibility: dto.payload.visibility ?? this.defaultVisibilityForKind(kind),
      data: characterData,
      hp: {
        current: currentHp,
        max: maxHp
      },
      status: Array.from(new Set((dto.payload.status ?? []).map((value) => value.trim().toLowerCase())))
    };

    const now = new Date().toISOString();
    const entity: GameEntity = {
      id: this.createEntityId('character'),
      kind,
      name: dto.payload.name,
      layer: CHARACTER_LAYER_BY_KIND[kind],
      assetId: dto.assetId,
      character,
      position: this.normalizeVector(dto.payload.position),
      rotation: this.normalizeVector(dto.payload.rotation),
      scale: this.normalizeScale(dto.payload.scale),
      properties: {
        source: 'payload'
      },
      createdAt: now,
      updatedAt: now
    };

    const nextPlayers = this.upsertPlayerState(state.players, kind, dto.payload.ownerUserId, entity.id);
    const nextState: GameState = {
      ...state,
      campaignId,
      entities: [...state.entities, entity],
      players: nextPlayers
    };

    const persistedState = await this.persistGameState(campaignId, campaign, nextState);
    return {
      character: entity,
      state: persistedState
    };
  }

  async createCharacterFromUpload(
    campaignId: string,
    userId: string,
    body: { payload?: string; uploadedByUserId?: string; retainWithoutEntity?: string },
    files: UploadedCharacterFiles
  ) {
    if (!body.payload) {
      throw new BadRequestException('payload é obrigatório.');
    }

    let parsedPayload: CharacterPayloadDto;
    try {
      parsedPayload = JSON.parse(body.payload) as CharacterPayloadDto;
    } catch {
      throw new BadRequestException('Payload JSON inválido.');
    }

    this.validateCharacterPayload(parsedPayload);

    const role = await this.campaignAccess.requireAccess(campaignId, userId);
    if (role !== 'MASTER' && (role !== 'PLAYER' || parsedPayload.ownerUserId !== userId || parsedPayload.kind === SharedEntityKind.Enemy || parsedPayload.kind === SharedEntityKind.Npc)) {
      throw new ForbiddenException('Players may only upload their own player character.');
    }
    const uploadedByUserId = role === 'MASTER' ? body.uploadedByUserId?.trim() || parsedPayload.ownerUserId : userId;
    const retainWithoutEntity = body.retainWithoutEntity === 'true';
    const createdAsset = await this.assetsService.createFromFiles({
      campaignId,
      uploadedByUserId,
      retainWithoutEntity,
      model: files.model?.[0],
      texture: files.texture?.[0],
      mtl: files.mtl?.[0]
    });

    try {
      const created = await this.createCharacter(campaignId, userId, {
        assetId: createdAsset.id,
        payload: parsedPayload
      });

      return {
        ...created,
        asset: createdAsset
      };
    } catch (error) {
      await this.assetsService.remove(createdAsset.id);
      throw error;
    }
  }

  async updateCharacterModel(campaignId: string, userId: string, characterId: string, dto: UpdateCharacterModelDto) {
    const campaign = await this.findOrCreateStateCampaign(campaignId);
    if (!campaign) {
      throw new NotFoundException('Campaign not found.');
    }

    await this.validateAssetOwnership(campaignId, dto.assetId);

    const state = this.normalizeState(campaign.gameState, campaignId);
    const targetEntity = this.findCharacterEntity(state.entities, characterId);
    const role = await this.campaignAccess.requireAccess(campaignId, userId);
    if (role !== 'MASTER' && (role !== 'PLAYER' || targetEntity.character?.ownerUserId !== userId)) {
      throw new ForbiddenException('You may only update your own character model.');
    }
    const nextState: GameState = {
      ...state,
      entities: state.entities.map((entity) =>
        entity.id === targetEntity.id
          ? {
              ...entity,
              assetId: dto.assetId,
              updatedAt: new Date().toISOString()
            }
          : entity
      )
    };

    const persistedState = await this.persistGameState(campaignId, campaign, nextState);
    const updatedCharacter = persistedState.entities.find((entity) => entity.id === characterId);
    return {
      character: updatedCharacter,
      state: persistedState
    };
  }

  async updateCharacterHp(campaignId: string, userId: string, characterId: string, dto: UpdateCharacterHpDto) {
    await this.campaignAccess.requireMaster(campaignId, userId);
    const campaign = await this.findOrCreateStateCampaign(campaignId);
    if (!campaign) {
      throw new NotFoundException('Campaign not found.');
    }

    const state = this.normalizeState(campaign.gameState, campaignId);
    const targetEntity = this.findCharacterEntity(state.entities, characterId);
    const targetCharacter = targetEntity.character;
    if (!targetCharacter) {
      throw new BadRequestException('Entidade informada não possui dados de personagem.');
    }

    const maxHp = dto.maxHp ?? targetCharacter.hp.max;
    if (dto.currentHp > maxHp) {
      throw new BadRequestException('currentHp não pode ser maior que maxHp.');
    }

    const nextState: GameState = {
      ...state,
      entities: state.entities.map((entity) =>
        entity.id === targetEntity.id
          ? {
              ...entity,
              character: {
                ...targetCharacter,
                hp: {
                  current: dto.currentHp,
                  max: maxHp
                }
              },
              updatedAt: new Date().toISOString()
            }
          : entity
      )
    };

    const persistedState = await this.persistGameState(campaignId, campaign, nextState);
    const updatedCharacter = persistedState.entities.find((entity) => entity.id === characterId);
    return {
      character: updatedCharacter,
      state: persistedState
    };
  }

  async applyCharacterStatus(campaignId: string, userId: string, characterId: string, dto: ApplyCharacterStatusDto) {
    await this.campaignAccess.requireMaster(campaignId, userId);
    const campaign = await this.findOrCreateStateCampaign(campaignId);
    if (!campaign) {
      throw new NotFoundException('Campaign not found.');
    }

    const status = dto.status.trim().toLowerCase();
    if (!status) {
      throw new BadRequestException('Status inválido.');
    }

    const state = this.normalizeState(campaign.gameState, campaignId);
    const targetEntity = this.findCharacterEntity(state.entities, characterId);
    const targetCharacter = targetEntity.character;
    if (!targetCharacter) {
      throw new BadRequestException('Entidade informada não possui dados de personagem.');
    }

    const nextStatus = Array.from(new Set([...targetCharacter.status, status]));
    const nextState: GameState = {
      ...state,
      entities: state.entities.map((entity) =>
        entity.id === targetEntity.id
          ? {
              ...entity,
              character: {
                ...targetCharacter,
                status: nextStatus
              },
              updatedAt: new Date().toISOString()
            }
          : entity
      )
    };

    const persistedState = await this.persistGameState(campaignId, campaign, nextState);
    const updatedCharacter = persistedState.entities.find((entity) => entity.id === characterId);
    return {
      character: updatedCharacter,
      state: persistedState
    };
  }

  private async findOrCreateStateCampaign(campaignId: string): Promise<CampaignDocument | null> {
    const existing =
      campaignId === 'campaign-demo'
        ? await this.campaignModel.findOne({ ownerId: 'system', name: 'Campanha Demo' }).exec()
        : await this.campaignModel.findById(campaignId).exec();
    if (existing) {
      return existing;
    }

    if (campaignId !== 'campaign-demo') {
      return null;
    }

    const created = new this.campaignModel({
      name: 'Campanha Demo',
      ownerId: 'system',
      settings: { mode: 'editor', layer: 'objects' },
      playerIds: []
    });
    return created.save();
  }

  private assertOwner(ownerId: string, actualOwnerId: string): void {
    if (ownerId !== actualOwnerId) {
      throw new ForbiddenException('Access denied.');
    }
  }

  private isCharacterKind(kind: GameEntity['kind']): kind is CharacterKind {
    return kind === SharedEntityKind.Player || kind === SharedEntityKind.Enemy || kind === SharedEntityKind.Npc;
  }

  private createEntityId(prefix: string): string {
    return `${prefix}-${randomUUID()}`;
  }

  private normalizeVector(value: { x: number; y: number; z: number } | undefined): Vector3 {
    return value ?? { x: 0, y: 0, z: 0 };
  }

  private normalizeScale(value: { x: number; y: number; z: number } | undefined): Vector3 {
    return value ?? { x: 1, y: 1, z: 1 };
  }

  private defaultVisibilityForKind(kind: CharacterKind): CharacterVisibility {
    return kind === SharedEntityKind.Player ? 'owner' : 'public';
  }

  private upsertPlayerState(
    players: PlayerState[],
    kind: CharacterKind,
    ownerUserId: string,
    entityId: string
  ): PlayerState[] {
    if (kind !== SharedEntityKind.Player) {
      return players;
    }

    const existing = players.find((player) => player.userId === ownerUserId);
    if (!existing) {
      return [
        ...players,
        {
          userId: ownerUserId,
          entityId,
          role: 'PLAYER',
          connected: false
        }
      ];
    }

    return players.map((player) =>
      player.userId === ownerUserId
        ? {
            ...player,
            entityId
          }
        : player
    );
  }

  private toCharacterKind(kind: string): CharacterKind {
    if (kind === SharedEntityKind.Player || kind === SharedEntityKind.Enemy || kind === SharedEntityKind.Npc) {
      return kind;
    }

    throw new BadRequestException('Tipo de personagem inválido.');
  }

  private findCharacterEntity(entities: GameEntity[], characterId: string): GameEntity {
    const entity = entities.find((item) => item.id === characterId);

    if (!entity) {
      throw new NotFoundException('Character not found.');
    }

    if (!this.isCharacterKind(entity.kind)) {
      throw new BadRequestException('A entidade informada não é um personagem, inimigo ou NPC.');
    }

    return entity;
  }

  private async validateAssetOwnership(campaignId: string, assetId: string): Promise<void> {
    const asset = await this.assetsService.findById(assetId);
    if (asset.campaignId !== campaignId) {
      throw new BadRequestException('Asset não pertence à campanha informada.');
    }
  }

  private validateCreateCharacterInput(dto: CreateCharacterDto): void {
    this.validateAssetId(dto.assetId);
    this.validateCharacterPayload(dto.payload);
  }

  private validateAssetId(assetId: string): void {
    if (!assetId || assetId.trim().length < 2) {
      throw new BadRequestException('assetId é obrigatório.');
    }

    if (!isValidObjectId(assetId)) {
      throw new BadRequestException('assetId inválido.');
    }
  }

  private validateCharacterPayload(payload: CharacterPayloadDto | undefined): void {
    if (!payload) {
      throw new BadRequestException('payload é obrigatório.');
    }

    if (!payload.name || payload.name.trim().length < 2) {
      throw new BadRequestException('Nome do personagem precisa ter ao menos 2 caracteres.');
    }

    if (!payload.ownerUserId || payload.ownerUserId.trim().length < 2) {
      throw new BadRequestException('ownerUserId precisa ter ao menos 2 caracteres.');
    }

    if (!Number.isInteger(payload.level) || payload.level < 1) {
      throw new BadRequestException('level deve ser um inteiro maior ou igual a 1.');
    }

    if (!Number.isInteger(payload.maxHp) || payload.maxHp < 1) {
      throw new BadRequestException('maxHp deve ser um inteiro maior ou igual a 1.');
    }

    if (payload.currentHp !== undefined && (!Number.isInteger(payload.currentHp) || payload.currentHp < 0)) {
      throw new BadRequestException('currentHp deve ser um inteiro maior ou igual a 0.');
    }

    if (
      payload.kind !== undefined &&
      payload.kind !== SharedEntityKind.Player &&
      payload.kind !== SharedEntityKind.Enemy &&
      payload.kind !== SharedEntityKind.Npc
    ) {
      throw new BadRequestException('kind de personagem inválido.');
    }

    if (payload.visibility !== undefined && payload.visibility !== 'public' && payload.visibility !== 'owner' && payload.visibility !== 'gm') {
      throw new BadRequestException('visibility inválida.');
    }

    if (payload.status !== undefined) {
      if (!Array.isArray(payload.status)) {
        throw new BadRequestException('status deve ser uma lista de textos.');
      }

      for (const statusValue of payload.status) {
        if (typeof statusValue !== 'string') {
          throw new BadRequestException('Cada status deve ser texto.');
        }

        const normalized = statusValue.trim();
        if (normalized.length < 2 || normalized.length > 40) {
          throw new BadRequestException('Cada status deve ter entre 2 e 40 caracteres.');
        }
      }
    }
  }

  private buildAssetReferencesFromState(state: GameState): Record<string, string[]> {
    const referencesByAssetId: Record<string, string[]> = {};

    for (const entity of state.entities) {
      const assetId = entity.assetId;
      if (!assetId) {
        continue;
      }

      const references = referencesByAssetId[assetId] ?? [];
      references.push(entity.id);
      referencesByAssetId[assetId] = references;
    }

    return referencesByAssetId;
  }

  private async persistGameState(
    campaignId: string,
    campaign: CampaignDocument,
    nextState: GameState
  ): Promise<GameState> {
    campaign.gameState = nextState;
    await campaign.save();

    const referencesByAssetId = this.buildAssetReferencesFromState(nextState);
    await this.assetsService.syncEntityReferencesForCampaign(campaignId, referencesByAssetId);
    await this.realtimeGateway.broadcastGameStateUpdated(campaignId, campaign.gameState);

    return campaign.gameState;
  }

  private normalizeState(state: GameState | undefined, campaignId: string): GameState {
    const source = state as Partial<GameState> | undefined;
    return {
      campaignId,
      map: source?.map ?? {
        id: 'map-demo',
        name: 'Sala de Jogo',
        width: 20,
        height: 20,
        terrainTextureUrl: null
      },
      entities: source?.entities ?? [],
      players: source?.players ?? [],
      lights: source?.lights ?? [],
      vision: source?.vision ?? {
        fogEnabled: false,
        revealMode: 'global'
      },
      audio: source?.audio ?? {
        masterVolume: 1
      },
      dice: source?.dice ?? {
        history: []
      },
      combat: source?.combat ?? {
        active: false,
        round: 1
      },
      settings: source?.settings ?? {
        mode: 'editor',
        layer: 'objects'
      }
    };
  }

  private filterStateForRole(state: GameState, role: CampaignRole, userId: string): GameState {
    if (role === 'MASTER') return state;
    const entities = state.entities.filter((entity) =>
      entity.layer !== 'gm' && entity.character?.visibility !== 'gm' &&
      (entity.character?.visibility !== 'owner' || entity.character.ownerUserId === userId)
    );
    const visibleIds = new Set(entities.map((entity) => entity.id));
    return { ...state, entities, lights: state.lights.filter((light) => visibleIds.has(light.entityId)) };
  }
}

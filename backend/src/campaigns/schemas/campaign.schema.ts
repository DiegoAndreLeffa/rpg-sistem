import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument, Types } from 'mongoose';
import type { GameState } from '@rpg/shared';

function createDefaultGameState(): GameState {
  return {
    campaignId: 'campaign-demo',
    map: {
      id: 'map-demo',
      name: 'Sala de Jogo',
      width: 20,
      height: 20,
      terrainTextureUrl: null
    },
    entities: [],
    players: [],
    lights: [],
    vision: {
      fogEnabled: false,
      revealMode: 'global'
    },
    audio: {
      masterVolume: 1
    },
    dice: {
      history: []
    },
    combat: {
      active: false,
      round: 1
    },
    settings: {
      mode: 'editor',
      layer: 'objects'
    }
  };
}

@Schema({ timestamps: true, collection: 'campaigns' })
export class Campaign {
  @Prop({ type: String, required: true, trim: true })
  name!: string;

  @Prop({ type: String, required: true, index: true })
  ownerId!: string;

  @Prop({ type: [String], default: [] })
  playerIds!: string[];

  @Prop({ type: [{ userId: { type: String, required: true }, role: { type: String, enum: ['PLAYER', 'SPECTATOR'], required: true } }], default: [] })
  members!: Array<{ userId: string; role: 'PLAYER' | 'SPECTATOR' }>;

  @Prop({ type: Object, default: {} })
  settings!: Record<string, unknown>;

  @Prop({ type: Object, required: true, default: createDefaultGameState })
  gameState!: GameState;
}

export type CampaignDocument = HydratedDocument<Campaign>;

export const CampaignSchema = SchemaFactory.createForClass(Campaign);
CampaignSchema.index({ ownerId: 1, name: 1 }, { unique: true });
CampaignSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_doc, ret: { _id?: Types.ObjectId; __v?: number; id?: string }) {
    const id = ret._id?.toString();

    if (id) {
      ret.id = id;
    }

    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

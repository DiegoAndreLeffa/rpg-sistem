import { IsObject } from 'class-validator';
import type { GameState } from '@rpg/shared';

export class SaveCampaignStateDto {
  @IsObject()
  state!: GameState;
}


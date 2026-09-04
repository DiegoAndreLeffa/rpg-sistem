import { IsIn } from 'class-validator';
import type { CampaignRole } from '../../common/campaign-access/campaign-access.service';

export class SetCampaignMemberDto {
  @IsIn(['PLAYER', 'SPECTATOR'])
  role!: Exclude<CampaignRole, 'MASTER'>;
}

import { Module } from '@nestjs/common';
import { CampaignAccessModule } from '../common/campaign-access/campaign-access.module';
import { RealtimeGateway } from './realtime.gateway';

@Module({
  imports: [CampaignAccessModule],
  providers: [RealtimeGateway],
  exports: [RealtimeGateway]
})
export class RealtimeModule {}


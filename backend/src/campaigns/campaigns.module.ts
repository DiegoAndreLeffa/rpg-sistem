import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssetsModule } from '../assets/assets.module';
import { CampaignAccessModule } from '../common/campaign-access/campaign-access.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { Campaign, CampaignSchema } from './schemas/campaign.schema';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Campaign.name, schema: CampaignSchema }]), AssetsModule, RealtimeModule, CampaignAccessModule],
  controllers: [CampaignsController],
  providers: [CampaignsService]
})
export class CampaignsModule {}

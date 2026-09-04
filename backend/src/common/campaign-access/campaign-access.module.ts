import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Campaign, CampaignSchema } from '../../campaigns/schemas/campaign.schema';
import { CampaignAccessService } from './campaign-access.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Campaign.name, schema: CampaignSchema }])],
  providers: [CampaignAccessService],
  exports: [CampaignAccessService]
})
export class CampaignAccessModule {}

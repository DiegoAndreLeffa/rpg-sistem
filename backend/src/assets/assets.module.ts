import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Asset, AssetSchema } from './schemas/asset.schema';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';
import { CampaignAccessModule } from '../common/campaign-access/campaign-access.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Asset.name, schema: AssetSchema }]), CampaignAccessModule],
  controllers: [AssetsController],
  providers: [AssetsService],
  exports: [AssetsService]
})
export class AssetsModule {}

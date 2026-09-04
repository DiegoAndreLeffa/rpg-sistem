import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, type Model } from 'mongoose';
import { Campaign, type CampaignDocument } from '../../campaigns/schemas/campaign.schema';

export type CampaignRole = 'MASTER' | 'PLAYER' | 'SPECTATOR';

@Injectable()
export class CampaignAccessService {
  constructor(@InjectModel(Campaign.name) private readonly campaignModel: Model<CampaignDocument>) {}

  async getCampaign(campaignId: string): Promise<CampaignDocument> {
    let campaign =
      campaignId === 'campaign-demo'
        ? await this.campaignModel.findOne({ ownerId: 'system', name: 'Campanha Demo' }).exec()
        : isValidObjectId(campaignId)
          ? await this.campaignModel.findById(campaignId).exec()
          : null;
    if (!campaign && campaignId === 'campaign-demo') {
      campaign = await new this.campaignModel({
        name: 'Campanha Demo',
        ownerId: 'system',
        settings: { mode: 'editor', layer: 'objects' },
        playerIds: [],
        members: []
      }).save();
    }
    if (!campaign) throw new NotFoundException('Campaign not found.');
    return campaign;
  }

  async roleFor(campaignId: string, userId: string): Promise<CampaignRole | null> {
    const campaign = await this.getCampaign(campaignId);
    if (campaign.ownerId === userId) return 'MASTER';
    const member = campaign.members?.find((item) => item.userId === userId);
    if (member) return member.role;
    // Compatibility with campaigns created before campaign roles existed.
    return campaign.playerIds.includes(userId) ? 'PLAYER' : null;
  }

  async requireAccess(campaignId: string, userId: string): Promise<CampaignRole> {
    const role = await this.roleFor(campaignId, userId);
    if (!role) throw new ForbiddenException('You do not have access to this campaign.');
    return role;
  }

  async requireMaster(campaignId: string, userId: string): Promise<void> {
    if ((await this.requireAccess(campaignId, userId)) !== 'MASTER') {
      throw new ForbiddenException('Only the campaign master can perform this action.');
    }
  }

  async setMember(campaignId: string, actorId: string, userId: string, role: Exclude<CampaignRole, 'MASTER'>): Promise<CampaignDocument> {
    await this.requireMaster(campaignId, actorId);
    const campaign = await this.getCampaign(campaignId);
    if (campaign.ownerId === userId) throw new ForbiddenException('The campaign owner is always MASTER.');
    const members = campaign.members ?? [];
    const existing = members.find((item) => item.userId === userId);
    campaign.members = existing
      ? members.map((item) => (item.userId === userId ? { ...item, role } : item))
      : [...members, { userId, role }];
    campaign.playerIds = Array.from(new Set(campaign.members.filter((item) => item.role === 'PLAYER').map((item) => item.userId)));
    return campaign.save();
  }

  async removeMember(campaignId: string, actorId: string, userId: string): Promise<CampaignDocument> {
    await this.requireMaster(campaignId, actorId);
    const campaign = await this.getCampaign(campaignId);
    if (campaign.ownerId === userId) throw new ForbiddenException('The campaign owner cannot be removed.');
    campaign.members = (campaign.members ?? []).filter((item) => item.userId !== userId);
    campaign.playerIds = campaign.playerIds.filter((id) => id !== userId);
    return campaign.save();
  }
}

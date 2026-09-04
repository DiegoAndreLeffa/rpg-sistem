import { BadRequestException, Inject, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import { isValidObjectId, type Model } from 'mongoose';
import {
  DEFAULT_ACCOUNT_QUOTA_BYTES,
  DEFAULT_CAMPAIGN_QUOTA_BYTES,
  DEFAULT_USER_QUOTA_BYTES,
  MAX_MODEL_SIZE_BYTES,
  MODEL_FILE_TOO_LARGE_MESSAGE,
  OBJ_MTL_REQUIRED_MESSAGE
} from './assets.constants';
import type { AssetDocument } from './schemas/asset.schema';
import { Asset } from './schemas/asset.schema';

type UploadedFile = Express.Multer.File;
type UploadResourceType = 'raw' | 'image';

type AssetUploadFiles = {
  campaignId: string | undefined;
  uploadedByUserId: string | undefined;
  retainWithoutEntity: boolean | undefined;
  model: UploadedFile | undefined;
  texture: UploadedFile | undefined;
  mtl: UploadedFile | undefined;
};

const ALLOWED_MODEL_EXTENSIONS = new Set(['.glb', '.gltf', '.obj']);
const ALLOWED_TEXTURE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp']);
const ALLOWED_MTL_EXTENSIONS = new Set(['.mtl']);
const DEFAULT_FOLDER = 'rpg-sistem/assets';
const DEFAULT_CAMPAIGN_ID = 'campaign-demo';
const DEFAULT_UPLOADER_ID = 'anonymous';

function getFileExtension(filename: string): string {
  const dotIndex = filename.lastIndexOf('.');
  return dotIndex >= 0 ? filename.slice(dotIndex).toLowerCase() : '';
}

function inferFormat(extension: string): 'GLB' | 'GLTF' | 'OBJ' | 'UNKNOWN' {
  if (extension === '.glb') return 'GLB';
  if (extension === '.gltf') return 'GLTF';
  if (extension === '.obj') return 'OBJ';
  return 'UNKNOWN';
}

function isCloudinaryReady(configService: ConfigService): boolean {
  return Boolean(
    configService.get<string>('CLOUDINARY_URL') ||
      (configService.get<string>('CLOUDINARY_CLOUD_NAME') &&
        configService.get<string>('CLOUDINARY_API_KEY') &&
        configService.get<string>('CLOUDINARY_API_SECRET'))
  );
}

@Injectable()
export class AssetsService {
  constructor(
    @InjectModel(Asset.name)
    private readonly assetModel: Model<AssetDocument>,
    @Inject(ConfigService)
    private readonly configService: ConfigService
  ) {}

  private configureCloudinary(): void {
    if (!isCloudinaryReady(this.configService)) {
      throw new ServiceUnavailableException('Cloudinary is not configured.');
    }

    const cloudinaryUrl = this.configService.get<string>('CLOUDINARY_URL');

    if (cloudinaryUrl) {
      const cloudinaryUri = new URL(cloudinaryUrl);
      cloudinary.config({
        cloud_name: cloudinaryUri.hostname,
        api_key: cloudinaryUri.username,
        api_secret: cloudinaryUri.password,
        secure: true
      });
      return;
    }

    cloudinary.config({
      cloud_name: this.configService.getOrThrow<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.getOrThrow<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.getOrThrow<string>('CLOUDINARY_API_SECRET'),
      secure: true
    });
  }

  private getUploadFolder(): string {
    return this.configService.get<string>('CLOUDINARY_FOLDER')?.trim() || DEFAULT_FOLDER;
  }

  private getQuotaBytes(key: string, fallback: number): number {
    const rawValue = this.configService.get<string>(key);

    if (!rawValue) {
      return fallback;
    }

    const parsed = Number(rawValue);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  private validateNotEmpty(file: UploadedFile, label: string): void {
    if (!file.buffer || file.buffer.length === 0) {
      throw new BadRequestException(`${label} vazio.`);
    }
  }

  private validateSize(file: UploadedFile): void {
    if (file.size > MAX_MODEL_SIZE_BYTES) {
      throw new BadRequestException(MODEL_FILE_TOO_LARGE_MESSAGE);
    }
  }

  private async enforceQuota(campaignId: string, uploadedByUserId: string, incomingBytes: number): Promise<void> {
    const accountQuotaBytes = this.getQuotaBytes('ASSET_ACCOUNT_QUOTA_BYTES', DEFAULT_ACCOUNT_QUOTA_BYTES);
    const campaignQuotaBytes = this.getQuotaBytes('ASSET_CAMPAIGN_QUOTA_BYTES', DEFAULT_CAMPAIGN_QUOTA_BYTES);
    const userQuotaBytes = this.getQuotaBytes('ASSET_USER_QUOTA_BYTES', DEFAULT_USER_QUOTA_BYTES);

    const [accountUsageResult] = await this.assetModel.aggregate([{ $group: { _id: null, used: { $sum: '$size' } } }]).exec();
    const [campaignUsageResult] = await this.assetModel
      .aggregate([{ $match: { campaignId } }, { $group: { _id: null, used: { $sum: '$size' } } }])
      .exec();
    const [userUsageResult] = await this.assetModel
      .aggregate([
        { $match: { campaignId, uploadedByUserId } },
        { $group: { _id: null, used: { $sum: '$size' } } }
      ])
      .exec();

    const accountUsage = typeof accountUsageResult?.used === 'number' ? accountUsageResult.used : 0;
    const campaignUsage = typeof campaignUsageResult?.used === 'number' ? campaignUsageResult.used : 0;
    const userUsage = typeof userUsageResult?.used === 'number' ? userUsageResult.used : 0;

    if (accountUsage + incomingBytes > accountQuotaBytes) {
      throw new BadRequestException('Limite global de armazenamento da conta atingido.');
    }

    if (campaignUsage + incomingBytes > campaignQuotaBytes) {
      throw new BadRequestException('Limite de armazenamento da campanha atingido.');
    }

    if (userUsage + incomingBytes > userQuotaBytes) {
      throw new BadRequestException('Limite de armazenamento por usuário na campanha atingido.');
    }
  }

  private uploadToCloudinary(file: UploadedFile, resourceType: UploadResourceType): Promise<UploadApiResponse> {
    this.configureCloudinary();

    const folder = this.getUploadFolder();

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
          use_filename: true,
          unique_filename: true
        },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error('Cloudinary upload failed.'));
            return;
          }

          resolve(result);
        }
      );

      stream.end(file.buffer);
    });
  }

  async createFromFiles(files: AssetUploadFiles): Promise<AssetDocument> {
    const model = files.model;
    const campaignId = files.campaignId?.trim() || DEFAULT_CAMPAIGN_ID;
    const uploadedByUserId = files.uploadedByUserId?.trim() || DEFAULT_UPLOADER_ID;
    const retainWithoutEntity = files.retainWithoutEntity ?? false;

    if (!model) {
      throw new BadRequestException('Missing model file.');
    }

    this.validateSize(model);
    this.validateNotEmpty(model, 'Modelo');

    const modelExtension = getFileExtension(model.originalname);

    if (!ALLOWED_MODEL_EXTENSIONS.has(modelExtension)) {
      throw new BadRequestException('Invalid model format. Use GLB, GLTF, or OBJ.');
    }

    const texture = files.texture;
    if (texture) {
      this.validateSize(texture);
      this.validateNotEmpty(texture, 'Textura');

      const textureExtension = getFileExtension(texture.originalname);
      if (!ALLOWED_TEXTURE_EXTENSIONS.has(textureExtension)) {
        throw new BadRequestException('Invalid texture format. Use PNG, JPG, JPEG, or WEBP.');
      }
    }

    const mtl = files.mtl;
    if (mtl) {
      this.validateSize(mtl);
      this.validateNotEmpty(mtl, 'MTL');

      const mtlExtension = getFileExtension(mtl.originalname);
      if (!ALLOWED_MTL_EXTENSIONS.has(mtlExtension)) {
        throw new BadRequestException('Invalid MTL format. Use .mtl file.');
      }
    }

    if (modelExtension === '.obj' && !mtl) {
      throw new BadRequestException(OBJ_MTL_REQUIRED_MESSAGE);
    }

    const incomingBytes = model.size + (texture?.size ?? 0) + (mtl?.size ?? 0);
    await this.enforceQuota(campaignId, uploadedByUserId, incomingBytes);

    const modelUpload = await this.uploadToCloudinary(model, 'raw');
    const textureUpload = texture ? await this.uploadToCloudinary(texture, 'image') : undefined;
    const mtlUpload = mtl ? await this.uploadToCloudinary(mtl, 'raw') : undefined;

    const asset = new this.assetModel({
      campaignId,
      uploadedByUserId,
      retainWithoutEntity,
      name: model.originalname,
      provider: 'cloudinary',
      publicId: modelUpload.public_id,
      format: inferFormat(modelExtension),
      mimeType: model.mimetype,
      size: incomingBytes,
      sourceUrl: modelUpload.secure_url ?? modelUpload.url,
      texturePublicId: textureUpload?.public_id ?? null,
      textureSourceUrl: textureUpload?.secure_url ?? textureUpload?.url ?? null,
      textureMimeType: texture?.mimetype ?? null,
      mtlPublicId: mtlUpload?.public_id ?? null,
      mtlSourceUrl: mtlUpload?.secure_url ?? mtlUpload?.url ?? null,
      entityIds: []
    });

    return asset.save();
  }

  listAll(campaignId?: string) {
    const filter = campaignId ? { campaignId } : {};
    return this.assetModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  private async destroyCloudinaryAsset(publicId: string, resourceType: UploadResourceType): Promise<void> {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true
    });

    if (result.result !== 'ok' && result.result !== 'not found') {
      throw new BadRequestException('Cloudinary asset deletion failed.');
    }
  }

  async remove(assetId: string): Promise<{ deleted: true }> {
    if (!isValidObjectId(assetId)) {
      throw new BadRequestException('Invalid asset id.');
    }

    const asset = await this.assetModel.findById(assetId).exec();

    if (!asset) {
      throw new NotFoundException('Asset not found.');
    }

    this.configureCloudinary();

    await this.destroyCloudinaryAsset(asset.publicId, 'raw');

    if (asset.texturePublicId) {
      await this.destroyCloudinaryAsset(asset.texturePublicId, 'image');
    }

    if (asset.mtlPublicId) {
      await this.destroyCloudinaryAsset(asset.mtlPublicId, 'raw');
    }

    await asset.deleteOne();
    return { deleted: true };
  }

  async findById(assetId: string) {
    if (!isValidObjectId(assetId)) {
      throw new BadRequestException('Invalid asset id.');
    }

    const asset = await this.assetModel.findById(assetId).exec();

    if (!asset) {
      throw new NotFoundException('Asset not found.');
    }

    return asset;
  }

  async syncEntityReferencesForCampaign(campaignId: string, referencesByAssetId: Record<string, string[]>): Promise<void> {
    const assets = await this.assetModel.find({ campaignId }).exec();

    for (const asset of assets) {
      const nextEntityIds = referencesByAssetId[asset.id] ?? [];
      const normalizedNext = Array.from(new Set(nextEntityIds));
      const hadReferences = asset.entityIds.length > 0;
      const hasReferencesNow = normalizedNext.length > 0;

      asset.entityIds = normalizedNext;
      await asset.save();

      if (hadReferences && !hasReferencesNow && !asset.retainWithoutEntity) {
        await this.remove(asset.id);
      }
    }
  }
}

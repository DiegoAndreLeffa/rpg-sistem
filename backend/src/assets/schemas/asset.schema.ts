import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument, Types } from 'mongoose';

export type AssetFormat = 'GLB' | 'GLTF' | 'OBJ' | 'UNKNOWN';

@Schema({ timestamps: true, collection: 'assets' })
export class Asset {
  @Prop({ type: String, required: true, index: true })
  campaignId!: string;

  @Prop({ type: String, required: true, index: true })
  uploadedByUserId!: string;

  @Prop({ type: String, required: true, trim: true })
  name!: string;

  @Prop({ type: String, required: true, default: 'cloudinary' })
  provider!: 'cloudinary';

  @Prop({ type: String, required: true })
  publicId!: string;

  @Prop({ type: String, required: true })
  format!: AssetFormat;

  @Prop({ type: String, required: true })
  mimeType!: string;

  @Prop({ type: Number, required: true })
  size!: number;

  @Prop({ type: String, required: true })
  sourceUrl!: string;

  @Prop({ type: String, default: null })
  texturePublicId?: string | null;

  @Prop({ type: String, default: null })
  textureSourceUrl?: string | null;

  @Prop({ type: String, default: null })
  textureMimeType?: string | null;

  @Prop({ type: String, default: null })
  mtlPublicId?: string | null;

  @Prop({ type: String, default: null })
  mtlSourceUrl?: string | null;

  @Prop({ type: [String], default: [] })
  entityIds!: string[];

  @Prop({ type: Boolean, required: true, default: false })
  retainWithoutEntity!: boolean;
}

export type AssetDocument = HydratedDocument<Asset>;

export const AssetSchema = SchemaFactory.createForClass(Asset);
AssetSchema.index({ campaignId: 1, uploadedByUserId: 1 });
AssetSchema.set('toJSON', {
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

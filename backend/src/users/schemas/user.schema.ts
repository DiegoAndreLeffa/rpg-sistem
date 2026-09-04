import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument, Types } from 'mongoose';
import { UserRole } from '@rpg/shared';

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ type: String, required: true, trim: true })
  name!: string;

  @Prop({ type: String, required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ type: String, required: true, select: false })
  passwordHash!: string;

  @Prop({ type: String, required: true, enum: Object.values(UserRole), default: UserRole.Player })
  role!: UserRole;
}

export type UserDocument = HydratedDocument<User>;

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_doc, ret: { _id?: Types.ObjectId; __v?: number; passwordHash?: string; id?: string }) {
    const id = ret._id?.toString();

    if (id) {
      ret.id = id;
    }

    delete ret._id;
    delete ret.__v;
    delete ret.passwordHash;
    return ret;
  }
});

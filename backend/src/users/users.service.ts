import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import type { CreateUserDto } from './dto/create-user.dto';
import { User } from './schemas/user.schema';
import type { UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>
  ) {}

  async create(dto: CreateUserDto) {
    const user = new this.userModel(dto);
    return user.save();
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email: email.toLowerCase() }).select('+passwordHash').exec();
  }

  async findById(id: string) {
    return this.userModel.findById(id).select('+passwordHash').exec();
  }

  async findPublicById(id: string) {
    const user = await this.userModel.findById(id).exec();

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return user;
  }
}

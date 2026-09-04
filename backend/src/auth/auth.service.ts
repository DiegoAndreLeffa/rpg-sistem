import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '@rpg/shared';
import { UsersService } from '../users/users.service';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';
import type { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @Inject(UsersService) private readonly usersService: UsersService,
    @Inject(JwtService) private readonly jwtService: JwtService
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException('Email already registered.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      role: dto.role ?? UserRole.Player
    });

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const matches = await bcrypt.compare(dto.password, user.passwordHash);

    if (!matches) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    return this.buildAuthResponse(user);
  }

  async loginAsRole(dto: LoginDto, expectedRole: UserRole) {
    const auth = await this.login(dto);
    if (auth.user.role !== expectedRole) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    return auth;
  }

  logout(): { message: string } {
    return { message: 'Logged out.' };
  }

  getPublicUser(user: { id: string; email: string; name: string; role?: UserRole }) {
    const role = user.role ?? UserRole.Player;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role
    };
  }

  private buildAuthResponse(user: {
    id?: string;
    _id?: { toString(): string };
    email: string;
    name: string;
    role?: UserRole;
  }) {
    const id = user.id ?? user._id?.toString();

    if (!id) {
      throw new Error('User identifier missing.');
    }

    const role = user.role ?? UserRole.Player;
    const payload: JwtPayload = {
      sub: id,
      email: user.email,
      name: user.name,
      role
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: this.getPublicUser({ id, email: user.email, name: user.name, role })
    };
  }
}

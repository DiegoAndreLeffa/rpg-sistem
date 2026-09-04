import { IsEmail, IsString, MinLength } from 'class-validator';
import { IsEnum } from 'class-validator';
import { UserRole } from '@rpg/shared';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  passwordHash!: string;

  @IsEnum(UserRole)
  role!: UserRole;
}

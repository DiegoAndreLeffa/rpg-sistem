import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ArrayMaxSize,
  ArrayUnique,
  ValidateNested
} from 'class-validator';
import type { CharacterVisibility } from '@rpg/shared';

const CHARACTER_KINDS = ['PLAYER', 'ENEMY', 'NPC'] as const;
const CHARACTER_VISIBILITY = ['public', 'owner', 'gm'] as const;

class Vector3Dto {
  @IsNumber()
  x!: number;

  @IsNumber()
  y!: number;

  @IsNumber()
  z!: number;
}

export class CharacterPayloadDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsString()
  archetype?: string;

  @IsInt()
  @Min(1)
  level!: number;

  @IsInt()
  @Min(1)
  maxHp!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  currentHp?: number;

  @IsString()
  @MinLength(2)
  ownerUserId!: string;

  @IsOptional()
  @IsIn(CHARACTER_KINDS)
  kind?: (typeof CHARACTER_KINDS)[number];

  @IsOptional()
  @IsIn(CHARACTER_VISIBILITY)
  visibility?: CharacterVisibility;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MinLength(2, { each: true })
  @MaxLength(40, { each: true })
  status?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => Vector3Dto)
  position?: Vector3Dto;

  @IsOptional()
  @ValidateNested()
  @Type(() => Vector3Dto)
  rotation?: Vector3Dto;

  @IsOptional()
  @ValidateNested()
  @Type(() => Vector3Dto)
  scale?: Vector3Dto;
}

export class CreateCharacterDto {
  @IsString()
  @MinLength(2)
  assetId!: string;

  @ValidateNested()
  @Type(() => CharacterPayloadDto)
  payload!: CharacterPayloadDto;
}

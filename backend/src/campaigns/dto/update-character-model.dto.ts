import { IsString, MinLength } from 'class-validator';

export class UpdateCharacterModelDto {
  @IsString()
  @MinLength(2)
  assetId!: string;
}


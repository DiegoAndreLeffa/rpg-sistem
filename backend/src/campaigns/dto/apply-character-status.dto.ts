import { IsString, MinLength } from 'class-validator';

export class ApplyCharacterStatusDto {
  @IsString()
  @MinLength(2)
  status!: string;
}


import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateCharacterHpDto {
  @IsInt()
  @Min(0)
  currentHp!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxHp?: number;
}


import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateSquadDto {
  @IsString()
  @MinLength(1)
  @MaxLength(40)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;
}

export class JoinSquadDto {
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  code!: string;
}

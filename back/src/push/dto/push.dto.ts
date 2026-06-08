import { IsBoolean, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class PushKeysDto {
  @IsString()
  @MaxLength(256)
  p256dh!: string;

  @IsString()
  @MaxLength(256)
  auth!: string;
}

export class PushSubscribeDto {
  @IsString()
  @MaxLength(1024)
  endpoint!: string;

  @ValidateNested()
  @Type(() => PushKeysDto)
  keys!: PushKeysDto;
}

export class PushUnsubscribeDto {
  @IsString()
  @MaxLength(1024)
  endpoint!: string;
}

export class PushPrefsDto {
  @IsOptional() @IsBoolean() pushStreak?: boolean;
  @IsOptional() @IsBoolean() pushWins?: boolean;
  @IsOptional() @IsBoolean() pushLiga?: boolean;
  @IsOptional() @IsBoolean() pushSocial?: boolean;
}

import { IsString, MaxLength, MinLength } from 'class-validator';

export class FriendRequestDto {
  // @username do GitHub — limites de tamanho do próprio GitHub (1–39),
  // com folga p/ o "@" opcional.
  @IsString()
  @MinLength(1)
  @MaxLength(40)
  username!: string;
}

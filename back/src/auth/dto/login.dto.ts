import { IsOptional, IsString, MaxLength } from 'class-validator';

export class LoginWithGithubDto {
  @IsString()
  @MaxLength(512)
  code!: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  redirectUri?: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  codeVerifier?: string;
}

export class RefreshTokenDto {
  @IsOptional()
  @IsString()
  @MaxLength(1024)
  refreshToken?: string;
}

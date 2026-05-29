export type JwtPayloadDto = {
  sub: string;
  githubId: string;
  tokenType: 'access' | 'refresh';
};

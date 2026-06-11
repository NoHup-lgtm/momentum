export type JwtPayloadDto = {
  sub: string;
  githubId: string;
  tokenType: 'access' | 'refresh';
  jti?: string; // só nos refresh tokens (rastreio p/ rotação/revogação)
};

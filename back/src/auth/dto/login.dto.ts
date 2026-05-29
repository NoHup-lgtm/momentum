export type LoginWithGithubDto = {
  code?: string;
  redirectUri?: string;
  codeVerifier?: string;
};

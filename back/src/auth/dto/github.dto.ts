export type GithubUserResponseDto = {
  id: number;
  login: string;
  avatar_url?: string | null;
  email?: string | null;
};

type GithubEmailDto = {
  email: string;
  primary: boolean;
  verified: boolean;
};

export type GithubEmailsResponseDto = GithubEmailDto[];

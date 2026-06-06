// Usuário completo dos endpoints de sessão (/auth/check, /auth/refresh, login).
// Carregado do banco — cold path. É o shape que o mobile espera no boot/login.
export type SessionUser = {
  id: string;
  githubId: string;
  githubLogin: string;
  avatarUrl: string | null;
  email: string | null;
};

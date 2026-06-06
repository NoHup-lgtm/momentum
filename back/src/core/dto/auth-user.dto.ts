// Identidade resolvida do JWT em TODA request autenticada (sem tocar no banco).
// O AuthGuard monta isso a partir do payload — id (sub) + githubId bastam pros
// endpoints, que só usam user.id.
export type AuthUserDto = {
  id: string;
  githubId: string;
};

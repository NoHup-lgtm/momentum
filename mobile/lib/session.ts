import * as SecureStore from 'expo-secure-store';
import { API_URL } from './config';
import type { User } from '../store/app';
import type { RankId } from '../constants/design';

// ── Tipos ───────────────────────────────────────────────────────────────────
// Shape retornado pelo backend (/auth/login/github e /auth/check)
export interface AuthUser {
  id: string;
  githubId: string;
  githubLogin: string;
  avatarUrl: string | null;
  email: string | null;
}

interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

// Shape do GET /me (usuário logado com gamificação)
export interface MeUser {
  id: string;
  githubLogin: string;
  displayName: string;
  avatarUrl: string | null;
  avatarVariant: number;
  rank: string; // enum do backend em MAIÚSCULO (INIT, BUILD, ...)
  level: number;
  totalXp: number;
  xpIntoLevel: number;
  xpToNextLevel: number;
  currentStreak: number;
  maxStreak: number;
  streakFreezes: number;
  coins: number;
  gems: number;
  isPro: boolean;
  committedToday: boolean;
}

// ── Armazenamento seguro dos tokens ──────────────────────────────────────────
const ACCESS_KEY = 'momentum.access_token';
const REFRESH_KEY = 'momentum.refresh_token';

async function saveTokens(accessToken: string, refreshToken: string) {
  await SecureStore.setItemAsync(ACCESS_KEY, accessToken);
  await SecureStore.setItemAsync(REFRESH_KEY, refreshToken);
}

async function getAccessToken() {
  return SecureStore.getItemAsync(ACCESS_KEY);
}

async function getRefreshToken() {
  return SecureStore.getItemAsync(REFRESH_KEY);
}

export async function clearTokens() {
  await SecureStore.deleteItemAsync(ACCESS_KEY);
  await SecureStore.deleteItemAsync(REFRESH_KEY);
}

// ── Cliente HTTP ──────────────────────────────────────────────────────────────
// Anexa o access token e, se tomar 401, tenta refresh uma vez antes de desistir.
export async function apiFetch(
  path: string,
  init: RequestInit = {},
  retry = true,
): Promise<Response> {
  const token = await getAccessToken();
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });

  if (res.status === 401 && retry) {
    const refreshed = await tryRefresh();
    if (refreshed) return apiFetch(path, init, false);
  }
  return res;
}

async function tryRefresh(): Promise<boolean> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return false;

  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    await clearTokens();
    return false;
  }

  const data = (await res.json()) as LoginResponse;
  await saveTokens(data.accessToken, data.refreshToken);
  return true;
}

// ── Fluxos de autenticação ────────────────────────────────────────────────────
export async function loginWithGithubCode(
  code: string,
  redirectUri: string,
  codeVerifier?: string,
): Promise<AuthUser> {
  const res = await fetch(`${API_URL}/auth/login/github`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, redirectUri, codeVerifier }),
  });

  if (!res.ok) {
    throw new Error(await readError(res));
  }

  const data = (await res.json()) as LoginResponse;
  await saveTokens(data.accessToken, data.refreshToken);
  return data.user;
}

// Reidrata a sessão no boot do app. Retorna o usuário ou null se não logado.
export async function checkSession(): Promise<AuthUser | null> {
  const token = await getAccessToken();
  if (!token) return null;

  const res = await apiFetch('/auth/check', { method: 'GET' });
  if (!res.ok) return null;
  return (await res.json()) as AuthUser;
}

// Busca o usuário logado com os dados de gamificação. null = não autenticado.
export async function fetchMe(): Promise<MeUser | null> {
  const token = await getAccessToken();
  if (!token) return null;
  try {
    const res = await apiFetch('/me', { method: 'GET' });
    if (!res.ok) return null;
    return (await res.json()) as MeUser;
  } catch {
    return null;
  }
}

// ── GitHub activity ───────────────────────────────────────────────────────────
export interface RepoCommits {
  repo: string;
  count: number;
}
export interface ContributionDay {
  date: string;
  count: number;
}

// Sincroniza as contribuições do GitHub e retorna o /me já atualizado.
export async function syncGithub(): Promise<MeUser | null> {
  try {
    const res = await apiFetch('/me/github/sync', { method: 'POST' });
    if (!res.ok) return null;
    return (await res.json()) as MeUser;
  } catch {
    return null;
  }
}

// Commits de hoje agrupados por repositório.
export async function getGithubToday(): Promise<RepoCommits[]> {
  try {
    const res = await apiFetch('/me/github/today', { method: 'GET' });
    if (!res.ok) return [];
    return (await res.json()) as RepoCommits[];
  } catch {
    return [];
  }
}

// Contagem diária das 13 semanas (heatmap).
export async function getHeatmap(): Promise<ContributionDay[]> {
  try {
    const res = await apiFetch('/me/github/heatmap', { method: 'GET' });
    if (!res.ok) return [];
    return (await res.json()) as ContributionDay[];
  } catch {
    return [];
  }
}

// ── Squad ─────────────────────────────────────────────────────────────────────
export interface SquadMember {
  userId: string;
  githubLogin: string;
  displayName: string | null;
  avatarUrl: string | null;
  avatarVariant: number;
  rank: string;
  level: number;
  currentStreak: number;
  role: string;
  weeklyXp?: number;
}
export interface Squad {
  id: string;
  name: string;
  description: string | null;
  rank: string;
  maxMembers: number;
  isOwner: boolean;
  memberCount: number;
  members: SquadMember[];
}

export async function getMySquad(): Promise<Squad | null> {
  try {
    const res = await apiFetch('/squads/me', { method: 'GET' });
    if (!res.ok) return null;
    // Nest envia corpo VAZIO quando o handler retorna null (sem squad).
    const text = await res.text();
    return text ? (JSON.parse(text) as Squad) : null;
  } catch {
    return null;
  }
}

export async function getSquadLeaderboard(): Promise<SquadMember[]> {
  try {
    const res = await apiFetch('/squads/me/leaderboard', { method: 'GET' });
    if (!res.ok) return [];
    const text = await res.text();
    return text ? (JSON.parse(text) as SquadMember[]) : [];
  } catch {
    return [];
  }
}

export async function createSquad(name: string, description?: string): Promise<Squad> {
  const res = await apiFetch('/squads', {
    method: 'POST',
    body: JSON.stringify({ name, description }),
  });
  if (!res.ok) throw new Error(await readError(res));
  return (await res.json()) as Squad;
}

export async function joinSquad(code: string): Promise<Squad> {
  const res = await apiFetch('/squads/join', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
  if (!res.ok) throw new Error(await readError(res));
  return (await res.json()) as Squad;
}

export async function createSquadInvite(): Promise<string> {
  const res = await apiFetch('/squads/me/invite', { method: 'POST' });
  if (!res.ok) throw new Error(await readError(res));
  const data = (await res.json()) as { code: string };
  return data.code;
}

export async function leaveSquad(): Promise<void> {
  await apiFetch('/squads/me/leave', { method: 'POST' });
}

export async function logout() {
  await clearTokens();
}

// ── Helpers ─────────────────────────────────────────────────────────────────
async function readError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { message?: string | string[] };
    const msg = Array.isArray(body.message)
      ? body.message.join(', ')
      : body.message;
    return msg ?? `Erro ${res.status}`;
  } catch {
    return `Erro ${res.status}`;
  }
}

// Converte o AuthUser do backend para o User do store, preenchendo os campos
// de gamificação com defaults (virão de um /me futuro).
export function authToStoreUser(auth: AuthUser): User {
  return {
    id: auth.id,
    githubLogin: auth.githubLogin,
    displayName: auth.githubLogin,
    avatarUrl: auth.avatarUrl ?? '',
    avatarVariant: 0,
    rank: 'init' as RankId,
    level: 1,
    totalXp: 0,
    xpIntoLevel: 0,
    xpToNextLevel: 100,
    currentStreak: 0,
    maxStreak: 0,
    streakFreezes: 0,
    coins: 0,
    gems: 0,
    isPro: false,
    committedToday: false,
  };
}

// Converte o /me (rank em MAIÚSCULO) para o User do store (RankId minúsculo).
export function meToStoreUser(me: MeUser): User {
  return {
    id: me.id,
    githubLogin: me.githubLogin,
    displayName: me.displayName,
    avatarUrl: me.avatarUrl ?? '',
    avatarVariant: me.avatarVariant,
    rank: me.rank.toLowerCase() as RankId,
    level: me.level,
    totalXp: me.totalXp,
    xpIntoLevel: me.xpIntoLevel,
    xpToNextLevel: me.xpToNextLevel,
    currentStreak: me.currentStreak,
    maxStreak: me.maxStreak,
    streakFreezes: me.streakFreezes,
    coins: me.coins,
    gems: me.gems,
    isPro: me.isPro,
    committedToday: me.committedToday,
  };
}

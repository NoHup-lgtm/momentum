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
): Promise<AuthUser> {
  const res = await fetch(`${API_URL}/auth/login/github`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, redirectUri }),
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
    currentStreak: 0,
    maxStreak: 0,
    coins: 0,
    gems: 0,
    isPro: false,
    committedToday: false,
  };
}

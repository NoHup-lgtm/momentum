import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { API_URL } from './config';

// M4: no web, envia os cookies httpOnly junto das requisições. Hoje (API
// cross-site) o browser nem manda o cookie — o Bearer continua mandando —, mas
// quando a API for same-site (api.momentu.me) este é o canal de auth do web.
// No nativo é ignorado (usa Bearer via SecureStore).
const WEB_CREDENTIALS: RequestCredentials | undefined =
  Platform.OS === 'web' ? 'include' : undefined;
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
  weekXp: number;
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

async function setStoredItem(key: string, value: string) {
  if (Platform.OS === 'web') {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function getStoredItem(key: string) {
  if (Platform.OS === 'web') {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function deleteStoredItem(key: string) {
  if (Platform.OS === 'web') {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

async function saveTokens(accessToken: string, refreshToken: string) {
  await setStoredItem(ACCESS_KEY, accessToken);
  await setStoredItem(REFRESH_KEY, refreshToken);
}

async function getAccessToken() {
  return getStoredItem(ACCESS_KEY);
}

async function getRefreshToken() {
  return getStoredItem(REFRESH_KEY);
}

export async function clearTokens() {
  await deleteStoredItem(ACCESS_KEY);
  await deleteStoredItem(REFRESH_KEY);
  await deleteStoredItem(CELEBRATED_LEVEL_KEY);
}

// Existe um token salvo? (leitura local, instantânea — usada no boot pra evitar
// um round-trip de rede quando o usuário não está logado.)
export async function hasStoredSession(): Promise<boolean> {
  return (await getAccessToken()) != null;
}

// ── Detecção de level-up ──────────────────────────────────────────────────────
// Guarda o último nível "comemorado" para disparar a animação só uma vez por
// nível, sobrevivendo a reloads. Na 1ª vez (sem valor salvo) calibra no nível
// atual e NÃO comemora (evita celebração espúria de quem já estava num nível).
const CELEBRATED_LEVEL_KEY = 'momentum.celebrated_level';

export async function checkLevelUp(level: number): Promise<number | null> {
  const raw = await getStoredItem(CELEBRATED_LEVEL_KEY);
  if (raw == null) {
    await setStoredItem(CELEBRATED_LEVEL_KEY, String(level));
    return null;
  }
  const prev = parseInt(raw, 10) || 0;
  if (level > prev) {
    await setStoredItem(CELEBRATED_LEVEL_KEY, String(level));
    return level;
  }
  return null;
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

  const res = await fetch(`${API_URL}${path}`, { ...init, headers, credentials: WEB_CREDENTIALS });

  if (res.status === 401 && retry) {
    const refreshed = await tryRefresh();
    if (refreshed) return apiFetch(path, init, false);
  }
  return res;
}

// Dedup de refresh: vários 401 concorrentes (ex: a Home dispara ~5 requests em
// paralelo) compartilham UM único refresh em vez de cada um chamar /auth/refresh
// e correr no saveTokens.
let refreshInFlight: Promise<boolean> | null = null;

function tryRefresh(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = doRefresh().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

async function doRefresh(): Promise<boolean> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return false;

  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
    credentials: WEB_CREDENTIALS,
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
    credentials: WEB_CREDENTIALS,
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
  equipped?: EquippedMap;
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

// ── Daily challenges ──────────────────────────────────────────────────────────
export interface DailyChallenge {
  id: string;
  key: string;
  target: number;
  rewardXp: number;
  rewardCoins: number;
  currentValue: number;
  completed: boolean;
  claimed: boolean;
}

export async function getChallenges(): Promise<DailyChallenge[]> {
  try {
    const res = await apiFetch('/me/challenges', { method: 'GET' });
    if (!res.ok) return [];
    return (await res.json()) as DailyChallenge[];
  } catch {
    return [];
  }
}

export async function claimChallenge(id: string): Promise<boolean> {
  try {
    const res = await apiFetch(`/me/challenges/${id}/claim`, { method: 'POST' });
    return res.ok;
  } catch {
    return false;
  }
}

// ── Leaderboards ──────────────────────────────────────────────────────────────
export interface RankUser {
  position: number;
  id: string;
  githubLogin: string;
  displayName: string | null;
  avatarUrl: string | null;
  avatarVariant: number;
  rank: string;
  level: number;
  totalXp: number;
  equipped?: EquippedMap;
}
export interface RankSquad {
  position: number;
  id: string;
  name: string;
  rank: string;
  memberCount: number;
  totalXp: number;
}

export async function getTopUsers(): Promise<RankUser[]> {
  try {
    const res = await apiFetch('/leaderboard/users', { method: 'GET' });
    if (!res.ok) return [];
    return (await res.json()) as RankUser[];
  } catch {
    return [];
  }
}

export async function getTopSquads(): Promise<RankSquad[]> {
  try {
    const res = await apiFetch('/leaderboard/squads', { method: 'GET' });
    if (!res.ok) return [];
    return (await res.json()) as RankSquad[];
  } catch {
    return [];
  }
}

// ── Liga (sprint divisional) ──────────────────────────────────────────────────
export interface LigaEntry {
  position: number;
  userId: string;
  githubLogin: string;
  displayName: string | null;
  avatarUrl: string | null;
  avatarVariant: number;
  rank: string;
  level: number;
  xpEarned: number;
  isMe: boolean;
}
export interface Liga {
  tier: number;
  maxTier: number;
  sprintNumber: number;
  startsAt: string;
  endsAt: string;
  daysLeft: number;
  promoteCount: number;
  relegateCount: number;
  me: { position: number; xpEarned: number };
  entries: LigaEntry[];
}

export async function getMyLiga(): Promise<Liga | null> {
  try {
    const res = await apiFetch('/me/liga', { method: 'GET' });
    if (!res.ok) return null;
    const txt = await res.text();
    return txt ? (JSON.parse(txt) as Liga) : null;
  } catch {
    return null;
  }
}

// ── Achievements ──────────────────────────────────────────────────────────────
export interface AchievementItem {
  id: string;
  key: string;
  category: string;
  rarity: string;
  target: number;
  currentValue: number;
  unlocked: boolean;
  rewardXp: number;
  rewardCoins: number;
}

export async function getAchievements(): Promise<AchievementItem[]> {
  try {
    const res = await apiFetch('/me/achievements', { method: 'GET' });
    if (!res.ok) return [];
    return (await res.json()) as AchievementItem[];
  } catch {
    return [];
  }
}

// ── Shop ──────────────────────────────────────────────────────────────────────
export interface ShopItem {
  id: string;
  key: string;
  category: string;
  rarity: string;
  priceCoins: number;
  priceGems: number;
  owned: boolean;
  equipped: boolean;
}
export interface Shop {
  coins: number;
  gems: number;
  items: ShopItem[];
}

export async function getShop(): Promise<Shop | null> {
  try {
    const res = await apiFetch('/me/shop', { method: 'GET' });
    if (!res.ok) return null;
    return (await res.json()) as Shop;
  } catch {
    return null;
  }
}

export async function buyItem(id: string): Promise<Shop> {
  const res = await apiFetch(`/me/shop/${id}/buy`, { method: 'POST' });
  if (!res.ok) throw new Error(await readError(res));
  return (await res.json()) as Shop;
}

export async function equipItem(id: string): Promise<Shop> {
  const res = await apiFetch(`/me/shop/${id}/equip`, { method: 'POST' });
  if (!res.ok) throw new Error(await readError(res));
  return (await res.json()) as Shop;
}

// Cosméticos desbloqueáveis por condição (abas lendário/desafios).
export interface UnlockItem {
  id: string;
  key: string;
  category: string;
  rarity: string;
  track: 'LEGENDARY' | 'CHALLENGE' | string;
  metric: string;
  target: number;
  current: number;
  unlocked: boolean;
  equipped: boolean;
}

export async function getUnlockables(): Promise<UnlockItem[]> {
  try {
    const res = await apiFetch('/me/shop/unlockables', { method: 'GET' });
    if (!res.ok) return [];
    return (await res.json()) as UnlockItem[];
  } catch {
    return [];
  }
}

// Mapa categoria → key do cosmético equipado (pro avatar).
export interface EquippedMap {
  HAT?: string;
  SHIRT?: string;
  GLASSES?: string;
  ACCESSORY?: string;
  BACKGROUND?: string;
}

export async function getEquipped(): Promise<EquippedMap> {
  try {
    const res = await apiFetch('/me/shop/equipped', { method: 'GET' });
    if (!res.ok) return {};
    const txt = await res.text();
    return txt ? (JSON.parse(txt) as EquippedMap) : {};
  } catch {
    return {};
  }
}

// ── Amigos ────────────────────────────────────────────────────────────────────
export interface FriendRow {
  friendshipId: string;
  userId: string;
  githubLogin: string;
  displayName: string | null;
  avatarUrl: string | null;
  avatarVariant: number;
  rank: string;
  level: number;
  currentStreak: number;
  equipped?: EquippedMap;
}
export interface FriendsView {
  friends: FriendRow[];
  incoming: FriendRow[];
  outgoing: FriendRow[];
}
const EMPTY_FRIENDS: FriendsView = { friends: [], incoming: [], outgoing: [] };

export async function getFriends(): Promise<FriendsView> {
  try {
    const res = await apiFetch('/me/friends', { method: 'GET' });
    if (!res.ok) return EMPTY_FRIENDS;
    const txt = await res.text();
    return txt ? (JSON.parse(txt) as FriendsView) : EMPTY_FRIENDS;
  } catch {
    return EMPTY_FRIENDS;
  }
}

export async function addFriend(username: string): Promise<FriendsView> {
  const res = await apiFetch('/me/friends/request', {
    method: 'POST',
    body: JSON.stringify({ username }),
  });
  if (!res.ok) throw new Error(await readError(res));
  return (await res.json()) as FriendsView;
}

export async function acceptFriend(id: string): Promise<FriendsView> {
  const res = await apiFetch(`/me/friends/${id}/accept`, { method: 'POST' });
  if (!res.ok) throw new Error(await readError(res));
  return (await res.json()) as FriendsView;
}

export async function removeFriend(id: string): Promise<FriendsView> {
  const res = await apiFetch(`/me/friends/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await readError(res));
  return (await res.json()) as FriendsView;
}

// ── Moderação (bloquear / denunciar) ─────────────────────────────────────────
export async function blockUser(userId: string): Promise<boolean> {
  const res = await apiFetch(`/users/${userId}/block`, { method: 'POST' });
  return res.ok;
}
export async function unblockUser(userId: string): Promise<boolean> {
  const res = await apiFetch(`/users/${userId}/block`, { method: 'DELETE' });
  return res.ok;
}
export async function reportUser(userId: string, reason: string): Promise<boolean> {
  const res = await apiFetch(`/users/${userId}/report`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
  return res.ok;
}

// ── Feed ──────────────────────────────────────────────────────────────────────
export interface FeedItem {
  id: string;
  type: string;
  createdAt: string;
  payload: Record<string, any>;
  user: {
    id: string;
    githubLogin: string;
    displayName: string | null;
    avatarUrl: string | null;
    avatarVariant: number;
    rank: string;
    isMe: boolean;
    equipped?: EquippedMap;
  };
}

export type FeedScope = 'friends' | 'global' | 'liga';

export async function getFeed(scope: FeedScope = 'friends'): Promise<FeedItem[]> {
  try {
    const res = await apiFetch(`/feed?scope=${scope}`, { method: 'GET' });
    if (!res.ok) return [];
    return (await res.json()) as FeedItem[];
  } catch {
    return [];
  }
}

// ── Preferências de push (por categoria) ───────────────────────────────────────
export interface PushPrefs {
  pushStreak: boolean;
  pushWins: boolean;
  pushLiga: boolean;
  pushSocial: boolean;
}

export async function getPushPrefs(): Promise<PushPrefs | null> {
  try {
    const res = await apiFetch('/me/push/prefs', { method: 'GET' });
    return res.ok ? ((await res.json()) as PushPrefs) : null;
  } catch {
    return null;
  }
}

export async function setPushPrefs(prefs: Partial<PushPrefs>): Promise<void> {
  await apiFetch('/me/push/prefs', { method: 'PATCH', body: JSON.stringify(prefs) }).catch(() => {});
}

// ── Public profile (outro usuário) ─────────────────────────────────────────────
export type FriendshipState = 'self' | 'friends' | 'incoming' | 'outgoing' | 'none';

export interface PublicProfile {
  id: string;
  githubLogin: string;
  displayName: string | null;
  avatarUrl: string | null;
  avatarVariant: number;
  rank: string;
  level: number;
  totalXp: number;
  currentStreak: number;
  maxStreak: number;
  totalCommits: number;
  equipped: EquippedMap;
  friendship: { state: FriendshipState; friendshipId: string | null };
  iBlocked: boolean;
  heatmap: number[]; // 91 dias, intensidade 0..5 (antigo → hoje)
  recentActivity: { type: string; payload: Record<string, any>; createdAt: string }[];
}

export async function getUserProfile(userId: string): Promise<PublicProfile | null> {
  try {
    const res = await apiFetch(`/users/${userId}`, { method: 'GET' });
    if (!res.ok) return null;
    return (await res.json()) as PublicProfile;
  } catch {
    return null;
  }
}

// ── Chests ────────────────────────────────────────────────────────────────────
export interface PendingChest {
  id: string;
  rarity: string;
  source: string;
  earnedAt: string;
}
export interface ChestReward {
  type: string;
  amount: number;
}

export async function getChests(): Promise<PendingChest[]> {
  try {
    const res = await apiFetch('/me/chests', { method: 'GET' });
    if (!res.ok) return [];
    return (await res.json()) as PendingChest[];
  } catch {
    return [];
  }
}

export async function openChest(id: string): Promise<{ rarity: string; rewards: ChestReward[] } | null> {
  const res = await apiFetch(`/me/chests/${id}/open`, { method: 'POST' });
  if (!res.ok) return null;
  return (await res.json()) as { rarity: string; rewards: ChestReward[] };
}

export async function logout() {
  // Revoga o refresh token no servidor (best-effort) antes de limpar local.
  try {
    const refreshToken = await getRefreshToken();
    await apiFetch('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: refreshToken ?? undefined }),
    });
  } catch {
    // offline / falha de rede — limpa local de qualquer forma
  }
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
    weekXp: 0,
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
    weekXp: me.weekXp,
    currentStreak: me.currentStreak,
    maxStreak: me.maxStreak,
    streakFreezes: me.streakFreezes,
    coins: me.coins,
    gems: me.gems,
    isPro: me.isPro,
    committedToday: me.committedToday,
  };
}

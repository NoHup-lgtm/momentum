import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CryptoService } from '../core/services/crypto.service.js';
import { levelFromXp } from '../common/leveling.js';

// XP/coins creditados por dia ativo (provisório — fórmula de leveling vem depois)
const XP_PER_ACTIVE_DAY = 50;
const COINS_PER_ACTIVE_DAY = 10;
const HEATMAP_DAYS = 91; // 13 semanas

export interface ContributionDay {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface RepoCommits {
  repo: string;
  count: number;
}

@Injectable()
export class GithubService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly crypto: CryptoService,
  ) {}

  // ── GraphQL helper ──────────────────────────────────────────────────────────
  private async graphql<T>(
    token: string,
    query: string,
    variables: Record<string, unknown>,
  ): Promise<T> {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'momentum-backend',
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!res.ok) {
      throw new Error(`GitHub GraphQL HTTP ${res.status}`);
    }

    const json = (await res.json()) as { data?: T; errors?: unknown[] };
    if (json.errors?.length) {
      throw new Error(`GitHub GraphQL: ${JSON.stringify(json.errors)}`);
    }
    return json.data as T;
  }

  private async getUserWithToken(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        githubLogin: true,
        accessToken: true,
        timezone: true,
        maxStreak: true,
        totalXp: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    // token vem criptografado do banco — descriptografa pra usar na API do GitHub
    return { ...user, accessToken: this.crypto.decrypt(user.accessToken) };
  }

  // ── Calendário de contribuições (heatmap + streak) ────────────────────────────
  private async fetchCalendar(
    login: string,
    token: string,
  ): Promise<ContributionDay[]> {
    const to = new Date();
    const from = new Date(Date.now() - HEATMAP_DAYS * 86_400_000);

    const query = `
      query($login:String!, $from:DateTime!, $to:DateTime!) {
        user(login:$login) {
          contributionsCollection(from:$from, to:$to) {
            contributionCalendar {
              weeks { contributionDays { date contributionCount } }
            }
          }
        }
      }`;

    type Resp = {
      user: {
        contributionsCollection: {
          contributionCalendar: {
            weeks: {
              contributionDays: { date: string; contributionCount: number }[];
            }[];
          };
        };
      } | null;
    };

    const data = await this.graphql<Resp>(token, query, {
      login,
      from: from.toISOString(),
      to: to.toISOString(),
    });

    const weeks =
      data.user?.contributionsCollection.contributionCalendar.weeks ?? [];
    return weeks.flatMap((w) =>
      w.contributionDays.map((d) => ({
        date: d.date,
        count: d.contributionCount,
      })),
    );
  }

  // ── Commits de hoje por repositório (lista da Home) ───────────────────────────
  async getTodayByRepo(userId: string): Promise<RepoCommits[]> {
    const user = await this.getUserWithToken(userId);
    const todayStr = this.todayStr(user.timezone);
    const from = new Date(`${todayStr}T00:00:00.000Z`);
    const to = new Date();

    const query = `
      query($login:String!, $from:DateTime!, $to:DateTime!) {
        user(login:$login) {
          contributionsCollection(from:$from, to:$to) {
            commitContributionsByRepository(maxRepositories:20) {
              repository { nameWithOwner }
              contributions { totalCount }
            }
          }
        }
      }`;

    type Resp = {
      user: {
        contributionsCollection: {
          commitContributionsByRepository: {
            repository: { nameWithOwner: string };
            contributions: { totalCount: number };
          }[];
        };
      } | null;
    };

    const data = await this.graphql<Resp>(user.accessToken, query, {
      login: user.githubLogin,
      from: from.toISOString(),
      to: to.toISOString(),
    });

    const repos =
      data.user?.contributionsCollection.commitContributionsByRepository ?? [];
    return repos
      .map((r) => ({
        repo: r.repository.nameWithOwner,
        count: r.contributions.totalCount,
      }))
      .filter((r) => r.count > 0)
      .sort((a, b) => b.count - a.count);
  }

  // ── Heatmap (13 semanas de contagem diária) ───────────────────────────────────
  async getHeatmap(userId: string): Promise<ContributionDay[]> {
    const user = await this.getUserWithToken(userId);
    return this.fetchCalendar(user.githubLogin, user.accessToken);
  }

  // ── Sync: contribuições → DailyActivity + streak + XP ─────────────────────────
  async syncUser(userId: string) {
    const user = await this.getUserWithToken(userId);
    const days = await this.fetchCalendar(user.githubLogin, user.accessToken);
    const activeDays = days.filter((d) => d.count > 0);

    // Dedup: só credita XP/coins para dias ainda não registrados.
    // Lê data + count de uma vez pra (a) saber o que já existe e
    // (b) detectar quais dias mudaram de contagem (e pular os inalterados).
    const fromDate = new Date(Date.now() - HEATMAP_DAYS * 86_400_000);
    const existing = await this.prisma.dailyActivity.findMany({
      where: { userId, activityType: 'COMMIT', date: { gte: fromDate } },
      select: { date: true, count: true },
    });
    const existingCount = new Map(
      existing.map((e) => [e.date.toISOString().slice(0, 10), e.count]),
    );

    // Particiona: dias novos (insere + credita) e dias existentes com
    // contagem alterada (só atualiza o count). Dias inalterados são ignorados.
    const toCreate = activeDays.filter((d) => !existingCount.has(d.date));
    const toUpdate = activeDays.filter(
      (d) => existingCount.has(d.date) && existingCount.get(d.date) !== d.count,
    );

    const addedXp = toCreate.length * XP_PER_ACTIVE_DAY;
    const addedCoins = toCreate.length * COINS_PER_ACTIVE_DAY;

    const { currentStreak, maxStreak } = this.computeStreaks(
      days,
      user.timezone,
    );
    const lastActive = activeDays.at(-1)?.date;
    // nível derivado do novo totalXp — calculado local, sem reler o banco
    const level = levelFromXp(user.totalXp + addedXp);

    // Monta todas as escritas e executa num único batch atômico:
    // 3 createMany (em vez de 3×N inserts) + N' updates (só os que mudaram)
    // + 1 update do usuário (em vez de update→findUnique→update).
    const ops: Prisma.PrismaPromise<unknown>[] = [];

    if (toCreate.length) {
      ops.push(
        this.prisma.dailyActivity.createMany({
          skipDuplicates: true,
          data: toCreate.map((d) => ({
            userId,
            date: new Date(`${d.date}T00:00:00.000Z`),
            activityType: 'COMMIT' as const,
            count: d.count,
            xpGained: XP_PER_ACTIVE_DAY,
            coinsGained: COINS_PER_ACTIVE_DAY,
            keptStreak: true,
          })),
        }),
        this.prisma.xpTransaction.createMany({
          data: toCreate.map((d) => ({
            userId,
            amount: XP_PER_ACTIVE_DAY,
            source: 'DAILY_ACTIVITY' as const,
            description: `Atividade no GitHub em ${d.date}`,
          })),
        }),
        this.prisma.coinTransaction.createMany({
          data: toCreate.map((d) => ({
            userId,
            amount: COINS_PER_ACTIVE_DAY,
            source: 'DAILY_ACTIVITY' as const,
            description: `Atividade no GitHub em ${d.date}`,
          })),
        }),
      );
    }

    for (const d of toUpdate) {
      ops.push(
        this.prisma.dailyActivity.update({
          where: {
            userId_date_activityType: {
              userId,
              date: new Date(`${d.date}T00:00:00.000Z`),
              activityType: 'COMMIT',
            },
          },
          data: { count: d.count },
        }),
      );
    }

    ops.push(
      this.prisma.user.update({
        where: { id: userId },
        data: {
          currentStreak,
          maxStreak: Math.max(maxStreak, user.maxStreak),
          lastActivityDate: lastActive
            ? new Date(`${lastActive}T00:00:00.000Z`)
            : undefined,
          level,
          ...(addedCoins > 0 ? { coins: { increment: addedCoins } } : {}),
          ...(addedXp > 0 ? { totalXp: { increment: addedXp } } : {}),
        },
      }),
    );

    await this.prisma.$transaction(ops);

    return { addedXp, addedCoins, currentStreak, activeDays: activeDays.length };
  }

  // ── Helpers ───────────────────────────────────────────────────────────────────
  // currentStreak: dias consecutivos com atividade terminando hoje (ou ontem,
  // como graça enquanto o dia de hoje não terminou). maxStreak: maior sequência.
  private computeStreaks(days: ContributionDay[], timezone: string) {
    const counts = new Map(days.map((d) => [d.date, d.count]));
    const todayStr = this.todayStr(timezone);

    const dayBefore = (iso: string, n: number) => {
      const d = new Date(`${iso}T00:00:00.000Z`);
      d.setUTCDate(d.getUTCDate() - n);
      return d.toISOString().slice(0, 10);
    };

    // current streak
    let current = 0;
    const startedToday = (counts.get(todayStr) ?? 0) > 0;
    let cursor = startedToday ? todayStr : dayBefore(todayStr, 1);
    while ((counts.get(cursor) ?? 0) > 0) {
      current++;
      cursor = dayBefore(cursor, 1);
    }

    // max streak
    let max = 0;
    let run = 0;
    const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
    for (const d of sorted) {
      if (d.count > 0) {
        run++;
        max = Math.max(max, run);
      } else {
        run = 0;
      }
    }

    return { currentStreak: current, maxStreak: max };
  }

  private todayStr(timezone: string): string {
    const tz = timezone || 'America/Sao_Paulo';
    return new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date());
  }
}

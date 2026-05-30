import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

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
  constructor(private readonly prisma: PrismaService) {}

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
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
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
    const fromDate = new Date(Date.now() - HEATMAP_DAYS * 86_400_000);
    const existing = await this.prisma.dailyActivity.findMany({
      where: { userId, activityType: 'COMMIT', date: { gte: fromDate } },
      select: { date: true },
    });
    const existingSet = new Set(
      existing.map((e) => e.date.toISOString().slice(0, 10)),
    );

    let addedXp = 0;
    let addedCoins = 0;

    for (const day of activeDays) {
      const date = new Date(`${day.date}T00:00:00.000Z`);
      if (existingSet.has(day.date)) {
        // dia já registrado — só atualiza a contagem
        await this.prisma.dailyActivity.update({
          where: {
            userId_date_activityType: {
              userId,
              date,
              activityType: 'COMMIT',
            },
          },
          data: { count: day.count },
        });
        continue;
      }

      // dia novo — registra atividade, credita XP/coins e loga no ledger
      await this.prisma.dailyActivity.create({
        data: {
          userId,
          date,
          activityType: 'COMMIT',
          count: day.count,
          xpGained: XP_PER_ACTIVE_DAY,
          coinsGained: COINS_PER_ACTIVE_DAY,
          keptStreak: true,
        },
      });
      await this.prisma.xpTransaction.create({
        data: {
          userId,
          amount: XP_PER_ACTIVE_DAY,
          source: 'DAILY_ACTIVITY',
          description: `Atividade no GitHub em ${day.date}`,
        },
      });
      await this.prisma.coinTransaction.create({
        data: {
          userId,
          amount: COINS_PER_ACTIVE_DAY,
          source: 'DAILY_ACTIVITY',
          description: `Atividade no GitHub em ${day.date}`,
        },
      });
      addedXp += XP_PER_ACTIVE_DAY;
      addedCoins += COINS_PER_ACTIVE_DAY;
    }

    const { currentStreak, maxStreak } = this.computeStreaks(
      days,
      user.timezone,
    );
    const lastActive = activeDays.at(-1)?.date;

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        currentStreak,
        maxStreak: Math.max(maxStreak, user.maxStreak),
        lastActivityDate: lastActive
          ? new Date(`${lastActive}T00:00:00.000Z`)
          : undefined,
        coins: { increment: addedCoins },
        // totalXp recalculado a partir do ledger (fonte da verdade)
        ...(addedXp > 0 ? { totalXp: { increment: addedXp } } : {}),
      },
    });

    // nível derivado do totalXp (provisório: 1000 XP por nível)
    const refreshed = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { totalXp: true },
    });
    const level = Math.floor((refreshed?.totalXp ?? 0) / 1000) + 1;
    await this.prisma.user.update({ where: { id: userId }, data: { level } });

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

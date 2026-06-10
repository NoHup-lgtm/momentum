import { BadRequestException, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import webpush from 'web-push';
import { PrismaService } from '../prisma/prisma.service.js';

export interface PushPayload {
  title: string;
  body: string;
  url?: string; // pra onde levar ao clicar (default: '/')
  tag?: string; // agrupa/substitui notificações do mesmo tipo
}

// Categoria da notificação → casa com a preferência do usuário.
export type PushCategory = 'streak' | 'wins' | 'liga' | 'social';

export interface PushPrefs {
  pushStreak: boolean;
  pushWins: boolean;
  pushLiga: boolean;
  pushSocial: boolean;
}

const PREF_SELECT = { pushStreak: true, pushWins: true, pushLiga: true, pushSocial: true } as const;

interface SubInput {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

@Injectable()
export class PushService implements OnModuleInit {
  private readonly logger = new Logger(PushService.name);
  private enabled = false;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    const pub = process.env.VAPID_PUBLIC_KEY;
    const priv = process.env.VAPID_PRIVATE_KEY;
    const subject = process.env.VAPID_SUBJECT || 'mailto:contato@momentu.me';
    if (pub && priv) {
      webpush.setVapidDetails(subject, pub, priv);
      this.enabled = true;
    } else {
      this.logger.warn('VAPID_PUBLIC_KEY/PRIVATE ausentes — Web Push desabilitado.');
    }
  }

  // ── Lembrete de ofensiva ──────────────────────────────────────────────────────
  // Roda de hora em hora: pra cada user com push inscrito cuja hora LOCAL é 20h
  // e que ainda NÃO commitou hoje, manda o aviso. (A graça do streak quebrar à
  // meia-noite vira urgência às 20h.)
  @Cron(CronExpression.EVERY_HOUR)
  async streakReminders(): Promise<void> {
    if (!this.enabled) return;

    const subs = await this.prisma.pushSubscription.findMany({
      distinct: ['userId'],
      select: { userId: true },
    });
    if (subs.length === 0) return;

    const users = await this.prisma.user.findMany({
      where: { id: { in: subs.map((s) => s.userId) }, pushStreak: true },
      select: { id: true, timezone: true, currentStreak: true },
    });

    const now = new Date();
    for (const u of users) {
      const tz = u.timezone || 'America/Sao_Paulo';
      const hour = Number(
        new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', hour12: false }).format(now),
      );
      if (hour !== 20) continue; // só às 20h locais

      const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(now);
      const committed = await this.prisma.dailyActivity.findFirst({
        where: { userId: u.id, date: new Date(todayStr), activityType: 'COMMIT', keptStreak: true },
        select: { id: true },
      });
      if (committed) continue; // já commitou hoje

      const s = u.currentStreak;
      await this.sendToUser(u.id, {
        title: s > 0 ? `🔥 sua ofensiva de ${s} dias tá em risco` : '🔥 não perca o momentum',
        body:
          s > 0
            ? 'um commit antes da meia-noite mantém o streak vivo.'
            : 'um commit hoje já começa sua ofensiva.',
        url: '/',
        tag: 'streak-reminder',
      });
    }
  }

  // O endpoint vem do navegador, mas é input do cliente: sem validação o
  // servidor faria POST pra QUALQUER URL (SSRF/relay). Exige https e barra
  // hosts internos/IP literais — push services reais são sempre públicos.
  private assertValidEndpoint(endpoint: string): void {
    let url: URL;
    try {
      url = new URL(endpoint);
    } catch {
      throw new BadRequestException('Endpoint inválido');
    }
    const host = url.hostname.toLowerCase();
    const isIpLiteral = /^[\d.]+$/.test(host) || host.includes(':');
    if (
      url.protocol !== 'https:' ||
      isIpLiteral ||
      host === 'localhost' ||
      host.endsWith('.local') ||
      host.endsWith('.internal')
    ) {
      throw new BadRequestException('Endpoint de push não permitido');
    }
  }

  async subscribe(userId: string, sub: SubInput) {
    this.assertValidEndpoint(sub.endpoint);
    await this.prisma.pushSubscription.upsert({
      where: { endpoint: sub.endpoint },
      create: { userId, endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth },
      update: { userId, p256dh: sub.keys.p256dh, auth: sub.keys.auth },
    });
    return { ok: true };
  }

  async unsubscribe(endpoint: string) {
    await this.prisma.pushSubscription.deleteMany({ where: { endpoint } });
    return { ok: true };
  }

  async getPrefs(userId: string): Promise<PushPrefs> {
    const u = await this.prisma.user.findUnique({ where: { id: userId }, select: PREF_SELECT });
    return u ?? { pushStreak: true, pushWins: true, pushLiga: true, pushSocial: true };
  }

  async setPrefs(userId: string, prefs: Partial<PushPrefs>): Promise<PushPrefs> {
    await this.prisma.user.update({ where: { id: userId }, data: prefs });
    return this.getPrefs(userId);
  }

  private async categoryAllowed(userId: string, category: PushCategory): Promise<boolean> {
    const p = await this.getPrefs(userId);
    return category === 'streak' ? p.pushStreak
      : category === 'wins' ? p.pushWins
      : category === 'liga' ? p.pushLiga
      : p.pushSocial;
  }

  // Envia pra todas as inscrições do user (best-effort). Remove as mortas (404/410).
  // `category` (opcional) respeita a preferência do usuário pra aquele tipo.
  async sendToUser(userId: string, payload: PushPayload, category?: PushCategory): Promise<void> {
    if (!this.enabled) return;
    if (category && !(await this.categoryAllowed(userId, category))) return;
    const subs = await this.prisma.pushSubscription.findMany({ where: { userId } });
    if (subs.length === 0) return;

    const body = JSON.stringify(payload);
    await Promise.all(
      subs.map(async (s) => {
        try {
          await webpush.sendNotification(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
            body,
          );
        } catch (e: unknown) {
          const code = (e as { statusCode?: number })?.statusCode;
          if (code === 404 || code === 410) {
            // inscrição expirada/cancelada → limpa
            await this.prisma.pushSubscription.delete({ where: { id: s.id } }).catch(() => {});
          } else {
            this.logger.warn(`push falhou (${code ?? '?'}) p/ user ${userId}`);
          }
        }
      }),
    );
  }
}

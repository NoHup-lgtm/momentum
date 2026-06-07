// Web Push (PWA) — só no web. Registra o service worker, pede permissão,
// inscreve no push manager com a chave VAPID e manda a inscrição pro backend.
import { Platform } from 'react-native';
import { apiFetch } from './session';

const VAPID_PUBLIC = process.env.EXPO_PUBLIC_VAPID_PUBLIC_KEY ?? '';
const w: any = globalThis as any;

export type PushState = 'unsupported' | 'default' | 'granted' | 'denied';

export function isPushSupported(): boolean {
  return (
    Platform.OS === 'web' &&
    !!w.navigator?.serviceWorker &&
    typeof w.PushManager !== 'undefined' &&
    typeof w.Notification !== 'undefined'
  );
}

export function pushState(): PushState {
  if (!isPushSupported()) return 'unsupported';
  try {
    return (w.Notification?.permission as PushState) ?? 'default';
  } catch {
    return 'default';
  }
}

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = w.atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

// Registra o SW no boot (web) — necessário pra receber push mesmo com app fechado.
export async function registerServiceWorker(): Promise<void> {
  if (Platform.OS !== 'web' || !w.navigator?.serviceWorker) return;
  try {
    await w.navigator.serviceWorker.register('/sw.js');
  } catch {
    // silencioso — sem SW, só não tem push
  }
}

// Pede permissão + inscreve + manda pro backend. Retorna se ativou.
export async function enablePush(): Promise<{ ok: boolean; reason?: string }> {
  if (!isPushSupported()) return { ok: false, reason: 'unsupported' };
  if (!VAPID_PUBLIC) return { ok: false, reason: 'no-vapid' };

  try {
    const reg = await w.navigator.serviceWorker.register('/sw.js');
    await w.navigator.serviceWorker.ready;

    const perm = await w.Notification.requestPermission();
    if (perm !== 'granted') return { ok: false, reason: 'denied' };

    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
      });
    }

    const json = sub.toJSON();
    const res = await apiFetch('/me/push/subscribe', {
      method: 'POST',
      body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
    });
    return { ok: res.ok, reason: res.ok ? undefined : 'backend' };
  } catch {
    return { ok: false, reason: 'error' };
  }
}

// Cancela a inscrição (local + backend).
export async function disablePush(): Promise<void> {
  if (!isPushSupported()) return;
  try {
    const reg = await w.navigator.serviceWorker.getRegistration('/sw.js');
    const sub = await reg?.pushManager.getSubscription();
    if (sub) {
      const endpoint = sub.toJSON().endpoint;
      await sub.unsubscribe();
      await apiFetch('/me/push/unsubscribe', {
        method: 'POST',
        body: JSON.stringify({ endpoint }),
      }).catch(() => {});
    }
  } catch {
    // ignora
  }
}

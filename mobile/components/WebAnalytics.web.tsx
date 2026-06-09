// Vercel Web Analytics — só no web (PWA em app.momentu.me). Usamos o entry
// genérico /react porque o app é Expo Router (RN Web), não Next.js. O componente
// injeta o script e rastreia page views automaticamente nas trocas de rota.
import { Analytics } from '@vercel/analytics/react';

export default function WebAnalytics() {
  return <Analytics />;
}

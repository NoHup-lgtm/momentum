// Vercel Web Analytics + Speed Insights — só no web (PWA em app.momentu.me).
// Usamos os entries genéricos /react porque o app é Expo Router (RN Web), não
// Next.js. Analytics rastreia page views nas trocas de rota; Speed Insights
// mede performance real (Core Web Vitals: LCP, CLS, etc.).
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

export default function WebAnalytics() {
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}

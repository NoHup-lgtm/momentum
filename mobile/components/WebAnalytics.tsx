// No-op no nativo. No web, o Metro resolve WebAnalytics.web.tsx (que renderiza
// o <Analytics/> do Vercel). Mantém o @vercel/analytics fora do bundle nativo.
export default function WebAnalytics() {
  return null;
}

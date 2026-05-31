export type Lang = 'pt' | 'en';

// Dicionário do app. Começa pelas telas estáveis (onboarding); as telas das
// features MVP (squad, loja, conquistas, baús) entram aqui conforme forem feitas.
export const strings = {
  pt: {
    common: {
      retry: 'Tentar de novo',
    },
    auth: {
      subtitle: 'feito de dias imperfeitos.',
      body: 'Cada commit que você faz vira streak, XP e rank.\nCompita com sua squad. Não quebre a ofensiva.',
      connecting: 'Conectando…',
      continueGithub: 'Continuar com GitHub',
      hint: 'momentum vive dos seus commits',
      errorAuth: 'Falha na autorização do GitHub',
      errorGeneric: 'Não foi possível entrar',
      errorNoClient: 'GITHUB_CLIENT_ID não configurado (mobile/.env)',
      connected: 'conta conectada',
      githubConnected: 'GitHub conectado ✓',
      verified: 'conta verificada — pronto para começar',
      enter: 'Entrar no momentum →',
    },
  },
  en: {
    common: {
      retry: 'Try again',
    },
    auth: {
      subtitle: 'built from imperfect days.',
      body: 'Every commit you make turns into a streak, XP and rank.\nCompete with your squad. Don’t break the streak.',
      connecting: 'Connecting…',
      continueGithub: 'Continue with GitHub',
      hint: 'momentum runs on your commits',
      errorAuth: 'GitHub authorization failed',
      errorGeneric: 'Couldn’t sign in',
      errorNoClient: 'GITHUB_CLIENT_ID not configured (mobile/.env)',
      connected: 'account connected',
      githubConnected: 'GitHub connected ✓',
      verified: 'account verified — ready to start',
      enter: 'Enter momentum →',
    },
  },
} as const;

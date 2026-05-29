import Constants from 'expo-constants';

// URL da API. Em produção, defina EXPO_PUBLIC_API_URL.
// Em dev, usamos o mesmo host do Metro bundler (o IP da LAN da sua máquina)
// na porta 3000 — assim funciona em celular físico sem configurar IP na mão.
function resolveDevApiUrl(): string {
  const hostUri = Constants.expoConfig?.hostUri; // ex: "192.168.0.12:8081"
  if (hostUri) {
    const host = hostUri.split(':')[0];
    return `http://${host}:3000`;
  }
  return 'http://localhost:3000';
}

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') ?? resolveDevApiUrl();

// Client ID do GitHub OAuth App (Settings → Developer settings → OAuth Apps).
// Definido em mobile/.env como EXPO_PUBLIC_GITHUB_CLIENT_ID.
export const GITHUB_CLIENT_ID = process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID ?? '';

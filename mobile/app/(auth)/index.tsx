import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Dimensions, Image,
} from 'react-native';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useAuthRequest, makeRedirectUri, type AuthSessionResult } from 'expo-auth-session';
import { C } from '../../constants/design';
import { SpiralIcon, GitHubIcon, MomentumWordmark } from '../../components/icons';
import PixelAvatar from '../../components/avatar/PixelAvatar';
import { GITHUB_CLIENT_ID } from '../../lib/config';
import { loginWithGithubCode, fetchMe, meToStoreUser, type AuthUser } from '../../lib/session';
import { useAppStore } from '../../store/app';

const { width: W } = Dimensions.get('window');

// Finaliza a sessão de auth se o app foi reaberto pelo redirect
WebBrowser.maybeCompleteAuthSession();

const discovery = {
  authorizationEndpoint: 'https://github.com/login/oauth/authorize',
  tokenEndpoint: 'https://github.com/login/oauth/access_token',
};

// momentum://auth — registre exatamente este valor como callback no OAuth App.
const redirectUri = makeRedirectUri({ scheme: 'momentum', path: 'auth' });

type Step = 'welcome' | 'connected';

export default function OnboardingScreen() {
  const [step, setStep] = useState<Step>('welcome');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<AuthUser | null>(null);
  const setUser = useAppStore((s) => s.setUser);

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: GITHUB_CLIENT_ID,
      scopes: ['read:user', 'user:email'],
      redirectUri,
    },
    discovery,
  );

  // Reage ao retorno do GitHub: troca o code pelo login no backend.
  useEffect(() => {
    if (!response) return;
    handleResponse(response);
  }, [response]);

  async function handleResponse(res: AuthSessionResult) {
    if (res.type !== 'success' || !res.params.code) {
      if (res.type === 'error') {
        setError(res.params.error_description ?? 'Falha na autorização do GitHub');
      }
      setLoading(false);
      return;
    }

    try {
      const user = await loginWithGithubCode(
        res.params.code,
        redirectUri,
        request?.codeVerifier,
      );
      // Carrega o perfil completo (gamificação) e popula o store.
      const me = await fetchMe();
      if (me) setUser(meToStoreUser(me));
      setProfile(user);
      setStep('connected');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível entrar');
    } finally {
      setLoading(false);
    }
  }

  function connect() {
    setError(null);
    if (!GITHUB_CLIENT_ID) {
      setError('GITHUB_CLIENT_ID não configurado (mobile/.env)');
      return;
    }
    setLoading(true);
    promptAsync().catch(() => setLoading(false));
  }

  if (step === 'connected' && profile) {
    return <StepConnected profile={profile} onContinue={() => router.replace('/(tabs)')} />;
  }

  return (
    <StepWelcome
      loading={loading}
      error={error}
      disabled={!request}
      onConnect={connect}
    />
  );
}

// ── Step 0: Welcome ───────────────────────────────────────────────────────────
function StepWelcome({ loading, error, disabled, onConnect }: {
  loading: boolean; error: string | null; disabled: boolean; onConnect: () => void;
}) {
  return (
    <View style={s.screen}>
      {/* Watermark */}
      <View style={s.watermark} pointerEvents="none">
        <SpiralIcon size={360} color={C.text} />
      </View>

      <View style={s.center}>
        <MomentumWordmark height={52} />

        <Text style={s.subtitle}>feito de dias imperfeitos.</Text>

        <Text style={s.body}>
          Cada commit que você faz vira streak, XP e rank.{'\n'}
          Compita com sua squad. Não quebre a ofensiva.
        </Text>

        <TouchableOpacity
          style={[s.btn, s.btnPrimary, (loading || disabled) && { opacity: 0.6 }]}
          onPress={onConnect}
          activeOpacity={0.8}
          disabled={loading || disabled}
        >
          {loading ? (
            <View style={s.row}>
              <ActivityIndicator size="small" color="#f2e4cf" />
              <Text style={[s.btnText, { marginLeft: 9 }]}>Conectando…</Text>
            </View>
          ) : (
            <View style={s.row}>
              <GitHubIcon size={18} />
              <Text style={[s.btnText, { marginLeft: 9 }]}>Continuar com GitHub</Text>
            </View>
          )}
        </TouchableOpacity>

        {error ? (
          <Text style={s.error}>{error}</Text>
        ) : (
          <Text style={s.hint}>momentum vive dos seus commits</Text>
        )}
      </View>
    </View>
  );
}

// ── Step 1: Connected ─────────────────────────────────────────────────────────
function StepConnected({ profile, onContinue }: {
  profile: AuthUser;
  onContinue: () => void;
}) {
  return (
    <View style={s.screen}>
      <View style={s.center}>
        <Text style={s.stepLabel}>conta conectada</Text>

        {/* Avatar */}
        <View style={s.avatarWrap}>
          <View style={s.avatarRing}>
            {profile.avatarUrl ? (
              <Image source={{ uri: profile.avatarUrl }} style={s.avatarImg} />
            ) : (
              <PixelAvatar size={80} variant={0} />
            )}
          </View>
          <View style={s.onlineDot} />
        </View>

        <Text style={s.titleMd}>@{profile.githubLogin}</Text>
        <Text style={s.ghSub}>GitHub conectado ✓</Text>

        <View style={s.connectedBadge}>
          <Text style={s.connectedText}>conta verificada — pronto para começar</Text>
        </View>

        <TouchableOpacity style={[s.btn, s.btnPrimary]} onPress={onContinue} activeOpacity={0.8}>
          <Text style={s.btnText}>Entrar no momentum →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen: {
    flex: 1, backgroundColor: C.bg,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 28,
  },
  watermark: {
    position: 'absolute', top: '50%', left: '50%',
    transform: [{ translateX: -180 }, { translateY: -180 }],
    opacity: 0.04,
  },
  center: { width: '100%', alignItems: 'center' },
  titleMd: {
    fontFamily: 'Lora_400Regular', fontSize: 24,
    color: C.text, marginBottom: 6, textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 11,
    color: C.text3, marginBottom: 20, letterSpacing: 0.04,
  },
  body: {
    fontSize: 15, color: C.text2, textAlign: 'center',
    lineHeight: 24, marginBottom: 40,
  },
  stepLabel: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 10,
    color: C.text3, letterSpacing: 0.1, textTransform: 'uppercase',
    marginBottom: 16,
  },
  btn: {
    width: '100%', paddingVertical: 16,
    borderRadius: 8, alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
  },
  btnPrimary: {
    backgroundColor: C.accent,
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 6,
  },
  btnText: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 14, color: '#f2e4cf', letterSpacing: 0.01,
  },
  hint: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 10,
    color: C.text3, textAlign: 'center', marginTop: 4,
  },
  error: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 11,
    color: C.danger, textAlign: 'center', marginTop: 4, lineHeight: 16,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  avatarWrap: { position: 'relative', marginBottom: 20 },
  avatarRing: {
    width: 88, height: 88, borderRadius: 44,
    borderWidth: 2, borderColor: C.accent,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.surface, overflow: 'hidden',
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5, shadowRadius: 16,
  },
  avatarImg: { width: 80, height: 80, borderRadius: 40 },
  onlineDot: {
    position: 'absolute', bottom: 2, right: 2,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: C.success,
    borderWidth: 2.5, borderColor: C.bg,
  },
  ghSub: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 11,
    color: C.success, marginBottom: 28,
  },
  connectedBadge: {
    backgroundColor: 'rgba(90,122,80,0.12)',
    borderWidth: 1, borderColor: 'rgba(90,122,80,0.3)',
    borderRadius: 6, paddingHorizontal: 16, paddingVertical: 8,
    marginBottom: 32,
  },
  connectedText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 11,
    color: C.success,
  },
});

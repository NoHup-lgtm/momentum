import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Dimensions, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { C } from '../../constants/design';
import { SpiralIcon, GitHubIcon } from '../../components/icons';
import PixelAvatar from '../../components/avatar/PixelAvatar';

const { width: W } = Dimensions.get('window');

// ── Mock GitHub profile ───────────────────────────────────────────────────────
const GH_PROFILE = { username: 'dev_marcos', name: 'Marcos Silva', repos: 42, avatarVariant: 0 };

type Step = 'welcome' | 'permissions' | 'connected';

export default function OnboardingScreen() {
  const [step, setStep] = useState<Step>('welcome');
  const next = () => {
    if (step === 'welcome')     setStep('permissions');
    else if (step === 'permissions') setStep('connected');
    else router.replace('/(tabs)');
  };
  return (
    <>
      {step === 'welcome'     && <StepWelcome onContinue={next} />}
      {step === 'permissions' && <StepPermissions onContinue={next} />}
      {step === 'connected'   && <StepConnected profile={GH_PROFILE} onContinue={next} />}
    </>
  );
}

// ── Step 0: Welcome ───────────────────────────────────────────────────────────
function StepWelcome({ onContinue }: { onContinue: () => void }) {
  const [loading, setLoading] = useState(false);
  const connect = () => { setLoading(true); setTimeout(onContinue, 1100); };

  return (
    <View style={s.screen}>
      {/* Watermark */}
      <View style={s.watermark} pointerEvents="none">
        <SpiralIcon size={360} color={C.text} />
      </View>

      <View style={s.center}>
        <SpiralIcon size={64} />

        <Text style={s.title}>momentum</Text>
        <Text style={s.subtitle}>feito de dias imperfeitos.</Text>

        <Text style={s.body}>
          Cada commit que você faz vira streak, XP e rank.{'\n'}
          Compita com sua squad. Não quebre a ofensiva.
        </Text>

        <TouchableOpacity
          style={[s.btn, s.btnPrimary]}
          onPress={connect}
          activeOpacity={0.8}
          disabled={loading}
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

        <Text style={s.hint}>momentum vive dos seus commits</Text>
      </View>
    </View>
  );
}

// ── Step 1: Permissions ───────────────────────────────────────────────────────
const PERMS = [
  { icon: '👁', label: 'Ler seus eventos públicos do GitHub' },
  { icon: '🔒', label: 'Acessar repositórios privados (opcional)' },
  { icon: '🚫', label: 'Nunca escrever, nunca fazer push' },
];

function StepPermissions({ onContinue }: { onContinue: () => void }) {
  const [loading, setLoading] = useState(false);
  const authorize = () => { setLoading(true); setTimeout(onContinue, 1200); };

  return (
    <View style={s.screen}>
      <View style={s.center}>
        <Text style={s.stepLabel}>passo 2 de 3</Text>
        <Text style={s.titleMd}>O que o momentum acessa</Text>

        <View style={{ width: '100%', gap: 12, marginBottom: 36 }}>
          {PERMS.map((p, i) => (
            <View key={i} style={s.permRow}>
              <Text style={{ fontSize: 18 }}>{p.icon}</Text>
              <Text style={s.permText}>{p.label}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[s.btn, s.btnPrimary]}
          onPress={authorize}
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
            <View style={s.row}>
              <ActivityIndicator size="small" color="#f2e4cf" />
              <Text style={[s.btnText, { marginLeft: 9 }]}>Autorizando…</Text>
            </View>
          ) : (
            <Text style={s.btnText}>Autorizar com GitHub →</Text>
          )}
        </TouchableOpacity>

        <Text style={s.hint}>acesso de leitura apenas · revogue a qualquer momento</Text>
      </View>
    </View>
  );
}

// ── Step 2: Connected ─────────────────────────────────────────────────────────
function StepConnected({ profile, onContinue }: {
  profile: typeof GH_PROFILE;
  onContinue: () => void;
}) {
  return (
    <View style={s.screen}>
      <View style={s.center}>
        <Text style={s.stepLabel}>passo 3 de 3</Text>

        {/* Avatar */}
        <View style={s.avatarWrap}>
          <View style={s.avatarRing}>
            <PixelAvatar size={80} variant={profile.avatarVariant} />
          </View>
          <View style={s.onlineDot} />
        </View>

        <Text style={s.titleMd}>{profile.name}</Text>
        <Text style={s.ghLogin}>@{profile.username}</Text>
        <Text style={s.ghSub}>{profile.repos} repositórios · GitHub conectado ✓</Text>

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
  title: {
    fontFamily: 'Lora_400Regular', fontSize: 34,
    color: C.text, marginTop: 20, marginBottom: 8,
    letterSpacing: -0.5,
  },
  titleMd: {
    fontFamily: 'Lora_400Regular', fontSize: 24,
    color: C.text, marginBottom: 24, textAlign: 'center',
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
  row: { flexDirection: 'row', alignItems: 'center' },
  permRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.surface2,
    borderRadius: 8, padding: 14,
  },
  permText: { fontSize: 13, color: C.text2, flex: 1, lineHeight: 20 },
  avatarWrap: { position: 'relative', marginBottom: 20 },
  avatarRing: {
    width: 88, height: 88, borderRadius: 44,
    borderWidth: 2, borderColor: C.accent,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.surface,
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5, shadowRadius: 16,
  },
  onlineDot: {
    position: 'absolute', bottom: 2, right: 2,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: C.success,
    borderWidth: 2.5, borderColor: C.bg,
  },
  ghLogin: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 13,
    color: C.text3, marginBottom: 4,
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

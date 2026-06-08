import React, { useEffect, useState } from 'react';
import { Platform, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme, type ThemeColors } from '../contexts/ThemeContext';
import { useLang } from '../lib/i18n';
import { useAppStore } from '../store/app';
import { isPushSupported, pushState, enablePush } from '../lib/push';

// Destaque "ativar notificações" logo após o login. Só no web, quando o usuário
// está logado, o push é suportado e a permissão ainda não foi pedida. Dispensável.
const DISMISS_KEY = 'momentum.notify_dismissed';
const w: any = typeof globalThis !== 'undefined' ? globalThis : {};

export default function NotifyPrompt() {
  const { colors: c } = useTheme();
  const lang = useLang();
  const s = makeStyles(c);
  const user = useAppStore((st) => st.user);

  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const pt = lang === 'pt';

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (!user) return; // só depois de logado
    if (!isPushSupported() || pushState() !== 'default') return;
    try {
      if (w.localStorage?.getItem(DISMISS_KEY)) return;
    } catch {}
    setShow(true);
  }, [user]);

  if (Platform.OS !== 'web' || !show) return null;

  const dismiss = () => {
    try {
      w.localStorage?.setItem(DISMISS_KEY, '1');
    } catch {}
    setShow(false);
  };

  const activate = async () => {
    setBusy(true);
    try {
      await enablePush();
    } finally {
      setBusy(false);
      dismiss();
    }
  };

  return (
    <View style={s.wrap}>
      <Text style={s.emoji}>🔔</Text>
      <View style={{ flex: 1 }}>
        <Text style={s.title}>{pt ? 'ative as notificações' : 'turn on notifications'}</Text>
        <Text style={s.body}>
          {pt
            ? 'lembramos você às 20h se faltar o commit do dia — não perca a ofensiva.'
            : "we'll remind you at 8pm if you haven't committed — keep the streak alive."}
        </Text>
      </View>
      <TouchableOpacity style={s.btn} onPress={activate} disabled={busy} activeOpacity={0.85}>
        {busy ? (
          <ActivityIndicator size="small" color="#f2e4cf" />
        ) : (
          <Text style={s.btnTxt}>{pt ? 'ativar' : 'enable'}</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={dismiss} style={s.close} hitSlop={10}>
        <Text style={s.closeTxt}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    wrap: {
      position: 'absolute',
      top: 8,
      left: 12,
      right: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.accent + '55',
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 14,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 12,
      maxWidth: 520,
      alignSelf: 'center',
      zIndex: 50,
    },
    emoji: { fontSize: 22 },
    title: { fontFamily: 'JetBrainsMono_700Bold', fontSize: 12, color: c.text },
    body: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, color: c.text3, marginTop: 2, lineHeight: 14 },
    btn: { backgroundColor: c.accent, borderRadius: 7, paddingVertical: 8, paddingHorizontal: 14, minHeight: 34, justifyContent: 'center' },
    btnTxt: { fontFamily: 'JetBrainsMono_700Bold', fontSize: 11, color: '#f2e4cf' },
    close: { padding: 4, marginLeft: 2 },
    closeTxt: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 13, color: c.text3 },
  });

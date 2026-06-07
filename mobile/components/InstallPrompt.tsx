import React, { useEffect, useState } from 'react';
import { Platform, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, type ThemeColors } from '../contexts/ThemeContext';
import { useLang } from '../lib/i18n';

// Banner de "instalar como app" — só no WEB (PWA). No iOS/Android nativo não
// renderiza nada. Some quando já está instalado (standalone) ou dispensado.
const DISMISS_KEY = 'momentum.install_dismissed';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

// acesso seguro aos globais do navegador (não existem no nativo)
const w: any = typeof globalThis !== 'undefined' ? globalThis : {};

function isStandalone(): boolean {
  try {
    return (
      !!w.matchMedia?.('(display-mode: standalone)')?.matches ||
      w.navigator?.standalone === true
    );
  } catch {
    return false;
  }
}

function isIOS(): boolean {
  try {
    const ua = w.navigator?.userAgent || '';
    return /iphone|ipad|ipod/i.test(ua) && !/(crios|fxios|edgios)/i.test(ua);
    // (no iOS só o Safari instala PWA — Chrome/Firefox no iPhone não mostram a opção)
  } catch {
    return false;
  }
}

export default function InstallPrompt() {
  const { colors: c } = useTheme();
  const lang = useLang();
  const s = makeStyles(c);

  const [show, setShow] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const ios = isIOS();

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (isStandalone()) return; // já instalado
    try {
      if (w.localStorage?.getItem(DISMISS_KEY)) return; // já dispensou
    } catch {}

    // iOS: não tem prompt programático → mostramos instruções.
    if (ios) {
      setShow(true);
      return;
    }

    // Android/desktop Chrome: captura o evento e mostra botão "instalar".
    const onBIP = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setShow(true);
    };
    w.addEventListener?.('beforeinstallprompt', onBIP);
    return () => w.removeEventListener?.('beforeinstallprompt', onBIP);
  }, [ios]);

  if (Platform.OS !== 'web' || !show) return null;

  const dismiss = () => {
    try {
      w.localStorage?.setItem(DISMISS_KEY, '1');
    } catch {}
    setShow(false);
  };

  const install = async () => {
    if (!deferred) return;
    try {
      await deferred.prompt();
      await deferred.userChoice;
    } catch {}
    dismiss();
  };

  const pt = lang === 'pt';

  return (
    <View style={s.wrap}>
      <Text style={s.emoji}>📲</Text>
      <View style={{ flex: 1 }}>
        <Text style={s.title}>{pt ? 'instale o momentum' : 'install momentum'}</Text>
        <Text style={s.body}>
          {ios
            ? pt
              ? 'toque em Compartilhar e depois "Adicionar à Tela de Início"'
              : 'tap Share, then "Add to Home Screen"'
            : pt
              ? 'adicione à tela inicial e use como um app'
              : 'add to home screen and use it like an app'}
        </Text>
      </View>
      {!ios && (
        <TouchableOpacity style={s.btn} onPress={install} activeOpacity={0.85}>
          <Text style={s.btnTxt}>{pt ? 'instalar' : 'install'}</Text>
        </TouchableOpacity>
      )}
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
      bottom: 20,
      left: 12,
      right: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.surface2,
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
    },
    emoji: { fontSize: 22 },
    title: { fontFamily: 'JetBrainsMono_700Bold', fontSize: 12, color: c.text },
    body: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, color: c.text3, marginTop: 2, lineHeight: 14 },
    btn: {
      backgroundColor: c.accent,
      borderRadius: 7,
      paddingVertical: 8,
      paddingHorizontal: 14,
    },
    btnTxt: { fontFamily: 'JetBrainsMono_700Bold', fontSize: 11, color: '#f2e4cf' },
    close: { padding: 4, marginLeft: 2 },
    closeTxt: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 13, color: c.text3 },
  });

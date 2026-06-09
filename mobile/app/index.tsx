import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { fetchMe, meToStoreUser, hasStoredSession } from '../lib/session';
import { useAppStore } from '../store/app';

// Reidrata a sessão: se houver token válido vai pras tabs, senão pro onboarding.
export default function Index() {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const setUser = useAppStore((s) => s.setUser);
  const { colors: c } = useTheme();

  useEffect(() => {
    (async () => {
      try {
        // Sem token salvo → vai direto pro login, sem bater no servidor.
        if (!(await hasStoredSession())) return;
        const me = await fetchMe();
        if (me) {
          setUser(meToStoreUser(me));
          setAuthed(true);
        }
      } finally {
        setReady(true);
      }
    })();
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={c.accent} />
      </View>
    );
  }

  return <Redirect href={authed ? '/(tabs)' : '/(auth)'} />;
}

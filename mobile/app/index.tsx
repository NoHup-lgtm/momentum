import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { C } from '../constants/design';
import { checkSession, authToStoreUser } from '../lib/session';
import { useAppStore } from '../store/app';

// Reidrata a sessão: se houver token válido vai pras tabs, senão pro onboarding.
export default function Index() {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const setUser = useAppStore((s) => s.setUser);

  useEffect(() => {
    (async () => {
      try {
        const user = await checkSession();
        if (user) {
          setUser(authToStoreUser(user));
          setAuthed(true);
        }
      } finally {
        setReady(true);
      }
    })();
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={C.accent} />
      </View>
    );
  }

  return <Redirect href={authed ? '/(tabs)' : '/(auth)'} />;
}

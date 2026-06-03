import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import { useTheme, type ThemeColors, type ThemeMode } from '../contexts/ThemeContext';
import { useT, useLang, useSetLang } from '../lib/i18n';
import { logout } from '../lib/session';
import { useAppStore } from '../store/app';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const t = useT().settings;
  const lang = useLang();
  const setLang = useSetLang();
  const clearUser = useAppStore((st) => st.clearUser);
  const { colors: c, mode, setMode } = useTheme();
  const s = makeStyles(c);

  async function handleLogout() {
    await logout();
    clearUser();
    router.replace('/(auth)');
  }

  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} hitSlop={10}>
          <Text style={s.back}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>{t.title}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Idioma */}
        <Text style={s.section}>{t.language}</Text>
        <View style={s.card}>
          <View style={s.segment}>
            {(['pt', 'en'] as const).map((l) => (
              <TouchableOpacity
                key={l}
                style={[s.segBtn, lang === l && s.segBtnOn]}
                onPress={() => setLang(l)}
              >
                <Text style={[s.segTxt, lang === l && s.segTxtOn]}>
                  {l === 'pt' ? 'Português' : 'English'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Aparência */}
        <Text style={s.section}>{t.appearance}</Text>
        <View style={s.card}>
          <Text style={s.rowLabel}>{t.theme}</Text>
          <View style={[s.segment, { marginTop: 10 }]}>
            {(['dark', 'light'] as const).map((m: ThemeMode) => (
              <TouchableOpacity
                key={m}
                style={[s.segBtn, mode === m && s.segBtnOn]}
                onPress={() => setMode(m)}
              >
                <Text style={[s.segTxt, mode === m && s.segTxtOn]}>
                  {m === 'dark' ? t.dark : t.light}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Conta */}
        <Text style={s.section}>{t.account}</Text>
        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
          <Text style={s.logoutTxt}>{t.logout}</Text>
        </TouchableOpacity>

        <Text style={s.version}>momentum · {t.version} {version}</Text>
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  backBtn: { width: 24 },
  back: { fontSize: 24, color: c.text },
  title: { fontFamily: 'Lora_400Regular', fontSize: 20, color: c.text },
  content: { paddingHorizontal: 20, paddingTop: 8 },
  section: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, letterSpacing: 0.1,
    textTransform: 'uppercase', color: c.text3, marginTop: 22, marginBottom: 10,
  },
  card: {
    backgroundColor: c.surface, borderWidth: 1, borderColor: c.surface2,
    borderRadius: 12, padding: 14,
  },
  segment: { flexDirection: 'row', gap: 6 },
  segBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 11, borderRadius: 8,
    backgroundColor: c.surface2,
  },
  segBtnOn: { backgroundColor: c.accent },
  segTxt: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 13, color: c.text3 },
  segTxtOn: { color: '#f2e4cf' },
  rowLabel: { fontSize: 14, color: c.text },
  logoutBtn: {
    alignItems: 'center', paddingVertical: 14, borderRadius: 10,
    borderWidth: 1, borderColor: c.danger + '55', backgroundColor: c.danger + '12',
  },
  logoutTxt: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 13, color: c.danger },
  version: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, color: c.text3,
    textAlign: 'center', marginTop: 40,
  },
});

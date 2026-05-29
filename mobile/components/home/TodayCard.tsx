import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { C } from '../../constants/design';

const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178c6', Python: '#3572a5', Rust: '#dea584',
  Go: '#00add8', JavaScript: '#f1e05a', Swift: '#fa7343',
  Kotlin: '#a97bff', CSS: '#563d7c',
};

const TODAY_COMMITS = [
  { repo: 'momentum/mobile',   lang: 'TypeScript', commits: 4, time: '18:42' },
  { repo: 'dev-k/api-server',  lang: 'Python',     commits: 2, time: '14:11' },
  { repo: 'dev-k/dotfiles',    lang: 'TypeScript', commits: 1, time: '09:05' },
];

export default function TodayCard() {
  const total = TODAY_COMMITS.reduce((s, r) => s + r.commits, 0);

  return (
    <View style={s.card}>
      <View style={s.header}>
        <Text style={s.title}>hoje no github</Text>
        <View style={s.totalBadge}>
          <Text style={s.totalText}>{total} commits</Text>
        </View>
      </View>

      {TODAY_COMMITS.map((r, i) => (
        <View key={i} style={[s.row, i < TODAY_COMMITS.length - 1 && s.rowBorder]}>
          <View style={[s.langDot, { backgroundColor: LANG_COLORS[r.lang] ?? C.text3 }]} />
          <Text style={s.repoName} numberOfLines={1}>{r.repo}</Text>
          <Text style={s.time}>{r.time}</Text>
          <View style={s.commitPill}>
            <Text style={s.commitCount}>+{r.commits}</Text>
          </View>
        </View>
      ))}

      <View style={s.syncRow}>
        <View style={s.syncDot} />
        <Text style={s.syncText}>sincronizado agora · github.com/araujo</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: C.surface, borderRadius: 12,
    borderWidth: 1, borderColor: C.surface2,
    padding: 14,
  },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 12,
  },
  title: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 10,
    color: C.text3, textTransform: 'lowercase', letterSpacing: 0.05,
  },
  totalBadge: {
    backgroundColor: C.success + '18', borderRadius: 4,
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: C.success + '35',
  },
  totalText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, color: C.success,
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    gap: 8, paddingVertical: 7,
  },
  rowBorder: {
    borderBottomWidth: 1, borderBottomColor: C.surface2,
  },
  langDot: {
    width: 8, height: 8, borderRadius: 4,
  },
  repoName: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 11,
    color: C.text2, flex: 1,
  },
  time: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 9, color: C.text3,
  },
  commitPill: {
    backgroundColor: C.accent + '15', borderRadius: 4,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  commitCount: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, color: C.accent,
  },
  syncRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10,
  },
  syncDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: C.success,
  },
  syncText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 9, color: C.text3,
  },
});

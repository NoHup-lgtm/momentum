import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { C } from '../../constants/design';

type Commit = { repo: string; count: number };

export default function TodayCard({
  commits = [],
  username,
}: {
  commits?: Commit[];
  username?: string;
}) {
  const total = commits.reduce((sum, r) => sum + r.count, 0);

  return (
    <View style={s.card}>
      <View style={s.header}>
        <Text style={s.title}>hoje no github</Text>
        <View style={s.totalBadge}>
          <Text style={s.totalText}>{total} commits</Text>
        </View>
      </View>

      {commits.length === 0 ? (
        <Text style={s.empty}>nenhum commit hoje ainda</Text>
      ) : (
        commits.map((r, i) => (
          <View key={i} style={[s.row, i < commits.length - 1 && s.rowBorder]}>
            <View style={[s.langDot, { backgroundColor: C.accent }]} />
            <Text style={s.repoName} numberOfLines={1}>{r.repo}</Text>
            <View style={s.commitPill}>
              <Text style={s.commitCount}>+{r.count}</Text>
            </View>
          </View>
        ))
      )}

      <View style={s.syncRow}>
        <View style={s.syncDot} />
        <Text style={s.syncText}>
          sincronizado agora{username ? ` · github.com/${username}` : ''}
        </Text>
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
  empty: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 11,
    color: C.text3, paddingVertical: 8,
  },
});

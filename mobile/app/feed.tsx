import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { C, getRank, type RankId } from '../constants/design';
import { AvatarRing } from '../components/ui';
import RankEmblem from '../components/rank/RankEmblem';

type EventType = 'rankup' | 'achievement' | 'streak' | 'top1' | 'milestone';

interface FeedItem {
  id: string;
  username: string;
  name: string;
  avatarVariant: number;
  rankId: RankId;
  type: EventType;
  text: string;
  time: string;
  likes: number;
  liked: boolean;
  meta?: { fromRank?: RankId; toRank?: RankId; achievement?: string };
}

const FEED_DATA: FeedItem[] = [
  {
    id: 'f1', username: 'dev_k', name: 'Kauã Dev', avatarVariant: 2, rankId: 'deploy',
    type: 'rankup', text: 'subiu para rank Deploy',
    time: '2h atrás', likes: 8, liked: false,
    meta: { fromRank: 'build', toRank: 'deploy' },
  },
  {
    id: 'f2', username: 'carol_v', name: 'Carol V.', avatarVariant: 4, rankId: 'build',
    type: 'achievement', text: 'desbloqueou Centurião · 100 commits',
    time: '4h atrás', likes: 12, liked: true,
    meta: { achievement: '💯' },
  },
  {
    id: 'f3', username: 'moyza', name: 'Moyza', avatarVariant: 1, rankId: 'init',
    type: 'streak', text: 'chegou a 30 dias de ofensiva 🔥',
    time: '6h atrás', likes: 5, liked: false,
  },
  {
    id: 'f4', username: 'jota', name: 'João T.', avatarVariant: 5, rankId: 'build',
    type: 'top1', text: 'foi Top 1 da liga essa semana 🏆',
    time: '1d atrás', likes: 20, liked: false,
  },
  {
    id: 'f5', username: 'cata', name: 'Catarina', avatarVariant: 3, rankId: 'init',
    type: 'achievement', text: 'desbloqueou Pioneiro · primeiro commit da semana',
    time: '1d atrás', likes: 3, liked: false,
    meta: { achievement: '🌄' },
  },
  {
    id: 'f6', username: 'dev_k', name: 'Kauã Dev', avatarVariant: 2, rankId: 'deploy',
    type: 'streak', text: '21 dias consecutivos · sem pausar',
    time: '2d atrás', likes: 9, liked: false,
  },
  {
    id: 'f7', username: 'ana_lima', name: 'Ana Lima', avatarVariant: 0, rankId: 'init',
    type: 'milestone', text: 'concluiu milestone "Setup inicial"',
    time: '3d atrás', likes: 4, liked: false,
  },
  {
    id: 'f8', username: 'carol_v', name: 'Carol V.', avatarVariant: 4, rankId: 'build',
    type: 'rankup', text: 'subiu para rank Build',
    time: '5d atrás', likes: 15, liked: false,
    meta: { fromRank: 'init', toRank: 'build' },
  },
];

const FILTER_TABS = ['tudo', 'ranks', 'conquistas', 'milestones'] as const;
type Filter = typeof FILTER_TABS[number];

const TYPE_FILTER: Record<Filter, EventType[] | null> = {
  tudo: null,
  ranks: ['rankup'],
  conquistas: ['achievement'],
  milestones: ['milestone', 'top1', 'streak'],
};

const TYPE_COLOR: Record<EventType, string> = {
  rankup:      C.gold,
  achievement: C.purple,
  streak:      C.accent,
  top1:        C.gold,
  milestone:   C.success,
};

const TYPE_LABEL: Record<EventType, string> = {
  rankup:      'rank up',
  achievement: 'conquista',
  streak:      'streak',
  top1:        'top 1',
  milestone:   'milestone',
};

function FeedCard({ item, onLike }: { item: FeedItem; onLike: (id: string) => void }) {
  const [copied, setCopied] = useState(false);
  const rank = getRank(item.rankId);
  const typeColor = TYPE_COLOR[item.type];

  const share = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <View style={s.card}>
      {/* Top: avatar + name + time */}
      <View style={s.cardTop}>
        <TouchableOpacity onPress={() => router.push('/user-profile')}>
          <AvatarRing size={38} variant={item.avatarVariant} rankId={item.rankId} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={s.cardName}>{item.name}</Text>
            <View style={[s.typePill, { backgroundColor: typeColor + '20', borderColor: typeColor + '40' }]}>
              <Text style={[s.typeText, { color: typeColor }]}>{TYPE_LABEL[item.type]}</Text>
            </View>
          </View>
          <Text style={s.cardTime}>{item.time}</Text>
        </View>
      </View>

      {/* Event content */}
      <View style={s.cardBody}>
        {item.type === 'rankup' && item.meta?.toRank && (
          <View style={s.rankupRow}>
            {item.meta.fromRank && <RankEmblem rankId={item.meta.fromRank} size={32} />}
            <Text style={s.rankupArrow}>→</Text>
            <RankEmblem rankId={item.meta.toRank} size={40} glowing />
          </View>
        )}
        {item.type === 'achievement' && item.meta?.achievement && (
          <Text style={s.achieveEmoji}>{item.meta.achievement}</Text>
        )}
        <Text style={s.cardText}>
          <Text style={s.cardNameInline}>{item.username} </Text>
          {item.text}
        </Text>
      </View>

      {/* Actions */}
      <View style={s.cardActions}>
        <TouchableOpacity style={s.actionBtn} onPress={() => onLike(item.id)}>
          <Text style={[s.actionIcon, item.liked && { color: C.accent }]}>
            {item.liked ? '♥' : '♡'}
          </Text>
          <Text style={[s.actionText, item.liked && { color: C.accent }]}>{item.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.actionBtn} onPress={share}>
          <Text style={s.actionIcon}>↗</Text>
          <Text style={s.actionText}>{copied ? 'copiado' : 'compartilhar'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function FeedScreen() {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<Filter>('tudo');
  const [items, setItems] = useState(FEED_DATA);

  const toggleLike = (id: string) => {
    setItems(prev => prev.map(item =>
      item.id === id
        ? { ...item, liked: !item.liked, likes: item.liked ? item.likes - 1 : item.likes + 1 }
        : item
    ));
  };

  const filtered = filter === 'tudo'
    ? items
    : items.filter(it => TYPE_FILTER[filter]?.includes(it.type));

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>feed</Text>
      </View>

      {/* Filter tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabRow} contentContainerStyle={{ paddingHorizontal: 18, gap: 6 }}>
        {FILTER_TABS.map(f => (
          <TouchableOpacity
            key={f}
            style={[s.tab, filter === f && s.tabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[s.tabText, filter === f && s.tabTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
        {filtered.map(item => (
          <FeedCard key={item.id} item={item} onLike={toggleLike} />
        ))}
        {filtered.length === 0 && (
          <Text style={s.emptyText}>nenhuma novidade aqui ainda.</Text>
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: C.bg },
  content: { paddingHorizontal: 18, gap: 12 },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 18, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: C.surface2,
  },
  backBtn:  { padding: 4, marginRight: 8 },
  backText: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 20, color: C.text2 },
  title:    { fontFamily: 'Lora_400Regular', fontSize: 20, color: C.text },

  tabRow: { marginBottom: 4, paddingVertical: 10 },
  tab: {
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 6, backgroundColor: C.surface,
    borderWidth: 1, borderColor: C.surface2,
  },
  tabActive: { borderColor: C.accent, backgroundColor: C.accent + '15' },
  tabText:     { fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, color: C.text3 },
  tabTextActive: { color: C.accent },

  card: {
    backgroundColor: C.surface, borderRadius: 12,
    borderWidth: 1, borderColor: C.surface2, overflow: 'hidden',
  },
  cardTop: {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, paddingBottom: 0,
  },
  cardName: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: C.text },
  cardTime: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 9, color: C.text3, marginTop: 2 },
  typePill: {
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 4, borderWidth: 1,
  },
  typeText: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 8 },

  cardBody: { padding: 12, gap: 8 },
  rankupRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rankupArrow: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 18, color: C.text3 },
  achieveEmoji: { fontSize: 32 },
  cardText: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: C.text2, lineHeight: 18 },
  cardNameInline: { color: C.text, fontFamily: 'JetBrainsMono_400Regular' },

  cardActions: {
    flexDirection: 'row', borderTopWidth: 1, borderTopColor: C.surface2,
  },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, paddingVertical: 10,
  },
  actionIcon: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 14, color: C.text3 },
  actionText: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, color: C.text3 },

  emptyText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 12,
    color: C.text3, textAlign: 'center', marginTop: 48,
  },
});

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { C } from '../constants/design';
import {
  LightningIcon, TrophyIcon, IceIcon, ShieldIcon, ProcessorIcon,
  InfinityPixelIcon, StarburstIcon, SunriseIcon, MoonIcon, CrownIcon,
  FlameIcon, SpiralIcon, LockIcon,
} from '../components/icons';

const ACHIEVEMENTS = [
  { id: 'faisca',     label: 'Faisca',      desc: '7 dias seguidos',          icon: 'lightning', earned: true,  progress: 7,   goal: 7   },
  { id: 'centuriao',  label: 'Centuriao',   desc: '100 commits realizados',   icon: 'star',      earned: true,  progress: 100, goal: 100 },
  { id: 'constante',  label: 'Constante',   desc: '30 dias de streak',        icon: 'flame',     earned: true,  progress: 30,  goal: 30  },
  { id: 'top1',       label: 'Top 1',       desc: 'Semana #1 na liga',        icon: 'trophy',    earned: true,  progress: 1,   goal: 1   },
  { id: 'pioneiro',   label: 'Pioneiro',    desc: 'Primeiro commit da semana',icon: 'sunrise',   earned: true,  progress: 1,   goal: 1   },
  { id: 'fundador',   label: 'Fundador',    desc: 'Criou uma squad',          icon: 'shield',    earned: true,  progress: 1,   goal: 1   },
  { id: 'madrugador', label: 'Madrugador',  desc: 'Commit antes das 7h',      icon: 'moon',      earned: true,  progress: 1,   goal: 1   },
  { id: 'arquiteto',  label: 'Arquiteto',   desc: 'Alcancou rank Architect',  icon: 'processor', earned: true,  progress: 1,   goal: 1   },
  { id: 'inabalavelx',label: 'Inabalavel',  desc: '100 dias de streak',       icon: 'ice',       earned: false, progress: 14,  goal: 100, how: 'Mantenha 100 dias seguidos sem quebrar a ofensiva' },
  { id: 'infinito',   label: 'Infinito',    desc: '365 dias de streak',       icon: 'infinity',  earned: false, progress: 14,  goal: 365, how: 'Um ano inteiro. Possivel, mas raro' },
  { id: 'eletrico',   label: 'Eletrico',    desc: '10 commits em um dia',     icon: 'lightning', earned: false, progress: 4,   goal: 10,  how: 'Faca 10 commits em um unico dia' },
  { id: 'lenda',      label: 'Lenda Viva',  desc: 'Alcance o rank Legend',    icon: 'spiral',    earned: false, progress: 0,   goal: 1,   how: 'Chegue ao topo do ranking semanal por 4 semanas consecutivas' },
  { id: 'mestre',     label: 'Mestre',      desc: '1000 commits totais',      icon: 'crown',     earned: false, progress: 284, goal: 1000, how: 'Acumule 1000 commits no app' },
  { id: 'noturno',    label: 'Noturno',     desc: 'Commit entre 0h-4h',       icon: 'moon',      earned: false, progress: 0,   goal: 1,   how: 'Faca um commit entre meia-noite e 4h da manha' },
];

function AchievementIcon({ id, size = 28, dim = false }: { id: string; size?: number; dim?: boolean }) {
  const color = dim ? C.text3 + '70' : undefined;
  const icons: Record<string, React.ReactNode> = {
    lightning:  <LightningIcon size={size} color={color ?? '#ffd97a'} />,
    star:       <StarburstIcon size={size} color={color ?? C.gold} />,
    flame:      <FlameIcon size={size} glowing={!dim} />,
    trophy:     <TrophyIcon size={size} color={color ?? C.gold} />,
    sunrise:    <SunriseIcon size={size} color={color ?? C.accent} />,
    shield:     <ShieldIcon size={size} color={color ?? C.purple} />,
    moon:       <MoonIcon size={size} color={color ?? '#c8b8f0'} />,
    processor:  <ProcessorIcon size={size} color={color ?? '#3a82f7'} />,
    ice:        <IceIcon size={size} color={color ?? '#7ab4e8'} />,
    infinity:   <InfinityPixelIcon size={size} color={color ?? C.text2} />,
    spiral:     <SpiralIcon size={size} color={color ?? C.accent} />,
    crown:      <CrownIcon size={size} color={color ?? C.gold} />,
  };
  return <>{icons[id] ?? <StarburstIcon size={size} color={color ?? C.gold} />}</>;
}

export default function AchievementsScreen() {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<typeof ACHIEVEMENTS[0] | null>(null);

  const earned = ACHIEVEMENTS.filter(a => a.earned);
  const locked  = ACHIEVEMENTS.filter(a => !a.earned);

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>conquistas</Text>
        <Text style={s.count}>{earned.length}/{ACHIEVEMENTS.length}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
        {/* Earned */}
        <Text style={s.sectionTitle}>conquistadas · {earned.length}</Text>
        <View style={s.grid}>
          {earned.map(a => (
            <TouchableOpacity key={a.id} style={s.badge} onPress={() => setSelected(a)} activeOpacity={0.8}>
              <AchievementIcon id={a.icon} size={28} />
              <Text style={s.badgeLabel}>{a.label}</Text>
              <Text style={s.badgeDesc} numberOfLines={2}>{a.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Locked */}
        <Text style={[s.sectionTitle, { marginTop: 8 }]}>bloqueadas · {locked.length}</Text>
        {locked.map(a => (
          <TouchableOpacity key={a.id} style={s.lockedRow} onPress={() => setSelected(a)} activeOpacity={0.8}>
            <View style={s.lockedIconWrap}>
              <AchievementIcon id={a.icon} size={28} dim />
              <View style={s.lockOverlayIcon}><LockIcon size={12} color={C.text3} /></View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.badgeLabel, { opacity: 0.5 }]}>{a.label}</Text>
              <Text style={[s.badgeDesc, { opacity: 0.45 }]}>{a.desc}</Text>
              {/* Progress bar */}
              <View style={s.progressTrack}>
                <View style={[s.progressFill, { width: `${Math.min(100, (a.progress / a.goal) * 100)}%` as any }]} />
              </View>
              <Text style={s.progressText}>{a.progress} / {a.goal}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Detail modal */}
      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <TouchableOpacity style={s.modalBackdrop} activeOpacity={1} onPress={() => setSelected(null)}>
          <View style={s.modalSheet}>
            {selected && (
              <>
                <View style={{ marginBottom: 4 }}>
                  <AchievementIcon id={selected.icon} size={52} dim={!selected.earned} />
                </View>
                <Text style={s.modalTitle}>{selected.label}</Text>
                <Text style={s.modalDesc}>{selected.desc}</Text>
                {selected.earned ? (
                  <View style={s.earnedBadge}>
                    <Text style={s.earnedBadgeText}>conquista desbloqueada</Text>
                  </View>
                ) : (
                  <>
                    <View style={s.progressTrack}>
                      <View style={[s.progressFill, { width: `${Math.min(100, (selected.progress / selected.goal) * 100)}%` as any }]} />
                    </View>
                    <Text style={s.progressText}>{selected.progress} / {selected.goal}</Text>
                    <Text style={s.howToText}>{(selected as any).how}</Text>
                  </>
                )}
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const BADGE_W = (Dimensions.get('window').width - 18 * 2 - 10) / 2;

const s = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: C.bg },
  content: { paddingHorizontal: 18, gap: 12 },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 18, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: C.surface2,
  },
  backBtn: { padding: 4, marginRight: 8 },
  backText: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 20, color: C.text2 },
  title: { fontFamily: 'Lora_400Regular', fontSize: 20, color: C.text, flex: 1 },
  count:  { fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: C.text3 },

  sectionTitle: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 10,
    color: C.text3, textTransform: 'lowercase',
  },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badge: {
    width: BADGE_W, backgroundColor: C.surface,
    borderRadius: 12, borderWidth: 1, borderColor: C.surface2,
    padding: 14, alignItems: 'center', gap: 4,
  },
  badgeLabel: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: C.text, textAlign: 'center' },
  badgeDesc:  { fontFamily: 'JetBrainsMono_400Regular', fontSize: 9, color: C.text3, textAlign: 'center' },

  lockedRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.surface, borderRadius: 10,
    borderWidth: 1, borderColor: C.surface2, padding: 12,
  },
  lockedIconWrap: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  lockOverlayIcon: { position: 'absolute', bottom: 0, right: 0 },

  progressTrack: {
    height: 3, backgroundColor: C.surface2, borderRadius: 2,
    overflow: 'hidden', marginTop: 6,
  },
  progressFill: { height: '100%', backgroundColor: C.accent, borderRadius: 2 },
  progressText: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 9, color: C.text3, marginTop: 3 },

  modalBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: C.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    borderWidth: 1, borderColor: C.surface2,
    padding: 28, alignItems: 'center', gap: 10,
  },
  modalTitle: { fontFamily: 'Lora_400Regular', fontSize: 22, color: C.text },
  modalDesc:  { fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: C.text3, textAlign: 'center' },
  earnedBadge: {
    backgroundColor: C.success + '20', borderRadius: 6,
    paddingHorizontal: 16, paddingVertical: 8,
    borderWidth: 1, borderColor: C.success + '40',
  },
  earnedBadgeText: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: C.success },
  howToText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 11,
    color: C.text2, textAlign: 'center', lineHeight: 18,
  },
});

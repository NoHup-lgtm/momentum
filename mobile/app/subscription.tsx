import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Dimensions, Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { C } from '../constants/design';
import { useTheme, PlanType } from '../contexts/ThemeContext';
import {
  SpiralIcon, IceIcon, GemIcon, TrophyIcon, ShieldIcon,
  LightningIcon, CrownIcon, ProcessorIcon, StarburstIcon,
} from '../components/icons';

const { width: W } = Dimensions.get('window');

type Plan = 'pro' | 'max';
type Billing = 'monthly' | 'annual';

// ── Benefit definitions ───────────────────────────────────────────────────────
const PRO_BENEFITS = [
  { icon: 'ice',       text: 'Freezes ilimitados de streak',       sub: 'nunca perca sua ofensiva' },
  { icon: 'gem',       text: '30 gems por mês incluídas',          sub: 'use na loja premium'      },
  { icon: 'trophy',    text: '1 baú épico por mês garantido',      sub: 'itens exclusivos'         },
  { icon: 'lightning', text: 'Desafios bônus (+3 por dia)',         sub: 'mais XP, mais moedas'    },
  { icon: 'spiral',    text: 'Analytics pessoal avançado',         sub: 'padrões, horários, repos' },
  { icon: 'star',      text: '20% de desconto na loja',            sub: 'em todos os itens'        },
  { icon: 'shield',    text: 'Badge PRO no perfil',                sub: 'visível para todos'       },
  { icon: 'crown',     text: 'Heatmap de 1 ano',                   sub: '52 semanas de histórico'  },
];

const MAX_BENEFITS = [
  { icon: 'ice',       text: 'Freezes ilimitados de streak',         sub: 'nunca perca sua ofensiva'        },
  { icon: 'gem',       text: '100 gems por mês incluídas',           sub: 'tudo do Pro + mais'              },
  { icon: 'trophy',    text: '2 baús épicos + 1 lendário/mês',       sub: 'itens que não existem na loja'   },
  { icon: 'shield',    text: 'Squad privada sem restrição de rank',  sub: 'até 10 membros, badge custom'    },
  { icon: 'lightning', text: 'Múltiplas squads (até 3)',             sub: 'domine vários grupos'            },
  { icon: 'star',      text: 'Torneios globais exclusivos',          sub: 'premiação em gems e baús'        },
  { icon: 'spiral',    text: 'Squad analytics completo',             sub: 'métricas de time detalhadas'     },
  { icon: 'crown',     text: 'Badge MAX animado no perfil',          sub: 'brilho exclusivo — ninguém ignora'},
  { icon: 'processor', text: 'Early access a novas features',        sub: 'você testa antes de todo mundo'  },
];

const PRICES = {
  pro:  { monthly: 'R$ 19,90', annual: 'R$ 149,90', monthlyEquiv: 'R$ 12,49/mês' },
  max:  { monthly: 'R$ 39,90', annual: 'R$ 299,90', monthlyEquiv: 'R$ 24,99/mês' },
};

// ── Benefit Icon ──────────────────────────────────────────────────────────────
function BenefitIcon({ id, color }: { id: string; color: string }) {
  const map: Record<string, React.ReactNode> = {
    ice:       <IceIcon       size={18} color={color} />,
    gem:       <GemIcon       size={18} color={color} />,
    trophy:    <TrophyIcon    size={18} color={color} />,
    lightning: <LightningIcon size={18} color={color} />,
    spiral:    <SpiralIcon    size={18} color={color} />,
    star:      <StarburstIcon size={18} color={color} />,
    shield:    <ShieldIcon    size={18} color={color} />,
    crown:     <CrownIcon     size={18} color={color} />,
    processor: <ProcessorIcon size={18} color={color} />,
  };
  return <>{map[id] ?? <StarburstIcon size={18} color={color} />}</>;
}

// ── Animated benefit row ──────────────────────────────────────────────────────
function BenefitRow({ benefit, index, color, delay }: {
  benefit: typeof PRO_BENEFITS[0]; index: number; color: string; delay: number;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  const tx   = useRef(new Animated.Value(-30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(anim, { toValue: 1, duration: 350, delay, useNativeDriver: true }),
      Animated.spring(tx,   { toValue: 0, delay, useNativeDriver: true, speed: 14, bounciness: 6 }),
    ]).start();
  }, [delay]);

  return (
    <Animated.View style={[bs.row, { opacity: anim, transform: [{ translateX: tx }] }]}>
      <View style={[bs.iconWrap, { backgroundColor: color + '18' }]}>
        <BenefitIcon id={benefit.icon} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={bs.text}>{benefit.text}</Text>
        <Text style={bs.sub}>{benefit.sub}</Text>
      </View>
      <View style={[bs.check, { borderColor: color + '60', backgroundColor: color + '15' }]}>
        <Text style={[bs.checkText, { color }]}>✓</Text>
      </View>
    </Animated.View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function SubscriptionScreen() {
  const insets = useSafeAreaInsets();
  const { plan: activePlan, setPlan: setGlobalPlan } = useTheme();

  const [plan, setPlan]             = useState<Plan>('pro');
  const [billing, setBilling]       = useState<Billing>('annual');
  const [activating, setActivating] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const cancelSheetAnim = useRef(new Animated.Value(0)).current;

  const headerScale  = useRef(new Animated.Value(0.85)).current;
  const headerOp     = useRef(new Animated.Value(0)).current;
  const ctaGlow      = useRef(new Animated.Value(0.5)).current;
  const spiralRotate = useRef(new Animated.Value(0)).current;
  const planToggleX  = useRef(new Animated.Value(0)).current;
  const ctaScale     = useRef(new Animated.Value(1)).current;

  const isCurrentPlan = activePlan === plan;
  const color = plan === 'pro' ? '#4a9eff' : '#a370ff';
  const activeColor = activePlan === 'pro' ? '#4a9eff' : '#a370ff';
  const benefits = plan === 'pro' ? PRO_BENEFITS : MAX_BENEFITS;

  // Highlights shown in cancel modal — top 3 perks of the active plan
  const CANCEL_LOSS = activePlan === 'max'
    ? ['100 gems/mês', '3 baús épicos + lendários/mês', 'Múltiplas squads e torneios']
    : ['30 gems/mês', 'Freezes ilimitados de streak', 'Baú épico garantido todo mês'];

  // Open cancel modal with slide-up animation
  const openCancelModal = () => {
    setShowCancel(true);
    cancelSheetAnim.setValue(300);
    Animated.spring(cancelSheetAnim, {
      toValue: 0, useNativeDriver: true, speed: 18, bounciness: 6,
    }).start();
  };

  // Confirm cancellation → back to free plan
  const handleConfirmCancel = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Animated.timing(cancelSheetAnim, { toValue: 300, duration: 220, useNativeDriver: true })
      .start(() => {
        setShowCancel(false);
        setGlobalPlan('free');
        setTimeout(() => router.back(), 400);
      });
  };

  // Activate / upgrade plan
  const handleActivate = () => {
    if (isCurrentPlan) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setActivating(true);
    // CTA bounce
    Animated.sequence([
      Animated.spring(ctaScale, { toValue: 0.94, useNativeDriver: true, speed: 30 }),
      Animated.spring(ctaScale, { toValue: 1.0,  useNativeDriver: true, speed: 30 }),
    ]).start(() => {
      setGlobalPlan(plan as PlanType);
      setTimeout(() => {
        setActivating(false);
        router.back();
      }, 600);
    });
  };

  useEffect(() => {
    // Header entrance
    Animated.parallel([
      Animated.spring(headerScale, { toValue: 1, useNativeDriver: true, speed: 12, bounciness: 8 }),
      Animated.timing(headerOp, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    // Spiral slow rotation
    Animated.loop(
      Animated.timing(spiralRotate, { toValue: 1, duration: 12000, useNativeDriver: true })
    ).start();

    // CTA glow pulse
    Animated.loop(Animated.sequence([
      Animated.timing(ctaGlow, { toValue: 1,   duration: 1100, useNativeDriver: true }),
      Animated.timing(ctaGlow, { toValue: 0.4, duration: 1100, useNativeDriver: true }),
    ])).start();
  }, []);

  // Plan toggle slide
  useEffect(() => {
    Animated.spring(planToggleX, {
      toValue: plan === 'pro' ? 0 : 1,
      useNativeDriver: false,
      speed: 16, bounciness: 6,
    }).start();
  }, [plan]);

  const spin = spiralRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const toggleLeft = planToggleX.interpolate({ inputRange: [0, 1], outputRange: [4, (W - 72) / 2] });

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.closeBtn}>
          <Text style={s.closeText}>✕</Text>
        </TouchableOpacity>
        <Text style={s.trialBadge}>14 dias grátis</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
        {/* Hero */}
        <Animated.View style={[s.hero, { opacity: headerOp, transform: [{ scale: headerScale }] }]}>
          <View style={s.heroSpiral}>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <SpiralIcon size={120} color={color} />
            </Animated.View>
          </View>
          <Text style={[s.heroTitle, { color }]}>
            momentum {plan === 'pro' ? 'pro' : 'max'}
          </Text>
          <Text style={s.heroSub}>
            {plan === 'pro'
              ? 'poder pessoal ilimitado'
              : 'domine squads e competições'}
          </Text>
        </Animated.View>

        {/* Plan toggle */}
        <View style={s.planToggle}>
          {/* Sliding indicator */}
          <Animated.View style={[s.planIndicator, {
            left: toggleLeft,
            width: (W - 72) / 2,
            backgroundColor: color,
          }]} />
          <TouchableOpacity style={s.planBtn} onPress={() => setPlan('pro')}>
            <Text style={[s.planBtnText, plan === 'pro' && { color: '#f2e4cf' }]}>Pro</Text>
            <Text style={[s.planBtnPrice, plan === 'pro' && { color: '#f2e4cfa0' }]}>
              {PRICES.pro[billing === 'annual' ? 'monthlyEquiv' : 'monthly']}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.planBtn} onPress={() => setPlan('max')}>
            <Text style={[s.planBtnText, plan === 'max' && { color: '#f2e4cf' }]}>Max</Text>
            <Text style={[s.planBtnPrice, plan === 'max' && { color: '#f2e4cfa0' }]}>
              {PRICES.max[billing === 'annual' ? 'monthlyEquiv' : 'monthly']}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Billing toggle */}
        <View style={s.billingRow}>
          {(['monthly', 'annual'] as Billing[]).map(b => (
            <TouchableOpacity
              key={b}
              style={[s.billingBtn, billing === b && { borderColor: color, backgroundColor: color + '15' }]}
              onPress={() => setBilling(b)}
            >
              <Text style={[s.billingText, billing === b && { color }]}>
                {b === 'monthly' ? 'mensal' : 'anual'}
              </Text>
              {b === 'annual' && (
                <View style={[s.savingsBadge, { backgroundColor: color }]}>
                  <Text style={s.savingsText}>−37%</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Price display */}
        <View style={s.priceBlock}>
          <Text style={[s.priceMain, { color }]}>
            {billing === 'annual'
              ? PRICES[plan].annual + '/ano'
              : PRICES[plan].monthly + '/mês'}
          </Text>
          {billing === 'annual' && (
            <Text style={s.priceSub}>equivale a {PRICES[plan].monthlyEquiv}</Text>
          )}
        </View>

        {/* Benefits */}
        <View style={s.benefitsSection}>
          <Text style={s.benefitsTitle}>o que você ganha</Text>
          {benefits.map((b, i) => (
            <BenefitRow
              key={plan + i}
              benefit={b}
              index={i}
              color={color}
              delay={i * 80}
            />
          ))}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* CTA fixed at bottom */}
      <View style={[s.ctaWrap, { paddingBottom: insets.bottom + 12 }]}>
        {/* Current plan indicator */}
        {activePlan !== 'free' && (
          <View style={[s.activePlanBadge, { borderColor: color + '40', backgroundColor: color + '12' }]}>
            <View style={[s.activeDot, { backgroundColor: activePlan === plan ? color : C.text3 }]} />
            <Text style={[s.activePlanText, { color: activePlan === plan ? color : C.text3 }]}>
              {activePlan === plan
                ? `plano ${activePlan.toUpperCase()} ativo`
                : `atualmente no plano ${activePlan.toUpperCase()}`}
            </Text>
          </View>
        )}

        <Animated.View style={{ width: '100%', transform: [{ scale: ctaScale }] }}>
          <TouchableOpacity
            style={[
              s.ctaBtn,
              { backgroundColor: isCurrentPlan ? color + '40' : color },
            ]}
            activeOpacity={0.88}
            onPress={handleActivate}
            disabled={isCurrentPlan || activating}
          >
            <Text style={[s.ctaBtnText, isCurrentPlan && { color: color }]}>
              {activating
                ? 'ativando tema...'
                : isCurrentPlan
                ? `plano ${plan.toUpperCase()} já ativo`
                : activePlan !== 'free'
                ? `migrar para ${plan.toUpperCase()}`
                : `começar 14 dias grátis — ${plan === 'pro' ? 'Pro' : 'Max'}`}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <Text style={s.ctaFine}>
          {isCurrentPlan
            ? 'Este é o seu plano atual. Obrigado!'
            : `Cancele antes do fim do período grátis sem cobrança.\nApós o trial: ${billing === 'annual' ? PRICES[plan].annual + '/ano' : PRICES[plan].monthly + '/mês'}`}
        </Text>

        {/* Cancel link — only shown when subscribed */}
        {activePlan !== 'free' && (
          <TouchableOpacity onPress={openCancelModal} style={s.cancelLink} activeOpacity={0.6}>
            <Text style={s.cancelLinkText}>cancelar assinatura</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Cancel confirmation modal ───────────────────────────────────────── */}
      <Modal
        visible={showCancel}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCancel(false)}
      >
        <TouchableOpacity
          style={s.cancelBackdrop}
          activeOpacity={1}
          onPress={() => {
            Animated.timing(cancelSheetAnim, { toValue: 300, duration: 200, useNativeDriver: true })
              .start(() => setShowCancel(false));
          }}
        >
          <Animated.View
            style={[s.cancelSheet, { transform: [{ translateY: cancelSheetAnim }] }]}
          >
            <TouchableOpacity activeOpacity={1}>
              {/* Header */}
              <View style={s.cancelSheetHeader}>
                <View style={s.cancelSheetDrag} />
              </View>

              <Text style={s.cancelTitle}>cancelar assinatura?</Text>
              <Text style={s.cancelSub}>
                Você vai perder imediatamente acesso a:
              </Text>

              {/* Loss list */}
              <View style={s.cancelLossList}>
                {CANCEL_LOSS.map((item, i) => (
                  <View key={i} style={s.cancelLossRow}>
                    <View style={[s.cancelLossDot, { backgroundColor: activeColor }]} />
                    <Text style={[s.cancelLossText, { color: activeColor }]}>{item}</Text>
                  </View>
                ))}
              </View>

              {/* Also lose theme */}
              <View style={[s.cancelThemeNote, { borderColor: activeColor + '30', backgroundColor: activeColor + '0C' }]}>
                <Text style={[s.cancelThemeNoteText, { color: activeColor + 'cc' }]}>
                  O tema {activePlan === 'pro' ? 'azul Pro' : 'roxo Max'} do app será removido{'\n'}
                  e o app voltará ao visual padrão.
                </Text>
              </View>

              {/* Buttons */}
              <View style={s.cancelActions}>
                <TouchableOpacity
                  style={s.keepBtn}
                  activeOpacity={0.85}
                  onPress={() => {
                    Animated.timing(cancelSheetAnim, { toValue: 300, duration: 200, useNativeDriver: true })
                      .start(() => setShowCancel(false));
                  }}
                >
                  <Text style={s.keepBtnText}>manter plano {activePlan.toUpperCase()}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={s.confirmCancelBtn}
                  activeOpacity={0.8}
                  onPress={handleConfirmCancel}
                >
                  <Text style={s.confirmCancelText}>sim, cancelar assinatura</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: C.bg },
  content: { paddingHorizontal: 18, gap: 20 },

  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18, paddingVertical: 10,
  },
  closeBtn:  { padding: 8 },
  closeText: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 16, color: C.text3 },
  trialBadge: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 11,
    color: C.success,
    backgroundColor: C.success + '18', borderWidth: 1, borderColor: C.success + '40',
    borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4,
  },

  hero: { alignItems: 'center', paddingTop: 8, gap: 10 },
  heroSpiral: { marginBottom: 4 },
  heroTitle: {
    fontFamily: 'Lora_400Regular', fontSize: 32,
    letterSpacing: -0.5,
  },
  heroSub: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 11,
    color: C.text3, textAlign: 'center',
  },

  planToggle: {
    flexDirection: 'row', backgroundColor: C.surface,
    borderRadius: 12, borderWidth: 1, borderColor: C.surface2,
    padding: 4, position: 'relative', overflow: 'hidden',
  },
  planIndicator: {
    position: 'absolute', top: 4, bottom: 4,
    borderRadius: 9,
  },
  planBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 10, zIndex: 1,
  },
  planBtnText: {
    fontFamily: 'Lora_400Regular', fontSize: 16, color: C.text3,
  },
  planBtnPrice: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 9, color: C.text3, marginTop: 2,
  },

  billingRow: { flexDirection: 'row', gap: 8 },
  billingBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 8, borderRadius: 8,
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.surface2,
  },
  billingText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: C.text3,
  },
  savingsBadge: {
    borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2,
  },
  savingsText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 8, color: '#f2e4cf',
  },

  priceBlock: { alignItems: 'center', gap: 4 },
  priceMain: { fontFamily: 'Lora_400Regular', fontSize: 26, letterSpacing: -0.5 },
  priceSub:  { fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, color: C.text3 },

  benefitsSection: { gap: 8 },
  benefitsTitle: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 10,
    color: C.text3, textTransform: 'lowercase', letterSpacing: 0.05,
    marginBottom: 4,
  },

  ctaWrap: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: C.bg, paddingHorizontal: 18, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: C.surface2, gap: 10, alignItems: 'center',
  },
  ctaBtn: {
    width: '100%', borderRadius: 12,
    paddingVertical: 15, alignItems: 'center',
  },
  ctaBtnText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 13, color: '#f2e4cf',
  },
  ctaFine: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 9,
    color: C.text3, textAlign: 'center', lineHeight: 14,
  },
  activePlanBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 8, borderWidth: 1,
  },
  activeDot: {
    width: 6, height: 6, borderRadius: 3,
  },
  activePlanText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 10,
  },

  // Cancel link
  cancelLink: { paddingVertical: 4 },
  cancelLinkText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 10,
    color: C.text3, textDecorationLine: 'underline',
  },

  // Cancel modal
  cancelBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  cancelSheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 22, borderTopRightRadius: 22,
    borderWidth: 1, borderColor: C.surface2,
    padding: 24, paddingBottom: 36,
  },
  cancelSheetHeader: { alignItems: 'center', marginBottom: 18 },
  cancelSheetDrag: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: C.surface2,
  },
  cancelTitle: {
    fontFamily: 'Lora_400Regular', fontSize: 22,
    color: C.text, letterSpacing: -0.3, marginBottom: 8,
  },
  cancelSub: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 11,
    color: C.text3, marginBottom: 16, lineHeight: 18,
  },
  cancelLossList: { gap: 10, marginBottom: 18 },
  cancelLossRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cancelLossDot: { width: 6, height: 6, borderRadius: 3 },
  cancelLossText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 12,
  },
  cancelThemeNote: {
    borderRadius: 10, borderWidth: 1,
    padding: 12, marginBottom: 24,
  },
  cancelThemeNoteText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 10,
    lineHeight: 16, textAlign: 'center',
  },
  cancelActions: { gap: 10 },
  keepBtn: {
    backgroundColor: C.surface2, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
    borderWidth: 1, borderColor: C.surface2,
  },
  keepBtnText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 13,
    color: C.text,
  },
  confirmCancelBtn: {
    borderRadius: 12, paddingVertical: 14, alignItems: 'center',
    borderWidth: 1, borderColor: C.danger + '50',
    backgroundColor: C.danger + '10',
  },
  confirmCancelText: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 13,
    color: C.danger,
  },
});

const bs = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.surface, borderRadius: 10,
    borderWidth: 1, borderColor: C.surface2, padding: 12,
  },
  iconWrap: {
    width: 36, height: 36, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  text: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: C.text },
  sub:  { fontFamily: 'JetBrainsMono_400Regular', fontSize: 9,  color: C.text3, marginTop: 2 },
  check: {
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  checkText: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 10 },
});

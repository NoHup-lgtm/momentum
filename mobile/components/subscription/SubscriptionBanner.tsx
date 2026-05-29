import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { C } from '../../constants/design';
import {
  IceIcon, GemIcon, SpiralIcon, ShieldIcon, TrophyIcon,
  CoinIcon, LightningIcon,
} from '../icons';

const { width: W } = Dimensions.get('window');
const CARD_W = W - 36; // full width minus padding

// ── CARD 1: 14 dias grátis ────────────────────────────────────────────────────
function Card1() {
  const spiralScale = useRef(new Animated.Value(0.6)).current;
  const spiralOp    = useRef(new Animated.Value(0.08)).current;
  const numScale    = useRef(new Animated.Value(1)).current;
  const glowOp      = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // Spiral breathes slowly
    Animated.loop(Animated.sequence([
      Animated.parallel([
        Animated.timing(spiralScale, { toValue: 1.1, duration: 2200, useNativeDriver: true }),
        Animated.timing(spiralOp,    { toValue: 0.15, duration: 2200, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(spiralScale, { toValue: 0.6, duration: 2200, useNativeDriver: true }),
        Animated.timing(spiralOp,    { toValue: 0.06, duration: 2200, useNativeDriver: true }),
      ]),
    ])).start();

    // Number pulses
    Animated.loop(Animated.sequence([
      Animated.spring(numScale, { toValue: 1.08, useNativeDriver: true, speed: 6, bounciness: 8 }),
      Animated.spring(numScale, { toValue: 1.0,  useNativeDriver: true, speed: 6, bounciness: 8 }),
    ])).start();

    // Glow pulses
    Animated.loop(Animated.sequence([
      Animated.timing(glowOp, { toValue: 0.9, duration: 1000, useNativeDriver: true }),
      Animated.timing(glowOp, { toValue: 0.3, duration: 1000, useNativeDriver: true }),
    ])).start();
  }, []);

  return (
    <View style={[card.wrap, { borderColor: C.gold + '50', backgroundColor: C.gold + '08' }]}>
      {/* Animated spiral bg */}
      <Animated.View style={[card.bgSpiral, { transform: [{ scale: spiralScale }], opacity: spiralOp }]}>
        <SpiralIcon size={180} color={C.gold} />
      </Animated.View>

      <View style={card.content}>
        <View style={card.leftBlock}>
          <Text style={[card.tag, { color: C.gold }]}>oferta especial</Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4 }}>
            <Animated.Text style={[card.bigNum, { color: C.gold, transform: [{ scale: numScale }] }]}>
              14
            </Animated.Text>
            <Text style={[card.bigUnit, { color: C.gold }]}>dias</Text>
          </View>
          <Text style={card.mainText}>grátis no Pro ou Max</Text>
          <Text style={card.subText}>sem cartão de crédito</Text>
        </View>

        <View style={card.rightBlock}>
          <Animated.View style={[card.glowDot, {
            backgroundColor: C.gold,
            shadowColor: C.gold,
            opacity: glowOp,
          }]} />
          <TouchableOpacity
            style={[card.cta, { backgroundColor: C.gold }]}
            onPress={() => router.push('/subscription')}
            activeOpacity={0.85}
          >
            <Text style={[card.ctaText, { color: '#1a0e00' }]}>começar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ── CARD 2: Pro — Proteção de streak ─────────────────────────────────────────
function Card2() {
  const iceScale    = useRef(new Animated.Value(1)).current;
  const shieldOp    = useRef(new Animated.Value(0)).current;
  const shieldScale = useRef(new Animated.Value(0.5)).current;

  const B = '#7ab4e8';

  useEffect(() => {
    // Ice pulses
    Animated.loop(Animated.sequence([
      Animated.timing(iceScale, { toValue: 1.15, duration: 700, useNativeDriver: true }),
      Animated.timing(iceScale, { toValue: 1.0,  duration: 700, useNativeDriver: true }),
      Animated.timing(iceScale, { toValue: 1.08, duration: 500, useNativeDriver: true }),
      Animated.timing(iceScale, { toValue: 1.0,  duration: 500, useNativeDriver: true }),
      Animated.delay(1200),
    ])).start();

    // Shield appears after delay
    Animated.loop(Animated.sequence([
      Animated.delay(800),
      Animated.parallel([
        Animated.spring(shieldScale, { toValue: 1,   useNativeDriver: true, speed: 14, bounciness: 12 }),
        Animated.timing(shieldOp,    { toValue: 1,   duration: 300, useNativeDriver: true }),
      ]),
      Animated.delay(1800),
      Animated.parallel([
        Animated.timing(shieldScale, { toValue: 0.5, duration: 250, useNativeDriver: true }),
        Animated.timing(shieldOp,    { toValue: 0,   duration: 250, useNativeDriver: true }),
      ]),
      Animated.delay(400),
    ])).start();
  }, []);

  return (
    <View style={[card.wrap, { borderColor: B + '60', backgroundColor: B + '08' }]}>
      <View style={card.content}>
        <View style={card.leftBlock}>
          <Text style={[card.tag, { color: B }]}>momentum pro</Text>
          <Text style={[card.mainText, { color: C.text }]}>nunca perca{'\n'}sua ofensiva</Text>
          <Text style={card.subText}>freezes ilimitados de streak</Text>
        </View>

        <View style={card.rightBlock}>
          {/* Streak number with ice + shield */}
          <View style={{ alignItems: 'center', gap: 8 }}>
            <View style={{ position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
              {/* Shield overlay */}
              <Animated.View style={[
                card.shieldOverlay,
                { opacity: shieldOp, transform: [{ scale: shieldScale }] },
              ]}>
                <ShieldIcon size={52} color={B} />
              </Animated.View>
              {/* Ice icon */}
              <Animated.View style={{ transform: [{ scale: iceScale }] }}>
                <IceIcon size={36} color={B} />
              </Animated.View>
            </View>
            <Text style={[card.streakNum, { color: B }]}>∞</Text>
          </View>
          <TouchableOpacity
            style={[card.cta, { backgroundColor: B }]}
            onPress={() => router.push('/subscription')}
            activeOpacity={0.85}
          >
            <Text style={[card.ctaText, { color: '#0a1520' }]}>ver plano</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ── CARD 3: Max — Poder de squad ──────────────────────────────────────────────
function Card3() {
  const av1X    = useRef(new Animated.Value(-60)).current;
  const av2X    = useRef(new Animated.Value(60)).current;
  const av3Y    = useRef(new Animated.Value(-50)).current;
  const lineW1  = useRef(new Animated.Value(0)).current;
  const lineW2  = useRef(new Animated.Value(0)).current;
  const allOp   = useRef(new Animated.Value(0)).current;

  const P = C.purple;

  useEffect(() => {
    const runAnim = () => {
      // Reset
      av1X.setValue(-60); av2X.setValue(60); av3Y.setValue(-50);
      lineW1.setValue(0); lineW2.setValue(0); allOp.setValue(0);

      Animated.sequence([
        // Fade in
        Animated.timing(allOp, { toValue: 1, duration: 300, useNativeDriver: true }),
        // Avatars fly in
        Animated.parallel([
          Animated.spring(av1X, { toValue: 0, useNativeDriver: true, speed: 12, bounciness: 10 }),
          Animated.spring(av2X, { toValue: 0, useNativeDriver: true, speed: 12, bounciness: 10, delay: 100 }),
          Animated.spring(av3Y, { toValue: 0, useNativeDriver: true, speed: 12, bounciness: 10, delay: 200 }),
        ]),
        Animated.delay(300),
        // Lines draw (native driver can't animate width so use opacity/scale trick)
        Animated.parallel([
          Animated.timing(lineW1, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(lineW2, { toValue: 1, duration: 400, useNativeDriver: true, delay: 150 }),
        ]),
        Animated.delay(1400),
        // Fade out
        Animated.timing(allOp, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.delay(600),
      ]).start(() => runAnim());
    };
    runAnim();
  }, []);

  return (
    <View style={[card.wrap, { borderColor: P + '60', backgroundColor: P + '08' }]}>
      <View style={card.content}>
        <View style={card.leftBlock}>
          <Text style={[card.tag, { color: P }]}>momentum max</Text>
          <Text style={[card.mainText, { color: C.text }]}>domine{'\n'}com sua squad</Text>
          <Text style={card.subText}>squads privadas · até 10 membros</Text>
        </View>

        <View style={card.rightBlock}>
          <Animated.View style={[card.squadAnim, { opacity: allOp }]}>
            {/* Avatar 1 left */}
            <Animated.View style={[card.av, card.avLeft, {
              borderColor: P,
              transform: [{ translateX: av1X }],
            }]}>
              <Text style={card.avLetter}>A</Text>
            </Animated.View>
            {/* Avatar 2 right */}
            <Animated.View style={[card.av, card.avRight, {
              borderColor: P,
              transform: [{ translateX: av2X }],
            }]}>
              <Text style={card.avLetter}>K</Text>
            </Animated.View>
            {/* Avatar 3 center-top */}
            <Animated.View style={[card.av, card.avTop, {
              borderColor: C.gold,
              transform: [{ translateY: av3Y }],
            }]}>
              <Text style={[card.avLetter, { color: C.gold }]}>M</Text>
            </Animated.View>
            {/* Connection lines (opacity based) */}
            <Animated.View style={[card.line, card.line1, { opacity: lineW1 }]} />
            <Animated.View style={[card.line, card.line2, { opacity: lineW2 }]} />
          </Animated.View>

          <TouchableOpacity
            style={[card.cta, { backgroundColor: P }]}
            onPress={() => router.push('/subscription')}
            activeOpacity={0.85}
          >
            <Text style={card.ctaText}>ver plano</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ── CARD 4: Gems todo mês ─────────────────────────────────────────────────────
function Card4() {
  const gem1Y = useRef(new Animated.Value(-80)).current;
  const gem2Y = useRef(new Animated.Value(-80)).current;
  const gem3Y = useRef(new Animated.Value(-80)).current;
  const gem4Y = useRef(new Animated.Value(-80)).current;
  const gem5Y = useRef(new Animated.Value(-80)).current;
  const countAnim = useRef(new Animated.Value(0)).current;
  const [count, setCount] = useState(0);

  const gems = [gem1Y, gem2Y, gem3Y, gem4Y, gem5Y];
  const P = C.purple;

  useEffect(() => {
    const run = () => {
      gems.forEach(g => g.setValue(-80));
      countAnim.setValue(0);
      setCount(0);

      const drops = gems.map((g, i) =>
        Animated.sequence([
          Animated.delay(i * 180),
          Animated.spring(g, { toValue: 0, useNativeDriver: true, speed: 10, bounciness: 14 }),
        ])
      );

      Animated.sequence([
        Animated.parallel(drops),
        Animated.delay(300),
        Animated.timing(countAnim, { toValue: 1, duration: 800, useNativeDriver: false }),
        Animated.delay(1200),
        Animated.parallel(gems.map(g =>
          Animated.timing(g, { toValue: 80, duration: 500, useNativeDriver: true })
        )),
        Animated.delay(400),
      ]).start(() => run());
    };

    countAnim.addListener(({ value }) => setCount(Math.round(value * 100)));
    run();
    return () => countAnim.removeAllListeners();
  }, []);

  const xPositions = [-32, -16, 0, 16, 32];

  return (
    <View style={[card.wrap, { borderColor: P + '60', backgroundColor: P + '08' }]}>
      <View style={card.content}>
        <View style={card.leftBlock}>
          <Text style={[card.tag, { color: P }]}>pro · max</Text>
          <Text style={[card.mainText, { color: C.text }]}>gems{'\n'}incluídas</Text>
          <Text style={card.subText}>30 gems/mês no Pro · 100 no Max</Text>
        </View>

        <View style={card.rightBlock}>
          {/* Falling gems */}
          <View style={card.gemsFall}>
            {gems.map((g, i) => (
              <Animated.View
                key={i}
                style={[card.fallingGem, {
                  left: xPositions[i] + 32,
                  transform: [{ translateY: g }],
                }]}
              >
                <GemIcon size={20} color={P} />
              </Animated.View>
            ))}
          </View>
          {/* Counter */}
          <View style={card.gemCounter}>
            <Text style={[card.gemCountNum, { color: P }]}>{count}</Text>
            <Text style={[card.gemCountLabel, { color: P }]}>gems</Text>
          </View>

          <TouchableOpacity
            style={[card.cta, { backgroundColor: P }]}
            onPress={() => router.push('/subscription')}
            activeOpacity={0.85}
          >
            <Text style={card.ctaText}>ver plano</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ── Banner container (auto-rotating) ─────────────────────────────────────────
const CARDS = [Card1, Card2, Card3, Card4];
const INTERVAL = 4500;

export default function SubscriptionBanner() {
  const [active, setActive] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setInterval(() => {
      setActive(prev => {
        const next = (prev + 1) % CARDS.length;
        Animated.sequence([
          Animated.timing(slideAnim, { toValue: -20, duration: 180, useNativeDriver: true }),
          Animated.timing(slideAnim, { toValue: 0,   duration: 0,   useNativeDriver: true }),
        ]).start();
        return next;
      });
    }, INTERVAL);
    return () => clearInterval(timer);
  }, []);

  const ActiveCard = CARDS[active];

  return (
    <View style={banner.wrap}>
      <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
        <ActiveCard />
      </Animated.View>
      {/* Dot indicators */}
      <View style={banner.dots}>
        {CARDS.map((_, i) => (
          <TouchableOpacity key={i} onPress={() => setActive(i)}>
            <View style={[banner.dot, i === active && banner.dotActive]} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const card = StyleSheet.create({
  wrap: {
    width: CARD_W, borderRadius: 14, borderWidth: 1,
    padding: 16, overflow: 'hidden', minHeight: 120,
  },
  bgSpiral: { position: 'absolute', top: -20, right: -20 },
  content: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  leftBlock: { flex: 1, gap: 4 },
  rightBlock: { alignItems: 'center', gap: 10, minWidth: 90 },

  tag: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 9, letterSpacing: 0.1, textTransform: 'lowercase' },
  bigNum: { fontFamily: 'Lora_400Regular', fontSize: 52, letterSpacing: -2, lineHeight: 56 },
  bigUnit: { fontFamily: 'Lora_400Regular', fontSize: 18, letterSpacing: -0.5, marginBottom: 8 },
  mainText: { fontFamily: 'Lora_400Regular', fontSize: 18, color: C.text, letterSpacing: -0.3, lineHeight: 24 },
  subText:  { fontFamily: 'JetBrainsMono_400Regular', fontSize: 9, color: C.text3, marginTop: 2 },

  cta: {
    borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8, alignItems: 'center',
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 4,
  },
  ctaText: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: '#f2e4cf' },

  glowDot: {
    width: 10, height: 10, borderRadius: 5,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 8,
  },
  streakNum: { fontFamily: 'Lora_400Regular', fontSize: 28, letterSpacing: -1 },
  shieldOverlay: { position: 'absolute', zIndex: 2 },

  squadAnim: { width: 90, height: 70, position: 'relative', marginBottom: 4 },
  av: {
    width: 28, height: 28, borderRadius: 14, borderWidth: 2,
    backgroundColor: C.surface2,
    alignItems: 'center', justifyContent: 'center',
    position: 'absolute',
  },
  avLeft:  { left: 2,  top: 20 },
  avRight: { right: 2, top: 20 },
  avTop:   { left: 31, top: 2  },
  avLetter: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, color: C.purple },
  line: {
    position: 'absolute', height: 1.5, backgroundColor: C.purple + '70',
    borderRadius: 1,
  },
  line1: { width: 36, left: 28, top: 33, transform: [{ rotate: '30deg' }] },
  line2: { width: 36, right: 28, top: 33, transform: [{ rotate: '-30deg' }] },

  gemsFall: { width: 80, height: 50, position: 'relative', marginBottom: 4 },
  fallingGem: { position: 'absolute', top: 15 },
  gemCounter: { alignItems: 'center' },
  gemCountNum:   { fontFamily: 'Lora_400Regular', fontSize: 22, letterSpacing: -1 },
  gemCountLabel: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 9 },
});

const banner = StyleSheet.create({
  wrap: { gap: 8 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: {
    width: 5, height: 5, borderRadius: 2.5,
    backgroundColor: C.surface2,
  },
  dotActive: { backgroundColor: C.accent, width: 16 },
});

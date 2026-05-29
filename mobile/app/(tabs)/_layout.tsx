import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Tabs, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { C } from '../../constants/design';
import { useTheme } from '../../contexts/ThemeContext';
import { SpiralIcon } from '../../components/icons';

// ── Tab icon components ───────────────────────────────────────────────────────
function HomeIcon({ focused, accent }: { focused: boolean; accent: string }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: 24, height: 24 }}>
      <View style={[tabStyles.iconSquare, focused && { backgroundColor: accent }]} />
      <View style={[tabStyles.iconBar, focused && { backgroundColor: accent }]} />
    </View>
  );
}

function SquadIcon({ focused, accent }: { focused: boolean; accent: string }) {
  const color = focused ? accent : C.text3;
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: 24, height: 24 }}>
      <View style={[tabStyles.dot, { backgroundColor: color, marginBottom: 3 }]} />
      <View style={{ flexDirection: 'row', gap: 4 }}>
        <View style={[tabStyles.dot, { backgroundColor: color }]} />
        <View style={[tabStyles.dot, { backgroundColor: color }]} />
      </View>
    </View>
  );
}

function ProfileIcon({ focused, accent }: { focused: boolean; accent: string }) {
  const color = focused ? accent : C.text3;
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: 24, height: 24 }}>
      <View style={[tabStyles.avatarHead, { borderColor: color }]} />
      <View style={[tabStyles.avatarBody, { borderColor: color }]} />
    </View>
  );
}

function StoreIcon({ focused, accent }: { focused: boolean; accent: string }) {
  const color = focused ? accent : C.text3;
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: 24, height: 24 }}>
      <View style={[tabStyles.gem, { borderBottomColor: color }]} />
    </View>
  );
}

const tabStyles = StyleSheet.create({
  iconSquare: { width: 10, height: 10, borderRadius: 2, backgroundColor: C.text3 },
  iconSquareFocused: { backgroundColor: C.accent },
  iconBar: { width: 16, height: 3, borderRadius: 1, backgroundColor: C.text3, marginTop: 4 },
  iconBarFocused: { backgroundColor: C.accent },
  dot: { width: 7, height: 7, borderRadius: 3.5 },
  avatarHead: { width: 10, height: 10, borderRadius: 5, borderWidth: 1.5 },
  avatarBody: {
    width: 16, height: 8, borderRadius: 4,
    borderWidth: 1.5, marginTop: 3,
  },
  gem: {
    width: 0, height: 0,
    borderLeftWidth: 8, borderRightWidth: 8,
    borderBottomWidth: 14,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
  },
});

// ── Custom tab bar ────────────────────────────────────────────────────────────
function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const TABS = ['index', 'squad', 'profile', 'store'];
  const LABELS = ['home', 'squad', 'perfil', 'loja'];
  const ICONS = [HomeIcon, SquadIcon, ProfileIcon, StoreIcon];

  return (
    <View style={[
      barStyles.container,
      {
        paddingBottom: insets.bottom || 12,
        backgroundColor: colors.surface,
        borderTopColor: colors.surface2,
      },
    ]}>
      {/* Left tabs */}
      {[0, 1].map((idx) => {
        const route = state.routes[idx];
        const focused = state.index === idx;
        const Icon = ICONS[idx];
        return (
          <TouchableOpacity
            key={route.key}
            style={barStyles.tab}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate(route.name);
            }}
            activeOpacity={0.7}
          >
            <Icon focused={focused} accent={colors.accent} />
            <Text style={[barStyles.label, focused && { color: colors.accent }]}>
              {LABELS[idx]}
            </Text>
          </TouchableOpacity>
        );
      })}

      {/* Center spiral button → feed */}
      <TouchableOpacity
        style={barStyles.centerWrap}
        activeOpacity={0.85}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push('/feed');
        }}
      >
        <View style={[
          barStyles.centerBtn,
          { borderColor: colors.accent, shadowColor: colors.accent },
        ]}>
          <SpiralIcon size={26} color={C.text} />
        </View>
        <Text style={barStyles.centerLabel}>feed</Text>
      </TouchableOpacity>

      {/* Right tabs */}
      {[2, 3].map((idx) => {
        const route = state.routes[idx];
        const focused = state.index === idx;
        const Icon = ICONS[idx];
        return (
          <TouchableOpacity
            key={route.key}
            style={barStyles.tab}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate(route.name);
            }}
            activeOpacity={0.7}
          >
            <Icon focused={focused} accent={colors.accent} />
            <Text style={[barStyles.label, focused && { color: colors.accent }]}>
              {LABELS[idx]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const barStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderTopWidth: 1,
    borderTopColor: C.surface2,
    paddingTop: 10,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  label: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 9,
    color: C.text3,
    letterSpacing: 0.05,
    textTransform: 'lowercase',
  },
  labelFocused: { color: C.accent },
  centerWrap: {
    alignItems: 'center',
    marginTop: -12,
    gap: 3,
  },
  centerBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: C.surface2,
    borderWidth: 1,
    borderColor: C.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  centerLabel: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 9,
    color: C.text3,
    letterSpacing: 0.05,
  },
});

// ── Layout ────────────────────────────────────────────────────────────────────
export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="squad" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="store" />
    </Tabs>
  );
}

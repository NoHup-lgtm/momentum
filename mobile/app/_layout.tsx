import { useEffect } from 'react';
import { Animated, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Lora_400Regular } from '@expo-google-fonts/lora';
import { JetBrainsMono_400Regular, JetBrainsMono_700Bold } from '@expo-google-fonts/jetbrains-mono';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { useLangStore } from '../lib/i18n';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

// Inner navigator — must be inside ThemeProvider to call useTheme()
function RootNavigator() {
  const { colors, activationProgress } = useTheme();

  const [fontsLoaded] = useFonts({
    Lora_400Regular,
    JetBrainsMono_400Regular,
    JetBrainsMono_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  // Carrega a preferência de idioma salva (sobrepõe a detecção do device).
  useEffect(() => {
    useLangStore.getState().loadLang();
  }, []);

  if (!fontsLoaded) return null;

  // Flash overlay fires on theme change
  const flashOpacity = activationProgress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.18, 0],
  });

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="ranking"      options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="achievements" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="friends"      options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="friend-invite" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="user-profile" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="feed"         options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="subscription" options={{ animation: 'slide_from_bottom' }} />
        </Stack>

        {/* White flash on theme activation */}
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute', inset: 0,
            backgroundColor: colors.accent,
            opacity: flashOpacity,
          }}
        />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootNavigator />
    </ThemeProvider>
  );
}

import { Stack } from 'expo-router';
import { C } from '../../constants/design';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.bg } }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}

import { Redirect } from 'expo-router';

// Redireciona para onboarding por padrão
// No futuro: checar token salvo → redirecionar para (tabs) se autenticado
export default function Index() {
  return <Redirect href="/(auth)" />;
}

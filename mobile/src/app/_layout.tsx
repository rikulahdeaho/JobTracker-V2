import { ClerkProvider, useAuth } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from '../lib/theme';
import { SessionProvider } from '../lib/queries';
import { Login } from '../components/Login';
import { Copy, Screen } from '../components/ui';
import { baseURL } from '../lib/api';
const key = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
export default function RootLayout() {
  return <ThemeProvider>{key && baseURL ? <ClerkProvider publishableKey={key} tokenCache={tokenCache}><AuthenticatedLayout /></ClerkProvider> : <Screen title="JobTracker"><Copy>The account or API configuration is missing. Set the public configuration in mobile/.env.local and restart the app.</Copy></Screen>}</ThemeProvider>;
}
function AuthenticatedLayout() {
  const { isLoaded, isSignedIn, userId, sessionId } = useAuth();
  const { colors, dark } = useTheme();
  if (!isLoaded) return <Screen title="JobTracker"><Copy>Checking your session…</Copy></Screen>;
  return <><StatusBar style={dark ? 'light' : 'dark'} />{isSignedIn ? <SessionProvider key={`${userId}:${sessionId}`}><Stack screenOptions={{ headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.text, contentStyle: { backgroundColor: colors.background } }}>
    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    <Stack.Screen name="applications/[id]" options={{ title: 'Application' }} />
    <Stack.Screen name="applications/edit" options={{ title: 'Application details' }} />
    <Stack.Screen name="applications/activity" options={{ title: 'Record activity' }} />
  </Stack></SessionProvider> : <Login />}</>;
}

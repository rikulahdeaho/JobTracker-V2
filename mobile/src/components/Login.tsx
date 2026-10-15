import { useHostedAuth } from '@clerk/expo/hosted-auth';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Copy, ErrorNotice } from './ui';
import { useTheme } from '../lib/theme';
export function Login() {
  const { startHostedAuth } = useHostedAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();
  const { colors } = useTheme();
  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', padding: 28, gap: 24, width: '100%', maxWidth: 560, alignSelf: 'center' }}>
    <Copy title>JobTracker</Copy><Copy heading>Your job search, within reach.</Copy>
    <Copy muted>Sign in to see your applications, recorded dates and next steps. Your web and mobile apps share the same account.</Copy>
    <Button label={busy ? 'Opening sign in…' : 'Sign in or create an account'} disabled={busy} onPress={() => { setBusy(true); setError(undefined); void startHostedAuth({ mode: 'sign-in' }).catch(setError).finally(() => setBusy(false)); }} />
    {error ? <ErrorNotice error={error} /> : null}
  </SafeAreaView>;
}

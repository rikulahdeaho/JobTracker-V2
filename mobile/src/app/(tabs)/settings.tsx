import { useClerk, useUser } from '@clerk/expo';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Button, Choice, Copy, Disclosure, ErrorNotice, Screen, Section } from '../../components/ui';
import { useTheme } from '../../lib/theme';
export default function Settings() {
  const { mode, setMode } = useTheme();
  const { user } = useUser();
  const { signOut } = useClerk();
  const client = useQueryClient();
  const [error, setError] = useState<unknown>();
  const [busy, setBusy] = useState(false);
  return <Screen title="Settings" description="Make JobTracker comfortable to use.">
    <Section title="Appearance"><Choice label="Theme" value={mode} onChange={setMode} options={[{ value: 'system', label: 'System' }, { value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} /><Copy muted>Your choice is remembered on this device.</Copy></Section>
    <Section title="Your account"><Copy>{user?.fullName || user?.primaryEmailAddress?.emailAddress || 'Signed in'}</Copy><Copy muted>Your mobile and web applications share the same account and database.</Copy><Button secondary label={busy ? 'Signing out…' : 'Sign out'} disabled={busy} onPress={() => { setBusy(true); void client.cancelQueries().then(() => { client.clear(); return signOut(); }).catch(setError).finally(() => setBusy(false)); }} />{error ? <ErrorNotice error={error} /> : null}</Section>
    <Section title="Your data"><Copy muted>Your applications are saved to your account. Search and filters only change the current view. Pull down on a list to refresh changes made on the web.</Copy></Section>
    <Disclosure title="future preferences"><Copy muted>Profile preferences, tracking preferences and export are previews in the web app and are not available yet.</Copy></Disclosure>
  </Screen>;
}

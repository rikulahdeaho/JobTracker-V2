import { useState, type PropsWithChildren, type ReactNode } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Linking, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '../lib/theme';
import { errorMessage } from '../lib/api';
import type { JobApplication } from '../domain/types/application';
import { applicationStatusLabel } from '../domain/utils/applicationStatus';
import { getApplicationNextAction } from '../domain/utils/applicationNextAction';

export function Copy({ children, muted, title, heading }: PropsWithChildren<{ muted?: boolean; title?: boolean; heading?: boolean }>) {
  const { colors } = useTheme();
  return <Text accessibilityRole={title || heading ? 'header' : undefined} style={{ color: muted ? colors.muted : colors.text, fontSize: title ? 30 : heading ? 21 : 16, fontWeight: title || heading ? '700' : '400', lineHeight: title ? 37 : heading ? 28 : 24 }}>{children}</Text>;
}
export function Button({ label, onPress, secondary, danger, disabled }: { label: string; onPress: () => void; secondary?: boolean; danger?: boolean; disabled?: boolean }) {
  const { colors } = useTheme();
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled: !!disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => ({ minHeight: 48, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, borderWidth: secondary ? 1 : 0, borderColor: colors.border, backgroundColor: secondary ? colors.surface : danger ? colors.error : colors.accent, opacity: disabled ? 0.55 : pressed ? 0.75 : 1, alignItems: 'center', justifyContent: 'center' })}>
    <Text style={{ fontSize: 16, fontWeight: '600', color: secondary ? danger ? colors.error : colors.accent : danger ? colors.surface : colors.onAccent }}>{label}</Text>
  </Pressable>;
}
export function Screen({ title, description, children, refreshing = false, onRefresh }: PropsWithChildren<{ title: string; description?: string; refreshing?: boolean; onRefresh?: () => void }>) {
  const { colors } = useTheme();
  return <SafeAreaView edges={['left', 'right']} style={{ flex: 1, backgroundColor: colors.background }}><KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={{ padding: 20, paddingBottom: 48, gap: 24, width: '100%', maxWidth: 760, alignSelf: 'center' }} refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} /> : undefined}>
      <View style={{ gap: 8 }}><Copy title>{title}</Copy>{description ? <Copy muted>{description}</Copy> : null}</View>{children}
    </ScrollView>
  </KeyboardAvoidingView></SafeAreaView>;
}
export function Section({ title, description, children }: PropsWithChildren<{ title: string; description?: string }>) {
  return <View style={{ gap: 12 }}><Copy heading>{title}</Copy>{description ? <Copy muted>{description}</Copy> : null}{children}</View>;
}
export function Panel({ children }: PropsWithChildren) {
  const { colors } = useTheme();
  return <View style={{ backgroundColor: colors.quiet, borderRadius: 8, padding: 20, gap: 12 }}>{children}</View>;
}
export function Row({ children }: PropsWithChildren) {
  const { colors } = useTheme();
  return <View style={{ paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.border, gap: 6 }}>{children}</View>;
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  const { colors } = useTheme();
  return <View style={{ gap: 8 }}><Copy>{label}</Copy><TextInput accessibilityLabel={label} placeholderTextColor={colors.muted} {...props} style={[{ color: colors.text, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 12, minHeight: 48, fontSize: 16, textAlignVertical: props.multiline ? 'top' : 'center' }, props.style]} /></View>;
}
export function Choice<T extends string>({ label, value, options, onChange, disabled }: { label: string; value: T; options: { value: T; label: string; disabled?: boolean }[]; onChange: (value: T) => void; disabled?: boolean }) {
  const { colors } = useTheme();
  return <View style={{ gap: 8 }}><Copy>{label}</Copy><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{options.map(option => {
    const selected = value === option.value;
    return <Pressable key={option.value} disabled={disabled || option.disabled} accessibilityRole="radio" accessibilityLabel={option.label} accessibilityState={{ checked: selected, disabled: !!(disabled || option.disabled) }} onPress={() => onChange(option.value)} style={({ pressed }) => ({ minHeight: 48, justifyContent: 'center', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: selected ? colors.accent : colors.border, backgroundColor: selected ? colors.quiet : colors.surface, opacity: disabled || option.disabled ? 0.5 : pressed ? 0.7 : 1 })}>
      <Text style={{ fontSize: 15, fontWeight: selected ? '600' : '400', color: selected ? colors.accent : colors.text }}>{option.label}</Text>
    </Pressable>;
  })}</View></View>;
}
export function Disclosure({ title, children }: PropsWithChildren<{ title: string }>) {
  // A native button keeps optional fields available without a long first screen.
  const [open, setOpen] = useState(false);
  return <View style={{ gap: 16 }}><Button secondary label={`${open ? 'Hide' : 'Show'} ${title}`} onPress={() => setOpen(!open)} />{open ? children : null}</View>;
}
export function ErrorNotice({ error }: { error: unknown }) {
  const { colors } = useTheme();
  return <Text accessibilityRole="alert" style={{ fontSize: 16, lineHeight: 24, color: colors.error }}>{errorMessage(error)}</Text>;
}
export function DataState({ pending, error, retry, children }: PropsWithChildren<{ pending: boolean; error: unknown; retry: () => void }>) {
  const { colors } = useTheme();
  if (pending) return <View style={{ gap: 12 }}><ActivityIndicator size="large" color={colors.accent} /><Copy muted>Loading your applications…</Copy></View>;
  if (error) return <View style={{ gap: 12 }}><ErrorNotice error={error} /><Button label="Try again" onPress={retry} /></View>;
  return <>{children}</>;
}
export function Status({ application }: { application: JobApplication }) {
  const { colors } = useTheme();
  return <Text style={{ alignSelf: 'flex-start', borderWidth: 1, borderColor: colors.border, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4, fontSize: 14, color: application.status === 'Offer' ? colors.success : colors.muted }}>{applicationStatusLabel[application.status]}</Text>;
}
export function ApplicationRow({ application, trailing }: { application: JobApplication; trailing?: ReactNode }) {
  const { colors } = useTheme();
  const action = getApplicationNextAction(application);
  return <Pressable accessibilityRole="button" accessibilityLabel={`${application.jobTitle}, ${application.companyName}. ${action.title}. Open application.`} onPress={() => router.push({ pathname: '/applications/[id]', params: { id: application.id } })} style={({ pressed }) => ({ paddingVertical: 18, borderBottomWidth: 1, borderColor: colors.border, gap: 6, opacity: pressed ? 0.65 : 1 })}>
    <Copy heading>{application.jobTitle}</Copy><Copy muted>{application.companyName}</Copy><Status application={application} />
    <Text style={{ fontSize: 16, color: action.needsAttention ? colors.accent : colors.muted }}>{action.title}</Text>{trailing}
  </Pressable>;
}
export function ExternalLink({ label, url }: { label: string; url: string }) {
  const [error, setError] = useState<unknown>();
  return <View style={{ gap: 8 }}><Button secondary label={label} onPress={() => {
    if (!/^(https?:\/\/|mailto:)/i.test(url)) { setError(new Error('This link must use https, http or email.')); return; }
    void Linking.openURL(url).catch(setError);
  }} />{error ? <ErrorNotice error={error} /> : null}</View>;
}
export function dateLabel(value: string | null) {
  if (!value) return 'Not recorded';
  return new Date(value.length === 10 ? `${value}T12:00:00` : value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

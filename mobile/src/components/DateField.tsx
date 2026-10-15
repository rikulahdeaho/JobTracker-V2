import { useState } from 'react';
import { Platform, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button, Copy, Field, dateLabel } from './ui';
import { useTheme } from '../lib/theme';
export function localDate(value: Date) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
}
export function DateField({ label, value, onChange, time = false, disabled = false }: { label: string; value: string; onChange: (value: string) => void; time?: boolean; disabled?: boolean }) {
  const [picking, setPicking] = useState<'date' | 'time' | null>(null);
  const [fallbackDate] = useState(() => new Date());
  const { dark } = useTheme();
  const parsed = value ? new Date(time ? value : `${value}T12:00:00`) : fallbackDate;
  const date = Number.isNaN(parsed.getTime()) ? fallbackDate : parsed;
  if (Platform.OS === 'web') return <Field label={`${label} (${time ? 'YYYY-MM-DD HH:mm, local time' : 'YYYY-MM-DD'})`} value={value} editable={!disabled} onChangeText={onChange} placeholder={time ? '2026-10-05T14:30' : '2026-10-05'} />;
  return <View style={{ gap: 8 }}><Copy>{label}</Copy>
    <Button secondary disabled={disabled} label={value ? time ? date.toLocaleString() : dateLabel(value) : 'Choose date'} onPress={() => setPicking('date')} />
    {time ? <Button secondary disabled={disabled} label="Choose time" onPress={() => setPicking('time')} /> : null}
    {value ? <Button secondary disabled={disabled} label={`Clear ${label.toLowerCase()}`} onPress={() => onChange('')} /> : null}
    {picking ? <DateTimePicker value={date} mode={picking} display={Platform.OS === 'ios' ? 'spinner' : 'default'} themeVariant={dark ? 'dark' : 'light'} onChange={(event, selected) => {
      if (Platform.OS !== 'ios') setPicking(null);
      if (event.type !== 'dismissed' && selected) onChange(time ? `${localDate(selected)}T${String(selected.getHours()).padStart(2, '0')}:${String(selected.getMinutes()).padStart(2, '0')}` : localDate(selected));
    }} /> : null}
    {picking && Platform.OS === 'ios' ? <Button label="Done" onPress={() => setPicking(null)} /> : null}
  </View>;
}

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { useColorScheme } from 'react-native';

const light = { background: '#F3F5F6', surface: '#FFFFFF', quiet: '#E9EEF2', text: '#222B34', muted: '#586672', border: '#D7DFE5', accent: '#235FC7', onAccent: '#FFFFFF', error: '#B91C1C', success: '#166534' };
const dark: typeof light = { background: '#161B20', surface: '#1E252C', quiet: '#252E37', text: '#EAF0F5', muted: '#A8B5C1', border: '#35404C', accent: '#89B4FF', onAccent: '#122033', error: '#FB7185', success: '#34D399' };
type Mode = 'system' | 'light' | 'dark';
const ThemeContext = createContext({ colors: light, dark: false, mode: 'system' as Mode, setMode: (_mode: Mode) => {} });
export function ThemeProvider({ children }: PropsWithChildren) {
  const system = useColorScheme();
  const [mode, updateMode] = useState<Mode>('system');
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { let active = true; void AsyncStorage.getItem('jobtracker.theme').then(value => {
    if (active && (value === 'light' || value === 'dark' || value === 'system')) updateMode(value);
  }).catch(() => {}).finally(() => { if (active) setLoaded(true); }); return () => { active = false; }; }, []);
  const isDark = mode === 'dark' || (mode === 'system' && system === 'dark');
  const setMode = (next: Mode) => { updateMode(next); void AsyncStorage.setItem('jobtracker.theme', next).catch(() => {}); };
  return <ThemeContext.Provider value={{ colors: isDark ? dark : light, dark: isDark, mode, setMode }}>{loaded ? children : null}</ThemeContext.Provider>;
}
export const useTheme = () => useContext(ThemeContext);

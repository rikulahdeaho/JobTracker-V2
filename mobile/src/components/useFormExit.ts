import { usePreventRemove } from 'expo-router/react-navigation';
import { useNavigation } from 'expo-router';
import { Alert, Platform } from 'react-native';
import { useEffect, useRef } from 'react';
export function useFormExit(dirty: boolean, saving: boolean) {
  const navigation = useNavigation();
  const allowExit = useRef(false);
  usePreventRemove(dirty || saving, ({ data }) => {
    if (allowExit.current) { navigation.dispatch(data.action); return; }
    if (saving) return;
    const discard = () => { allowExit.current = true; navigation.dispatch(data.action); };
    if (Platform.OS === 'web') {
      if (window.confirm('Discard your unsaved changes?')) discard();
    } else Alert.alert('Discard changes?', 'Your unsaved changes will be lost.', [{ text: 'Keep editing', style: 'cancel' }, { text: 'Discard', style: 'destructive', onPress: discard }]);
  });
  useEffect(() => {
    if (Platform.OS !== 'web' || !dirty) return;
    const handler = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);
  return () => { allowExit.current = true; };
}

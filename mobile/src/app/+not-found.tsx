import { router } from 'expo-router';
import { Button, Screen } from '../components/ui';
export default function NotFound() { return <Screen title="Page not found" description="This screen is not available."><Button label="Go to dashboard" onPress={() => router.replace('/')} /></Screen>; }

import { SignIn } from '@clerk/expo/web';
import { View } from 'react-native';
import { Screen, Copy } from './ui';
export function Login() {
  return <Screen title="JobTracker" description="Your applications and what to do next."><Copy muted>Sign in with the same account you use on the web.</Copy><View style={{ alignItems: 'center' }}><SignIn routing="hash" /></View></Screen>;
}

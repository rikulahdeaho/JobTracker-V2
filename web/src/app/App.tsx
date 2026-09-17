import type { PropsWithChildren } from "react";
import { ClerkFailed, ClerkLoaded, ClerkLoading, ClerkProvider } from "@clerk/react";
import { Alert, Button, CircularProgress } from "@mui/material";
import { AuthenticationBoundary, AuthScreen } from "../features/auth/AuthenticationBoundary";
import { ThemeModeProvider } from "./ThemeModeContext";

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.trim();

function App({ children }: PropsWithChildren) {
  return (
    <ThemeModeProvider>
      {publishableKey ? <ClerkProvider publishableKey={publishableKey}>
        <ClerkLoading><AuthScreen><CircularProgress aria-label="Loading authentication" /></AuthScreen></ClerkLoading>
        <ClerkFailed><AuthScreen>
          <Alert severity="error">Sign in is unavailable. Check your connection and reload.</Alert>
          <Button onClick={() => window.location.reload()}>Reload</Button>
        </AuthScreen></ClerkFailed>
        <ClerkLoaded><AuthenticationBoundary>{children}</AuthenticationBoundary></ClerkLoaded>
      </ClerkProvider> : <AuthScreen>
        <Alert severity="error">Set VITE_CLERK_PUBLISHABLE_KEY in web/.env.local and restart the frontend.</Alert>
      </AuthScreen>}
    </ThemeModeProvider>
  );
}

export default App;

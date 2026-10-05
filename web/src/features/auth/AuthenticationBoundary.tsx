import { SignIn, useAuth } from "@clerk/react";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import { Alert, Box, Button, CircularProgress, Container, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useLayoutEffect, useState, type PropsWithChildren } from "react";
import { bindApiSession } from "../../lib/apiClient";
import { useThemeMode } from "../../app/useThemeMode";
import { ApplicationsProvider } from "../applications/context/ApplicationsProvider";

export function AuthScreen({ children }: PropsWithChildren) {
  const { mode, toggleMode } = useThemeMode();
  return <Box component="main" sx={{ minHeight: "100svh", bgcolor: "background.default", display: "flex", flexDirection: "column" }}>
    <Box sx={{ display: "flex", justifyContent: "flex-end", p: { xs: 2, sm: 3 } }}>
      <Button onClick={toggleMode} startIcon={mode === "dark" ? <WbSunnyOutlinedIcon /> : <DarkModeOutlinedIcon />}>
        {mode === "dark" ? "Use light mode" : "Use dark mode"}
      </Button>
    </Box>
    <Container maxWidth="xs" sx={{ my: "auto", pt: 2, pb: { xs: 5, sm: 10 } }}>
      <Stack spacing={3} sx={{ minWidth: 0 }}>
        <Box>
          <Typography component="h1" variant="h4">JobTracker</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>Your applications, activity and next steps.</Typography>
        </Box>
        {children}
      </Stack>
    </Container>
  </Box>;
}

function SignInScreen() {
  const theme = useTheme();
  return <AuthScreen>
    <SignIn routing="hash" fallbackRedirectUrl="/dashboard" signUpFallbackRedirectUrl="/dashboard"
      fallback={<CircularProgress aria-label="Loading sign in" />}
      appearance={{
        variables: {
          colorPrimary: theme.palette.primary.main,
          colorPrimaryForeground: theme.palette.primary.contrastText,
          colorBackground: theme.palette.background.paper,
          colorForeground: theme.palette.text.primary,
          colorMutedForeground: theme.palette.text.secondary,
          colorInput: theme.palette.background.paper,
          colorInputForeground: theme.palette.text.primary,
          colorBorder: theme.palette.divider,
          colorDanger: theme.palette.error.main,
          colorNeutral: theme.palette.text.primary,
          fontFamily: theme.typography.fontFamily,
          borderRadius: "8px",
        },
        elements: {
          rootBox: { width: "100%" },
          cardBox: { width: "100%", boxShadow: "none", border: `1px solid ${theme.palette.divider}` },
          card: { boxShadow: "none" },
          footer: { background: theme.palette.action.hover },
          formButtonPrimary: { minHeight: "44px", backgroundImage: "none", boxShadow: "none" },
          socialButtonsBlockButton: { minHeight: "44px", border: `1px solid ${theme.palette.divider}`, boxShadow: "none" },
          formFieldInput: { minHeight: "44px", border: `1px solid ${theme.palette.divider}`, boxShadow: "none" },
        },
      }} />
  </AuthScreen>;
}

function AuthenticatedSession({ children }: PropsWithChildren) {
  const { getToken, signOut } = useAuth();
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000, retry: false }, mutations: { retry: false } },
  }));
  const [ready, setReady] = useState(false);
  const [expired, setExpired] = useState(false);
  const [signOutError, setSignOutError] = useState(false);

  useLayoutEffect(() => {
    const unbind = bindApiSession({ getToken, onUnauthorized: () => {
      queryClient.clear();
      setExpired(true);
    } });
    setReady(true);
    return () => {
      unbind();
      // clear destroys queries (aborting their signals) and removes mutations.
      // Late mutation callbacks can only reach this discarded client.
      queryClient.clear();
    };
  }, [getToken, queryClient]);

  if (expired) return <AuthScreen>
    <Alert severity="warning">Your session could not be verified. Please sign out and sign in again.</Alert>
    {signOutError && <Alert severity="error">Sign out failed. Please try again.</Alert>}
    <Button onClick={() => { void signOut().catch(() => setSignOutError(true)); }}>Sign out</Button>
  </AuthScreen>;
  if (!ready) return <AuthScreen><CircularProgress aria-label="Preparing your session" /></AuthScreen>;
  return <QueryClientProvider client={queryClient}>
    <ApplicationsProvider>{children}</ApplicationsProvider>
  </QueryClientProvider>;
}

export function AuthenticationBoundary({ children }: PropsWithChildren) {
  const { isLoaded, isSignedIn, userId, sessionId } = useAuth();
  if (!isLoaded) return <AuthScreen>
    <CircularProgress aria-label="Loading authentication" />
    <Typography color="text.secondary">Connecting to sign in. If this takes too long, reload and check your connection.</Typography>
  </AuthScreen>;
  if (!isSignedIn || !userId || !sessionId) return <SignInScreen />;
  return <AuthenticatedSession key={`${userId}:${sessionId}`}>{children}</AuthenticatedSession>;
}

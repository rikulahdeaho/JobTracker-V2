import { SignInButton, useAuth } from "@clerk/react";
import { Alert, Button, CircularProgress, Container, Paper, Stack, Typography } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useLayoutEffect, useState, type PropsWithChildren } from "react";
import { bindApiSession } from "../../lib/apiClient";
import { ApplicationsProvider } from "../applications/context/ApplicationsProvider";

export function AuthScreen({ children }: PropsWithChildren) {
  return <Container maxWidth="sm" sx={{ py: { xs: 5, sm: 10 } }}>
    <Paper sx={{ p: { xs: 3, sm: 4 } }}><Stack spacing={3} alignItems="center" sx={{ textAlign: "center" }}>
      <Typography component="h1" variant="h4" fontWeight={600}>JobTracker</Typography>
      <Typography color="text.secondary">Your applications, activity and next steps.</Typography>
      {children}
    </Stack></Paper>
  </Container>;
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
  if (!isSignedIn || !userId || !sessionId) return <AuthScreen>
    <Typography>Track your job applications and next actions.</Typography>
    <SignInButton mode="modal"><Button variant="contained">Sign in</Button></SignInButton>
  </AuthScreen>;
  return <AuthenticatedSession key={`${userId}:${sessionId}`}>{children}</AuthenticatedSession>;
}

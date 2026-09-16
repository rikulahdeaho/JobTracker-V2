import { Alert, Button, LinearProgress, Stack, Typography } from "@mui/material";
import { getApiErrorMessage } from "../../../lib/apiClient";

type ApplicationDataStateProps = {
  isPending: boolean;
  error: Error | null;
  onRetry: () => void;
};

export function ApplicationDataState({ isPending, error, onRetry }: ApplicationDataStateProps) {
  if (error) {
    return (
      <Alert severity="error" action={<Button color="inherit" onClick={onRetry}>Retry</Button>}>
        Could not load applications. {getApiErrorMessage(error)}
      </Alert>
    );
  }

  if (isPending) {
    return (
      <Stack gap={1.5} role="status">
        <Typography color="text.secondary">Loading applications…</Typography>
        <LinearProgress aria-label="Loading applications" />
      </Stack>
    );
  }

  return null;
}

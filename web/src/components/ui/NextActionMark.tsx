import { Box, Stack } from "@mui/material";

export function NextActionMark() {
  return <Stack component="span" direction="row" alignItems="center" gap={0.75} aria-hidden="true" sx={{ color: "primary.main", flexShrink: 0 }}>
    <Box component="span" sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "currentColor" }} />
    <Box component="span" sx={{ width: 16, height: "1px", bgcolor: "currentColor" }} />
    <Box component="span" sx={{ width: 8, height: 8, borderRadius: "50%", border: 1, borderColor: "text.secondary" }} />
  </Stack>;
}

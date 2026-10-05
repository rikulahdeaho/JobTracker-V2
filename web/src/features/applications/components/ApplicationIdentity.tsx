import { Stack, Typography } from "@mui/material";

type ApplicationIdentityProps = {
  jobTitle: string;
  companyName: string;
  heading?: "h1" | "h2" | "h3";
  size?: "page" | "row";
};

export function ApplicationIdentity({ jobTitle, companyName, heading = "h2", size = "row" }: ApplicationIdentityProps) {
  return (
    <Stack gap={0.5} sx={{ minWidth: 0 }}>
      <Typography component={heading} variant={size === "page" ? "h4" : "h6"}
        sx={{ fontWeight: 700, overflowWrap: "anywhere", textWrap: "balance", ...(size === "page" ? { fontSize: { xs: "1.625rem", md: "1.875rem" } } : {}) }}>
        {jobTitle}
      </Typography>
      <Typography color="text.secondary" sx={{ fontWeight: 500, overflowWrap: "anywhere" }}>{companyName}</Typography>
    </Stack>
  );
}

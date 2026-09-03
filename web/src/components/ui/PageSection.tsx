import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import type { PropsWithChildren, ReactNode } from "react";

type PageShellProps = PropsWithChildren<{
  maxWidth?: number;
}>;

type PageHeaderProps = {
  title: string;
  description: string;
  actions?: ReactNode;
};

type SectionCardProps = PropsWithChildren<{
  title: string;
  description?: string;
  action?: ReactNode;
}>;

export function PageShell({ children, maxWidth = 1536 }: PageShellProps) {
  return (
    <Box sx={{ width: "100%", maxWidth, mx: "auto" }}>
      <Stack gap={{ xs: 2.5, md: 3 }}>{children}</Stack>
    </Box>
  );
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", md: "center" }}
      gap={2.5}
    >
      <Box sx={{ maxWidth: 720 }}>
        <Typography variant="h4" gutterBottom sx={{ lineHeight: 1.12 }}>
          {title}
        </Typography>
        <Typography color="text.secondary" sx={{ lineHeight: 1.6 }}>
          {description}
        </Typography>
      </Box>
      {actions ? <Box sx={{ width: { xs: "100%", md: "auto" } }}>{actions}</Box> : null}
    </Stack>
  );
}

export function SectionCard({ title, description, action, children }: SectionCardProps) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: { xs: 2.25, md: 3 } }}>
        <Stack gap={2.25} sx={{ height: "100%" }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            gap={1.5}
          >
            <Box>
              <Typography variant="h6" sx={{ lineHeight: 1.25 }}>
                {title}
              </Typography>
              {description ? (
                <Typography color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.55 }}>
                  {description}
                </Typography>
              ) : null}
            </Box>
            {action}
          </Stack>
          {children}
        </Stack>
      </CardContent>
    </Card>
  );
}

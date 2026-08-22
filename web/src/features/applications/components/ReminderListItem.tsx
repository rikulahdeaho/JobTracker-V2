import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import { Chip, ListItem, ListItemIcon, ListItemText, Stack, Typography } from "@mui/material";
import type { ChipProps, Theme } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { getSemanticChipStyles } from "../../../app/theme";
import type { Reminder } from "../types/workflow";
import { formatApplicationDate } from "../utils/applicationPresentation";
import { getReminderPresentation } from "../utils/applicationWorkflow";

type ReminderListItemProps = {
  reminder: Reminder;
  borderTop?: boolean;
};

export function ReminderListItem({ reminder, borderTop = false }: ReminderListItemProps) {
  const theme = useTheme();
  const presentation = getReminderPresentation(reminder.type);
  const paletteColor = getPaletteColor(presentation.color, theme);

  return (
    <ListItem
      disableGutters
      sx={{
        py: 1.5,
        borderTop: borderTop ? 1 : 0,
        borderColor: "divider",
        alignItems: "flex-start",
      }}
    >
      <ListItemIcon sx={{ minWidth: 40, pt: 0.5 }}>
        <NotificationsActiveOutlinedIcon color="primary" />
      </ListItemIcon>
      <ListItemText
        primary={
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={1.5}>
            <Typography fontWeight={600}>{reminder.title}</Typography>
            <Chip
              label={presentation.label}
              size="small"
              variant="outlined"
              sx={getSemanticChipStyles(paletteColor, theme.palette.mode)}
            />
          </Stack>
        }
        secondary={
          <Stack gap={0.75} sx={{ mt: 0.75 }}>
            <Typography color="text.secondary">
              {reminder.companyName} - {reminder.jobTitle}
            </Typography>
            <Typography color="text.secondary">{reminder.description}</Typography>
            <Typography variant="body2" color="text.secondary">
              Due {formatApplicationDate(reminder.dueDate, "No due date")}
            </Typography>
          </Stack>
        }
      />
    </ListItem>
  );
}

function getPaletteColor(color: ChipProps["color"], theme: Theme): string {
  switch (color) {
    case "primary":
      return theme.palette.primary.main;
    case "secondary":
      return theme.palette.secondary.main;
    case "success":
      return theme.palette.success.main;
    case "warning":
      return theme.palette.warning.main;
    case "error":
      return theme.palette.error.main;
    case "info":
      return theme.palette.info.main;
    case "default":
    case undefined:
      return theme.palette.text.secondary;
  }
}

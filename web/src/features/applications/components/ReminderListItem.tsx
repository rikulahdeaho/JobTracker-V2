import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import { Chip, ListItem, ListItemIcon, ListItemText, Stack, Typography } from "@mui/material";
import type { Reminder } from "../types/workflow";
import { formatApplicationDate } from "../utils/applicationPresentation";
import { getReminderPresentation } from "../utils/applicationWorkflow";

type ReminderListItemProps = {
  reminder: Reminder;
  borderTop?: boolean;
};

export function ReminderListItem({ reminder, borderTop = false }: ReminderListItemProps) {
  const presentation = getReminderPresentation(reminder.type);

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
            <Chip label={presentation.label} color={presentation.color} size="small" variant="outlined" />
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

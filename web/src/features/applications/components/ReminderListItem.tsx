import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import { Box, Chip, Link, ListItem, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import type { Reminder } from "../types/workflow";
import { formatApplicationDate } from "../utils/applicationPresentation";
import { getReminderPresentation } from "../utils/applicationWorkflow";
import { ApplicationIdentity } from "./ApplicationIdentity";

type ReminderListItemProps = { reminder: Reminder; borderTop?: boolean };

export function ReminderListItem({ reminder, borderTop = false }: ReminderListItemProps) {
  const presentation = getReminderPresentation(reminder.type);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDay = new Date(reminder.dueDate);
  dueDay.setHours(0, 0, 0, 0);
  const dated = reminder.category === "hardDate";
  const overdue = dated && dueDay < today;
  const dueToday = dated && dueDay.getTime() === today.getTime();
  return <ListItem disableGutters sx={{ py: 2, borderTop: borderTop ? 1 : 0, borderColor: "divider", alignItems: "flex-start" }}>
    <Stack direction={{ xs: "column", sm: "row" }} gap={2} sx={{ width: "100%", minWidth: 0 }}>
      <Box sx={{ width: { sm: 150 }, flexShrink: 0 }}>
        <Stack direction="row" gap={0.75} alignItems="center" color={overdue ? "error.main" : dueToday ? "warning.main" : "text.secondary"}>
          <CalendarTodayOutlinedIcon sx={{ fontSize: 20 }} />
          <Typography variant="body2" sx={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{formatApplicationDate(reminder.dueDate, "No date")}</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{dated ? overdue ? "Overdue commitment" : dueToday ? "Due today" : "Scheduled for" : "Suggested attention from"}</Typography>
      </Box>
      <Stack gap={0.75} sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1} flexWrap="wrap">
          <Typography fontWeight={600}>{reminder.title}</Typography>
          <Chip label={presentation.label} size="small" variant="outlined" />
        </Stack>
        <Link component={RouterLink} to={`/applications/${reminder.applicationId}`} aria-label={`${reminder.jobTitle} · ${reminder.companyName}`} underline="always" color="primary">
          <ApplicationIdentity jobTitle={reminder.jobTitle} companyName={reminder.companyName} heading="h3" />
        </Link>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: "65ch" }}>{reminder.description}</Typography>
      </Stack>
    </Stack>
  </ListItem>;
}

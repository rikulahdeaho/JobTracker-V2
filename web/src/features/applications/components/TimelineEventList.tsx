import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import MarkEmailUnreadOutlinedIcon from "@mui/icons-material/MarkEmailUnreadOutlined";
import RecordVoiceOverOutlinedIcon from "@mui/icons-material/RecordVoiceOverOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import { Box, List, ListItem, Typography } from "@mui/material";
import type { TimelineEvent } from "../types/workflow";
import { formatApplicationDate } from "../utils/applicationPresentation";

type TimelineEventListProps = {
  events: TimelineEvent[];
};

export function TimelineEventList({ events }: TimelineEventListProps) {
  if (events.length === 0) return <Typography color="text.secondary">No recorded events yet.</Typography>;
  return (
    <List disablePadding aria-label="Application history">
      {events.map((event, index) => (
        <ListItem
          key={event.id}
          disableGutters
          sx={{ py: 1.5, borderTop: index === 0 ? 0 : 1, borderColor: "divider", alignItems: "flex-start", display: "flex", flexWrap: { xs: "wrap", sm: "nowrap" }, gap: { xs: 0.75, sm: 2 } }}
        >
          <Typography component="time" dateTime={event.occurredAt} variant="body2" color="text.secondary"
            sx={{ width: { xs: "100%", sm: 104 }, flexShrink: 0, pt: 0.25, fontVariantNumeric: "tabular-nums" }}>
            {formatApplicationDate(event.occurredAt, "Recently")}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, minWidth: 0, flex: 1 }}>
            <Box sx={{ color: "text.secondary", display: "flex", pt: 0.25 }}>{getTimelineEventIcon(event.type)}</Box>
            <Box sx={{ minWidth: 0, overflowWrap: "anywhere" }}>
              <Typography sx={{ fontWeight: 600 }}>{event.title}</Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>{event.description}</Typography>
            </Box>
          </Box>
        </ListItem>
      ))}
    </List>
  );
}

function getTimelineEventIcon(type: TimelineEvent["type"]) {
  switch (type) {
    case "applicationCreated":
      return <WorkOutlineOutlinedIcon fontSize="small" />;
    case "applicationSent":
      return <TimelineOutlinedIcon fontSize="small" />;
    case "statusChanged":
      return <AccessTimeOutlinedIcon fontSize="small" />;
    case "followUpSent":
    case "contactReceived":
      return <MarkEmailUnreadOutlinedIcon fontSize="small" />;
    case "interviewScheduled":
      return <RecordVoiceOverOutlinedIcon fontSize="small" />;
    case "assignmentSubmitted":
    case "assignmentReceived":
      return <AssignmentTurnedInOutlinedIcon fontSize="small" />;
    case "offerReceived":
      return <CalendarMonthOutlinedIcon fontSize="small" />;
    case "rejected":
      return <AccessTimeOutlinedIcon fontSize="small" />;
  }
}

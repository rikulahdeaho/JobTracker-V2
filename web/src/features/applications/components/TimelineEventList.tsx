import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import MarkEmailUnreadOutlinedIcon from "@mui/icons-material/MarkEmailUnreadOutlined";
import RecordVoiceOverOutlinedIcon from "@mui/icons-material/RecordVoiceOverOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import { Avatar, List, ListItem, ListItemAvatar, ListItemText, Typography } from "@mui/material";
import type { TimelineEvent } from "../types/workflow";
import { formatApplicationDate } from "../utils/applicationPresentation";

type TimelineEventListProps = {
  events: TimelineEvent[];
};

export function TimelineEventList({ events }: TimelineEventListProps) {
  return (
    <List disablePadding>
      {events.map((event, index) => (
        <ListItem
          key={event.id}
          disableGutters
          sx={{ py: 1.5, borderTop: index === 0 ? 0 : 1, borderColor: "divider", alignItems: "flex-start" }}
        >
          <ListItemAvatar>
            <Avatar sx={{ width: 40, height: 40, bgcolor: "primary.50", color: "primary.main" }}>
              {getTimelineEventIcon(event.type)}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={event.title}
            secondary={
              <>
                <Typography component="span" display="block" color="text.secondary">
                  {formatApplicationDate(event.occurredAt, "Recently")}
                </Typography>
                <Typography component="span" display="block" color="text.secondary">
                  {event.description}
                </Typography>
              </>
            }
          />
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
    case "followUpPlanned":
      return <MarkEmailUnreadOutlinedIcon fontSize="small" />;
    case "interviewScheduled":
      return <RecordVoiceOverOutlinedIcon fontSize="small" />;
    case "assignmentReceived":
      return <AssignmentTurnedInOutlinedIcon fontSize="small" />;
    case "offerReceived":
      return <CalendarMonthOutlinedIcon fontSize="small" />;
    case "rejected":
      return <AccessTimeOutlinedIcon fontSize="small" />;
  }
}

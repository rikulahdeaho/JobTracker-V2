import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from "@mui/material";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { JobApplication } from "../types/application";
import type { CreateApplicationEventRequest } from "../types/workflow";
import { createApplicationEvent } from "../api/applicationsApi";
import { applicationQueryKey, applicationsQueryKey } from "../api/applicationQueries";
import { getApiErrorMessage } from "../../../lib/apiClient";

const eventLabels: Record<CreateApplicationEventRequest["type"], string> = {
  ContactReceived: "Recruiter reply received",
  ApplicationSent: "Application sent", FollowUpSent: "Follow-up sent",
  InterviewScheduled: "Interview scheduled", AssignmentReceived: "Assignment received",
  AssignmentSubmitted: "Assignment submitted", OfferReceived: "Offer received",
};

function localNow(): string {
  const date = new Date();
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export function ApplicationEventDialog({ application, onClose }: { application: JobApplication; onClose: () => void }) {
  const [type, setType] = useState<CreateApplicationEventRequest["type"]>(
    application.status === "Applied" ? "FollowUpSent" : application.status === "Interviewing" ? "InterviewScheduled"
      : application.status === "Assignment" ? "AssignmentReceived" : application.status === "Offer" ? "OfferReceived"
        : application.events.some(event => event.type === "ApplicationSent") ? "InterviewScheduled" : "ApplicationSent",
  );
  const [occurredAt, setOccurredAt] = useState(localNow);
  const [dueAt, setDueAt] = useState("");
  const [note, setNote] = useState("");
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (request: CreateApplicationEventRequest) => createApplicationEvent(application.id, request),
    onSuccess: async (updated) => {
      await queryClient.cancelQueries({ queryKey: applicationsQueryKey });
      queryClient.setQueryData(applicationQueryKey(updated.id), updated);
      queryClient.setQueryData<JobApplication[]>(applicationsQueryKey, current => current?.map(item => item.id === updated.id ? updated : item));
      await queryClient.invalidateQueries({ queryKey: applicationsQueryKey });
      onClose();
    },
  });
  const hasDueDate = ["InterviewScheduled", "AssignmentReceived", "OfferReceived"].includes(type);
  return (
    <Dialog open onClose={mutation.isPending ? undefined : onClose} fullWidth maxWidth="sm">
      <form onSubmit={event => {
        event.preventDefault();
        if (mutation.isPending) return;
        mutation.mutate({ type, occurredAt: new Date(occurredAt).toISOString(),
          dueAt: hasDueDate && dueAt ? new Date(dueAt).toISOString() : null, note: note.trim() || null });
      }}>
        <DialogTitle>Record activity</DialogTitle>
        <DialogContent>
          <Stack gap={2} sx={{ pt: 1 }}>
            <TextField select label="Activity" value={type} disabled={mutation.isPending}
              onChange={event => { setType(event.target.value as CreateApplicationEventRequest["type"]); setDueAt(""); }}>
              {(Object.entries(eventLabels) as [CreateApplicationEventRequest["type"], string][]).map(([value, label]) => (
                <MenuItem key={value} value={value} disabled={
                  (value === "ApplicationSent" && application.events.some(event => event.type === "ApplicationSent"))
                  || (value === "FollowUpSent" && application.status !== "Applied")
                  || (value === "AssignmentSubmitted" && application.status !== "Assignment")
                }>{label}</MenuItem>
              ))}
            </TextField>
            <TextField label="Activity occurred at" type="datetime-local" required value={occurredAt}
              disabled={mutation.isPending} onChange={event => setOccurredAt(event.target.value)}
              slotProps={{ inputLabel: { shrink: true }, htmlInput: { max: localNow() } }}
              helperText="When you sent the message or received/scheduled this step. Times use your local timezone." />
            {hasDueDate && <TextField label={type === "InterviewScheduled" ? "Interview date and time" : "Response / assignment deadline"}
              type="datetime-local" value={dueAt} required={type === "InterviewScheduled"} disabled={mutation.isPending}
              onChange={event => setDueAt(event.target.value)} slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: occurredAt } }} />}
            <TextField label="Activity note" multiline minRows={2} value={note} disabled={mutation.isPending}
              onChange={event => setNote(event.target.value)} slotProps={{ htmlInput: { maxLength: 4000 } }} />
            <Alert severity="info">Sending an application, scheduling an interview, receiving an assignment or receiving an offer also updates its status.</Alert>
            {mutation.error && <Alert severity="error">{getApiErrorMessage(mutation.error)}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={mutation.isPending}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={mutation.isPending}>{mutation.isPending ? "Saving…" : "Save activity"}</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

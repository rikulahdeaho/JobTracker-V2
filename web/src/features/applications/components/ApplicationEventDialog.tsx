import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { JobApplication } from "../types/application";
import type { CreateApplicationEventRequest } from "../types/workflow";
import { createApplicationEvent } from "../api/applicationsApi";
import { applicationQueryKey, applicationsQueryKey } from "../api/applicationQueries";
import { getApiErrorMessage } from "../../../lib/apiClient";
import { UnsavedChangesDialog } from "../../../components/ui/UnsavedChangesDialog";

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
  const [baseline] = useState(() => ({ type, occurredAt, dueAt, note }));
  const [confirmDiscard, setConfirmDiscard] = useState(false);
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
  const requestClose = () => {
    if (mutation.isPending) return;
    if (type !== baseline.type || occurredAt !== baseline.occurredAt || dueAt !== baseline.dueAt || note !== baseline.note) {
      setConfirmDiscard(true);
    } else onClose();
  };
  return (
    <><Dialog open onClose={requestClose} fullWidth maxWidth="sm" PaperProps={{ sx: { maxHeight: "calc(100dvh - 32px)", m: 2 } }}>
      <Box component="form" sx={{ display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }} onSubmit={event => {
        event.preventDefault();
        if (mutation.isPending) return;
        mutation.mutate({ type, occurredAt: new Date(occurredAt).toISOString(),
          dueAt: hasDueDate && dueAt ? new Date(dueAt).toISOString() : null, note: note.trim() || null });
      }}>
        <DialogTitle sx={{ fontWeight: 600 }}>Record activity</DialogTitle>
        <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack gap={2}>
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
            <Typography variant="body2" color="text.secondary">Sending an application, scheduling an interview, receiving an assignment or receiving an offer also updates its status.</Typography>
            {mutation.error && <Alert severity="error">{getApiErrorMessage(mutation.error)}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
          <Button onClick={requestClose} disabled={mutation.isPending}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={mutation.isPending}>{mutation.isPending ? "Saving…" : "Save activity"}</Button>
        </DialogActions>
      </Box>
    </Dialog>
    <UnsavedChangesDialog open={confirmDiscard} onKeepEditing={() => setConfirmDiscard(false)}
      onDiscard={() => { setConfirmDiscard(false); onClose(); }} />
    </>
  );
}

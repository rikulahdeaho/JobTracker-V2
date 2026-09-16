import type { ChangeEvent } from "react";
import { useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { PropsWithChildren } from "react";
import type { ApplicationStatus, JobApplicationFormValues } from "../types/application";
import { emptyApplicationFormValues } from "../utils/applicationForm";
import { applicationStatusLabel } from "../utils/applicationStatus";
import { getApiErrorMessage } from "../../../lib/apiClient";

type ApplicationFormDialogProps = {
  mode: "add" | "edit";
  open: boolean;
  initialValues?: JobApplicationFormValues;
  onClose: () => void;
  onSubmit: (values: JobApplicationFormValues) => Promise<void>;
};

type FormErrors = Partial<Record<"companyName" | "jobTitle", string>>;

const applicationStatuses = Object.keys(applicationStatusLabel) as ApplicationStatus[];

export function ApplicationFormDialog({
  mode,
  open,
  initialValues,
  onClose,
  onSubmit,
}: ApplicationFormDialogProps) {
  const [values, setValues] = useState<JobApplicationFormValues>(initialValues ?? emptyApplicationFormValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const submitting = useRef(false);

  const handleFieldChange =
    (field: keyof JobApplicationFormValues) => (event: ChangeEvent<HTMLInputElement>) => {
      setValues((currentValues) => ({
        ...currentValues,
        [field]: event.target.value,
      }));

      if (field === "companyName" || field === "jobTitle") {
        setErrors((currentErrors) => ({
          ...currentErrors,
          [field]: undefined,
        }));
      }
    };

  const handleSubmit = async () => {
    if (submitting.current) return;
    const nextErrors: FormErrors = {};

    if (values.companyName.trim().length === 0) {
      nextErrors.companyName = "Company name is required.";
    }

    if (values.jobTitle.trim().length === 0) {
      nextErrors.jobTitle = "Job title is required.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    submitting.current = true;
    setIsSaving(true);
    setSubmitError(null);
    try {
      await onSubmit(values);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
    } finally {
      submitting.current = false;
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isSaving ? undefined : onClose}
      fullWidth
      maxWidth="xl"
      PaperProps={{
        sx: {
          maxHeight: "calc(100vh - 48px)",
        },
      }}
    >
      <DialogTitle sx={{ pb: 1.5, fontSize: "1.25rem", fontWeight: 750 }}>
        {mode === "add" ? "Add Application" : "Edit Application"}
        <Typography component="span" variant="body2" color="text.secondary" sx={{ display: "block", mt: 0.5, fontWeight: 400 }}>
          Capture the essentials now and refine the details as the process moves.
        </Typography>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          px: { xs: 2.5, md: 3 },
          py: 2.5,
        }}
      >
        <Stack gap={2.5}>
          {submitError ? <Alert severity="error">{submitError}</Alert> : null}
          <FormSection
            title="Basic info"
            description="The minimum information needed to create a useful application card."
          >
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  disabled={isSaving}
                  label="Company"
                  value={values.companyName}
                  onChange={handleFieldChange("companyName")}
                  fullWidth
                  required
                  error={Boolean(errors.companyName)}
                  helperText={errors.companyName || "Required"}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  disabled={isSaving}
                  label="Job title"
                  value={values.jobTitle}
                  onChange={handleFieldChange("jobTitle")}
                  fullWidth
                  required
                  error={Boolean(errors.jobTitle)}
                  helperText={errors.jobTitle || "Required"}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  disabled={isSaving}
                  label="Job URL"
                  value={values.jobUrl}
                  onChange={handleFieldChange("jobUrl")}
                  fullWidth
                  placeholder="https://..."
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  disabled={isSaving}
                  label="Location"
                  value={values.location}
                  onChange={handleFieldChange("location")}
                  fullWidth
                  placeholder="Helsinki, remote, hybrid..."
                />
              </Grid>
            </Grid>
          </FormSection>

          <FormSection
            title="Tracking info"
            description="Status and dates power the local next-action and reminder views."
          >
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  disabled={isSaving}
                  select
                  label="Status"
                  value={values.status}
                  onChange={handleFieldChange("status")}
                  fullWidth
                >
                  {applicationStatuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {applicationStatusLabel[status]}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  disabled={isSaving}
                  label="Applied date"
                  type="date"
                  value={values.appliedDate}
                  onChange={handleFieldChange("appliedDate")}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  disabled={isSaving}
                  label="Deadline"
                  type="date"
                  value={values.deadline}
                  onChange={handleFieldChange("deadline")}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  disabled={isSaving}
                  label="Source"
                  value={values.source}
                  onChange={handleFieldChange("source")}
                  fullWidth
                  placeholder="LinkedIn, referral, company site..."
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  disabled={isSaving}
                  label="Salary range"
                  value={values.salaryRange}
                  onChange={handleFieldChange("salaryRange")}
                  fullWidth
                  placeholder="EUR 5,000 - 6,000 / month"
                />
              </Grid>
            </Grid>
          </FormSection>

          <FormSection
            title="Details"
            description="Optional context for tailoring follow-ups, interviews and decisions."
          >
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  disabled={isSaving}
                  label="Notes"
                  value={values.notes}
                  onChange={handleFieldChange("notes")}
                  fullWidth
                  multiline
                  minRows={2}
                  placeholder="Portfolio angle, recruiter notes, next prep ideas..."
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  disabled={isSaving}
                  label="Job description"
                  value={values.jobDescription}
                  onChange={handleFieldChange("jobDescription")}
                  fullWidth
                  multiline
                  minRows={3}
                  placeholder="Paste the most relevant role details here."
                />
              </Grid>
            </Grid>
          </FormSection>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: { xs: 2.5, md: 3 }, py: 2 }}>
        <Button onClick={onClose} disabled={isSaving}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={isSaving}>
          {isSaving ? "Saving…" : mode === "add" ? "Add application" : "Save changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

type FormSectionProps = PropsWithChildren<{
  title: string;
  description: string;
}>;

function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <Box>
      <Stack gap={0.5} sx={{ mb: 1.5 }}>
        <Typography variant="overline" color="primary.main">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Stack>
      <Divider sx={{ mb: 2 }} />
      {children}
    </Box>
  );
}

import type { ChangeEvent } from "react";
import { useEffect, useState } from "react";
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

type ApplicationFormDialogProps = {
  mode: "add" | "edit";
  open: boolean;
  initialValues?: JobApplicationFormValues;
  onClose: () => void;
  onSubmit: (values: JobApplicationFormValues) => void;
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
  const [values, setValues] = useState<JobApplicationFormValues>(emptyApplicationFormValues);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (open) {
      setValues(initialValues ?? emptyApplicationFormValues);
      setErrors({});
    }
  }, [initialValues, open]);

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

  const handleSubmit = () => {
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

    onSubmit(values);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
          <Alert severity="info">
            This flow updates local browser data only. No API or database changes are made yet.
          </Alert>
          <FormSection
            title="Basic info"
            description="The minimum information needed to create a useful application card."
          >
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
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
                  label="Job URL"
                  value={values.jobUrl}
                  onChange={handleFieldChange("jobUrl")}
                  fullWidth
                  placeholder="https://..."
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
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
                  label="Source"
                  value={values.source}
                  onChange={handleFieldChange("source")}
                  fullWidth
                  placeholder="LinkedIn, referral, company site..."
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
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
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {mode === "add" ? "Add application" : "Save changes"}
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

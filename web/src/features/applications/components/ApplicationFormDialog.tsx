import type { ChangeEvent } from "react";
import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{mode === "add" ? "Add Application" : "Edit Application"}</DialogTitle>
      <DialogContent dividers>
        <Stack gap={2.5} sx={{ pt: 1 }}>
          <Alert severity="info">
            This flow updates local React state only. No API or database changes are made yet.
          </Alert>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Company"
                value={values.companyName}
                onChange={handleFieldChange("companyName")}
                fullWidth
                required
                error={Boolean(errors.companyName)}
                helperText={errors.companyName}
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
                helperText={errors.jobTitle}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Job URL"
                value={values.jobUrl}
                onChange={handleFieldChange("jobUrl")}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
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
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Applied date"
                type="date"
                value={values.appliedDate}
                onChange={handleFieldChange("appliedDate")}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
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
                label="Location"
                value={values.location}
                onChange={handleFieldChange("location")}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Source"
                value={values.source}
                onChange={handleFieldChange("source")}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Salary range"
                value={values.salaryRange}
                onChange={handleFieldChange("salaryRange")}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Notes"
                value={values.notes}
                onChange={handleFieldChange("notes")}
                fullWidth
                multiline
                minRows={3}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Job description"
                value={values.jobDescription}
                onChange={handleFieldChange("jobDescription")}
                fullWidth
                multiline
                minRows={5}
              />
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {mode === "add" ? "Add application" : "Save changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

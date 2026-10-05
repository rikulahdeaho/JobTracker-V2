import type { ChangeEvent } from "react";
import { useEffect, useRef, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
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
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { PropsWithChildren, ReactNode } from "react";
import type { ApplicationStatus, JobApplicationFormValues } from "../types/application";
import { emptyApplicationFormValues } from "../utils/applicationForm";
import { cleanJobDescriptionFormatting } from "../utils/jobDescriptionFormatting";
import { applicationMethodLabels, followUpModeLabels, isValidContactEmail } from "../utils/applicationContact";
import { applicationStatusLabel } from "../utils/applicationStatus";
import { getApiErrorMessage } from "../../../lib/apiClient";
import { UnsavedChangesDialog } from "../../../components/ui/UnsavedChangesDialog";

type ApplicationFormDialogProps = {
  mode: "add" | "edit";
  open: boolean;
  initialValues?: JobApplicationFormValues;
  onClose: () => void;
  onSubmit: (values: JobApplicationFormValues) => Promise<void>;
};

type FormErrors = Partial<Record<"companyName" | "jobTitle" | "contactEmail" | "contactPerson", string>>;

const applicationStatuses = Object.keys(applicationStatusLabel) as ApplicationStatus[];

export function ApplicationFormDialog({
  mode,
  open,
  initialValues,
  onClose,
  onSubmit,
}: ApplicationFormDialogProps) {
  const [values, setValues] = useState<JobApplicationFormValues>(initialValues ?? emptyApplicationFormValues);
  const [baseline] = useState(() => ({ ...(initialValues ?? emptyApplicationFormValues) }));
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const submitting = useRef(false);
  const focusValidationError = useRef(false);
  const companyInput = useRef<HTMLInputElement>(null);
  const jobTitleInput = useRef<HTMLInputElement>(null);
  const contactPersonInput = useRef<HTMLInputElement>(null);
  const contactEmailInput = useRef<HTMLInputElement>(null);
  const [descriptionBeforeCleanup, setDescriptionBeforeCleanup] = useState<string | null>(null);
  const [contactExpanded, setContactExpanded] = useState(mode === "edit" && Boolean(
    initialValues?.contactPerson || initialValues?.contactEmail ||
    (initialValues?.followUpMode && initialValues.followUpMode !== "Unknown"),
  ));
  const [detailsExpanded, setDetailsExpanded] = useState(mode === "edit" && Boolean(
    initialValues?.salaryRange || initialValues?.notes,
  ));
  const showAppliedDate = Boolean(values.appliedDate) || !["Draft", "ToApply"].includes(values.status);
  const followUpHelp = values.followUpMode === "NotNeeded"
    ? "Follow-up suggestions are off; status reviews still apply."
    : values.followUpMode === "NotAvailable"
      ? "No direct follow-up channel; response monitoring still applies."
      : "Follow-up suggestions require a valid contact email.";

  const requestClose = () => {
    if (submitting.current) return;
    const dirty = (Object.keys(baseline) as (keyof JobApplicationFormValues)[])
      .some(field => values[field] !== baseline[field]);
    if (dirty) setConfirmDiscard(true);
    else onClose();
  };

  useEffect(() => {
    if (!focusValidationError.current) return;
    const firstInvalidInput = errors.companyName ? companyInput.current
      : errors.jobTitle ? jobTitleInput.current
        : errors.contactPerson ? contactPersonInput.current
          : errors.contactEmail ? contactEmailInput.current : null;
    if (firstInvalidInput) {
      firstInvalidInput.focus();
      focusValidationError.current = false;
    }
  }, [errors, contactExpanded]);

  const handleFieldChange =
    (field: keyof JobApplicationFormValues) => (event: ChangeEvent<HTMLInputElement>) => {
      if (field === "jobDescription") setDescriptionBeforeCleanup(null);
      setValues((currentValues) => ({
        ...currentValues,
        [field]: event.target.value,
      }));

      if (field === "companyName" || field === "jobTitle" || field === "contactEmail" || field === "contactPerson") {
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

    if (values.contactEmail.trim() && !isValidContactEmail(values.contactEmail.trim())) {
      nextErrors.contactEmail = "Enter a valid contact email address (at most 254 characters).";
    }
    if (values.contactPerson.length > 200) nextErrors.contactPerson = "Use at most 200 characters.";
    focusValidationError.current = Object.keys(nextErrors).length > 0;
    setErrors(nextErrors);
    if (nextErrors.contactEmail || nextErrors.contactPerson) setContactExpanded(true);

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
    <><Dialog
      open={open}
      onClose={requestClose}
      fullWidth
      maxWidth={false}
      PaperProps={{
        sx: {
          width: "calc(100% - 32px)",
          maxWidth: 1280,
          m: 2,
          maxHeight: "calc(100dvh - 32px)",
        },
      }}
    >
      <Box component="form" noValidate
        onSubmit={(event) => { event.preventDefault(); void handleSubmit(); }}
        sx={{ display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}>
      <DialogTitle sx={{ pb: 1.5, fontSize: "1.25rem", fontWeight: 600 }}>
        {mode === "add" ? "Add application" : "Edit application"}
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
          <FormSection title="Basic info">
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  disabled={isSaving}
                  label="Company"
                  inputRef={companyInput}
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
                  disabled={isSaving}
                  label="Job title"
                  inputRef={jobTitleInput}
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

          <FormSection title="Application">
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
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
              {showAppliedDate && <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  disabled={isSaving}
                  label="Applied date"
                  type="date"
                  value={values.appliedDate}
                  onChange={handleFieldChange("appliedDate")}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  helperText="Submission date. Leave blank if unknown."
                />
              </Grid>}
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  disabled={isSaving}
                  label="Application due date"
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
                  select fullWidth label="Application method" value={values.applicationMethod}
                  onChange={handleFieldChange("applicationMethod")}
                >
                  {Object.entries(applicationMethodLabels).map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
                </TextField>
              </Grid>
            </Grid>
          </FormSection>

          <OptionalFormSection title="Contact" expanded={contactExpanded} onChange={setContactExpanded} disabled={isSaving}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField inputRef={contactPersonInput} fullWidth disabled={isSaving} label="Contact person" value={values.contactPerson} onChange={handleFieldChange("contactPerson")} error={!!errors.contactPerson} helperText={errors.contactPerson} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField inputRef={contactEmailInput} fullWidth disabled={isSaving} label="Contact email" type="email" value={values.contactEmail} onChange={handleFieldChange("contactEmail")} error={!!errors.contactEmail} helperText={errors.contactEmail} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField select fullWidth disabled={isSaving} label="Follow-up preference" value={values.followUpMode} onChange={handleFieldChange("followUpMode")} helperText={followUpHelp}>
                  {Object.entries(followUpModeLabels).map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
                </TextField>
              </Grid>
            </Grid>
          </OptionalFormSection>

          <FormSection
            title="Job description"
            actions={<Stack direction="row" gap={0.5} flexWrap="wrap">
              <Button size="small" disabled={isSaving || !values.jobDescription.trim()} onClick={() => {
                const cleaned = cleanJobDescriptionFormatting(values.jobDescription);
                if (cleaned === values.jobDescription) return;
                setDescriptionBeforeCleanup(values.jobDescription);
                setValues(current => ({ ...current, jobDescription: cleaned }));
              }}>Clean formatting</Button>
              {descriptionBeforeCleanup !== null && <Button size="small" disabled={isSaving} onClick={() => {
                setValues(current => ({ ...current, jobDescription: descriptionBeforeCleanup }));
                setDescriptionBeforeCleanup(null);
              }}>Undo formatting</Button>}
            </Stack>}
          >
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  disabled={isSaving}
                  label="Job description"
                  value={values.jobDescription}
                  onChange={handleFieldChange("jobDescription")}
                  fullWidth
                  multiline
                  minRows={8}
                  maxRows={16}
                  placeholder="Paste the job advertisement, including responsibilities and requirements..."
                  helperText="Paste the job advertisement for later reference."
                />
              </Grid>
            </Grid>
          </FormSection>
          <OptionalFormSection title="More details" expanded={detailsExpanded} onChange={setDetailsExpanded} disabled={isSaving}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  disabled={isSaving} label="Salary range" value={values.salaryRange}
                  onChange={handleFieldChange("salaryRange")} fullWidth
                  placeholder="EUR 5,000 - 6,000 / month"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  disabled={isSaving}
                  label="Notes"
                  value={values.notes}
                  onChange={handleFieldChange("notes")}
                  fullWidth
                  multiline
                  minRows={3}
                  placeholder="Questions to ask, company impressions, or preparation ideas..."
                  helperText="Your own observations and questions."
                />
              </Grid>
            </Grid>
          </OptionalFormSection>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: { xs: 2.5, md: 3 }, py: 2 }}>
        <Button onClick={requestClose} disabled={isSaving}>Cancel</Button>
        <Button variant="contained" type="submit" disabled={isSaving}>
          {isSaving ? "Saving…" : mode === "add" ? "Add application" : "Save changes"}
        </Button>
      </DialogActions>
      </Box>
    </Dialog>
    <UnsavedChangesDialog open={confirmDiscard} onKeepEditing={() => setConfirmDiscard(false)}
      onDiscard={() => { setConfirmDiscard(false); onClose(); }} />
    </>
  );
}

type FormSectionProps = PropsWithChildren<{
  title: string;
  actions?: ReactNode;
}>;

function FormSection({ title, actions, children }: FormSectionProps) {
  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" sx={{ mb: 1 }}>
        <Typography component="h3" variant="body2" fontWeight={600}>
          {title}
        </Typography>
        {actions}
      </Stack>
      <Divider sx={{ mb: 2 }} />
      {children}
    </Box>
  );
}

type OptionalFormSectionProps = PropsWithChildren<{
  title: string;
  expanded: boolean;
  onChange: (expanded: boolean) => void;
  disabled: boolean;
}>;

function OptionalFormSection({ title, expanded, onChange, disabled, children }: OptionalFormSectionProps) {
  const sectionId = title.toLowerCase().replaceAll(" ", "-");
  return (
    <Accordion expanded={expanded} onChange={(_, next) => onChange(next)} disabled={disabled}
      disableGutters elevation={0} slotProps={{ transition: { unmountOnExit: true } }}
      sx={{ border: 1, borderColor: "divider", borderRadius: 1, "&::before": { display: "none" } }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} id={`${sectionId}-heading`} aria-controls={`${sectionId}-content`}>
        <Typography component="span" variant="body2" fontWeight={600} color="text.secondary">{title}</Typography>
      </AccordionSummary>
      <AccordionDetails id={`${sectionId}-content`}>{children}</AccordionDetails>
    </Accordion>
  );
}

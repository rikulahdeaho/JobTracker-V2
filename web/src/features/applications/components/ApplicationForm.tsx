import { useState } from "react";
import type {
  ApplicationStatus,
  CreateJobApplicationInput,
} from "../types/application";

type ApplicationFormProps = {
  initialValues?: CreateJobApplicationInput;
  isSubmitting?: boolean;
  submitLabel?: string;
  onSubmit: (values: CreateJobApplicationInput) => Promise<void> | void;
};

const defaultValues: CreateJobApplicationInput = {
  companyName: "",
  jobTitle: "",
  status: "Draft",
  location: "",
  jobUrl: "",
  source: "",
  salaryRange: "",
  notes: "",
  jobDescription: "",
};

const statusOptions: ApplicationStatus[] = [
  "Draft",
  "ToApply",
  "Applied",
  "Interviewing",
  "Assignment",
  "Offer",
  "Rejected",
  "Ghosted",
  "Withdrawn",
];

export function ApplicationForm({
  initialValues = defaultValues,
  isSubmitting = false,
  submitLabel = "Add Application",
  onSubmit,
}: ApplicationFormProps) {
  const [values, setValues] = useState(initialValues);

  function updateField(
    field: keyof CreateJobApplicationInput,
    value: string | ApplicationStatus,
  ) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onSubmit({
      ...values,
      companyName: values.companyName.trim(),
      jobTitle: values.jobTitle.trim(),
      location: values.location?.trim() || null,
      jobUrl: values.jobUrl?.trim() || null,
      source: values.source?.trim() || null,
      salaryRange: values.salaryRange?.trim() || null,
      notes: values.notes?.trim() || null,
      jobDescription: values.jobDescription?.trim() || null,
    });

    setValues(initialValues);
  }

  return (
    <form className="application-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <label className="field">
          <span>Company</span>
          <input
            required
            value={values.companyName}
            onChange={(event) => updateField("companyName", event.target.value)}
          />
        </label>

        <label className="field">
          <span>Role</span>
          <input
            required
            value={values.jobTitle}
            onChange={(event) => updateField("jobTitle", event.target.value)}
          />
        </label>

        <label className="field">
          <span>Status</span>
          <select
            value={values.status}
            onChange={(event) =>
              updateField("status", event.target.value as ApplicationStatus)
            }
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Location</span>
          <input
            value={values.location ?? ""}
            onChange={(event) => updateField("location", event.target.value)}
          />
        </label>

        <label className="field field-full">
          <span>Job URL</span>
          <input
            type="url"
            value={values.jobUrl ?? ""}
            onChange={(event) => updateField("jobUrl", event.target.value)}
          />
        </label>

        <label className="field">
          <span>Source</span>
          <input
            value={values.source ?? ""}
            onChange={(event) => updateField("source", event.target.value)}
          />
        </label>

        <label className="field">
          <span>Salary</span>
          <input
            value={values.salaryRange ?? ""}
            onChange={(event) => updateField("salaryRange", event.target.value)}
          />
        </label>

        <label className="field field-full">
          <span>Notes</span>
          <textarea
            rows={3}
            value={values.notes ?? ""}
            onChange={(event) => updateField("notes", event.target.value)}
          />
        </label>

        <label className="field field-full">
          <span>Job Description</span>
          <textarea
            rows={5}
            value={values.jobDescription ?? ""}
            onChange={(event) =>
              updateField("jobDescription", event.target.value)
            }
          />
        </label>
      </div>

      <button className="primary-button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}

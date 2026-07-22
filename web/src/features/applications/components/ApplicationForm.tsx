import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type {
  ApplicationStatus,
  CreateJobApplicationInput,
} from "../types/application";
import {
  applicationFormSchema,
  type ApplicationFormValues,
} from "../utils/applicationFormSchema";

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
  appliedDate: "",
  deadline: "",
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
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: initialValues,
  });

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  async function submit(values: ApplicationFormValues) {
    await onSubmit({
      ...values,
      companyName: values.companyName.trim(),
      jobTitle: values.jobTitle.trim(),
      location: values.location?.trim() || null,
      jobUrl: values.jobUrl?.trim() || null,
      source: values.source?.trim() || null,
      appliedDate: values.appliedDate || null,
      deadline: values.deadline || null,
      salaryRange: values.salaryRange?.trim() || null,
      notes: values.notes?.trim() || null,
      jobDescription: values.jobDescription?.trim() || null,
    });

    reset(initialValues);
  }

  return (
    <form className="application-form" onSubmit={handleSubmit(submit)}>
      <div className="form-grid">
        <label className="field">
          <span>Company</span>
          <input {...register("companyName")} />
          {errors.companyName && (
            <small className="field-error">{errors.companyName.message}</small>
          )}
        </label>

        <label className="field">
          <span>Job title</span>
          <input {...register("jobTitle")} />
          {errors.jobTitle && (
            <small className="field-error">{errors.jobTitle.message}</small>
          )}
        </label>

        <label className="field">
          <span>Status</span>
          <select {...register("status")}>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Applied date</span>
          <input type="date" {...register("appliedDate")} />
        </label>

        <label className="field">
          <span>Deadline</span>
          <input type="date" {...register("deadline")} />
        </label>

        <label className="field">
          <span>Job URL</span>
          <input type="url" {...register("jobUrl")} />
          {errors.jobUrl && (
            <small className="field-error">{errors.jobUrl.message}</small>
          )}
        </label>

        <label className="field">
          <span>Location</span>
          <input {...register("location")} />
        </label>

        <label className="field">
          <span>Source</span>
          <input {...register("source")} />
        </label>

        <label className="field">
          <span>Salary</span>
          <input {...register("salaryRange")} />
        </label>

        <label className="field field-full">
          <span>Notes</span>
          <textarea rows={3} {...register("notes")} />
        </label>

        <label className="field field-full">
          <span>Job Description</span>
          <textarea rows={5} {...register("jobDescription")} />
        </label>
      </div>

      <button className="primary-button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}

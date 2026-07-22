import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ApplicationForm } from "../components/ApplicationForm";
import {
  deleteApplication,
  getApplicationById,
  updateApplication,
} from "../api/applicationsApi";
import type { CreateJobApplicationInput } from "../types/application";
import { getStatusLabel, getStatusValue } from "../utils/applicationStatus";
import { getNextAction } from "../utils/nextAction";

export function ApplicationDetailsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const { id } = useParams();

  const applicationId = Number(id);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["applications", applicationId],
    queryFn: () => getApplicationById(applicationId),
    enabled: Number.isFinite(applicationId),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteApplication(applicationId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["applications"] });
      navigate("/applications");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: CreateJobApplicationInput) =>
      updateApplication(applicationId, values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["applications"] });
      await queryClient.invalidateQueries({
        queryKey: ["applications", applicationId],
      });
      setIsEditing(false);
    },
  });

  if (isLoading) return <p>Loading application...</p>;
  if (isError || !data) return <p>Failed to load application.</p>;

  const initialValues: CreateJobApplicationInput = {
    companyName: data.companyName,
    jobTitle: data.jobTitle,
    jobUrl: data.jobUrl ?? "",
    location: data.location ?? "",
    source: data.source ?? "",
    status: getStatusValue(data.status),
    appliedDate: data.appliedDate?.slice(0, 10) ?? "",
    deadline: data.deadline?.slice(0, 10) ?? "",
    salaryRange: data.salaryRange ?? "",
    notes: data.notes ?? "",
    jobDescription: data.jobDescription ?? "",
  };
  const nextAction = getNextAction(data);

  return (
    <main className="applications-page">
      <div className="details-shell">
        <Link className="back-link" to="/applications">
          Back to Applications
        </Link>

        <header className="applications-header">
          <h1>{data.jobTitle}</h1>
          <p>{data.companyName}</p>
        </header>

        <div className="actions-row">
          <button
            className="secondary-button"
            type="button"
            onClick={() => setIsEditing((current) => !current)}
          >
            {isEditing ? "Cancel Edit" : "Edit Application"}
          </button>
          <button
            className="danger-button"
            type="button"
            disabled={deleteMutation.isPending}
            onClick={() => {
              if (window.confirm("Delete this application?")) {
                deleteMutation.mutate();
              }
            }}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete Application"}
          </button>
          {deleteMutation.isError && (
            <p className="feedback-error">Failed to delete application.</p>
          )}
        </div>

        {isEditing && (
          <section className="panel">
            <h2>Edit application</h2>
            <ApplicationForm
              initialValues={initialValues}
              isSubmitting={updateMutation.isPending}
              submitLabel="Save Changes"
              onSubmit={async (values) => {
                await updateMutation.mutateAsync(values);
              }}
            />
            {updateMutation.isError && (
              <p className="feedback-error">Failed to update application.</p>
            )}
          </section>
        )}

        <div className="details-list">
          <p>
            <strong>Next action:</strong> {nextAction.label}
          </p>

          <p>
            <strong>Status:</strong> {getStatusLabel(data.status)}
          </p>

          {data.location && (
            <p>
              <strong>Location:</strong> {data.location}
            </p>
          )}

          {data.source && (
            <p>
              <strong>Source:</strong> {data.source}
            </p>
          )}

          {data.appliedDate && (
            <p>
              <strong>Applied:</strong> {data.appliedDate.slice(0, 10)}
            </p>
          )}

          {data.deadline && (
            <p>
              <strong>Deadline:</strong> {data.deadline.slice(0, 10)}
            </p>
          )}

          {data.salaryRange && (
            <p>
              <strong>Salary:</strong> {data.salaryRange}
            </p>
          )}

          {data.jobUrl && (
            <p>
              <a href={data.jobUrl} target="_blank" rel="noreferrer">
                Open job ad
              </a>
            </p>
          )}
        </div>

        {data.notes && (
          <section className="details-section">
            <h2>Notes</h2>
            <p>{data.notes}</p>
          </section>
        )}

        {data.jobDescription && (
          <section className="details-section">
            <h2>Job Description</h2>
            <p>{data.jobDescription}</p>
          </section>
        )}
      </div>
    </main>
  );
}

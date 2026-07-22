import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { createApplication, getApplications } from "../api/applicationsApi";
import { ApplicationForm } from "../components/ApplicationForm";
import { ApplicationListItem } from "../components/ApplicationListItem";
import type { CreateJobApplicationInput } from "../types/application";
import { getNextAction } from "../utils/nextAction";

export function ApplicationsPage() {
  const queryClient = useQueryClient();
  const [needsFollowUpOnly, setNeedsFollowUpOnly] = useState(false);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["applications"],
    queryFn: getApplications,
  });

  const createMutation = useMutation({
    mutationFn: (values: CreateJobApplicationInput) => createApplication(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });

  const filteredApplications = useMemo(() => {
    const applications = data ?? [];

    if (!needsFollowUpOnly) {
      return applications;
    }

    return applications.filter((application) => getNextAction(application).needsFollowUp);
  }, [data, needsFollowUpOnly]);

  if (isLoading) return <p>Loading applications...</p>;
  if (isError) return <p>Failed to load applications.</p>;

  return (
    <main className="applications-page">
      <header className="applications-header">
        <p className="eyebrow">JobTracker</p>
        <h1>Applications</h1>
      </header>

      <section className="panel">
        <h2>Add application</h2>
        <ApplicationForm
          isSubmitting={createMutation.isPending}
          onSubmit={async (values) => {
            await createMutation.mutateAsync(values);
          }}
        />
        {createMutation.isError && (
          <p className="feedback-error">Failed to save application.</p>
        )}
      </section>

      <section className="list-toolbar">
        <label className="filter-toggle">
          <input
            type="checkbox"
            checked={needsFollowUpOnly}
            onChange={(event) => setNeedsFollowUpOnly(event.target.checked)}
          />
          <span>Needs follow-up</span>
        </label>
      </section>

      {filteredApplications.length === 0 && <p>No applications yet.</p>}

      <ul className="applications-list">
        {filteredApplications.map((application) => (
          <ApplicationListItem
            key={application.id}
            application={application}
          />
        ))}
      </ul>
    </main>
  );
}

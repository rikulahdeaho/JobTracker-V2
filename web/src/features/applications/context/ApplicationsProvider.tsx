import type { PropsWithChildren } from "react";
import { useEffect, useMemo, useState } from "react";
import type { JobApplication } from "../types/application";
import { createApplicationFromValues, updateApplicationFromValues } from "../utils/applicationCrud";
import { loadStoredApplications, saveApplications } from "../utils/applicationStorage";
import { ApplicationsContext } from "./ApplicationsContext";
import type { ApplicationsContextValue } from "./ApplicationsContext";

export function ApplicationsProvider({ children }: PropsWithChildren) {
  const [applications, setApplications] = useState<JobApplication[]>(() => loadStoredApplications());

  useEffect(() => {
    saveApplications(applications);
  }, [applications]);

  const value = useMemo<ApplicationsContextValue>(
    () => ({
      applications,
      addApplication: (values) => {
        const createdApplication = createApplicationFromValues(values);
        setApplications((currentApplications) => [createdApplication, ...currentApplications]);
        return createdApplication;
      },
      updateApplication: (id, values) => {
        const currentApplication = applications.find((application) => application.id === id);

        if (!currentApplication) {
          return null;
        }

        const updatedApplication = updateApplicationFromValues(currentApplication, values);
        setApplications((currentApplications) =>
          currentApplications.map((application) => (application.id === id ? updatedApplication : application)),
        );
        return updatedApplication;
      },
      deleteApplication: (id) => {
        const exists = applications.some((application) => application.id === id);

        if (!exists) {
          return false;
        }

        setApplications((currentApplications) =>
          currentApplications.filter((application) => application.id !== id),
        );
        return true;
      },
      getApplicationById: (id) => applications.find((application) => application.id === id),
    }),
    [applications],
  );

  return <ApplicationsContext.Provider value={value}>{children}</ApplicationsContext.Provider>;
}

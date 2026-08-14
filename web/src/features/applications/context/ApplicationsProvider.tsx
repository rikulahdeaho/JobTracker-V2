import type { PropsWithChildren } from "react";
import { useMemo, useState } from "react";
import { mockApplications } from "../data/mockApplications";
import type { JobApplication } from "../types/application";
import { createApplicationFromValues, updateApplicationFromValues } from "../utils/applicationCrud";
import { ApplicationsContext } from "./ApplicationsContext";
import type { ApplicationsContextValue } from "./ApplicationsContext";

export function ApplicationsProvider({ children }: PropsWithChildren) {
  const [applications, setApplications] = useState<JobApplication[]>(mockApplications);

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

import { createContext, useContext } from "react";
import type { JobApplication, JobApplicationFormValues } from "../types/application";

export type ApplicationsContextValue = {
  applications: JobApplication[];
  addApplication: (values: JobApplicationFormValues) => JobApplication;
  updateApplication: (id: string, values: JobApplicationFormValues) => JobApplication | null;
  deleteApplication: (id: string) => boolean;
  getApplicationById: (id: string) => JobApplication | undefined;
};

export const ApplicationsContext = createContext<ApplicationsContextValue | undefined>(undefined);

export function useApplications() {
  const context = useContext(ApplicationsContext);

  if (!context) {
    throw new Error("useApplications must be used within an ApplicationsProvider.");
  }

  return context;
}

import { createContext, useContext } from "react";
import type { JobApplication, JobApplicationFormValues } from "../types/application";

export type ApplicationsContextValue = {
  applications: JobApplication[];
  isPending: boolean;
  error: Error | null;
  refetch: () => void;
  addApplication: (values: JobApplicationFormValues) => Promise<JobApplication>;
  updateApplication: (id: string, values: JobApplicationFormValues) => Promise<JobApplication>;
  deleteApplication: (id: string) => Promise<void>;
};

export const ApplicationsContext = createContext<ApplicationsContextValue | undefined>(undefined);

export function useApplications() {
  const context = useContext(ApplicationsContext);

  if (!context) {
    throw new Error("useApplications must be used within an ApplicationsProvider.");
  }

  return context;
}

import type { PropsWithChildren } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as applicationsApi from "../api/applicationsApi";
import { applicationQueryKey, applicationsQueryKey } from "../api/applicationQueries";
import type { JobApplication, JobApplicationFormValues } from "../types/application";
import { toApplicationRequest } from "../utils/applicationForm";
import { ApplicationsContext } from "./ApplicationsContext";

export function ApplicationsProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: applicationsQueryKey,
    queryFn: ({ signal }) => applicationsApi.getApplications(signal),
  });

  const refreshApplications = () =>
    queryClient.invalidateQueries({ queryKey: applicationsQueryKey, exact: true });

  const createMutation = useMutation({
    mutationFn: (values: JobApplicationFormValues) =>
      applicationsApi.createApplication(toApplicationRequest(values)),
    onSuccess: async (application) => {
      await queryClient.cancelQueries({ queryKey: applicationsQueryKey, exact: true });
      queryClient.setQueryData<JobApplication[]>(applicationsQueryKey, (current) =>
        current ? [application, ...current] : undefined,
      );
      await refreshApplications();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: JobApplicationFormValues }) =>
      applicationsApi.updateApplication(id, toApplicationRequest(values)),
    onSuccess: async (application) => {
      await queryClient.cancelQueries({ queryKey: applicationsQueryKey });
      queryClient.setQueryData(applicationQueryKey(application.id), application);
      queryClient.setQueryData<JobApplication[]>(applicationsQueryKey, (current) =>
        current?.map((item) => item.id === application.id ? application : item),
      );
      await Promise.all([
        refreshApplications(),
        queryClient.invalidateQueries({ queryKey: applicationQueryKey(application.id), exact: true }),
      ]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: applicationsApi.deleteApplication,
    onSuccess: async (_, id) => {
      await queryClient.cancelQueries({ queryKey: applicationsQueryKey });
      queryClient.removeQueries({ queryKey: applicationQueryKey(id), exact: true });
      queryClient.setQueryData<JobApplication[]>(applicationsQueryKey, (current) =>
        current?.filter((application) => application.id !== id),
      );
      await refreshApplications();
    },
  });

  return (
    <ApplicationsContext.Provider value={{
      applications: query.data ?? [],
      isPending: query.isPending,
      error: query.error,
      refetch: () => { void query.refetch(); },
      addApplication: createMutation.mutateAsync,
      updateApplication: (id, values) => updateMutation.mutateAsync({ id, values }),
      deleteApplication: deleteMutation.mutateAsync,
    }}>
      {children}
    </ApplicationsContext.Provider>
  );
}

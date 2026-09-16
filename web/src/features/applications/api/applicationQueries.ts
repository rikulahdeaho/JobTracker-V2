import { useQuery } from "@tanstack/react-query";
import { getApplicationById } from "./applicationsApi";

export const applicationsQueryKey = ["applications"] as const;
export const applicationQueryKey = (id: string) => [...applicationsQueryKey, id] as const;

export function useApplicationQuery(id: string | undefined) {
  return useQuery({
    queryKey: applicationQueryKey(id ?? ""),
    queryFn: ({ signal }) => getApplicationById(id!, signal),
    enabled: Boolean(id),
  });
}

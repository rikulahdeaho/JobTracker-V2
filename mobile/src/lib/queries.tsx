import { useAuth } from '@clerk/expo';
import { QueryClient, QueryClientProvider, useMutation, useQuery, useQueryClient, focusManager } from '@tanstack/react-query';
import { useEffect, useState, type PropsWithChildren } from 'react';
import { AppState, Platform } from 'react-native';
import { applicationsApi, bindSession } from './api';
import type { JobApplication, JobApplicationRequest } from '../domain/types/application';
import type { CreateApplicationEventRequest } from '../domain/types/workflow';

export function SessionProvider({ children }: PropsWithChildren) {
  const { getToken, signOut } = useAuth();
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 30000, retry: 1 } } }));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let active = true;
    const unbind = bindSession({ getToken, onUnauthorized: () => { client.clear(); void signOut(); } });
    void Promise.resolve().then(() => { if (active) setReady(true); });
    return () => { active = false; unbind(); void client.cancelQueries(); client.clear(); };
  }, [getToken, signOut, client]);
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const listener = AppState.addEventListener('change', state => focusManager.setFocused(state === 'active'));
    return () => listener.remove();
  }, []);
  return <QueryClientProvider client={client}>{ready ? children : null}</QueryClientProvider>;
}
export const useApplications = () => useQuery({ queryKey: ['applications'], queryFn: ({ signal }) => applicationsApi.list(signal), refetchInterval: 60000 });
export const useApplication = (id: string) => useQuery({ queryKey: ['applications', id], queryFn: ({ signal }) => applicationsApi.detail(id, signal), enabled: !!id });
type Change = { kind: 'create'; data: JobApplicationRequest } | { kind: 'update'; id: string; data: JobApplicationRequest } | { kind: 'event'; id: string; data: CreateApplicationEventRequest } | { kind: 'delete'; id: string };
export function useChangeApplication() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (change: Change) => {
      switch (change.kind) {
        case 'create': return applicationsApi.create(change.data);
        case 'update': return applicationsApi.update(change.id, change.data);
        case 'event': return applicationsApi.event(change.id, change.data);
        case 'delete': await applicationsApi.remove(change.id); return null;
      }
    },
    onSuccess: async (record, change) => {
      await client.cancelQueries({ queryKey: ['applications'] });
      if (record) {
        client.setQueryData(['applications', record.id], record);
        client.setQueryData<JobApplication[]>(['applications'], current => current ? change.kind === 'create' ? [record, ...current] : current.map(item => item.id === record.id ? record : item) : undefined);
      } else if (change.kind === 'delete') {
        client.removeQueries({ queryKey: ['applications', change.id], exact: true });
        client.setQueryData<JobApplication[]>(['applications'], current => current?.filter(item => item.id !== change.id));
      }
      await client.invalidateQueries({ queryKey: ['applications'] });
    },
  });
}

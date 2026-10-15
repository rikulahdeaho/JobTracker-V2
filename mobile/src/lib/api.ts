import { create, isAxiosError, CanceledError } from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { resolveApiAddress } from './apiAddress';
import type { JobApplication, JobApplicationRequest } from '../domain/types/application';
import type { CreateApplicationEventRequest } from '../domain/types/workflow';
type Session = { getToken: () => Promise<string | null>; onUnauthorized: () => void };
let session: Session | undefined;
export const baseURL = resolveApiAddress(process.env.EXPO_PUBLIC_API_BASE_URL, Platform.OS !== 'web', __DEV__ ? Constants.expoConfig?.hostUri : undefined);
export const api = create({ baseURL, timeout: 15000, headers: { Accept: 'application/json' } });
export function bindSession(next: Session) {
  session = next;
  return () => { if (session === next) session = undefined; };
}
const requests = new WeakMap<object, Session>();
api.interceptors.request.use(async config => {
  if (!baseURL) throw new Error('The API address is missing. Configure EXPO_PUBLIC_API_BASE_URL and restart the app.');
  const current = session;
  if (!current) throw new Error('Sign in to access your applications.');
  const token = await current.getToken();
  if (session !== current) throw new CanceledError('Account changed.');
  if (!token) { current.onUnauthorized(); throw new Error('Your session has expired. Sign in again.'); }
  config.headers.set('Authorization', `Bearer ${token}`);
  requests.set(config, current);
  return config;
});
api.interceptors.response.use(response => response, (error: unknown) => {
  if (isAxiosError(error) && error.response?.status === 401 && error.config) {
    const current = requests.get(error.config);
    if (current && current === session) current.onUnauthorized();
  }
  return Promise.reject(error);
});
export function errorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    if (!error.response) return 'Cannot reach your applications. Check your connection and try again.';
    if (error.response.status === 401) return 'Your session has expired. Sign in again.';
    if (error.response.status === 403) return 'You do not have permission to access this record.';
    if (error.response.status === 404) return 'This application no longer exists.';
    const data: unknown = error.response.data;
    if (data && typeof data === 'object' && 'errors' in data && data.errors && typeof data.errors === 'object') {
      const messages = Object.values(data.errors).flat().filter((value): value is string => typeof value === 'string');
      if (messages.length) return messages.join(' ');
    }
    return 'Could not save your changes. Try again.';
  }
  return error instanceof Error ? error.message : 'Something went wrong. Try again.';
}
export const applicationsApi = {
  list: async (signal?: AbortSignal) => (await api.get<JobApplication[]>('/api/applications', { signal })).data,
  detail: async (id: string, signal?: AbortSignal) => (await api.get<JobApplication>(`/api/applications/${encodeURIComponent(id)}`, { signal })).data,
  create: async (data: JobApplicationRequest) => (await api.post<JobApplication>('/api/applications', data)).data,
  update: async (id: string, data: JobApplicationRequest) => (await api.put<JobApplication>(`/api/applications/${encodeURIComponent(id)}`, data)).data,
  remove: async (id: string) => { await api.delete(`/api/applications/${encodeURIComponent(id)}`); },
  event: async (id: string, data: CreateApplicationEventRequest) => (await api.post<JobApplication>(`/api/applications/${encodeURIComponent(id)}/events`, data)).data,
};

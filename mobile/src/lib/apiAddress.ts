// Expo Go and devices cannot reach the development computer through localhost.
// Preserve production addresses and browser localhost; rewrite only native LAN development.
export function resolveApiAddress(configured: string | undefined, native: boolean, developmentHost?: string | null): string | undefined {
  const value = configured?.trim().replace(/\/+$/, '');
  if (!value) return undefined;
  if (!native || !developmentHost) return value;
  try {
    const apiUrl = new URL(value);
    if (!['localhost', '127.0.0.1', '[::1]'].includes(apiUrl.hostname)) return value;
    const host = new URL(`http://${developmentHost}`).hostname;
    // A tunnel forwards Metro, not the backend; never invent an API on a tunnel host.
    if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(host) || host === '127.0.0.1') return value;
    apiUrl.hostname = host;
    return apiUrl.toString().replace(/\/+$/, '');
  } catch { return value; }
}

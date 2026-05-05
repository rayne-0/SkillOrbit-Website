/**
 * Shared API utilities for all Pinia stores.
 * Provides auth-aware fetch wrappers and the base URL.
 */
export const BASE_URL = 'http://localhost:8000'

function getTokens() {
  try {
    const s = localStorage.getItem('skillorbit_tokens')
    return s ? JSON.parse(s) : null
  } catch { return null }
}

/** Return headers, injecting Bearer token if available. */
export function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const t = getTokens()
  return t?.access
    ? { Authorization: `Bearer ${t.access}`, ...extra }
    : extra
}

/** Perform a fetch and return parsed JSON. Throws on non-ok response. */
export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...authHeaders({ 'Content-Type': 'application/json' }),
      ...(options.headers as Record<string, string> || {}),
    },
  })
  const data = await res.json()
  return data as T
}

// ── api.ts ── thin fetch wrapper with JWT & 401 handling ──
// Uses sessionStorage so each browser tab has its OWN session.
// Opening two accounts in two tabs no longer conflicts.

const TOKEN_KEY = 'mhc_token';
const SESSION_KEY = 'mhc_session';

export interface SessionInfo {
    role: string;
    displayName: string;
    username: string;
}

export function getToken(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
    sessionStorage.setItem(TOKEN_KEY, token);
}

export function setSession(info: SessionInfo): void {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(info));
}

export function getSession(): SessionInfo | null {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
}

export function clearToken(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(SESSION_KEY);
}

export async function apiFetch<T = unknown>(
    path: string,
    options: RequestInit = {},
): Promise<T> {
    const token = getToken();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`/api${path}`, { ...options, headers });

    if (res.status === 401) {
        clearToken();
        window.location.reload();            // kick back to login screen
        throw new Error('Session expired');
    }

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `Request failed (${res.status})`);
    }

    // 204 No Content → return undefined
    if (res.status === 204) return undefined as T;

    return res.json() as Promise<T>;
}

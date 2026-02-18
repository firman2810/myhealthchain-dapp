// ── api.ts ── thin fetch wrapper with JWT & 401 handling ──

const TOKEN_KEY = 'mhc_token';

export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
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

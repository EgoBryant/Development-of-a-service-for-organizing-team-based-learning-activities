import type { AuthResponse, SessionState } from "../types/auth";

const SESSION_KEY = "team-exam-auth";

export function saveSession(auth: AuthResponse): void {
    const session: SessionState = {
        token: auth.token,
        expiresAtUtc: auth.expiresAtUtc
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function loadSession(): SessionState | null {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) {
        return null;
    }

    try {
        const parsed = JSON.parse(raw) as SessionState;
        if (!parsed.token || !parsed.expiresAtUtc) {
            return null;
        }

        return parsed;
    } catch {
        return null;
    }
}

export function clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
}

import type { AuthResponse } from "../types/auth";

const STORAGE_KEY = "team-exam-auth";

export function readStoredAuth(): AuthResponse | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthResponse;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function storeAuth(auth: AuthResponse) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
}

export function clearStoredAuth() {
  localStorage.removeItem(STORAGE_KEY);
}

const DEFAULT_LOCAL_API = "http://127.0.0.1:8080";

/**
 * По умолчанию - прямой вызов API (CORS на бэке уже открыт): и dev, и prod без путаницы с портом Vite.
 * Явно `VITE_API_BASE_URL=` (пусто) - только если поднимаете прокси на том же origin, что и страница.
 */
export function resolveApiBaseUrl(): string {
    const raw = import.meta.env.VITE_API_BASE_URL as string | undefined;
    if (raw === "") {
        return "";
    }
    if (import.meta.env.PROD) {
        const explicit = (raw?.trim() ?? "") || "";
        if (explicit.length === 0) {
            return "";
        }
        return explicit.replace(/\/$/, "");
    }
    const trimmed = raw?.trim().replace(/\/$/, "") ?? "";
    return trimmed || DEFAULT_LOCAL_API;
}

export const API_BASE_URL = resolveApiBaseUrl();

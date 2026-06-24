import { getAppBridge } from "../app/bridge";

function normalizeUserIdForMatch(value: string | number | null | undefined): string {
    const raw = String(value ?? "").trim();
    if (!raw) {
        return "";
    }

    if (raw.startsWith("user-")) {
        return raw.slice(5);
    }

    return raw;
}

export function isSameUserId(left: string | number, right: string | number): boolean {
    const a = normalizeUserIdForMatch(left);
    const b = normalizeUserIdForMatch(right);
    return Boolean(a) && a === b;
}

export function resolveUserAvatarUrl(userId: string, avatarUrl?: string | null): string {
    const normalizedId = normalizeUserIdForMatch(userId);
    if (!normalizedId) {
        return avatarUrl?.trim() ?? "";
    }

    try {
        const bridge = getAppBridge();
        const currentUserId = normalizeUserIdForMatch(bridge.getCurrentUserId());
        if (currentUserId && normalizedId === currentUserId) {
            return bridge.getCurrentUserAvatarUrl().trim() || avatarUrl?.trim() || "";
        }
    } catch {
        // bridge not ready during early bootstrap
    }

    return avatarUrl?.trim() ?? "";
}

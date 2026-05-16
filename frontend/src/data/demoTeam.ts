/** Демо-коды приглашения для вступления в команду (MVP). */
export const DEMO_VALID_INVITE_CODES = ["DEMO-INVITE", "URFU-2025", "DEMO"];

export function normalizeInviteCode(code: string): string {
    return code.trim().toUpperCase();
}

export function isDemoInviteCodeValid(code: string): boolean {
    const normalized = normalizeInviteCode(code);
    if (!normalized) {
        return false;
    }
    return DEMO_VALID_INVITE_CODES.some((valid) => valid.toUpperCase() === normalized);
}

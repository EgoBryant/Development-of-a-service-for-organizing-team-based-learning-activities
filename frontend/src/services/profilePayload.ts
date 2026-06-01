import type { UpdateProfileJsonBody, UserProfileResponse } from "../types/auth";
import type { ProfileEdits } from "../types/profile";

export function splitFullNameForApi(fullName: string): { firstName: string; lastName: string } {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
        return { firstName: "", lastName: "" };
    }

    if (parts.length === 1) {
        return { firstName: parts[0] ?? "", lastName: "" };
    }

    return { firstName: parts[0] ?? "", lastName: parts.slice(1).join(" ") };
}

/**
 * Собирает тело PUT /api/profile из формы личных данных и текущего снимка с сервера.
 * Остальные поля пока не редактируются в UI и копируются с server.
 */
export function buildPersonalProfilePutBody(
    server: UserProfileResponse,
    draft: ProfileEdits
): UpdateProfileJsonBody {
    const { firstName, lastName } = splitFullNameForApi(draft.fullName);
    const draftGroup = draft.group.trim();
    const serverGroupTitle = (server.groupTitle ?? "").trim();
    const groupId =
        draftGroup === serverGroupTitle && server.groupId != null && server.groupId > 0
            ? server.groupId
            : null;

    const newDataUrl = draft.avatarDataUrl && draft.avatarDataUrl.startsWith("data:");
    const avatarUrl: string = newDataUrl
        ? (draft.avatarDataUrl as string)
        : (draft.avatarDataUrl ?? server.avatarUrl ?? "");

    const st = server.studentTicketNumber;
    return {
        firstName,
        lastName,
        middleName: server.middleName ?? "",
        nickname: server.nickname ?? "",
        bio: server.bio ?? "",
        avatarUrl,
        contactEmail: server.contactEmail ?? "",
        telegramHandle: server.telegramHandle ?? "",
        phoneNumber: server.phoneNumber ?? "",
        studentTicketNumber: st && st > 0 ? st : null,
        groupId: groupId && groupId > 0 ? groupId : null,
        academicGroupLabel: draftGroup
    };
}

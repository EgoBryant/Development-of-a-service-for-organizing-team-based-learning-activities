import type { AuthResponse, UserProfileResponse } from "../types/auth";
import { normalizePersonalLeague } from "../utils/personalLeague";

export function buildUserProfileFromAuthResponse(auth: AuthResponse & { id: number }): UserProfileResponse {
    return {
        id: auth.id,
        userName: auth.userName,
        email: auth.email,
        role: auth.role,
        firstName: auth.firstName,
        lastName: auth.lastName,
        middleName: auth.middleName,
        nickname: auth.nickname,
        bio: auth.bio,
        avatarUrl: auth.avatarUrl,
        contactEmail: auth.contactEmail,
        telegramHandle: auth.telegramHandle,
        phoneNumber: auth.phoneNumber,
        studentTicketNumber: auth.studentTicketNumber,
        groupId: auth.groupId,
        groupTitle: auth.groupTitle,
        teamId: auth.teamId,
        teamName: auth.teamName,
        teamInviteCode: auth.teamInviteCode,
        isCaptain: auth.isCaptain,
        teamScore: auth.teamScore,
        userPoints: auth.userPoints ?? 0,
        personalRating: auth.personalRating ?? auth.userPoints ?? 0,
        personalContribution: auth.personalContribution ?? 0,
        personalLeague: normalizePersonalLeague(auth.personalLeague)
    };
}

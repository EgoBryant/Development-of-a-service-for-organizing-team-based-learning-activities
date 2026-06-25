export interface AuthResponse {
    /** С сервера с login/register; если нет (старый API), делаем GET /me. */
    id?: number;
    token: string;
    expiresAtUtc: string;
    userName: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
    middleName: string;
    nickname: string;
    bio: string;
    avatarUrl: string;
    contactEmail: string;
    telegramHandle: string;
    phoneNumber: string;
    studentTicketNumber: number | null;
    groupId: number | null;
    groupTitle: string;
    teamId: number | null;
    teamName: string;
    teamInviteCode: string;
    isCaptain: boolean;
    teamScore: number;
    userPoints: number;
    personalRating: number;
    personalRank: number;
    personalContribution: number;
    personalLeague: string;
}

export interface UserProfileResponse {
    id: number;
    userName: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
    middleName: string;
    nickname: string;
    bio: string;
    avatarUrl: string;
    contactEmail: string;
    telegramHandle: string;
    phoneNumber: string;
    studentTicketNumber: number | null;
    groupId: number | null;
    groupTitle: string;
    teamId: number | null;
    teamName: string;
    teamInviteCode: string;
    isCaptain: boolean;
    teamScore: number;
    userPoints: number;
    personalRating: number;
    personalRank: number;
    personalContribution: number;
    personalLeague: string;
}

/** JSON для PUT /api/profile (сервер: UpdateProfileDto, camelCase). */
export interface UpdateProfileJsonBody {
    firstName: string;
    lastName: string;
    middleName: string;
    nickname: string;
    bio: string;
    avatarUrl: string;
    contactEmail: string;
    telegramHandle: string;
    phoneNumber: string;
    studentTicketNumber: number | null;
    groupId: number | null;
    academicGroupLabel: string;
}

export interface ProblemLike {
    title?: string;
    detail?: string;
    message?: string;
    code?: string;
    /** ASP.NET 400 model validation: поле -> сообщения */
    errors?: Record<string, string[]>;
}

export interface SessionState {
    token: string;
    expiresAtUtc: string;
}

export interface SignInState {
    email: string;
    password: string;
}

export interface SignUpState {
    email: string;
    password: string;
    passwordConfirm: string;
}

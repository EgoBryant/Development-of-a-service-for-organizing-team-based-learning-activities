import type { EventCreateDraft } from "./event";

export type TeamEventModalKind = "none" | "create" | "success";
export type TeamModalKind = "none" | "vote" | "requests" | "rescue" | "checkIn";
export type NoTeamView = "landing" | "create-form" | "search";

export type TeamEventCreateDraft = EventCreateDraft;

export interface TeamCreateDraft {
    name: string;
    direction: string;
}

export interface TeamMemberView {
    id: string;
    displayName: string;
    roleLabel: string;
    avatarUrl: string;
    userPoints?: number;
    canVote?: boolean;
    voteScore?: number | null;
}

export interface TeamRescueAttachment {
    id: string;
    name: string;
}

export interface TeamRescueDraft {
    targetTeamId: string;
    topic: string;
    tag: string;
    description: string;
    league: string;
    deadline: string;
    attachments: TeamRescueAttachment[];
}

export interface TeamMemberRow {
    id: string;
    displayName: string;
    roleLabel: string;
    avatarUrl: string;
    isCaptain: boolean;
}

export interface TeamMemberResponse {
    id: number;
    userName: string;
    email: string;
    role: string;
    isCaptain: boolean;
    displayName: string;
    roleLabel: string;
    avatarUrl: string;
    userPoints: number;
}

export interface TeamResponse {
    id: number;
    name: string;
    description: string;
    inviteCode: string;
    captainId: number | null;
    score: number;
    krk: number;
    captainUserName: string;
    createdAt: string;
    memberCount: number;
    members: TeamMemberResponse[];
}

export interface CheckInResponse {
    id: number;
    teamId: number;
    teamName: string;
    weekNumber: number;
    reportText: string;
    status: string;
    submittedAtUtc: string | null;
    createdAtUtc: string;
}

export interface HelpRequestResponse {
    id: number;
    fromTeamId: number;
    fromTeamName: string;
    toTeamId: number;
    toTeamName: string;
    topic: string;
    tag: string;
    description: string;
    format: string;
    scheduledAtUtc: string | null;
    leagueLabel: string;
    status: string;
    bonusPoints: number;
    bonusAwarded: boolean;
    createdAtUtc: string;
}

export interface TeamJoinRequestResponse {
    id: number;
    teamId: number;
    teamName: string;
    userId: number;
    userName: string;
    displayName: string;
    avatarUrl: string;
    message: string;
    status: string;
    createdAtUtc: string;
    decidedAtUtc: string | null;
    decidedByUserId: number | null;
    decidedByUserName: string;
}

export interface MyVoteResponse {
    id: number;
    toUserId: number;
    toUserName: string;
    score: number;
    createdAtUtc: string;
}

export interface VoteResponse {
    id: number;
    teamId: number;
    fromUserId: number;
    fromUserName: string;
    toUserId: number;
    toUserName: string;
    score: number;
    createdAtUtc: string;
}

export interface TeamHistoryItem {
    label: string;
    title: string;
    meta: string;
    pointsLabel?: string;
    occurredAtUtc?: string;
}

export interface TeamActivityFeedItem {
    id: number;
    type: string;
    message: string;
    teamId: number | null;
    teamName: string;
    userId: number | null;
    userName: string;
    createdAtUtc: string;
}

export interface TeamWeeklyStats {
    pointsEarned: number;
    teamsRescued: number;
    eventsHeld: number;
    weekStartUtc: string;
    weekEndUtc: string;
}

export interface TeamSearchItem {
    id: number;
    name: string;
    description: string;
    inviteCode: string;
    memberCount: number;
    krk: number;
    joinRequestStatus?: string;
}

export interface LocalCreatedTeam {
    name: string;
    inviteCode: string;
    direction: string;
    members: TeamMemberRow[];
}

export interface PersistedLocalTeamV1 {
    name: string;
    inviteCode: string;
    inviteLink?: string;
    direction?: string;
    members?: TeamMemberRow[];
    /** @deprecated только для чтения старых сохранений */
    voteCommitted?: Record<string, boolean>;
    /** @deprecated старые локальные оценки; игнорируется */
    voteSavedPoints?: Record<string, string>;
}

export type RatingView = "leaderboard" | "user" | "team";

export type RatingLeaderboardTab = "teams" | "users";

export type RatingSortKey = "rank-asc" | "rank-desc" | "points-desc" | "points-asc" | "name-asc";

export type UserProfileTab = "rating" | "achievements";

export interface RatingLeaderboardEntry {
    id: string;
    rank: number;
    label: string;
    points: number;
    pointsLabel?: string;
    searchText?: string;
    avatarUrl?: string;
}

export interface RatingTeamMember {
    id: string;
    displayName: string;
    roleLabel: string;
    avatarUrl?: string;
}

export interface RatingTeam {
    id: string;
    rank: number;
    name: string;
    points: number;
    krk: number;
    league?: string;
    memberCount?: number;
    captainName?: string;
    cohesion?: number;
    challengeBonus?: number;
    checkInsCount?: number;
    completedRescuesCount?: number;
    members: RatingTeamMember[];
    activityHistory?: RatingTeamHistoryItem[];
}

export interface RatingTeamHistoryItem {
    kind: string;
    title: string;
    meta: string;
    createdAtUtc: string;
    points: number | null;
}

export interface RatingUser {
    id: string;
    rank: number;
    name: string;
    points: number;
    contribution?: number;
    hasTeam: boolean;
    teamId: string | null;
    teamName?: string;
    groupTitle?: string;
    isCaptain?: boolean;
    league: string;
    achievementsCount: number;
    avatarUrl?: string;
}

export interface RescueDraft {
    topic: string;
    tag: string;
    description: string;
    format: string;
    dateTime: string;
}

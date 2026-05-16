export type RatingView = "leaderboard" | "user" | "team";

export type RatingSortKey = "rank-asc" | "rank-desc" | "points-desc" | "points-asc" | "name-asc";

export type UserProfileTab = "rating" | "achievements";

export interface RatingLeaderboardEntry {
    rank: number;
    label: string;
    points: number;
}

export interface RatingTeamMember {
    id: string;
    displayName: string;
    roleLabel: string;
}

export interface RatingTeam {
    id: string;
    rank: number;
    name: string;
    points: number;
    krk: number;
    members: RatingTeamMember[];
}

export interface RatingUser {
    id: string;
    rank: number;
    name: string;
    points: number;
    hasTeam: boolean;
    teamId: string | null;
    league: string;
    achievementsCount: number;
}

export interface RescueDraft {
    topic: string;
    tag: string;
    description: string;
    format: string;
    dateTime: string;
}

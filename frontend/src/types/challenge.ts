import type { ProfileAchievementTone } from "./profile";

export interface ChallengeResponse {
    id: number;
    title: string;
    description: string;
    bonusPoints: number;
    isActive: boolean;
    startsAtUtc?: string | null;
    endsAtUtc?: string | null;
    teamStatus?: string | null;
    approvedTeamsCount: number;
}

export interface ChallengeItem {
    id: number;
    title: string;
    description: string;
    bonusPoints: number;
    isActive: boolean;
    tone: ProfileAchievementTone;
    iconUrl: string;
}

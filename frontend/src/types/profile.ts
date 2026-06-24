export interface ProfileEdits {
    fullName: string;
    group: string;
    avatarDataUrl: string | null;
}

export interface PersistedClientProfileV1 {
    fullName: string;
    group: string;
    avatarDataUrl: string | null;
    dashboardSection?: "profile" | "team" | "rating" | "tasks" | "events" | "settings";
}

export type ProfileAchievementTone = "rose" | "blue" | "green" | "amber" | "violet" | "slate";
export type ProfileAchievementStatus = "earned" | "progress" | "locked";

export interface AchievementCatalogItem {
    id: number;
    code: string;
    title: string;
    description: string;
    iconUrl: string;
}

export interface UserAchievementItem {
    id: number;
    userId: number;
    achievementId: number;
    code: string;
    title: string;
    description: string;
    iconUrl: string;
    earnedAtUtc: string;
}

export interface ProfileAchievement {
    id: string;
    code: string;
    achievementId: number;
    title: string;
    shortTitle: string;
    iconLabel: string;
    iconUrl: string;
    description: string;
    criterion: string;
    points: number;
    progressLabel: string;
    status: ProfileAchievementStatus;
    tone: ProfileAchievementTone;
    earnedAtUtc?: string;
}

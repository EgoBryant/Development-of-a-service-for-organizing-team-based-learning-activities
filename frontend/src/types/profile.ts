export interface ProfileEdits {
    fullName: string;
    group: string;
    avatarDataUrl: string | null;
}

export interface PersistedClientProfileV1 {
    fullName: string;
    group: string;
    avatarDataUrl: string | null;
    dashboardSection?: "profile" | "team" | "rating" | "events" | "settings";
}

export type ProfileAchievementTone = "rose" | "blue" | "green" | "amber" | "violet" | "slate";
export type ProfileAchievementStatus = "earned" | "progress";

export interface ProfileAchievement {
    id: string;
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
}

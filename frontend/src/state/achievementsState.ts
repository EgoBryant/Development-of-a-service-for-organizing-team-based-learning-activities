import {
    buildProfileAchievements,
    FALLBACK_ACHIEVEMENT_CATALOG
} from "../data/profileAchievements";
import type {
    AchievementCatalogItem,
    ProfileAchievement,
    UserAchievementItem
} from "../types/profile";

let achievementCatalog: AchievementCatalogItem[] = [...FALLBACK_ACHIEVEMENT_CATALOG];
let myAchievements: UserAchievementItem[] = [];
const achievementsByUserId = new Map<string, UserAchievementItem[]>();

function normalizeUserId(userId: number | string): string {
    return String(userId);
}

export function setAchievementsCatalog(items: readonly AchievementCatalogItem[]): void {
    achievementCatalog = items.length > 0 ? [...items] : [...FALLBACK_ACHIEVEMENT_CATALOG];
}

export function setMyAchievements(items: readonly UserAchievementItem[], userId?: number | string): void {
    myAchievements = [...items];
    if (userId !== undefined) {
        setUserAchievements(userId, items);
    }
}

export function setUserAchievements(userId: number | string, items: readonly UserAchievementItem[]): void {
    achievementsByUserId.set(normalizeUserId(userId), [...items]);
}

export function clearAchievementsData(): void {
    achievementCatalog = [...FALLBACK_ACHIEVEMENT_CATALOG];
    myAchievements = [];
    achievementsByUserId.clear();
}

export function getMyProfileAchievements(): ProfileAchievement[] {
    return buildProfileAchievements(achievementCatalog, myAchievements);
}

export function getUserProfileAchievements(userId: number | string): ProfileAchievement[] {
    return buildProfileAchievements(
        achievementCatalog,
        achievementsByUserId.get(normalizeUserId(userId)) ?? []
    ).sort(comparePublicAchievements);
}

export function hasUserAchievementsSnapshot(userId: number | string): boolean {
    return achievementsByUserId.has(normalizeUserId(userId));
}

export function getTeamProfileAchievements(memberIds: readonly string[]): ProfileAchievement[] {
    const summaryByCode = new Map<string, { achievement: ProfileAchievement; count: number; earnedAtUtc: string }>();

    memberIds.forEach((memberId) => {
        getUserProfileAchievements(memberId)
            .filter((achievement) => achievement.status === "earned")
            .forEach((achievement) => {
                const existing = summaryByCode.get(achievement.code);
                const earnedAtUtc = achievement.earnedAtUtc ?? "";
                if (!existing) {
                    summaryByCode.set(achievement.code, {
                        achievement,
                        count: 1,
                        earnedAtUtc
                    });
                    return;
                }

                existing.count += 1;
                if (earnedAtUtc > existing.earnedAtUtc) {
                    existing.achievement = achievement;
                    existing.earnedAtUtc = earnedAtUtc;
                }
            });
    });

    return Array.from(summaryByCode.values())
        .sort((left, right) => {
            if (right.count !== left.count) {
                return right.count - left.count;
            }
            return right.earnedAtUtc.localeCompare(left.earnedAtUtc);
        })
        .map(({ achievement, count }) => ({
            ...achievement,
            progressLabel: formatMembersCount(count)
        }));
}

function comparePublicAchievements(left: ProfileAchievement, right: ProfileAchievement): number {
    if (left.status !== right.status) {
        return left.status === "earned" ? -1 : 1;
    }

    if (left.status === "earned" && right.status === "earned") {
        return (right.earnedAtUtc ?? "").localeCompare(left.earnedAtUtc ?? "");
    }

    return left.shortTitle.localeCompare(right.shortTitle, "ru");
}

function formatMembersCount(count: number): string {
    if (count === 1) {
        return "1 участник";
    }

    if (count > 1 && count < 5) {
        return `${count} участника`;
    }

    return `${count} участников`;
}

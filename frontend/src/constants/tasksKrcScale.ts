import type { TasksKrcTier } from "../types/app";

export const TASKS_KRC_MAX_POINTS = 500;

export const TASKS_KRC_TIER_THRESHOLDS: Record<TasksKrcTier, number> = {
    novice: 0,
    pro: 100,
    legend: 500
};

const TASKS_KRC_TIER_ORDER: TasksKrcTier[] = ["novice", "pro", "legend"];

export function normalizeTasksKrcUserPoints(userPoints: number): number {
    return Number.isFinite(userPoints) ? Math.max(0, userPoints) : 0;
}

export function computeTasksKrcFillPercent(userPoints: number): number {
    const normalizedPoints = normalizeTasksKrcUserPoints(userPoints);
    return Math.min(100, (normalizedPoints / TASKS_KRC_MAX_POINTS) * 100);
}

export function isTasksKrcTierUnlocked(tier: TasksKrcTier, userPoints: number): boolean {
    const normalizedPoints = normalizeTasksKrcUserPoints(userPoints);
    return normalizedPoints >= TASKS_KRC_TIER_THRESHOLDS[tier];
}

export function getMaxUnlockedTasksKrcTier(userPoints: number): TasksKrcTier {
    const normalizedPoints = normalizeTasksKrcUserPoints(userPoints);
    let maxUnlocked: TasksKrcTier = "novice";

    for (const tier of TASKS_KRC_TIER_ORDER) {
        if (normalizedPoints >= TASKS_KRC_TIER_THRESHOLDS[tier]) {
            maxUnlocked = tier;
        }
    }

    return maxUnlocked;
}

export function normalizeTasksKrcTier(tier: TasksKrcTier, userPoints: number): TasksKrcTier {
    if (isTasksKrcTierUnlocked(tier, userPoints)) {
        return tier;
    }

    return getMaxUnlockedTasksKrcTier(userPoints);
}

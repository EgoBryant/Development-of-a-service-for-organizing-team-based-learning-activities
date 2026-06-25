import type {
    ActivityColorVariant,
    ActivityFeedItem,
    ActivityFeedPushInput
} from "../types/activity";

const STORAGE_KEY = "team-exam-activity-feed-v2";
const MAX_ITEMS = 50;

const COLOR_CYCLE: ActivityColorVariant[] = ["pink", "blue", "green", "purple", "amber", "rose"];

export const activityFeedItems: ActivityFeedItem[] = [];

function nextColorVariant(): ActivityColorVariant {
    return COLOR_CYCLE[activityFeedItems.length % COLOR_CYCLE.length];
}

function persistActivityFeed(): void {
    if (typeof localStorage === "undefined") {
        return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(activityFeedItems));
}

export function loadPersistedActivityFeed(): void {
    activityFeedItems.length = 0;

    if (typeof localStorage === "undefined") {
        return;
    }

    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return;
        }

        const parsed = JSON.parse(raw) as ActivityFeedItem[];
        if (!Array.isArray(parsed)) {
            return;
        }

        for (const item of parsed.slice(0, MAX_ITEMS)) {
            if (!item?.id || !item.title) {
                continue;
            }

            activityFeedItems.push({
                id: item.id,
                kind: item.kind ?? "profile_updated",
                title: item.title,
                description: item.description ?? "",
                createdAt: item.createdAt ?? new Date().toISOString(),
                colorVariant: item.colorVariant ?? "pink",
                badge: item.badge
            });
        }
    } catch {
        activityFeedItems.length = 0;
    }
}

export function pushActivityFeedItem(input: ActivityFeedPushInput): ActivityFeedItem {
    const item: ActivityFeedItem = {
        id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        kind: input.kind,
        title: input.title,
        description: input.description,
        createdAt: new Date().toISOString(),
        colorVariant: nextColorVariant(),
        badge: input.badge
    };

    activityFeedItems.unshift(item);
    if (activityFeedItems.length > MAX_ITEMS) {
        activityFeedItems.length = MAX_ITEMS;
    }

    persistActivityFeed();
    return item;
}

export function getActivityFeedItems(): ActivityFeedItem[] {
    return [...activityFeedItems];
}

import type {
    ActivityColorVariant,
    ActivityFeedItem,
    ActivityFeedPushInput
} from "../types/activity";

const STORAGE_KEY = "team-exam-activity-feed";
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
    if (typeof localStorage === "undefined") {
        seedDemoActivityFeedIfEmpty();
        return;
    }

    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            seedDemoActivityFeedIfEmpty();
            return;
        }

        const parsed = JSON.parse(raw) as ActivityFeedItem[];
        if (!Array.isArray(parsed) || parsed.length === 0) {
            seedDemoActivityFeedIfEmpty();
            return;
        }

        activityFeedItems.length = 0;
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
        seedDemoActivityFeedIfEmpty();
    }
}

function seedDemoActivityFeedIfEmpty(): void {
    if (activityFeedItems.length > 0) {
        return;
    }

    const now = Date.now();
    const seeds: ActivityFeedPushInput[] = [
        {
            kind: "challenge_completed",
            title: "ЧЕЛЛЕНДЖ ЗАВЕРШЁН",
            description: "Команда закрыла челлендж «Неделя сплочённости».",
            badge: "+120"
        },
        {
            kind: "rating_changed",
            title: "РЕЙТИНГ ОБНОВЛЁН",
            description: "Ваша позиция в личном рейтинге: 4 → 3 место."
        },
        {
            kind: "team_achievement",
            title: "ДОСТИЖЕНИЕ КОМАНДЫ",
            description: "Команда получила ачивку «Синхрон»."
        },
        {
            kind: "event_upcoming",
            title: "СКОРО МЕРОПРИЯТИЕ",
            description: "Воркшоп по КРК — завтра в 16:00."
        }
    ];

    seeds.forEach((seed, index) => {
        activityFeedItems.push({
            id: `seed-${index}`,
            kind: seed.kind,
            title: seed.title,
            description: seed.description,
            createdAt: new Date(now - index * 3600_000).toISOString(),
            colorVariant: COLOR_CYCLE[index % COLOR_CYCLE.length],
            badge: seed.badge
        });
    });

    persistActivityFeed();
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

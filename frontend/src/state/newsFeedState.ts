import type { NewsColorVariant, NewsPost, NewsPostPushInput } from "../types/news";

const STORAGE_KEY = "team-exam-news-feed-v5";
const MAX_ITEMS = 40;

const COLOR_CYCLE: NewsColorVariant[] = ["pink", "blue", "green", "purple", "amber", "rose"];

export const newsFeedItems: NewsPost[] = [];

function nextColorVariant(): NewsColorVariant {
    return COLOR_CYCLE[newsFeedItems.length % COLOR_CYCLE.length];
}

function persistNewsFeed(): void {
    if (typeof localStorage === "undefined") {
        return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newsFeedItems));
}

export function loadPersistedNewsFeed(): void {
    newsFeedItems.length = 0;

    if (typeof localStorage === "undefined") {
        return;
    }

    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return;
        }

        const parsed = JSON.parse(raw) as NewsPost[];
        if (!Array.isArray(parsed)) {
            return;
        }

        for (const item of parsed.slice(0, MAX_ITEMS)) {
            if (!item?.id || !item.title) {
                continue;
            }

            newsFeedItems.push({
                id: item.id,
                title: item.title,
                body: item.body ?? "",
                authorName: item.authorName ?? "Организатор",
                createdAt: item.createdAt ?? new Date().toISOString(),
                colorVariant: item.colorVariant ?? "pink",
                pointsLabel: item.pointsLabel
            });
        }
    } catch {
        newsFeedItems.length = 0;
    }
}

export function pushNewsPost(input: NewsPostPushInput): NewsPost {
    const item: NewsPost = {
        id: `news-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: input.title.trim(),
        body: input.body.trim(),
        authorName: input.authorName?.trim() || "Организатор",
        createdAt: new Date().toISOString(),
        colorVariant: nextColorVariant(),
        pointsLabel: input.pointsLabel
    };

    newsFeedItems.unshift(item);
    if (newsFeedItems.length > MAX_ITEMS) {
        newsFeedItems.length = MAX_ITEMS;
    }

    persistNewsFeed();
    return item;
}

export function getNewsFeedItems(): NewsPost[] {
    return [...newsFeedItems];
}

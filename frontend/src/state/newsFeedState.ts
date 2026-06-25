import type { NewsColorVariant, NewsPost, NewsPostPushInput } from "../types/news";

const STORAGE_KEY = "team-exam-news-feed-v4";
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
    if (typeof localStorage === "undefined") {
        seedDemoNewsFeedIfEmpty();
        return;
    }

    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            seedDemoNewsFeedIfEmpty();
            return;
        }

        const parsed = JSON.parse(raw) as NewsPost[];
        if (!Array.isArray(parsed) || parsed.length === 0) {
            seedDemoNewsFeedIfEmpty();
            return;
        }

        newsFeedItems.length = 0;
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
        seedDemoNewsFeedIfEmpty();
    }
}

function seedDemoNewsFeedIfEmpty(): void {
    if (newsFeedItems.length > 0) {
        return;
    }

    const now = Date.now();
    const seeds: NewsPostPushInput[] = [
        {
            title: "Событие в календаре",
            body: "«рр» добавлено в календарь.",
            authorName: "Система"
        },
        {
            title: "Профиль",
            body: "Личные данные сохранены.",
            authorName: "Система"
        },
        {
            title: "Челлендж",
            body: "Команда закрыла челлендж «Неделя сплочённости».",
            authorName: "Система",
            pointsLabel: "+120"
        },
        {
            title: "Рейтинг",
            body: "Ваша позиция в личном рейтинге: 4 → 3 место.",
            authorName: "Система"
        },
        {
            title: "Достижение",
            body: "Команда получила ачивку «Синхрон».",
            authorName: "Система"
        },
        {
            title: "Мероприятие",
            body: "Воркшоп по КРК — завтра в 16:00.",
            authorName: "Система"
        }
    ];

    seeds.forEach((seed, index) => {
        newsFeedItems.push({
            id: `news-seed-${index}`,
            title: seed.title,
            body: seed.body,
            authorName: seed.authorName ?? "Организатор",
            createdAt: new Date(now - index * 86400_000).toISOString(),
            colorVariant: COLOR_CYCLE[index % COLOR_CYCLE.length],
            pointsLabel: seed.pointsLabel
        });
    });

    persistNewsFeed();
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

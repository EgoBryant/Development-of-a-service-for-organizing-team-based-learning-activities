import aTaskAchievementIconUrl from "../assets/icons/Achievements_Icons/A_Task.svg";
import pTaskAchievementIconUrl from "../assets/icons/Achievements_Icons/P_Task.svg";
import rTaskAchievementIconUrl from "../assets/icons/Achievements_Icons/R_Task.svg";
import sTaskAchievementIconUrl from "../assets/icons/Achievements_Icons/S_Task.svg";
import tTaskAchievementIconUrl from "../assets/icons/Achievements_Icons/T_Task.svg";
import type {
    AchievementCatalogItem,
    ProfileAchievement,
    ProfileAchievementTone,
    UserAchievementItem
} from "../types/profile";

type AchievementPresentation = {
    shortTitle: string;
    iconLabel: string;
    iconUrl: string;
    criterion: string;
    points: number;
    tone: ProfileAchievementTone;
};

const DEFAULT_PRESENTATION: AchievementPresentation = {
    shortTitle: "Достижение",
    iconLabel: "Достижение",
    iconUrl: pTaskAchievementIconUrl,
    criterion: "Выполнить условие достижения.",
    points: 10,
    tone: "blue"
};

export const FALLBACK_ACHIEVEMENT_CATALOG: readonly AchievementCatalogItem[] = [
    {
        id: 1,
        code: "FIRST_CHECKIN",
        title: "Первый check-in",
        description: "Капитан сдал первый еженедельный отчёт команды.",
        iconUrl: ""
    },
    {
        id: 2,
        code: "FIRST_RESCUE",
        title: "Первое спасение",
        description: "Команда успешно помогла другой команде.",
        iconUrl: ""
    },
    {
        id: 3,
        code: "TOP3_TEAM",
        title: "Топ-3 команды",
        description: "Команда зашла в тройку лидеров.",
        iconUrl: ""
    },
    {
        id: 4,
        code: "FIRST_VOTE",
        title: "Голос команды",
        description: "Игрок впервые проголосовал за тиммейта.",
        iconUrl: ""
    },
    {
        id: 5,
        code: "FIRST_CHALLENGE",
        title: "Челлендж принят",
        description: "Команда сдала первый челлендж.",
        iconUrl: ""
    }
];

const PRESENTATION_BY_CODE: Record<string, AchievementPresentation> = {
    FIRST_CHECKIN: {
        shortTitle: "Check-in",
        iconLabel: "Первый check-in",
        iconUrl: pTaskAchievementIconUrl,
        criterion: "Сдать первый еженедельный отчёт команды.",
        points: 10,
        tone: "blue"
    },
    FIRST_RESCUE: {
        shortTitle: "Спасение",
        iconLabel: "Первое спасение",
        iconUrl: sTaskAchievementIconUrl,
        criterion: "Успешно помочь другой команде.",
        points: 25,
        tone: "green"
    },
    TOP3_TEAM: {
        shortTitle: "Топ-3",
        iconLabel: "Топ-3 команды",
        iconUrl: tTaskAchievementIconUrl,
        criterion: "Попасть командой в топ-3 рейтинга.",
        points: 30,
        tone: "amber"
    },
    FIRST_VOTE: {
        shortTitle: "Голос",
        iconLabel: "Голос команды",
        iconUrl: rTaskAchievementIconUrl,
        criterion: "Впервые оценить вклад тиммейта.",
        points: 15,
        tone: "violet"
    },
    FIRST_CHALLENGE: {
        shortTitle: "Челлендж",
        iconLabel: "Челлендж принят",
        iconUrl: aTaskAchievementIconUrl,
        criterion: "Сдать первый командный челлендж.",
        points: 25,
        tone: "rose"
    }
};

function formatEarnedDate(value: string | undefined): string {
    if (!value) {
        return "Получено";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "Получено";
    }

    return `Получено ${date.toLocaleDateString("ru-RU")}`;
}

export function buildProfileAchievements(
    catalog: readonly AchievementCatalogItem[],
    earnedItems: readonly UserAchievementItem[]
): ProfileAchievement[] {
    const earnedByCode = new Map(earnedItems.map((item) => [item.code, item]));

    return catalog.map((catalogItem) => {
        const earned = earnedByCode.get(catalogItem.code);
        const presentation = PRESENTATION_BY_CODE[catalogItem.code] ?? DEFAULT_PRESENTATION;
        const iconUrl = catalogItem.iconUrl.trim() || earned?.iconUrl?.trim() || presentation.iconUrl;

        return {
            id: catalogItem.code,
            code: catalogItem.code,
            achievementId: catalogItem.id,
            title: catalogItem.title || earned?.title || presentation.shortTitle,
            shortTitle: presentation.shortTitle,
            iconLabel: presentation.iconLabel,
            iconUrl,
            description: catalogItem.description || earned?.description || "",
            criterion: presentation.criterion,
            points: presentation.points,
            progressLabel: earned ? formatEarnedDate(earned.earnedAtUtc) : "Не получено",
            status: earned ? "earned" : "locked",
            tone: presentation.tone,
            earnedAtUtc: earned?.earnedAtUtc
        };
    });
}

export function getProfileAchievementById(
    id: string,
    achievements = buildProfileAchievements(FALLBACK_ACHIEVEMENT_CATALOG, [])
): ProfileAchievement {
    return achievements.find((achievement) => achievement.id === id || achievement.code === id) ?? achievements[0];
}

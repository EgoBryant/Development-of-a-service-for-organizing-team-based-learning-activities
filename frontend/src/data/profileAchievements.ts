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
    modalTitle: string;
    modalDescription: string;
    criterion: string;
    points: number;
    tone: ProfileAchievementTone;
};

const DEFAULT_PRESENTATION: AchievementPresentation = {
    shortTitle: "Достижение",
    iconLabel: "Достижение",
    iconUrl: pTaskAchievementIconUrl,
    modalTitle: "ДОСТИЖЕНИЕ",
    modalDescription: "Выполните условие достижения.",
    criterion: "Выполнить условие достижения.",
    points: 10,
    tone: "blue"
};

export const FALLBACK_ACHIEVEMENT_CATALOG: readonly AchievementCatalogItem[] = [
    {
        id: 1,
        code: "FIRST_CHECKIN",
        title: "Первые шаги",
        description: "Успешно пройдите авторизацию и заполните данные в своём профиле.",
        iconUrl: ""
    },
    {
        id: 2,
        code: "FIRST_RESCUE",
        title: "Рука помощи",
        description: "Откликнитесь на запрос о помощи от другой команды.",
        iconUrl: ""
    },
    {
        id: 3,
        code: "TOP3_TEAM",
        title: "В игре!",
        description: "Заработайте первые баллы за задания (не за другие достижения), чтобы попасть в рейтинг.",
        iconUrl: ""
    },
    {
        id: 4,
        code: "FIRST_VOTE",
        title: "Свой круг",
        description: "Создайте команду или вступите в существующую.",
        iconUrl: ""
    },
    {
        id: 5,
        code: "FIRST_CHALLENGE",
        title: "Вызов принят",
        description: "Выполните челлендж и загрузите отчёт.",
        iconUrl: ""
    }
];

const PRESENTATION_BY_CODE: Record<string, AchievementPresentation> = {
    FIRST_CHECKIN: {
        shortTitle: "Первые шаги",
        iconLabel: "Первые шаги",
        iconUrl: pTaskAchievementIconUrl,
        modalTitle: "ПЕРВЫЕ ШАГИ",
        modalDescription: "Успешно пройдите авторизацию и заполните данные в своём профиле.",
        criterion: "Успешно пройдите авторизацию и заполните данные в своём профиле.",
        points: 10,
        tone: "blue"
    },
    FIRST_RESCUE: {
        shortTitle: "Помощь",
        iconLabel: "Рука помощи",
        iconUrl: sTaskAchievementIconUrl,
        modalTitle: "РУКА ПОМОЩИ",
        modalDescription: "Откликнитесь на запрос о помощи от другой команды.",
        criterion: "Откликнитесь на запрос о помощи от другой команды.",
        points: 25,
        tone: "green"
    },
    TOP3_TEAM: {
        shortTitle: "В игре!",
        iconLabel: "В игре!",
        iconUrl: rTaskAchievementIconUrl,
        modalTitle: "В ИГРЕ!",
        modalDescription: "Заработайте первые баллы за задания (не за другие достижения), чтобы попасть в рейтинг.",
        criterion: "Заработайте первые баллы за задания (не за другие достижения), чтобы попасть в рейтинг.",
        points: 10,
        tone: "amber"
    },
    FIRST_VOTE: {
        shortTitle: "Свой круг",
        iconLabel: "Свой круг",
        iconUrl: tTaskAchievementIconUrl,
        modalTitle: "СВОЙ КРУГ",
        modalDescription: "Создайте команду или вступите в существующую.",
        criterion: "Создайте команду или вступите в существующую.",
        points: 15,
        tone: "violet"
    },
    FIRST_CHALLENGE: {
        shortTitle: "Вызов",
        iconLabel: "Вызов принят",
        iconUrl: aTaskAchievementIconUrl,
        modalTitle: "ВЫЗОВ ПРИНЯТ",
        modalDescription: "Выполните челлендж и загрузите отчёт.",
        criterion: "Выполните челлендж и загрузите отчёт.",
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
    const catalogByCode = new Map(catalog.map((item) => [item.code, item]));

    return earnedItems.map((earned) => {
        const catalogItem = catalogByCode.get(earned.code);
        const presentation = PRESENTATION_BY_CODE[earned.code] ?? DEFAULT_PRESENTATION;
        const iconUrl =
            earned.iconUrl?.trim() ||
            catalogItem?.iconUrl.trim() ||
            presentation.iconUrl;

        return {
            id: earned.code,
            code: earned.code,
            achievementId: catalogItem?.id ?? earned.achievementId,
            title: earned.title || catalogItem?.title || presentation.shortTitle,
            shortTitle: presentation.shortTitle,
            iconLabel: presentation.iconLabel,
            iconUrl,
            description: earned.description || catalogItem?.description || "",
            modalTitle: presentation.modalTitle,
            modalDescription: presentation.modalDescription,
            criterion: presentation.criterion,
            points: presentation.points,
            progressLabel: formatEarnedDate(earned.earnedAtUtc),
            status: "earned",
            tone: presentation.tone,
            earnedAtUtc: earned.earnedAtUtc
        };
    });
}

export function getProfileAchievementById(
    id: string,
    achievements: ProfileAchievement[] = []
): ProfileAchievement {
    const found = achievements.find((achievement) => achievement.id === id || achievement.code === id);
    if (found) {
        return found;
    }

    const presentation = PRESENTATION_BY_CODE[id] ?? DEFAULT_PRESENTATION;
    return {
        id,
        code: id,
        achievementId: 0,
        title: presentation.shortTitle,
        shortTitle: presentation.shortTitle,
        iconLabel: presentation.iconLabel,
        iconUrl: presentation.iconUrl,
        description: presentation.modalDescription,
        modalTitle: presentation.modalTitle,
        modalDescription: presentation.modalDescription,
        criterion: presentation.criterion,
        points: presentation.points,
        progressLabel: "Получено",
        status: "earned",
        tone: presentation.tone
    };
}

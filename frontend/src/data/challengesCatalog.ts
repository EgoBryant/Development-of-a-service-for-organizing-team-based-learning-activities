import aTaskAchievementIconUrl from "../assets/icons/Achievements_Icons/A_Task.svg";
import pTaskAchievementIconUrl from "../assets/icons/Achievements_Icons/P_Task.svg";
import rTaskAchievementIconUrl from "../assets/icons/Achievements_Icons/R_Task.svg";
import sTaskAchievementIconUrl from "../assets/icons/Achievements_Icons/S_Task.svg";
import tTaskAchievementIconUrl from "../assets/icons/Achievements_Icons/T_Task.svg";
import type { ChallengeItem, ChallengeResponse } from "../types/challenge";
import type { ProfileAchievementTone } from "../types/profile";

type ChallengePresentation = {
    tone: ProfileAchievementTone;
    iconUrl: string;
};

const CHALLENGE_PRESENTATION: readonly ChallengePresentation[] = [
    { tone: "blue", iconUrl: tTaskAchievementIconUrl },
    { tone: "green", iconUrl: pTaskAchievementIconUrl },
    { tone: "rose", iconUrl: sTaskAchievementIconUrl },
    { tone: "amber", iconUrl: rTaskAchievementIconUrl },
    { tone: "violet", iconUrl: aTaskAchievementIconUrl }
];

export const FALLBACK_CHALLENGES: readonly ChallengeItem[] = [
    {
        id: 1,
        title: "Собери команду из 4 человек",
        description: "Запишите в команду минимум 4 студентов своей группы.",
        bonusPoints: 30,
        isActive: true,
        ...CHALLENGE_PRESENTATION[0]
    },
    {
        id: 2,
        title: "Сдай 3 check-in подряд",
        description: "Капитан сдаёт три еженедельных отчёта подряд без пропусков.",
        bonusPoints: 50,
        isActive: true,
        ...CHALLENGE_PRESENTATION[1]
    },
    {
        id: 3,
        title: "Помоги другой команде",
        description: "Завершите как минимум одно «спасение» для другой команды.",
        bonusPoints: 40,
        isActive: true,
        ...CHALLENGE_PRESENTATION[2]
    },
    {
        id: 4,
        title: "Опубликуй 2 объявления в Бирже знаний",
        description: "Команда публикует 2 экспертных объявления.",
        bonusPoints: 25,
        isActive: true,
        ...CHALLENGE_PRESENTATION[3]
    },
    {
        id: 5,
        title: "Закройте сессию без долгов",
        description: "Все участники команды сдали зачётную неделю без задолженностей.",
        bonusPoints: 100,
        isActive: true,
        ...CHALLENGE_PRESENTATION[4]
    }
];

function withPresentation(item: ChallengeResponse, index: number): ChallengeItem {
    const presentation = CHALLENGE_PRESENTATION[index % CHALLENGE_PRESENTATION.length];

    return {
        id: item.id,
        title: item.title,
        description: item.description,
        bonusPoints: item.bonusPoints,
        isActive: item.isActive,
        tone: presentation.tone,
        iconUrl: presentation.iconUrl
    };
}

export function buildChallengeItems(items: readonly ChallengeResponse[]): ChallengeItem[] {
    return items
        .filter((item) => item.isActive)
        .map((item, index) => withPresentation(item, index));
}

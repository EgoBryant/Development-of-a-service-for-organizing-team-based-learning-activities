import aTaskAchievementIconUrl from "../assets/icons/Achievements_Icons/A_Task.svg";
import pTaskAchievementIconUrl from "../assets/icons/Achievements_Icons/P_Task.svg";
import rTaskAchievementIconUrl from "../assets/icons/Achievements_Icons/R_Task.svg";
import sTaskAchievementIconUrl from "../assets/icons/Achievements_Icons/S_Task.svg";
import tTaskAchievementIconUrl from "../assets/icons/Achievements_Icons/T_Task.svg";
import type { ProfileAchievement } from "../types/profile";

export const PROFILE_ACHIEVEMENTS: readonly ProfileAchievement[] = [
    {
        id: "first-steps",
        title: "ПЕРВЫЕ ШАГИ",
        shortTitle: "Первые шаги",
        iconLabel: "Первые шаги",
        iconUrl: pTaskAchievementIconUrl,
        description: "Успешно пройдите авторизацию и заполните данные в своём профиле.",
        criterion: "Авторизация и заполнение профиля.",
        points: 10,
        progressLabel: "Получено",
        status: "earned",
        tone: "blue"
    },
    {
        id: "own-circle",
        title: "СВОЙ КРУГ",
        shortTitle: "Свой круг",
        iconLabel: "Свой круг",
        iconUrl: tTaskAchievementIconUrl,
        description: "Создайте команду или вступите в существующую.",
        criterion: "Создать команду или вступить в существующую.",
        points: 15,
        progressLabel: "В процессе",
        status: "progress",
        tone: "blue"
    },
    {
        id: "in-game",
        title: "В ИГРЕ!",
        shortTitle: "В игре!",
        iconLabel: "В игре!",
        iconUrl: rTaskAchievementIconUrl,
        description: "Заработайте свои первые баллы активности, чтобы попасть в рейтинг.",
        criterion: "Получить первые баллы активности.",
        points: 10,
        progressLabel: "В процессе",
        status: "progress",
        tone: "blue"
    },
    {
        id: "challenge-accepted",
        title: "ВЫЗОВ ПРИНЯТ",
        shortTitle: "Вызов принят",
        iconLabel: "Вызов принят",
        iconUrl: aTaskAchievementIconUrl,
        description: "Выполните челлендж и загрузите отчёт.",
        criterion: "Выполнить челлендж и загрузить отчёт.",
        points: 25,
        progressLabel: "В процессе",
        status: "progress",
        tone: "blue"
    },
    {
        id: "helping-hand",
        title: "РУКА ПОМОЩИ",
        shortTitle: "Рука помощи",
        iconLabel: "Рука помощи",
        iconUrl: sTaskAchievementIconUrl,
        description: "Откликнитесь на запрос о помощи от другой команды.",
        criterion: "Откликнуться на запрос помощи.",
        points: 25,
        progressLabel: "В процессе",
        status: "progress",
        tone: "blue"
    }
];

export function getProfileAchievementById(id: string): ProfileAchievement {
    return PROFILE_ACHIEVEMENTS.find((achievement) => achievement.id === id) ?? PROFILE_ACHIEVEMENTS[0];
}

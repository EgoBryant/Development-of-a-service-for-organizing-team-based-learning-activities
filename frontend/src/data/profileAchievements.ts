import type { ProfileAchievement } from "../types/profile";

export const PROFILE_ACHIEVEMENTS: readonly ProfileAchievement[] = [
    {
        id: "first-rescue",
        title: "Первое спасение",
        shortTitle: "Спасение",
        iconLabel: "SOS",
        description: "Команда помогла другой команде закрыть учебный риск через механику спасения.",
        criterion: "Принять запрос на помощь и получить подтверждение от команды-получателя.",
        points: 10,
        progressLabel: "Получено",
        status: "earned",
        tone: "rose"
    },
    {
        id: "knowledge-expert",
        title: "Эксперт биржи",
        shortTitle: "Эксперт",
        iconLabel: "P2P",
        description: "Студент дал полезный ответ на бирже знаний и помог сокомандникам разобраться с темой.",
        criterion: "Закрыть 3 запроса на бирже знаний с оценкой пользы не ниже 4 из 5.",
        points: 15,
        progressLabel: "3 из 3",
        status: "earned",
        tone: "blue"
    },
    {
        id: "team-voice",
        title: "Голос команды",
        shortTitle: "Голос",
        iconLabel: "5/5",
        description: "Участник вовремя прошел анонимное голосование и оценил вклад всех членов команды.",
        criterion: "Заполнить голосование до конца учебного цикла.",
        points: 5,
        progressLabel: "Получено",
        status: "earned",
        tone: "green"
    },
    {
        id: "challenge-finish",
        title: "Челлендж закрыт",
        shortTitle: "Челлендж",
        iconLabel: "CH",
        description: "Команда выполнила челлендж до дедлайна и получила бонус к итоговому КРК.",
        criterion: "Завершить командный челлендж и пройти проверку преподавателя.",
        points: 12,
        progressLabel: "Получено",
        status: "earned",
        tone: "amber"
    },
    {
        id: "krk-sprint",
        title: "Рывок КРК",
        shortTitle: "Рывок КРК",
        iconLabel: "КРК",
        description: "Команда заметно улучшила командный рейтинговый коэффициент за текущий цикл.",
        criterion: "Поднять КРК минимум на 15 пунктов относительно прошлого цикла.",
        points: 20,
        progressLabel: "12 из 15",
        status: "progress",
        tone: "violet"
    },
    {
        id: "cohesion",
        title: "Сплоченная команда",
        shortTitle: "Сплоченность",
        iconLabel: "4.5",
        description: "Команда держит высокий коэффициент сплоченности по итогам взаимной оценки.",
        criterion: "Получить среднюю оценку вклада не ниже 4.5 из 5.",
        points: 18,
        progressLabel: "4.3 из 4.5",
        status: "progress",
        tone: "slate"
    }
];

export function getProfileAchievementById(id: string): ProfileAchievement {
    return PROFILE_ACHIEVEMENTS.find((achievement) => achievement.id === id) ?? PROFILE_ACHIEVEMENTS[0];
}

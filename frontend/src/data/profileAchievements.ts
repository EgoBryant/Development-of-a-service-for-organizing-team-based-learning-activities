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
    },
    {
        id: "mentor-call",
        title: "Созвон с наставником",
        shortTitle: "Наставник",
        iconLabel: "CALL",
        description: "Команда провела полезный созвон с наставником и зафиксировала план действий.",
        criterion: "Подготовить вопросы, провести встречу и сохранить итоги в карточке команды.",
        points: 8,
        progressLabel: "Получено",
        status: "earned",
        tone: "blue"
    },
    {
        id: "deadline-keeper",
        title: "Хранитель дедлайнов",
        shortTitle: "Дедлайны",
        iconLabel: "DDL",
        description: "Участник без просрочек закрывает личные задачи и помогает команде держать темп.",
        criterion: "Сдать 5 задач подряд без нарушения дедлайна.",
        points: 14,
        progressLabel: "4 из 5",
        status: "progress",
        tone: "amber"
    },
    {
        id: "idea-generator",
        title: "Генератор идей",
        shortTitle: "Идеи",
        iconLabel: "IDEA",
        description: "Студент предложил несколько решений, которые команда реально использовала в работе.",
        criterion: "Получить 3 подтвержденные идеи от сокомандников.",
        points: 11,
        progressLabel: "Получено",
        status: "earned",
        tone: "rose"
    },
    {
        id: "steady-progress",
        title: "Стабильный прогресс",
        shortTitle: "Прогресс",
        iconLabel: "UP",
        description: "Команда несколько недель подряд показывает устойчивый рост по задачам и активности.",
        criterion: "Закрыть недельный план 4 раза подряд.",
        points: 16,
        progressLabel: "2 из 4",
        status: "progress",
        tone: "green"
    }
];

export function getProfileAchievementById(id: string): ProfileAchievement {
    return PROFILE_ACHIEVEMENTS.find((achievement) => achievement.id === id) ?? PROFILE_ACHIEVEMENTS[0];
}

import type { RatingTeam, RatingUser } from "../types/rating";

export const DEMO_RATING_TEAMS: RatingTeam[] = [
    {
        id: "team-alpha",
        rank: 1,
        name: "КОМАНДА АЛЬФА",
        points: 1240,
        krk: 8.6,
        members: [
            { id: "user-ivanov", displayName: "ИВАНОВ И.", roleLabel: "КАПИТАН" },
            { id: "user-kozlov", displayName: "КОЗЛОВ К.", roleLabel: "ЭКСПЕРТ" }
        ],
        activityHistory: [
            {
                kind: "achievement",
                title: "ИВАНОВ И. получил ачивку «Свой круг»",
                meta: "",
                createdAtUtc: "2026-03-01T10:00:00Z",
                points: 15
            },
            {
                kind: "workshop",
                title: "Команда провела воркшоп по проектированию",
                meta: "",
                createdAtUtc: "2026-02-28T14:00:00Z",
                points: 50
            }
        ]
    },
    {
        id: "team-beta",
        rank: 2,
        name: "КОМАНДА БЕТА",
        points: 1180,
        krk: 8.1,
        members: [
            { id: "user-petrov", displayName: "ПЕТРОВ П.", roleLabel: "КАПИТАН" },
            { id: "user-novikov", displayName: "НОВИКОВ Н.", roleLabel: "УЧАСТНИК" }
        ]
    },
    {
        id: "team-gamma",
        rank: 3,
        name: "КОМАНДА ГАММА",
        points: 1095,
        krk: 7.8,
        members: [{ id: "user-sidorov", displayName: "СИДОРОВ С.", roleLabel: "КАПИТАН" }]
    }
];

export const DEMO_RATING_USERS: RatingUser[] = [
    {
        id: "user-ivanov",
        rank: 1,
        name: "ИВАНОВ И.",
        points: 420,
        hasTeam: true,
        teamId: "team-alpha",
        teamName: "КОМАНДА АЛЬФА",
        groupTitle: "РИ-190922",
        league: "ЗОЛОТО",
        achievementsCount: 5
    },
    {
        id: "user-petrov",
        rank: 2,
        name: "ПЕТРОВ П.",
        points: 405,
        hasTeam: true,
        teamId: "team-beta",
        teamName: "КОМАНДА БЕТА",
        groupTitle: "РИ-190921",
        league: "СЕРЕБРО",
        achievementsCount: 4
    },
    {
        id: "user-sidorov",
        rank: 3,
        name: "СИДОРОВ С.",
        points: 390,
        hasTeam: true,
        teamId: "team-gamma",
        teamName: "КОМАНДА ГАММА",
        groupTitle: "РИ-190920",
        league: "СЕРЕБРО",
        achievementsCount: 4
    },
    {
        id: "user-kozlov",
        rank: 4,
        name: "КОЗЛОВ К.",
        points: 360,
        hasTeam: true,
        teamId: "team-alpha",
        teamName: "КОМАНДА АЛЬФА",
        groupTitle: "РИ-190922",
        league: "БРОНЗА",
        achievementsCount: 3
    },
    {
        id: "user-novikov",
        rank: 5,
        name: "НОВИКОВ Н.",
        points: 340,
        hasTeam: true,
        teamId: "team-beta",
        teamName: "КОМАНДА БЕТА",
        groupTitle: "РИ-190921",
        league: "БРОНЗА",
        achievementsCount: 3
    },
    {
        id: "user-volkov",
        rank: 7,
        name: "ВОЛКОВ В.",
        points: 310,
        hasTeam: false,
        teamId: null,
        groupTitle: "РИ-190918",
        league: "БАЗОВАЯ",
        achievementsCount: 2
    }
];

export function getRatingUserById(userId: string): RatingUser | undefined {
    return DEMO_RATING_USERS.find((user) => user.id === userId);
}

export function getRatingTeamById(teamId: string): RatingTeam | undefined {
    return DEMO_RATING_TEAMS.find((team) => team.id === teamId);
}

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
            { id: "user-kozlov", displayName: "КОЗЛОВ К.", roleLabel: "УЧАСТНИК" }
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
    },
    {
        id: "team-delta",
        rank: 4,
        name: "КОМАНДА ДЕЛЬТА",
        points: 980,
        krk: 7.2,
        members: [{ id: "user-morozov", displayName: "МОРОЗОВ М.", roleLabel: "КАПИТАН" }]
    },
    {
        id: "team-epsilon",
        rank: 5,
        name: "КОМАНДА ЭПСИЛОН",
        points: 910,
        krk: 6.9,
        members: []
    },
    {
        id: "team-zeta",
        rank: 6,
        name: "КОМАНДА ДЗЕТА",
        points: 860,
        krk: 6.5,
        members: []
    },
    {
        id: "team-eta",
        rank: 7,
        name: "КОМАНДА ЭТА",
        points: 820,
        krk: 6.2,
        members: []
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
        league: "ЗОЛОТО",
        achievementsCount: 12
    },
    {
        id: "user-petrov",
        rank: 2,
        name: "ПЕТРОВ П.",
        points: 405,
        hasTeam: true,
        teamId: "team-beta",
        league: "СЕРЕБРО",
        achievementsCount: 9
    },
    {
        id: "user-sidorov",
        rank: 3,
        name: "СИДОРОВ С.",
        points: 390,
        hasTeam: true,
        teamId: "team-gamma",
        league: "СЕРЕБРО",
        achievementsCount: 8
    },
    {
        id: "user-kozlov",
        rank: 4,
        name: "КОЗЛОВ К.",
        points: 360,
        hasTeam: true,
        teamId: "team-alpha",
        league: "БРОНЗА",
        achievementsCount: 6
    },
    {
        id: "user-novikov",
        rank: 5,
        name: "НОВИКОВ Н.",
        points: 340,
        hasTeam: true,
        teamId: "team-beta",
        league: "БРОНЗА",
        achievementsCount: 5
    },
    {
        id: "user-morozov",
        rank: 6,
        name: "МОРОЗОВ М.",
        points: 325,
        hasTeam: true,
        teamId: "team-delta",
        league: "БАЗОВАЯ",
        achievementsCount: 4
    },
    {
        id: "user-volkov",
        rank: 7,
        name: "ВОЛКОВ В.",
        points: 310,
        hasTeam: false,
        teamId: null,
        league: "БАЗОВАЯ",
        achievementsCount: 3
    },
    {
        id: "user-sokolov",
        rank: 8,
        name: "СОКОЛОВ С.",
        points: 295,
        hasTeam: false,
        teamId: null,
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

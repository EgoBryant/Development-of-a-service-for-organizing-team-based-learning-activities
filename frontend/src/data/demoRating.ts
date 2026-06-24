import type { RatingTeam, RatingUser } from "../types/rating";

export const DEMO_RATING_TEAMS: RatingTeam[] = [];

export const DEMO_RATING_USERS: RatingUser[] = [];

export function getRatingUserById(userId: string): RatingUser | undefined {
    return DEMO_RATING_USERS.find((user) => user.id === userId);
}

export function getRatingTeamById(teamId: string): RatingTeam | undefined {
    return DEMO_RATING_TEAMS.find((team) => team.id === teamId);
}

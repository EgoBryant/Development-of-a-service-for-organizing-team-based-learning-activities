import { DEMO_RATING_TEAMS, DEMO_RATING_USERS } from "../data/demoRating";
import type { RatingTeam, RatingUser } from "../types/rating";

let ratingTeams: RatingTeam[] = [];
let ratingUsers: RatingUser[] = [];
let ratingUsesSessionData = false;

export function setRatingData(teams: RatingTeam[], users: RatingUser[]): void {
    ratingTeams = teams;
    ratingUsers = users;
    ratingUsesSessionData = true;
}

export function clearRatingData(): void {
    ratingTeams = [];
    ratingUsers = [];
    ratingUsesSessionData = false;
}

export function getRatingTeams(): RatingTeam[] {
    if (ratingUsesSessionData) {
        return ratingTeams;
    }

    return DEMO_RATING_TEAMS.map(normalizeTeam);
}

export function getRatingUsers(): RatingUser[] {
    if (ratingUsesSessionData) {
        return ratingUsers;
    }

    return DEMO_RATING_USERS.map(normalizeUser);
}

export function getRatingTeamById(teamId: string): RatingTeam | undefined {
    return getRatingTeams().find((team) => team.id === teamId);
}

export function getRatingUserById(userId: string): RatingUser | undefined {
    return getRatingUsers().find((item) => item.id === userId);
}
function normalizeTeam(team: RatingTeam): RatingTeam {
    return {
        league: "ПРОФИ",
        memberCount: team.members.length,
        captainName: team.members.find((member) => member.roleLabel === "КАПИТАН")?.displayName ?? "",
        cohesion: 0,
        challengeBonus: 0,
        checkInsCount: 0,
        completedRescuesCount: 0,
        activityHistory: [],
        ...team
    };
}

function normalizeUser(user: RatingUser): RatingUser {
    return {
        contribution: 0,
        teamName: "",
        groupTitle: "",
        isCaptain: false,
        avatarUrl: "",
        ...user
    };
}

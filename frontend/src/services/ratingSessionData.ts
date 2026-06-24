import type { UserProfileResponse } from "../types/auth";
import type { RatingTeam, RatingTeamMember, RatingUser } from "../types/rating";
import type { LocalCreatedTeam, TeamResponse } from "../types/team";
import { normalizePersonalLeague } from "../utils/personalLeague";

function formatRatingUserName(profile: UserProfileResponse): string {
    const last = profile.lastName?.trim() ?? "";
    const first = profile.firstName?.trim() ?? "";
    const initial = first ? `${first.charAt(0).toUpperCase()}.` : "";

    if (last && initial) {
        return `${last.toUpperCase()} ${initial}`;
    }

    return (profile.nickname?.trim() || profile.userName?.trim() || "УЧАСТНИК").toUpperCase();
}

function rerankByPoints<T extends { points: number; rank: number }>(items: T[]): T[] {
    return [...items]
        .sort((left, right) => right.points - left.points)
        .map((item, index) => ({ ...item, rank: index + 1 }));
}

export function buildRatingUserFromProfile(profile: UserProfileResponse): RatingUser {
    return {
        id: String(profile.id),
        rank: profile.personalRating > 0 ? profile.personalRating : 0,
        name: formatRatingUserName(profile),
        points: profile.userPoints ?? 0,
        contribution: profile.personalContribution,
        hasTeam: profile.teamId != null || Boolean(profile.teamName?.trim()),
        teamId: profile.teamId != null ? String(profile.teamId) : null,
        teamName: profile.teamName ?? "",
        groupTitle: profile.groupTitle ?? "",
        isCaptain: profile.isCaptain,
        league: normalizePersonalLeague(profile.personalLeague),
        achievementsCount: 0,
        avatarUrl: profile.avatarUrl
    };
}

export function mergeSessionUserIntoRatingUsers(
    users: RatingUser[],
    profile: UserProfileResponse | null
): RatingUser[] {
    if (!profile) {
        return users;
    }

    const sessionUser = buildRatingUserFromProfile(profile);
    const exists = users.some((user) => user.id === sessionUser.id);
    const merged = exists
        ? users.map((user) =>
              user.id === sessionUser.id
                  ? {
                        ...user,
                        ...sessionUser,
                        achievementsCount: user.achievementsCount || sessionUser.achievementsCount
                    }
                  : user
          )
        : [...users, sessionUser];

    return rerankByPoints(merged);
}

function mapTeamMembers(members: TeamResponse["members"]): RatingTeamMember[] {
    return members.map((member) => ({
        id: String(member.id),
        displayName: member.displayName || member.userName || "УЧАСТНИК",
        roleLabel: member.roleLabel || (member.isCaptain ? "КАПИТАН" : "УЧАСТНИК"),
        avatarUrl: member.avatarUrl
    }));
}

export function buildRatingTeamFromResponse(team: TeamResponse): RatingTeam {
    return {
        id: String(team.id),
        rank: 0,
        name: team.name,
        points: team.score,
        krk: team.krk,
        members: mapTeamMembers(team.members),
        activityHistory: []
    };
}

export function buildRatingTeamFromLocal(team: LocalCreatedTeam, profile: UserProfileResponse): RatingTeam {
    const members: RatingTeamMember[] = team.members.length
        ? team.members.map((member) => ({
              id: member.id,
              displayName: member.displayName,
              roleLabel: member.roleLabel,
              avatarUrl: member.avatarUrl
          }))
        : [
              {
                  id: String(profile.id),
                  displayName: formatRatingUserName(profile),
                  roleLabel: profile.isCaptain ? "КАПИТАН" : "УЧАСТНИК",
                  avatarUrl: profile.avatarUrl
              }
          ];

    return {
        id: profile.teamId != null ? String(profile.teamId) : `local-team-${profile.id}`,
        rank: 0,
        name: team.name,
        points: profile.teamScore ?? profile.userPoints ?? 0,
        krk: 0,
        members,
        activityHistory: []
    };
}

export function mergeSessionTeamIntoRatingTeams(
    teams: RatingTeam[],
    profile: UserProfileResponse | null,
    currentTeam: TeamResponse | null,
    localTeam: LocalCreatedTeam | null
): RatingTeam[] {
    if (!profile) {
        return teams;
    }

    let sessionTeam: RatingTeam | null = null;
    if (currentTeam) {
        sessionTeam = buildRatingTeamFromResponse(currentTeam);
    } else if (localTeam) {
        sessionTeam = buildRatingTeamFromLocal(localTeam, profile);
    } else if (profile.teamId != null || profile.teamName?.trim()) {
        sessionTeam = {
            id: profile.teamId != null ? String(profile.teamId) : `local-team-${profile.id}`,
            rank: 0,
            name: profile.teamName?.trim() || "МОЯ КОМАНДА",
            points: profile.teamScore ?? 0,
            krk: 0,
            members: [
                {
                    id: String(profile.id),
                    displayName: formatRatingUserName(profile),
                    roleLabel: profile.isCaptain ? "КАПИТАН" : "УЧАСТНИК",
                    avatarUrl: profile.avatarUrl
                }
            ],
            activityHistory: []
        };
    }

    if (!sessionTeam) {
        return rerankByPoints(teams);
    }

    const exists = teams.some((team) => team.id === sessionTeam!.id);
    const merged = exists
        ? teams.map((team) =>
              team.id === sessionTeam!.id
                  ? {
                        ...team,
                        ...sessionTeam!,
                        members: sessionTeam!.members.length ? sessionTeam!.members : team.members,
                        activityHistory: team.activityHistory?.length ? team.activityHistory : sessionTeam!.activityHistory
                    }
                  : team
          )
        : [...teams, sessionTeam];

    return rerankByPoints(merged);
}

import type { UserProfileResponse } from "../types/auth";
import type { RatingTeam, RatingTeamMember, RatingUser } from "../types/rating";
import type { LocalCreatedTeam, TeamJoinRequestResponse, TeamResponse } from "../types/team";
import { normalizePersonalLeague } from "../utils/personalLeague";

type AvatarSource = {
    id: string | number;
    avatarUrl?: string | null;
};

function addAvatarSource(sources: AvatarSource[], id: string | number, avatarUrl?: string | null): void {
    const normalizedId = String(id).trim();
    const normalizedUrl = avatarUrl?.trim();
    if (!normalizedId || !normalizedUrl) {
        return;
    }

    sources.push({ id: normalizedId, avatarUrl: normalizedUrl });
}

export function collectKnownUserAvatars(options: {
    teamCatalog?: TeamResponse[];
    currentTeam?: TeamResponse | null;
    joinRequests?: TeamJoinRequestResponse[];
    ratingTeams?: RatingTeam[];
}): Map<string, string> {
    const sources: AvatarSource[] = [];

    for (const team of options.teamCatalog ?? []) {
        for (const member of team.members ?? []) {
            addAvatarSource(sources, member.id, member.avatarUrl);
        }
    }

    for (const member of options.currentTeam?.members ?? []) {
        addAvatarSource(sources, member.id, member.avatarUrl);
    }

    for (const request of options.joinRequests ?? []) {
        addAvatarSource(sources, request.userId, request.avatarUrl);
    }

    for (const team of options.ratingTeams ?? []) {
        for (const member of team.members ?? []) {
            addAvatarSource(sources, member.id, member.avatarUrl);
        }
    }

    const lookup = new Map<string, string>();
    for (const source of sources) {
        const id = String(source.id);
        const url = source.avatarUrl?.trim();
        if (id && url && !lookup.has(id)) {
            lookup.set(id, url);
        }
    }

    return lookup;
}

export function enrichRatingUsersWithKnownAvatars(
    users: RatingUser[],
    avatarLookup: Map<string, string>
): RatingUser[] {
    return users.map((user) => ({
        ...user,
        avatarUrl: user.avatarUrl?.trim() || avatarLookup.get(user.id) || ""
    }));
}

export function enrichRatingTeamsWithKnownAvatars(
    teams: RatingTeam[],
    avatarLookup: Map<string, string>
): RatingTeam[] {
    return teams.map((team) => ({
        ...team,
        members: team.members.map((member) => ({
            ...member,
            avatarUrl: member.avatarUrl?.trim() || avatarLookup.get(member.id) || ""
        }))
    }));
}

function formatRatingUserName(profile: UserProfileResponse): string {
    const last = profile.lastName?.trim() ?? "";
    const first = profile.firstName?.trim() ?? "";

    if (first || last) {
        return [first, last].filter(Boolean).join(" ").toUpperCase();
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
        rank: profile.personalRank ?? 0,
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

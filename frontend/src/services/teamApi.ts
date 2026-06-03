import { request } from "./httpClient";
import type {
    CheckInResponse,
    HelpRequestResponse,
    MyVoteResponse,
    TeamJoinRequestResponse,
    TeamResponse,
    VoteResponse
} from "../types/team";

function authHeaders(token: string): HeadersInit {
    return { Authorization: `Bearer ${token}` };
}

export function fetchTeams(token: string): Promise<TeamResponse[]> {
    return request<TeamResponse[]>("/api/teams", {
        headers: authHeaders(token)
    });
}

export function searchTeams(token: string, query = "", limit = 20): Promise<TeamResponse[]> {
    const params = new URLSearchParams();
    if (query.trim()) {
        params.set("query", query.trim());
    }
    params.set("limit", String(limit));

    return request<TeamResponse[]>(`/api/teams/search?${params.toString()}`, {
        headers: authHeaders(token)
    });
}

export function fetchTeamByInviteCode(token: string, inviteCode: string): Promise<TeamResponse> {
    return request<TeamResponse>(`/api/teams/invite/${encodeURIComponent(inviteCode.trim())}`, {
        headers: authHeaders(token)
    });
}

export function fetchMyTeam(token: string): Promise<TeamResponse> {
    return request<TeamResponse>("/api/teams/me", {
        headers: authHeaders(token)
    });
}

export function createTeam(
    token: string,
    body: { name: string; description: string }
): Promise<TeamResponse> {
    return request<TeamResponse>("/api/teams/create", {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify(body)
    });
}

export function joinTeam(
    token: string,
    inviteCode: string
): Promise<TeamResponse> {
    return request<TeamResponse>("/api/teams/join", {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({ inviteCode })
    });
}

export function fetchCheckIns(token: string): Promise<CheckInResponse[]> {
    return request<CheckInResponse[]>("/api/checkins", {
        headers: authHeaders(token)
    });
}

export function createCheckIn(
    token: string,
    body: { weekNumber: number; reportText: string }
): Promise<CheckInResponse> {
    return request<CheckInResponse>("/api/checkins", {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify(body)
    });
}

export function fetchHelpRequests(token: string, scope = ""): Promise<HelpRequestResponse[]> {
    const query = scope ? `?scope=${encodeURIComponent(scope)}` : "";
    return request<HelpRequestResponse[]>(`/api/help-requests${query}`, {
        headers: authHeaders(token)
    });
}

export function createHelpRequest(
    token: string,
    body: {
        toTeamId: number;
        topic: string;
        tag: string;
        description: string;
        format: string;
        scheduledAtUtc: string | null;
        leagueLabel: string;
        bonusPoints: number;
    }
): Promise<HelpRequestResponse> {
    return request<HelpRequestResponse>("/api/help-requests", {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify(body)
    });
}

export function updateHelpRequestStatus(
    token: string,
    id: number,
    status: string
): Promise<HelpRequestResponse> {
    return request<HelpRequestResponse>(`/api/help-requests/${id}/status`, {
        method: "PATCH",
        headers: authHeaders(token),
        body: JSON.stringify({ status })
    });
}

export function fetchTeamJoinRequests(token: string, scope = ""): Promise<TeamJoinRequestResponse[]> {
    const query = scope ? `?scope=${encodeURIComponent(scope)}` : "";
    return request<TeamJoinRequestResponse[]>(`/api/teams/join-requests${query}`, {
        headers: authHeaders(token)
    });
}

export function createTeamJoinRequest(
    token: string,
    teamId: number,
    message = ""
): Promise<TeamJoinRequestResponse> {
    return request<TeamJoinRequestResponse>("/api/teams/join-requests", {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({ teamId, message })
    });
}

export function updateTeamJoinRequestStatus(
    token: string,
    id: number,
    status: string
): Promise<TeamJoinRequestResponse> {
    return request<TeamJoinRequestResponse>(`/api/teams/join-requests/${id}/status`, {
        method: "PATCH",
        headers: authHeaders(token),
        body: JSON.stringify({ status })
    });
}

export function fetchMyVotes(token: string): Promise<MyVoteResponse[]> {
    return request<MyVoteResponse[]>("/api/votes/my", {
        headers: authHeaders(token)
    });
}

export function createVote(
    token: string,
    toUserId: number,
    score: number
): Promise<VoteResponse> {
    return request<VoteResponse>("/api/votes", {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({ toUserId, score })
    });
}

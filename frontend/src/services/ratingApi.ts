import { request } from "./httpClient";
import type { RatingTeam, RatingUser } from "../types/rating";

function authHeaders(token: string): HeadersInit {
    return { Authorization: `Bearer ${token}` };
}

export function fetchRatingTeams(token: string, limit = 100): Promise<RatingTeam[]> {
    return request<RatingTeam[]>(`/api/ratings/teams?sort=rank-asc&limit=${limit}`, {
        headers: authHeaders(token)
    });
}

export function fetchRatingUsers(token: string, limit = 100): Promise<RatingUser[]> {
    return request<RatingUser[]>(`/api/ratings/users?sort=rank-asc&limit=${limit}`, {
        headers: authHeaders(token)
    });
}

export function fetchRatingUserById(token: string, userId: number): Promise<RatingUser> {
    return request<RatingUser>(`/api/ratings/users/${userId}`, {
        headers: authHeaders(token)
    });
}

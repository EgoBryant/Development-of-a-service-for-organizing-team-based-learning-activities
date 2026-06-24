import { request } from "./httpClient";
import type { AchievementCatalogItem, UserAchievementItem } from "../types/profile";

function authHeaders(token: string): HeadersInit {
    return { Authorization: `Bearer ${token}` };
}

export function fetchAchievementsCatalog(token: string): Promise<AchievementCatalogItem[]> {
    return request<AchievementCatalogItem[]>("/api/achievements", {
        headers: authHeaders(token)
    });
}

export function fetchMyAchievements(token: string): Promise<UserAchievementItem[]> {
    return request<UserAchievementItem[]>("/api/users/me/achievements", {
        headers: authHeaders(token)
    });
}

export function fetchUserAchievements(token: string, userId: number): Promise<UserAchievementItem[]> {
    return request<UserAchievementItem[]>(`/api/users/${userId}/achievements`, {
        headers: authHeaders(token)
    });
}

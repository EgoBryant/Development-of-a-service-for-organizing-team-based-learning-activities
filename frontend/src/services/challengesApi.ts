import { request } from "./httpClient";
import type { ChallengeResponse } from "../types/challenge";

function authHeaders(token: string): HeadersInit {
    return { Authorization: `Bearer ${token}` };
}

export function fetchActiveChallenges(token: string): Promise<ChallengeResponse[]> {
    return request<ChallengeResponse[]>("/api/challenges", {
        headers: authHeaders(token)
    });
}

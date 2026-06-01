import { request } from "./httpClient";
import type { AuthResponse, UpdateProfileJsonBody, UserProfileResponse } from "../types/auth";

interface LoginRequest {
    email: string;
    password: string;
}

interface RegisterRequest {
    userName: string;
    email: string;
    password: string;
}

export function login(body: LoginRequest): Promise<AuthResponse> {
    return request<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(body)
    });
}

export function register(body: RegisterRequest): Promise<AuthResponse> {
    return request<AuthResponse>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(body)
    });
}

export function fetchCurrentUser(bearerToken: string): Promise<UserProfileResponse> {
    return request<UserProfileResponse>("/api/auth/me", {
        headers: { Authorization: `Bearer ${bearerToken}` }
    });
}

export function updateProfile(
    bearerToken: string,
    body: UpdateProfileJsonBody
): Promise<UserProfileResponse> {
    return request<UserProfileResponse>("/api/profile", {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${bearerToken}`
        },
        body: JSON.stringify(body)
    });
}

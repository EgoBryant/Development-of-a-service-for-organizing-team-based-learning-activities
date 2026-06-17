import { API_BASE_URL } from "../config/api";
import type { ProblemLike } from "../types/auth";

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const headers = new Headers(init?.headers);
    headers.set("Accept", "application/json");

    if (init?.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...init,
        headers
    });

    if (!response.ok) {
        let message = `Ошибка ${response.status}`;

        try {
            const body = (await response.json()) as ProblemLike;
            if (body.errors) {
                const fromModel = Object.values(body.errors)
                    .flat()
                    .find((line) => line?.trim().length);
                if (fromModel) {
                    message = fromModel;
                }
            }
            if (message === `Ошибка ${response.status}`) {
                message = body.detail || body.message || body.title || message;
            }
        } catch {
            message = response.statusText || message;
        }

        // Создаем ошибку и явно добавляем ей статус ответа (например, 404)
        const apiError = new Error(translateApiErrorMessage(message)) as Error & { status?: number };
        apiError.status = response.status;
        
        throw apiError;
    }

    return await response.json() as T;
}

export function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : "Не удалось выполнить запрос.";
}

function translateApiErrorMessage(message: string): string {
    const known: Record<string, string> = {
        "User with this email already exists.": "Пользователь с таким email уже зарегистрирован.",
        "Invalid email or password.": "Неверная почта или пароль."
    };

    return known[message] ?? message;
}
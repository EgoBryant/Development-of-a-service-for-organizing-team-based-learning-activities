import { API_BASE_URL } from "../config/api";
import type { ProblemLike } from "../types/auth";

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const headers = new Headers(init?.headers);
    headers.set("Accept", "application/json");

    if (init?.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    let response: Response;
    try {
        response = await fetch(`${API_BASE_URL}${path}`, {
            ...init,
            headers
        });
    } catch (error) {
        if (error instanceof TypeError) {
            throw new Error("Не удалось связаться с сервером. Проверьте, что backend запущен.");
        }

        throw error;
    }

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

    if (response.status === 204) {
        return undefined as T;
    }

    return await response.json() as T;
}

export function getErrorMessage(error: unknown): string {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
        return "Не удалось связаться с сервером. Проверьте, что backend запущен.";
    }

    if (error instanceof Error && (error as Error & { status?: number }).status === 403) {
        return "��� ������� � ����� ��������.";
    }

    return error instanceof Error ? error.message : "Не удалось выполнить запрос.";
}

function translateApiErrorMessage(message: string): string {
    const known: Record<string, string> = {
        "User with this email already exists.": "Пользователь с таким email уже зарегистрирован.",
        "Invalid email or password.": "Неверная почта или пароль.",
        "User already belongs to a team.": "Вы уже состоите в команде.",
        "Team membership conflict": "Вы уже состоите в команде.",
        "Team with this invite code was not found.": "Команда с таким кодом приглашения не найдена.",
        "Join request already exists": "Заявка в эту команду уже отправлена.",
        "The current user is not in a team.": "Вы не состоите в команде.",
        "You must belong to a team before voting.": "Чтобы голосовать, нужно состоять в команде.",
        "You have already voted for this teammate.": "Вы уже оценили этого участника.",
        "You have not voted for this teammate yet.": "Вы ещё не оценивали этого участника.",
        "Avatar image payload exceeds the maximum allowed size.": "Фото профиля не должно превышать 2 МБ."
    };

    return known[message] ?? message;
}
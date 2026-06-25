import { API_BASE_URL } from "../config/api";
import type { ProblemLike } from "../types/auth";

export type ApiRequestError = Error & {
    status?: number;
    code?: string;
};

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
            throw createApiError("Не удалось подключиться к серверу. Проверьте, что backend запущен.");
        }

        throw error;
    }

    if (!response.ok) {
        let message = `Ошибка ${response.status}`;
        let code: string | undefined;

        try {
            const body = (await response.json()) as ProblemLike;
            code = body.code;
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

        throw createApiError(translateApiErrorMessage(message, code), response.status, code);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return await response.json() as T;
}

function createApiError(message: string, status?: number, code?: string): ApiRequestError {
    const apiError = new Error(message) as ApiRequestError;
    apiError.status = status;
    apiError.code = code;
    return apiError;
}

export function getErrorMessage(error: unknown): string {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
        return "Не удалось подключиться к серверу. Проверьте, что backend запущен.";
    }

    if (error instanceof Error && (error as ApiRequestError).status === 403) {
        return "Нет доступа к этому действию.";
    }

    return error instanceof Error ? error.message : "Не удалось выполнить запрос.";
}

function translateApiErrorMessage(message: string, code?: string): string {
    const byCode: Record<string, string> = {
        user_not_found: "Аккаунта с такой почтой нет.",
        invalid_password: "Неверный пароль.",
        invalid_credentials: "Неверная почта или пароль.",
        email_taken: "Эта почта уже зарегистрирована."
    };

    if (code && byCode[code]) {
        return byCode[code];
    }

    const known: Record<string, string> = {
        "User with this email already exists.": "Эта почта уже зарегистрирована.",
        "User with this email was not found.": "Аккаунта с такой почтой нет.",
        "Invalid password.": "Неверный пароль.",
        "Invalid email or password.": "Неверная почта или пароль.",
        "User already belongs to a team.": "Вы уже состоите в команде.",
        "Team membership conflict": "Вы уже состоите в команде.",
        "Team with this invite code was not found.": "Команда с таким кодом приглашения не найдена.",
        "Join request already exists": "Заявка в эту команду уже отправлена.",
        "The current user is not in a team.": "Вы не состоите в команде.",
        "The team captain cannot leave the team. Disband the team or transfer captaincy.": "Капитан не может покинуть команду. Расформируйте её или передайте капитанство.",
        "You must belong to a team before voting.": "Чтобы голосовать, нужно состоять в команде.",
        "You have already voted for this teammate.": "Вы уже оценили этого участника.",
        "You have not voted for this teammate yet.": "Вы ещё не оценивали этого участника.",
        "Avatar image payload exceeds the maximum allowed size.": "Файл аватара не больше 2 МБ."
    };

    return known[message] ?? message;
}

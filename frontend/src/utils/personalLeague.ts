export type PersonalLeague = "Новичок" | "Профи" | "Легенда";

export const PERSONAL_LEAGUES: PersonalLeague[] = ["Новичок", "Профи", "Легенда"];

const PERSONAL_LEAGUE_ALIASES: Record<string, PersonalLeague> = {
    старт: "Новичок",
    базовая: "Новичок",
    базовый: "Новичок",
    новичок: "Новичок",
    novice: "Новичок",
    бронза: "Новичок",
    профи: "Профи",
    pro: "Профи",
    medium: "Профи",
    серебро: "Профи",
    мастер: "Легенда",
    легенда: "Легенда",
    legend: "Легенда",
    золото: "Легенда"
};

export function normalizePersonalLeague(value?: string | null): PersonalLeague {
    const trimmed = value?.trim();
    if (!trimmed) {
        return "Новичок";
    }

    if (trimmed === "Новичок" || trimmed === "Профи" || trimmed === "Легенда") {
        return trimmed;
    }

    return PERSONAL_LEAGUE_ALIASES[trimmed.toLowerCase()] ?? "Новичок";
}

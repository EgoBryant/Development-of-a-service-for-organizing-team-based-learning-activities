import { EVENTS_CALENDAR_YEAR } from "../data/demoEvents";

const MS_PER_DAY = 86_400_000;

/** Якорь недели (понедельник) для сравнения смещений. */
export function getMondayOfWeek(date: Date): Date {
    const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const weekday = monday.getDay();
    const diff = weekday === 0 ? -6 : 1 - weekday;
    monday.setDate(monday.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
}

/** Дата из datetime-local: YYYY-MM-DD (без сдвигов UTC). */
export function extractEventDateKey(dateTime: string): string | null {
    const match = /^(\d{4}-\d{2}-\d{2})/.exec(dateTime.trim());
    return match?.[1] ?? null;
}

export function dateKeyToLocalDate(dateKey: string): Date {
    const [year, month, day] = dateKey.split("-").map(Number);
    return new Date(year, month - 1, day);
}

export function dateToDateKey(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
}

export const CALENDAR_WEEKDAY_LABELS = ["ВС", "ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ"] as const;

export function formatCalendarWeekdayLabel(date: Date): string {
    return CALENDAR_WEEKDAY_LABELS[date.getDay()] ?? "ПН";
}

export function getCalendarDayDateKey(weekStart: Date, dayIndex: number): string {
    const day = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + dayIndex);
    const month = String(day.getMonth() + 1).padStart(2, "0");
    const date = String(day.getDate()).padStart(2, "0");
    return `${day.getFullYear()}-${month}-${date}`;
}

/** Парсинг значения input[type=datetime-local]. */
export function parseEventDateTimeLocal(dateTime: string): Date | null {
    const trimmed = dateTime.trim();
    if (!trimmed) {
        return null;
    }

    const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/.exec(trimmed);
    if (match) {
        const [, year, month, day, hour, minute, second] = match;
        return new Date(
            Number(year),
            Number(month) - 1,
            Number(day),
            Number(hour),
            Number(minute),
            second ? Number(second) : 0,
            0
        );
    }

    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** @deprecated Используйте parseEventDateTimeLocal или extractEventDateKey. */
export function parseEventDateTime(dateTime: string): Date | null {
    return parseEventDateTimeLocal(dateTime);
}

export function isSameCalendarDay(left: Date, right: Date): boolean {
    return (
        left.getFullYear() === right.getFullYear() &&
        left.getMonth() === right.getMonth() &&
        left.getDate() === right.getDate()
    );
}

export function getWeekOffsetForDate(anchorMonday: Date, targetDate: Date): number {
    const anchor = getMondayOfWeek(anchorMonday);
    const targetMonday = getMondayOfWeek(targetDate);
    const diffDays = Math.round((targetMonday.getTime() - anchor.getTime()) / MS_PER_DAY);
    return Math.floor(diffDays / 7);
}

export function isEventInCalendarYear(dateTime: string, year: number = EVENTS_CALENDAR_YEAR): boolean {
    const dateKey = extractEventDateKey(dateTime);
    if (!dateKey) {
        return false;
    }

    return Number(dateKey.slice(0, 4)) === year;
}

/** @deprecated Используйте isEventInCalendarYear. */
export function isEventOnVisibleWeekday(dateTime: string): boolean {
    return isEventInCalendarYear(dateTime);
}

export function formatEventCardTime(dateTime: string): string {
    const parsed = parseEventDateTimeLocal(dateTime);
    if (!parsed) {
        const dateKey = extractEventDateKey(dateTime);
        if (!dateKey) {
            return "";
        }
        return "00:00";
    }

    return parsed.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit"
    });
}

export function formatEventTimeRange(dateTime: string, endDateTime?: string): string {
    const start = formatEventCardTime(dateTime);
    if (!start) {
        return "";
    }

    const end = endDateTime ? formatEventCardTime(endDateTime) : "";
    return end ? `${start} — ${end}` : start;
}

export function getEventTagModifier(tag: string): string {
    const normalized = tag.trim().toLowerCase();

    if (normalized.includes("культур")) {
        return "culture";
    }
    if (normalized.includes("спорт")) {
        return "sport";
    }
    if (normalized.includes("обуч") || normalized.includes("уч")) {
        return "study";
    }
    if (normalized.includes("наук")) {
        return "science";
    }
    if (normalized.includes("встреч")) {
        return "meetup";
    }

    return "default";
}

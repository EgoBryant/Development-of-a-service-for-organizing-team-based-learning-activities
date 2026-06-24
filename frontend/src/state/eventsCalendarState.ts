import type { CalendarEventItem, EventCreateDraft } from "../types/event";
import { createCalendarEventFromDraft } from "../types/event";
import {
    dateKeyToLocalDate,
    extractEventDateKey,
    getCalendarDayDateKey,
    getMondayOfWeek,
    getWeekOffsetForDate,
    parseEventDateTimeLocal
} from "../utils/calendarEvents";
/** Понедельник 1 июня 2026 — якорь недели из макета «События». */
export const EVENTS_WEEK_ANCHOR = getMondayOfWeek(new Date(2026, 5, 1));

const USER_EVENTS_STORAGE_KEY = "team-exam-user-calendar-events";

export const eventsUserCreated: CalendarEventItem[] = [];

export function loadPersistedUserEvents(): void {
    if (typeof localStorage === "undefined") {
        return;
    }

    try {
        const raw = localStorage.getItem(USER_EVENTS_STORAGE_KEY);
        if (!raw) {
            return;
        }

        const parsed = JSON.parse(raw) as CalendarEventItem[];
        if (!Array.isArray(parsed)) {
            return;
        }

        eventsUserCreated.length = 0;
        for (const item of parsed) {
            if (!item?.id || !item.dateTime) {
                continue;
            }

            eventsUserCreated.push({
                id: item.id,
                topic: item.topic ?? "",
                tag: item.tag ?? "",
                format: item.format ?? "",
                description: item.description ?? "",
                dateTime: item.dateTime,
                isMine: item.isMine !== false
            });
        }
    } catch {
        /* ignore corrupted storage */
    }
}

function persistUserEvents(): void {
    if (typeof localStorage === "undefined") {
        return;
    }

    localStorage.setItem(USER_EVENTS_STORAGE_KEY, JSON.stringify(eventsUserCreated));
}

export function getWeekStartForOffset(weekOffset: number): Date {
    return new Date(
        EVENTS_WEEK_ANCHOR.getFullYear(),
        EVENTS_WEEK_ANCHOR.getMonth(),
        EVENTS_WEEK_ANCHOR.getDate() + weekOffset * 7
    );
}

export function getWeekOffsetForEventDateTime(dateTime: string): number | null {
    const dateKey = extractEventDateKey(dateTime);
    if (!dateKey) {
        return null;
    }

    const eventDate = parseEventDateTimeLocal(dateTime) ?? dateKeyToLocalDate(dateKey);
    if (!eventDate) {
        return null;
    }

    return getWeekOffsetForDate(EVENTS_WEEK_ANCHOR, eventDate);
}

export function getUserEventsForWeekDay(weekStart: Date, dayIndex: number): CalendarEventItem[] {
    const dayKey = getCalendarDayDateKey(weekStart, dayIndex);

    return eventsUserCreated.filter((event) => extractEventDateKey(event.dateTime) === dayKey);
}

export function addUserCalendarEventFromDraft(draft: EventCreateDraft): boolean {
    const dateKey = extractEventDateKey(draft.dateTime);
    if (!dateKey) {
        return false;
    }

    eventsUserCreated.push(createCalendarEventFromDraft(draft));
    persistUserEvents();
    return true;
}

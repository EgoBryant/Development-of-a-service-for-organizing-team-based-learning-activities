import type { CalendarEventItem, EventCreateDraft } from "../types/event";
import { createCalendarEventFromDraft } from "../types/event";
import { EVENTS_CALENDAR_YEAR } from "../data/demoEvents";
import {
    dateKeyToLocalDate,
    dateToDateKey,
    extractEventDateKey,
    isSameCalendarDay,
    parseEventDateTimeLocal
} from "../utils/calendarEvents";

export const EVENTS_CALENDAR_VISIBLE_DAYS = 4;

const USER_EVENTS_STORAGE_KEY = "team-exam-user-calendar-events";

export const eventsUserCreated: CalendarEventItem[] = [];

let cachedYearDates: Date[] | null = null;

function buildYearDates(year: number): Date[] {
    const dates: Date[] = [];

    for (let month = 0; month < 12; month += 1) {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let day = 1; day <= daysInMonth; day += 1) {
            dates.push(new Date(year, month, day));
        }
    }

    return dates;
}

export function getEventsCalendarYearDates(): readonly Date[] {
    if (!cachedYearDates) {
        cachedYearDates = buildYearDates(EVENTS_CALENDAR_YEAR);
    }

    return cachedYearDates;
}

export function getCalendarDayIndexForDate(date: Date): number {
    return getEventsCalendarYearDates().findIndex((day) => isSameCalendarDay(day, date));
}

export function getTodayCalendarStartIndex(): number {
    const todayIndex = getCalendarDayIndexForDate(new Date());
    return todayIndex >= 0 ? todayIndex : 0;
}

/** Индекс начала демо-недели (1–4 июня) для макета вкладки «События». */
export function getDemoEventsCalendarStartIndex(): number {
    const demoStart = new Date(EVENTS_CALENDAR_YEAR, 5, 1);
    const dayIndex = getCalendarDayIndexForDate(demoStart);
    return clampCalendarStartIndex(dayIndex >= 0 ? dayIndex : 0);
}

export function clampCalendarStartIndex(index: number): number {
    const maxStart = Math.max(0, getEventsCalendarYearDates().length - EVENTS_CALENDAR_VISIBLE_DAYS);
    return Math.min(Math.max(0, index), maxStart);
}

export function getCalendarStartIndexForDateTime(dateTime: string): number | null {
    const dateKey = extractEventDateKey(dateTime);
    if (!dateKey) {
        return null;
    }

    const eventDate = parseEventDateTimeLocal(dateTime) ?? dateKeyToLocalDate(dateKey);
    const dayIndex = getCalendarDayIndexForDate(eventDate);
    if (dayIndex < 0) {
        return null;
    }

    return clampCalendarStartIndex(dayIndex);
}

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

export function getUserEventsForDateKey(dateKey: string): CalendarEventItem[] {
    return eventsUserCreated.filter((event) => extractEventDateKey(event.dateTime) === dateKey);
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

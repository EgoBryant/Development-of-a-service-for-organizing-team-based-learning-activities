import type { CalendarEventItem } from "../types/event";

export const EVENTS_CALENDAR_YEAR = 2026;

export const EVENTS_MONTH_LABELS = [
    "ЯНВАРЬ",
    "ФЕВРАЛЬ",
    "МАРТ",
    "АПРЕЛЬ",
    "МАЙ",
    "ИЮНЬ",
    "ИЮЛЬ",
    "АВГУСТ",
    "СЕНТЯБРЬ",
    "ОКТЯБРЬ",
    "НОЯБРЬ",
    "ДЕКАБРЬ"
] as const;

/** Демо-события июня 2026 (см. макет вкладки «События»). */
export const DEMO_CALENDAR_EVENTS_BY_DATE: Readonly<Record<string, readonly CalendarEventItem[]>> = {
    "2026-06-01": [
        {
            id: "ev-mon-checkin",
            topic: "CHECK-IN",
            tag: "Check-in",
            format: "Очный",
            description: "Еженедельный check-in команды.",
            dateTime: "2026-06-01T20:00",
            endDateTime: "2026-06-01T21:00",
            isMine: true
        }
    ],
    "2026-06-02": [
        {
            id: "ev-tue-workshop",
            topic: "Воркшоп «АГИТДУ»",
            tag: "Обучение",
            format: "Очный",
            description: "Практический воркшоп для команд.",
            dateTime: "2026-06-02T12:00",
            endDateTime: "2026-06-02T15:30",
            isMine: false
        }
    ]
};

export function getDemoEventsForDateKey(dateKey: string): CalendarEventItem[] {
    return [...(DEMO_CALENDAR_EVENTS_BY_DATE[dateKey] ?? [])];
}

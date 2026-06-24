import type { CalendarEventItem } from "../types/event";

export const EVENTS_WEEKDAY_LABELS = ["ПН", "ВТ", "СР", "ЧТ"] as const;

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

/** Демо-неделя 1–4 июня 2026 (см. макет вкладки «События»). */
export const DEMO_WEEK_CALENDAR_EVENTS: readonly CalendarEventItem[][] = [
    [
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
    [
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
    ],
    [],
    []
];

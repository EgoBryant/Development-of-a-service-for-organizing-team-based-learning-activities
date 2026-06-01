import type { CalendarEventItem } from "../types/event";

export const EVENTS_WEEKDAY_LABELS = ["ПН", "ВТ", "СР", "ЧТ", "ПТ"] as const;

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

/** Пн 20.04.2026 - якорь недели из макета; сдвиг через eventsWeekOffset. */
export const DEMO_WEEK_CALENDAR_EVENTS: readonly CalendarEventItem[][] = [
    [
        {
            id: "ev-mon-1",
            topic: "Семинар по КРК",
            tag: "Обучение",
            format: "Очный",
            description: "Разбор формулы командного рейтинга.",
            dateTime: "2026-04-20T10:00",
            isMine: true
        }
    ],
    [
        {
            id: "ev-tue-1",
            topic: "Кино на крыше",
            tag: "Культура",
            format: "Очный",
            description: "Встреча команд на открытом показе.",
            dateTime: "2026-04-21T19:00",
            isMine: false
        }
    ],
    [
        {
            id: "ev-wed-1",
            topic: "Мини-турнир",
            tag: "Спорт",
            format: "Очный",
            description: "Командные соревнования в зале.",
            dateTime: "2026-04-22T16:30",
            isMine: true
        },
        {
            id: "ev-wed-2",
            topic: "Онлайн Q&A",
            tag: "Встреча",
            format: "Дистанционный",
            description: "Ответы куратора в Teams.",
            dateTime: "2026-04-22T20:00",
            isMine: true
        }
    ],
    [
        {
            id: "ev-thu-1",
            topic: "Лекция по ML",
            tag: "Наука",
            format: "Дистанционный",
            description: "Гостевая лекция из другого института.",
            dateTime: "2026-04-23T12:00",
            isMine: false
        },
        {
            id: "ev-thu-2",
            topic: "Созвон капитанов",
            tag: "Встреча",
            format: "Дистанционный",
            description: "Согласование челленджа недели.",
            dateTime: "2026-04-23T18:00",
            isMine: true
        }
    ],
    []
];

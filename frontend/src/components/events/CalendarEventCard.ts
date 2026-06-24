import type { CalendarEventItem } from "../../types/event";
import { escapeHtml } from "../../utils/html";
import { formatEventTimeRange } from "../../utils/calendarEvents";

export function renderCalendarEventCard(event: CalendarEventItem): string {
    const timeLabel = formatEventTimeRange(event.dateTime, event.endDateTime);
    const ariaLabel = [event.topic, timeLabel].filter(Boolean).join(", ");

    return `
        <div class="events-calendar-event-pill" aria-label="${escapeHtml(ariaLabel)}">
            <span class="events-calendar-event-pill-title">${escapeHtml(event.topic || "Событие")}</span>
            ${timeLabel ? `<span class="events-calendar-event-pill-time">${escapeHtml(timeLabel)}</span>` : ""}
        </div>`;
}

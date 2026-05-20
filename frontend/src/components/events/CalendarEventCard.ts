import type { CalendarEventItem } from "../../types/event";
import { escapeHtml } from "../../utils/html";
import { formatEventCardTime, getEventTagModifier } from "../../utils/calendarEvents";

export function renderCalendarEventCard(event: CalendarEventItem): string {
    const timeLabel = formatEventCardTime(event.dateTime);
    const tagModifier = getEventTagModifier(event.tag);
    const ariaLabel = [event.topic, event.tag, timeLabel, event.format].filter(Boolean).join(", ");

    return `
        <article
            class="events-calendar-card events-calendar-card--${escapeHtml(tagModifier)}"
            role="listitem"
            aria-label="${escapeHtml(ariaLabel)}"
        >
            <div class="events-calendar-card-head">
                ${timeLabel ? `<span class="events-calendar-card-time">${escapeHtml(timeLabel)}</span>` : ""}
                <span class="events-calendar-card-tag">${escapeHtml(event.tag || "Событие")}</span>
            </div>
            <h3 class="events-calendar-card-topic">${escapeHtml(event.topic || "Без темы")}</h3>
            <p class="events-calendar-card-format">${escapeHtml(event.format)}</p>
        </article>`;
}

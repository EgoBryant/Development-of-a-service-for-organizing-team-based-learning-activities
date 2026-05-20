import { getActivityFeedItems } from "../../state/activityFeedState";
import type { ActivityFeedItem } from "../../types/activity";
import { escapeHtml } from "../../utils/html";

function formatActivityTime(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleString("ru-RU", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function renderActivityCard(item: ActivityFeedItem): string {
    const badgeHtml = item.badge
        ? `<span class="events-activity-card-badge">${escapeHtml(item.badge)}</span>`
        : "";

    return `
        <article
            class="events-activity-card events-activity-card--${item.colorVariant}"
            role="listitem"
            data-activity-kind="${escapeHtml(item.kind)}"
        >
            <div class="events-activity-card-copy">
                <h4 class="events-activity-card-title">${escapeHtml(item.title)}</h4>
                <p class="events-activity-card-text">${escapeHtml(item.description)}</p>
                <time class="events-activity-card-time" datetime="${escapeHtml(item.createdAt)}">${escapeHtml(formatActivityTime(item.createdAt))}</time>
            </div>
            ${badgeHtml}
        </article>`;
}

export function renderActivityFeedPanel(isVisible: boolean): string {
    const items = getActivityFeedItems();
    const rowsHtml = items.length
        ? items.map(renderActivityCard).join("")
        : `<p class="events-activity-empty">Пока нет событий — действия появятся здесь автоматически.</p>`;

    return `
        <div
            class="events-feed-panel events-feed-panel--activity"
            id="eventsFeedPanelActivity"
            role="tabpanel"
            aria-labelledby="eventsFeedTabActivity"
            ${isVisible ? "" : "hidden"}
        >
            <div class="events-activity-list" role="list">
                ${rowsHtml}
            </div>
        </div>`;
}

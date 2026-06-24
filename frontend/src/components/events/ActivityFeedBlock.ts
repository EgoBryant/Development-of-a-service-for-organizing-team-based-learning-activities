import { getNewsFeedItems } from "../../state/newsFeedState";
import type { NewsPost } from "../../types/news";
import { escapeHtml } from "../../utils/html";

function renderActivityRow(item: NewsPost): string {
    const text = item.body.trim() || item.title.trim();
    const badgeHtml = item.pointsLabel
        ? `<span class="events-feed-list-badge">${escapeHtml(item.pointsLabel)}</span>`
        : "";

    return `
        <li class="events-feed-list-item" role="listitem">
            <p class="events-feed-list-text">${escapeHtml(text)}</p>
            ${badgeHtml}
        </li>`;
}

export function renderActivityFeedPanel(isVisible: boolean): string {
    const items = getNewsFeedItems();
    const rowsHtml = items.length
        ? items.map(renderActivityRow).join("")
        : `<li class="events-feed-list-item events-feed-list-item--empty" role="listitem">
                <p class="events-feed-list-text">Пока нет записей.</p>
           </li>`;

    return `
        <div
            class="events-feed-panel events-feed-panel--activity"
            id="eventsFeedPanelActivity"
            role="tabpanel"
            aria-labelledby="eventsFeedTabActivity"
            ${isVisible ? "" : "hidden"}
        >
            <ul class="events-feed-list events-feed-list--cards" role="list">
                ${rowsHtml}
            </ul>
        </div>`;
}

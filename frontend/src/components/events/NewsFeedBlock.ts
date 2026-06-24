import { getNewsFeedItems } from "../../state/newsFeedState";
import type { NewsPost } from "../../types/news";
import { escapeHtml } from "../../utils/html";

function renderNewsRow(item: NewsPost): string {
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

export function renderNewsFeedPanel(isVisible: boolean): string {
    const items = getNewsFeedItems();
    const rowsHtml = items.length
        ? items.map(renderNewsRow).join("")
        : `<li class="events-feed-list-item events-feed-list-item--empty" role="listitem">
                <p class="events-feed-list-text">Пока нет новостей.</p>
           </li>`;

    return `
        <div
            class="events-feed-panel events-feed-panel--news"
            id="eventsFeedPanelNews"
            role="tabpanel"
            aria-labelledby="eventsFeedTabNews"
            ${isVisible ? "" : "hidden"}
        >
            <ul class="events-feed-list" role="list">
                ${rowsHtml}
            </ul>
            <div class="events-news-toolbar">
                <button type="button" class="events-news-add-btn" id="eventsOpenCreateNewsButton">+ ДОБАВИТЬ</button>
            </div>
        </div>`;
}

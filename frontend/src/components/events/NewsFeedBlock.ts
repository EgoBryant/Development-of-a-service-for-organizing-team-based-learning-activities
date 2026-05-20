import { getNewsFeedItems } from "../../state/newsFeedState";
import type { NewsPost } from "../../types/news";
import { escapeHtml } from "../../utils/html";

function formatNewsTime(iso: string): string {
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

function renderNewsCard(item: NewsPost): string {
    return `
        <article class="events-news-card events-news-card--${item.colorVariant}" role="listitem">
            <div class="events-news-copy">
                <h3 class="events-news-title">${escapeHtml(item.title)}</h3>
                <p class="events-news-body">${escapeHtml(item.body)}</p>
                <p class="events-news-meta">${escapeHtml(item.authorName)} · ${escapeHtml(formatNewsTime(item.createdAt))}</p>
            </div>
        </article>`;
}

export function renderNewsFeedPanel(isVisible: boolean): string {
    const items = getNewsFeedItems();
    const cardsHtml = items.length
        ? items.map(renderNewsCard).join("")
        : `<p class="events-news-empty">Пока нет новостей. Нажмите «Добавить», чтобы опубликовать рассылку.</p>`;

    return `
        <div
            class="events-feed-panel events-feed-panel--news"
            id="eventsFeedPanelNews"
            role="tabpanel"
            aria-labelledby="eventsFeedTabNews"
            ${isVisible ? "" : "hidden"}
        >
            <div class="events-news-toolbar">
                <button type="button" class="events-news-add-btn" id="eventsOpenCreateNewsButton">+ ДОБАВИТЬ</button>
            </div>
            <div class="events-news-list" role="list">
                ${cardsHtml}
            </div>
        </div>`;
}

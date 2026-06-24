import postImageUrl from "../../assets/icons/Post.png";
import { escapeHtml } from "../../utils/html";

function renderActivityFeatured(): string {
    return `
        <article class="events-feed-feature-card" aria-label="Что такое КРК">
            <div class="events-feed-feature">
                <div class="events-feed-feature-media">
                    <img src="${escapeHtml(postImageUrl)}" alt="" loading="lazy">
                </div>
                <div class="events-feed-feature-copy">
                    <h3 class="events-feed-feature-title gradient-text">ЧТО ТАКОЕ КРК?</h3>
                    <p class="events-feed-feature-text">
                        Привет! Ты уже в игре, а значит, пришло время узнать, как устроен наш главный
                        показатель — КРК, или Командный Рейтинговый Коэффициент.
                    </p>
                </div>
            </div>
        </article>`;
}

export function renderActivityFeedPanel(isVisible: boolean): string {
    return `
        <div
            class="events-feed-panel events-feed-panel--activity"
            id="eventsFeedPanelActivity"
            role="tabpanel"
            aria-labelledby="eventsFeedTabActivity"
            ${isVisible ? "" : "hidden"}
        >
            ${renderActivityFeatured()}
        </div>`;
}

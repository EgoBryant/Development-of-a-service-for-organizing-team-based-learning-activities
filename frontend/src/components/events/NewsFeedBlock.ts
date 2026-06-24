import postImageUrl from "../../assets/icons/Post.png";
import { escapeHtml } from "../../utils/html";

function renderNewsFeatured(): string {
    return `
        <article class="events-feed-feature-card" aria-label="Что такое КРК">
            <div class="events-feed-feature">
                <div class="events-feed-feature-head">
                    <div class="events-feed-feature-media">
                        <img src="${escapeHtml(postImageUrl)}" alt="" width="1456" height="720" loading="lazy">
                    </div>
                    <div class="events-feed-feature-lead">
                        <h3 class="events-feed-feature-title">ЧТО ТАКОЕ КРК?</h3>
                        <p class="events-feed-feature-intro">
                            Привет! Ты уже в игре, а значит, пришло время узнать, как устроен наш главный
                            показатель — КРК, или Командный Рейтинговый Коэффициент.
                        </p>
                    </div>
                </div>
                <div class="events-feed-feature-body">
                    <p class="events-feed-feature-text">
                        Система вычисляет его автоматически по прозрачной формуле. Большая часть, целых 60%, приходится
                        на ваш базовый рейтинг. Еще 30% составляет коэффициент сплочённости, который оценивает вашу
                        активность и взаимодействие внутри коллектива. Остальные 10% — это бонусный коэффициент,
                        который вы лично зарабатываете за выполнение челленджей, получение ачивок и спасение других
                        команд. Именно КРК определяет ваше место в таблице рейтинга всех студентов и автоматически
                        присваивает вам лигу от «Новичка» до «Легенды».
                    </p>
                    <p class="events-feed-feature-text events-feed-feature-text--footer">
                        Прокачивайте свой КРК, поднимайтесь в топ-10 игроков и ведите команду к победе!
                    </p>
                </div>
            </div>
        </article>`;
}

export function renderNewsFeedPanel(isVisible: boolean): string {
    return `
        <div
            class="events-feed-panel events-feed-panel--news"
            id="eventsFeedPanelNews"
            role="tabpanel"
            aria-labelledby="eventsFeedTabNews"
            ${isVisible ? "" : "hidden"}
        >
            ${renderNewsFeatured()}
        </div>`;
}

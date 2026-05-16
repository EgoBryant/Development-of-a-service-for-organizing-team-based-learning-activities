import { DEMO_RATING_USERS } from "../../data/demoRating";
import { ratingFlowState } from "../../state/ratingFlowState";
import type { RatingLeaderboardEntry } from "../../types/rating";
import { escapeHtml } from "../../utils/html";
import {
    filterEntries,
    renderListRowHtml,
    renderPodiumHtml,
    renderSortMenuHtml,
    sortEntries
} from "./ratingBlockUtils";

function toLeaderboardEntries(): RatingLeaderboardEntry[] {
    return DEMO_RATING_USERS.map((user) => ({
        rank: user.rank,
        label: user.name,
        points: user.points
    }));
}

export function renderUsersRatingBlock(): string {
    const search = ratingFlowState.usersSearch;
    const filtered = filterEntries(toLeaderboardEntries(), search);
    const sorted = sortEntries(filtered, ratingFlowState.usersSort);
    const rest = sorted.filter((entry) => entry.rank >= 4);
    const listHtml = rest.length
        ? rest.map((entry) => {
              const user = DEMO_RATING_USERS.find((u) => u.rank === entry.rank);
              return renderListRowHtml(entry, "data-rating-user-id", user?.id ?? String(entry.rank));
          }).join("")
        : `<p class="rating-list-empty">Ничего не найдено</p>`;

    return `
        <section class="rating-panel rating-panel--users" aria-label="Рейтинг пользователей">
            <h3 class="rating-panel-heading">ПОЛЬЗОВАТЕЛИ</h3>
            <div class="rating-toolbar">
                <input
                    type="search"
                    class="rating-search-input"
                    id="ratingUsersSearchInput"
                    placeholder="ПОИСК"
                    value="${escapeHtml(search)}"
                    autocomplete="off"
                >
                <div class="rating-filter-wrap">
                    <button type="button" class="rating-filter-btn" data-rating-filter-toggle="users" aria-expanded="${ratingFlowState.usersFilterOpen}">ФИЛЬТР</button>
                    ${renderSortMenuHtml("users", ratingFlowState.usersSort, ratingFlowState.usersFilterOpen)}
                </div>
            </div>
            <div class="rating-panel-body">
                <div class="rating-podium" role="list" aria-label="Тройка лидеров пользователей">
                    ${renderPodiumHtml(sorted)}
                </div>
                <div class="rating-list-scroll" role="list" aria-label="Пользователи с 4 места">
                    ${listHtml}
                </div>
            </div>
        </section>`;
}

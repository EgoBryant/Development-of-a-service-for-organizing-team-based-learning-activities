import { getRatingTeams } from "../../state/ratingDataState";
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
    return getRatingTeams().map((team) => ({
        rank: team.rank,
        label: team.name,
        points: team.krk,
        pointsLabel: `КРК ${team.krk.toFixed(1)}`,
        searchText: `${team.name} ${team.league ?? ""} ${team.captainName ?? ""}`
    }));
}

export function renderTeamsRatingBlock(): string {
    const search = ratingFlowState.teamsSearch;
    const filtered = filterEntries(toLeaderboardEntries(), search);
    const sorted = sortEntries(filtered, ratingFlowState.teamsSort);
    const top10 = sorted.slice(0, 10);
    const rest = top10.filter((entry) => entry.rank >= 4);
    const listHtml = rest.length
        ? rest.map((entry) => {
              const team = getRatingTeams().find((t) => t.rank === entry.rank);
              return renderListRowHtml(entry, "data-rating-team-id", team?.id ?? String(entry.rank));
          }).join("")
        : `<p class="rating-list-empty">Ничего не найдено</p>`;

    return `
        <section class="rating-panel" aria-label="Рейтинг команд">
            <h3 class="rating-panel-heading">КОМАНДЫ</h3>
            <div class="rating-toolbar">
                <input
                    type="search"
                    class="rating-search-input"
                    id="ratingTeamsSearchInput"
                    placeholder="ПОИСК ПО КОМАНДЕ / ЛИГЕ"
                    value="${escapeHtml(search)}"
                    autocomplete="off"
                >
                <div class="rating-filter-wrap">
                    <button type="button" class="rating-filter-btn" data-rating-filter-toggle="teams" aria-expanded="${ratingFlowState.teamsFilterOpen}">ФИЛЬТР</button>
                    ${renderSortMenuHtml("teams", ratingFlowState.teamsSort, ratingFlowState.teamsFilterOpen)}
                </div>
            </div>
            <div class="rating-panel-body">
                <div class="rating-podium" role="list" aria-label="Тройка лидеров команд">
                    ${renderPodiumHtml(top10)}
                </div>
                <div class="rating-list-scroll" role="list" aria-label="Команды с 4 места">
                    ${listHtml}
                </div>
            </div>
        </section>`;
}

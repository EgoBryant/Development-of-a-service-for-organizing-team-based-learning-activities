import { getRatingTeams, getRatingUsers } from "../../state/ratingDataState";
import { ratingFlowState } from "../../state/ratingFlowState";
import type { RatingLeaderboardEntry, RatingLeaderboardTab } from "../../types/rating";
import { escapeHtml } from "../../utils/html";
import {
    filterEntries,
    renderFeaturedRowHtml,
    renderListRowsHtml,
    renderSortMenuHtml,
    sortEntries
} from "./ratingBlockUtils";

const USERS_LIST_LIMIT = 4;
const TEAMS_LIST_LIMIT = 4;

function toUserEntries(): RatingLeaderboardEntry[] {
    return getRatingUsers().map((user) => ({
        id: user.id,
        rank: user.rank,
        label: user.name,
        points: user.points,
        pointsLabel: `${user.points} баллов`,
        searchText: `${user.name} ${user.teamName ?? ""} ${user.groupTitle ?? ""} ${user.league}`,
        avatarUrl: user.avatarUrl
    }));
}

function toTeamEntries(): RatingLeaderboardEntry[] {
    return getRatingTeams().map((team) => ({
        id: team.id,
        rank: team.rank,
        label: team.name,
        points: team.points,
        pointsLabel: `${team.points} баллов`,
        searchText: `${team.name} ${team.league ?? ""} ${team.captainName ?? ""}`
    }));
}

function resolveTabData(tab: RatingLeaderboardTab): {
    block: "users" | "teams";
    search: string;
    sortKey: typeof ratingFlowState.usersSort;
    filterOpen: boolean;
    dataAttr: "data-rating-user-id" | "data-rating-team-id";
    listLimit: number;
    entries: RatingLeaderboardEntry[];
} {
    if (tab === "users") {
        return {
            block: "users",
            search: ratingFlowState.usersSearch,
            sortKey: ratingFlowState.usersSort,
            filterOpen: ratingFlowState.usersFilterOpen,
            dataAttr: "data-rating-user-id",
            listLimit: USERS_LIST_LIMIT,
            entries: toUserEntries()
        };
    }

    return {
        block: "teams",
        search: ratingFlowState.teamsSearch,
        sortKey: ratingFlowState.teamsSort,
        filterOpen: ratingFlowState.teamsFilterOpen,
        dataAttr: "data-rating-team-id",
        listLimit: TEAMS_LIST_LIMIT,
        entries: toTeamEntries()
    };
}

export function renderRatingLeaderboardBlock(): string {
    const tab = ratingFlowState.leaderboardTab;
    const { block, search, sortKey, filterOpen, dataAttr, listLimit, entries } = resolveTabData(tab);
    const filtered = filterEntries(entries, search);
    const sorted = sortEntries(filtered, sortKey);
    const featured = sorted.slice(0, 3);
    const rest = sorted.slice(3, 3 + listLimit);
    const teamsTabActive = tab === "teams";
    const usersTabActive = tab === "users";
    const actionLabel = "ФИЛЬТР";

    return `
        <section class="rating-leaderboard rating-leaderboard--${block}" aria-label="Рейтинг">
            <div class="rating-leaderboard-tabs" role="tablist" aria-label="Раздел рейтинга">
                <button
                    type="button"
                    class="rating-leaderboard-tab${usersTabActive ? " is-active" : ""}"
                    role="tab"
                    aria-selected="${usersTabActive}"
                    data-rating-leaderboard-tab="users"
                >СТУДЕНТЫ</button>
                <button
                    type="button"
                    class="rating-leaderboard-tab${teamsTabActive ? " is-active" : ""}"
                    role="tab"
                    aria-selected="${teamsTabActive}"
                    data-rating-leaderboard-tab="teams"
                >КОМАНДЫ</button>
            </div>

            <div class="rating-leaderboard-content">
                <div class="rating-toolbar">
                    <input
                        type="search"
                        class="rating-search-input"
                        id="ratingLeaderboardSearchInput"
                        placeholder="ПОИСК"
                        value="${escapeHtml(search)}"
                        autocomplete="off"
                    >
                    <div class="rating-filter-wrap">
                        <button
                            type="button"
                            class="rating-filter-btn"
                            data-rating-filter-toggle="${block}"
                            aria-expanded="${filterOpen}"
                        >${actionLabel}</button>
                        ${renderSortMenuHtml(block, sortKey, filterOpen)}
                    </div>
                </div>

                <div class="rating-leaderboard-body">
                    <div class="rating-featured-row rating-featured-row--${block}" role="list" aria-label="Тройка лидеров">
                        ${renderFeaturedRowHtml(featured, dataAttr, block)}
                    </div>
                    <div class="rating-list-scroll rating-list-scroll--${block}" role="list" aria-label="Остальные позиции">
                        ${rest.length ? renderListRowsHtml(rest, dataAttr, block) : (featured.length ? "" : `<p class="rating-list-empty">Ничего не найдено</p>`)}
                    </div>
                </div>
            </div>
        </section>`;
}

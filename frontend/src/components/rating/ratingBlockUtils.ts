import type { RatingLeaderboardEntry, RatingSortKey } from "../../types/rating";
import { escapeHtml } from "../../utils/html";

export function filterEntries(entries: RatingLeaderboardEntry[], search: string): RatingLeaderboardEntry[] {
    const query = search.trim().toLowerCase();
    if (!query) {
        return entries;
    }

    return entries.filter((entry) => {
        return (
            String(entry.rank).includes(query) ||
            entry.label.toLowerCase().includes(query) ||
            String(entry.points).includes(query)
        );
    });
}

export function sortEntries(entries: RatingLeaderboardEntry[], sortKey: RatingSortKey): RatingLeaderboardEntry[] {
    const copy = [...entries];
    switch (sortKey) {
        case "rank-desc":
            return copy.sort((a, b) => b.rank - a.rank);
        case "points-desc":
            return copy.sort((a, b) => b.points - a.points);
        case "points-asc":
            return copy.sort((a, b) => a.points - b.points);
        case "name-asc":
            return copy.sort((a, b) => a.label.localeCompare(b.label, "ru"));
        case "rank-asc":
        default:
            return copy.sort((a, b) => a.rank - b.rank);
    }
}

export function renderPodiumSlot(place: 1 | 2 | 3): string {
    const placeClass =
        place === 1 ? "rating-podium-slot--first" : place === 2 ? "rating-podium-slot--second" : "rating-podium-slot--third";
    return `
        <article class="rating-podium-slot ${placeClass}" aria-label="${place} место">
            <span class="rating-podium-rank">${place}</span>
            <span class="rating-podium-points">БАЛЛЫ</span>
        </article>`;
}

export function renderPodiumHtml(entries: RatingLeaderboardEntry[]): string {
    const topByRank = new Map(entries.map((entry) => [entry.rank, entry]));
    return [2, 1, 3]
        .map((place) => {
            const entry = topByRank.get(place);
            if (!entry) {
                const emptyClass =
                    place === 1 ? "first" : place === 2 ? "second" : "third";
                return `
                    <article class="rating-podium-slot rating-podium-slot--empty rating-podium-slot--${emptyClass}" aria-hidden="true">
                        <span class="rating-podium-rank">${place}</span>
                        <span class="rating-podium-points">БАЛЛЫ</span>
                    </article>`;
            }
            return renderPodiumSlot(place as 1 | 2 | 3);
        })
        .join("");
}

export const RATING_SORT_OPTIONS: { key: RatingSortKey; label: string }[] = [
    { key: "rank-asc", label: "МЕСТО ↑" },
    { key: "rank-desc", label: "МЕСТО ↓" },
    { key: "points-desc", label: "БАЛЛЫ ↓" },
    { key: "points-asc", label: "БАЛЛЫ ↑" },
    { key: "name-asc", label: "ИМЯ А–Я" }
];

export function renderSortMenuHtml(block: "users" | "teams", sortKey: RatingSortKey, isOpen: boolean): string {
    const options = RATING_SORT_OPTIONS.map(
        (option) => `
        <button
            type="button"
            class="rating-filter-option${option.key === sortKey ? " is-active" : ""}"
            data-rating-sort="${block}"
            data-rating-sort-key="${option.key}"
        >${option.label}</button>`
    ).join("");

    return `
        <div class="rating-filter-menu${isOpen ? " is-open" : ""}" data-rating-filter-menu="${block}" ${isOpen ? "" : "hidden"}>
            ${options}
        </div>`;
}

export function renderListRowHtml(
    entry: RatingLeaderboardEntry,
    dataAttr: string,
    dataValue: string
): string {
    return `
        <button type="button" class="rating-list-row rating-list-row--clickable" role="listitem" ${dataAttr}="${escapeHtml(dataValue)}">
            <span class="rating-list-main">${escapeHtml(String(entry.rank))}</span>
            <span class="rating-list-label">${escapeHtml(entry.label)}</span>
            <span class="rating-list-points">БАЛЛЫ</span>
        </button>`;
}

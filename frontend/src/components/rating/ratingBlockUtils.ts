import rating1IconUrl from "../../assets/icons/Rating_1.svg";
import rating2IconUrl from "../../assets/icons/Rating_2.svg";
import rating3IconUrl from "../../assets/icons/Rating_3.svg";
import ligaMobileIconUrl from "../../assets/icons/Liga_mobile.svg";
import scoreMobileIconUrl from "../../assets/icons/Score_mobile.svg";
import type { RatingLeaderboardEntry, RatingSortKey } from "../../types/rating";
import { resolveUserAvatarUrl } from "../../utils/ratingAvatars";
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
            (entry.searchText ?? "").toLowerCase().includes(query) ||
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

export const RATING_SORT_OPTIONS: { key: RatingSortKey; label: string }[] = [
    { key: "points-desc", label: "БАЛЛЫ ↓" },
    { key: "points-asc", label: "БАЛЛЫ ↑" },
    { key: "rank-asc", label: "МЕСТО ↑" },
    { key: "rank-desc", label: "МЕСТО ↓" },
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

export function renderUserFeaturedCardHtml(entry: RatingLeaderboardEntry, dataAttr: string, place: number): string {
    const pointsText = String(entry.points);
    const avatarSrc = resolveUserAvatarUrl(entry.id, entry.avatarUrl);
    const photoInner = avatarSrc
        ? `<img class="rating-featured-card-image" src="${escapeHtml(avatarSrc)}" alt="" loading="lazy">`
        : `<span class="rating-featured-card-placeholder">Фото</span>`;

    return `
        <button
            type="button"
            class="rating-featured-card rating-featured-card--user"
            ${dataAttr}="${escapeHtml(entry.id)}"
            aria-label="${place} место — ${escapeHtml(entry.label)}"
        >
            <div class="rating-featured-card-photo" aria-hidden="true">
                ${photoInner}
                <span class="rating-featured-card-rank">${place}</span>
            </div>
            <span class="rating-featured-card-name">${escapeHtml(entry.label)}</span>
            <span class="rating-featured-card-points">
                <img class="rating-points-icon rating-points-icon--left" src="${escapeHtml(ligaMobileIconUrl)}" alt="" aria-hidden="true">
                <span class="rating-points-value">${escapeHtml(pointsText)}</span>
                <img class="rating-points-icon rating-points-icon--right" src="${escapeHtml(scoreMobileIconUrl)}" alt="" aria-hidden="true">
            </span>
        </button>`;
}

function renderTeamPodiumSlot(
    entry: RatingLeaderboardEntry | undefined,
    place: 1 | 2 | 3,
    dataAttr: "data-rating-team-id"
): string {
    const placeClass =
        place === 1 ? "rating-team-podium-slot--first" : place === 2 ? "rating-team-podium-slot--second" : "rating-team-podium-slot--third";
    const iconUrl = place === 1 ? rating1IconUrl : place === 2 ? rating2IconUrl : rating3IconUrl;

    if (!entry) {
        return `<div class="rating-team-podium-slot ${placeClass} rating-team-podium-slot--empty" aria-hidden="true"></div>`;
    }

    const pointsText = String(entry.points);

    return `
        <button
            type="button"
            class="rating-team-podium-slot ${placeClass}"
            ${dataAttr}="${escapeHtml(entry.id)}"
            aria-label="${place} место — ${escapeHtml(entry.label)}"
        >
            <div class="rating-team-podium-card">
                <img class="rating-team-podium-icon" src="${escapeHtml(iconUrl)}" alt="" aria-hidden="true">
                <span class="rating-team-podium-name">${escapeHtml(entry.label)}</span>
                <span class="rating-team-podium-points">${escapeHtml(pointsText)}</span>
            </div>
        </button>`;
}

export function renderTeamPodiumHtml(entries: RatingLeaderboardEntry[]): string {
    if (!entries.length) {
        return `<p class="rating-list-empty">Ничего не найдено</p>`;
    }

    return `
        <div class="rating-team-podium" role="list" aria-label="Тройка лидеров команд">
            ${renderTeamPodiumSlot(entries[1], 2, "data-rating-team-id")}
            ${renderTeamPodiumSlot(entries[0], 1, "data-rating-team-id")}
            ${renderTeamPodiumSlot(entries[2], 3, "data-rating-team-id")}
        </div>`;
}

export function renderListRowHtml(entry: RatingLeaderboardEntry, dataAttr: string, variant: "users" | "teams" = "users"): string {
    const pointsText = String(entry.points);
    const rowClass = variant === "teams" ? "rating-list-row rating-list-row--clickable rating-list-row--team" : "rating-list-row rating-list-row--clickable";

    return `
        <button type="button" class="${rowClass}" role="listitem" ${dataAttr}="${escapeHtml(entry.id)}">
            <span class="rating-list-main">${escapeHtml(String(entry.rank))}</span>
            <span class="rating-list-label">${escapeHtml(entry.label)}</span>
            ${variant === "users"
                ? `<span class="rating-list-points">
                    <span class="rating-points-value">${escapeHtml(pointsText)}</span>
                    <img class="rating-points-icon rating-points-icon--right" src="${escapeHtml(scoreMobileIconUrl)}" alt="" aria-hidden="true">
                </span>`
                : variant === "teams"
                    ? `<span class="rating-list-points">
                        <img class="rating-points-icon rating-points-icon--left" src="${escapeHtml(ligaMobileIconUrl)}" alt="" aria-hidden="true">
                        <span class="rating-points-value">${escapeHtml(pointsText)}</span>
                        <img class="rating-points-icon rating-points-icon--right" src="${escapeHtml(scoreMobileIconUrl)}" alt="" aria-hidden="true">
                    </span>`
                : `<span class="rating-list-points">${escapeHtml(pointsText)}</span>`}
        </button>`;
}

export function renderFeaturedRowHtml(
    entries: RatingLeaderboardEntry[],
    dataAttr: "data-rating-user-id" | "data-rating-team-id",
    variant: "users" | "teams"
): string {
    if (variant === "teams") {
        return renderTeamPodiumHtml(entries);
    }

    if (!entries.length) {
        return `<p class="rating-list-empty">Ничего не найдено</p>`;
    }

    return entries.map((entry, index) => renderUserFeaturedCardHtml(entry, dataAttr, index + 1)).join("");
}

export function renderListRowsHtml(
    entries: RatingLeaderboardEntry[],
    dataAttr: "data-rating-user-id" | "data-rating-team-id",
    variant: "users" | "teams" = "users"
): string {
    if (!entries.length) {
        return "";
    }

    return entries.map((entry) => renderListRowHtml(entry, dataAttr, variant)).join("");
}

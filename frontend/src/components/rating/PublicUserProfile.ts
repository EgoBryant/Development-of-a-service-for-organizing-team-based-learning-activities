import ligaMobileIconUrl from "../../assets/icons/Liga_mobile.svg";
import ratingMenuIconUrl from "../../assets/icons/Menu_Icons/Rating.svg";
import scoreMobileIconUrl from "../../assets/icons/Score_mobile.svg";
import { renderProfileAchievementStrip } from "../profile/ProfileAchievements";
import { getUserProfileAchievements } from "../../state/achievementsState";
import { getRatingUserById } from "../../state/ratingDataState";
import { escapeHtml } from "../../utils/html";
import { normalizePersonalLeague } from "../../utils/personalLeague";
import { resolveUserAvatarUrl } from "../../utils/ratingAvatars";

export function renderPublicAchievementsStrip(userId: string): string {
    return renderProfileAchievementStrip(getUserProfileAchievements(userId), { interactive: false });
}

function resolvePublicAchievements(userId: string) {
    return getUserProfileAchievements(userId);
}

export function renderPublicUserProfile(userId: string): string {
    const user = getRatingUserById(userId);
    if (!user) {
        return `<p class="rating-profile-missing">Пользователь не найден.</p>`;
    }

    const avatarSrc = resolveUserAvatarUrl(user.id, user.avatarUrl);
    const photoContent = avatarSrc
        ? `<img class="profile-photo-image" src="${escapeHtml(avatarSrc)}" alt="Фото профиля" loading="lazy">`
        : `<span class="profile-photo-placeholder">Фото</span>`;

    const leagueValue = normalizePersonalLeague(user.league);
    const ratingValue = user.rank > 0 ? `${user.rank} место` : "—";
    const group = user.groupTitle?.trim() || "—";
    const teamPillText = user.teamName?.trim() || (user.hasTeam ? "КОМАНДА" : "БЕЗ КОМАНДЫ");

    const teamPillHtml = user.hasTeam && user.teamId
        ? `<button type="button" class="profile-info-pill profile-info-pill-accent" data-rating-open-team="${escapeHtml(user.teamId)}">${escapeHtml(teamPillText)}</button>`
        : `<div class="profile-info-pill profile-info-pill-accent">${escapeHtml(teamPillText)}</div>`;

    const publicAchievements = resolvePublicAchievements(user.id);
    const achievementsContent =
        publicAchievements.length > 0
            ? `
                    <div class="profile-achievements-scroll-wrap">
                        <div class="profile-achievements-fade profile-achievements-fade-left" aria-hidden="true"></div>
                        <div class="profile-achievements-fade profile-achievements-fade-right" aria-hidden="true"></div>
                        <div class="profile-achievements-scroll" id="ratingPublicAchievementsScroll">
                            ${renderProfileAchievementStrip(publicAchievements, { interactive: false })}
                        </div>
                    </div>`
            : `
                    <div class="profile-achievements-empty" aria-live="polite">
                        <p class="profile-achievements-empty-text">Достижения участника появятся здесь после выполнения челленджей.</p>
                    </div>`;

    return `
        <div class="rating-public-profile">
            <div class="rating-public-topbar">
                <button type="button" class="rating-back-btn rating-back-btn--profile" data-rating-back>НАЗАД</button>
                <div class="rating-toolbar rating-toolbar--public">
                    <input
                        type="search"
                        class="rating-search-input"
                        placeholder="ПОИСК"
                        disabled
                    >
                    <div class="rating-filter-wrap">
                        <button type="button" class="rating-filter-btn" disabled>ФИЛЬТР</button>
                    </div>
                </div>
            </div>
            <div class="profile-hero-card">
                <div class="profile-top">
                    <div class="profile-photo-col">
                        <div class="profile-photo${avatarSrc ? " has-image" : ""}">${photoContent}</div>
                    </div>
                    <div class="profile-stats-col" aria-label="Сводка: лига, баллы, рейтинг">
                        <div class="profile-stat-track">
                            <span class="profile-stat-orb profile-stat-orb--muted profile-stat-orb--league" aria-hidden="true">
                                <img class="profile-stat-icon" src="${escapeHtml(ligaMobileIconUrl)}" alt="" aria-hidden="true">
                                <span class="profile-stat-label">ЛИГА</span>
                            </span>
                            <span class="profile-stat-value">${escapeHtml(leagueValue)}</span>
                        </div>
                        <div class="profile-stat-track">
                            <span class="profile-stat-orb profile-stat-orb--muted profile-stat-orb--score" aria-hidden="true">
                                <img class="profile-stat-icon" src="${escapeHtml(scoreMobileIconUrl)}" alt="" aria-hidden="true">
                                <span class="profile-stat-label">БАЛЛЫ</span>
                            </span>
                            <span class="profile-stat-value profile-stat-value--num">${escapeHtml(String(user.points))}</span>
                        </div>
                        <div class="profile-stat-track profile-stat-track--rating">
                            <span class="profile-stat-orb profile-stat-orb--accent profile-stat-orb--rating" aria-hidden="true">
                                <img class="profile-stat-icon" src="${escapeHtml(ratingMenuIconUrl)}" alt="" aria-hidden="true">
                                <span class="profile-stat-label">РЕЙТИНГ</span>
                            </span>
                            <span class="profile-stat-value">${escapeHtml(ratingValue)}</span>
                        </div>
                    </div>
                </div>
                <div class="profile-pills-row">
                    <div class="profile-info-pill profile-info-pill--name">${escapeHtml(user.name)}</div>
                    <div class="profile-info-pill profile-info-pill--group">${escapeHtml(group)}</div>
                    ${teamPillHtml}
                </div>
            </div>
            <div class="profile-achievements">
                <h3 class="profile-achievements-title">ДОСТИЖЕНИЯ</h3>
                ${achievementsContent}
            </div>
        </div>`;
}

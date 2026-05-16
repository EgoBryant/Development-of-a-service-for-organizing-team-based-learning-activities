import { getAppBridge } from "../../app/bridge";
import { getRatingUserById } from "../../data/demoRating";
import { openRatingTeamProfile } from "../../state/ratingFlowState";
import { ratingFlowState } from "../../state/ratingFlowState";
import { escapeHtml } from "../../utils/html";

export function renderUserProfileCard(userId: string): string {
    const user = getRatingUserById(userId);
    if (!user) {
        return `<p class="rating-profile-missing">Пользователь не найден.</p>`;
    }

    const bridge = getAppBridge();
    const isCaptain = bridge.isCurrentUserCaptain();
    const showInvite = !user.hasTeam && isCaptain;
    const showTeam = user.hasTeam && Boolean(user.teamId);
    const ratingTabActive = ratingFlowState.userProfileTab === "rating";
    const achievementsTabActive = ratingFlowState.userProfileTab === "achievements";

    const actionHtml = showTeam
        ? `<button type="button" class="rating-profile-action rating-profile-action--team" data-rating-open-team="${escapeHtml(user.teamId ?? "")}">КОМАНДА</button>`
        : showInvite
          ? `<button type="button" class="rating-profile-action rating-profile-action--invite" data-rating-invite-user="${escapeHtml(user.id)}">ПРИГЛАСИТЬ</button>`
          : "";

    return `
        <section class="rating-profile-card rating-profile-card--user" aria-label="Личные данные">
            <button type="button" class="rating-back-btn" data-rating-back>НАЗАД</button>
            <h2 class="rating-profile-title">ЛИЧНЫЕ ДАННЫЕ</h2>
            <p class="rating-profile-name">${escapeHtml(user.name)}</p>
            <div class="rating-profile-tabs" role="tablist">
                <button
                    type="button"
                    class="rating-profile-tab${ratingTabActive ? " is-active" : ""}"
                    data-rating-user-tab="rating"
                    role="tab"
                    aria-selected="${ratingTabActive}"
                >ЛИЧНЫЙ РЕЙТИНГ</button>
                <button
                    type="button"
                    class="rating-profile-tab${achievementsTabActive ? " is-active" : ""}"
                    data-rating-user-tab="achievements"
                    role="tab"
                    aria-selected="${achievementsTabActive}"
                >ЛИЧНЫЕ ДОСТИЖЕНИЯ</button>
            </div>
            <div class="rating-profile-tab-panel">
                ${
                    ratingTabActive
                        ? `
                <div class="rating-profile-stat-row">
                    <span class="rating-profile-stat-label">МЕСТО</span>
                    <span class="rating-profile-stat-value">${escapeHtml(String(user.rank))}</span>
                </div>
                <div class="rating-profile-stat-row">
                    <span class="rating-profile-stat-label">БАЛЛЫ</span>
                    <span class="rating-profile-stat-value">${escapeHtml(String(user.points))}</span>
                </div>
                <div class="rating-profile-stat-row">
                    <span class="rating-profile-stat-label">ЛИГА</span>
                    <span class="rating-profile-stat-value">${escapeHtml(user.league)}</span>
                </div>`
                        : `
                <div class="rating-achievements-grid">
                    ${Array.from({ length: user.achievementsCount }, (_, index) => `
                        <div class="rating-achievement-pill">ДОСТИЖЕНИЕ ${index + 1}</div>`).join("")}
                </div>`
                }
            </div>
            ${actionHtml}
        </section>`;
}

export function handleUserProfileTeamOpen(teamId: string): void {
    if (!teamId) {
        return;
    }
    openRatingTeamProfile(teamId);
    getAppBridge().render();
}

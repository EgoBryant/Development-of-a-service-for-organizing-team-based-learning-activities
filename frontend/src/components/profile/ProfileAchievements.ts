import { PROFILE_ACHIEVEMENTS } from "../../data/profileAchievements";
import type { ProfileAchievement } from "../../types/profile";
import { escapeHtml } from "../../utils/html";

export function renderProfileAchievementStrip(): string {
    return PROFILE_ACHIEVEMENTS
        .map(
            (achievement) => `
        <button
            type="button"
            class="profile-achievement-item profile-achievement-item--${achievement.status}"
            data-achievement-id="${escapeHtml(achievement.id)}"
            aria-label="${escapeHtml(`${achievement.title}. ${achievement.description}`)}"
        >
            <span class="profile-achievement-circle profile-achievement-circle--${achievement.tone}">
                <span class="profile-achievement-icon">${escapeHtml(achievement.iconLabel)}</span>
            </span>
            <span class="profile-achievement-caption">${escapeHtml(achievement.shortTitle)}</span>
            <span class="profile-achievement-progress">${escapeHtml(achievement.progressLabel)}</span>
        </button>`
        )
        .join("");
}

export function renderProfileAchievementModal(achievement: ProfileAchievement): string {
    const statusLabel = achievement.status === "earned" ? "ПОЛУЧЕНО" : "В ПРОЦЕССЕ";

    return `
        <div class="profile-modal" role="dialog" aria-modal="true" aria-label="Достижение">
            <div class="profile-modal-backdrop" data-close-modal="1"></div>
            <div class="profile-modal-card profile-modal-card-achievement">
                <button type="button" class="profile-modal-dot" id="profileCloseAchievementButton" aria-label="Закрыть"></button>
                <div class="profile-achievement-hero profile-achievement-circle--${achievement.tone}">
                    <span class="profile-achievement-icon">${escapeHtml(achievement.iconLabel)}</span>
                </div>
                <p class="profile-achievement-name">${escapeHtml(achievement.title)}</p>
                <div class="profile-achievement-body">
                    <p class="profile-achievement-description">${escapeHtml(achievement.description)}</p>
                    <p class="profile-achievement-criterion">${escapeHtml(achievement.criterion)}</p>
                </div>
                <div class="profile-achievement-meta">
                    <span class="profile-achievement-meta-label">БАЛЛЫ</span>
                    <span class="profile-achievement-meta-value">${escapeHtml(String(achievement.points))}</span>
                    <span class="profile-achievement-meta-label">СТАТУС</span>
                    <span class="profile-achievement-meta-value">${escapeHtml(statusLabel)}</span>
                </div>
            </div>
        </div>
    `;
}

import { PROFILE_ACHIEVEMENTS } from "../../data/profileAchievements";
import closeAchievementIconUrl from "../../assets/images/Button_Close.svg";
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
                <img class="profile-achievement-icon" src="${escapeHtml(achievement.iconUrl)}" alt="" aria-hidden="true">
            </span>
            <span class="profile-achievement-caption">${escapeHtml(achievement.shortTitle)}</span>
            <span class="profile-achievement-progress">${escapeHtml(achievement.progressLabel)}</span>
        </button>`
        )
        .join("");
}

export function renderProfileAchievementModal(achievement: ProfileAchievement): string {
    return `
        <div class="profile-modal profile-modal--achievement" role="dialog" aria-modal="true" aria-label="Достижение">
            <div class="profile-modal-backdrop" data-close-modal="1"></div>
            <div class="profile-modal-card profile-modal-card-achievement">
                <button type="button" class="profile-modal-dot profile-modal-dot-achievement" id="profileCloseAchievementButton" aria-label="Закрыть">
                    <img class="profile-modal-close-icon" src="${escapeHtml(closeAchievementIconUrl)}" alt="" aria-hidden="true">
                </button>
                <div class="profile-achievement-hero profile-achievement-circle--${achievement.tone}">
                    <img class="profile-achievement-icon" src="${escapeHtml(achievement.iconUrl)}" alt="" aria-hidden="true">
                </div>
                <p class="profile-achievement-name">${escapeHtml(achievement.title)}</p>
                <div class="profile-achievement-body">
                    <p class="profile-achievement-description">${escapeHtml(achievement.description)}</p>
                </div>
                <div class="profile-achievement-points">${escapeHtml(String(achievement.points))} баллов</div>
            </div>
        </div>
    `;
}

import { PROFILE_ACHIEVEMENTS } from "../../data/profileAchievements";
import scoreMobileIconUrl from "../../assets/icons/Score_mobile.svg";
import type { ProfileAchievement } from "../../types/profile";
import { escapeHtml } from "../../utils/html";
import { renderProfileModalShell } from "./ProfileModalShell";

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
    return renderProfileModalShell({
        ariaLabel: "Достижение",
        closeButtonId: "profileCloseAchievementButton",
        extraModalClass: "profile-modal--achievement",
        extraCardClass: "profile-modal-card-achievement profile-modal-card--achievement-content",
        bodyHtml: `
            <div class="profile-achievement-hero">
                <img class="profile-achievement-icon" src="${escapeHtml(achievement.iconUrl)}" alt="" aria-hidden="true">
            </div>
            <p class="profile-achievement-name">${escapeHtml(achievement.title)}</p>
            <div class="profile-achievement-body">
                <p class="profile-achievement-description">${escapeHtml(achievement.description)}</p>
            </div>
            <div class="profile-achievement-points">
                <span>${escapeHtml(String(achievement.points))}</span>
                <img class="profile-achievement-points-icon" src="${escapeHtml(scoreMobileIconUrl)}" alt="" aria-hidden="true">
            </div>
        `
    });
}

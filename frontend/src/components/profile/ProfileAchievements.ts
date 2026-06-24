import scoreMobileIconUrl from "../../assets/icons/Score_mobile.svg";
import { getMyProfileAchievements } from "../../state/achievementsState";
import type { ProfileAchievement } from "../../types/profile";
import { escapeHtml } from "../../utils/html";
import { renderProfileModalShell } from "./ProfileModalShell";

interface RenderAchievementStripOptions {
    interactive?: boolean;
}

export function renderProfileAchievementStrip(
    achievements: readonly ProfileAchievement[] = getMyProfileAchievements(),
    options: RenderAchievementStripOptions = {}
): string {
    const interactive = options.interactive ?? true;

    return achievements
        .map(
            (achievement) => {
                const tagName = interactive ? "button" : "div";
                const buttonAttrs = interactive
                    ? `type="button" data-achievement-id="${escapeHtml(achievement.id)}"`
                    : "";

                return `
        <${tagName}
            ${buttonAttrs}
            class="profile-achievement-item profile-achievement-item--${achievement.status}"
            aria-label="${escapeHtml(`${achievement.title}. ${achievement.description}`)}"
        >
            <span class="profile-achievement-circle profile-achievement-circle--${achievement.tone}">
                <img class="profile-achievement-icon" src="${escapeHtml(achievement.iconUrl)}" alt="" aria-hidden="true">
            </span>
            <span class="profile-achievement-caption">${escapeHtml(achievement.shortTitle)}</span>
            <span class="profile-achievement-progress">${escapeHtml(achievement.progressLabel)}</span>
        </${tagName}>`;
            }
        )
        .join("");
}

export function renderProfileAchievementModal(achievement: ProfileAchievement): string {
    const earnedMeta = achievement.status === "earned" && achievement.earnedAtUtc
        ? `<p class="profile-achievement-criterion">${escapeHtml(achievement.progressLabel)}</p>`
        : `<p class="profile-achievement-criterion">Условие: ${escapeHtml(achievement.criterion)}</p>`;

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
            ${earnedMeta}
            <div class="profile-achievement-points">
                <span>${escapeHtml(String(achievement.points))}</span>
                <img class="profile-achievement-points-icon" src="${escapeHtml(scoreMobileIconUrl)}" alt="" aria-hidden="true">
            </div>
        `
    });
}

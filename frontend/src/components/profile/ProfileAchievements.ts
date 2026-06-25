import { getMyProfileAchievements } from "../../state/achievementsState";
import type { ProfileAchievement } from "../../types/profile";
import { escapeHtml } from "../../utils/html";
import { renderProfileModalShell } from "./ProfileModalShell";

interface RenderAchievementStripOptions {
    interactive?: boolean;
}

function formatAchievementPointsLabel(points: number): string {
    const absolute = Math.abs(points);
    const lastTwo = absolute % 100;
    const last = absolute % 10;
    const word =
        lastTwo >= 11 && lastTwo <= 14
            ? "баллов"
            : last === 1
              ? "балл"
              : last >= 2 && last <= 4
                ? "балла"
                : "баллов";

    return `${points} ${word}`;
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
    return renderProfileModalShell({
        ariaLabel: "Достижение",
        closeButtonId: "profileCloseAchievementButton",
        extraModalClass: "profile-modal--achievement",
        extraCardClass: "profile-modal-card-achievement profile-modal-card--achievement-content",
        bodyHtml: `
            <div class="profile-achievement-hero profile-achievement-circle profile-achievement-circle--${achievement.tone}">
                <img class="profile-achievement-icon" src="${escapeHtml(achievement.iconUrl)}" alt="" aria-hidden="true">
            </div>
            <p class="profile-achievement-name">${escapeHtml(achievement.modalTitle)}</p>
            <div class="profile-achievement-body">
                <p class="profile-achievement-description">${escapeHtml(achievement.modalDescription)}</p>
            </div>
            <div class="profile-achievement-points">
                <span>${escapeHtml(formatAchievementPointsLabel(achievement.points))}</span>
            </div>
        `
    });
}

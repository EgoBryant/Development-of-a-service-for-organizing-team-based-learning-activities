import closeAchievementIconUrl from "../../assets/images/Button_Close.svg";
import { escapeHtml } from "../../utils/html";

export interface ProfileModalShellOptions {
    ariaLabel: string;
    bodyHtml: string;
    closeButtonId?: string;
    backdropCloseAttr?: string;
    extraModalClass?: string;
    extraCardClass?: string;
    showCloseButton?: boolean;
}

export function renderProfileModalCloseButton(closeButtonId: string): string {
    return `
        <button type="button" class="profile-modal-close-btn" id="${escapeHtml(closeButtonId)}" aria-label="Закрыть">
            <img class="profile-modal-close-icon" src="${escapeHtml(closeAchievementIconUrl)}" alt="" aria-hidden="true">
        </button>`;
}

export function renderProfileModalShell(options: ProfileModalShellOptions): string {
    const {
        ariaLabel,
        bodyHtml,
        closeButtonId = "profileCloseModalButton",
        backdropCloseAttr = 'data-close-modal="1"',
        extraModalClass = "",
        extraCardClass = "",
        showCloseButton = true
    } = options;

    const closeBtn = showCloseButton
        ? `
        <button type="button" class="profile-modal-close-btn" id="${escapeHtml(closeButtonId)}" aria-label="Закрыть" ${backdropCloseAttr}>
            <img class="profile-modal-close-icon" src="${escapeHtml(closeAchievementIconUrl)}" alt="" aria-hidden="true">
        </button>`
        : "";

    return `
        <div class="profile-modal profile-modal--shell ${extraModalClass}" role="dialog" aria-modal="true" aria-label="${escapeHtml(ariaLabel)}">
            <div class="profile-modal-backdrop" ${backdropCloseAttr}></div>
            <div class="profile-modal-card profile-modal-card--shell ${extraCardClass}">
                ${closeBtn}
                ${bodyHtml}
            </div>
        </div>`;
}

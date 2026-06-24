import { renderProfileModalShell } from "../profile/ProfileModalShell";

export interface TeamLeaveModalOptions {
    isSubmitting?: boolean;
}

export function renderTeamLeaveModal(options: TeamLeaveModalOptions = {}): string {
    const disabledAttr = options.isSubmitting ? " disabled" : "";

    return renderProfileModalShell({
        ariaLabel: "Покинуть команду",
        closeButtonId: "teamLeaveCloseButton",
        backdropCloseAttr: 'data-close-team-modal="1"',
        extraModalClass: "team-overlay-modal team-leave-modal",
        extraCardClass: "team-leave-modal-card",
        showCloseButton: false,
        bodyHtml: `
            <p class="team-leave-modal-text">Вы уверены, что хотите покинуть команду?</p>
            <div class="team-leave-modal-actions">
                <button type="button" class="team-leave-modal-btn team-leave-modal-btn--yes" id="teamLeaveConfirmButton"${disabledAttr}>ДА</button>
                <button type="button" class="team-leave-modal-btn team-leave-modal-btn--no" id="teamLeaveCancelButton"${disabledAttr}>НЕТ</button>
            </div>`
    });
}

export interface TeamLeaveModalHandlers {
    onConfirm: () => void;
    onCancel: () => void;
}

export function wireTeamLeaveModal(root: HTMLElement, handlers: TeamLeaveModalHandlers): void {
    const confirmButton = root.querySelector("#teamLeaveConfirmButton");
    if (confirmButton instanceof HTMLButtonElement) {
        confirmButton.addEventListener("click", handlers.onConfirm);
    }

    const cancelButton = root.querySelector("#teamLeaveCancelButton");
    if (cancelButton instanceof HTMLButtonElement) {
        cancelButton.addEventListener("click", handlers.onCancel);
    }
}

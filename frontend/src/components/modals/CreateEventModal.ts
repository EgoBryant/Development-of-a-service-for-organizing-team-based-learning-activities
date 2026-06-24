import { teamFlowState } from "../../state/teamFlowState";
import type { EventCreateDraft } from "../../types/event";
import { renderProfileModalShell } from "../profile/ProfileModalShell";
import { renderEventCreateFormFields } from "./eventCreateForm";

export { isEventCreateDraftComplete as isTeamEventDraftComplete } from "./eventCreateForm";

export function renderCreateEventModal(): string {
    const draft = teamFlowState.eventDraft;
    const errorHtml = teamFlowState.eventShowValidationError
        ? `<p class="team-validation-error team-validation-error--modal" role="alert">ЗАПОЛНИТЕ ВСЕ ПОЛЯ</p>`
        : "";

    return renderProfileModalShell({
        ariaLabel: "Создание события",
        closeButtonId: "teamEventCloseCreateButton",
        backdropCloseAttr: 'data-close-team-event-modal="1"',
        extraModalClass: "team-overlay-modal event-create-modal team-page-event-modal",
        extraCardClass: "profile-modal-card--form",
        bodyHtml: `
            <h2 class="profile-shell-title">СОБЫТИЕ</h2>
            ${errorHtml}
            <form id="teamEventCreateForm" class="team-rescue-form profile-modal-card-body" novalidate>
                ${renderEventCreateFormFields("teamEventCreate", draft)}
                <button type="submit" class="profile-team-flow-btn profile-team-flow-btn--search team-rescue-submit">СОЗДАТЬ</button>
            </form>
        `
    });
}

export function renderEventsDashboardCreateModal(
    draft: EventCreateDraft,
    showValidationError: boolean
): string {
    const errorHtml = showValidationError
        ? `<p class="team-validation-error team-validation-error--modal" role="alert">ЗАПОЛНИТЕ ВСЕ ПОЛЯ</p>`
        : "";

    return renderProfileModalShell({
        ariaLabel: "Создание события",
        closeButtonId: "eventsCloseCreateButton",
        backdropCloseAttr: 'data-close-events-modal="1"',
        extraModalClass: "team-overlay-modal event-create-modal",
        extraCardClass: "profile-modal-card--form",
        bodyHtml: `
            <h2 class="profile-shell-title">СОБЫТИЕ</h2>
            ${errorHtml}
            <form id="eventCreateForm" class="team-rescue-form profile-modal-card-body" novalidate>
                ${renderEventCreateFormFields("eventCreate", draft)}
                <button type="submit" class="profile-team-flow-btn profile-team-flow-btn--search team-rescue-submit">СОЗДАТЬ</button>
            </form>
        `
    });
}

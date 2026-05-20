import { teamFlowState } from "../../state/teamFlowState";
import type { EventCreateDraft } from "../../types/event";
import { renderEventCreateFormFields } from "./eventCreateForm";

export { isEventCreateDraftComplete as isTeamEventDraftComplete } from "./eventCreateForm";

export function renderCreateEventModal(): string {
    const draft = teamFlowState.eventDraft;
    const errorHtml = teamFlowState.eventShowValidationError
        ? `<p class="team-validation-error team-validation-error--modal" role="alert">ЗАПОЛНИТЕ ВСЕ ПОЛЯ</p>`
        : "";

    return `
        <div class="profile-modal team-overlay-modal team-rescue-modal event-create-modal team-page-event-modal" role="dialog" aria-modal="true" aria-label="Создание события">
            <div class="profile-modal-backdrop team-rescue-backdrop" data-close-team-event-modal="1"></div>
            <div class="profile-modal-card team-rescue-card">
                <button type="button" class="team-rescue-close" id="teamEventCloseCreateButton" aria-label="Закрыть"></button>
                <h2 class="team-rescue-title">СОБЫТИЕ</h2>
                ${errorHtml}
                <form id="teamEventCreateForm" class="team-rescue-form" novalidate>
                    ${renderEventCreateFormFields("teamEventCreate", draft)}
                    <button type="submit" class="team-rescue-submit">СОЗДАТЬ</button>
                </form>
            </div>
        </div>`;
}

export function renderEventsDashboardCreateModal(
    draft: EventCreateDraft,
    showValidationError: boolean
): string {
    const errorHtml = showValidationError
        ? `<p class="team-validation-error team-validation-error--modal" role="alert">ЗАПОЛНИТЕ ВСЕ ПОЛЯ</p>`
        : "";

    return `
        <div class="profile-modal team-overlay-modal team-rescue-modal event-create-modal" role="dialog" aria-modal="true" aria-label="Создание события">
            <div class="profile-modal-backdrop team-rescue-backdrop" data-close-events-modal="1"></div>
            <div class="profile-modal-card team-rescue-card">
                <button type="button" class="team-rescue-close" id="eventsCloseCreateButton" aria-label="Закрыть"></button>
                <h2 class="team-rescue-title">СОБЫТИЕ</h2>
                ${errorHtml}
                <form id="eventCreateForm" class="team-rescue-form" novalidate>
                    ${renderEventCreateFormFields("eventCreate", draft)}
                    <button type="submit" class="team-rescue-submit">СОЗДАТЬ</button>
                </form>
            </div>
        </div>`;
}

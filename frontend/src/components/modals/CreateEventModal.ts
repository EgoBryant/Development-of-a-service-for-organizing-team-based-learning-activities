import { teamFlowState } from "../../state/teamFlowState";
import type { TeamEventCreateDraft } from "../../types/team";
import { escapeHtml } from "../../utils/html";

export function isTeamEventDraftComplete(draft: TeamEventCreateDraft): boolean {
    return (
        draft.topic.trim().length > 0 &&
        draft.tag.trim().length > 0 &&
        draft.description.trim().length > 0 &&
        draft.format.trim().length > 0 &&
        draft.dateTime.trim().length > 0
    );
}

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
                    <div class="team-rescue-topic-row">
                        <input
                            id="teamEventCreateTopicInput"
                            class="team-rescue-field team-rescue-field--topic"
                            type="text"
                            placeholder="ТЕМА"
                            value="${escapeHtml(draft.topic)}"
                            autocomplete="off"
                        >
                        <input
                            id="teamEventCreateTagInput"
                            class="team-rescue-field team-rescue-field--tag"
                            type="text"
                            placeholder="ТЕГ"
                            value="${escapeHtml(draft.tag)}"
                            autocomplete="off"
                        >
                    </div>
                    <textarea
                        id="teamEventCreateDescriptionInput"
                        class="team-rescue-textarea"
                        placeholder=" "
                        aria-label="Описание события"
                    >${escapeHtml(draft.description)}</textarea>
                    <div class="team-rescue-duo-row">
                        <input
                            id="teamEventCreateFormatInput"
                            class="team-rescue-field team-rescue-field--duo"
                            type="text"
                            placeholder="ФОРМАТ"
                            value="${escapeHtml(draft.format)}"
                            autocomplete="off"
                        >
                        <input
                            id="teamEventCreateDateTimeInput"
                            class="team-rescue-field team-rescue-field--duo"
                            type="text"
                            placeholder="ДАТА, ВРЕМЯ"
                            value="${escapeHtml(draft.dateTime)}"
                            autocomplete="off"
                        >
                    </div>
                    <button type="submit" class="team-rescue-submit">СОЗДАТЬ</button>
                </form>
            </div>
        </div>`;
}

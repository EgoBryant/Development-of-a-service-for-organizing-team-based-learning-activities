import { ratingFlowState } from "../../state/ratingFlowState";
import { escapeHtml } from "../../utils/html";

export function isRescueDraftComplete(): boolean {
    const draft = ratingFlowState.rescueDraft;
    return (
        draft.topic.trim().length > 0 &&
        draft.tag.trim().length > 0 &&
        draft.description.trim().length > 0 &&
        draft.format.trim().length > 0 &&
        draft.dateTime.trim().length > 0
    );
}

export function renderRescueModal(): string {
    const draft = ratingFlowState.rescueDraft;
    const errorHtml = ratingFlowState.rescueShowError
        ? `<p class="rescue-validation-error" role="alert">ПОЛЯ НЕ ЗАПОЛНЕНЫ</p>`
        : "";

    return `
        <div class="profile-modal team-overlay-modal team-rescue-modal event-create-modal" role="dialog" aria-modal="true" aria-label="Спасение">
            <div class="profile-modal-backdrop team-rescue-backdrop" data-close-rating-rescue="1"></div>
            <div class="profile-modal-card team-rescue-card">
                <button type="button" class="team-rescue-close" id="ratingRescueCloseButton" aria-label="Закрыть"></button>
                <h2 class="team-rescue-title">СПАСЕНИЕ</h2>
                ${errorHtml}
                <form id="ratingRescueForm" class="team-rescue-form" novalidate>
                    <div class="team-rescue-topic-row">
                        <input
                            id="ratingRescueTopicInput"
                            class="team-rescue-field team-rescue-field--topic"
                            type="text"
                            placeholder="ТЕМА"
                            value="${escapeHtml(draft.topic)}"
                            autocomplete="off"
                        >
                        <input
                            id="ratingRescueTagInput"
                            class="team-rescue-field team-rescue-field--tag"
                            type="text"
                            placeholder="ТЕГ"
                            value="${escapeHtml(draft.tag)}"
                            autocomplete="off"
                        >
                    </div>
                    <textarea
                        id="ratingRescueDescriptionInput"
                        class="team-rescue-textarea"
                        placeholder=" "
                        aria-label="Описание ситуации"
                    >${escapeHtml(draft.description)}</textarea>
                    <div class="team-rescue-duo-row">
                        <input
                            id="ratingRescueFormatInput"
                            class="team-rescue-field team-rescue-field--duo"
                            type="text"
                            placeholder="ФОРМАТ"
                            value="${escapeHtml(draft.format)}"
                            autocomplete="off"
                        >
                        <input
                            id="ratingRescueDateTimeInput"
                            class="team-rescue-field team-rescue-field--duo"
                            type="text"
                            placeholder="ДАТА, ВРЕМЯ"
                            value="${escapeHtml(draft.dateTime)}"
                            autocomplete="off"
                        >
                    </div>
                    <button type="submit" class="team-rescue-submit">ОТПРАВИТЬ</button>
                </form>
            </div>
        </div>`;
}

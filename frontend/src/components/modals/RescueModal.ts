import { ratingFlowState } from "../../state/ratingFlowState";
import { escapeHtml } from "../../utils/html";
import { renderProfileModalShell } from "../profile/ProfileModalShell";

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

    return renderProfileModalShell({
        ariaLabel: "Спасение",
        closeButtonId: "ratingRescueCloseButton",
        backdropCloseAttr: 'data-close-rating-rescue="1"',
        extraModalClass: "team-overlay-modal event-create-modal",
        extraCardClass: "profile-modal-card--form",
        bodyHtml: `
            <h2 class="profile-shell-title">СПАСЕНИЕ</h2>
            ${errorHtml}
            <form id="ratingRescueForm" class="team-rescue-form profile-modal-card-body" novalidate>
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
                <button type="submit" class="profile-team-flow-btn profile-team-flow-btn--search team-rescue-submit">ОТПРАВИТЬ</button>
            </form>
        `
    });
}

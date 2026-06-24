import type { NewsCreateDraft } from "../../types/news";
import { escapeHtml } from "../../utils/html";
import { renderProfileModalShell } from "../profile/ProfileModalShell";

export function isNewsCreateDraftComplete(draft: NewsCreateDraft): boolean {
    return draft.title.trim().length > 0 && draft.body.trim().length > 0;
}

export function renderCreateNewsModal(draft: NewsCreateDraft, showValidationError: boolean): string {
    const errorHtml = showValidationError
        ? `<p class="team-validation-error team-validation-error--modal" role="alert">ЗАПОЛНИТЕ ЗАГОЛОВОК И ТЕКСТ</p>`
        : "";

    return renderProfileModalShell({
        ariaLabel: "Новая новость",
        closeButtonId: "eventsCloseCreateNewsButton",
        backdropCloseAttr: 'data-close-events-modal="1"',
        extraModalClass: "team-overlay-modal event-create-modal news-create-modal",
        extraCardClass: "profile-modal-card--form",
        bodyHtml: `
            <h2 class="profile-shell-title">НОВОСТЬ</h2>
            ${errorHtml}
            <form id="newsCreateForm" class="team-rescue-form profile-modal-card-body" novalidate>
                <input
                    id="newsCreateTitleInput"
                    class="team-rescue-field"
                    type="text"
                    placeholder="ЗАГОЛОВОК"
                    value="${escapeHtml(draft.title)}"
                    autocomplete="off"
                >
                <textarea
                    id="newsCreateBodyInput"
                    class="team-rescue-textarea news-create-textarea"
                    placeholder="ТЕКСТ РАССЫЛКИ"
                    rows="5"
                >${escapeHtml(draft.body)}</textarea>
                <button type="submit" class="profile-team-flow-btn profile-team-flow-btn--search team-rescue-submit">ОПУБЛИКОВАТЬ</button>
            </form>
        `
    });
}

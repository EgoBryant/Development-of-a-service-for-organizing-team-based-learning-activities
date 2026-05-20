import type { NewsCreateDraft } from "../../types/news";
import { escapeHtml } from "../../utils/html";

export function isNewsCreateDraftComplete(draft: NewsCreateDraft): boolean {
    return draft.title.trim().length > 0 && draft.body.trim().length > 0;
}

export function renderCreateNewsModal(draft: NewsCreateDraft, showValidationError: boolean): string {
    const errorHtml = showValidationError
        ? `<p class="team-validation-error team-validation-error--modal" role="alert">ЗАПОЛНИТЕ ЗАГОЛОВОК И ТЕКСТ</p>`
        : "";

    return `
        <div class="profile-modal team-overlay-modal team-rescue-modal event-create-modal news-create-modal" role="dialog" aria-modal="true" aria-label="Новая новость">
            <div class="profile-modal-backdrop team-rescue-backdrop" data-close-events-modal="1"></div>
            <div class="profile-modal-card team-rescue-card">
                <button type="button" class="team-rescue-close" id="eventsCloseCreateNewsButton" aria-label="Закрыть"></button>
                <h2 class="team-rescue-title">НОВОСТЬ</h2>
                ${errorHtml}
                <form id="newsCreateForm" class="team-rescue-form" novalidate>
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
                    <button type="submit" class="team-rescue-submit">ОПУБЛИКОВАТЬ</button>
                </form>
            </div>
        </div>`;
}

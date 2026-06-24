import { renderProfileModalShell } from "../profile/ProfileModalShell";

export function renderSuccessEventModal(): string {
    return renderProfileModalShell({
        ariaLabel: "Событие создано",
        closeButtonId: "teamEventCloseSuccessButton",
        backdropCloseAttr: 'data-close-team-event-modal="1"',
        extraModalClass: "team-overlay-modal event-success-modal team-page-event-modal",
        bodyHtml: `
            <h2 class="profile-shell-title">УСПЕШНО!</h2>
            <div class="event-success-link-row">
                <div class="event-success-link-field">ССЫЛКА</div>
                <button type="button" class="event-success-link-copy" id="teamEventCopyLinkButton">СКОПИРОВАТЬ</button>
            </div>
            <div class="event-success-qr-wrap">
                <img id="teamEventSuccessQrImg" class="event-success-qr" width="200" height="200" alt="">
            </div>
            <button type="button" class="profile-team-flow-btn profile-team-flow-btn--search event-success-done" id="teamEventSuccessDoneButton">ГОТОВО</button>
        `
    });
}

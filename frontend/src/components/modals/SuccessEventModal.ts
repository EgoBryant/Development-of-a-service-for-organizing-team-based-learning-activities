export function renderSuccessEventModal(): string {
    return `
        <div class="profile-modal team-overlay-modal event-success-modal team-page-event-modal" role="dialog" aria-modal="true" aria-label="Событие создано">
            <div class="profile-modal-backdrop team-rescue-backdrop" data-close-team-event-modal="1"></div>
            <div class="profile-modal-card event-success-card">
                <button type="button" class="team-rescue-close" id="teamEventCloseSuccessButton" aria-label="Закрыть"></button>
                <h2 class="profile-modal-title event-success-title">УСПЕШНО!</h2>
                <div class="event-success-link-row">
                    <div class="event-success-link-field">ССЫЛКА</div>
                    <button type="button" class="event-success-link-copy" id="teamEventCopyLinkButton">СКОПИРОВАТЬ</button>
                </div>
                <div class="event-success-qr-wrap">
                    <img id="teamEventSuccessQrImg" class="event-success-qr" width="200" height="200" alt="">
                </div>
                <button type="button" class="event-success-done" id="teamEventSuccessDoneButton">ГОТОВО</button>
            </div>
        </div>`;
}

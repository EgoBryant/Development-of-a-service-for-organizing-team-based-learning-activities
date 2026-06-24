import type { ExternalProfileSource } from "../../types/app";
import { escapeHtml } from "../../utils/html";

export function renderExternalProfileDock(options: {
    source: ExternalProfileSource;
    requestId?: number;
    canAct?: boolean;
}): string {
    const backLabel = options.source === "join-request" ? "К ЗАЯВКАМ" : "К КОМАНДЕ";
    const actionButtonsHtml =
        options.source === "join-request" && options.requestId && options.canAct
            ? `
            <button
                type="button"
                class="profile-requests-dock-btn profile-requests-dock-btn--accept"
                data-team-join-request-status="Accepted"
                data-team-join-request-id="${escapeHtml(String(options.requestId))}"
            >ПРИНЯТЬ</button>
            <button
                type="button"
                class="profile-requests-dock-btn profile-requests-dock-btn--reject"
                data-team-join-request-status="Rejected"
                data-team-join-request-id="${escapeHtml(String(options.requestId))}"
            >ОТКЛОНИТЬ</button>`
            : "";

    return `
        <div class="profile-requests-applicant-dock" aria-label="Просмотр профиля участника">
            <button type="button" class="profile-requests-dock-btn" data-external-profile-back>${backLabel}</button>
            ${actionButtonsHtml}
        </div>`;
}

import { escapeHtml } from "../../utils/html";

export function renderTeamRequestsApplicantDock(requestId: number, canAct: boolean): string {
    const actionButtonsHtml = canAct
        ? `
            <button
                type="button"
                class="profile-requests-dock-btn profile-requests-dock-btn--accept"
                data-team-join-request-status="Accepted"
                data-team-join-request-id="${escapeHtml(String(requestId))}"
            >ПРИНЯТЬ</button>
            <button
                type="button"
                class="profile-requests-dock-btn profile-requests-dock-btn--reject"
                data-team-join-request-status="Rejected"
                data-team-join-request-id="${escapeHtml(String(requestId))}"
            >ОТКЛОНИТЬ</button>`
        : "";

    return `
        <div class="profile-requests-applicant-dock" aria-label="Действия с заявкой">
            <button type="button" class="profile-requests-dock-btn" data-team-request-back>К ЗАЯВКАМ</button>
            ${actionButtonsHtml}
        </div>`;
}

import { getAppBridge } from "../../app/bridge";
import { teamFlowState } from "../../state/teamFlowState";
import { escapeHtml } from "../../utils/html";

export function renderNoTeamBlock(): string {
    if (teamFlowState.noTeamView === "create-form") {
        const draft = teamFlowState.createTeamDraft;
        return `
            <section class="team-no-team-block team-no-team-block--create" aria-label="Создание команды">
                <h2 class="team-no-team-title">СОЗДАНИЕ КОМАНДЫ</h2>
                <input
                    id="teamCreateNameInput"
                    class="team-no-team-input"
                    type="text"
                    placeholder="НАЗВАНИЕ"
                    value="${escapeHtml(draft.name)}"
                    autocomplete="off"
                >
                <input
                    id="teamCreateDirectionInput"
                    class="team-no-team-input"
                    type="text"
                    placeholder="НАПРАВЛЕНИЕ"
                    value="${escapeHtml(draft.direction)}"
                    autocomplete="off"
                >
                <div class="team-no-team-actions">
                    <button type="button" class="team-no-team-btn team-no-team-btn--primary" id="teamConfirmCreateButton">СОЗДАТЬ КОМАНДУ</button>
                    <button type="button" class="team-no-team-btn team-no-team-btn--ghost" data-team-no-team-back>НАЗАД</button>
                </div>
            </section>`;
    }

    const inviteError = teamFlowState.inviteCodeError
        ? `<p class="team-validation-error" role="alert">${escapeHtml(teamFlowState.inviteCodeError)}</p>`
        : "";

    return `
        <section class="team-no-team-block" aria-label="Нет команды">
            <h2 class="team-no-team-title">НЕТ КОМАНДЫ</h2>
            <p class="team-no-team-hint">СОЗДАЙТЕ КОМАНДУ ИЛИ ВСТУПИТЕ ПО КОДУ ПРИГЛАШЕНИЯ</p>
            ${inviteError}
            <button type="button" class="team-no-team-btn team-no-team-btn--primary" id="teamOpenCreateFormButton">СОЗДАТЬ КОМАНДУ</button>
            <form id="teamJoinByCodeForm" class="team-join-form" novalidate>
                <input
                    id="teamInviteCodeInput"
                    class="team-no-team-input"
                    type="text"
                    placeholder="ВВЕСТИ КОД ПРИГЛАШЕНИЯ"
                    value="${escapeHtml(teamFlowState.inviteCodeInput)}"
                    autocomplete="off"
                >
                <button type="submit" class="team-no-team-btn team-no-team-btn--secondary">ВСТУПИТЬ</button>
            </form>
        </section>`;
}

export function showNoTeamCreateForm(): void {
    teamFlowState.noTeamView = "create-form";
    teamFlowState.inviteCodeError = "";
    getAppBridge().render();
}

export function showNoTeamLanding(): void {
    teamFlowState.noTeamView = "landing";
    getAppBridge().render();
}

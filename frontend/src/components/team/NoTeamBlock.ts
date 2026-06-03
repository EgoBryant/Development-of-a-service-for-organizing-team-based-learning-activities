import { getAppBridge } from "../../app/bridge";
import { teamFlowState } from "../../state/teamFlowState";
import { escapeHtml } from "../../utils/html";

export function renderNoTeamBlock(): string {
    const bridge = getAppBridge();

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

    if (teamFlowState.noTeamView === "search") {
        const teams = bridge.getJoinableTeams();
        const teamsHtml = teams.length
            ? teams.map((team) => {
                const isPending = team.joinRequestStatus === "Pending";
                return `
                <article class="team-search-card" data-team-search-text="${escapeHtml(`${team.name} ${team.description} ${team.inviteCode}`.toLowerCase())}">
                    <div>
                        <h3 class="team-search-title">${escapeHtml(team.name)}</h3>
                        <p class="team-search-meta">${escapeHtml(team.description || "Команда без описания")}</p>
                        <p class="team-search-meta">КРК ${escapeHtml(team.krk.toFixed(1))} · ${escapeHtml(String(team.memberCount))} участн.</p>
                    </div>
                    <button
                        type="button"
                        class="team-no-team-btn team-no-team-btn--secondary"
                        data-team-request-id="${team.id}"
                        ${isPending ? "disabled" : ""}
                    >${isPending ? "ОТПРАВЛЕНА" : "ЗАЯВКА"}</button>
                </article>`;
            })
                .join("")
            : `<p class="team-list-empty">Команды не найдены. Создайте свою или запросите invite code у капитана.</p>`;

        return `
            <section class="team-no-team-block" aria-label="Поиск команды">
                <h2 class="team-no-team-title">ПОИСК КОМАНДЫ</h2>
                <input
                    id="teamSearchInput"
                    class="team-no-team-input"
                    type="search"
                    placeholder="НАЗВАНИЕ, НАПРАВЛЕНИЕ ИЛИ КОД"
                    value="${escapeHtml(teamFlowState.searchQuery)}"
                    autocomplete="off"
                >
                <div class="team-search-list">
                    ${teamsHtml}
                </div>
                <button type="button" class="team-no-team-btn team-no-team-btn--ghost" data-team-no-team-back>НАЗАД</button>
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
            <button type="button" class="team-no-team-btn team-no-team-btn--ghost" id="teamOpenSearchButton">НАЙТИ КОМАНДУ</button>
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

import type { TeamSearchItem } from "../../types/team";
import { escapeHtml } from "../../utils/html";
import { renderProfileModalShell } from "./ProfileModalShell";

export function renderProfileNoTeamModal(): string {
    return renderProfileModalShell({
        ariaLabel: "Нет команды",
        closeButtonId: "profileCloseTeamFlowButton",
        bodyHtml: `
            <p class="profile-team-flow-text">Чтобы прокачивать КРК и забирать лучшие ачивки, тебе нужна надёжная команда</p>
            <div class="profile-team-flow-stack">
                <button type="button" class="profile-team-flow-btn profile-team-flow-btn--search" id="profileFindTeamButton">НАЙТИ</button>
                <button type="button" class="profile-team-flow-btn profile-team-flow-btn--search" id="profileOpenCreateTeamButton">СОЗДАТЬ</button>
            </div>
        `
    });
}

export function renderProfileFindTeamModal(
    teams: TeamSearchItem[],
    query: string,
    selectedTeamId: number | null
): string {
    const teamsHtml = teams.length
        ? teams
              .map((team) => {
                  const isSelected = team.id === selectedTeamId;
                  const isPending = team.joinRequestStatus === "Pending";
                  return `
                <button
                    type="button"
                    class="profile-team-find-item${isSelected ? " is-selected" : ""}"
                    data-team-pick-id="${team.id}"
                    ${isPending ? 'data-team-pending="1"' : ""}
                    aria-pressed="${isSelected ? "true" : "false"}"
                >
                    ${escapeHtml(team.name)}
                </button>`;
              })
              .join("")
        : `<p class="profile-team-flow-empty">Команды не найдены. Попробуйте другой запрос или создайте свою.</p>`;

    const selectedTeam = teams.find((team) => team.id === selectedTeamId);
    const requestDisabled = !selectedTeam || selectedTeam.joinRequestStatus === "Pending";
    const requestLabel = selectedTeam?.joinRequestStatus === "Pending" ? "ОТПРАВЛЕНА" : "ЗАЯВКА";

    return renderProfileModalShell({
        ariaLabel: "Поиск команды",
        closeButtonId: "profileCloseTeamFlowButton",
        extraCardClass: "profile-modal-card--scroll profile-modal-card--find-team",
        bodyHtml: `
            <div class="profile-modal-card-body profile-modal-card-body--find">
                <input
                    id="profileFindTeamSearchInput"
                    class="profile-team-flow-input"
                    type="search"
                    placeholder="НАЗВАНИЕ ИЛИ НАПРАВЛЕНИЕ"
                    value="${escapeHtml(query)}"
                    autocomplete="off"
                >
                <div class="profile-team-find-list" role="listbox" aria-label="Список команд">
                    ${teamsHtml}
                </div>
                <div class="profile-team-flow-stack">
                    <button
                        type="button"
                        class="profile-team-flow-btn profile-team-flow-btn--search"
                        id="profileFindTeamRequestButton"
                        ${requestDisabled ? "disabled" : ""}
                    >${requestLabel}</button>
                    <button type="button" class="profile-team-flow-btn profile-team-flow-btn--create" id="profileBackFromFindTeamButton">НАЗАД</button>
                </div>
            </div>
        `
    });
}

export function renderProfileCreateTeamModal(teamName: string): string {
    const canCreate = teamName.trim().length >= 3;

    return renderProfileModalShell({
        ariaLabel: "Создание команды",
        closeButtonId: "profileCloseTeamFlowButton",
        bodyHtml: `
            <div class="profile-team-create-body">
                <input
                    id="profileTeamNameInput"
                    class="profile-team-flow-input profile-team-flow-input--create"
                    type="text"
                    placeholder="НАЗВАНИЕ"
                    value="${escapeHtml(teamName)}"
                    autocomplete="off"
                >
                <button type="button" class="profile-team-flow-btn profile-team-flow-btn--create" id="profileConfirmCreateTeamButton"${canCreate ? "" : " disabled"}>СОЗДАТЬ</button>
                <button type="button" class="profile-team-flow-btn profile-team-flow-btn--search" id="profileOpenFindTeamFromCreateButton">К ПОИСКУ</button>
            </div>
        `
    });
}

export function renderProfileTeamSuccessModal(): string {
    return renderProfileModalShell({
        ariaLabel: "Команда создана",
        closeButtonId: "profileCloseSuccessButton",
        extraCardClass: "profile-modal-card--team-success",
        bodyHtml: `
            <p class="profile-team-flow-text">Отправь QR или ссылку друзьям, чтобы собрать состав</p>
            <div class="profile-team-success-qr-wrap">
                <img id="profileSuccessQrImg" class="profile-team-success-qr" width="220" height="220" alt="">
            </div>
            <div class="profile-team-flow-stack">
                <button type="button" class="profile-team-flow-btn profile-team-flow-btn--search" id="profileCopyInviteButton">СКОПИРОВАТЬ</button>
                <button type="button" class="profile-team-flow-btn profile-team-flow-btn--search" id="profileSuccessGoButton">К КОМАНДЕ</button>
            </div>
        `
    });
}

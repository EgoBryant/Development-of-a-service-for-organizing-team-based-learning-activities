import { getAppBridge } from "../../app/bridge";
import { escapeHtml } from "../../utils/html";

export function renderActiveTeamBlock(): string {
    const bridge = getAppBridge();
    const title = bridge.getTeamTitle();
    const subtitle = bridge.getTeamSubtitle();
    const members = bridge.getTeamMembers();
    const isCaptain = bridge.isCurrentUserCaptain();

    const requestsControl = isCaptain
        ? `<button type="button" class="team-top-pill team-top-pill-plus" id="teamOpenRequestsHeaderButton" aria-label="Заявки">+</button>`
        : "";

    const membersHtml = members.length
        ? members
              .map((member, index) => {
                  const avatarInner = member.avatarUrl
                      ? `<img src="${escapeHtml(member.avatarUrl)}" alt="" loading="lazy">`
                      : "";
                  return `
            <div class="team-member-card">
                <div class="team-member-avatar" aria-hidden="true">${avatarInner}</div>
                <div class="team-member-name">${escapeHtml(member.displayName)}</div>
                <div class="team-member-role">${escapeHtml(member.roleLabel)}</div>
                <button type="button" class="team-member-action" data-team-card-action="vote" data-member-index="${index}">ГОЛОСОВАТЬ</button>
            </div>`;
              })
              .join("")
        : `<p class="team-members-empty">Участники появятся здесь после приглашения в команду.</p>`;

    return `
        <div class="team-active-wrap">
            <header class="team-top-bar">
                <div class="team-top-headings">
                    <span class="team-top-title">${escapeHtml(title)}</span>
                    ${subtitle ? `<span class="team-top-subtitle">${escapeHtml(subtitle)}</span>` : ""}
                </div>
                <span class="team-top-dot" aria-hidden="true"></span>
                <button type="button" class="team-top-pill" id="teamKrkButton">КРК</button>
                ${requestsControl}
            </header>

            <div class="team-active-blocks">
                <div class="team-panel team-info-panel">
                    <h3 class="team-block-title">НАЗВАНИЕ, КРК</h3>
                    <div class="team-info-row">
                        <span class="team-info-label">КОМАНДА</span>
                        <span class="team-info-value">${escapeHtml(title)}</span>
                    </div>
                    <div class="team-info-row">
                        <span class="team-info-label">КРК</span>
                        <span class="team-info-value">—</span>
                    </div>
                </div>

                <div class="team-panel team-members-panel">
                    <h3 class="team-block-title">УЧАСТНИКИ</h3>
                    <div class="team-members-grid">
                        ${membersHtml}
                    </div>
                </div>

                <div class="team-panel team-history-panel">
                    <div class="team-history-head">
                        <h3 class="team-block-title">ИСТОРИЯ АКТИВНОСТИ</h3>
                        <button type="button" class="team-top-pill team-check-in-pill" id="teamCheckInButton">CHECK-IN</button>
                    </div>
                    <div class="team-history-rows team-history-rows--empty" aria-label="История активности пока пуста"></div>
                </div>
            </div>

            <div class="team-rescue-bar">
                <button type="button" class="team-rescue-pill" id="teamRescueButton">СПАСЕНИЕ</button>
            </div>

            <button type="button" class="team-fab-create" id="teamOpenCreateEventButton" aria-label="Создать событие">+</button>
        </div>`;
}

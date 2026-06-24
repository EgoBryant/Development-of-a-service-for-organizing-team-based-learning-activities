import scrollLeftIconUrl from "../../assets/icons/Scroll_button_left.svg";
import scrollRightIconUrl from "../../assets/icons/Scroll_button_right.svg";
import scoreIconUrl from "../../assets/icons/Score_mobile.svg";
import { getAppBridge } from "../../app/bridge";
import { escapeHtml } from "../../utils/html";

function renderTeamHistoryPointsBadge(pointsLabel?: string): string {
    if (!pointsLabel) {
        return "";
    }

    const value = pointsLabel.replace(/^\+/, "").trim();
    if (!value) {
        return "";
    }

    return `
        <span class="team-history-row-points">
            <span class="team-history-row-points-value">${escapeHtml(value)}</span>
            <span class="team-history-row-points-label">баллов</span>
            <img src="${escapeHtml(scoreIconUrl)}" alt="" class="team-history-row-points-icon" aria-hidden="true">
        </span>`;
}

export function renderActiveTeamBlock(): string {
    const bridge = getAppBridge();
    const title = bridge.getTeamTitle();
    const members = bridge.getTeamMembers();
    const isCaptain = bridge.isCurrentUserCaptain();
    const history = bridge.getTeamHistory();
    const teamScore = bridge.getTeamScore();

    const memberCards = members
        .map((member, index) => {
            const avatarInner = member.avatarUrl
                ? `<img src="${escapeHtml(member.avatarUrl)}" alt="" loading="lazy">`
                : `<span class="team-card-photo-placeholder">Фото</span>`;

            const actionLabel = member.voteScore
                ? `${member.voteScore}/5`
                : "ГОЛОСОВАТЬ";

            return `
            <div class="team-member-card">
                <div class="team-member-avatar">${avatarInner}</div>
                <span class="team-member-role">${escapeHtml(member.roleLabel)}</span>
                <button
                    type="button"
                    class="team-member-action"
                    data-team-card-action="vote"
                    data-member-index="${index}"
                    ${member.canVote === false ? "disabled" : ""}
                >${actionLabel}</button>
            </div>`;
        })
        .join("");

    const isHistoryEmpty = history.length === 0;

    const historyRows = isHistoryEmpty
        ? ""
        : history
              .map(
                  (item) => `
            <div class="team-history-row">
                <span class="team-history-row-text">${escapeHtml(item.title)}</span>
                ${renderTeamHistoryPointsBadge(item.pointsLabel)}
            </div>`
              )
              .join("");

    return `
        <div class="team-active-wrap">

            <div class="team-active-upper">
                <div class="team-topbar">
                    <div class="team-topbar-tabs">
                        <span class="team-topbar-tab team-topbar-tab--name">${escapeHtml(title)}</span>
                        <button type="button" class="team-topbar-tab team-topbar-tab--active" id="teamOpenRequestsHeaderButton" aria-label="Заявки">ЗАЯВКИ</button>
                    </div>
                    <div class="team-topbar-krk">
                        <span class="team-topbar-krk-label" aria-hidden="true"><span class="team-topbar-krk-label-text">БАЛЛЫ</span></span>
                        <span class="team-topbar-krk-value">${escapeHtml(teamScore)}</span>
                    </div>
                </div>

                <div class="team-carousel-wrap${members.length <= 1 ? " team-carousel-wrap--single" : ""}">
                    <button type="button" class="team-carousel-arrow team-carousel-arrow--prev${members.length <= 1 ? " team-carousel-arrow--hidden" : ""}" id="teamCarouselPrev" aria-label="Предыдущий">
                        <img src="${escapeHtml(scrollLeftIconUrl)}" alt="" aria-hidden="true">
                    </button>
                    <div class="team-carousel" id="teamCarousel">
                        ${memberCards}
                    </div>
                    <button type="button" class="team-carousel-arrow team-carousel-arrow--next${members.length <= 1 ? " team-carousel-arrow--hidden" : ""}" id="teamCarouselNext" aria-label="Следующий">
                        <img src="${escapeHtml(scrollRightIconUrl)}" alt="" aria-hidden="true">
                    </button>
                </div>
            </div>

            <div class="team-active-lower">
                <div class="team-history-panel">
                    <div class="team-history-head">
                        <h3 class="team-history-title">ИСТОРИЯ АКТИВНОСТИ</h3>
                        <button type="button" class="team-checkin-btn" id="teamCheckInButton" ${isCaptain ? "" : "disabled"}>CHECK-IN</button>
                    </div>

                    <div class="team-history-body">
                        ${isHistoryEmpty ? `
                        <div class="team-history-empty-state">
                            <p class="team-history-empty-text">Тут будут отображаться все активности и заработанные баллы. Проведите первый совместный воркшоп, чтобы запустить историю ваших побед</p>
                        </div>` : `
                        <div class="team-history-rows">${historyRows}</div>`}
                    </div>

                    <div class="team-history-actions">
                        <button type="button" class="team-action-btn team-action-btn--blue" id="teamGoToEventsButton">К СОБЫТИЯМ</button>
                        <button type="button" class="team-action-btn team-action-btn--pink" data-team-rescue-button>СПАСЕНИЕ</button>
                    </div>
                </div>
            </div>

        </div>`;
}

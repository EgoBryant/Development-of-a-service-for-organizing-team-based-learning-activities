import scrollLeftIconUrl from "../../assets/icons/Scroll_button_left.svg";
import scrollRightIconUrl from "../../assets/icons/Scroll_button_right.svg";
import scoreIconUrl from "../../assets/icons/Score_mobile.svg";
import { getAppBridge } from "../../app/bridge";
import { escapeHtml } from "../../utils/html";
import { getTeamCarouselClasses, getTeamCarouselWrapClasses, shouldTeamCarouselScroll } from "../../utils/teamCarouselLayout";

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

            const actionLabel = member.voteScore != null
                ? "ИЗМЕНИТЬ"
                : "ГОЛОСОВАТЬ";

            return `
            <div class="team-member-card">
                <button
                    type="button"
                    class="team-member-avatar team-member-avatar-btn"
                    data-team-open-member-profile="${escapeHtml(member.id)}"
                    aria-label="Профиль ${escapeHtml(member.displayName)}"
                >${avatarInner}</button>
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
    const shouldScrollMembers = shouldTeamCarouselScroll(members.length);

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

    const goToEventsButtonHtml = isHistoryEmpty
        ? `<button type="button" class="team-action-btn team-action-btn--blue" id="teamGoToEventsButton">К СОБЫТИЯМ</button>`
        : "";

    const historyPanelClass = isHistoryEmpty ? "team-history-panel" : "team-history-panel team-history-panel--filled";

    const topbarActionButtonHtml = isCaptain
        ? `<button type="button" class="team-topbar-tab team-topbar-tab--active" id="teamOpenRequestsHeaderButton" aria-label="Заявки">ЗАЯВКИ</button>`
        : `<button type="button" class="team-topbar-tab team-topbar-tab--active team-topbar-tab--leave" id="teamOpenLeaveHeaderButton" aria-label="Покинуть команду">ПОКИНУТЬ</button>`;

    return `
        <div class="team-active-wrap">

            <div class="team-active-upper">
                <div class="team-topbar">
                    <div class="team-topbar-tabs">
                        <span class="team-topbar-tab team-topbar-tab--name">${escapeHtml(title)}</span>
                        ${topbarActionButtonHtml}
                    </div>
                    <div class="team-topbar-krk">
                        <span class="team-topbar-krk-label" aria-hidden="true"><span class="team-topbar-krk-label-text">БАЛЛЫ</span></span>
                        <span class="team-topbar-krk-value">${escapeHtml(teamScore)}</span>
                    </div>
                </div>

                <div class="${getTeamCarouselWrapClasses(members.length)}">
                    <button type="button" class="team-carousel-arrow team-carousel-arrow--prev team-carousel-arrow--hidden" id="teamCarouselPrev" aria-label="Предыдущий" aria-hidden="true" tabindex="-1">
                        <img src="${escapeHtml(scrollLeftIconUrl)}" alt="" aria-hidden="true">
                    </button>
                    <div class="${getTeamCarouselClasses(members.length)}" id="teamCarousel">
                        ${memberCards}
                    </div>
                    <button type="button" class="team-carousel-arrow team-carousel-arrow--next team-carousel-arrow--hidden" id="teamCarouselNext" aria-label="Следующий" aria-hidden="true" tabindex="-1">
                        <img src="${escapeHtml(scrollRightIconUrl)}" alt="" aria-hidden="true">
                    </button>
                </div>
            </div>

            <div class="team-active-lower">
                <div class="${historyPanelClass}">
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
                        ${goToEventsButtonHtml}
                        <button type="button" class="team-action-btn team-action-btn--pink" data-team-rescue-button ${isCaptain ? "" : "disabled"}>СПАСЕНИЕ</button>
                    </div>
                </div>
            </div>

        </div>`;
}

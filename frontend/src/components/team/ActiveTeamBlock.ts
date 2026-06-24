import scrollLeftIconUrl from "../../assets/icons/Scroll_button_left.svg";
import scrollRightIconUrl from "../../assets/icons/Scroll_button_right.svg";
import { getAppBridge } from "../../app/bridge";
import { escapeHtml } from "../../utils/html";

export function renderActiveTeamBlock(): string {
    const bridge = getAppBridge();
    const title = bridge.getTeamTitle();
    const members = bridge.getTeamMembers();
    const isCaptain = bridge.isCurrentUserCaptain();
    const history = bridge.getTeamHistory();
    const krk = bridge.getTeamKrk();

    const memberCards = members
        .map((member, index) => {
            const avatarInner = member.avatarUrl
                ? `<img src="${escapeHtml(member.avatarUrl)}" alt="" loading="lazy">`
                : `<span class="team-card-photo-placeholder">Фото</span>`;

            const actionLabel = member.voteScore
                ? `${member.voteScore}/5`
                : member.canVote === false
                  ? "ВЫ"
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
                <span class="team-history-row-text">${escapeHtml(item.title)}${item.meta ? ` · <small>${escapeHtml(item.meta)}</small>` : ""}</span>
                ${item.pointsLabel ? `<span class="team-history-row-points">${escapeHtml(item.pointsLabel)}</span>` : ""}
            </div>`
              )
              .join("");

    return `
        <div class="team-active-wrap">

            <div class="team-active-upper">
                <div class="team-topbar">
                    <div class="team-topbar-tabs">
                        <span class="team-topbar-tab team-topbar-tab--name">${escapeHtml(title)}</span>
                        <button type="button" class="team-topbar-tab team-topbar-tab--active" id="teamOpenRequestsHeaderButton">ЗАЯВКИ</button>
                    </div>
                    <div class="team-topbar-krk">
                        <span class="team-topbar-krk-label"><span class="team-topbar-krk-label-text">КРК</span></span>
                        <span class="team-topbar-krk-value">${escapeHtml(krk)}</span>
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

                    ${isHistoryEmpty ? `
                    <div class="team-history-empty-state">
                        <p class="team-history-empty-text">Тут будут отображаться все активности и заработанные баллы. Проведите первый совместный воркшоп, чтобы запустить историю ваших побед</p>
                    </div>` : `
                    <div class="team-history-rows">${historyRows}</div>`}

                    <div class="team-history-actions">
                        <button type="button" class="team-action-btn team-action-btn--blue" id="teamGoToEventsButton">К СОБЫТИЯМ</button>
                        <button type="button" class="team-action-btn team-action-btn--pink" id="teamRescueButton">СПАСЕНИЕ</button>
                    </div>
                </div>
            </div>

        </div>`;
}

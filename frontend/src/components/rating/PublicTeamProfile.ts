import scrollLeftIconUrl from "../../assets/icons/Scroll_button_left.svg";
import scrollRightIconUrl from "../../assets/icons/Scroll_button_right.svg";
import { getRatingTeamById } from "../../state/ratingDataState";
import { openRatingUserProfile } from "../../state/ratingFlowState";
import { escapeHtml } from "../../utils/html";
import { resolveUserAvatarUrl } from "../../utils/ratingAvatars";

function resolveMemberAvatar(memberId: string, memberAvatar?: string): string {
    return resolveUserAvatarUrl(memberId, memberAvatar);
}

export function renderPublicTeamProfile(teamId: string): string {
    const team = getRatingTeamById(teamId);
    if (!team) {
        return `<p class="rating-profile-missing">Команда не найдена.</p>`;
    }

    const krkLabel = team.krk % 1 === 0 ? String(team.krk) : team.krk.toFixed(1);

    const memberCards = team.members
        .map((member) => {
            const avatarSrc = resolveMemberAvatar(member.id, member.avatarUrl);
            const avatarInner = avatarSrc
                ? `<img src="${escapeHtml(avatarSrc)}" alt="" loading="lazy">`
                : `<span class="team-card-photo-placeholder">Фото</span>`;

            return `
            <button type="button" class="team-member-card rating-team-member-card" data-rating-user-id="${escapeHtml(member.id)}">
                <div class="team-member-avatar">${avatarInner}</div>
                <span class="team-member-role">${escapeHtml(member.roleLabel)}</span>
            </button>`;
        })
        .join("");

    const history = team.activityHistory ?? [];
    const isHistoryEmpty = history.length === 0;

    const historyRows = isHistoryEmpty
        ? ""
        : history
              .map(
                  (item) => `
            <div class="team-history-row">
                <span class="team-history-row-text">${escapeHtml(item.title)}${item.meta ? ` · <small>${escapeHtml(item.meta)}</small>` : ""}</span>
            </div>`
              )
              .join("");

    return `
        <button type="button" class="rating-back-btn rating-back-btn--profile" data-rating-back>НАЗАД</button>
        <div class="team-active-wrap">
            <div class="team-active-upper">
                <div class="team-topbar">
                    <div class="team-topbar-tabs">
                        <span class="team-topbar-tab team-topbar-tab--name">${escapeHtml(team.name)}</span>
                        <span class="team-topbar-tab team-topbar-tab--rank">№${escapeHtml(String(team.rank))}</span>
                    </div>
                    <div class="team-topbar-krk">
                        <span class="team-topbar-krk-label"><span class="team-topbar-krk-label-text">КРК</span></span>
                        <span class="team-topbar-krk-value">${escapeHtml(krkLabel)}</span>
                    </div>
                </div>

                <div class="team-carousel-wrap${team.members.length <= 1 ? " team-carousel-wrap--single" : ""}">
                    <button
                        type="button"
                        class="team-carousel-arrow team-carousel-arrow--prev${team.members.length <= 1 ? " team-carousel-arrow--hidden" : ""}"
                        id="ratingTeamCarouselPrev"
                        aria-label="Предыдущий участник"
                    >
                        <img src="${escapeHtml(scrollLeftIconUrl)}" alt="" aria-hidden="true">
                    </button>
                    <div class="team-carousel" id="ratingTeamCarousel">
                        ${memberCards || `<p class="rating-team-members-empty">Участники пока не добавлены.</p>`}
                    </div>
                    <button
                        type="button"
                        class="team-carousel-arrow team-carousel-arrow--next${team.members.length <= 1 ? " team-carousel-arrow--hidden" : ""}"
                        id="ratingTeamCarouselNext"
                        aria-label="Следующий участник"
                    >
                        <img src="${escapeHtml(scrollRightIconUrl)}" alt="" aria-hidden="true">
                    </button>
                </div>
            </div>

            <div class="team-active-lower">
                <div class="team-history-panel">
                    <div class="team-history-head">
                        <h3 class="team-history-title">ИСТОРИЯ АКТИВНОСТИ</h3>
                    </div>

                    <div class="team-history-body">
                        ${isHistoryEmpty ? `
                        <div class="team-history-empty-state">
                            <p class="team-history-empty-text">Тут будут отображаться все активности и заработанные баллы. Проведите первый совместный воркшоп, чтобы запустить историю ваших побед</p>
                        </div>` : `
                        <div class="team-history-rows">${historyRows}</div>`}
                    </div>

                    <div class="team-history-actions">
                        <button type="button" class="team-action-btn team-action-btn--pink" data-rating-open-rescue="1">СПАСЕНИЕ</button>
                    </div>
                </div>
            </div>
        </div>`;
}

export function handleTeamMemberClick(userId: string): void {
    openRatingUserProfile(userId);
}

import { getAppBridge } from "../../app/bridge";
import { getRatingTeamById } from "../../data/demoRating";
import { openRatingUserProfile, openRatingRescueModal } from "../../state/ratingFlowState";
import { escapeHtml } from "../../utils/html";

export function renderTeamProfileCard(teamId: string): string {
    const team = getRatingTeamById(teamId);
    if (!team) {
        return `<p class="rating-profile-missing">Команда не найдена.</p>`;
    }

    const membersHtml = team.members.length
        ? team.members
              .map(
                  (member) => `
            <button type="button" class="rating-team-member-row" data-rating-user-id="${escapeHtml(member.id)}">
                <span class="rating-team-member-name">${escapeHtml(member.displayName)}</span>
                <span class="rating-team-member-role">${escapeHtml(member.roleLabel)}</span>
            </button>`
              )
              .join("")
        : `<p class="rating-team-members-empty">Участники пока не добавлены.</p>`;

    return `
        <section class="rating-profile-card rating-profile-card--team" aria-label="Профиль команды">
            <button type="button" class="rating-back-btn" data-rating-back>НАЗАД</button>
            <h2 class="rating-profile-title">${escapeHtml(team.name)}</h2>
            <div class="rating-team-blocks">
                <div class="rating-team-block rating-team-block--meta">
                    <h3 class="rating-team-block-title">НАЗВАНИЕ, КРК</h3>
                    <div class="rating-team-meta-row">
                        <span class="rating-team-meta-label">КРК</span>
                        <span class="rating-team-meta-value">${escapeHtml(String(team.krk))}</span>
                    </div>
                    <div class="rating-team-meta-row">
                        <span class="rating-team-meta-label">БАЛЛЫ</span>
                        <span class="rating-team-meta-value">${escapeHtml(String(team.points))}</span>
                    </div>
                </div>
                <div class="rating-team-block rating-team-block--members">
                    <h3 class="rating-team-block-title">УЧАСТНИКИ</h3>
                    <div class="rating-team-members-list">
                        ${membersHtml}
                    </div>
                </div>
                <div class="rating-team-block rating-team-block--history">
                    <h3 class="rating-team-block-title">ИСТОРИЯ АКТИВНОСТИ</h3>
                    <div class="rating-team-history-rows rating-team-history-rows--empty" aria-label="История активности пока пуста"></div>
                </div>
            </div>
            <button
                type="button"
                class="rating-team-photo"
                data-rating-open-rescue="1"
                aria-label="Фото команды — открыть спасение"
            ></button>
            <button type="button" class="rating-team-rescue-pill" data-rating-open-rescue="1">СПАСЕНИЕ</button>
        </section>`;
}

export function handleTeamMemberClick(userId: string): void {
    openRatingUserProfile(userId);
}

export function handleTeamRescueOpen(): void {
    openRatingRescueModal();
    getAppBridge().render();
}

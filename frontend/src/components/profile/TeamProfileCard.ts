import { getAppBridge } from "../../app/bridge";
import { getRatingTeamById } from "../../state/ratingDataState";
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

    const history = team.activityHistory ?? [];
    const historyHtml = history.length
        ? history.map((item) => `
            <div class="rating-team-member-row rating-team-history-row">
                <span class="rating-team-member-name">${escapeHtml(item.title)}</span>
                <span class="rating-team-member-role">${escapeHtml(item.meta)}</span>
            </div>`)
            .join("")
        : `<p class="rating-team-members-empty">История активности пока пуста.</p>`;

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
                    <div class="rating-team-meta-row">
                        <span class="rating-team-meta-label">ЛИГА</span>
                        <span class="rating-team-meta-value">${escapeHtml(team.league ?? "—")}</span>
                    </div>
                    <div class="rating-team-meta-row">
                        <span class="rating-team-meta-label">СПЛОЧЕННОСТЬ</span>
                        <span class="rating-team-meta-value">${escapeHtml(team.cohesion ? `${team.cohesion}/5` : "—")}</span>
                    </div>
                    <div class="rating-team-meta-row">
                        <span class="rating-team-meta-label">БОНУСЫ</span>
                        <span class="rating-team-meta-value">${escapeHtml(String(team.challengeBonus ?? 0))}</span>
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
                    <div class="rating-team-members-list" aria-label="История активности">
                        ${historyHtml}
                    </div>
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

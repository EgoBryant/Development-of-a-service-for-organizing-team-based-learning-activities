import type { TasksKrcTier } from "../types/app";

const KRC_TIERS: Array<{ id: TasksKrcTier; label: string }> = [
    { id: "novice", label: "Новичок" },
    { id: "pro", label: "Профи" },
    { id: "legend", label: "Легенда" }
];

export function renderTasksPageMain(statusHtml: string, activeTier: TasksKrcTier): string {
    const tiersHtml = KRC_TIERS.map((tier) => {
        const isActive = tier.id === activeTier;

        return `
            <button
                type="button"
                class="tasks-krc-option${isActive ? " is-active" : ""}"
                role="radio"
                aria-checked="${isActive}"
                data-tasks-krc-tier="${tier.id}"
            >${tier.label}</button>`;
    }).join("");

    return `
        <section class="profile-main tasks-dashboard-main">
            ${statusHtml}
            <div class="tasks-shell">
                <section class="tasks-krc-card" aria-labelledby="tasksKrcTitle">
                    <h1 class="tasks-krc-title" id="tasksKrcTitle">Командный рейтинговый коэффициент</h1>
                    <div class="tasks-krc-slider tasks-krc-slider--${activeTier}" role="radiogroup" aria-label="Выбор уровня КРК">
                        <span class="tasks-krc-slider-indicator" aria-hidden="true"></span>
                        ${tiersHtml}
                    </div>
                </section>

                <div class="tasks-market-row">
                    <section class="tasks-market-card" aria-label="Биржа знаний">
                        <h2 class="tasks-section-title">Биржа знаний</h2>
                        <button type="button" class="tasks-market-button" disabled aria-disabled="true">Запрос</button>
                    </section>
                </div>

                <section class="tasks-picker-placeholder" aria-label="Выбор задач будет добавлен позже">
                    <span class="tasks-picker-placeholder-label">Место под выбор задач</span>
                </section>

                <section class="tasks-challenge-bar" aria-label="Челленджи">
                    <h2 class="tasks-section-title">Челленджи</h2>
                    <button type="button" class="tasks-challenge-button">Играть</button>
                </section>
            </div>
        </section>`;
}

export function wireTasksPageEvents(root: HTMLElement, onTierSelect: (tier: TasksKrcTier) => void): void {
    root.querySelectorAll<HTMLButtonElement>("[data-tasks-krc-tier]").forEach((button) => {
        button.addEventListener("click", () => {
            const tier = button.dataset.tasksKrcTier;

            if (tier !== "novice" && tier !== "pro" && tier !== "legend") {
                return;
            }

            onTierSelect(tier);
        });
    });
}

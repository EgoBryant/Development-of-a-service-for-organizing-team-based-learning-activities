import type { TasksKrcTier } from "../types/app";
import {
    TASKS_KRC_TIER_LABELS,
    TASKS_KRC_TIER_ORDER,
    TASKS_KRC_TIER_THRESHOLDS,
    computeTasksKrcFillPercent,
    isTasksKrcTierUnlocked
} from "../constants/tasksKrcScale";
import { renderTasksAssignmentFeed, startTasksAssignmentFeed } from "../components/tasks/TasksAssignmentFeed";
import type { AssignmentItem } from "../types/assignment";
import {
    renderTasksAssignmentModal,
    wireTasksAssignmentModal
} from "../components/tasks/TasksAssignmentModal";
import { renderTasksRequestModal } from "../components/modals/TasksRequestModal";
import { renderTasksChallengeModal, wireTasksChallengeModal } from "../components/tasks/TasksChallengeModal";
import { ASSIGNMENT_DISPLAY_TAGS } from "../constants/assignmentTags";
import { tasksFlowState, closeTasksChallengeModal } from "../state/tasksFlowState";
import { escapeHtml } from "../utils/html";

const KRC_TIERS = TASKS_KRC_TIER_ORDER.map((id) => ({
    id,
    label: TASKS_KRC_TIER_LABELS[id].full,
    shortLabel: TASKS_KRC_TIER_LABELS[id].short
}));

const KRC_MOBILE_QUERY = "(max-width: 1024px)";

function wireTasksKrcMarkerSwipe(root: HTMLElement): void {
    if (!window.matchMedia(KRC_MOBILE_QUERY).matches) {
        return;
    }

    const pockets = root.querySelectorAll<HTMLElement>(".tasks-krc-marker-pocket");

    const closeAllRevealed = (): void => {
        root.querySelectorAll<HTMLElement>(".tasks-krc-marker-pocket").forEach((pocket) => {
            pocket.classList.remove("is-revealed");
        });
    };

    const isInsideKrcPocket = (target: Node): boolean =>
        Array.from(pockets).some((pocket) => pocket.contains(target));

    pockets.forEach((pocket) => {
        if (pocket.dataset.krcSwipeWired === "true") {
            return;
        }

        pocket.dataset.krcSwipeWired = "true";

        const target = pocket.querySelector<HTMLElement>(".tasks-krc-option") ?? pocket;
        let startY = 0;
        let startX = 0;
        let trackingSwipe = false;
        let suppressClick = false;

        target.addEventListener("touchstart", (event) => {
            const touch = event.touches[0];
            if (!touch) {
                return;
            }

            startY = touch.clientY;
            startX = touch.clientX;
            trackingSwipe = false;
            suppressClick = false;
        }, { passive: true });

        target.addEventListener("touchmove", (event) => {
            const touch = event.touches[0];
            if (!touch) {
                return;
            }

            const deltaY = touch.clientY - startY;
            const deltaX = touch.clientX - startX;
            if (deltaY > 8 && Math.abs(deltaY) > Math.abs(deltaX)) {
                trackingSwipe = true;
                event.preventDefault();
            }
        }, { passive: false });

        target.addEventListener("touchend", (event) => {
            if (!trackingSwipe) {
                return;
            }

            const touch = event.changedTouches[0];
            if (!touch) {
                return;
            }

            const deltaY = touch.clientY - startY;
            if (deltaY < 22) {
                trackingSwipe = false;
                return;
            }

            const option = pocket.querySelector<HTMLButtonElement>(".tasks-krc-option");
            if (option?.disabled || option?.classList.contains("is-locked")) {
                trackingSwipe = false;
                return;
            }

            event.preventDefault();
            suppressClick = true;
            const wasRevealed = pocket.classList.contains("is-revealed");
            closeAllRevealed();
            if (!wasRevealed) {
                pocket.classList.add("is-revealed");
            }

            trackingSwipe = false;
        });

        target.addEventListener("click", (event) => {
            if (!suppressClick) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            suppressClick = false;
        }, true);
    });

    if (root.dataset.krcSwipeOutsideWired === "true") {
        return;
    }

    root.dataset.krcSwipeOutsideWired = "true";

    const closeRevealedOnOutsideInteraction = (event: Event): void => {
        if (!window.matchMedia(KRC_MOBILE_QUERY).matches) {
            return;
        }

        const target = event.target;
        if (!(target instanceof Node)) {
            return;
        }

        if (isInsideKrcPocket(target)) {
            return;
        }

        closeAllRevealed();
    };

    document.addEventListener("touchstart", closeRevealedOnOutsideInteraction, { passive: true });
    document.addEventListener("click", closeRevealedOnOutsideInteraction);
}

function renderTasksKrcScale(activeTier: TasksKrcTier, userPoints: number): string {
    const fillPercent = computeTasksKrcFillPercent(userPoints);
    const markersHtml = KRC_TIERS.map((tier) => {
        const isActive = tier.id === activeTier;
        const isLocked = !isTasksKrcTierUnlocked(tier.id, userPoints);
        const threshold = TASKS_KRC_TIER_THRESHOLDS[tier.id];
        const optionClass = [
            "tasks-krc-option",
            isActive ? "is-active" : "",
            isLocked ? "is-locked" : ""
        ].filter(Boolean).join(" ");

        return `
            <div class="tasks-krc-marker tasks-krc-marker--${tier.id}${isLocked ? " is-locked" : ""}">
                <div class="tasks-krc-marker-pocket">
                    <div class="tasks-krc-marker-tooltip-wrap" aria-hidden="true">
                        <span class="tasks-krc-marker-tooltip">${threshold}</span>
                    </div>
                    <button
                        type="button"
                        class="${optionClass}"
                        role="radio"
                        aria-checked="${isActive}"
                        aria-disabled="${isLocked}"
                        aria-label="${tier.label}, от ${threshold} баллов"
                        data-tasks-krc-tier="${tier.id}"
                        ${isLocked ? "disabled" : ""}
                    >
                        <span class="tasks-krc-option-label tasks-krc-option-label--full">${tier.label}</span>
                        <span class="tasks-krc-option-label tasks-krc-option-label--short" aria-hidden="true">${tier.shortLabel}</span>
                        <span class="tasks-krc-option-swipe-hint" aria-hidden="true"></span>
                    </button>
                </div>
            </div>`;
    }).join("");

    return `
        <div class="tasks-krc-scale" role="radiogroup" aria-label="Командный рейтинговый коэффициент">
            <div class="tasks-krc-scale-track">
                <div class="tasks-krc-scale-fill" style="width: ${fillPercent.toFixed(2)}%;" aria-hidden="true"></div>
                <div class="tasks-krc-markers">
                    ${markersHtml}
                </div>
            </div>
        </div>`;
}

function renderTasksTagFilterDropdown(): string {
    const isOpen = tasksFlowState.tagFilterDropdownOpen;
    const optionsHtml = ASSIGNMENT_DISPLAY_TAGS.map((tag) => {
        const isChecked = tasksFlowState.activeTagFilters.includes(tag);

        return `
            <label class="tasks-market-filter-option">
                <input
                    type="checkbox"
                    class="tasks-market-filter-checkbox"
                    data-tasks-tag-filter="${escapeHtml(tag)}"
                    ${isChecked ? "checked" : ""}
                >
                <span>${escapeHtml(tag)}</span>
            </label>`;
    }).join("");

    return `
        <div class="tasks-market-filter${isOpen ? " is-open" : ""}" id="tasksMarketFilter">
            <button
                type="button"
                class="tasks-market-button tasks-market-filter-trigger"
                id="tasksMarketFilterButton"
                aria-haspopup="listbox"
                aria-expanded="${isOpen ? "true" : "false"}"
                aria-controls="tasksMarketFilterDropdown"
            >Фильтр</button>
            <div
                class="tasks-market-filter-dropdown"
                id="tasksMarketFilterDropdown"
                role="listbox"
                aria-label="Фильтр по тегам"
                aria-hidden="${isOpen ? "false" : "true"}"
            >
                ${optionsHtml}
            </div>
        </div>`;
}

export function renderTasksPageMain(
    statusHtml: string,
    activeTier: TasksKrcTier,
    userPoints = 0
): string {
    return `
        <section class="profile-main tasks-dashboard-main">
            ${statusHtml}
            <div class="tasks-shell">
                <section class="tasks-krc-card" aria-labelledby="tasksKrcTitle">
                    <h1 class="tasks-krc-title" id="tasksKrcTitle">
                        <span class="tasks-krc-title-full">Командный рейтинговый коэффициент</span>
                        <span class="tasks-krc-title-short" aria-hidden="true">КРК</span>
                    </h1>
                    ${renderTasksKrcScale(activeTier, userPoints)}
                </section>

                <div class="tasks-market-row">
                    <section class="tasks-market-card" aria-label="Биржа знаний">
                        <h2 class="tasks-section-title">Биржа знаний</h2>
                        <div class="tasks-market-actions">
                            <button type="button" class="tasks-market-button" id="tasksMarketRequestButton">Запрос</button>
                            ${renderTasksTagFilterDropdown()}
                        </div>
                    </section>
                </div>

                <section class="tasks-picker-placeholder" aria-label="Лента заданий">
                    ${renderTasksAssignmentFeed()}
                </section>

                <section class="tasks-challenge-bar" aria-label="Челленджи">
                    <h2 class="tasks-section-title">Челленджи</h2>
                    <button type="button" class="tasks-challenge-button" id="tasksChallengePlayButton">Играть</button>
                </section>
            </div>
        </section>`;
}

export function renderTasksPageModals(isSubmitting = false): string {
    const parts: string[] = [];

    if (tasksFlowState.requestModalOpen && tasksFlowState.requestDraft) {
        parts.push(renderTasksRequestModal({
            draft: tasksFlowState.requestDraft,
            isSubmitting
        }));
    }

    if (tasksFlowState.challengeModalOpen) {
        parts.push(renderTasksChallengeModal());
    }

    return parts.join("");
}

export function mountTasksAssignmentModal(root: HTMLElement, onClose?: () => void): void {
    const existing = root.querySelector("#tasksAssignmentModalMount");
    existing?.remove();

    if (!tasksFlowState.selectedAssignment) {
        return;
    }

    const mount = document.createElement("div");
    mount.id = "tasksAssignmentModalMount";
    mount.innerHTML = renderTasksAssignmentModal(tasksFlowState.selectedAssignment);
    root.appendChild(mount);
    wireTasksAssignmentModal(mount, root, onClose);
}

export interface TasksPageEventHandlers {
    onRender: () => void;
    onOpenRequestModal: () => void;
    onOpenChallengeModal: () => void;
}

export function wireTasksPageEvents(
    root: HTMLElement,
    activeTier: TasksKrcTier,
    userPoints: number,
    onTierSelect: (tier: TasksKrcTier) => void,
    onOpenAssignment: (assignment: AssignmentItem) => void,
    token: string | null | undefined,
    handlers?: TasksPageEventHandlers
): void {
    root.querySelectorAll<HTMLButtonElement>("[data-tasks-krc-tier]").forEach((button) => {
        button.addEventListener("click", () => {
            const tier = button.dataset.tasksKrcTier;

            if (tier !== "novice" && tier !== "pro" && tier !== "legend") {
                return;
            }

            if (!isTasksKrcTierUnlocked(tier, userPoints)) {
                return;
            }

            onTierSelect(tier);
        });
    });

    wireTasksKrcMarkerSwipe(root);

    const requestButton = root.querySelector<HTMLButtonElement>("#tasksMarketRequestButton");
    if (requestButton && handlers) {
        requestButton.addEventListener("click", () => {
            handlers.onOpenRequestModal();
        });
    }

    const challengeButton = root.querySelector<HTMLButtonElement>("#tasksChallengePlayButton");
    if (challengeButton && handlers) {
        challengeButton.addEventListener("click", () => {
            handlers.onOpenChallengeModal();
        });
    }

    if (tasksFlowState.challengeModalOpen && handlers) {
        wireTasksChallengeModal(root, {
            onClose: () => {
                closeTasksChallengeModal();
                handlers.onRender();
            },
            onRender: handlers.onRender
        });
    }

    const filterButton = root.querySelector<HTMLButtonElement>("#tasksMarketFilterButton");
    if (filterButton && handlers) {
        filterButton.addEventListener("click", (event) => {
            event.stopPropagation();
            tasksFlowState.tagFilterDropdownOpen = !tasksFlowState.tagFilterDropdownOpen;
            handlers.onRender();
        });
    }

    const filterDropdown = root.querySelector<HTMLElement>("#tasksMarketFilterDropdown");
    filterDropdown?.addEventListener("click", (event) => {
        event.stopPropagation();
    });

    root.querySelectorAll<HTMLInputElement>("[data-tasks-tag-filter]").forEach((checkbox) => {
        checkbox.addEventListener("change", () => {
            const tag = checkbox.dataset.tasksTagFilter ?? "";
            if (!tag) {
                return;
            }

            if (checkbox.checked) {
                if (!tasksFlowState.activeTagFilters.includes(tag)) {
                    tasksFlowState.activeTagFilters.push(tag);
                }
            } else {
                tasksFlowState.activeTagFilters = tasksFlowState.activeTagFilters.filter((item) => item !== tag);
            }

            handlers?.onRender();
        });
    });

    if (tasksFlowState.tagFilterDropdownOpen && handlers) {
        const closeFilterDropdown = (event: Event): void => {
            const target = event.target;
            const filterRoot = root.querySelector("#tasksMarketFilter");
            if (!(target instanceof Node) || filterRoot?.contains(target)) {
                return;
            }

            tasksFlowState.tagFilterDropdownOpen = false;
            document.removeEventListener("click", closeFilterDropdown);
            handlers.onRender();
        };

        window.setTimeout(() => {
            document.addEventListener("click", closeFilterDropdown);
        }, 0);
    }

    if (token) {
        const feedRoot = root.querySelector<HTMLElement>(".tasks-assignment-feed");
        if (feedRoot) {
            startTasksAssignmentFeed(feedRoot, token, activeTier, onOpenAssignment);
        }
    }
}

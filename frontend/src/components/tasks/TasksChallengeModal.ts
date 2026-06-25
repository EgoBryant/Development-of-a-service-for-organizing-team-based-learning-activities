import scrollLeftIconUrl from "../../assets/icons/Scroll_button_left.svg";
import scrollRightIconUrl from "../../assets/icons/Scroll_button_right.svg";
import { getActiveChallenges } from "../../state/challengesState";
import { tasksFlowState } from "../../state/tasksFlowState";
import type { ChallengeItem } from "../../types/challenge";
import { escapeHtml } from "../../utils/html";
import { renderProfileModalShell } from "../profile/ProfileModalShell";

function formatChallengePointsLabel(points: number): string {
    const mod10 = points % 10;
    const mod100 = points % 100;

    if (mod10 === 1 && mod100 !== 11) {
        return `${points} балл`;
    }

    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
        return `${points} балла`;
    }

    return `${points} баллов`;
}

function getActiveChallenge(challenges: ChallengeItem[]): ChallengeItem | null {
    if (challenges.length === 0) {
        return null;
    }

    const index = Math.min(
        Math.max(tasksFlowState.challengeActiveIndex, 0),
        challenges.length - 1
    );

    return challenges[index] ?? null;
}

function renderChallengeSlide(challenge: ChallengeItem): string {
    const description = challenge.description.trim();
    const pointsLabel = formatChallengePointsLabel(challenge.bonusPoints);

    return `
        <div class="tasks-challenge-modal-slide">
            <div class="tasks-challenge-modal-description-box">
                <p class="tasks-challenge-modal-description">${escapeHtml(description)}</p>
            </div>
            <p class="tasks-challenge-modal-points">${escapeHtml(pointsLabel)}</p>
        </div>`;
}

export function renderTasksChallengeModal(): string {
    const challenges = getActiveChallenges();
    const challenge = getActiveChallenge(challenges);
    const activeIndex = challenge
        ? challenges.findIndex((item) => item.id === challenge.id)
        : 0;
    const hasMultiple = challenges.length > 1;
    const canGoPrev = hasMultiple && activeIndex > 0;
    const canGoNext = hasMultiple && activeIndex < challenges.length - 1;

    if (!challenge) {
        return renderProfileModalShell({
            ariaLabel: "Челленджи",
            closeButtonId: "tasksCloseChallengeButton",
            backdropCloseAttr: 'data-close-tasks-challenge-modal="1"',
            extraModalClass: "tasks-challenge-modal",
            extraCardClass: "tasks-challenge-modal-card profile-modal-card--shell",
            bodyHtml: `
                <div class="tasks-challenge-modal-body">
                    <p class="tasks-challenge-modal-empty">Челленджи пока недоступны.</p>
                </div>`
        });
    }

    const navPrevHtml = hasMultiple
        ? `
            <button
                type="button"
                class="tasks-challenge-modal-nav tasks-challenge-modal-nav--prev"
                id="tasksChallengePrevButton"
                aria-label="Предыдущий челлендж"
                ${canGoPrev ? "" : "disabled"}
            >
                <img src="${escapeHtml(scrollLeftIconUrl)}" alt="" aria-hidden="true">
            </button>`
        : "";

    const navNextHtml = hasMultiple
        ? `
            <button
                type="button"
                class="tasks-challenge-modal-nav tasks-challenge-modal-nav--next"
                id="tasksChallengeNextButton"
                aria-label="Следующий челлендж"
                ${canGoNext ? "" : "disabled"}
            >
                <img src="${escapeHtml(scrollRightIconUrl)}" alt="" aria-hidden="true">
            </button>`
        : "";

    return renderProfileModalShell({
        ariaLabel: challenge.title,
        closeButtonId: "tasksCloseChallengeButton",
        backdropCloseAttr: 'data-close-tasks-challenge-modal="1"',
        extraModalClass: "tasks-challenge-modal",
        extraCardClass: "tasks-challenge-modal-card profile-modal-card--shell",
        bodyHtml: `
            <div class="tasks-challenge-modal-body">
                <div class="tasks-challenge-modal-hero profile-achievement-hero profile-achievement-circle--${escapeHtml(challenge.tone)}">
                    <img
                        class="profile-achievement-icon"
                        src="${escapeHtml(challenge.iconUrl)}"
                        alt=""
                        aria-hidden="true"
                    >
                </div>
                <h2 class="tasks-challenge-modal-title">${escapeHtml(challenge.title)}</h2>
                <div class="tasks-challenge-modal-carousel${hasMultiple ? " has-nav" : ""}">
                    ${navPrevHtml}
                    ${renderChallengeSlide(challenge)}
                    ${navNextHtml}
                </div>
                <button type="button" class="tasks-challenge-modal-report" id="tasksChallengeReportButton">
                    Отчёт
                </button>
            </div>`
    });
}

export interface TasksChallengeModalWireOptions {
    onClose: () => void;
    onRender: () => void;
    onReport?: () => void;
}

export function wireTasksChallengeModal(
    root: HTMLElement,
    options: TasksChallengeModalWireOptions
): void {
    if (!tasksFlowState.challengeModalOpen) {
        return;
    }

    const { onClose, onRender, onReport } = options;
    const challenges = getActiveChallenges();

    root.querySelectorAll<HTMLElement>('[data-close-tasks-challenge-modal="1"]').forEach((node) => {
        node.addEventListener("click", onClose);
    });

    const closeButton = root.querySelector("#tasksCloseChallengeButton");
    if (closeButton instanceof HTMLButtonElement) {
        closeButton.addEventListener("click", onClose);
    }

    const prevButton = root.querySelector("#tasksChallengePrevButton");
    if (prevButton instanceof HTMLButtonElement) {
        prevButton.addEventListener("click", () => {
            if (tasksFlowState.challengeActiveIndex <= 0) {
                return;
            }

            tasksFlowState.challengeActiveIndex -= 1;
            onRender();
        });
    }

    const nextButton = root.querySelector("#tasksChallengeNextButton");
    if (nextButton instanceof HTMLButtonElement) {
        nextButton.addEventListener("click", () => {
            if (tasksFlowState.challengeActiveIndex >= challenges.length - 1) {
                return;
            }

            tasksFlowState.challengeActiveIndex += 1;
            onRender();
        });
    }

    const reportButton = root.querySelector("#tasksChallengeReportButton");
    if (reportButton instanceof HTMLButtonElement) {
        reportButton.addEventListener("click", () => {
            if (onReport) {
                onReport();
                return;
            }

            onClose();
        });
    }
}

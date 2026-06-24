import checkInEventsIconUrl from "../../assets/icons/Check-in_events.svg";
import checkInSosIconUrl from "../../assets/icons/Check-in_SOS.svg";
import kpkMobileIconUrl from "../../assets/icons/КРК_mobile.svg";
import { teamFlowState } from "../../state/teamFlowState";
import {
    CHECK_IN_SLIDER_CONFIG,
    buildCheckInReportPayload,
    syncCheckInSliderVisuals,
    updateCheckInSliderVisual
} from "../../utils/checkInFormUi";
import {
    getCheckInWeeklyStatsDisplayOrder,
    type CheckInWeeklyStats
} from "../../utils/checkInWeeklyStats";
import { escapeHtml } from "../../utils/html";
import {
    isHTMLFormElement,
    isHTMLInputElement
} from "../../utils/dom";

export interface TeamCheckInModalRenderOptions {
    weekNumber: number;
    weeklyStats: CheckInWeeklyStats;
    errorHtml: string;
}

function getPodiumIconUrl(slot: "second" | "first" | "third"): string {
    if (slot === "second") {
        return checkInSosIconUrl;
    }

    if (slot === "third") {
        return checkInEventsIconUrl;
    }

    return kpkMobileIconUrl;
}

function renderPodiumStatSlot(slot: "second" | "first" | "third", value: number): string {
    const iconUrl = getPodiumIconUrl(slot);

    return `
        <div class="team-checkin-podium-slot team-checkin-podium-slot--${slot}">
            <div class="team-checkin-podium-circle" aria-hidden="true">
                <img class="team-checkin-podium-icon" src="${escapeHtml(iconUrl)}" alt="" aria-hidden="true">
            </div>
            <div class="team-checkin-podium-score">${escapeHtml(String(value))}</div>
        </div>`;
}

function renderCheckInSliders(): string {
    const values = {
        productivity: teamFlowState.checkInProductivity,
        communication: teamFlowState.checkInCommunication,
        satisfaction: teamFlowState.checkInSatisfaction
    };

    return CHECK_IN_SLIDER_CONFIG.map(({ key, label, inputId }) => {
        const numericValue = values[key];

        return `
            <label class="team-checkin-slider" for="${inputId}">
                <div class="team-checkin-slider-track${numericValue > 0 ? " is-filled" : ""}" style="--checkin-slider-value: ${numericValue}%;">
                    <span class="team-checkin-slider-label">${escapeHtml(label)}</span>
                    <span class="team-checkin-slider-fill" aria-hidden="true"></span>
                    <input
                        type="range"
                        class="team-checkin-slider-input"
                        id="${inputId}"
                        min="0"
                        max="100"
                        step="1"
                        value="${numericValue}"
                        data-checkin-slider="${key}"
                    >
                </div>
            </label>`;
    }).join("");
}

export function renderTeamCheckInModal(options: TeamCheckInModalRenderOptions): string {
    const { weekNumber, weeklyStats, errorHtml } = options;
    const podiumHtml = getCheckInWeeklyStatsDisplayOrder(weeklyStats)
        .map(({ slot, value }) => renderPodiumStatSlot(slot, value))
        .join("");

    return `
        <div class="profile-modal profile-modal--shell team-overlay-modal team-rescue-modal team-checkin-modal" role="dialog" aria-modal="true" aria-label="Как прошла ваша неделя?">
            <div class="profile-modal-backdrop team-rescue-backdrop" data-close-team-modal="1"></div>
            <div class="profile-modal-card team-rescue-card team-checkin-card team-rescue-card--team-page">
                <button type="button" class="team-rescue-close" id="teamCloseCheckInButton" aria-label="Закрыть"></button>
                <p class="team-rescue-purpose team-checkin-purpose">Как прошла ваша неделя?</p>
                <h2 class="team-rescue-title team-rescue-title--sr">Как прошла ваша неделя?</h2>
                <form id="teamCheckInForm" class="team-rescue-form team-rescue-form--team-page team-checkin-form" novalidate>
                    <input type="hidden" id="teamCheckInWeekInput" value="${weekNumber}">
                    <div class="team-checkin-podium" aria-label="Статистика команды за текущую неделю">
                        ${podiumHtml}
                    </div>
                    <div class="team-checkin-sliders">
                        ${renderCheckInSliders()}
                    </div>
                    <div class="team-checkin-textarea-wrap">
                        <textarea
                            id="teamCheckInReportInput"
                            class="team-rescue-textarea team-rescue-textarea--description team-checkin-textarea"
                            placeholder="Расскажи о главных инсайтах или трудностях команды за эту неделю"
                            aria-label="Расскажи о главных инсайтах или трудностях команды за эту неделю"
                            rows="3"
                        >${escapeHtml(teamFlowState.checkInReport)}</textarea>
                    </div>
                    ${errorHtml}
                    <button type="submit" class="team-rescue-submit team-rescue-submit--wide">ОТПРАВИТЬ</button>
                </form>
            </div>
        </div>`;
}

export interface TeamCheckInModalWireOptions {
    onClose: () => void;
    onRender: () => void;
    onSubmit: (payload: { weekNumber: number; reportText: string }) => void | Promise<void>;
}

export function wireTeamCheckInModal(profileMount: HTMLElement, options: TeamCheckInModalWireOptions): void {
    const { onClose, onRender, onSubmit } = options;

    const closeButton = profileMount.querySelector("#teamCloseCheckInButton");
    if (closeButton instanceof HTMLButtonElement) {
        closeButton.addEventListener("click", onClose);
    }

    profileMount.querySelectorAll<HTMLInputElement>(".team-checkin-slider-input").forEach((input) => {
        const syncSlider = (): void => {
            const value = Number(input.value);
            const normalized = Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;
            const key = input.dataset.checkinSlider;

            if (key === "productivity") {
                teamFlowState.checkInProductivity = normalized;
            } else if (key === "communication") {
                teamFlowState.checkInCommunication = normalized;
            } else if (key === "satisfaction") {
                teamFlowState.checkInSatisfaction = normalized;
            }

            updateCheckInSliderVisual(input);
        };

        input.addEventListener("input", syncSlider);
        syncSlider();
    });

    if (typeof ResizeObserver !== "undefined") {
        const slidersRoot = profileMount.querySelector(".team-checkin-sliders");
        if (slidersRoot instanceof HTMLElement) {
            const resizeObserver = new ResizeObserver(() => {
                syncCheckInSliderVisuals(slidersRoot);
            });
            resizeObserver.observe(slidersRoot);
        }
    } else {
        syncCheckInSliderVisuals(profileMount);
    }

    const reportInput = profileMount.querySelector("#teamCheckInReportInput");
    if (reportInput instanceof HTMLTextAreaElement) {
        reportInput.addEventListener("input", () => {
            teamFlowState.checkInReport = reportInput.value;
            teamFlowState.checkInError = "";
        });
    }

    const form = profileMount.querySelector("#teamCheckInForm");
    if (!isHTMLFormElement(form)) {
        return;
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const weekInput = profileMount.querySelector("#teamCheckInWeekInput");
        const week = Number(isHTMLInputElement(weekInput) ? weekInput.value : teamFlowState.checkInWeek);
        const report = reportInput instanceof HTMLTextAreaElement
            ? reportInput.value.trim()
            : teamFlowState.checkInReport.trim();

        if (!Number.isInteger(week) || week < 1 || week > 52) {
            teamFlowState.checkInError = "Не удалось определить номер недели.";
            onRender();
            return;
        }

        if (!report) {
            teamFlowState.checkInError = "ЗАПОЛНИ ТЕКСТ СООБЩЕНИЯ";
            onRender();
            return;
        }

        const reportText = buildCheckInReportPayload(
            report,
            teamFlowState.checkInProductivity,
            teamFlowState.checkInCommunication,
            teamFlowState.checkInSatisfaction
        );

        void onSubmit({ weekNumber: week, reportText });
    });
}

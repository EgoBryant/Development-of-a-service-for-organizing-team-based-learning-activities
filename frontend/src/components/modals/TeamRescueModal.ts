import { RESCUE_LEAGUE_OPTIONS } from "../../constants/rescueLeagues";
import { RESCUE_TAG_OPTIONS, getRescueTagButtonLabel } from "../../constants/rescueTags";
import { teamFlowState } from "../../state/teamFlowState";
import type { TeamRescueAttachment, TeamRescueDraft } from "../../types/team";
import {
    appendRescueAttachments,
    buildRescueCalendarCells,
    canShiftRescueCalendarMonth,
    formatRescueAttachmentCount,
    getRescueCalendarMonthKey,
    getRescueCalendarTitle,
    getRescueCalendarWeekdayLabels,
    getRescueDeadlineButtonLabel,
    getRescueLeagueButtonLabel,
    removeRescueAttachment,
    shiftRescueCalendarMonthKey,
    syncRescueDescriptionHeight
} from "../../utils/rescueFormUi";
import { escapeHtml } from "../../utils/html";
import {
    isHTMLButtonElement,
    isHTMLFormElement,
    isHTMLInputElement
} from "../../utils/dom";

export interface TeamRescueModalRenderOptions {
    draft: TeamRescueDraft;
    targetOptionsHtml: string;
}

function renderRescueCalendarPopup(selectedIsoDate: string): string {
    const monthKey = teamFlowState.rescueCalendarMonthKey;
    const title = getRescueCalendarTitle(monthKey);
    const canGoPrev = canShiftRescueCalendarMonth(monthKey, -1);
    const weekdayLabels = getRescueCalendarWeekdayLabels()
        .map((label) => `<span class="team-rescue-calendar-weekday">${escapeHtml(label)}</span>`)
        .join("");
    const dayCells = buildRescueCalendarCells(monthKey, selectedIsoDate)
        .map((cell) => {
            const classNames = [
                "team-rescue-calendar-day",
                cell.isCurrentMonth ? "is-current-month" : "is-outside-month",
                cell.isToday ? "is-today" : "",
                cell.isSelected ? "is-selected" : "",
                cell.isPast ? "is-past" : ""
            ]
                .filter(Boolean)
                .join(" ");

            return `
                <button
                    type="button"
                    class="${classNames}"
                    data-rescue-calendar-day="${escapeHtml(cell.isoDate)}"
                    ${cell.isPast ? "disabled aria-disabled=\"true\"" : ""}
                >${cell.day}</button>`;
        })
        .join("");

    return `
        <div class="team-rescue-calendar-popup" id="teamRescueCalendarPopup">
            <div class="team-rescue-calendar-head">
                <button
                    type="button"
                    class="team-rescue-calendar-nav"
                    data-rescue-calendar-shift="-1"
                    aria-label="Предыдущий месяц"
                    ${canGoPrev ? "" : "disabled aria-disabled=\"true\""}
                >‹</button>
                <span class="team-rescue-calendar-title">${escapeHtml(title)}</span>
                <button type="button" class="team-rescue-calendar-nav" data-rescue-calendar-shift="1" aria-label="Следующий месяц">›</button>
            </div>
            <div class="team-rescue-calendar-weekdays">${weekdayLabels}</div>
            <div class="team-rescue-calendar-grid">${dayCells}</div>
        </div>`;
}

function updateRescueCalendarPopup(profileMount: HTMLElement, selectedIsoDate: string): void {
    const picker = profileMount.querySelector("#teamRescueDeadlinePicker");
    const existingPopup = profileMount.querySelector("#teamRescueCalendarPopup");
    if (!picker) {
        return;
    }

    const wrap = document.createElement("div");
    wrap.innerHTML = renderRescueCalendarPopup(selectedIsoDate);
    const nextPopup = wrap.firstElementChild;
    if (!nextPopup) {
        return;
    }

    if (existingPopup) {
        existingPopup.replaceWith(nextPopup);
        return;
    }

    picker.appendChild(nextPopup);
}

function closeRescueDeadlineCalendar(profileMount: HTMLElement): void {
    teamFlowState.rescueDeadlineCalendarOpen = false;
    const picker = profileMount.querySelector("#teamRescueDeadlinePicker");
    const trigger = profileMount.querySelector("#teamRescueDeadlineTrigger");
    picker?.classList.remove("is-open");
    if (isHTMLButtonElement(trigger)) {
        trigger.setAttribute("aria-expanded", "false");
    }
    profileMount.querySelector("#teamRescueCalendarPopup")?.remove();
}

let activeRescueOutsideClickHandler: ((event: Event) => void) | null = null;

function unbindRescueOutsideClick(): void {
    if (!activeRescueOutsideClickHandler) {
        return;
    }

    document.removeEventListener("click", activeRescueOutsideClickHandler);
    activeRescueOutsideClickHandler = null;
}

function bindRescueOutsideClick(profileMount: HTMLElement, onRender: () => void): void {
    unbindRescueOutsideClick();

    activeRescueOutsideClickHandler = (event: Event): void => {
        const targetNode = event.target;
        if (!(targetNode instanceof Node)) {
            return;
        }

        const leagueDropdown = profileMount.querySelector("#teamRescueLeagueDropdown");
        const tagDropdown = profileMount.querySelector("#teamRescueTagDropdown");
        const deadlinePicker = profileMount.querySelector("#teamRescueDeadlinePicker");
        if (
            leagueDropdown?.contains(targetNode) ||
            tagDropdown?.contains(targetNode) ||
            deadlinePicker?.contains(targetNode)
        ) {
            return;
        }

        const hadLeagueOpen = teamFlowState.rescueLeagueDropdownOpen;
        const hadTagOpen = teamFlowState.rescueTagDropdownOpen;
        teamFlowState.rescueLeagueDropdownOpen = false;
        teamFlowState.rescueTagDropdownOpen = false;
        teamFlowState.rescueDeadlineCalendarOpen = false;
        unbindRescueOutsideClick();
        closeRescueDeadlineCalendar(profileMount);

        if (hadLeagueOpen || hadTagOpen) {
            onRender();
        }
    };

    window.setTimeout(() => {
        if (activeRescueOutsideClickHandler) {
            document.addEventListener("click", activeRescueOutsideClickHandler);
        }
    }, 0);
}

function applyRescueDeadlineSelection(
    profileMount: HTMLElement,
    draft: TeamRescueDraft,
    isoDate: string
): void {
    draft.deadline = isoDate;
    const deadlineValueInput = profileMount.querySelector("#teamRescueDeadlineValue");
    if (isHTMLInputElement(deadlineValueInput)) {
        deadlineValueInput.value = isoDate;
    }

    const trigger = profileMount.querySelector("#teamRescueDeadlineTrigger");
    if (isHTMLButtonElement(trigger)) {
        trigger.textContent = getRescueDeadlineButtonLabel(isoDate);
    }

    closeRescueDeadlineCalendar(profileMount);
    unbindRescueOutsideClick();
}

function wireRescueDeadlinePicker(
    profileMount: HTMLElement,
    draft: TeamRescueDraft
): void {
    const deadlinePicker = profileMount.querySelector("#teamRescueDeadlinePicker");
    if (!(deadlinePicker instanceof HTMLElement)) {
        return;
    }

    deadlinePicker.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof Element)) {
            return;
        }

        const shiftButton = target.closest<HTMLButtonElement>("[data-rescue-calendar-shift]");
        if (shiftButton && !shiftButton.disabled) {
            event.preventDefault();
            event.stopPropagation();
            const delta = Number(shiftButton.dataset.rescueCalendarShift ?? "0");
            if (!Number.isFinite(delta) || delta === 0) {
                return;
            }

            if (!canShiftRescueCalendarMonth(teamFlowState.rescueCalendarMonthKey, delta)) {
                return;
            }

            teamFlowState.rescueCalendarMonthKey = shiftRescueCalendarMonthKey(
                teamFlowState.rescueCalendarMonthKey,
                delta
            );
            updateRescueCalendarPopup(profileMount, draft.deadline);
            return;
        }

        const dayButton = target.closest<HTMLButtonElement>("[data-rescue-calendar-day]");
        if (dayButton && !dayButton.disabled) {
            event.preventDefault();
            event.stopPropagation();
            const isoDate = dayButton.dataset.rescueCalendarDay ?? "";
            if (!isoDate) {
                return;
            }

            applyRescueDeadlineSelection(profileMount, draft, isoDate);
        }
    });
}

function renderRescueTagDropdown(selectedTag: string): string {
    const isOpen = teamFlowState.rescueTagDropdownOpen;
    const options = RESCUE_TAG_OPTIONS.map((option) => {
        const isActive = option.value === selectedTag.trim().toLowerCase();
        return `
            <button
                type="button"
                class="team-rescue-dropdown-option${isActive ? " is-active" : ""}"
                data-rescue-tag-value="${escapeHtml(option.value)}"
            >${escapeHtml(option.label)}</button>`;
    }).join("");

    return `
        <div class="team-rescue-dropdown team-rescue-dropdown--tag team-rescue-dropdown--down${isOpen ? " is-open" : ""}" id="teamRescueTagDropdown">
            <button
                type="button"
                class="team-rescue-control-btn team-rescue-tag-trigger"
                id="teamRescueTagTrigger"
                aria-expanded="${isOpen ? "true" : "false"}"
            ><span class="team-rescue-tag-trigger-label">${escapeHtml(getRescueTagButtonLabel(selectedTag))}</span></button>
            <div class="team-rescue-dropdown-menu">${options}</div>
        </div>`;
}

function renderRescueNameRow(topic: string, tag: string): string {
    return `
        <div class="team-rescue-name-row">
            <input
                id="teamRescueTopicInput"
                class="team-rescue-field team-rescue-field--name"
                type="text"
                placeholder="Название"
                value="${escapeHtml(topic)}"
                autocomplete="off"
            >
            ${renderRescueTagDropdown(tag)}
        </div>`;
}

function renderRescueLeagueDropdown(selectedLeague: string): string {
    const isOpen = teamFlowState.rescueLeagueDropdownOpen;
    const options = RESCUE_LEAGUE_OPTIONS.map((option) => {
        const isActive = option.value === selectedLeague.trim().toLowerCase();
        return `
            <button
                type="button"
                class="team-rescue-dropdown-option${isActive ? " is-active" : ""}"
                data-rescue-league-value="${escapeHtml(option.value)}"
            >${escapeHtml(option.displayLabel)}</button>`;
    }).join("");

    return `
        <div class="team-rescue-dropdown team-rescue-dropdown--up${isOpen ? " is-open" : ""}" id="teamRescueLeagueDropdown">
            <button
                type="button"
                class="team-rescue-control-btn team-rescue-dropdown-trigger"
                id="teamRescueLeagueTrigger"
                aria-expanded="${isOpen ? "true" : "false"}"
            >${escapeHtml(getRescueLeagueButtonLabel(selectedLeague))}</button>
            <div class="team-rescue-dropdown-menu">${options}</div>
        </div>`;
}

function renderRescueDeadlinePicker(selectedIsoDate: string): string {
    const isOpen = teamFlowState.rescueDeadlineCalendarOpen;
    const calendarHtml = isOpen ? renderRescueCalendarPopup(selectedIsoDate) : "";

    return `
        <div class="team-rescue-datepicker${isOpen ? " is-open" : ""}" id="teamRescueDeadlinePicker">
            <button
                type="button"
                class="team-rescue-control-btn team-rescue-datepicker-trigger"
                id="teamRescueDeadlineTrigger"
                aria-expanded="${isOpen ? "true" : "false"}"
            >${escapeHtml(getRescueDeadlineButtonLabel(selectedIsoDate))}</button>
            ${calendarHtml}
        </div>`;
}

function renderRescueAttachmentsBlock(attachments: TeamRescueAttachment[]): string {
    const countLabel = formatRescueAttachmentCount(attachments.length);
    const listItems = attachments
        .map(
            (attachment) => `
            <li class="team-rescue-attachment-item">
                <span class="team-rescue-attachment-name" title="${escapeHtml(attachment.name)}">${escapeHtml(attachment.name)}</span>
                <button
                    type="button"
                    class="team-rescue-attachment-remove"
                    data-rescue-remove-attachment="${escapeHtml(attachment.id)}"
                    aria-label="Удалить файл ${escapeHtml(attachment.name)}"
                >×</button>
            </li>`
        )
        .join("");

    const listHtml = attachments.length > 0
        ? `<ul class="team-rescue-attachments-list">${listItems}</ul>`
        : "";

    return `
        <div class="team-rescue-attachments-list-wrap" id="teamRescueAttachmentsListWrap">
            <p class="team-rescue-attachments-count" id="teamRescueAttachmentsCount">${escapeHtml(countLabel)}</p>
            ${listHtml}
        </div>`;
}

export function renderTeamRescueModal(options: TeamRescueModalRenderOptions): string {
    const { draft, targetOptionsHtml } = options;
    const attachmentsBlock = renderRescueAttachmentsBlock(draft.attachments);

    return `
        <div class="profile-modal profile-modal--shell team-overlay-modal team-rescue-modal" role="dialog" aria-modal="true" aria-label="Спасение">
            <div class="profile-modal-backdrop team-rescue-backdrop" data-close-team-modal="1"></div>
            <div class="profile-modal-card team-rescue-card team-rescue-card--team-page">
                <button type="button" class="team-rescue-close" id="teamCloseRescueButton" aria-label="Закрыть"></button>
                <p class="team-rescue-purpose">СПАСЕНИЕ</p>
                <h2 class="team-rescue-title team-rescue-title--sr">Спасение</h2>
                <form id="teamRescueForm" class="team-rescue-form team-rescue-form--team-page" novalidate>
                    <select id="teamRescueTargetInput" class="team-rescue-field team-rescue-field--team team-rescue-select team-rescue-field--hidden" aria-hidden="true" tabindex="-1">
                        <option value="">КОМАНДА-ПОЛУЧАТЕЛЬ</option>
                        ${targetOptionsHtml}
                    </select>
                    <input type="hidden" id="teamRescueLeagueValue" value="${escapeHtml(draft.league)}">
                    <input type="hidden" id="teamRescueTagValue" value="${escapeHtml(draft.tag)}">
                    <input type="hidden" id="teamRescueDeadlineValue" value="${escapeHtml(draft.deadline)}">
                    ${renderRescueNameRow(draft.topic, draft.tag)}
                    <textarea
                        id="teamRescueDescriptionInput"
                        class="team-rescue-textarea team-rescue-textarea--description"
                        placeholder="Опишите свою проблему"
                        aria-label="Описание проблемы"
                        rows="1"
                    >${escapeHtml(draft.description)}</textarea>
                    <div class="team-rescue-attachments-row">
                        ${attachmentsBlock}
                        <label class="team-rescue-control-btn team-rescue-file-btn">
                            ВЫБРАТЬ
                            <input
                                type="file"
                                id="teamRescuePhotoInput"
                                class="team-rescue-file"
                                accept="image/*,.pdf,.txt,.doc,.docx,.zip,.js,.ts,.py,.java,.cpp,.c,.html,.css,.json,.md"
                                multiple
                                hidden
                            >
                        </label>
                    </div>
                    <div class="team-rescue-duo-row">
                        ${renderRescueLeagueDropdown(draft.league)}
                        ${renderRescueDeadlinePicker(draft.deadline)}
                    </div>
                    <button type="submit" class="team-rescue-submit team-rescue-submit--wide">ОТПРАВИТЬ</button>
                </form>
            </div>
        </div>`;
}

export interface TeamRescueModalWireOptions {
    draft: TeamRescueDraft;
    onClose: () => void;
    onRender: () => void;
    onSubmit: (draft: TeamRescueDraft) => void | Promise<void>;
    syncDraftFromForm: () => void;
}

export function wireTeamRescueModal(profileMount: HTMLElement, options: TeamRescueModalWireOptions): void {
    const { draft, onClose, onRender, onSubmit, syncDraftFromForm } = options;

    const teamCloseRescue = profileMount.querySelector("#teamCloseRescueButton");
    if (isHTMLButtonElement(teamCloseRescue)) {
        teamCloseRescue.addEventListener("click", () => {
            syncDraftFromForm();
            onClose();
        });
    }

    const topic = profileMount.querySelector("#teamRescueTopicInput");
    const description = profileMount.querySelector("#teamRescueDescriptionInput");
    const target = profileMount.querySelector("#teamRescueTargetInput");
    const leagueValueInput = profileMount.querySelector("#teamRescueLeagueValue");
    const tagValueInput = profileMount.querySelector("#teamRescueTagValue");
    const deadlineValueInput = profileMount.querySelector("#teamRescueDeadlineValue");
    const photoInput = profileMount.querySelector("#teamRescuePhotoInput");
    const rescueForm = profileMount.querySelector("#teamRescueForm");
    const leagueTrigger = profileMount.querySelector("#teamRescueLeagueTrigger");
    const tagTrigger = profileMount.querySelector("#teamRescueTagTrigger");
    const deadlineTrigger = profileMount.querySelector("#teamRescueDeadlineTrigger");

    if (isHTMLInputElement(topic)) {
        topic.addEventListener("input", () => {
            draft.topic = topic.value;
        });
    }

    if (description instanceof HTMLTextAreaElement) {
        const syncDescription = (): void => {
            draft.description = description.value;
            syncRescueDescriptionHeight(description);
        };
        syncDescription();
        description.addEventListener("input", syncDescription);
    }

    if (target instanceof HTMLSelectElement) {
        target.addEventListener("change", () => {
            draft.targetTeamId = target.value;
        });
    }

    if (isHTMLInputElement(photoInput)) {
        photoInput.addEventListener("change", () => {
            const selectedFiles = photoInput.files;
            if (!selectedFiles || selectedFiles.length === 0) {
                return;
            }

            draft.attachments = appendRescueAttachments(draft.attachments, selectedFiles);
            photoInput.value = "";
            onRender();
        });
    }

    profileMount.querySelectorAll<HTMLButtonElement>("[data-rescue-remove-attachment]").forEach((button) => {
        button.addEventListener("click", (event) => {
            event.stopPropagation();
            const attachmentId = button.dataset.rescueRemoveAttachment ?? "";
            if (!attachmentId) {
                return;
            }

            draft.attachments = removeRescueAttachment(draft.attachments, attachmentId);
            onRender();
        });
    });

    if (isHTMLButtonElement(leagueTrigger)) {
        leagueTrigger.addEventListener("click", (event) => {
            event.stopPropagation();
            closeRescueDeadlineCalendar(profileMount);
            teamFlowState.rescueTagDropdownOpen = false;
            teamFlowState.rescueLeagueDropdownOpen = !teamFlowState.rescueLeagueDropdownOpen;
            onRender();
        });
    }

    if (isHTMLButtonElement(tagTrigger)) {
        tagTrigger.addEventListener("click", (event) => {
            event.stopPropagation();
            closeRescueDeadlineCalendar(profileMount);
            teamFlowState.rescueLeagueDropdownOpen = false;
            teamFlowState.rescueTagDropdownOpen = !teamFlowState.rescueTagDropdownOpen;
            onRender();
        });
    }

    profileMount.querySelectorAll<HTMLButtonElement>("[data-rescue-tag-value]").forEach((button) => {
        button.addEventListener("click", (event) => {
            event.stopPropagation();
            draft.tag = button.dataset.rescueTagValue ?? "";
            if (isHTMLInputElement(tagValueInput)) {
                tagValueInput.value = draft.tag;
            }
            teamFlowState.rescueTagDropdownOpen = false;
            onRender();
        });
    });

    profileMount.querySelectorAll<HTMLButtonElement>("[data-rescue-league-value]").forEach((button) => {
        button.addEventListener("click", (event) => {
            event.stopPropagation();
            draft.league = button.dataset.rescueLeagueValue ?? "";
            if (isHTMLInputElement(leagueValueInput)) {
                leagueValueInput.value = draft.league;
            }
            teamFlowState.rescueLeagueDropdownOpen = false;
            onRender();
        });
    });

    if (isHTMLButtonElement(deadlineTrigger)) {
        deadlineTrigger.addEventListener("click", (event) => {
            event.stopPropagation();
            teamFlowState.rescueLeagueDropdownOpen = false;
            teamFlowState.rescueTagDropdownOpen = false;

            if (teamFlowState.rescueDeadlineCalendarOpen) {
                closeRescueDeadlineCalendar(profileMount);
                unbindRescueOutsideClick();
                return;
            }

            teamFlowState.rescueDeadlineCalendarOpen = true;
            teamFlowState.rescueCalendarMonthKey = draft.deadline.trim()
                ? draft.deadline.slice(0, 7)
                : getRescueCalendarMonthKey();

            const picker = profileMount.querySelector("#teamRescueDeadlinePicker");
            const trigger = profileMount.querySelector("#teamRescueDeadlineTrigger");
            picker?.classList.add("is-open");
            if (isHTMLButtonElement(trigger)) {
                trigger.setAttribute("aria-expanded", "true");
            }
            updateRescueCalendarPopup(profileMount, draft.deadline);
            bindRescueOutsideClick(profileMount, onRender);
        });
    }

    wireRescueDeadlinePicker(profileMount, draft);

    if (teamFlowState.rescueLeagueDropdownOpen || teamFlowState.rescueTagDropdownOpen || teamFlowState.rescueDeadlineCalendarOpen) {
        bindRescueOutsideClick(profileMount, onRender);
    }

    if (isHTMLFormElement(rescueForm)) {
        rescueForm.addEventListener("submit", (event) => {
            event.preventDefault();
            syncDraftFromForm();

            if (!draft.topic.trim()) {
                onRender();
                return;
            }

            if (!draft.description.trim()) {
                onRender();
                return;
            }

            void Promise.resolve(onSubmit({ ...draft }));
        });
    }
}

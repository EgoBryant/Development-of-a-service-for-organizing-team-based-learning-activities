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
import {
    readRescueDraftFromMount,
    TEAM_RESCUE_DOM_IDS,
    TASKS_REQUEST_DOM_IDS,
    type RescueFormDomIds
} from "./rescueFormDom";

export { TEAM_RESCUE_DOM_IDS, TASKS_REQUEST_DOM_IDS, readRescueDraftFromMount };

export interface RescueFormModalRenderOptions {
    draft: TeamRescueDraft;
    targetOptionsHtml?: string;
    isSubmitting?: boolean;
    domIds?: RescueFormDomIds;
    purposeLabel?: string;
    modalAriaLabel?: string;
    backdropCloseAttr?: string;
    includeTargetTeam?: boolean;
}

export interface RescueFormModalWireOptions {
    draft: TeamRescueDraft;
    onClose: () => void;
    onRender: () => void;
    onSubmit: (draft: TeamRescueDraft) => void | Promise<void>;
    syncDraftFromForm: () => void;
    isSubmitting?: boolean;
    domIds?: RescueFormDomIds;
}

function renderRescueCalendarPopup(selectedIsoDate: string, calendarPopupId: string): string {
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
        <div class="team-rescue-calendar-popup" id="${calendarPopupId}">
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

function updateRescueCalendarPopup(
    profileMount: HTMLElement,
    selectedIsoDate: string,
    ids: RescueFormDomIds
): void {
    const picker = profileMount.querySelector(`#${ids.deadlinePicker}`);
    const existingPopup = profileMount.querySelector(`#${ids.calendarPopup}`);
    if (!picker) {
        return;
    }

    const wrap = document.createElement("div");
    wrap.innerHTML = renderRescueCalendarPopup(selectedIsoDate, ids.calendarPopup);
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

function closeRescueDeadlineCalendar(profileMount: HTMLElement, ids: RescueFormDomIds): void {
    teamFlowState.rescueDeadlineCalendarOpen = false;
    const picker = profileMount.querySelector(`#${ids.deadlinePicker}`);
    const trigger = profileMount.querySelector(`#${ids.deadlineTrigger}`);
    picker?.classList.remove("is-open");
    if (isHTMLButtonElement(trigger)) {
        trigger.setAttribute("aria-expanded", "false");
    }
    profileMount.querySelector(`#${ids.calendarPopup}`)?.remove();
}

let activeRescueOutsideClickHandler: ((event: Event) => void) | null = null;

function unbindRescueOutsideClick(): void {
    if (!activeRescueOutsideClickHandler) {
        return;
    }

    document.removeEventListener("click", activeRescueOutsideClickHandler);
    activeRescueOutsideClickHandler = null;
}

function bindRescueOutsideClick(
    profileMount: HTMLElement,
    ids: RescueFormDomIds,
    onRender: () => void
): void {
    unbindRescueOutsideClick();

    activeRescueOutsideClickHandler = (event: Event): void => {
        const targetNode = event.target;
        if (!(targetNode instanceof Node)) {
            return;
        }

        const leagueDropdown = profileMount.querySelector(`#${ids.leagueDropdown}`);
        const tagDropdown = profileMount.querySelector(`#${ids.tagDropdown}`);
        const deadlinePicker = profileMount.querySelector(`#${ids.deadlinePicker}`);
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
        closeRescueDeadlineCalendar(profileMount, ids);

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
    isoDate: string,
    ids: RescueFormDomIds
): void {
    draft.deadline = isoDate;
    const deadlineValueInput = profileMount.querySelector(`#${ids.deadlineValue}`);
    if (isHTMLInputElement(deadlineValueInput)) {
        deadlineValueInput.value = isoDate;
    }

    const trigger = profileMount.querySelector(`#${ids.deadlineTrigger}`);
    if (isHTMLButtonElement(trigger)) {
        trigger.textContent = getRescueDeadlineButtonLabel(isoDate);
    }

    closeRescueDeadlineCalendar(profileMount, ids);
    unbindRescueOutsideClick();
}

function wireRescueDeadlinePicker(
    profileMount: HTMLElement,
    draft: TeamRescueDraft,
    ids: RescueFormDomIds
): void {
    const deadlinePicker = profileMount.querySelector(`#${ids.deadlinePicker}`);
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
            updateRescueCalendarPopup(profileMount, draft.deadline, ids);
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

            applyRescueDeadlineSelection(profileMount, draft, isoDate, ids);
        }
    });
}

function renderRescueTagDropdown(selectedTag: string, ids: RescueFormDomIds): string {
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
        <div class="team-rescue-dropdown team-rescue-dropdown--tag team-rescue-dropdown--down${isOpen ? " is-open" : ""}" id="${ids.tagDropdown}">
            <button
                type="button"
                class="team-rescue-control-btn team-rescue-tag-trigger"
                id="${ids.tagTrigger}"
                aria-expanded="${isOpen ? "true" : "false"}"
            ><span class="team-rescue-tag-trigger-label">${escapeHtml(getRescueTagButtonLabel(selectedTag))}</span></button>
            <div class="team-rescue-dropdown-menu">${options}</div>
        </div>`;
}

function renderRescueNameRow(topic: string, tag: string, ids: RescueFormDomIds): string {
    return `
        <div class="team-rescue-name-row">
            <input
                id="${ids.topicInput}"
                class="team-rescue-field team-rescue-field--name"
                type="text"
                placeholder="Название"
                value="${escapeHtml(topic)}"
                autocomplete="off"
            >
            ${renderRescueTagDropdown(tag, ids)}
        </div>`;
}

function renderRescueLeagueDropdown(selectedLeague: string, ids: RescueFormDomIds): string {
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
        <div class="team-rescue-dropdown team-rescue-dropdown--up${isOpen ? " is-open" : ""}" id="${ids.leagueDropdown}">
            <button
                type="button"
                class="team-rescue-control-btn team-rescue-dropdown-trigger"
                id="${ids.leagueTrigger}"
                aria-expanded="${isOpen ? "true" : "false"}"
            >${escapeHtml(getRescueLeagueButtonLabel(selectedLeague))}</button>
            <div class="team-rescue-dropdown-menu">${options}</div>
        </div>`;
}

function renderRescueDeadlinePicker(selectedIsoDate: string, ids: RescueFormDomIds): string {
    const isOpen = teamFlowState.rescueDeadlineCalendarOpen;
    const calendarHtml = isOpen ? renderRescueCalendarPopup(selectedIsoDate, ids.calendarPopup) : "";

    return `
        <div class="team-rescue-datepicker${isOpen ? " is-open" : ""}" id="${ids.deadlinePicker}">
            <button
                type="button"
                class="team-rescue-control-btn team-rescue-datepicker-trigger"
                id="${ids.deadlineTrigger}"
                aria-expanded="${isOpen ? "true" : "false"}"
            >${escapeHtml(getRescueDeadlineButtonLabel(selectedIsoDate))}</button>
            ${calendarHtml}
        </div>`;
}

function renderRescueAttachmentsBlock(attachments: TeamRescueAttachment[], ids: RescueFormDomIds): string {
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
        <div class="team-rescue-attachments-list-wrap" id="${ids.attachmentsListWrap}">
            <p class="team-rescue-attachments-count" id="${ids.attachmentsCount}">${escapeHtml(countLabel)}</p>
            ${listHtml}
        </div>`;
}

export function renderRescueFormModal(options: RescueFormModalRenderOptions): string {
    const {
        draft,
        targetOptionsHtml = "",
        isSubmitting = false,
        domIds = TEAM_RESCUE_DOM_IDS,
        purposeLabel = "СПАСЕНИЕ",
        modalAriaLabel = purposeLabel,
        backdropCloseAttr = 'data-close-team-modal="1"',
        includeTargetTeam = true
    } = options;
    const attachmentsBlock = renderRescueAttachmentsBlock(draft.attachments, domIds);
    const submitLabel = isSubmitting ? "ОТПРАВКА..." : "ОТПРАВИТЬ";
    const targetTeamHtml = includeTargetTeam
        ? `
                    <select id="${domIds.targetInput}" class="team-rescue-field team-rescue-field--team team-rescue-select team-rescue-field--hidden" aria-hidden="true" tabindex="-1">
                        <option value="">КОМАНДА-ПОЛУЧАТЕЛЬ</option>
                        ${targetOptionsHtml}
                    </select>`
        : `<input type="hidden" id="${domIds.targetInput}" value="">`;

    return `
        <div class="profile-modal profile-modal--shell team-overlay-modal team-rescue-modal" role="dialog" aria-modal="true" aria-label="${escapeHtml(modalAriaLabel)}">
            <div class="profile-modal-backdrop team-rescue-backdrop" ${backdropCloseAttr}></div>
            <div class="profile-modal-card team-rescue-card team-rescue-card--team-page">
                <button type="button" class="team-rescue-close" id="${domIds.closeButton}" aria-label="Закрыть"></button>
                <p class="team-rescue-purpose">${escapeHtml(purposeLabel)}</p>
                <h2 class="team-rescue-title team-rescue-title--sr">${escapeHtml(modalAriaLabel)}</h2>
                <form id="${domIds.form}" class="team-rescue-form team-rescue-form--team-page" novalidate>
                    ${targetTeamHtml}
                    <input type="hidden" id="${domIds.leagueValue}" value="${escapeHtml(draft.league)}">
                    <input type="hidden" id="${domIds.tagValue}" value="${escapeHtml(draft.tag)}">
                    <input type="hidden" id="${domIds.deadlineValue}" value="${escapeHtml(draft.deadline)}">
                    ${renderRescueNameRow(draft.topic, draft.tag, domIds)}
                    <textarea
                        id="${domIds.descriptionInput}"
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
                                id="${domIds.photoInput}"
                                class="team-rescue-file"
                                accept="image/*,.pdf,.txt,.doc,.docx,.zip,.js,.ts,.py,.java,.cpp,.c,.html,.css,.json,.md"
                                multiple
                                hidden
                            >
                        </label>
                    </div>
                    <div class="team-rescue-duo-row">
                        ${renderRescueLeagueDropdown(draft.league, domIds)}
                        ${renderRescueDeadlinePicker(draft.deadline, domIds)}
                    </div>
                    <button
                        type="submit"
                        class="team-rescue-submit team-rescue-submit--wide"
                        id="${domIds.submitButton}"
                        ${isSubmitting ? "disabled aria-busy=\"true\"" : ""}
                    >${submitLabel}</button>
                </form>
            </div>
        </div>`;
}

export function wireRescueFormModal(profileMount: HTMLElement, options: RescueFormModalWireOptions): void {
    const {
        draft,
        onClose,
        onRender,
        onSubmit,
        syncDraftFromForm,
        isSubmitting = false,
        domIds = TEAM_RESCUE_DOM_IDS
    } = options;

    const submitRescueDraft = (): void => {
        if (isSubmitting) {
            return;
        }

        syncDraftFromForm();
        const nextDraft = readRescueDraftFromMount(profileMount, draft, domIds);
        Object.assign(draft, nextDraft);

        void Promise.resolve(onSubmit(nextDraft)).catch(() => {
            onRender();
        });
    };

    const closeButton = profileMount.querySelector(`#${domIds.closeButton}`);
    if (isHTMLButtonElement(closeButton)) {
        closeButton.addEventListener("click", () => {
            syncDraftFromForm();
            onClose();
        });
    }

    const topic = profileMount.querySelector(`#${domIds.topicInput}`);
    const description = profileMount.querySelector(`#${domIds.descriptionInput}`);
    const target = profileMount.querySelector(`#${domIds.targetInput}`);
    const leagueValueInput = profileMount.querySelector(`#${domIds.leagueValue}`);
    const tagValueInput = profileMount.querySelector(`#${domIds.tagValue}`);
    const deadlineValueInput = profileMount.querySelector(`#${domIds.deadlineValue}`);
    const photoInput = profileMount.querySelector(`#${domIds.photoInput}`);
    const rescueForm = profileMount.querySelector(`#${domIds.form}`);
    const leagueTrigger = profileMount.querySelector(`#${domIds.leagueTrigger}`);
    const tagTrigger = profileMount.querySelector(`#${domIds.tagTrigger}`);
    const deadlineTrigger = profileMount.querySelector(`#${domIds.deadlineTrigger}`);

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
            closeRescueDeadlineCalendar(profileMount, domIds);
            teamFlowState.rescueTagDropdownOpen = false;
            teamFlowState.rescueLeagueDropdownOpen = !teamFlowState.rescueLeagueDropdownOpen;
            onRender();
        });
    }

    if (isHTMLButtonElement(tagTrigger)) {
        tagTrigger.addEventListener("click", (event) => {
            event.stopPropagation();
            closeRescueDeadlineCalendar(profileMount, domIds);
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
                closeRescueDeadlineCalendar(profileMount, domIds);
                unbindRescueOutsideClick();
                return;
            }

            teamFlowState.rescueDeadlineCalendarOpen = true;
            teamFlowState.rescueCalendarMonthKey = draft.deadline.trim()
                ? draft.deadline.slice(0, 7)
                : getRescueCalendarMonthKey();

            const picker = profileMount.querySelector(`#${domIds.deadlinePicker}`);
            const trigger = profileMount.querySelector(`#${domIds.deadlineTrigger}`);
            picker?.classList.add("is-open");
            if (isHTMLButtonElement(trigger)) {
                trigger.setAttribute("aria-expanded", "true");
            }
            updateRescueCalendarPopup(profileMount, draft.deadline, domIds);
            bindRescueOutsideClick(profileMount, domIds, onRender);
        });
    }

    wireRescueDeadlinePicker(profileMount, draft, domIds);

    if (teamFlowState.rescueLeagueDropdownOpen || teamFlowState.rescueTagDropdownOpen || teamFlowState.rescueDeadlineCalendarOpen) {
        bindRescueOutsideClick(profileMount, domIds, onRender);
    }

    if (isHTMLFormElement(rescueForm)) {
        rescueForm.addEventListener("submit", (event) => {
            event.preventDefault();
            submitRescueDraft();
        });
    }
}

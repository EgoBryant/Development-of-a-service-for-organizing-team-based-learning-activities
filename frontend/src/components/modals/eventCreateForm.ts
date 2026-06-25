import { EVENT_FORMAT_OPTIONS } from "../../data/eventFormOptions";
import type { EventCreateDraft, EventFormIdPrefix } from "../../types/event";
import { isEventInCalendarYear, parseEventDateTimeLocal } from "../../utils/calendarEvents";
import { escapeHtml } from "../../utils/html";
import { isHTMLFormElement, isHTMLInputElement, isHTMLTextAreaElement } from "../../utils/dom";
interface DateTimeParts {
    day: string;
    month: string;
    year: string;
    hour: string;
    minute: string;
}

const DATE_TIME_SEGMENT_ORDER: Array<keyof DateTimeParts> = ["day", "month", "year", "hour", "minute"];
export function createEmptyEventCreateDraft(): EventCreateDraft {
    return {
        topic: "",
        tag: "",
        description: "",
        format: "",
        dateTime: ""
    };
}

export function isEventCreateDraftComplete(draft: EventCreateDraft): boolean {
    return (
        draft.topic.trim().length > 0 &&
        draft.description.trim().length > 0 &&
        draft.format.trim().length > 0 &&
        draft.dateTime.trim().length > 0 &&
        isEventInCalendarYear(draft.dateTime)
    );
}

function getEventFormatLabel(value: string): string {
    const match = EVENT_FORMAT_OPTIONS.find((option) => option.value === value.trim());
    return match?.label.toUpperCase() ?? "ФОРМАТ";
}

function emptyDateTimeParts(): DateTimeParts {
    return {
        day: "",
        month: "",
        year: "",
        hour: "",
        minute: ""
    };
}

function dateTimeValueToParts(value: string): DateTimeParts {
    const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value.trim());
    if (!match) {
        return emptyDateTimeParts();
    }

    const [, year, month, day, hour, minute] = match;
    return { day, month, year, hour, minute };
}

function composeDateTimeLocal(parts: DateTimeParts): string {
    const { day, month, year, hour, minute } = parts;
    if (day.length === 0 || month.length === 0 || year.length !== 4 || hour.length === 0 || minute.length === 0) {
        return "";
    }

    const dayValue = day.padStart(2, "0");
    const monthValue = month.padStart(2, "0");
    const hourValue = hour.padStart(2, "0");
    const minuteValue = minute.padStart(2, "0");
    const monthNumber = Number(monthValue);
    const dayNumber = Number(dayValue);
    const hourNumber = Number(hourValue);
    const minuteNumber = Number(minuteValue);

    if (
        monthNumber < 1 ||
        monthNumber > 12 ||
        dayNumber < 1 ||
        dayNumber > 31 ||
        hourNumber > 23 ||
        minuteNumber > 59
    ) {
        return "";
    }

    return `${year}-${monthValue}-${dayValue}T${hourValue}:${minuteValue}`;
}

function getDateTimeTriggerLabel(value: string): string {
    if (!value.trim()) {
        return "ДАТА";
    }

    const parsed = parseEventDateTimeLocal(value);
    if (!parsed) {
        return "ДАТА";
    }

    const day = String(parsed.getDate()).padStart(2, "0");
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const year = String(parsed.getFullYear());
    const hour = String(parsed.getHours()).padStart(2, "0");
    const minute = String(parsed.getMinutes()).padStart(2, "0");
    return `${day}.${month}.${year} ${hour}:${minute}`;
}

function renderDateTimeSegment(
    name: keyof DateTimeParts,
    maxLength: number,
    placeholder: string,
    widthClass: string,
    value: string
): string {
    return `
        <input
            type="text"
            inputmode="numeric"
            autocomplete="off"
            class="event-create-datetime-segment ${widthClass}"
            data-datetime-segment="${name}"
            maxlength="${maxLength}"
            placeholder="${placeholder}"
            value="${escapeHtml(value)}"
            aria-label="${placeholder}"
        >`;
}

function renderEventDateTimePicker(prefix: EventFormIdPrefix, dateTime: string): string {
    const triggerLabel = getDateTimeTriggerLabel(dateTime);
    const isEmpty = dateTime.trim().length === 0;
    const parts = dateTimeValueToParts(dateTime);

    return `
        <div class="event-create-datetime-picker team-rescue-dropdown team-rescue-dropdown--down" id="${prefix}DateTimePicker">
            <input
                type="hidden"
                id="${prefix}DateTimeInput"
                value="${escapeHtml(dateTime)}"
                required
            >
            <button
                type="button"
                class="team-rescue-field team-rescue-field--duo event-create-datetime-trigger${isEmpty ? " is-empty" : ""}"
                id="${prefix}DateTimeTrigger"
                aria-haspopup="dialog"
                aria-expanded="false"
            >
                <span class="event-create-datetime-trigger-label">${escapeHtml(triggerLabel)}</span>
            </button>
            <div class="event-create-datetime-panel team-rescue-dropdown-menu" role="group" aria-label="Дата и время">
                <div class="event-create-datetime-segments">
                    <div class="event-create-datetime-date-group">
                        ${renderDateTimeSegment("day", 2, "ДД", "event-create-datetime-segment--day", parts.day)}
                        <span class="event-create-datetime-dot" aria-hidden="true">.</span>
                        ${renderDateTimeSegment("month", 2, "ММ", "event-create-datetime-segment--month", parts.month)}
                        <span class="event-create-datetime-dot" aria-hidden="true">.</span>
                        ${renderDateTimeSegment("year", 4, "ГГГГ", "event-create-datetime-segment--year", parts.year)}
                    </div>
                    <div class="event-create-datetime-time-group">
                        ${renderDateTimeSegment("hour", 2, "ЧЧ", "event-create-datetime-segment--hour", parts.hour)}
                        <span class="event-create-datetime-colon" aria-hidden="true">:</span>
                        ${renderDateTimeSegment("minute", 2, "ММ", "event-create-datetime-segment--minute", parts.minute)}
                    </div>
                </div>
            </div>
        </div>`;
}

function wireEventDateTimePicker(    root: HTMLElement,
    prefix: EventFormIdPrefix,
    draft: EventCreateDraft,
    onFieldChange?: () => void
): void {
    const picker = root.querySelector<HTMLElement>(`#${prefix}DateTimePicker`);
    const hiddenInput = root.querySelector(`#${prefix}DateTimeInput`);
    const trigger = root.querySelector<HTMLButtonElement>(`#${prefix}DateTimeTrigger`);

    if (!picker || !isHTMLInputElement(hiddenInput) || !trigger) {        return;
    }

    const notify = (): void => {
        onFieldChange?.();
    };

    const segmentInputs = DATE_TIME_SEGMENT_ORDER.map((segmentName) =>
        picker.querySelector<HTMLInputElement>(`[data-datetime-segment="${segmentName}"]`)
    ).filter((input): input is HTMLInputElement => isHTMLInputElement(input));

    const readPartsFromInputs = (): DateTimeParts => ({
        day: segmentInputs[0]?.value ?? "",
        month: segmentInputs[1]?.value ?? "",
        year: segmentInputs[2]?.value ?? "",
        hour: segmentInputs[3]?.value ?? "",
        minute: segmentInputs[4]?.value ?? ""
    });

    const updateTrigger = (): void => {
        const label = trigger.querySelector<HTMLElement>(".event-create-datetime-trigger-label");
        if (label) {
            label.textContent = getDateTimeTriggerLabel(draft.dateTime);
        }
        trigger.classList.toggle("is-empty", draft.dateTime.trim().length === 0);
        hiddenInput.value = draft.dateTime;
    };

    const syncFromInputs = (): void => {
        draft.dateTime = composeDateTimeLocal(readPartsFromInputs());
        updateTrigger();
        notify();
    };

    const syncSegmentsFromDraft = (): void => {
        const parts = dateTimeValueToParts(draft.dateTime);
        DATE_TIME_SEGMENT_ORDER.forEach((segmentName, index) => {
            const input = segmentInputs[index];
            if (input) {
                input.value = parts[segmentName];
            }
        });
    };

    const focusFirstSegment = (): void => {
        const firstEmpty = segmentInputs.find((input) => input.value.trim().length === 0) ?? segmentInputs[0];
        firstEmpty?.focus();
        firstEmpty?.select();
    };

    const closeSegmentPanel = (): void => {
        picker.classList.remove("is-open");
        trigger.setAttribute("aria-expanded", "false");
    };

    trigger.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const willOpen = !picker.classList.contains("is-open");
        picker.classList.toggle("is-open", willOpen);
        trigger.setAttribute("aria-expanded", willOpen ? "true" : "false");
        if (willOpen) {
            syncSegmentsFromDraft();
            focusFirstSegment();
        }
    });

    picker.addEventListener("click", (event) => {
        event.stopPropagation();
    });

    segmentInputs.forEach((input, index) => {        const segmentName = DATE_TIME_SEGMENT_ORDER[index];
        const maxLength = segmentName === "year" ? 4 : 2;
        const nextInput = segmentInputs[index + 1] ?? null;
        const prevInput = segmentInputs[index - 1] ?? null;

        input.addEventListener("input", () => {
            input.value = input.value.replace(/\D/g, "").slice(0, maxLength);
            if (input.value.length >= maxLength && nextInput) {
                nextInput.focus();
                nextInput.select();
            }
            syncFromInputs();
        });

        input.addEventListener("keydown", (event) => {
            if (event.key === "Backspace" && input.value.length === 0 && prevInput) {
                prevInput.focus();
            }
        });
    });

    root.addEventListener("click", () => {
        closeSegmentPanel();
    });

    updateTrigger();
}
function renderEventFormatDropdown(prefix: EventFormIdPrefix, selectedFormat: string): string {
    const optionsHtml = EVENT_FORMAT_OPTIONS.map((option) => {
        const isActive = option.value === selectedFormat.trim();
        return `
            <button
                type="button"
                class="team-rescue-dropdown-option${isActive ? " is-active" : ""}"
                data-event-format-value="${escapeHtml(option.value)}"
            >${escapeHtml(option.label.toUpperCase())}</button>`;
    }).join("");

    const triggerLabel = getEventFormatLabel(selectedFormat);
    const isEmpty = selectedFormat.trim().length === 0;

    return `
        <div class="event-create-format-dropdown team-rescue-dropdown team-rescue-dropdown--down" id="${prefix}FormatDropdown">
            <input
                type="hidden"
                id="${prefix}FormatInput"
                value="${escapeHtml(selectedFormat)}"
                required
            >
            <button
                type="button"
                class="team-rescue-field team-rescue-field--duo event-create-format-trigger${isEmpty ? " is-empty" : ""}"
                id="${prefix}FormatTrigger"
                aria-haspopup="listbox"
                aria-expanded="false"
            >
                <span class="event-create-format-trigger-label">${escapeHtml(triggerLabel)}</span>
            </button>
            <div class="team-rescue-dropdown-menu" role="listbox" aria-label="Формат события">
                ${optionsHtml}
            </div>
        </div>`;
}

function wireEventFormatDropdown(
    root: HTMLElement,
    prefix: EventFormIdPrefix,
    draft: EventCreateDraft,
    onFieldChange?: () => void
): void {
    const dropdown = root.querySelector<HTMLElement>(`#${prefix}FormatDropdown`);
    const hiddenInput = root.querySelector(`#${prefix}FormatInput`);
    const trigger = root.querySelector<HTMLButtonElement>(`#${prefix}FormatTrigger`);

    if (!dropdown || !isHTMLInputElement(hiddenInput) || !trigger) {
        return;
    }

    const notify = (): void => {
        onFieldChange?.();
    };

    const updateTrigger = (): void => {
        const label = trigger.querySelector<HTMLElement>(".event-create-format-trigger-label");
        if (label) {
            label.textContent = getEventFormatLabel(draft.format);
        }
        trigger.classList.toggle("is-empty", draft.format.trim().length === 0);
        hiddenInput.value = draft.format;
        dropdown.querySelectorAll<HTMLButtonElement>("[data-event-format-value]").forEach((optionButton) => {
            optionButton.classList.toggle(
                "is-active",
                optionButton.dataset.eventFormatValue === draft.format
            );
        });
    };

    trigger.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const willOpen = !dropdown.classList.contains("is-open");
        dropdown.classList.toggle("is-open", willOpen);
        trigger.setAttribute("aria-expanded", willOpen ? "true" : "false");
    });

    dropdown.querySelectorAll<HTMLButtonElement>("[data-event-format-value]").forEach((optionButton) => {
        optionButton.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            draft.format = optionButton.dataset.eventFormatValue ?? "";
            dropdown.classList.remove("is-open");
            trigger.setAttribute("aria-expanded", "false");
            updateTrigger();
            notify();
        });
    });

    root.addEventListener("click", () => {
        dropdown.classList.remove("is-open");
        trigger.setAttribute("aria-expanded", "false");
    });

    updateTrigger();
}

export function renderEventCreateFormFields(prefix: EventFormIdPrefix, draft: EventCreateDraft): string {
    return `
        <input
            id="${prefix}TopicInput"
            class="team-rescue-field team-rescue-field--topic"
            type="text"
            placeholder="ТЕМА"
            value="${escapeHtml(draft.topic)}"
            autocomplete="off"
            required
        >
        <textarea
            id="${prefix}DescriptionInput"
            class="team-rescue-textarea"
            placeholder="ОПИСАНИЕ"
            aria-label="Описание события"
            required
        >${escapeHtml(draft.description)}</textarea>
        <div class="team-rescue-duo-row">
            ${renderEventFormatDropdown(prefix, draft.format)}
            ${renderEventDateTimePicker(prefix, draft.dateTime)}
        </div>`;
}

export function syncEventCreateDraftFromForm(
    root: HTMLElement,
    prefix: EventFormIdPrefix,
    draft: EventCreateDraft
): void {
    const topic = root.querySelector(`#${prefix}TopicInput`);
    const tag = root.querySelector(`#${prefix}TagInput`);
    const description = root.querySelector(`#${prefix}DescriptionInput`);
    const format = root.querySelector(`#${prefix}FormatInput`);
    const dateTime = root.querySelector(`#${prefix}DateTimeInput`);

    if (isHTMLInputElement(topic)) {
        draft.topic = topic.value;
    }
    if (tag instanceof HTMLSelectElement) {
        draft.tag = tag.value;
    }
    if (isHTMLTextAreaElement(description)) {
        draft.description = description.value;
    }
    if (isHTMLInputElement(format)) {
        draft.format = format.value;
    }
    if (isHTMLInputElement(dateTime)) {
        draft.dateTime = dateTime.value;
    }
}

export function wireEventCreateFormInputs(
    root: HTMLElement,
    prefix: EventFormIdPrefix,
    draft: EventCreateDraft,
    onFieldChange?: () => void
): void {
    const topic = root.querySelector(`#${prefix}TopicInput`);
    const tag = root.querySelector(`#${prefix}TagInput`);
    const description = root.querySelector(`#${prefix}DescriptionInput`);

    const notify = (): void => {
        onFieldChange?.();
    };

    if (isHTMLInputElement(topic)) {
        topic.addEventListener("input", () => {
            draft.topic = topic.value;
            notify();
        });
    }

    if (tag instanceof HTMLSelectElement) {
        tag.addEventListener("change", () => {
            draft.tag = tag.value;
            tag.classList.toggle("is-empty", tag.value.trim().length === 0);
            notify();
        });
        tag.classList.toggle("is-empty", tag.value.trim().length === 0);
    }

    if (isHTMLTextAreaElement(description)) {
        description.addEventListener("input", () => {
            draft.description = description.value;
            notify();
        });
    }

    wireEventFormatDropdown(root, prefix, draft, onFieldChange);
    wireEventDateTimePicker(root, prefix, draft, onFieldChange);
}

export function bindEventCreateFormSubmit(
    root: HTMLElement,
    prefix: EventFormIdPrefix,
    draft: EventCreateDraft,
    formId: string,
    onValidSubmit: () => void,
    onInvalidSubmit: () => void
): void {
    const createForm = root.querySelector(`#${formId}`);
    if (!isHTMLFormElement(createForm)) {
        return;
    }

    createForm.addEventListener("submit", (event) => {
        event.preventDefault();
        syncEventCreateDraftFromForm(root, prefix, draft);

        if (!isEventCreateDraftComplete(draft)) {
            onInvalidSubmit();
            return;
        }

        onValidSubmit();
    });
}

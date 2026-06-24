import { EVENT_FORMAT_OPTIONS, EVENT_TAG_OPTIONS } from "../../data/eventFormOptions";
import type { EventCreateDraft, EventFormIdPrefix } from "../../types/event";
import { isEventInCalendarYear } from "../../utils/calendarEvents";
import { escapeHtml } from "../../utils/html";
import { isHTMLFormElement, isHTMLInputElement, isHTMLTextAreaElement } from "../../utils/dom";

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
        draft.tag.trim().length > 0 &&
        draft.description.trim().length > 0 &&
        draft.format.trim().length > 0 &&
        draft.dateTime.trim().length > 0 &&
        isEventInCalendarYear(draft.dateTime)
    );
}

function renderSelectOptions(
    options: readonly { value: string; label: string }[],
    selectedValue: string,
    placeholder: string
): string {
    const placeholderSelected = selectedValue.trim().length === 0 ? " selected" : "";
    const optionsHtml = options
        .map((option) => {
            const selected = option.value === selectedValue ? " selected" : "";
            return `<option value="${escapeHtml(option.value)}"${selected}>${escapeHtml(option.label)}</option>`;
        })
        .join("");

    return `
        <option value="" disabled hidden${placeholderSelected}>${escapeHtml(placeholder)}</option>
        ${optionsHtml}`;
}

export function renderEventCreateFormFields(prefix: EventFormIdPrefix, draft: EventCreateDraft): string {
    return `
        <div class="team-rescue-topic-row">
            <input
                id="${prefix}TopicInput"
                class="team-rescue-field team-rescue-field--topic"
                type="text"
                placeholder="ТЕМА"
                value="${escapeHtml(draft.topic)}"
                autocomplete="off"
                required
            >
            <select
                id="${prefix}TagInput"
                class="team-rescue-field team-rescue-field--tag team-rescue-select"
                aria-label="Тег события"
                required
            >
                ${renderSelectOptions(EVENT_TAG_OPTIONS, draft.tag, "ТЕГ")}
            </select>
        </div>
        <textarea
            id="${prefix}DescriptionInput"
            class="team-rescue-textarea"
            placeholder="ОПИСАНИЕ"
            aria-label="Описание события"
            required
        >${escapeHtml(draft.description)}</textarea>
        <div class="team-rescue-duo-row">
            <select
                id="${prefix}FormatInput"
                class="team-rescue-field team-rescue-field--duo team-rescue-select"
                aria-label="Формат события"
                required
            >
                ${renderSelectOptions(EVENT_FORMAT_OPTIONS, draft.format, "ФОРМАТ")}
            </select>
            <input
                id="${prefix}DateTimeInput"
                class="team-rescue-field team-rescue-field--duo team-rescue-field--datetime"
                type="datetime-local"
                aria-label="Дата и время события"
                value="${escapeHtml(draft.dateTime)}"
                required
            >
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
    if (format instanceof HTMLSelectElement) {
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
    const format = root.querySelector(`#${prefix}FormatInput`);
    const dateTime = root.querySelector(`#${prefix}DateTimeInput`);

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

    if (format instanceof HTMLSelectElement) {
        format.addEventListener("change", () => {
            draft.format = format.value;
            format.classList.toggle("is-empty", format.value.trim().length === 0);
            notify();
        });
        format.classList.toggle("is-empty", format.value.trim().length === 0);
    }

    if (isHTMLInputElement(dateTime)) {
        const syncDateTime = (): void => {
            draft.dateTime = dateTime.value;
            dateTime.classList.toggle("is-empty", dateTime.value.trim().length === 0);
            notify();
        };

        dateTime.addEventListener("input", syncDateTime);
        dateTime.addEventListener("change", syncDateTime);
        dateTime.classList.toggle("is-empty", dateTime.value.trim().length === 0);
    }
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

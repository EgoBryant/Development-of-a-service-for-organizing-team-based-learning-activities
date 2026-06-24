export interface EventCreateDraft {
    topic: string;
    tag: string;
    description: string;
    format: string;
    dateTime: string;
}

export interface CalendarEventItem {
    id: string;
    topic: string;
    tag: string;
    format: string;
    description: string;
    dateTime: string;
    endDateTime?: string;
    isMine: boolean;
}

export type EventFormIdPrefix = "eventCreate" | "teamEventCreate";

export function createCalendarEventFromDraft(
    draft: EventCreateDraft,
    options: { id?: string; isMine?: boolean } = {}
): CalendarEventItem {
    return {
        id: options.id ?? `ev-user-${Date.now().toString(36)}`,
        topic: draft.topic.trim(),
        tag: draft.tag.trim(),
        format: draft.format.trim(),
        description: draft.description.trim(),
        dateTime: draft.dateTime,
        isMine: options.isMine ?? true
    };
}

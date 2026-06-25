import { RESCUE_TAG_OPTIONS } from "./rescueTags";

export const HIDDEN_USER_REQUEST_TAG = "__user_request__";

export const ASSIGNMENT_DISPLAY_TAGS = RESCUE_TAG_OPTIONS.map((option) => option.label);

export function isHiddenAssignmentTag(tag: string): boolean {
    return tag.trim() === HIDDEN_USER_REQUEST_TAG;
}

export function shouldShowAssignmentTag(tag: string): boolean {
    return tag.trim().length > 0 && !isHiddenAssignmentTag(tag);
}

export function getDefaultAssignmentTagFilters(): string[] {
    return [...ASSIGNMENT_DISPLAY_TAGS];
}

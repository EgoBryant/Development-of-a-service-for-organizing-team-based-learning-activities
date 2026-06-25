import type { TeamRescueDraft } from "../../types/team";
import {
    renderRescueFormModal,
    wireRescueFormModal,
    TASKS_REQUEST_DOM_IDS,
    readRescueDraftFromMount,
    type RescueFormModalRenderOptions,
    type RescueFormModalWireOptions
} from "./RescueRequestFormModal";

export function readTasksRequestDraftFromMount(
    profileMount: HTMLElement,
    draft: TeamRescueDraft
): TeamRescueDraft {
    return readRescueDraftFromMount(profileMount, draft, TASKS_REQUEST_DOM_IDS);
}

export type TasksRequestModalRenderOptions = Omit<
    RescueFormModalRenderOptions,
    "domIds" | "purposeLabel" | "modalAriaLabel" | "backdropCloseAttr" | "includeTargetTeam" | "targetOptionsHtml"
>;

export type TasksRequestModalWireOptions = Omit<RescueFormModalWireOptions, "domIds">;

export function renderTasksRequestModal(options: TasksRequestModalRenderOptions): string {
    return renderRescueFormModal({
        ...options,
        domIds: TASKS_REQUEST_DOM_IDS,
        purposeLabel: "ЗАПРОС",
        modalAriaLabel: "Запрос",
        backdropCloseAttr: 'data-close-tasks-request-modal="1"',
        includeTargetTeam: false,
        targetOptionsHtml: ""
    });
}

export function wireTasksRequestModal(
    profileMount: HTMLElement,
    options: TasksRequestModalWireOptions
): void {
    wireRescueFormModal(profileMount, {
        ...options,
        domIds: TASKS_REQUEST_DOM_IDS
    });
}

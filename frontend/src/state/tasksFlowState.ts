import type { AssignmentItem } from "../types/assignment";
import type { TasksKrcTier } from "../types/app";
import type { TeamRescueDraft } from "../types/team";
import {
    ASSIGNMENT_DISPLAY_TAGS,
    getDefaultAssignmentTagFilters
} from "../constants/assignmentTags";

export interface TasksFlowState {
    assignments: AssignmentItem[];
    selectedAssignment: AssignmentItem | null;
    assignmentContactDraft: string;
    activeLeagueTier: TasksKrcTier;
    activeTagFilters: string[];
    tagFilterDropdownOpen: boolean;
    requestModalOpen: boolean;
    requestDraft: TeamRescueDraft | null;
    challengeModalOpen: boolean;
    challengeActiveIndex: number;
}

export const tasksFlowState: TasksFlowState = {
    assignments: [],
    selectedAssignment: null,
    assignmentContactDraft: "",
    activeLeagueTier: "novice",
    activeTagFilters: getDefaultAssignmentTagFilters(),
    tagFilterDropdownOpen: false,
    requestModalOpen: false,
    requestDraft: null,
    challengeModalOpen: false,
    challengeActiveIndex: 0
};

export function resetTasksFlowState(): void {
    tasksFlowState.assignments = [];
    tasksFlowState.selectedAssignment = null;
    tasksFlowState.assignmentContactDraft = "";
    tasksFlowState.activeLeagueTier = "novice";
    tasksFlowState.activeTagFilters = getDefaultAssignmentTagFilters();
    tasksFlowState.tagFilterDropdownOpen = false;
    tasksFlowState.requestModalOpen = false;
    tasksFlowState.requestDraft = null;
    tasksFlowState.challengeModalOpen = false;
    tasksFlowState.challengeActiveIndex = 0;
}

export function openTasksAssignmentModal(assignment: AssignmentItem): void {
    tasksFlowState.selectedAssignment = assignment;
    tasksFlowState.assignmentContactDraft = "";
}

export function closeTasksAssignmentModal(): void {
    tasksFlowState.selectedAssignment = null;
    tasksFlowState.assignmentContactDraft = "";
}

export function isAssignmentVisibleInFeed(tag: string): boolean {
    if (!ASSIGNMENT_DISPLAY_TAGS.includes(tag as typeof ASSIGNMENT_DISPLAY_TAGS[number])) {
        return true;
    }

    return tasksFlowState.activeTagFilters.includes(tag);
}

export function prependTasksAssignmentIfActiveLeague(assignment: AssignmentItem): void {
    if (assignment.leagueTier !== tasksFlowState.activeLeagueTier) {
        return;
    }

    tasksFlowState.assignments = [
        assignment,
        ...tasksFlowState.assignments.filter((item) => item.id !== assignment.id)
    ];
}

export function createEmptyTasksRequestDraft(): TeamRescueDraft {
    return {
        targetTeamId: "",
        topic: "",
        tag: "",
        description: "",
        league: "",
        deadline: "",
        attachments: []
    };
}

export function ensureTasksRequestDraft(): TeamRescueDraft {
    if (!tasksFlowState.requestDraft) {
        tasksFlowState.requestDraft = createEmptyTasksRequestDraft();
    }

    return tasksFlowState.requestDraft;
}

export function openTasksRequestModal(): void {
    ensureTasksRequestDraft();
    tasksFlowState.requestModalOpen = true;
}

export function closeTasksRequestModal(): void {
    tasksFlowState.requestModalOpen = false;
    tasksFlowState.tagFilterDropdownOpen = false;
}

export function openTasksChallengeModal(): void {
    tasksFlowState.challengeModalOpen = true;
}

export function closeTasksChallengeModal(): void {
    tasksFlowState.challengeModalOpen = false;
    tasksFlowState.challengeActiveIndex = 0;
}

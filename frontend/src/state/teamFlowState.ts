import type { NoTeamView, TeamCreateDraft, TeamEventCreateDraft, TeamEventModalKind } from "../types/team";

export interface TeamFlowState {
    noTeamView: NoTeamView;
    inviteCodeInput: string;
    inviteCodeError: string;
    createTeamDraft: TeamCreateDraft;
    eventModal: TeamEventModalKind;
    eventDraft: TeamEventCreateDraft;
    eventShareLink: string;
    eventShowValidationError: boolean;
}

export function createEmptyTeamEventDraft(): TeamEventCreateDraft {
    return {
        topic: "",
        tag: "",
        description: "",
        format: "",
        dateTime: ""
    };
}

export function createEmptyTeamCreateDraft(): TeamCreateDraft {
    return {
        name: "",
        direction: ""
    };
}

export const teamFlowState: TeamFlowState = {
    noTeamView: "landing",
    inviteCodeInput: "",
    inviteCodeError: "",
    createTeamDraft: createEmptyTeamCreateDraft(),
    eventModal: "none",
    eventDraft: createEmptyTeamEventDraft(),
    eventShareLink: "",
    eventShowValidationError: false
};

export function openTeamEventCreateModal(): void {
    teamFlowState.eventModal = "create";
    teamFlowState.eventShowValidationError = false;
}

export function openTeamEventSuccessModal(shareLink: string): void {
    teamFlowState.eventModal = "success";
    teamFlowState.eventShareLink = shareLink;
    teamFlowState.eventShowValidationError = false;
}

export function closeTeamEventModals(): void {
    teamFlowState.eventModal = "none";
    teamFlowState.eventShowValidationError = false;
}

export function resetTeamEventDraft(): void {
    teamFlowState.eventDraft = createEmptyTeamEventDraft();
}

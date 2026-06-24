import type { NoTeamView, TeamCreateDraft, TeamEventCreateDraft, TeamEventModalKind } from "../types/team";
import { getRescueCalendarMonthKey } from "../utils/rescueFormUi";

export interface TeamFlowState {
    noTeamView: NoTeamView;
    inviteCodeInput: string;
    inviteCodeError: string;
    searchQuery: string;
    createTeamDraft: TeamCreateDraft;
    eventModal: TeamEventModalKind;
    eventDraft: TeamEventCreateDraft;
    eventShareLink: string;
    eventShowValidationError: boolean;
    checkInWeek: string;
    checkInReport: string;
    checkInError: string;
    checkInProductivity: number;
    checkInCommunication: number;
    checkInSatisfaction: number;
    voteDraftScore: number | null;
    voteDropdownOpen: boolean;
    rescueLeagueDropdownOpen: boolean;
    rescueTagDropdownOpen: boolean;
    rescueDeadlineCalendarOpen: boolean;
    rescueCalendarMonthKey: string;
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
    searchQuery: "",
    createTeamDraft: createEmptyTeamCreateDraft(),
    eventModal: "none",
    eventDraft: createEmptyTeamEventDraft(),
    eventShareLink: "",
    eventShowValidationError: false,
    checkInWeek: "",
    checkInReport: "",
    checkInError: "",
    checkInProductivity: 0,
    checkInCommunication: 0,
    checkInSatisfaction: 0,
    voteDraftScore: null,
    voteDropdownOpen: false,
    rescueLeagueDropdownOpen: false,
    rescueTagDropdownOpen: false,
    rescueDeadlineCalendarOpen: false,
    rescueCalendarMonthKey: getRescueCalendarMonthKey()
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

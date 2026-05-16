import type { RatingSortKey, RatingView, RescueDraft, UserProfileTab } from "../types/rating";

export interface RatingFlowState {
    view: RatingView;
    selectedUserId: string | null;
    selectedTeamId: string | null;
    usersSearch: string;
    teamsSearch: string;
    usersSort: RatingSortKey;
    teamsSort: RatingSortKey;
    usersFilterOpen: boolean;
    teamsFilterOpen: boolean;
    userProfileTab: UserProfileTab;
    rescueOpen: boolean;
    rescueShowError: boolean;
    rescueDraft: RescueDraft;
    usersSearchFocus: boolean;
    teamsSearchFocus: boolean;
}

export const ratingFlowState: RatingFlowState = {
    view: "leaderboard",
    selectedUserId: null,
    selectedTeamId: null,
    usersSearch: "",
    teamsSearch: "",
    usersSort: "rank-asc",
    teamsSort: "rank-asc",
    usersFilterOpen: false,
    teamsFilterOpen: false,
    userProfileTab: "rating",
    rescueOpen: false,
    rescueShowError: false,
    rescueDraft: createEmptyRescueDraft(),
    usersSearchFocus: false,
    teamsSearchFocus: false
};

export function createEmptyRescueDraft(): RescueDraft {
    return {
        topic: "",
        tag: "",
        description: "",
        format: "",
        dateTime: ""
    };
}

export function resetRatingFlowState(): void {
    ratingFlowState.view = "leaderboard";
    ratingFlowState.selectedUserId = null;
    ratingFlowState.selectedTeamId = null;
    ratingFlowState.usersSearch = "";
    ratingFlowState.teamsSearch = "";
    ratingFlowState.usersSort = "rank-asc";
    ratingFlowState.teamsSort = "rank-asc";
    ratingFlowState.usersFilterOpen = false;
    ratingFlowState.teamsFilterOpen = false;
    ratingFlowState.userProfileTab = "rating";
    ratingFlowState.rescueOpen = false;
    ratingFlowState.rescueShowError = false;
    ratingFlowState.rescueDraft = createEmptyRescueDraft();
    ratingFlowState.usersSearchFocus = false;
    ratingFlowState.teamsSearchFocus = false;
}

export function openRatingUserProfile(userId: string): void {
    ratingFlowState.view = "user";
    ratingFlowState.selectedUserId = userId;
    ratingFlowState.userProfileTab = "rating";
    ratingFlowState.usersFilterOpen = false;
    ratingFlowState.teamsFilterOpen = false;
}

export function openRatingTeamProfile(teamId: string): void {
    ratingFlowState.view = "team";
    ratingFlowState.selectedTeamId = teamId;
    ratingFlowState.usersFilterOpen = false;
    ratingFlowState.teamsFilterOpen = false;
}

export function backToRatingLeaderboard(): void {
    ratingFlowState.view = "leaderboard";
    ratingFlowState.selectedUserId = null;
    ratingFlowState.selectedTeamId = null;
    ratingFlowState.rescueOpen = false;
    ratingFlowState.rescueShowError = false;
}

export function openRatingRescueModal(): void {
    ratingFlowState.rescueOpen = true;
    ratingFlowState.rescueShowError = false;
}

export function closeRatingRescueModal(): void {
    ratingFlowState.rescueOpen = false;
    ratingFlowState.rescueShowError = false;
}

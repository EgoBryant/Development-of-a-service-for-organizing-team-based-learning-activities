import type { ActivityFeedPushInput } from "../types/activity";
import type { EventCreateDraft } from "../types/event";
import type { TeamHistoryItem, TeamMemberView, TeamRescueDraft, TeamSearchItem } from "../types/team";

export interface JoinTeamResult {
    ok: boolean;
    errorMessage: string;
}

export interface AppBridge {
    render: () => void;
    setStatus: (message: string, tone?: StatusTone) => void;
    clearStatus: () => void;
    isCurrentUserCaptain: () => boolean;
    hasTeamAccess: () => boolean;
    getTeamTitle: () => string;
    getTeamSubtitle: () => string;
    getTeamMembers: () => TeamMemberView[];
    getTeamKrk: () => string;
    getTeamScore: () => string;
    getTeamInviteCode: () => string;
    getTeamHistory: () => TeamHistoryItem[];
    getJoinableTeams: () => TeamSearchItem[];
    getCurrentUserAvatarUrl: () => string;
    getCurrentUserId: () => string;
    isCurrentUser: (userId: string) => boolean;
    joinTeamByInviteCode: (code: string) => Promise<JoinTeamResult>;
    requestTeamJoin: (teamId: number) => Promise<void>;
    createTeam: (name: string, direction: string) => Promise<void>;
    createTeamCheckIn: (weekNumber: number, reportText: string) => Promise<void>;
    submitTeamVote: (memberId: string, score: number) => Promise<void>;
    createTeamRescueRequest: (draft: TeamRescueDraft) => Promise<void>;
    updateTeamHelpRequestStatus: (id: number, status: string) => Promise<void>;
    openTeamOverlayModal: (kind: "vote" | "requests" | "rescue" | "checkIn" | "leaveTeam", memberIndex?: number) => void;
    openTeamMemberProfile: (memberId: string) => void;
    openTeamOnboardingModal: (step: "intro" | "find" | "create") => void;
    openTeamRescue: () => void;
    navigateToRating: () => void;
    navigateToEvents: () => void;
    addCalendarEventFromDraft: (draft: EventCreateDraft) => boolean;
    pushActivity: (input: ActivityFeedPushInput) => void;
}

export type StatusTone = "default" | "error";

let bridge: AppBridge | null = null;

export function setAppBridge(next: AppBridge): void {
    bridge = next;
}

export function getAppBridge(): AppBridge {
    if (!bridge) {
        throw new Error("App bridge is not initialized");
    }
    return bridge;
}

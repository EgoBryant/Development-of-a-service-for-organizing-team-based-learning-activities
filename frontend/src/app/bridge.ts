import type { ActivityFeedPushInput } from "../types/activity";
import type { EventCreateDraft } from "../types/event";
import type { TeamMemberView } from "../types/team";

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
    joinTeamByInviteCode: (code: string) => JoinTeamResult;
    createTeam: (name: string, direction: string) => void;
    openTeamOverlayModal: (kind: "vote" | "requests" | "rescue", memberIndex?: number) => void;
    openTeamRescue: () => void;
    navigateToRating: () => void;
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

import type { EventCreateDraft } from "./event";

export type TeamEventModalKind = "none" | "create" | "success";
export type TeamModalKind = "none" | "vote" | "requests" | "rescue";
export type NoTeamView = "landing" | "create-form";

export type TeamEventCreateDraft = EventCreateDraft;

export interface TeamCreateDraft {
    name: string;
    direction: string;
}

export interface TeamMemberView {
    id: string;
    displayName: string;
    roleLabel: string;
    avatarUrl: string;
}

export interface TeamRescueDraft {
    topic: string;
    tag: string;
    description: string;
    league: string;
    deadline: string;
    photoFileName: string;
}

export interface TeamMemberRow {
    id: string;
    displayName: string;
    roleLabel: string;
    avatarUrl: string;
    isCaptain: boolean;
}

export interface LocalCreatedTeam {
    name: string;
    inviteCode: string;
    direction: string;
    members: TeamMemberRow[];
}

export interface PersistedLocalTeamV1 {
    name: string;
    inviteCode: string;
    inviteLink?: string;
    direction?: string;
    members?: TeamMemberRow[];
    /** @deprecated только для чтения старых сохранений */
    voteCommitted?: Record<string, boolean>;
    /** @deprecated старые локальные оценки; игнорируется */
    voteSavedPoints?: Record<string, string>;
}

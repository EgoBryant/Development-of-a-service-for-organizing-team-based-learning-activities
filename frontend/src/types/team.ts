export type TeamEventModalKind = "none" | "create" | "success";

export type NoTeamView = "landing" | "create-form";

import type { EventCreateDraft } from "./event";

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

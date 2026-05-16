export type TeamEventModalKind = "none" | "create" | "success";

export type NoTeamView = "landing" | "create-form";

export interface TeamEventCreateDraft {
    topic: string;
    tag: string;
    description: string;
    format: string;
    dateTime: string;
}

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

export type ActivityKind =
    | "challenge_completed"
    | "rating_changed"
    | "team_achievement"
    | "event_upcoming"
    | "team_joined"
    | "team_created"
    | "rescue_sent"
    | "event_created"
    | "check_in"
    | "invite_sent"
    | "profile_updated";

export type ActivityColorVariant = "pink" | "blue" | "green" | "purple" | "amber" | "rose";

export interface ActivityFeedItem {
    id: string;
    kind: ActivityKind;
    title: string;
    description: string;
    createdAt: string;
    colorVariant: ActivityColorVariant;
    badge?: string;
}

export interface ActivityFeedPushInput {
    kind: ActivityKind;
    title: string;
    description: string;
    badge?: string;
}

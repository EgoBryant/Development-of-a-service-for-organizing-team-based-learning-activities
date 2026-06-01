import type { EventCreateDraft } from "./event";
import type { NewsCreateDraft } from "./news";
import type { LocalCreatedTeam, TeamModalKind, TeamRescueDraft } from "./team";
import type { ProfileEdits } from "./profile";
import type { SignInState, SignUpState, UserProfileResponse } from "./auth";

export type View = "home" | "sign-in" | "sign-up" | "password-recovery" | "account";
export type DashboardSection = "profile" | "team" | "rating" | "events";

export type EventsCalendarScope = "all" | "mine";
export type EventsFeedTab = "activity" | "news";
export type EventsModalKind = "none" | "create" | "success" | "createNews";

export type ProfileModalKind =
    | "none"
    | "personal"
    | "password"
    | "noTeam"
    | "createTeam"
    | "teamSuccess"
    | "achievement";

export interface AppState {
    view: View;
    signIn: SignInState;
    signUp: SignUpState;
    profile: UserProfileResponse | null;
    profileEdits: ProfileEdits | null;
    profileModal: ProfileModalKind;
    profileAchievementId: string;
    profileCreateTeamName: string;
    profileCreateTeamDirection: string;
    profileInviteLink: string;
    profileFormDraft: ProfileEdits | null;
    dashboardSection: DashboardSection;
    teamModal: TeamModalKind;
    teamRescueDraft: TeamRescueDraft | null;
    eventsCalendarScope: EventsCalendarScope;
    eventsFeedTab: EventsFeedTab;
    eventsWeekOffset: number;
    eventsModal: EventsModalKind;
    eventsCreateDraft: EventCreateDraft | null;
    eventsShowValidationError: boolean;
    eventsShareLink: string;
    newsCreateDraft: NewsCreateDraft | null;
    newsShowValidationError: boolean;
    teamVoteMemberIndex: number;
    teamRequestsInviteLink: string;
    localCreatedTeam: LocalCreatedTeam | null;
    statusMessage: string;
    statusTone: "default" | "error";
    isSubmitting: boolean;
}

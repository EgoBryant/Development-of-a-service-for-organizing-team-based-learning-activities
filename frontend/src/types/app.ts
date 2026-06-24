import type { EventCreateDraft } from "./event";
import type { NewsCreateDraft } from "./news";
import type {
    CheckInResponse,
    HelpRequestResponse,
    LocalCreatedTeam,
    MyVoteResponse,
    TeamJoinRequestResponse,
    TeamModalKind,
    TeamRescueDraft,
    TeamResponse
} from "./team";
import type { ProfileEdits } from "./profile";
import type { SignInState, SignUpState, UserProfileResponse } from "./auth";
import type { RatingUser } from "./rating";

export type View = "home" | "sign-in" | "sign-up" | "password-recovery" | "account";
export type DashboardSection = "profile" | "team" | "rating" | "events" | "settings";

export type EventsCalendarScope = "all" | "mine";
export type EventsFeedTab = "activity" | "news";
export type EventsModalKind = "none" | "create" | "success" | "createNews";

export type ProfileModalKind =
    | "none"
    | "personal"
    | "password"
    | "noTeam"
    | "findTeam"
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
    profileFindTeamQuery: string;
    profileFindTeamSelectedId: number | null;
    profileInviteLink: string;
    profileFormDraft: ProfileEdits | null;
    profileAvatarFileName: string;
    settingsPhotoOriginalAvatarDataUrl: string | null;
    settingsPhotoOriginalFileName: string;
    settingsPhotoPendingAvatarDataUrl: string | null;
    settingsPhotoErrorMessage: string;
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
    teamRequestsCurrentIndex: number;
    teamRequestsInviteLink: string;
    teamRequestsApplicantRequestId: number | null;
    teamRequestsApplicantRating: RatingUser | null;
    localCreatedTeam: LocalCreatedTeam | null;
    currentTeam: TeamResponse | null;
    teamCatalog: TeamResponse[];
    teamCheckIns: CheckInResponse[];
    teamHelpRequests: HelpRequestResponse[];
    teamJoinRequests: TeamJoinRequestResponse[];
    teamMyVotes: MyVoteResponse[];
    statusMessage: string;
    statusTone: "default" | "error";
    isSubmitting: boolean;
}

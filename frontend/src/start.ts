import "../styles/start.css";
import QRCode from "qrcode";
import calendarMenuIconUrl from "./assets/icons/Menu_Icons/Calendar.svg";
import logoutMenuIconUrl from "./assets/icons/Menu_Icons/Log_Out.svg";
import ligaMobileIconUrl from "./assets/icons/Liga_mobile.svg";
import profileMenuIconUrl from "./assets/icons/Menu_Icons/Profile.svg";
import ratingMenuIconUrl from "./assets/icons/Menu_Icons/Rating.svg";
import scoreMobileIconUrl from "./assets/icons/Score_mobile.svg";
import settingsMenuIconUrl from "./assets/icons/Menu_Icons/Settings.svg";
import tasksMenuIconUrl from "./assets/icons/Menu_Icons/Tasks.svg";
import teamMenuIconUrl from "./assets/icons/Menu_Icons/Team.svg";
import acceptIconUrl from "./assets/icons/Accept.svg";
import rejectIconUrl from "./assets/icons/Reject.svg";
import scrollLeftIconUrl from "./assets/icons/Scroll_button_left.svg";
import scrollRightIconUrl from "./assets/icons/Scroll_button_right.svg";
import { setAppBridge } from "./app/bridge";
import type { JoinTeamResult } from "./app/bridge";
import { isDemoInviteCodeValid, normalizeInviteCode } from "./data/demoTeam";
import { EVENTS_CALENDAR_YEAR, EVENTS_MONTH_LABELS, getDemoEventsForDateKey } from "./data/demoEvents";
import { renderRatingPageMain, renderRatingPageModals, wireRatingPageEvents } from "./pages/RatingPage";
import {
    paintTeamPageEventSuccessQr,
    renderTeamPageMain,
    renderTeamPageModals,
    wireTeamPageEvents
} from "./pages/TeamPage";
import {
    getSettingsGroupDisplay,
    getSettingsNameDisplay,
    getSettingsPhotoDisplay,
    renderSettingsPageMain
} from "./pages/SettingsPage";
import { renderTasksPageMain, wireTasksPageEvents } from "./pages/TasksPage";
import { closeTeamEventModals, teamFlowState } from "./state/teamFlowState";
import type { CalendarEventItem, EventCreateDraft } from "./types/event";
import {
    bindEventCreateFormSubmit,
    createEmptyEventCreateDraft,
    syncEventCreateDraftFromForm as syncSharedEventCreateDraftFromForm,
    wireEventCreateFormInputs
} from "./components/modals/eventCreateForm";
import { renderEventsDashboardCreateModal } from "./components/modals/CreateEventModal";
import { renderActivityFeedPanel } from "./components/events/ActivityFeedBlock";
import { isNewsCreateDraftComplete, renderCreateNewsModal } from "./components/events/CreateNewsModal";
import { renderNewsFeedPanel } from "./components/events/NewsFeedBlock";
import { renderCalendarEventCard } from "./components/events/CalendarEventCard";
import {
    addUserCalendarEventFromDraft,
    clampCalendarStartIndex,
    EVENTS_CALENDAR_VISIBLE_DAYS,
    getCalendarStartIndexForDateTime,
    getEventsCalendarYearDates,
    getTodayCalendarStartIndex,
    getUserEventsForDateKey,
    loadPersistedUserEvents
} from "./state/eventsCalendarState";
import { loadPersistedActivityFeed, pushActivityFeedItem } from "./state/activityFeedState";
import { loadPersistedNewsFeed, pushNewsPost } from "./state/newsFeedState";
import type { ActivityFeedPushInput } from "./types/activity";
import type {
    AppState,
    DashboardSection,
    EventsCalendarScope,
    EventsFeedTab,
    EventsModalKind,
    ExternalProfileView,
    ProfileModalKind,
    TasksKrcTier,
    View
} from "./types/app";
import type { AuthResponse, UserProfileResponse } from "./types/auth";
import type { NewsCreateDraft } from "./types/news";
import type { PersistedClientProfileV1, ProfileEdits } from "./types/profile";
import type {
    LocalCreatedTeam,
    PersistedLocalTeamV1,
    CheckInResponse,
    HelpRequestResponse,
    MyVoteResponse,
    TeamJoinRequestResponse,
    TeamMemberRow,
    TeamResponse,
    TeamHistoryItem,
    TeamModalKind,
    TeamRescueDraft,
    TeamMemberView,
    TeamSearchItem
} from "./types/team";
import { dateToDateKey, formatCalendarWeekdayLabel, parseEventDateTimeLocal } from "./utils/calendarEvents";
import {
    getInputValue,
    getRequiredElement,
    isHTMLButtonElement,
    isHTMLElement,
    isHTMLFormElement,
    isHTMLInputElement
} from "./utils/dom";
import { escapeHtml } from "./utils/html";
import { renderProfileAchievementModal, renderProfileAchievementStrip } from "./components/profile/ProfileAchievements";
import {
    renderProfileCreateTeamModal,
    renderProfileFindTeamModal,
    renderProfileNoTeamModal,
    renderProfileTeamSuccessModal
} from "./components/profile/ProfileTeamModals";
import { renderProfileModalShell } from "./components/profile/ProfileModalShell";
import { renderTeamRescueModal, wireTeamRescueModal } from "./components/modals/TeamRescueModal";
import { renderExternalProfileDock } from "./components/team/ExternalProfileDock";
import { renderPublicAchievementsStrip } from "./components/rating/PublicUserProfile";
import { getProfileAchievementById } from "./data/profileAchievements";
import { fetchCurrentUser, login, register, updateProfile } from "./services/authApi";
import { fetchRatingTeams, fetchRatingUserById, fetchRatingUsers } from "./services/ratingApi";
import {
    mergeSessionTeamIntoRatingTeams,
    mergeSessionUserIntoRatingUsers
} from "./services/ratingSessionData";
import {
    createCheckIn,
    createHelpRequest,
    createTeam as createTeamApi,
    createTeamJoinRequest,
    createVote,
    fetchCheckIns,
    fetchHelpRequests,
    fetchMyTeam,
    fetchMyVotes,
    fetchTeams,
    fetchTeamJoinRequests,
    joinTeam as joinTeamApi,
    searchTeams,
    updateHelpRequestStatus,
    updateTeamJoinRequestStatus
} from "./services/teamApi";
import { getErrorMessage } from "./services/httpClient";
import { queueRescueAssignmentTask } from "./services/rescueAssignmentsQueue";
import { buildUserProfileFromAuthResponse } from "./services/profileMapper";
import { buildPersonalProfilePutBody, splitFullNameForApi } from "./services/profilePayload";
import { clearSession, loadSession, saveSession } from "./services/sessionStorage";
import { clearRatingData, setRatingData } from "./state/ratingDataState";
import { isSameUserId, resolveUserAvatarUrl } from "./utils/ratingAvatars";
import { getRescueCalendarMonthKey } from "./utils/rescueFormUi";

/** Событие открытия модалки «Спасение» с любого места UI. */
export const TEAM_RESCUE_OPEN_EVENT = "team-exam:open-rescue";

const LOCAL_TEAM_STORAGE_PREFIX = "team-exam-local-team:";
const LOCAL_PROFILE_STORAGE_PREFIX = "team-exam-profile:";
const FORCE_DEMO_PROFILE_ACHIEVEMENTS = false;
let profileAchievementScrollResizeObserver: ResizeObserver | undefined;

const appState: AppState = {
    view: "home",
    signIn: {
        email: "",
        password: ""
    },
    signUp: {
        email: "",
        password: "",
        passwordConfirm: ""
    },
    profile: null,
    profileEdits: null,
    profileModal: "none",
    profileAchievementId: "",
    profileCreateTeamName: "",
    profileCreateTeamDirection: "",
    profileFindTeamQuery: "",
    profileFindTeamSelectedId: null,
    profileInviteLink: "",
    profileFormDraft: null,
    profileAvatarFileName: "",
    settingsPhotoOriginalAvatarDataUrl: null,
    settingsPhotoOriginalFileName: "",
    settingsPhotoPendingAvatarDataUrl: null,
    settingsPhotoErrorMessage: "",
    dashboardSection: "profile",
    teamModal: "none",
    teamRescueDraft: null,
    eventsCalendarScope: "all",
    eventsFeedTab: "activity",
    eventsCalendarStartIndex: getTodayCalendarStartIndex(),
    eventsModal: "none",
    eventsCreateDraft: null,
    eventsShowValidationError: false,
    eventsShareLink: "",
    newsCreateDraft: null,
    newsShowValidationError: false,
    tasksKrcTier: "pro",
    teamVoteMemberIndex: 0,
    teamRequestsCurrentIndex: 0,
    teamRequestsInviteLink: "",
    externalProfileView: null,
    externalProfileRating: null,
    localCreatedTeam: null,
    currentTeam: null,
    teamCatalog: [],
    teamCheckIns: [],
    teamHelpRequests: [],
    teamJoinRequests: [],
    teamMyVotes: [],
    statusMessage: "",
    statusTone: "default",
    isSubmitting: false
};

const homeScreen = document.getElementById("homeScreen");
const appScreen = document.getElementById("appScreen");
const profileShell = document.getElementById("profileShell");
const profileMount = document.getElementById("profileMount");
const authLayout = document.getElementById("authLayout");
const authModalCard = document.getElementById("authModalCard");
const authSwitchColumn = document.getElementById("authSwitchColumn");
const formContent = document.getElementById("formContent");
const MOBILE_AUTH_QUERY = "(max-width: 1023px)";
const MOBILE_BOTTOM_NAV_QUERY = "(max-width: 1024px)";
const DESKTOP_DASHBOARD_QUERY = "(min-width: 1025px)";
const MOBILE_BOTTOM_NAV_CLOSED_HEIGHT = 76;
const MOBILE_BOTTOM_NAV_OPEN_HEIGHT = 116;
const MOBILE_BOTTOM_NAV_SWIPE_SENSITIVITY = 1.35;
const MOBILE_BOTTOM_NAV_OPEN_COMMIT_PX = 10;
const MOBILE_BOTTOM_NAV_FLING_VELOCITY = 0.32;
const MOBILE_MENU_SNAP_MS = 680;
const MOBILE_MENU_DRAG_SMOOTHING = 0.38;
const INVALID_CREDENTIALS_MESSAGE = "Неверная почта или пароль.";

void bootstrap();

function transitionAuthView(nextView: View): void {
    // Check if both current and next views are auth views (sign-in, sign-up, password-recovery)
    const authViews: View[] = ["sign-in", "sign-up", "password-recovery"];
    const isCurrentAuthView = authViews.includes(appState.view);
    const isNextAuthView = authViews.includes(nextView);

    // If transition is between auth views, add animation classes
    if (isCurrentAuthView && isNextAuthView && (!isHTMLElement(authModalCard) || !isHTMLElement(formContent))) {
        appState.view = nextView;
        render();
        return;
    }

    if (isCurrentAuthView && isNextAuthView && isHTMLElement(authModalCard) && isHTMLElement(formContent)) {
        const isMovingToSignUp = nextView === "sign-up";
        const authFormContent = formContent;
        const transitionDurationMs = window.matchMedia(MOBILE_AUTH_QUERY).matches ? 760 : 600;
        
        // Add animation classes to container
        authModalCard.classList.add(isMovingToSignUp ? "toggle-left" : "toggle-right");
        authModalCard.classList.add("toggle-switch-panel");

        // Get the form element to add exit animation class
        const currentForm = authFormContent.querySelector(".auth-form-modal");
        if (currentForm) {
            currentForm.classList.add("transition-exit");
        }

        // Wait for animation to complete before rendering the target auth state.
        setTimeout(() => {
            appState.view = nextView;
            if (isHTMLElement(authSwitchColumn) && (nextView === "sign-in" || nextView === "sign-up")) {
                authSwitchColumn.classList.add("transition-switch-copy-enter");
            }
            
            // Remove direction classes but keep toggle-switch-panel for enter animation
            authModalCard.classList.remove("toggle-left", "toggle-right", "toggle-switch-panel");
            
            // Render new content
            render();

            // Add enter animation class to new form
            const newForm = authFormContent.querySelector(".auth-form-modal");
            if (newForm) {
                newForm.classList.add("transition-enter");
                if (nextView === "password-recovery") {
                    newForm.classList.add("transition-recovery-enter");
                    if (isHTMLElement(authSwitchColumn)) {
                        authSwitchColumn.classList.add("transition-recovery-enter");
                    }
                }
                // Remove exit animation class from previous form if it still exists
                const exitForms = authFormContent.querySelectorAll(".transition-exit");
                exitForms.forEach((form) => {
                    form.classList.remove("transition-exit");
                });
            }

            // Wait for enter animation to complete before removing animation classes
            setTimeout(() => {
                if (newForm) {
                    newForm.classList.remove("transition-enter");
                    newForm.classList.remove("transition-recovery-enter");
                }
                if (isHTMLElement(authSwitchColumn)) {
                    authSwitchColumn.classList.remove("transition-recovery-enter");
                    authSwitchColumn.classList.remove("transition-switch-copy-enter");
                }
            }, transitionDurationMs);
        }, transitionDurationMs);
    } else {
        // For non-auth view transitions, just set view normally
        appState.view = nextView;
        render();
    }
}

function setView(nextView: View): void {
    transitionAuthView(nextView);
}

function resetSignUpDraft(): void {
    appState.signUp.email = "";
    appState.signUp.password = "";
    appState.signUp.passwordConfirm = "";
}

function setStatus(message: string, tone: "default" | "error" = "default"): void {
    appState.statusMessage = message;
    appState.statusTone = tone;
}

function clearStatus(): void {
    appState.statusMessage = "";
    appState.statusTone = "default";
}

function createEmptyTeamRescueDraft(): TeamRescueDraft {
    return {
        targetTeamId: "",
        topic: "",
        tag: "",
        description: "",
        league: "",
        deadline: "",
        attachments: []
    };
}

function ensureTeamRescueDraft(): TeamRescueDraft {
    if (!appState.teamRescueDraft) {
        appState.teamRescueDraft = createEmptyTeamRescueDraft();
    }
    return appState.teamRescueDraft;
}

function openRescueModal(): void {
    if (appState.view !== "account") {
        return;
    }
    appState.dashboardSection = "team";
    openTeamModal("rescue");
}

function pushUserActivity(input: ActivityFeedPushInput): void {
    pushActivityFeedItem(input);
}

async function submitTeamCheckIn(weekNumber: number, reportText: string): Promise<void> {
    const token = getSessionToken();
    if (!token) {
        pushUserActivity({
            kind: "check_in",
            title: "CHECK-IN",
            description: `Отчет за ${weekNumber} неделю сохранен локально.`
        });
        return;
    }

    const created = await createCheckIn(token, { weekNumber, reportText });
    appState.teamCheckIns = [created, ...appState.teamCheckIns.filter((item) => item.id !== created.id)];
    await refreshTeamWorkspace();
}

function resolveTeamMemberAvatarUrl(memberId: string, avatarUrl?: string | null): string {
    return resolveUserAvatarUrl(memberId, avatarUrl);
}

function parseVoteTargetUserId(memberId: string): number | null {
    const trimmed = memberId.trim();
    if (!trimmed) {
        return null;
    }

    const prefixedMatch = /^user-(\d+)$/i.exec(trimmed);
    if (prefixedMatch) {
        return Number(prefixedMatch[1]);
    }

    const numericId = Number(trimmed);
    return Number.isFinite(numericId) && numericId > 0 ? numericId : null;
}

async function submitTeamVote(memberId: string, score: number): Promise<void> {
    const token = getSessionToken();
    const numericMemberId = parseVoteTargetUserId(memberId);
    if (!token || numericMemberId === null) {
        pushUserActivity({
            kind: "team_achievement",
            title: "ГОЛОС КОМАНДЫ",
            description: `Оценка ${score}/5 сохранена локально.`
        });
        return;
    }

    await createVote(token, numericMemberId, score);
    await refreshTeamWorkspace();
}

function parseLocalDateTimeToUtc(value: string): string | null {
    const trimmed = value.trim();
    if (!trimmed) {
        return null;
    }

    const date = new Date(trimmed);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

async function submitTeamRescueDraftToAssignments(draft: TeamRescueDraft): Promise<void> {
    queueRescueAssignmentTask(draft);
    // TODO(assignments-section): передать draft в раздел «ЗАДАНИЯ», когда раздел будет реализован.
}

async function submitTeamRescueRequest(draft: TeamRescueDraft): Promise<void> {
    const token = getSessionToken();
    const toTeamId = Number(draft.targetTeamId);
    if (!token || !Number.isFinite(toTeamId) || toTeamId <= 0) {
        pushUserActivity({
            kind: "rescue_sent",
            title: "ЗАПРОС СПАСЕНИЯ",
            description: `Тема: «${draft.topic.trim()}». Запрос сохранен локально.`
        });
        return;
    }

    const created = await createHelpRequest(token, {
        toTeamId,
        topic: draft.topic.trim(),
        tag: draft.tag.trim(),
        description: draft.description.trim(),
        format: "Воркшоп",
        scheduledAtUtc: parseLocalDateTimeToUtc(draft.deadline),
        leagueLabel: draft.league.trim(),
        bonusPoints: 10
    });
    appState.teamHelpRequests = [created, ...appState.teamHelpRequests.filter((item) => item.id !== created.id)];
    await refreshTeamWorkspace();
}

async function submitHelpRequestStatus(id: number, status: string): Promise<void> {
    const token = getSessionToken();
    if (!token) {
        return;
    }

    const updated = await updateHelpRequestStatus(token, id, status);
    appState.teamHelpRequests = appState.teamHelpRequests.map((item) => item.id === updated.id ? updated : item);
    await refreshTeamWorkspace();
}

async function requestTeamJoin(teamId: number): Promise<void> {
    const token = getSessionToken();
    if (!token) {
        throw new Error("Войдите в аккаунт, чтобы отправить заявку в команду.");
    }

    const created = await createTeamJoinRequest(token, teamId, "Хочу присоединиться к команде.");
    appState.teamJoinRequests = [
        created,
        ...appState.teamJoinRequests.filter((item) => item.id !== created.id)
    ];
    await refreshTeamWorkspace();
}

function applyServerTeamState(team: TeamResponse): void {
    appState.currentTeam = team;
    appState.localCreatedTeam = null;

    const profile = appState.profile;
    if (profile) {
        localStorage.removeItem(localTeamStorageKey(profile.id));
        appState.profile = {
            ...profile,
            teamId: team.id,
            teamName: team.name,
            teamInviteCode: team.inviteCode,
            isCaptain: team.captainId === profile.id,
            teamScore: team.score,
            role: team.captainId === profile.id ? "Captain" : profile.role
        };
    }

    appState.profileInviteLink = buildTeamInviteLink();
}

async function refreshTeamCatalog(query = ""): Promise<void> {
    const token = getSessionToken();
    if (!token) {
        return;
    }

    try {
        appState.teamCatalog = query.trim()
            ? await searchTeams(token, query.trim())
            : await fetchTeams(token);
    } catch {
        appState.teamCatalog = [];
    }
}

async function submitProfileTeamCreate(button?: HTMLButtonElement): Promise<void> {
    const nameInputEl = isHTMLElement(profileMount) ? profileMount.querySelector("#profileTeamNameInput") : null;
    const name = (
        isHTMLInputElement(nameInputEl) ? nameInputEl.value : appState.profileCreateTeamName
    ).trim() || "КОМАНДА";
    const direction = appState.profileCreateTeamDirection.trim();

    appState.profileCreateTeamName = name;
    if (button) {
        button.disabled = true;
    }

    try {
        await createTeamFromBridge(name, direction);
        appState.profileModal = "teamSuccess";
        teamFlowState.noTeamView = "landing";
        render();
    } catch (error: unknown) {
        setStatus(getErrorMessage(error), "error");
        render();
    } finally {
        if (button) {
            button.disabled = false;
        }
    }
}

async function submitTeamJoinRequestStatus(id: number, status: string): Promise<void> {
    const token = getSessionToken();
    if (!token) {
        return;
    }

    const updated = await updateTeamJoinRequestStatus(token, id, status);
    appState.teamJoinRequests = appState.teamJoinRequests.map((item) => item.id === updated.id ? updated : item);
    await refreshCurrentUserProfile();
    await refreshTeamWorkspace();
}

function getPendingTeamJoinRequests(): TeamJoinRequestResponse[] {
    const currentTeamId = appState.currentTeam?.id ?? appState.profile?.teamId ?? 0;
    return appState.teamJoinRequests.filter((request) =>
        request.teamId === currentTeamId &&
        request.status === "Pending"
    );
}

function findTeamJoinRequestById(requestId: number): TeamJoinRequestResponse | undefined {
    return appState.teamJoinRequests.find((request) => request.id === requestId);
}

function isViewingExternalProfile(): boolean {
    return appState.externalProfileView !== null;
}

function clearExternalProfileView(): void {
    appState.externalProfileView = null;
    appState.externalProfileRating = null;
}

function getActiveJoinRequestForExternalProfile(): TeamJoinRequestResponse | undefined {
    const view = appState.externalProfileView;
    if (!view || view.source !== "join-request" || !view.requestId) {
        return undefined;
    }

    const request = findTeamJoinRequestById(view.requestId);
    if (!request || request.status !== "Pending") {
        return undefined;
    }

    return request;
}

function validateExternalProfileView(): void {
    const view = appState.externalProfileView;
    if (!view) {
        return;
    }

    if (view.source === "join-request" && !getActiveJoinRequestForExternalProfile()) {
        clearExternalProfileView();
        return;
    }

    if (view.source === "team-member") {
        const stillInTeam = getTeamMembersForView().some(
            (member) => parseVoteTargetUserId(member.id) === view.userId
        );
        if (!stillInTeam) {
            clearExternalProfileView();
        }
    }
}

function returnFromExternalProfile(): void {
    const source = appState.externalProfileView?.source;
    clearExternalProfileView();
    appState.dashboardSection = "team";
    persistDashboardSectionToStorage();
    appState.teamModal = source === "join-request" ? "requests" : "none";
    render();
}

function openExternalUserProfile(view: ExternalProfileView): void {
    const currentUserId = appState.profile?.id;
    if (currentUserId != null && view.userId === currentUserId) {
        clearExternalProfileView();
        appState.teamModal = "none";
        appState.dashboardSection = "profile";
        persistDashboardSectionToStorage();
        render();
        return;
    }

    appState.externalProfileView = view;
    appState.externalProfileRating = null;
    appState.teamModal = "none";
    appState.dashboardSection = "profile";
    persistDashboardSectionToStorage();
    render();

    const token = getSessionToken();
    if (!token) {
        return;
    }

    void fetchRatingUserById(token, view.userId)
        .then((ratingUser) => {
            if (appState.externalProfileView?.userId !== view.userId) {
                return;
            }

            appState.externalProfileRating = ratingUser;
            render();
        })
        .catch(() => {
            // Профиль отображается по данным команды или заявки.
        });
}

function openTeamRequestApplicantProfile(requestId: number): void {
    const request = findTeamJoinRequestById(requestId);
    if (!request || request.status !== "Pending") {
        return;
    }

    openExternalUserProfile({
        userId: request.userId,
        source: "join-request",
        requestId,
        fallbackName: request.displayName || request.userName,
        fallbackAvatarUrl: request.avatarUrl
    });
}

function openTeamMemberProfile(memberId: string): void {
    const userId = parseVoteTargetUserId(memberId);
    if (userId === null) {
        return;
    }

    const member = getTeamMembersForView().find(
        (item) => parseVoteTargetUserId(item.id) === userId
    );

    openExternalUserProfile({
        userId,
        source: "team-member",
        fallbackName: member?.displayName,
        fallbackAvatarUrl: member?.avatarUrl
    });
}

function handleTeamJoinRequestDecision(id: number, status: string): void {
    void submitTeamJoinRequestStatus(id, status)
        .then(() => {
            const pendingCount = getPendingTeamJoinRequests().length;
            appState.teamRequestsCurrentIndex = Math.min(
                appState.teamRequestsCurrentIndex,
                Math.max(0, pendingCount - 1)
            );
            setStatus(
                status === "Accepted"
                    ? "Заявка на вступление принята."
                    : "Заявка на вступление отклонена."
            );
            returnFromExternalProfile();
        })
        .catch((error: unknown) => {
            setStatus(getErrorMessage(error), "error");
            render();
        });
}

async function joinTeamByInviteCode(code: string): Promise<JoinTeamResult> {
    const token = getSessionToken();
    if (token) {
        try {
            const team = await joinTeamApi(token, code.trim());
            applyServerTeamState(team);
            await refreshCurrentUserProfile();
            await refreshTeamWorkspace();
            pushUserActivity({
                kind: "team_joined",
                title: "ВСТУПЛЕНИЕ В КОМАНДУ",
                description: `Вы присоединились к команде «${team.name}».`
            });
            return { ok: true, errorMessage: "" };
        } catch (error) {
            return { ok: false, errorMessage: getErrorMessage(error) };
        }
    }

    if (!isDemoInviteCodeValid(code)) {
        return { ok: false, errorMessage: "НЕВЕРНЫЙ КОД ПРИГЛАШЕНИЯ" };
    }

    const normalized = normalizeInviteCode(code);
    const captain = buildLocalCaptainMemberRow();
    const members = captain ? [captain] : [];
    appState.localCreatedTeam = {
        name: "КОМАНДА ДЕМО",
        inviteCode: normalized,
        direction: "ВСТУПЛЕНИЕ ПО КОДУ",
        members
    };
    persistLocalTeam();

    if (appState.profile) {
        appState.profile = {
            ...appState.profile,
            teamName: appState.localCreatedTeam.name,
            teamInviteCode: appState.localCreatedTeam.inviteCode
        };
    }

    pushUserActivity({
        kind: "team_joined",
        title: "ВСТУПЛЕНИЕ В КОМАНДУ",
        description: `Вы присоединились к команде «${appState.localCreatedTeam.name}».`
    });

    return { ok: true, errorMessage: "" };
}

async function createTeamFromBridge(name: string, direction: string): Promise<void> {
    const teamName = name.trim() || "КОМАНДА";
    const token = getSessionToken();
    if (token) {
        const team = await createTeamApi(token, {
            name: teamName,
            description: direction.trim()
        });
        applyServerTeamState(team);

        try {
            await refreshCurrentUserProfile();
        } catch {
            applyServerTeamState(team);
        }

        try {
            await refreshTeamWorkspace();
        } catch {
            applyServerTeamState(team);
        }

        pushUserActivity({
            kind: "team_created",
            title: "КОМАНДА СОЗДАНА",
            description: `Создана команда «${team.name}»${team.description ? ` · ${team.description}` : ""}.`
        });
        return;
    }

    const invite = appState.profile?.teamInviteCode?.trim() || `local-${Date.now().toString(36)}`;
    const link = `${window.location.origin}/team/${encodeURIComponent(teamName)}?invite=${encodeURIComponent(invite)}`;
    appState.profileInviteLink = link;
    const captain = buildLocalCaptainMemberRow();
    const members = captain ? [captain] : [];
    appState.localCreatedTeam = {
        name: teamName,
        inviteCode: invite,
        direction: direction.trim(),
        members
    };
    persistLocalTeam();

    if (appState.profile) {
        appState.profile = {
            ...appState.profile,
            teamName: appState.localCreatedTeam.name,
            teamInviteCode: appState.localCreatedTeam.inviteCode,
            isCaptain: true
        };
    }

    pushUserActivity({
        kind: "team_created",
        title: "КОМАНДА СОЗДАНА",
        description: `Создана команда «${teamName}»${direction ? ` · ${direction}` : ""}.`
    });
}

async function bootstrap(): Promise<void> {
    loadPersistedUserEvents();
    loadPersistedActivityFeed();
    loadPersistedNewsFeed();

    if (isHTMLElement(authSwitchColumn) && isHTMLElement(authModalCard)) {
        bindMobileAuthCurtain(authSwitchColumn, authModalCard);
    }

    setAppBridge({
        render,
        setStatus,
        clearStatus,
        isCurrentUserCaptain: isTeamCaptain,
        hasTeamAccess,
        getTeamTitle: () => getEffectiveTeamName() || "НАЗВАНИЕ",
        getTeamSubtitle: () => getEffectiveTeamDescription(),
        getTeamMembers: getTeamMembersForView,
        getTeamKrk: () => getEffectiveTeamKrk(),
        getTeamScore: () => getEffectiveTeamScore(),
        getTeamInviteCode: () => getEffectiveInviteCode(),
        getTeamHistory: getTeamHistoryItems,
        getJoinableTeams: getJoinableTeams,
        getCurrentUserAvatarUrl: () => getAvatarDisplay(),
        getCurrentUserId: () => String(appState.profile?.id ?? ""),
        isCurrentUser: (userId: string) => {
            const currentId = appState.profile?.id;
            if (currentId == null) {
                return false;
            }
            return isSameUserId(userId, currentId);
        },
        joinTeamByInviteCode,
        requestTeamJoin,
        createTeam: createTeamFromBridge,
        createTeamCheckIn: submitTeamCheckIn,
        submitTeamVote,
        createTeamRescueRequest: submitTeamRescueRequest,
        updateTeamHelpRequestStatus: submitHelpRequestStatus,
        openTeamOverlayModal: (kind, memberIndex) => openTeamModal(kind, memberIndex),
        openTeamMemberProfile,
        openTeamOnboardingModal: openTeamOnboardingModal,
        openTeamRescue: openRescueModal,
        navigateToRating: openRatingDashboard,
        navigateToEvents: () => {
            appState.dashboardSection = "events";
            resetEventsCalendarToToday();
            persistDashboardSectionToStorage();
            clearStatus();
            render();
        },
        addCalendarEventFromDraft: (draft: EventCreateDraft) => {
            const added = appendCreatedEventToCalendar(draft);
            if (added) {
                appState.dashboardSection = "events";
                persistDashboardSectionToStorage();
            }
            return added;
        },
        pushActivity: pushUserActivity
    });

    document.addEventListener(TEAM_RESCUE_OPEN_EVENT, () => {
        openRescueModal();
    });

    const session = loadSession();
    render();

    if (!session) {
        return;
    }

    appState.isSubmitting = true;
    appState.view = "sign-in";
    clearStatus();
    render();

    try {
        appState.profile = await fetchCurrentUser(session.token);
        applyPersistedClientStateAfterMe();
        await refreshTeamWorkspace();
        await refreshRatingWorkspace();
        appState.view = "account";
        clearStatus();
    } catch (error) {
        clearSession();
        setStatus(getErrorMessage(error), "error");
        appState.view = "sign-in";
    } finally {
        appState.isSubmitting = false;
        render();
    }
}

function bindMobileAuthCurtain(switchColumn: HTMLElement, modalCard: HTMLElement): void {
    let startY = 0;
    let activePointerId: number | null = null;
    let isDragging = false;
    let dragMaxDistance = 1;
    const clearDragState = (): void => {
        modalCard.classList.remove("is-mobile-dragging");
        modalCard.style.removeProperty("--auth-mobile-drag-offset");
        modalCard.style.removeProperty("--auth-mobile-drag-progress");
        modalCard.style.removeProperty("--auth-mobile-active-opacity");
        modalCard.style.removeProperty("--auth-mobile-copy-offset");
        switchColumn.style.removeProperty("touch-action");
        isDragging = false;
        activePointerId = null;
        dragMaxDistance = 1;
    };

    const getTargetView = (): View | null => {
        if (appState.view === "sign-in") {
            return "sign-up";
        }

        if (appState.view === "sign-up" || appState.view === "password-recovery") {
            return "sign-in";
        }

        return null;
    };

    const switchToTargetView = (): void => {
        const nextView = getTargetView();
        if (!nextView) {
            return;
        }

        if (nextView === "sign-up") {
            resetSignUpDraft();
        }

        clearStatus();
        setView(nextView);
    };

    const getDragDistance = (currentY: number): number => {
        if (appState.view === "sign-in") {
            return startY - currentY;
        }

        return currentY - startY;
    };

    const getMaxDistance = (): number => {
        const cardHeight = modalCard.getBoundingClientRect().height;
        const switchHeight = switchColumn.getBoundingClientRect().height;
        return Math.max(cardHeight / 2 - switchHeight, 1);
    };

    switchColumn.addEventListener("pointerdown", (event: PointerEvent) => {
        if (
            !window.matchMedia(MOBILE_AUTH_QUERY).matches ||
            appState.isSubmitting ||
            !getTargetView() ||
            event.button !== 0
        ) {
            return;
        }

        const target = event.target;
        if (target instanceof Element && target.closest("[data-view]")) {
            return;
        }

        startY = event.clientY;
        activePointerId = event.pointerId;
        dragMaxDistance = getMaxDistance();
        modalCard.style.setProperty("--auth-mobile-drag-offset", "0px");
        modalCard.style.setProperty("--auth-mobile-drag-progress", "0");
        switchColumn.style.touchAction = "none";
        switchColumn.setPointerCapture(event.pointerId);
    });

    switchColumn.addEventListener("pointermove", (event: PointerEvent) => {
        if (activePointerId !== event.pointerId) {
            return;
        }

        const rawDistance = getDragDistance(event.clientY);
        const distance = Math.max(rawDistance, 0);
        const maxDistance = dragMaxDistance;
        const progress = Math.min(distance / maxDistance, 1);

        if (distance > 4) {
            isDragging = true;
            modalCard.classList.add("is-mobile-dragging");
            event.preventDefault();
        }

        modalCard.style.setProperty("--auth-mobile-drag-offset", `${Math.min(distance, maxDistance)}px`);
        modalCard.style.setProperty("--auth-mobile-drag-progress", progress.toFixed(3));
    });

    const endDrag = (event: PointerEvent): void => {
        if (activePointerId !== event.pointerId) {
            return;
        }

        const distance = Math.max(getDragDistance(event.clientY), 0);
        const maxDistance = dragMaxDistance;
        const shouldSwitch = isDragging && (distance > Math.min(32, maxDistance * 0.35) || distance / maxDistance > 0.35);

        if (switchColumn.hasPointerCapture(event.pointerId)) {
            switchColumn.releasePointerCapture(event.pointerId);
        }

        clearDragState();

        if (shouldSwitch) {
            switchToTargetView();
        }
    };

    switchColumn.addEventListener("pointerup", endDrag);
    switchColumn.addEventListener("pointercancel", (event: PointerEvent) => {
        if (activePointerId !== event.pointerId) {
            return;
        }

        if (switchColumn.hasPointerCapture(event.pointerId)) {
            switchColumn.releasePointerCapture(event.pointerId);
        }

        clearDragState();
    });

    switchColumn.addEventListener("click", (event: MouseEvent) => {
        if (window.matchMedia(MOBILE_AUTH_QUERY).matches) {
            event.preventDefault();
            event.stopPropagation();
        }
    });
}

function render(): void {
    if (
        !isHTMLElement(homeScreen) ||
        !isHTMLElement(appScreen) ||
        !isHTMLElement(authLayout) ||
        !isHTMLElement(authModalCard) ||
        !isHTMLElement(authSwitchColumn) ||
        !isHTMLElement(formContent)
    ) {
        return;
    }

    const isHome = appState.view === "home";
    const isAccount = appState.view === "account";

    homeScreen.classList.add("screen-active");
    homeScreen.classList.toggle("menu-screen--background", !isHome);
    homeScreen.setAttribute("aria-hidden", String(!isHome));
    appScreen.classList.toggle("screen-active", !isHome);
    appScreen.classList.toggle("is-account", isAccount);
    appScreen.setAttribute("aria-hidden", String(isHome));
    document.body.classList.toggle("modal-open", !isHome && !isAccount);

    if (isHTMLElement(profileShell) && isHTMLElement(profileMount)) {
        profileShell.classList.toggle("hidden", !isAccount);
        profileShell.setAttribute("aria-hidden", String(!isAccount));
        authLayout.classList.toggle("hidden", isAccount);
    }

    if (!isHome) {
        if (isAccount) {
            renderProfileView();
        } else {
            renderAuthView();
        }
    }
}

function renderAuthView(): void {
    if (
        !isHTMLElement(authLayout) ||
        !isHTMLElement(authModalCard) ||
        !isHTMLElement(authSwitchColumn) ||
        !isHTMLElement(formContent)
    ) {
        return;
    }

    authModalCard.classList.toggle("mode-sign-up", appState.view === "sign-up");
    authModalCard.classList.toggle("mode-recovery", appState.view === "password-recovery");

    if (appState.view === "sign-in") {
        const signInSubmitDisabled = appState.isSubmitting || !isSignInReady();

        authSwitchColumn.innerHTML = renderAuthSwitchStage();

        formContent.innerHTML = `
            <form id="signInForm" class="auth-form auth-form-modal" novalidate>
                <h1 class="auth-modal-heading">Уже с нами?</h1>
                <input class="auth-modal-field" name="email" type="email" placeholder="ЭЛЕКТРОННАЯ ПОЧТА" value="${escapeHtml(appState.signIn.email)}" autocomplete="email" required readonly onfocus="this.removeAttribute('readonly');">
                <div class="auth-login-password-row">
                    <input class="auth-modal-field auth-modal-field-password" name="password" type="password" placeholder="ПАРОЛЬ" value="${escapeHtml(appState.signIn.password)}" autocomplete="current-password" required>
                    <button class="auth-password-peek-button" type="button" aria-label="Показать пароль, пока кнопка зажата" data-signin-password-peek>
                        <span class="auth-password-peek-icon" aria-hidden="true"></span>
                    </button>
                </div>
                ${renderSignInFeedbackBlock()}
                <button class="auth-submit-pill" type="submit" ${signInSubmitDisabled ? "disabled" : ""}>
                    ${appState.isSubmitting ? "ПОДКЛЮЧЕНИЕ..." : "ПРИСОЕДИНИТЬСЯ"}
                </button>
            </form>
        `;

        const signInForm = getRequiredElement<HTMLFormElement>("#signInForm", isHTMLFormElement);
        const signInSubmitButton = signInForm.querySelector(".auth-submit-pill");
        const syncSignInSubmitState = (): void => {
            if (isHTMLButtonElement(signInSubmitButton)) {
                signInSubmitButton.disabled = appState.isSubmitting || !isSignInReady();
            }
        };

        const passwordInput = signInForm.elements.namedItem("password");
        const passwordPeekButton = signInForm.querySelector("[data-signin-password-peek]");
        if (isHTMLInputElement(passwordInput)) {
            const passwordRow = passwordInput.closest(".auth-login-password-row");
            if (isHTMLButtonElement(passwordPeekButton)) {
                bindPressToRevealPassword(passwordPeekButton, passwordInput);
                syncPasswordPeekButtonState(passwordPeekButton, passwordInput, passwordRow);

                passwordRow?.addEventListener("focusin", () => {
                    syncPasswordPeekButtonState(passwordPeekButton, passwordInput, passwordRow);
                });
                passwordRow?.addEventListener("focusout", () => {
                    window.setTimeout(() => {
                        syncPasswordPeekButtonState(passwordPeekButton, passwordInput, passwordRow);
                    }, 0);
                });
            }

            passwordInput.addEventListener("input", () => {
                appState.signIn.password = passwordInput.value;
                if (isHTMLButtonElement(passwordPeekButton)) {
                    syncPasswordPeekButtonState(passwordPeekButton, passwordInput, passwordRow);
                }
                syncSignInSubmitState();
            });
        }

        const emailInput = signInForm.elements.namedItem("email");
        if (isHTMLInputElement(emailInput)) {
            emailInput.addEventListener("input", () => {
                appState.signIn.email = emailInput.value;
                syncSignInSubmitState();
            });
        }

        syncSignInSubmitState();

        signInForm.addEventListener("submit", (event: SubmitEvent) => {
            event.preventDefault();
            if (!isSignInReady()) {
                syncSignInSubmitState();
                return;
            }
            void submitLogin(signInForm);
        });
    }

    if (appState.view === "sign-up") {
        const signUpSubmitDisabled = appState.isSubmitting || !isSignUpReady();

        authSwitchColumn.innerHTML = renderAuthSwitchStage();

        formContent.innerHTML = `
            <form id="signUpForm" class="auth-form auth-form-modal" novalidate>
                <h1 class="auth-modal-heading">Новый игрок?</h1>
                <input class="auth-modal-field" name="email" type="email" placeholder="ЭЛЕКТРОННАЯ ПОЧТА" value="${escapeHtml(appState.signUp.email)}" autocomplete="email" required readonly onfocus="this.removeAttribute('readonly');">
                <div class="auth-reveal-field ${appState.signUp.email.trim() ? "" : "hidden"}" data-signup-password-shell ${appState.signUp.email.trim() ? "" : "hidden"}>
                    <div class="auth-password-row">
                        <input class="auth-modal-field auth-modal-field-password" name="password" type="password" placeholder="ПАРОЛЬ" value="${escapeHtml(appState.signUp.password)}" autocomplete="new-password" required minlength="6" ${appState.signUp.email.trim() ? "" : "disabled"}>
                        <button class="auth-password-peek-button" type="button" aria-label="Показать пароль, пока кнопка зажата" data-signup-password-peek ${appState.signUp.email.trim() ? "" : "disabled"}>
                            <span class="auth-password-peek-icon" aria-hidden="true"></span>
                        </button>
                    </div>
                </div>
                <div class="auth-reveal-field ${appState.signUp.password ? "" : "hidden"}" data-signup-confirm-shell ${appState.signUp.password ? "" : "hidden"}>
                    <input class="auth-modal-field" name="passwordConfirm" type="password" placeholder="ПОДТВЕРЖДЕНИЕ ПАРОЛЯ" value="${escapeHtml(appState.signUp.passwordConfirm)}" autocomplete="new-password" required minlength="6" ${appState.signUp.password ? "" : "disabled"}>
                </div>
                ${renderStatusBlock()}
                <button class="auth-submit-pill" type="submit" ${signUpSubmitDisabled ? "disabled" : ""}>
                    ${appState.isSubmitting ? "СОЗДАНИЕ..." : "ПРИСОЕДИНИТЬСЯ"}
                </button>
            </form>
        `;

        initializeSignUpForm(getRequiredElement<HTMLFormElement>("#signUpForm", isHTMLFormElement));
    }

    if (appState.view === "password-recovery") {
        authSwitchColumn.innerHTML = `
            ${renderAuthSwitchPanel(
                "Уже с нами?",
                "Вернись ко входу, если пароль вспомнился.",
                "ВХОД",
                "sign-in"
            )}
        `;

        formContent.innerHTML = `
            <form id="recoveryForm" class="auth-form auth-form-modal">
                <h1 class="auth-modal-heading">Новый игрок?</h1>
                <input class="auth-modal-field" name="email" type="email" placeholder="ЭЛЕКТРОННАЯ ПОЧТА" value="${escapeHtml(appState.signIn.email)}" autocomplete="email">
                <div class="auth-login-password-row auth-code-row">
                    <input class="auth-modal-field auth-modal-field-password" name="code" type="text" placeholder="КОД" inputmode="numeric">
                    <button class="auth-inline-pill" type="button" id="repeatRecoveryCode">ПОВТОРИТЬ</button>
                </div>
                ${renderStatusBlock()}
                <button class="auth-submit-pill" type="button" disabled>ПРИСОЕДИНИТЬСЯ</button>
            </form>
        `;

        const recoveryForm = getRequiredElement<HTMLFormElement>("#recoveryForm", isHTMLFormElement);
        const emailInput = recoveryForm.elements.namedItem("email");
        if (isHTMLInputElement(emailInput)) {
            emailInput.addEventListener("input", () => {
                appState.signIn.email = emailInput.value;
            });
        }

        const repeatButton = recoveryForm.querySelector("#repeatRecoveryCode");
        if (isHTMLButtonElement(repeatButton)) {
            repeatButton.addEventListener("click", () => {
                setStatus("Код отправлен повторно.");
                updateStatusBlock();
            });
        }

        recoveryForm.addEventListener("submit", (event: SubmitEvent) => {
            event.preventDefault();
        });
    }

    authLayout.querySelectorAll<HTMLElement>("[data-view]").forEach((button) => {
        button.addEventListener("click", () => {
            const nextView = button.dataset.view as View | undefined;
            if (!nextView) {
                return;
            }

            if (nextView === "sign-up" && appState.view !== "sign-up") {
                resetSignUpDraft();
            }

            clearStatus();
            setView(nextView);
        });
    });
}

function renderAuthSwitchStage(): string {
    return `
        <div class="auth-switch-stage">
            ${renderAuthSwitchCopy(
                "auth-switch-copy auth-switch-copy-sign-up",
                "Уже с нами?",
                "Войди в свой аккаунт, чтобы проверить свежий рейтинг команд!",
                "ВХОД",
                "sign-in"
            )}
            ${renderAuthSwitchCopy(
                "auth-switch-copy auth-switch-copy-sign-in",
                "Новый игрок?",
                "Твоей будущей команде не хватает именно тебя. Создай аккаунт, зарабатывай ачивки и прокачивай КРК!",
                "РЕГИСТРАЦИЯ",
                "sign-up"
            )}
        </div>
    `;
}

function renderAuthSwitchCopy(className: string, title: string, copy: string, buttonLabel: string, nextView: View): string {
    return `
        <div class="${className}">
            ${renderAuthSwitchPanel(title, copy, buttonLabel, nextView)}
        </div>
    `;
}

function renderAuthSwitchPanel(title: string, copy: string, buttonLabel: string, nextView: View): string {
    return `
        <div class="auth-switch-panel">
            <div class="auth-switch-panel-content">
                <h2 class="auth-panel-title">${escapeHtml(title)}</h2>
                <p class="auth-panel-copy">${escapeHtml(copy)}</p>
                <button type="button" class="auth-switch-pill" data-view="${nextView}">${escapeHtml(buttonLabel)}</button>
            </div>
        </div>
    `;
}

function isSignInReady(): boolean {
    return appState.signIn.email.trim().length > 0 && appState.signIn.password.length > 0;
}

function isSignUpReady(): boolean {
    return (
        appState.signUp.email.trim().length > 0 &&
        appState.signUp.password.length > 0 &&
        appState.signUp.password === appState.signUp.passwordConfirm
    );
}

function bindPressToRevealPassword(button: HTMLButtonElement, passwordInput: HTMLInputElement): () => void {
    const setPasswordVisible = (isVisible: boolean): void => {
        const canReveal = !button.disabled && !passwordInput.disabled;
        passwordInput.type = isVisible && canReveal ? "text" : "password";
        button.classList.toggle("is-active", isVisible && canReveal);
    };

    button.addEventListener("pointerdown", (event: PointerEvent) => {
        if (button.disabled || passwordInput.disabled) {
            return;
        }

        event.preventDefault();
        button.setPointerCapture(event.pointerId);
        setPasswordVisible(true);
    });

    button.addEventListener("pointerup", () => {
        setPasswordVisible(false);
    });

    button.addEventListener("pointercancel", () => {
        setPasswordVisible(false);
    });

    button.addEventListener("lostpointercapture", () => {
        setPasswordVisible(false);
    });

    button.addEventListener("blur", () => {
        setPasswordVisible(false);
    });

    return () => {
        setPasswordVisible(false);
    };
}

function syncPasswordPeekButtonState(
    button: HTMLButtonElement,
    passwordInput: HTMLInputElement,
    passwordRow: Element | null = passwordInput.closest(".auth-login-password-row, .auth-password-row")
): void {
    button.disabled = passwordInput.disabled || !passwordRow?.matches(":focus-within");

    if (button.disabled) {
        passwordInput.type = "password";
        button.classList.remove("is-active");
    }
}

function initializeSignUpForm(signUpForm: HTMLFormElement): void {
    const emailInput = signUpForm.elements.namedItem("email");
    const passwordInput = signUpForm.elements.namedItem("password");
    const passwordConfirmInput = signUpForm.elements.namedItem("passwordConfirm");
    const passwordShell = signUpForm.querySelector<HTMLElement>("[data-signup-password-shell]");
    const confirmShell = signUpForm.querySelector<HTMLElement>("[data-signup-confirm-shell]");
    const passwordPeekButton = signUpForm.querySelector("[data-signup-password-peek]");
    const passwordRow = signUpForm.querySelector(".auth-password-row");
    const submitButton = signUpForm.querySelector(".auth-submit-pill");

    if (
        !isHTMLInputElement(emailInput) ||
        !isHTMLInputElement(passwordInput) ||
        !isHTMLInputElement(passwordConfirmInput) ||
        !passwordShell ||
        !confirmShell
    ) {
        return;
    }

    const resetPasswordVisibility = isHTMLButtonElement(passwordPeekButton)
        ? bindPressToRevealPassword(passwordPeekButton, passwordInput)
        : () => {};

    if (isHTMLButtonElement(passwordPeekButton)) {
        passwordRow?.addEventListener("focusin", () => {
            syncPasswordPeekButtonState(passwordPeekButton, passwordInput, passwordRow);
        });
        passwordRow?.addEventListener("focusout", () => {
            window.setTimeout(() => {
                syncPasswordPeekButtonState(passwordPeekButton, passwordInput, passwordRow);
            }, 0);
        });
    }

    const syncVisibleFields = (): void => {
        appState.signUp.email = emailInput.value;
        appState.signUp.password = passwordInput.value;
        appState.signUp.passwordConfirm = passwordConfirmInput.value;

        const hasEmail = Boolean(emailInput.value.trim());

        if (!hasEmail) {
            appState.signUp.password = "";
            appState.signUp.passwordConfirm = "";
            passwordInput.value = "";
            passwordConfirmInput.value = "";
        }

        const hasPassword = Boolean(passwordInput.value);
        const passwordsMatch = hasPassword && passwordInput.value === passwordConfirmInput.value;
        const shouldShowConfirm = hasPassword && !passwordsMatch;

        if (!hasPassword) {
            appState.signUp.passwordConfirm = "";
            passwordConfirmInput.value = "";
        }

        passwordShell.classList.toggle("hidden", !hasEmail);
        passwordShell.hidden = !hasEmail;
        passwordInput.disabled = !hasEmail;
        confirmShell.classList.toggle("hidden", !shouldShowConfirm);
        confirmShell.hidden = !shouldShowConfirm;
        passwordConfirmInput.disabled = !shouldShowConfirm;
        resetPasswordVisibility();

        if (isHTMLButtonElement(passwordPeekButton)) {
            syncPasswordPeekButtonState(passwordPeekButton, passwordInput, passwordRow);
        }

        if (isHTMLButtonElement(submitButton)) {
            submitButton.disabled = appState.isSubmitting || !isSignUpReady();
        }
    };

    emailInput.addEventListener("input", () => {
        appState.signUp.email = emailInput.value;
        syncVisibleFields();
    });

    passwordInput.addEventListener("input", () => {
        appState.signUp.password = passwordInput.value;
        syncVisibleFields();
    });

    passwordConfirmInput.addEventListener("input", () => {
        appState.signUp.passwordConfirm = passwordConfirmInput.value;
        syncVisibleFields();
    });

    syncVisibleFields();
    window.setTimeout(syncVisibleFields, 100);

    signUpForm.addEventListener("submit", (event: SubmitEvent) => {
        event.preventDefault();
        if (!isSignUpReady()) {
            syncVisibleFields();
            return;
        }
        void submitRegister(signUpForm);
    });
}

function buildFullNameFromProfile(profile: UserProfileResponse | null): string {
    if (!profile) {
        return "";
    }

    const pair = [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim();
    return pair;
}

function getFullNameDisplay(): string {
    if (appState.profileEdits) {
        return appState.profileEdits.fullName.trim();
    }
    return buildFullNameFromProfile(appState.profile);
}

function getGroupDisplay(): string {
    return appState.profileEdits?.group ?? appState.profile?.groupTitle ?? "";
}

function getAvatarDisplay(): string {
    return appState.profileEdits?.avatarDataUrl ?? appState.profile?.avatarUrl ?? "";
}

function hasProfileAchievements(profile: UserProfileResponse | null): boolean {
    if (FORCE_DEMO_PROFILE_ACHIEVEMENTS) {
        return true;
    }

    return Boolean(profile);
}

function resetProfileUi(): void {
    appState.profileEdits = null;
    appState.profileModal = "none";
    appState.profileAchievementId = "";
    appState.profileCreateTeamName = "";
    appState.profileCreateTeamDirection = "";
    appState.profileFindTeamQuery = "";
    appState.profileFindTeamSelectedId = null;
    appState.profileInviteLink = "";
    appState.profileFormDraft = null;
    appState.dashboardSection = "profile";
    appState.teamModal = "none";
    appState.teamVoteMemberIndex = 0;
    appState.teamRequestsCurrentIndex = 0;
    appState.teamRequestsInviteLink = "";
    appState.externalProfileView = null;
    appState.externalProfileRating = null;
    appState.localCreatedTeam = null;
    appState.currentTeam = null;
    appState.teamCatalog = [];
    appState.teamCheckIns = [];
    appState.teamHelpRequests = [];
    appState.teamJoinRequests = [];
    appState.teamMyVotes = [];
    clearRatingData();
}

function renderVoteModalRowsHtml(): string {
    return `
        <div class="team-history-row" aria-hidden="true"></div>
        <div class="team-history-row">
            <span class="team-history-points-pill">БАЛЛЫ</span>
        </div>
        <div class="team-history-row" aria-hidden="true"></div>
        <div class="team-history-row team-history-row--points-leading">
            <span class="team-history-points-pill">БАЛЛЫ</span>
        </div>`;
}

function hasTeamAccess(): boolean {
    return Boolean(appState.currentTeam) || Boolean(appState.profile?.teamId) || Boolean(appState.localCreatedTeam);
}

function getEffectiveTeamName(): string {
    return (
        appState.currentTeam?.name?.trim() ||
        appState.profile?.teamName?.trim() ||
        appState.localCreatedTeam?.name ||
        ""
    );
}

function getEffectiveTeamDescription(): string {
    return (
        appState.currentTeam?.description?.trim() ||
        appState.localCreatedTeam?.direction?.trim() ||
        ""
    );
}

function getEffectiveInviteCode(): string {
    return (
        appState.currentTeam?.inviteCode?.trim() ||
        appState.profile?.teamInviteCode?.trim() ||
        appState.localCreatedTeam?.inviteCode ||
        ""
    );
}

function getEffectiveTeamKrk(): string {
    if (appState.currentTeam) {
        return String(Math.round(appState.currentTeam.krk));
    }

    if (appState.profile?.teamScore) {
        return String(Math.round(appState.profile.teamScore));
    }

    return "0";
}

function getEffectiveTeamScore(): string {
    if (appState.currentTeam) {
        return String(appState.currentTeam.score);
    }

    return appState.profile?.teamScore ? String(appState.profile.teamScore) : "—";
}

function buildTeamInviteLink(): string {
    const name = getEffectiveTeamName().trim() || "КОМАНДА";
    const invite =
        getEffectiveInviteCode() ||
        "DEMO-INVITE";
    return `${window.location.origin}/team/${encodeURIComponent(name)}?invite=${encodeURIComponent(invite)}`;
}

function renderTeamJoinRequestPhotoHtml(
    request: TeamJoinRequestResponse | undefined,
    openProfile = false
): string {
    const avatarUrl = request?.avatarUrl?.trim();
    const photoInner = avatarUrl
        ? `<img src="${escapeHtml(avatarUrl)}" alt="" loading="lazy">`
        : `<span class="team-requests-placeholder">Фото</span>`;

    if (openProfile && request) {
        return `
            <button
                type="button"
                class="team-requests-photo team-requests-photo-btn"
                data-team-request-open-profile="${escapeHtml(String(request.id))}"
                aria-label="Открыть профиль ${escapeHtml(request.displayName || request.userName || "участника")}"
            >
                ${photoInner}
            </button>`;
    }

    return `
        <div class="team-requests-photo">
            ${photoInner}
        </div>`;
}

function renderTeamRequestsCarouselHtml(
    pendingJoinRequests: TeamJoinRequestResponse[],
    currentIndex: number,
    canAct: boolean
): string {
    if (pendingJoinRequests.length === 0) {
        return `
            <div class="team-requests-empty-state">
                <p class="team-requests-empty">Никто не подал заявку? Отправь QR или ссылку друзьям</p>
            </div>`;
    }

    const currentRequest = pendingJoinRequests[currentIndex];
    const candidateName =
        currentRequest.displayName?.trim() ||
        currentRequest.userName?.trim() ||
        "Участник";
    const actionsHtml = canAct
        ? `
            <div class="team-requests-actions">
                <button type="button" class="team-requests-btn team-requests-btn--reject" data-team-join-request-status="Rejected" data-team-join-request-id="${escapeHtml(String(currentRequest.id))}" aria-label="Отклонить">
                    <img src="${escapeHtml(rejectIconUrl)}" alt="" aria-hidden="true">
                </button>
                <button type="button" class="team-requests-btn team-requests-btn--accept" data-team-join-request-status="Accepted" data-team-join-request-id="${escapeHtml(String(currentRequest.id))}" aria-label="Принять">
                    <img src="${escapeHtml(acceptIconUrl)}" alt="" aria-hidden="true">
                </button>
            </div>`
        : "";

    return `
        <div class="team-requests-carousel-wrap">
            <button type="button" class="team-requests-nav" id="teamRequestsPrev" ${currentIndex <= 0 ? "disabled" : ""} aria-label="Предыдущий">
                <img src="${escapeHtml(scrollLeftIconUrl)}" alt="" aria-hidden="true">
            </button>
            <div class="team-requests-candidate-card" data-request-id="${escapeHtml(String(currentRequest.id))}">
                ${renderTeamJoinRequestPhotoHtml(currentRequest, Boolean(currentRequest))}
                <p class="team-requests-candidate-name">${escapeHtml(candidateName)}</p>
                <button
                    type="button"
                    class="team-requests-profile-btn"
                    data-team-request-open-profile="${escapeHtml(String(currentRequest.id))}"
                >ПРОФИЛЬ</button>
                ${actionsHtml}
            </div>
            <button type="button" class="team-requests-nav" id="teamRequestsNext" ${currentIndex >= pendingJoinRequests.length - 1 ? "disabled" : ""} aria-label="Следующий">
                <img src="${escapeHtml(scrollRightIconUrl)}" alt="" aria-hidden="true">
            </button>
        </div>`;
}

function localTeamStorageKey(userId: number): string {
    return `${LOCAL_TEAM_STORAGE_PREFIX}${userId}`;
}

function localProfileStorageKey(userId: number): string {
    return `${LOCAL_PROFILE_STORAGE_PREFIX}${userId}`;
}

function readClientProfileBlob(userId: number): Partial<PersistedClientProfileV1> & { dashboardSection?: DashboardSection } {
    const raw = localStorage.getItem(localProfileStorageKey(userId));
    if (!raw) {
        return {};
    }

    try {
        return JSON.parse(raw) as Partial<PersistedClientProfileV1> & { dashboardSection?: DashboardSection };
    } catch {
        return {};
    }
}

function writeClientProfileBlob(userId: number, data: Partial<PersistedClientProfileV1> & { dashboardSection?: DashboardSection }): void {
    const prev = readClientProfileBlob(userId);
    localStorage.setItem(localProfileStorageKey(userId), JSON.stringify({ ...prev, ...data }));
}

function persistSavedProfileEdits(): void {
    const p = appState.profile;
    const e = appState.profileEdits;
    if (!p || !e) {
        return;
    }

    writeClientProfileBlob(p.id, {
        fullName: e.fullName,
        group: e.group,
        avatarDataUrl: e.avatarDataUrl,
        dashboardSection: appState.dashboardSection
    });
}

function persistDashboardSectionToStorage(): void {
    const p = appState.profile;
    if (!p) {
        return;
    }

    writeClientProfileBlob(p.id, { dashboardSection: appState.dashboardSection });
}

function hydrateProfileClientStateFromStorage(): void {
    const p = appState.profile;
    if (!p) {
        return;
    }

    const data = readClientProfileBlob(p.id);
    const hasStoredEdits =
        typeof data.fullName === "string" ||
        typeof data.group === "string" ||
        data.avatarDataUrl !== undefined;

    if (hasStoredEdits) {
        appState.profileEdits = {
            fullName: typeof data.fullName === "string" ? data.fullName : buildFullNameFromProfile(p),
            group: typeof data.group === "string" ? data.group : (p.groupTitle ?? ""),
            avatarDataUrl: data.avatarDataUrl ?? null
        };
        applyProfileEditsToInMemoryProfile();
    }

    if (
        data.dashboardSection === "profile" ||
        data.dashboardSection === "team" ||
        data.dashboardSection === "rating" ||
        data.dashboardSection === "tasks" ||
        data.dashboardSection === "events" ||
        data.dashboardSection === "settings"
    ) {
        appState.dashboardSection =
            data.dashboardSection === "settings" && !isDesktopDashboardLayout()
                ? "profile"
                : data.dashboardSection;
        if (data.dashboardSection === "events") {
            resetEventsCalendarToToday();
        }
    }
}

function applyProfileEditsToInMemoryProfile(): void {
    const profile = appState.profile;
    const edits = appState.profileEdits;
    if (!profile || !edits) {
        return;
    }

    const { firstName, lastName } = splitFullNameForApi(edits.fullName);
    const groupTitle = edits.group.trim();

    appState.profile = {
        ...profile,
        firstName,
        lastName,
        groupTitle: groupTitle || profile.groupTitle,
        avatarUrl: edits.avatarDataUrl ?? profile.avatarUrl
    };
}

function resetEventsCalendarToToday(): void {
    appState.eventsCalendarStartIndex = clampCalendarStartIndex(getTodayCalendarStartIndex());
}

function getEventsCalendarMaxStartIndex(): number {
    return Math.max(0, getEventsCalendarYearDates().length - EVENTS_CALENDAR_VISIBLE_DAYS);
}

function getEventsCalendarSlideDates(): Date[] | null {
    if (!eventsCalendarSlideDirection) {
        return null;
    }

    const startIndex = appState.eventsCalendarStartIndex;
    const yearDates = getEventsCalendarYearDates();

    if (eventsCalendarSlideDirection === "next") {
        return yearDates.slice(startIndex, startIndex + EVENTS_CALENDAR_VISIBLE_DAYS + 1);
    }

    return yearDates.slice(startIndex - 1, startIndex + EVENTS_CALENDAR_VISIBLE_DAYS);
}

function getVisibleEventsCalendarDates(): Date[] {
    const slideDates = getEventsCalendarSlideDates();
    if (slideDates) {
        return slideDates;
    }

    const startIndex = clampCalendarStartIndex(appState.eventsCalendarStartIndex);
    return getEventsCalendarYearDates().slice(startIndex, startIndex + EVENTS_CALENDAR_VISIBLE_DAYS);
}

function formatEventsMonthLabel(date: Date): string {
    const month = EVENTS_MONTH_LABELS[date.getMonth()] ?? "МЕСЯЦ";
    return `${month} ${date.getFullYear()} г.`;
}

function sortEventsByTime(events: CalendarEventItem[]): CalendarEventItem[] {
    return [...events].sort((left, right) => {
        const leftDate = parseEventDateTimeLocal(left.dateTime)?.getTime() ?? 0;
        const rightDate = parseEventDateTimeLocal(right.dateTime)?.getTime() ?? 0;
        return leftDate - rightDate;
    });
}

function getMergedCalendarEventsForDate(date: Date): CalendarEventItem[] {
    const dateKey = dateToDateKey(date);
    return sortEventsByTime([...getDemoEventsForDateKey(dateKey), ...getUserEventsForDateKey(dateKey)]);
}

function getFilteredCalendarEventsForDate(date: Date): CalendarEventItem[] {
    const dayEvents = getMergedCalendarEventsForDate(date);
    if (appState.eventsCalendarScope === "all") {
        return dayEvents;
    }
    return dayEvents.filter((event) => event.isMine);
}

function renderEventsCalendarEventCard(event: CalendarEventItem): string {
    return renderCalendarEventCard(event);
}

function renderEventsCalendarColumn(dayDate: Date): string {
    const weekday = formatCalendarWeekdayLabel(dayDate);
    const dayNumber = dayDate.getDate();
    const events = getFilteredCalendarEventsForDate(dayDate);
    const cardsHtml = events.length
        ? events.map((event) => renderEventsCalendarEventCard(event)).join("")
        : `<p class="events-calendar-empty">Событий нет</p>`;

    return `
        <div class="events-calendar-col" role="listitem">
            <div class="events-calendar-col-head"><span class="gradient-text">${weekday} ${dayNumber}</span></div>
            <article class="events-calendar-day-card">
                <div class="events-calendar-col-body">
                    ${cardsHtml}
                </div>
            </article>
        </div>`;
}

function renderEventsCalendarBlock(): string {
    const visibleDates = getVisibleEventsCalendarDates();
    const monthLabelDate = visibleDates[0] ?? new Date(EVENTS_CALENDAR_YEAR, 0, 1);
    const monthLabel = formatEventsMonthLabel(monthLabelDate);
    const scopeAllActive = appState.eventsCalendarScope === "all";
    const scopeMineActive = appState.eventsCalendarScope === "mine";
    const gridSlideClass = eventsCalendarSlideDirection ? " events-calendar-grid--slide-track" : "";
    const columnsHtml = visibleDates.map((dayDate) => renderEventsCalendarColumn(dayDate)).join("");

    return `
        <section class="events-calendar-block" aria-label="Календарь ${EVENTS_CALENDAR_YEAR} года">
            <header class="events-calendar-toolbar">
                <div class="events-calendar-toolbar-start">
                    <span class="events-calendar-month-label">${escapeHtml(monthLabel)}</span>
                    <button type="button" class="events-calendar-create-btn" id="eventsOpenCreateButton">СОБЫТИЕ</button>
                </div>
                <div class="events-calendar-scope" role="group" aria-label="Фильтр событий">
                    <button
                        type="button"
                        class="events-calendar-scope-btn${scopeMineActive ? " is-active" : ""}"
                        data-events-calendar-scope="mine"
                        aria-pressed="${scopeMineActive}"
                    >МОИ</button>
                    <button
                        type="button"
                        class="events-calendar-scope-btn${scopeAllActive ? " is-active" : ""}"
                        data-events-calendar-scope="all"
                        aria-pressed="${scopeAllActive}"
                    >ВСЕ</button>
                </div>
            </header>
            <div class="events-calendar-carousel-wrap">
                <button
                    type="button"
                    class="events-calendar-arrow events-calendar-arrow--prev"
                    id="eventsCalendarPrev"
                    aria-label="Предыдущие дни"
                >
                    <img src="${escapeHtml(scrollLeftIconUrl)}" alt="" aria-hidden="true">
                </button>
                <div class="events-calendar-viewport">
                    <div class="events-calendar-grid${gridSlideClass}" id="eventsCalendarGrid" role="list" aria-label="Дни календаря">
                        ${columnsHtml}
                    </div>
                </div>
                <button
                    type="button"
                    class="events-calendar-arrow events-calendar-arrow--next"
                    id="eventsCalendarNext"
                    aria-label="Следующие дни"
                >
                    <img src="${escapeHtml(scrollRightIconUrl)}" alt="" aria-hidden="true">
                </button>
            </div>
        </section>`;
}

function renderEventsFeedBlock(): string {
    const activityActive = appState.eventsFeedTab === "activity";
    const newsActive = appState.eventsFeedTab === "news";

    return `
        <section class="events-feed-block" aria-label="Информационные ленты">
            <div class="events-feed-tabs" role="tablist" aria-label="Ленты" data-active-feed-tab="${appState.eventsFeedTab}">
                <span class="events-feed-tabs-indicator" aria-hidden="true"></span>
                <button
                    type="button"
                    class="events-feed-tab${activityActive ? " is-active" : ""}"
                    id="eventsFeedTabActivity"
                    role="tab"
                    aria-selected="${activityActive}"
                    aria-controls="eventsFeedPanelActivity"
                    data-events-feed-tab="activity"
                >ЛЕНТА АКТИВНОСТЕЙ</button>
                <button
                    type="button"
                    class="events-feed-tab${newsActive ? " is-active" : ""}"
                    id="eventsFeedTabNews"
                    role="tab"
                    aria-selected="${newsActive}"
                    aria-controls="eventsFeedPanelNews"
                    data-events-feed-tab="news"
                >ЛЕНТА НОВОСТЕЙ</button>
            </div>
            <div class="events-feed-panels">
                ${renderActivityFeedPanel(appState.eventsFeedTab === "activity")}
                ${renderNewsFeedPanel(appState.eventsFeedTab === "news")}
            </div>
        </section>`;
}

function renderEventsDashboardMain(statusHtml: string): string {
    return `
            <section class="profile-main events-dashboard-main">
                ${statusHtml}
                <div class="events-shell">
                    <div class="events-panels-stack">
                        ${renderEventsCalendarBlock()}
                        ${renderEventsFeedBlock()}
                    </div>
                </div>
            </section>`;
}

type EventsCalendarSlideDirection = "prev" | "next";

let eventsCalendarSlideDirection: EventsCalendarSlideDirection | null = null;
let eventsCalendarSlideAnimating = false;

interface EventsCalendarSlideMetrics {
    leadInset: number;
    trailInset: number;
    step: number;
    columnGap: number;
    anchorLeft: number;
    anchorRight: number;
}

let eventsCalendarSlideMetrics: EventsCalendarSlideMetrics | null = null;

function captureEventsCalendarSlideMetrics(root: HTMLElement): void {
    const grid = root.querySelector<HTMLElement>("#eventsCalendarGrid");
    if (!grid) {
        eventsCalendarSlideMetrics = null;
        return;
    }

    const columns = grid.querySelectorAll<HTMLElement>(".events-calendar-col");
    if (columns.length < 2) {
        eventsCalendarSlideMetrics = null;
        return;
    }

    const gridRect = grid.getBoundingClientRect();
    const firstRect = columns[0].getBoundingClientRect();
    const secondRect = columns[1].getBoundingClientRect();
    const lastRect = columns[columns.length - 1].getBoundingClientRect();

    eventsCalendarSlideMetrics = {
        leadInset: firstRect.left - gridRect.left,
        trailInset: gridRect.right - lastRect.right,
        step: secondRect.left - firstRect.left,
        columnGap: Math.max(0, secondRect.left - firstRect.right),
        anchorLeft: firstRect.left,
        anchorRight: lastRect.right
    };
}

function applyEventsCalendarSlideLayout(grid: HTMLElement, metrics: EventsCalendarSlideMetrics): void {
    grid.style.setProperty("--events-calendar-slide-inset", `${metrics.leadInset}px`);
    grid.style.setProperty("--events-calendar-slide-trail-inset", `${metrics.trailInset}px`);
    grid.style.setProperty("--events-calendar-slide-gap", `${metrics.columnGap}px`);
}

function resolveEventsCalendarSlideOffsets(
    grid: HTMLElement,
    direction: EventsCalendarSlideDirection,
    metrics: EventsCalendarSlideMetrics | null
): { start: number; end: number } {
    const columns = grid.querySelectorAll<HTMLElement>(".events-calendar-col");
    const fallbackStep =
        columns.length >= 2
            ? columns[1].getBoundingClientRect().left - columns[0].getBoundingClientRect().left
            : metrics?.step ?? 240;

    if (!metrics || columns.length < EVENTS_CALENDAR_VISIBLE_DAYS + 1) {
        return direction === "next" ? { start: 0, end: -fallbackStep } : { start: -fallbackStep, end: 0 };
    }

    const leadingColumn = columns[1];
    const trailingColumn = columns[EVENTS_CALENDAR_VISIBLE_DAYS];
    const leadingLeft = leadingColumn.getBoundingClientRect().left;
    const trailingRight = trailingColumn.getBoundingClientRect().right;
    const leftOffset = metrics.anchorLeft - leadingLeft;
    const rightOffset = metrics.anchorRight - trailingRight;

    if (direction === "next") {
        return { start: 0, end: (leftOffset + rightOffset) / 2 };
    }

    return {
        start: (leftOffset + rightOffset) / 2,
        end: metrics.anchorLeft - columns[0].getBoundingClientRect().left
    };
}

function commitEventsCalendarSlide(direction: EventsCalendarSlideDirection): void {
    appState.eventsCalendarStartIndex += direction === "next" ? 1 : -1;
}

function shiftEventsCalendar(direction: EventsCalendarSlideDirection): void {
    if (eventsCalendarSlideAnimating) {
        return;
    }

    if (direction === "prev" && appState.eventsCalendarStartIndex <= 0) {
        return;
    }

    if (direction === "next" && appState.eventsCalendarStartIndex >= getEventsCalendarMaxStartIndex()) {
        return;
    }

    eventsCalendarSlideDirection = direction;
    if (isHTMLElement(profileMount)) {
        captureEventsCalendarSlideMetrics(profileMount);
    }
    clearStatus();
    render();
}

function playEventsCalendarSlideAnimation(root: HTMLElement): void {
    const direction = eventsCalendarSlideDirection;
    if (!direction) {
        return;
    }

    const grid = root.querySelector<HTMLElement>("#eventsCalendarGrid");
    const viewport = root.querySelector<HTMLElement>(".events-calendar-viewport");
    const carouselWrap = root.querySelector<HTMLElement>(".events-calendar-carousel-wrap");
    if (!grid || !viewport) {
        eventsCalendarSlideDirection = null;
        return;
    }

    const prefersReducedMotion =
        typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
        commitEventsCalendarSlide(direction);
        eventsCalendarSlideDirection = null;
        render();
        return;
    }

    let finished = false;

    const finish = (): void => {
        if (finished) {
            return;
        }

        finished = true;
        commitEventsCalendarSlide(direction);
        eventsCalendarSlideDirection = null;
        eventsCalendarSlideMetrics = null;
        eventsCalendarSlideAnimating = false;
        render();
    };

    eventsCalendarSlideAnimating = true;
    carouselWrap?.classList.add("events-calendar-carousel-wrap--animating");
    syncEventsCalendarArrows(root);

    if (eventsCalendarSlideMetrics) {
        applyEventsCalendarSlideLayout(grid, eventsCalendarSlideMetrics);
    }

    void grid.offsetHeight;

    const { start, end } = resolveEventsCalendarSlideOffsets(grid, direction, eventsCalendarSlideMetrics);

    window.requestAnimationFrame(() => {
        grid.style.transition = "none";
        grid.style.transform = `translate3d(${start}px, 0, 0)`;

        void grid.offsetHeight;

        window.requestAnimationFrame(() => {
            grid.style.transition = "transform 0.32s cubic-bezier(0.4, 0, 0.2, 1)";
            grid.style.transform = `translate3d(${end}px, 0, 0)`;

            grid.addEventListener("transitionend", finish, { once: true });
            window.setTimeout(finish, 360);
        });
    });
}

function setEventsCalendarArrowVisible(button: HTMLButtonElement | null, isVisible: boolean): void {
    if (!button) {
        return;
    }

    button.classList.toggle("events-calendar-arrow--hidden", !isVisible);
    button.setAttribute("aria-hidden", String(!isVisible));
    button.tabIndex = isVisible ? 0 : -1;
}

function syncEventsCalendarArrows(root: HTMLElement): void {
    const carouselPrev = root.querySelector<HTMLButtonElement>("#eventsCalendarPrev");
    const carouselNext = root.querySelector<HTMLButtonElement>("#eventsCalendarNext");
    const maxStartIndex = getEventsCalendarMaxStartIndex();

    setEventsCalendarArrowVisible(carouselPrev, true);
    setEventsCalendarArrowVisible(carouselNext, true);

    if (carouselPrev) {
        carouselPrev.disabled = eventsCalendarSlideAnimating || appState.eventsCalendarStartIndex <= 0;
    }

    if (carouselNext) {
        carouselNext.disabled =
            eventsCalendarSlideAnimating || appState.eventsCalendarStartIndex >= maxStartIndex;
    }
}

let eventsFeedTabsResizeBound = false;

function syncEventsFeedTabsIndicator(options?: { instant?: boolean }): void {
    if (!isHTMLElement(profileMount) || appState.dashboardSection !== "events") {
        return;
    }

    const tabsRoot = profileMount.querySelector<HTMLElement>(".events-feed-tabs");
    if (!tabsRoot) {
        return;
    }

    const indicator = tabsRoot.querySelector<HTMLElement>(".events-feed-tabs-indicator");
    const highlightedTab = tabsRoot.querySelector<HTMLElement>(".events-feed-tab:not(.is-active)");
    if (!indicator || !highlightedTab) {
        return;
    }

    const applyPosition = (): void => {
        const tabsRect = tabsRoot.getBoundingClientRect();
        const highlightedRect = highlightedTab.getBoundingClientRect();
        const x = highlightedRect.left - tabsRect.left;
        const y = highlightedRect.top - tabsRect.top;

        indicator.style.width = `${highlightedRect.width}px`;
        indicator.style.height = `${highlightedRect.height}px`;
        indicator.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    if (options?.instant) {
        indicator.classList.add("events-feed-tabs-indicator--instant");
        applyPosition();
        void indicator.offsetWidth;
        indicator.classList.remove("events-feed-tabs-indicator--instant");
        return;
    }

    window.requestAnimationFrame(applyPosition);
}

function setEventsFeedTab(tab: EventsFeedTab, options?: { forceRender?: boolean }): void {
    if (!options?.forceRender && appState.eventsFeedTab === tab) {
        return;
    }

    appState.eventsFeedTab = tab;

    if (!isHTMLElement(profileMount) || appState.dashboardSection !== "events") {
        return;
    }

    if (options?.forceRender) {
        clearStatus();
        render();
        return;
    }

    const tabsRoot = profileMount.querySelector<HTMLElement>(".events-feed-tabs");
    const activityButton = profileMount.querySelector<HTMLButtonElement>("#eventsFeedTabActivity");
    const newsButton = profileMount.querySelector<HTMLButtonElement>("#eventsFeedTabNews");
    const activityPanel = profileMount.querySelector<HTMLElement>("#eventsFeedPanelActivity");
    const newsPanel = profileMount.querySelector<HTMLElement>("#eventsFeedPanelNews");
    const isActivity = tab === "activity";

    tabsRoot?.setAttribute("data-active-feed-tab", tab);

    if (activityButton) {
        activityButton.classList.toggle("is-active", isActivity);
        activityButton.setAttribute("aria-selected", String(isActivity));
    }

    if (newsButton) {
        newsButton.classList.toggle("is-active", !isActivity);
        newsButton.setAttribute("aria-selected", String(!isActivity));
    }

    if (activityPanel) {
        activityPanel.hidden = !isActivity;
        activityPanel.classList.toggle("events-feed-panel--switch-in", isActivity);
    }

    if (newsPanel) {
        newsPanel.hidden = isActivity;
        newsPanel.classList.toggle("events-feed-panel--switch-in", !isActivity);
    }

    syncEventsFeedTabsIndicator();
}

function wireEventsDashboardEvents(): void {
    if (!isHTMLElement(profileMount) || appState.dashboardSection !== "events") {
        return;
    }

    profileMount.querySelectorAll<HTMLButtonElement>("[data-events-calendar-scope]").forEach((button) => {
        button.addEventListener("click", () => {
            const scope = button.dataset.eventsCalendarScope;
            if (scope === "all" || scope === "mine") {
                appState.eventsCalendarScope = scope;
                clearStatus();
                render();
            }
        });
    });

    profileMount.querySelectorAll<HTMLButtonElement>("[data-events-feed-tab]").forEach((button) => {
        button.addEventListener("click", () => {
            const tab = button.dataset.eventsFeedTab;
            if (tab === "activity" || tab === "news") {
                setEventsFeedTab(tab);
            }
        });
    });

    syncEventsFeedTabsIndicator({ instant: true });

    if (!eventsFeedTabsResizeBound) {
        eventsFeedTabsResizeBound = true;
        window.addEventListener("resize", () => {
            syncEventsFeedTabsIndicator({ instant: true });
        });
    }

    const openCreate = profileMount.querySelector("#eventsOpenCreateButton");
    if (isHTMLButtonElement(openCreate)) {
        openCreate.addEventListener("click", () => {
            openEventsCreateModal();
        });
    }

    const eventsCalendarPrev = profileMount.querySelector("#eventsCalendarPrev");
    const eventsCalendarNext = profileMount.querySelector("#eventsCalendarNext");

    if (isHTMLButtonElement(eventsCalendarPrev)) {
        eventsCalendarPrev.addEventListener("click", () => {
            shiftEventsCalendar("prev");
        });
    }

    if (isHTMLButtonElement(eventsCalendarNext)) {
        eventsCalendarNext.addEventListener("click", () => {
            shiftEventsCalendar("next");
        });
    }

    syncEventsCalendarArrows(profileMount);
    playEventsCalendarSlideAnimation(profileMount);
}

function createEmptyEventCreateDraftState(): EventCreateDraft {
    return createEmptyEventCreateDraft();
}

function ensureEventCreateDraft(): EventCreateDraft {
    if (!appState.eventsCreateDraft) {
        appState.eventsCreateDraft = createEmptyEventCreateDraftState();
    }
    return appState.eventsCreateDraft;
}

function buildEventShareLink(): string {
    const draft = appState.eventsCreateDraft;
    const slug = encodeURIComponent((draft?.topic.trim() || "sobytie").replace(/\s+/g, "-").toLowerCase());
    return `${window.location.origin}/events/${slug}`;
}

function openEventsCreateModal(): void {
    if (appState.view !== "account") {
        return;
    }

    appState.dashboardSection = "events";
    resetEventsCalendarToToday();
    appState.profileModal = "none";
    appState.teamModal = "none";
    appState.eventsModal = "create";
    appState.eventsShowValidationError = false;
    ensureEventCreateDraft();
    persistDashboardSectionToStorage();
    clearStatus();
    render();
}

function openEventsSuccessModal(): void {
    appState.eventsModal = "success";
    appState.eventsShareLink = buildEventShareLink();
    render();
}

function closeEventsModal(): void {
    appState.eventsModal = "none";
    appState.eventsShowValidationError = false;
    render();
}

function appendCreatedEventToCalendar(draft: EventCreateDraft): boolean {
    const added = addUserCalendarEventFromDraft(draft);
    if (!added) {
        return false;
    }

    const startIndex = getCalendarStartIndexForDateTime(draft.dateTime);
    if (startIndex !== null) {
        appState.eventsCalendarStartIndex = startIndex;
    }

    const topic = draft.topic.trim() || "Событие";
    pushUserActivity({
        kind: "event_created",
        title: "СОБЫТИЕ СОЗДАНО",
        description: `«${topic}» добавлено в календарь.`
    });

    return true;
}

async function paintEventSuccessQr(): Promise<void> {
    if (!isHTMLElement(profileMount)) {
        return;
    }

    const img = profileMount.querySelector("#eventsSuccessQrImg");
    if (!(img instanceof HTMLImageElement)) {
        return;
    }

    const url = appState.eventsShareLink.trim() || buildEventShareLink();
    try {
        img.src = await QRCode.toDataURL(url, {
            width: 200,
            margin: 2,
            color: {
                dark: "#2a2a2a",
                light: "#ffffff"
            }
        });
        img.alt = "QR-код ссылки на событие";
    } catch {
        img.removeAttribute("src");
        img.alt = "Не удалось сформировать QR";
    }
}

function syncEventCreateDraftFromForm(): void {
    if (!isHTMLElement(profileMount) || appState.eventsModal !== "create") {
        return;
    }

    syncSharedEventCreateDraftFromForm(profileMount, "eventCreate", ensureEventCreateDraft());
}

function createEmptyNewsCreateDraft(): NewsCreateDraft {
    return { title: "", body: "" };
}

function ensureNewsCreateDraft(): NewsCreateDraft {
    if (!appState.newsCreateDraft) {
        appState.newsCreateDraft = createEmptyNewsCreateDraft();
    }
    return appState.newsCreateDraft;
}

function syncNewsCreateDraftFromForm(): void {
    if (!isHTMLElement(profileMount)) {
        return;
    }

    const draft = ensureNewsCreateDraft();
    const titleInput = profileMount.querySelector("#newsCreateTitleInput");
    const bodyInput = profileMount.querySelector("#newsCreateBodyInput");

    if (isHTMLInputElement(titleInput)) {
        draft.title = titleInput.value;
    }

    if (bodyInput instanceof HTMLTextAreaElement) {
        draft.body = bodyInput.value;
    }
}

function getNewsAuthorDisplayName(): string {
    const profile = appState.profile;
    if (!profile) {
        return "Организатор";
    }

    const parts = [profile.firstName, profile.lastName].filter(Boolean);
    if (parts.length > 0) {
        return parts.join(" ").trim();
    }

    return profile.nickname?.trim() || profile.userName?.trim() || "Организатор";
}

function openNewsCreateModal(): void {
    appState.newsCreateDraft = createEmptyNewsCreateDraft();
    appState.newsShowValidationError = false;
    appState.eventsModal = "createNews";
    render();
}

function closeNewsCreateModal(): void {
    appState.eventsModal = "none";
    appState.newsCreateDraft = null;
    appState.newsShowValidationError = false;
    render();
}

function renderEventsModal(): string {
    if (appState.eventsModal === "create") {
        return renderEventsDashboardCreateModal(ensureEventCreateDraft(), appState.eventsShowValidationError);
    }

    if (appState.eventsModal === "createNews") {
        return renderCreateNewsModal(ensureNewsCreateDraft(), appState.newsShowValidationError);
    }

    if (appState.eventsModal === "success") {
        return renderProfileModalShell({
            ariaLabel: "Событие создано",
            closeButtonId: "eventsCloseSuccessButton",
            backdropCloseAttr: 'data-close-events-modal="1"',
            extraModalClass: "team-overlay-modal event-success-modal",
            bodyHtml: `
                <h2 class="profile-shell-title">УСПЕШНО!</h2>
                <div class="event-success-link-row">
                    <div class="event-success-link-field">ССЫЛКА</div>
                    <button type="button" class="event-success-link-copy" id="eventsCopyLinkButton">СКОПИРОВАТЬ</button>
                </div>
                <div class="event-success-qr-wrap">
                    <img id="eventsSuccessQrImg" class="event-success-qr" width="200" height="200" alt="">
                </div>
                <button type="button" class="profile-team-flow-btn profile-team-flow-btn--search event-success-done" id="eventsSuccessDoneButton">ГОТОВО</button>
            `
        });
    }

    return "";
}

function wireEventsModalEvents(): void {
    if (!isHTMLElement(profileMount) || appState.eventsModal === "none") {
        return;
    }

    profileMount.querySelectorAll<HTMLElement>("[data-close-events-modal]").forEach((node) => {
        node.addEventListener("click", () => {
            if (appState.eventsModal === "create") {
                syncEventCreateDraftFromForm();
                closeEventsModal();
                return;
            }

            if (appState.eventsModal === "createNews") {
                syncNewsCreateDraftFromForm();
                closeNewsCreateModal();
                return;
            }

            closeEventsModal();
        });
    });

    if (appState.eventsModal === "createNews") {
        const draft = ensureNewsCreateDraft();
        const closeNews = profileMount.querySelector("#eventsCloseCreateNewsButton");
        if (isHTMLButtonElement(closeNews)) {
            closeNews.addEventListener("click", () => {
                syncNewsCreateDraftFromForm();
                closeNewsCreateModal();
            });
        }

        const titleInput = profileMount.querySelector("#newsCreateTitleInput");
        if (isHTMLInputElement(titleInput)) {
            titleInput.addEventListener("input", () => {
                draft.title = titleInput.value;
                appState.newsShowValidationError = false;
            });
        }

        const bodyInput = profileMount.querySelector("#newsCreateBodyInput");
        if (bodyInput instanceof HTMLTextAreaElement) {
            bodyInput.addEventListener("input", () => {
                draft.body = bodyInput.value;
                appState.newsShowValidationError = false;
            });
        }

        const form = profileMount.querySelector("#newsCreateForm");
        if (isHTMLFormElement(form)) {
            form.addEventListener("submit", (event) => {
                event.preventDefault();
                syncNewsCreateDraftFromForm();

                if (!isNewsCreateDraftComplete(draft)) {
                    appState.newsShowValidationError = true;
                    render();
                    return;
                }

                pushNewsPost({
                    title: draft.title,
                    body: draft.body,
                    authorName: getNewsAuthorDisplayName()
                });
                closeNewsCreateModal();
                setStatus("Новость опубликована.");
                setEventsFeedTab("activity", { forceRender: true });
            });
        }

        return;
    }

    if (appState.eventsModal === "create") {
        const draft = ensureEventCreateDraft();
        const closeCreate = profileMount.querySelector("#eventsCloseCreateButton");
        if (isHTMLButtonElement(closeCreate)) {
            closeCreate.addEventListener("click", () => {
                syncEventCreateDraftFromForm();
                closeEventsModal();
            });
        }

        wireEventCreateFormInputs(profileMount, "eventCreate", draft, () => {
            appState.eventsShowValidationError = false;
        });

        bindEventCreateFormSubmit(
            profileMount,
            "eventCreate",
            draft,
            "eventCreateForm",
            () => {
                const draft = ensureEventCreateDraft();
                if (!appendCreatedEventToCalendar(draft)) {
                    appState.eventsShowValidationError = true;
                    setStatus("Не удалось добавить событие в календарь. Проверьте дату и время.", "error");
                    render();
                    return;
                }

                appState.eventsShowValidationError = false;
                openEventsSuccessModal();
            },
            () => {
                appState.eventsShowValidationError = true;
                render();
            }
        );

        return;
    }

    if (appState.eventsModal === "success") {
        const closeSuccess = profileMount.querySelector("#eventsCloseSuccessButton");
        if (isHTMLButtonElement(closeSuccess)) {
            closeSuccess.addEventListener("click", () => {
                appState.eventsCreateDraft = createEmptyEventCreateDraftState();
                appState.eventsShowValidationError = false;
                closeEventsModal();
                setStatus("Событие создано.");
                render();
            });
        }

        const copyLink = profileMount.querySelector("#eventsCopyLinkButton");
        if (isHTMLButtonElement(copyLink)) {
            copyLink.addEventListener("click", async () => {
                const link = appState.eventsShareLink || buildEventShareLink();
                try {
                    await navigator.clipboard.writeText(link);
                    setStatus("Ссылка на событие скопирована.");
                } catch {
                    setStatus("Не удалось скопировать ссылку.", "error");
                }
                render();
            });
        }

        const done = profileMount.querySelector("#eventsSuccessDoneButton");
        if (isHTMLButtonElement(done)) {
            done.addEventListener("click", () => {
                appState.eventsCreateDraft = createEmptyEventCreateDraftState();
                appState.eventsShowValidationError = false;
                closeEventsModal();
                setStatus("Событие создано.");
                render();
            });
        }
    }
}


function syncCurrentUserInLocalTeamRoster(): void {
    const p = appState.profile;
    const team = appState.localCreatedTeam;
    if (!p || !team?.members.length) {
        return;
    }

    const selfId = `user-${p.id}`;
    const fresh = buildSelfTeamMemberRow();
    if (!fresh) {
        return;
    }

    let changed = false;
    const members = team.members.map((m) => {
        if (m.id !== selfId) {
            return m;
        }

        changed = true;
        return {
            ...fresh,
            roleLabel: m.roleLabel,
            isCaptain: m.isCaptain
        };
    });

    if (!changed) {
        return;
    }

    appState.localCreatedTeam = { ...team, members };
    persistLocalTeam();
}

function applyPersistedClientStateAfterMe(): void {
    hydrateProfileClientStateFromStorage();
    hydrateLocalTeamFromStorage();
    syncCurrentUserInLocalTeamRoster();
}

function getSessionToken(): string | null {
    return loadSession()?.token ?? null;
}

async function refreshCurrentUserProfile(): Promise<void> {
    const token = getSessionToken();
    if (!token) {
        return;
    }

    appState.profile = await fetchCurrentUser(token);
    hydrateProfileClientStateFromStorage();
}

function openRatingDashboard(): void {
    appState.dashboardSection = "rating";
    persistDashboardSectionToStorage();
    clearStatus();
    void refreshRatingWorkspace().then(() => {
        if (appState.dashboardSection === "rating") {
            render();
        }
    });
    render();
}

async function refreshRatingWorkspace(token = getSessionToken()): Promise<void> {
    if (!token) {
        clearRatingData();
        return;
    }

    const [teams, users] = await Promise.all([
        fetchRatingTeams(token).catch(() => []),
        fetchRatingUsers(token).catch(() => [])
    ]);

    setRatingData(
        mergeSessionTeamIntoRatingTeams(teams, appState.profile, appState.currentTeam, appState.localCreatedTeam),
        mergeSessionUserIntoRatingUsers(users, appState.profile)
    );
}

async function refreshTeamWorkspace(): Promise<void> {
    const token = getSessionToken();
    if (!token) {
        return;
    }

    try {
        appState.teamCatalog = await fetchTeams(token);
    } catch {
        appState.teamCatalog = [];
    }

    try {
        appState.teamJoinRequests = await fetchTeamJoinRequests(token);
    } catch {
        appState.teamJoinRequests = [];
    }

    try {
        appState.teamMyVotes = await fetchMyVotes(token);
    } catch {
        appState.teamMyVotes = [];
    }

    try {
        const teamData = await fetchMyTeam(token);
        
        if (teamData) {
            // Если команда успешно вернулась
            appState.currentTeam = teamData;
            appState.localCreatedTeam = null;
            if (appState.profile) {
                appState.profile = {
                    ...appState.profile,
                    teamId: teamData.id,
                    teamName: teamData.name,
                    teamInviteCode: teamData.inviteCode,
                    isCaptain: teamData.captainId === appState.profile.id,
                    teamScore: teamData.score
                };
            }
        } else {
            appState.currentTeam = null;
            if (!appState.localCreatedTeam) {
                appState.localCreatedTeam = null;
            }
            if (appState.profile) {
                appState.profile = {
                    ...appState.profile,
                    teamId: null,
                    teamName: "",
                    teamInviteCode: "",
                    isCaptain: false,
                    teamScore: 0
                };
            }
        }
    } catch {
        if (!appState.currentTeam) {
            appState.currentTeam = null;
        }
    }
}

function isTeamCaptain(): boolean {
    if (!appState.profile) {
        return false;
    }

    if (appState.currentTeam?.captainId === appState.profile.id) {
        return true;
    }

    if (appState.profile.isCaptain) {
        return true;
    }

    return Boolean(appState.localCreatedTeam);
}

function buildSelfTeamMemberRow(): TeamMemberRow | null {
    const p = appState.profile;
    if (!p) {
        return null;
    }

    return {
        id: `user-${p.id}`,
        displayName: getFullNameDisplay() || buildFullNameFromProfile(p) || "УЧАСТНИК",
        roleLabel: p.isCaptain ? "КАПИТАН" : "УЧАСТНИК",
        avatarUrl: getAvatarDisplay() || p.avatarUrl || "",
        isCaptain: p.isCaptain
    };
}

function buildLocalCaptainMemberRow(): TeamMemberRow | null {
    const base = buildSelfTeamMemberRow();
    if (!base) {
        return null;
    }

    return { ...base, roleLabel: "КАПИТАН", isCaptain: true };
}

function parseTeamMemberRow(raw: unknown): TeamMemberRow | null {
    if (!raw || typeof raw !== "object") {
        return null;
    }

    const o = raw as Record<string, unknown>;
    if (typeof o.id !== "string" || typeof o.displayName !== "string") {
        return null;
    }

    return {
        id: o.id,
        displayName: o.displayName,
        roleLabel: typeof o.roleLabel === "string" ? o.roleLabel : "УЧАСТНИК",
        avatarUrl: typeof o.avatarUrl === "string" ? o.avatarUrl : "",
        isCaptain: Boolean(o.isCaptain)
    };
}

function getTeamRoster(): TeamMemberRow[] {
    if (appState.currentTeam) {
        return appState.currentTeam.members.map((member) => ({
            id: String(member.id),
            displayName: member.displayName || member.userName || member.email || "УЧАСТНИК",
            roleLabel: member.roleLabel || (member.isCaptain ? "КАПИТАН" : "УЧАСТНИК"),
            avatarUrl: resolveTeamMemberAvatarUrl(String(member.id), member.avatarUrl),
            isCaptain: member.isCaptain
        }));
    }

    if (appState.localCreatedTeam) {
        const members = appState.localCreatedTeam.members;
        if (members.length > 0) {
            return members;
        }

        const captain = buildLocalCaptainMemberRow();
        return captain ? [captain] : [];
    }

    const p = appState.profile;
    if (p && (p.teamId != null || Boolean(p.teamName?.trim()))) {
        const row = buildSelfTeamMemberRow();
        return row ? [row] : [];
    }

    return [];
}

function getTeamMembersForView(): TeamMemberView[] {
    const currentUserId = appState.profile?.id;
    const voteByTarget = new Map(appState.teamMyVotes.map((vote) => [vote.toUserId, vote.score]));

    if (appState.currentTeam) {
        return appState.currentTeam.members.map((member) => ({
            id: String(member.id),
            displayName: member.displayName || member.userName || member.email || "УЧАСТНИК",
            roleLabel: member.roleLabel || (member.isCaptain ? "КАПИТАН" : "УЧАСТНИК"),
            avatarUrl: resolveTeamMemberAvatarUrl(String(member.id), member.avatarUrl),
            userPoints: member.userPoints,
            canVote: !isSameUserId(member.id, currentUserId ?? ""),
            voteScore: voteByTarget.get(member.id) ?? null
        }));
    }

    const voteByTargetId = new Map(
        appState.teamMyVotes.map((vote) => [String(vote.toUserId), vote.score])
    );

    return getTeamRoster().map((member) => ({
        id: member.id,
        displayName: member.displayName,
        roleLabel: member.roleLabel,
        avatarUrl: member.avatarUrl,
        canVote: !isSameUserId(member.id, currentUserId ?? ""),
        voteScore: voteByTargetId.get(member.id) ?? null
    }));
}

function formatShortDate(value: string | null | undefined): string {
    if (!value) {
        return "";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
}

function getTempTeamHistoryPreview(): TeamHistoryItem[] {
    return [
        {
            label: "WORKSHOP",
            title: "Команда «организаторы» провела воркшоп по проектированию API.",
            meta: "",
            pointsLabel: "50"
        },
        {
            label: "ACHIEVEMENT",
            title: "Егор Габов получил ачивку «Свой вклад».",
            meta: "",
            pointsLabel: "15"
        },
        {
            label: "CHECK-IN",
            title: "Команда «Кодеры» завершила check-in 6 недели.",
            meta: "",
            pointsLabel: "15"
        },
        {
            label: "TRAINING",
            title: "Команда «Конфигураторы» провела обучение по настройке ПО.",
            meta: "",
            pointsLabel: "15"
        },
        {
            label: "RESCUE",
            title: "Команда «Зануда» получила заявку на помощь от команды «Построители».",
            meta: "",
            pointsLabel: "15"
        },
        {
            label: "WORKSHOP",
            title: "Команда «организаторы» провела воркшоп по проектированию API.",
            meta: "",
            pointsLabel: "50"
        },
        {
            label: "ACHIEVEMENT",
            title: "Егор Габов получил ачивку «Свой вклад».",
            meta: "",
            pointsLabel: "15"
        },
        {
            label: "CHECK-IN",
            title: "Команда «Кодеры» завершила check-in 6 недели.",
            meta: "",
            pointsLabel: "15"
        },
        {
            label: "TRAINING",
            title: "Команда «Конфигураторы» провела обучение по настройке ПО.",
            meta: "",
            pointsLabel: "15"
        },
        {
            label: "RESCUE",
            title: "Команда «Зануда» получила заявку на помощь от команды «Построители».",
            meta: "",
            pointsLabel: "15"
        }
    ];
}

function getTeamHistoryItems(): TeamHistoryItem[] {
    const checkIns = appState.teamCheckIns.map<TeamHistoryItem>((checkIn) => ({
        label: "CHECK-IN",
        title: `Команда завершила check-in ${checkIn.weekNumber} недели.`,
        meta: checkIn.reportText || formatShortDate(checkIn.submittedAtUtc ?? checkIn.createdAtUtc),
        pointsLabel: "15"
    }));

    const rescues = appState.teamHelpRequests.map<TeamHistoryItem>((request) => ({
        label: "СПАСЕНИЕ",
        title: request.fromTeamName
            ? `Команда «${request.fromTeamName}» отправила запрос на помощь по теме «${request.topic || "Спасение"}».`
            : `Запрос на помощь по теме «${request.topic || "Спасение"}».`,
        meta: `${request.fromTeamName} → ${request.toTeamName}`,
        pointsLabel: request.bonusPoints > 0 ? String(request.bonusPoints) : undefined
    }));

    const joinRequests = appState.teamJoinRequests.map<TeamHistoryItem>((request) => ({
        label: "ЗАЯВКА",
        title: `${request.displayName || request.userName || "Участник"} подал заявку на вступление в команду.`,
        meta: formatShortDate(request.decidedAtUtc ?? request.createdAtUtc)
    }));

    const votes = appState.teamMyVotes.map<TeamHistoryItem>((vote) => ({
        label: "ГОЛОС",
        title: `Вы оценили вклад участника ${vote.toUserName || "участника"} на ${vote.score}/5.`,
        meta: formatShortDate(vote.createdAtUtc)
    }));

    const items = [...checkIns, ...rescues, ...joinRequests, ...votes];
    // TEMP: переключить на false после проверки вёрстки истории
    const USE_TEMP_TEAM_HISTORY_PREVIEW = true;
    if (USE_TEMP_TEAM_HISTORY_PREVIEW) {
        return getTempTeamHistoryPreview();
    }

    return items.length > 0
        ? items
        : [
              {
                  label: "СТАРТ",
                  title: "История активности появится после check-in, спасения или голосования.",
                  meta: "MVP"
              }
          ];
}

function getJoinableTeams(searchQuery?: string): TeamSearchItem[] {
    const currentTeamId = appState.currentTeam?.id ?? appState.profile?.teamId;
    const querySource =
        searchQuery ??
        (appState.profileModal === "findTeam" ? appState.profileFindTeamQuery : teamFlowState.searchQuery);
    const query = querySource.trim().toLowerCase();

    return appState.teamCatalog
        .filter((team) => team.id !== currentTeamId)
        .filter((team) => {
            if (!query) {
                return true;
            }

            return `${team.name} ${team.description} ${team.inviteCode}`.toLowerCase().includes(query);
        })
        .map((team) => ({
            id: team.id,
            name: team.name,
            description: team.description,
            inviteCode: team.inviteCode,
            memberCount: team.memberCount,
            krk: team.krk,
            joinRequestStatus: appState.teamJoinRequests.find((request) =>
                request.teamId === team.id && request.status === "Pending"
            )?.status
        }));
}

function persistLocalTeam(): void {
    const p = appState.profile;
    const team = appState.localCreatedTeam;
    if (!p || !team) {
        return;
    }

    const payload: PersistedLocalTeamV1 = {
        name: team.name,
        inviteCode: team.inviteCode,
        direction: team.direction,
        inviteLink: appState.profileInviteLink.trim() || buildTeamInviteLink(),
        members: team.members
    };

    localStorage.setItem(localTeamStorageKey(p.id), JSON.stringify(payload));
}

function hydrateLocalTeamFromStorage(): void {
    const p = appState.profile;
    if (!p) {
        return;
    }

    if (p.teamId != null) {
        localStorage.removeItem(localTeamStorageKey(p.id));
        return;
    }

    const raw = localStorage.getItem(localTeamStorageKey(p.id));
    if (!raw) {
        return;
    }

    try {
        const data = JSON.parse(raw) as PersistedLocalTeamV1;
        if (typeof data.name !== "string" || typeof data.inviteCode !== "string") {
            return;
        }

        const parsedMembers = Array.isArray(data.members) ? data.members.map(parseTeamMemberRow).filter(Boolean) as TeamMemberRow[] : [];

        const captain = buildLocalCaptainMemberRow();
        const members = parsedMembers.length > 0 ? parsedMembers : captain ? [captain] : [];

        const direction = typeof data.direction === "string" ? data.direction : "";

        appState.localCreatedTeam = {
            name: data.name,
            inviteCode: data.inviteCode,
            direction,
            members
        };

        if (typeof data.inviteLink === "string" && data.inviteLink.trim()) {
            appState.profileInviteLink = data.inviteLink.trim();
        }

        appState.profile = {
            ...p,
            teamName: data.name,
            teamInviteCode: data.inviteCode
        };
    } catch {
        /* ignore corrupt storage */
    }
}

async function paintTeamSuccessQr(): Promise<void> {
    if (!isHTMLElement(profileMount)) {
        return;
    }

    const img = profileMount.querySelector("#profileSuccessQrImg");
    if (!(img instanceof HTMLImageElement)) {
        return;
    }

    const url = appState.profileInviteLink.trim() || buildTeamInviteLink();
    try {
        img.src = await QRCode.toDataURL(url, {
            width: 220,
            margin: 2,
            color: {
                dark: "#172d9d",
                light: "#f0f5ff"
            }
        });
        img.alt = "QR-код ссылки-приглашения";
    } catch {
        img.removeAttribute("src");
        img.alt = "Не удалось сформировать QR";
    }
}

async function paintRequestsQr(): Promise<void> {
    if (!isHTMLElement(profileMount)) {
        return;
    }

    const qrWrap = profileMount.querySelector("#teamRequestsQrWrap");
    if (!(qrWrap instanceof HTMLElement)) {
        return;
    }

    const link = appState.teamRequestsInviteLink || buildTeamInviteLink();
    try {
        const dataUrl = await QRCode.toDataURL(link, {
            width: 130,
            margin: 1,
            color: {
                dark: "#172d9d",
                light: "#ffffff"
            }
        });
        qrWrap.innerHTML = `<img src="${escapeHtml(dataUrl)}" alt="QR-код приглашения">`;
    } catch {
        qrWrap.innerHTML = `<span class="team-requests-placeholder">Не удалось загрузить QR</span>`;
    }
}

function openTeamModal(kind: TeamModalKind, memberIndex = 0): void {
    appState.profileModal = "none";
    appState.profileFormDraft = null;
    appState.eventsModal = "none";
    closeTeamEventModals();
    appState.teamModal = kind;
    const roster = kind === "vote" ? getTeamMembersForView() : getTeamRoster();
    const safeIndex =
        roster.length > 0 ? Math.min(Math.max(0, memberIndex), roster.length - 1) : 0;
    appState.teamVoteMemberIndex = safeIndex;

    if (kind === "requests") {
        appState.teamRequestsInviteLink = buildTeamInviteLink();
        appState.teamRequestsCurrentIndex = 0;
    }

    if (kind === "rescue") {
        ensureTeamRescueDraft();
        teamFlowState.rescueLeagueDropdownOpen = false;
        teamFlowState.rescueTagDropdownOpen = false;
        teamFlowState.rescueDeadlineCalendarOpen = false;
        teamFlowState.rescueCalendarMonthKey = getRescueCalendarMonthKey();
    }

    if (kind === "checkIn") {
        teamFlowState.checkInWeek = teamFlowState.checkInWeek || String(Math.max(1, appState.teamCheckIns[0]?.weekNumber + 1 || 1));
        teamFlowState.checkInError = "";
    }

    if (kind === "vote") {
        const member = roster[safeIndex];
        const memberUserId = member ? parseVoteTargetUserId(member.id) : null;
        const existingVote = memberUserId !== null
            ? appState.teamMyVotes.find((vote) => vote.toUserId === memberUserId)
            : undefined;
        teamFlowState.voteDraftScore = existingVote?.score ?? null;
        teamFlowState.voteDropdownOpen = false;
    }

    render();
}

function closeTeamModal(): void {
    appState.teamModal = "none";
    teamFlowState.voteDropdownOpen = false;
    teamFlowState.voteDraftScore = null;
    teamFlowState.rescueLeagueDropdownOpen = false;
    teamFlowState.rescueTagDropdownOpen = false;
    teamFlowState.rescueDeadlineCalendarOpen = false;
    render();
}

function syncTeamRescueDraftFromForm(): void {
    if (!isHTMLElement(profileMount) || appState.teamModal !== "rescue") {
        return;
    }

    const draft = ensureTeamRescueDraft();
    const target = profileMount.querySelector("#teamRescueTargetInput");
    const topic = profileMount.querySelector("#teamRescueTopicInput");
    const description = profileMount.querySelector("#teamRescueDescriptionInput");
    const leagueValue = profileMount.querySelector("#teamRescueLeagueValue");
    const tagValue = profileMount.querySelector("#teamRescueTagValue");
    const deadlineValue = profileMount.querySelector("#teamRescueDeadlineValue");

    if (target instanceof HTMLSelectElement) {
        draft.targetTeamId = target.value;
    }
    if (isHTMLInputElement(topic)) {
        draft.topic = topic.value;
    }
    if (description instanceof HTMLTextAreaElement) {
        draft.description = description.value;
    }
    if (isHTMLInputElement(leagueValue)) {
        draft.league = leagueValue.value;
    }
    if (isHTMLInputElement(tagValue)) {
        draft.tag = tagValue.value;
    }
    if (isHTMLInputElement(deadlineValue)) {
        draft.deadline = deadlineValue.value;
    }
}

function wireTeamVoteModalEvents(): void {
    if (!isHTMLElement(profileMount) || appState.teamModal !== "vote") {
        return;
    }

    const pickerButton = profileMount.querySelector("#teamVotePickerButton");
    const picker = profileMount.querySelector("#teamVotePicker");

    if (isHTMLButtonElement(pickerButton)) {
        pickerButton.addEventListener("click", (event) => {
            event.stopPropagation();
            teamFlowState.voteDropdownOpen = !teamFlowState.voteDropdownOpen;
            render();
        });
    }

    profileMount.querySelectorAll<HTMLButtonElement>("[data-team-vote-score]").forEach((button) => {
        button.addEventListener("click", (event) => {
            event.stopPropagation();
            const panel = button.closest<HTMLElement>("[data-team-vote-member-id]");
            const memberId = panel?.dataset.teamVoteMemberId ?? "";
            const score = Number(button.dataset.teamVoteScore ?? "0");
            if (!memberId || score < 1 || score > 5) {
                return;
            }

            teamFlowState.voteDraftScore = score;
            teamFlowState.voteDropdownOpen = false;

            void submitTeamVote(memberId, score)
                .then(() => {
                    closeTeamModal();
                    render();
                })
                .catch((error: unknown) => {
                    setStatus(getErrorMessage(error), "error");
                    render();
                });
        });
    });

    if (teamFlowState.voteDropdownOpen) {
        const closeDropdown = (event: Event) => {
            const target = event.target;
            if (!(target instanceof Node) || picker?.contains(target)) {
                return;
            }

            teamFlowState.voteDropdownOpen = false;
            document.removeEventListener("click", closeDropdown);
            render();
        };

        window.setTimeout(() => {
            document.addEventListener("click", closeDropdown);
        }, 0);
    }
}

function wireTeamRescueModalEvents(): void {
    if (!isHTMLElement(profileMount) || appState.teamModal !== "rescue") {
        return;
    }

    const draft = ensureTeamRescueDraft();
    wireTeamRescueModal(profileMount, {
        draft,
        syncDraftFromForm: syncTeamRescueDraftFromForm,
        onClose: closeTeamModal,
        onRender: render,
        onSubmit: (nextDraft) => {
            if (!nextDraft.topic.trim()) {
                setStatus("Укажите название спасения.", "error");
                render();
                return;
            }

            if (!nextDraft.description.trim()) {
                setStatus("Опишите проблему для запроса спасения.", "error");
                render();
                return;
            }

            void submitTeamRescueDraftToAssignments(nextDraft)
                .then(() => {
                    appState.teamRescueDraft = createEmptyTeamRescueDraft();
                    teamFlowState.rescueLeagueDropdownOpen = false;
                    teamFlowState.rescueTagDropdownOpen = false;
                    teamFlowState.rescueDeadlineCalendarOpen = false;
                    closeTeamModal();
                    clearStatus();
                    render();
                })
                .catch((error: unknown) => {
                    setStatus(getErrorMessage(error), "error");
                    render();
                });
        }
    });
}

function formatVoteScoreLabel(score: number): string {
    if (score === 1) {
        return "балл";
    }

    if (score >= 2 && score <= 4) {
        return "балла";
    }

    return "баллов";
}

function renderTeamVoteScoreDisplay(score: number | null): string {
    if (score === null) {
        return `<span class="team-vote-display-placeholder">—</span>`;
    }

    return `
        <span class="team-vote-display-value">${score}</span>
        <span class="team-vote-display-label">${formatVoteScoreLabel(score)}</span>
        <img src="${escapeHtml(scoreMobileIconUrl)}" alt="" class="team-vote-display-icon" aria-hidden="true">`;
}

function renderTeamModal(): string {
    if (appState.teamModal === "vote") {
        const members = getTeamMembersForView();
        const member = members[appState.teamVoteMemberIndex] ?? members[0];
        const memberUserId = member ? parseVoteTargetUserId(member.id) : null;
        const existingVote = memberUserId !== null
            ? appState.teamMyVotes.find((vote) => vote.toUserId === memberUserId)
            : undefined;
        const selectedScore = teamFlowState.voteDraftScore ?? existingVote?.score ?? null;
        const voteAvatarUrl = member ? resolveTeamMemberAvatarUrl(member.id, member.avatarUrl) : "";
        const voteAvatarInner = voteAvatarUrl
            ? `<img src="${escapeHtml(voteAvatarUrl)}" alt="" loading="lazy">`
            : "";
        const voteRole = member?.roleLabel ?? "РОЛЬ";
        const avatarClass = voteAvatarInner ? "team-vote-avatar has-image" : "team-vote-avatar";
        const dropdownOptions = [1, 2, 3, 4, 5]
            .map((score) => `
                <button
                    type="button"
                    class="team-vote-dropdown-option${selectedScore === score ? " is-active" : ""}"
                    data-team-vote-score="${score}"
                >${score}</button>`)
            .join("");
        const dropdownOpenClass = teamFlowState.voteDropdownOpen ? " is-open" : "";
        const voteCardClass = teamFlowState.voteDropdownOpen
            ? "team-vote-card team-vote-card--dropdown-open"
            : "team-vote-card";

        return renderProfileModalShell({
            ariaLabel: "Голосование",
            closeButtonId: "teamCloseVoteButton",
            backdropCloseAttr: 'data-close-team-modal="1"',
            extraModalClass: "team-overlay-modal",
            extraCardClass: voteCardClass,
            bodyHtml: `
                <h2 class="profile-shell-title">ГОЛОСОВАНИЕ</h2>
                <div class="team-vote-hero">
                    <div class="${avatarClass}" aria-hidden="true">${voteAvatarInner}</div>
                    <div class="team-vote-role-pill">${escapeHtml(voteRole)}</div>
                    <p class="team-vote-name">${escapeHtml(member?.displayName ?? "УЧАСТНИК")}</p>
                </div>
                <div class="team-vote-controls" data-team-vote-member-id="${escapeHtml(member?.id ?? "")}">
                    <div class="team-vote-display-row" aria-live="polite">
                        <div class="team-vote-display-field">
                            ${renderTeamVoteScoreDisplay(selectedScore)}
                        </div>
                        <span class="team-vote-display-badge">БАЛЛЫ</span>
                    </div>
                    <div class="team-vote-picker-row">
                        <div class="team-vote-picker${dropdownOpenClass}" id="teamVotePicker">
                            <button
                                type="button"
                                class="team-vote-picker-trigger"
                                id="teamVotePickerButton"
                                aria-expanded="${teamFlowState.voteDropdownOpen ? "true" : "false"}"
                                aria-controls="teamVoteDropdown"
                            >БАЛЛЫ</button>
                            <div
                                class="team-vote-dropdown"
                                id="teamVoteDropdown"
                                role="listbox"
                                aria-label="Выбор баллов от 1 до 5"
                                ${teamFlowState.voteDropdownOpen ? "" : "hidden"}
                            >
                                ${dropdownOptions}
                            </div>
                        </div>
                    </div>
                </div>
                ${existingVote ? `<p class="team-vote-hint">Вы можете изменить оценку от 1 до 5.</p>` : `<p class="team-vote-hint">Оцените вклад участника от 1 до 5.</p>`}
            `
        });
    }

    if (appState.teamModal === "checkIn") {
        const nextWeek = String(teamFlowState.checkInWeek || Math.max(1, appState.teamCheckIns[0]?.weekNumber + 1 || 1));
        const errorHtml = teamFlowState.checkInError
            ? `<p class="team-validation-error team-validation-error--modal">${escapeHtml(teamFlowState.checkInError)}</p>`
            : "";

        return renderProfileModalShell({
            ariaLabel: "Check-in команды",
            closeButtonId: "teamCloseCheckInButton",
            backdropCloseAttr: 'data-close-team-modal="1"',
            extraModalClass: "team-overlay-modal team-rescue-modal",
            extraCardClass: "profile-modal-card--form",
            bodyHtml: `
                <h2 class="profile-shell-title">CHECK-IN</h2>
                ${errorHtml}
                <form id="teamCheckInForm" class="team-rescue-form profile-modal-card-body" novalidate>
                    <input
                        id="teamCheckInWeekInput"
                        class="team-rescue-field"
                        type="number"
                        min="1"
                        max="52"
                        placeholder="НЕДЕЛЯ"
                        value="${escapeHtml(nextWeek)}"
                    >
                    <textarea
                        id="teamCheckInReportInput"
                        class="team-rescue-textarea"
                        placeholder="Кратко опишите прогресс, риски и договоренности команды"
                        aria-label="Отчет команды"
                    >${escapeHtml(teamFlowState.checkInReport)}</textarea>
                    <button type="submit" class="profile-team-flow-btn profile-team-flow-btn--search team-rescue-submit">ОТПРАВИТЬ</button>
                </form>
            `
        });
    }

    if (appState.teamModal === "rescue") {
        const draft = ensureTeamRescueDraft();
        const currentTeamId = appState.currentTeam?.id ?? appState.profile?.teamId;
        const targetOptions = appState.teamCatalog
            .filter((team) => team.id !== currentTeamId)
            .map((team) => `<option value="${team.id}" ${draft.targetTeamId === String(team.id) ? "selected" : ""}>${escapeHtml(team.name)}</option>`)
            .join("");

        return renderTeamRescueModal({
            draft,
            targetOptionsHtml: targetOptions
        });
    }

    if (appState.teamModal === "requests") {
        const currentTeamId = appState.currentTeam?.id ?? appState.profile?.teamId ?? 0;
        const pendingJoinRequests = appState.teamJoinRequests.filter((request) =>
            request.teamId === currentTeamId &&
            request.status === "Pending"
        );

        const totalCount = pendingJoinRequests.length;
        const currentIndex = totalCount > 0
            ? Math.min(appState.teamRequestsCurrentIndex, totalCount - 1)
            : 0;
        appState.teamRequestsCurrentIndex = currentIndex;
        const currentRequest = pendingJoinRequests[currentIndex];
        const canAct = isTeamCaptain() && Boolean(currentRequest);
        const carouselHtml = renderTeamRequestsCarouselHtml(pendingJoinRequests, currentIndex, canAct);

        return renderProfileModalShell({
            ariaLabel: "Заявки",
            closeButtonId: "teamCloseRequestsButton",
            backdropCloseAttr: 'data-close-team-modal="1"',
            extraModalClass: "team-overlay-modal",
            extraCardClass: `team-requests-card ${totalCount > 0 ? "team-requests-card--filled" : "team-requests-card--empty"}`,
            bodyHtml: `
                <div class="team-requests-shell ${totalCount > 0 ? "team-requests-shell--filled" : "team-requests-shell--empty"}">
                    <h2 class="team-requests-modal-title">
                        ЗАЯВКИ
                        <span class="team-requests-count">${escapeHtml(String(totalCount))}</span>
                    </h2>
                    ${carouselHtml}
                    <div class="team-requests-qrcode" id="teamRequestsQrWrap">
                        <span class="team-requests-placeholder">QR-код загружается...</span>
                    </div>
                    <button type="button" class="team-requests-copy-btn" id="teamRequestsCopyLinkButton">СКОПИРОВАТЬ</button>
                </div>
            `
        });
    }

    return "";
}

function openTeamOnboardingModal(step: "intro" | "find" | "create"): void {
    if (step === "intro") {
        openProfileModal("noTeam");
        return;
    }

    if (step === "find") {
        appState.profileFindTeamQuery = "";
        appState.profileFindTeamSelectedId = null;
        openProfileModal("findTeam");
        void refreshTeamCatalog().then(() => {
            if (appState.profileModal === "findTeam") {
                render();
            }
        });
        return;
    }

    appState.profileCreateTeamName = "";
    appState.profileCreateTeamDirection = "";
    openProfileModal("createTeam");
}

function tryOpenNoTeamModal(): boolean {
    if (hasTeamAccess()) {
        return false;
    }

    openProfileModal("noTeam");
    return true;
}

function isDesktopDashboardLayout(): boolean {
    return window.matchMedia(DESKTOP_DASHBOARD_QUERY).matches;
}

function createProfileFormDraftFromDisplay(): ProfileEdits {
    return {
        fullName: getFullNameDisplay(),
        group: getGroupDisplay(),
        avatarDataUrl: getAvatarDisplay() || null
    };
}

function isPersonalProfileEditingOpen(): boolean {
    return (
        appState.profileModal === "personal" ||
        (appState.dashboardSection === "settings" && isDesktopDashboardLayout())
    );
}

function openSettingsView(): void {
    if (isDesktopDashboardLayout()) {
        appState.teamModal = "none";
        appState.eventsModal = "none";
        appState.profileModal = "none";
        appState.dashboardSection = "settings";
        appState.profileFormDraft = createProfileFormDraftFromDisplay();
        appState.settingsPhotoOriginalAvatarDataUrl = null;
        appState.settingsPhotoOriginalFileName = "";
        appState.settingsPhotoPendingAvatarDataUrl = null;
        appState.settingsPhotoErrorMessage = "";
        persistDashboardSectionToStorage();
        clearStatus();
        render();
        return;
    }

    openProfileModal("personal");
}

const SETTINGS_FIELD_EDIT_LABEL = "ИЗМЕНИТЬ";
const SETTINGS_FIELD_APPLY_LABEL = "ПРИМЕНИТЬ";
const SETTINGS_FIELD_SELECT_LABEL = "ВЫБРАТЬ";

function updateSettingsFieldDisplay(node: HTMLElement, display: { text: string; isPlaceholder: boolean }): void {
    node.textContent = display.text;
    node.classList.toggle("is-placeholder", display.isPlaceholder);
    node.classList.toggle("is-filled", !display.isPlaceholder);
}

function syncSettingsFieldDisplaysFromDraft(): void {
    if (!isHTMLElement(profileMount) || !appState.profileFormDraft) {
        return;
    }

    const draft = appState.profileFormDraft;

    profileMount.querySelectorAll<HTMLElement>("[data-settings-photo-label]").forEach((node) => {
        const photoDataUrl = appState.settingsPhotoPendingAvatarDataUrl ?? draft.avatarDataUrl;
        updateSettingsFieldDisplay(node, getSettingsPhotoDisplay(photoDataUrl, appState.profileAvatarFileName));
    });
    profileMount.querySelectorAll<HTMLElement>("[data-settings-name-label]").forEach((node) => {
        updateSettingsFieldDisplay(node, getSettingsNameDisplay(draft.fullName));
    });
    profileMount.querySelectorAll<HTMLElement>("[data-settings-group-label]").forEach((node) => {
        updateSettingsFieldDisplay(node, getSettingsGroupDisplay(draft.group));
    });
}

function getSettingsEditInput(rowKey: "name" | "group"): HTMLInputElement | null {
    if (!isHTMLElement(profileMount)) {
        return null;
    }

    const inputId = rowKey === "name" ? "profileNameInput" : "profileGroupInput";
    const input = profileMount.querySelector(`#${inputId}`);
    return isHTMLInputElement(input) ? input : null;
}

function getSettingsEditButton(row: HTMLElement): HTMLButtonElement | null {
    const button = row.querySelector<HTMLButtonElement>("[data-settings-edit]");
    return button ?? null;
}

function getSettingsFieldOriginalValue(rowKey: "name" | "group"): string {
    if (rowKey === "name") {
        return (appState.profileFormDraft?.fullName ?? getFullNameDisplay()).trim();
    }

    return normalizeAcademicGroupInput(appState.profileFormDraft?.group ?? getGroupDisplay());
}

function getSettingsFieldCurrentValue(rowKey: "name" | "group", input: HTMLInputElement): string {
    if (rowKey === "group") {
        return normalizeAcademicGroupInput(input.value);
    }

    return input.value.trim();
}

function getSettingsPhotoRow(): HTMLElement | null {
    if (!isHTMLElement(profileMount)) {
        return null;
    }

    return profileMount.querySelector<HTMLElement>(".settings-dashboard-main [data-settings-row='photo']");
}

function getSettingsPhotoFileInput(): HTMLInputElement | null {
    if (!isHTMLElement(profileMount)) {
        return null;
    }

    const input = profileMount.querySelector<HTMLInputElement>("#settingsProfileAvatarInput");
    return isHTMLInputElement(input) ? input : null;
}

function setSettingsPhotoError(message: string): void {
    appState.settingsPhotoErrorMessage = message;

    if (!isHTMLElement(profileMount)) {
        return;
    }

    const errorNode = profileMount.querySelector<HTMLElement>("#settingsPhotoError");
    if (!errorNode) {
        return;
    }

    if (message.trim()) {
        errorNode.textContent = message;
        errorNode.hidden = false;
    } else {
        errorNode.textContent = "";
        errorNode.hidden = true;
    }
}

function clearSettingsPhotoError(): void {
    setSettingsPhotoError("");
}

function resetSettingsPhotoButton(button: HTMLButtonElement): void {
    button.textContent = SETTINGS_FIELD_SELECT_LABEL;
    button.disabled = false;
    button.classList.remove("is-editing-idle", "is-apply-ready");
}

function updateSettingsPhotoButtonState(row: HTMLElement): void {
    const button = getSettingsEditButton(row);
    if (!button || !row.classList.contains("is-editing")) {
        return;
    }

    const originalAvatar = appState.settingsPhotoOriginalAvatarDataUrl ?? null;
    const pendingAvatar = appState.settingsPhotoPendingAvatarDataUrl;
    const changed = pendingAvatar !== null && (
        pendingAvatar !== originalAvatar ||
        appState.profileAvatarFileName !== appState.settingsPhotoOriginalFileName
    );

    button.textContent = changed ? SETTINGS_FIELD_APPLY_LABEL : SETTINGS_FIELD_SELECT_LABEL;
    button.disabled = !changed;
    button.classList.toggle("is-editing-idle", !changed);
    button.classList.toggle("is-apply-ready", changed);
}

function exitSettingsPhotoEditRow(row: HTMLElement, revert = true): void {
    if (revert && appState.profileFormDraft) {
        appState.profileFormDraft.avatarDataUrl = appState.settingsPhotoOriginalAvatarDataUrl ?? null;
        appState.profileAvatarFileName = appState.settingsPhotoOriginalFileName;
    }

    appState.settingsPhotoPendingAvatarDataUrl = null;
    appState.settingsPhotoOriginalAvatarDataUrl = null;
    appState.settingsPhotoOriginalFileName = "";
    clearSettingsPhotoError();

    const avatarInput = getSettingsPhotoFileInput();
    if (avatarInput) {
        avatarInput.value = "";
    }

    row.classList.remove("is-editing");

    const button = getSettingsEditButton(row);
    if (button) {
        resetSettingsPhotoButton(button);
    }

    syncSettingsFieldDisplaysFromDraft();
}

function beginSettingsPhotoEdit(row: HTMLElement): void {
    closeSettingsEditRows(row);
    clearSettingsPhotoError();

    appState.settingsPhotoOriginalAvatarDataUrl = appState.profileFormDraft?.avatarDataUrl ?? null;
    appState.settingsPhotoOriginalFileName = appState.profileAvatarFileName;
    appState.settingsPhotoPendingAvatarDataUrl = null;

    row.classList.add("is-editing");
    updateSettingsPhotoButtonState(row);
    syncSettingsFieldDisplaysFromDraft();

    getSettingsPhotoFileInput()?.click();
}

async function applySettingsPhotoEdit(row: HTMLElement): Promise<void> {
    const pendingAvatar = appState.settingsPhotoPendingAvatarDataUrl;
    if (!pendingAvatar || !appState.profileFormDraft) {
        return;
    }

    if (!isProfileAvatarDataUrlWithinLimit(pendingAvatar)) {
        setSettingsPhotoError(getProfileAvatarSizeLimitMessage());
        updateSettingsPhotoButtonState(row);
        return;
    }

    appState.profileFormDraft.avatarDataUrl = pendingAvatar;
    clearSettingsPhotoError();

    const saved = await submitPersonalProfileSave({ silent: true, skipRender: true });
    if (!saved) {
        updateSettingsPhotoButtonState(row);
        return;
    }

    exitSettingsPhotoEditRow(row, false);
}

function handleSettingsPhotoFileSelected(file: File, row: HTMLElement): void {
    if (!isProfileAvatarFileWithinLimit(file)) {
        const avatarInput = getSettingsPhotoFileInput();
        if (avatarInput) {
            avatarInput.value = "";
        }

        appState.settingsPhotoPendingAvatarDataUrl = null;
        setSettingsPhotoError(getProfileAvatarSizeLimitMessage());
        syncSettingsFieldDisplaysFromDraft();
        updateSettingsPhotoButtonState(row);
        return;
    }

    clearSettingsPhotoError();
    const reader = new FileReader();
    reader.onload = () => {
        if (typeof reader.result !== "string") {
            return;
        }

        appState.settingsPhotoPendingAvatarDataUrl = reader.result;
        appState.profileAvatarFileName = file.name;

        const photoRow = getSettingsPhotoRow();
        if (!photoRow) {
            return;
        }

        syncSettingsFieldDisplaysFromDraft();
        updateSettingsPhotoButtonState(photoRow);
    };
    reader.readAsDataURL(file);
}

function resetSettingsEditButton(button: HTMLButtonElement): void {
    button.textContent = SETTINGS_FIELD_EDIT_LABEL;
    button.disabled = false;
    button.classList.remove("is-editing-idle", "is-apply-ready");
}

function canApplySettingsFieldEdit(rowKey: "name" | "group", input: HTMLInputElement, originalValue: string): boolean {
    const currentValue = getSettingsFieldCurrentValue(rowKey, input);
    if (currentValue === originalValue) {
        return false;
    }

    if (rowKey === "group") {
        return isAcademicGroupValid(currentValue);
    }

    return true;
}

function updateSettingsEditButtonState(row: HTMLElement, rowKey: "name" | "group"): void {
    const button = getSettingsEditButton(row);
    const input = getSettingsEditInput(rowKey);
    const originalValue = row.dataset.settingsOriginalValue ?? "";

    if (!button || !input || !row.classList.contains("is-editing")) {
        return;
    }

    const changed = getSettingsFieldCurrentValue(rowKey, input) !== originalValue;
    const canApply = canApplySettingsFieldEdit(rowKey, input, originalValue);

    button.textContent = changed ? SETTINGS_FIELD_APPLY_LABEL : SETTINGS_FIELD_EDIT_LABEL;
    button.disabled = !canApply;
    button.classList.toggle("is-editing-idle", !canApply);
    button.classList.toggle("is-apply-ready", canApply);
}

function exitSettingsEditRow(row: HTMLElement, revert = true): void {
    const rowKey = row.dataset.settingsRow;
    if (rowKey !== "name" && rowKey !== "group") {
        return;
    }

    const input = getSettingsEditInput(rowKey);
    const originalValue = row.dataset.settingsOriginalValue ?? "";

    if (revert && input) {
        input.value = rowKey === "group" ? normalizeAcademicGroupInput(originalValue) : originalValue;
        if (appState.profileFormDraft) {
            if (rowKey === "name") {
                appState.profileFormDraft.fullName = input.value;
            } else {
                appState.profileFormDraft.group = input.value;
            }
        }
    }

    row.classList.remove("is-editing");
    delete row.dataset.settingsOriginalValue;

    const button = getSettingsEditButton(row);
    if (button) {
        resetSettingsEditButton(button);
    }
}

function beginSettingsFieldEdit(row: HTMLElement, rowKey: "name" | "group"): void {
    closeSettingsEditRows(row);

    const originalValue = getSettingsFieldOriginalValue(rowKey);
    row.dataset.settingsOriginalValue = originalValue;
    row.classList.add("is-editing");

    const input = getSettingsEditInput(rowKey);
    if (input) {
        input.value = originalValue;
        input.focus();
        input.select();
    }

    updateSettingsEditButtonState(row, rowKey);
}

async function applySettingsFieldEdit(row: HTMLElement, rowKey: "name" | "group"): Promise<void> {
    const input = getSettingsEditInput(rowKey);
    if (!input || !appState.profileFormDraft) {
        return;
    }

    if (rowKey === "name") {
        appState.profileFormDraft.fullName = input.value.trim();
    } else {
        const normalizedGroup = normalizeAcademicGroupInput(input.value);
        input.value = normalizedGroup;
        appState.profileFormDraft.group = normalizedGroup;

        if (!isAcademicGroupValid(normalizedGroup)) {
            setStatus("Поле «АКАДЕМ. ГРУППА» заполните в формате РИ-150909.", "error");
            updateSettingsEditButtonState(row, rowKey);
            return;
        }
    }

    clearStatus();
    const saved = await submitPersonalProfileSave({ silent: true, skipRender: true });
    if (!saved) {
        updateSettingsEditButtonState(row, rowKey);
        return;
    }

    exitSettingsEditRow(row, false);
    syncSettingsFieldDisplaysFromDraft();
}

function closeSettingsEditRows(exceptRow?: HTMLElement): void {
    if (!isHTMLElement(profileMount)) {
        return;
    }

    profileMount.querySelectorAll<HTMLElement>(".settings-field-row.is-editing").forEach((row) => {
        if (row !== exceptRow) {
            if (row.dataset.settingsRow === "photo") {
                exitSettingsPhotoEditRow(row, true);
            } else {
                exitSettingsEditRow(row, true);
            }
        }
    });
}

function wireSettingsPageEvents(): void {
    if (!isHTMLElement(profileMount) || appState.dashboardSection !== "settings") {
        return;
    }

    profileMount.querySelectorAll<HTMLButtonElement>("[data-settings-edit]").forEach((button) => {
        button.addEventListener("click", () => {
            const rowKey = button.dataset.settingsEdit;
            const row = button.closest<HTMLElement>("[data-settings-row]");
            if (!row || !rowKey) {
                return;
            }

            if (rowKey === "photo") {
                if (button.classList.contains("is-apply-ready")) {
                    void applySettingsPhotoEdit(row);
                    return;
                }

                if (row.classList.contains("is-editing")) {
                    return;
                }

                beginSettingsPhotoEdit(row);
                return;
            }

            if (rowKey !== "name" && rowKey !== "group") {
                return;
            }

            if (button.classList.contains("is-apply-ready")) {
                void applySettingsFieldEdit(row, rowKey);
                return;
            }

            if (row.classList.contains("is-editing")) {
                getSettingsEditInput(rowKey)?.focus();
                return;
            }

            beginSettingsFieldEdit(row, rowKey);
        });
    });

    const avatarInput = getSettingsPhotoFileInput();
    if (avatarInput) {
        avatarInput.addEventListener("change", () => {
            const file = avatarInput.files?.[0];
            const row = getSettingsPhotoRow();
            if (!file || !row || !row.classList.contains("is-editing")) {
                return;
            }

            handleSettingsPhotoFileSelected(file, row);
        });
    }

    if (appState.settingsPhotoErrorMessage) {
        setSettingsPhotoError(appState.settingsPhotoErrorMessage);
    }

    const personalNameInput = profileMount.querySelector("#profileNameInput");
    if (isHTMLInputElement(personalNameInput) && appState.profileFormDraft) {
        personalNameInput.addEventListener("input", () => {
            appState.profileFormDraft!.fullName = personalNameInput.value;
            const row = personalNameInput.closest<HTMLElement>("[data-settings-row]");
            if (row) {
                updateSettingsEditButtonState(row, "name");
            }
        });
    }

    const personalGroupInput = profileMount.querySelector("#profileGroupInput");
    if (isHTMLInputElement(personalGroupInput) && appState.profileFormDraft) {
        personalGroupInput.addEventListener("input", () => {
            const normalizedValue = normalizeAcademicGroupInput(personalGroupInput.value);
            personalGroupInput.value = normalizedValue;
            appState.profileFormDraft!.group = normalizedValue;
            const row = personalGroupInput.closest<HTMLElement>("[data-settings-row]");
            if (row) {
                updateSettingsEditButtonState(row, "group");
            }
        });
    }
}

function openProfileModal(kind: ProfileModalKind): void {
    appState.teamModal = "none";
    appState.eventsModal = "none";
    appState.profileModal = kind;

    if (kind === "personal") {
        appState.profileFormDraft = createProfileFormDraftFromDisplay();
    }

    render();
}

function closeProfileModal(): void {
    appState.profileModal = "none";
    appState.profileFormDraft = null;
    appState.profileFindTeamQuery = "";
    appState.profileFindTeamSelectedId = null;
    render();
}

const ACADEMIC_GROUP_PATTERN = /^[A-ZА-ЯЁ]{2}-\d{6}$/u;
const MAX_PROFILE_AVATAR_FILE_BYTES = 2 * 1024 * 1024;

function getProfileAvatarSizeLimitMessage(): string {
    return "Фото профиля не должно превышать 2 МБ.";
}

function isProfileAvatarFileWithinLimit(file: File): boolean {
    return file.size <= MAX_PROFILE_AVATAR_FILE_BYTES;
}

function isProfileAvatarDataUrlWithinLimit(dataUrl: string | null | undefined): boolean {
    if (!dataUrl || !dataUrl.startsWith("data:")) {
        return true;
    }

    const commaIndex = dataUrl.indexOf(",");
    if (commaIndex === -1) {
        return true;
    }

    const base64 = dataUrl.slice(commaIndex + 1);
    const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
    const bytes = Math.floor((base64.length * 3) / 4) - padding;
    return bytes <= MAX_PROFILE_AVATAR_FILE_BYTES;
}

function normalizeAcademicGroupInput(value: string): string {
    const uppercased = value.toUpperCase();
    const letters = Array.from(uppercased.matchAll(/[A-ZА-ЯЁ]/gu), (match) => match[0]).slice(0, 2).join("");
    const digits = Array.from(uppercased.matchAll(/\d/g), (match) => match[0]).slice(0, 6).join("");

    if (!letters) {
        return digits ? digits : "";
    }

    if (letters.length < 2) {
        return `${letters}${digits}`;
    }

    return digits ? `${letters}-${digits}` : `${letters}-`;
}

function isAcademicGroupValid(value: string): boolean {
    const trimmed = value.trim();
    return !trimmed || ACADEMIC_GROUP_PATTERN.test(trimmed);
}

function renderProfileModal(): string {
    const draft = appState.profileFormDraft;

    switch (appState.profileModal) {
        case "personal":
            if (!draft) {
                return "";
            }

            return renderProfileModalShell({
                ariaLabel: "Личные данные",
                closeButtonId: "profileClosePersonalButton",
                extraModalClass: "profile-modal--form",
                extraCardClass: "profile-modal-card--form",
                bodyHtml: `
                    <h2 class="profile-shell-title">ЛИЧНЫЕ ДАННЫЕ</h2>
                    <div class="profile-modal-card-body">
                        <div class="profile-modal-field profile-modal-photo-row">
                            <span class="profile-modal-photo-label">ФОТО</span>
                            <label class="profile-modal-file">
                                <input id="profileAvatarInput" type="file" accept="image/*" hidden>
                                <span class="profile-pill-button">ВЫБРАТЬ</span>
                            </label>
                        </div>
                        <p class="profile-modal-field-hint">Максимальный размер фото — 2 МБ.</p>
                        <input id="profileNameInput" class="profile-modal-input" type="text" placeholder="ИМЯ ФАМИЛИЯ" value="${escapeHtml(draft.fullName)}">
                        <input
                            id="profileGroupInput"
                            class="profile-modal-input"
                            type="text"
                            placeholder="АКАДЕМ. ГРУППА · РИ-150909"
                            value="${escapeHtml(draft.group)}"
                            maxlength="9"
                            autocapitalize="characters"
                            spellcheck="false"
                        >
                        <button type="button" class="profile-team-flow-btn profile-team-flow-btn--search" id="profileSavePersonalButton">СОХРАНИТЬ</button>
                    </div>
                `
            });
        case "password":
            return renderProfileModalShell({
                ariaLabel: "Восстановление пароля",
                closeButtonId: "profileClosePasswordButton",
                extraCardClass: "profile-modal-card--form",
                bodyHtml: `
                    <h2 class="profile-shell-title">ВОССТАНОВЛЕНИЕ ПАРОЛЯ</h2>
                    <div class="profile-modal-card-body">
                        <input id="profileNewPasswordInput" class="profile-modal-input" type="password" placeholder="НОВЫЙ ПАРОЛЬ">
                        <input id="profileConfirmPasswordInput" class="profile-modal-input" type="password" placeholder="ПОДТВЕРЖДЕНИЕ">
                        <button type="button" class="profile-team-flow-btn profile-team-flow-btn--search" id="profileSavePasswordButton">СОХРАНИТЬ</button>
                    </div>
                `
            });
        case "noTeam":
            return renderProfileNoTeamModal();
        case "findTeam":
            return renderProfileFindTeamModal(
                getJoinableTeams(appState.profileFindTeamQuery),
                appState.profileFindTeamQuery,
                appState.profileFindTeamSelectedId
            );
        case "createTeam":
            return renderProfileCreateTeamModal(appState.profileCreateTeamName);
        case "teamSuccess":
            return renderProfileTeamSuccessModal();
        case "achievement":
            return renderProfileAchievementModal(getProfileAchievementById(appState.profileAchievementId));
        default:
            return "";
    }
}

function syncAchievementScrollFadeClasses(scroller: HTMLElement): void {
    const wrap = scroller.parentElement;
    if (!wrap?.classList.contains("profile-achievements-scroll-wrap")) {
        return;
    }

    const max = scroller.scrollWidth - scroller.clientWidth;
    const scrollable = max > 4;
    const left = scroller.scrollLeft <= 4;
    const right = scroller.scrollLeft >= max - 4;

    wrap.classList.toggle("is-scrollable", scrollable);
    if (!scrollable) {
        wrap.classList.add("is-at-start", "is-at-end");
    } else {
        wrap.classList.toggle("is-at-start", left);
        wrap.classList.toggle("is-at-end", right);
    }
}

function syncAchievementCustomScrollbar(scroller: HTMLElement): void {
    const wrap = scroller.parentElement;
    if (!wrap?.classList.contains("profile-achievements-scroll-wrap")) {
        return;
    }

    const bar = wrap.querySelector<HTMLElement>(".profile-achievements-bar");
    const thumb = wrap.querySelector<HTMLElement>(".profile-achievements-thumb");
    if (!(bar instanceof HTMLElement) || !(thumb instanceof HTMLElement)) {
        return;
    }

    const maxScroll = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
    const trackWidth = Math.max(0, bar.clientWidth);
    if (trackWidth === 0) {
        return;
    }

    if (maxScroll <= 0) {
        thumb.style.width = `${trackWidth}px`;
        thumb.style.transform = "translateX(0px)";
        bar.classList.add("is-disabled");
        return;
    }

    bar.classList.remove("is-disabled");
    const thumbWidth = Math.max(64, Math.round(trackWidth * (scroller.clientWidth / scroller.scrollWidth)));
    const available = Math.max(0, trackWidth - thumbWidth);
    const left = available > 0 ? Math.round((scroller.scrollLeft / maxScroll) * available) : 0;

    thumb.style.width = `${thumbWidth}px`;
    thumb.style.transform = `translateX(${left}px)`;
}

function bindAchievementCustomScrollbar(scroller: HTMLElement): void {
    const wrap = scroller.parentElement;
    if (!wrap?.classList.contains("profile-achievements-scroll-wrap")) {
        return;
    }

    const bar = wrap.querySelector<HTMLElement>(".profile-achievements-bar");
    const thumb = wrap.querySelector<HTMLElement>(".profile-achievements-thumb");
    if (!(bar instanceof HTMLElement) || !(thumb instanceof HTMLElement)) {
        return;
    }

    const scrollToClientX = (clientX: number): void => {
        const maxScroll = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
        if (maxScroll <= 0) {
            scroller.scrollLeft = 0;
            return;
        }

        const rect = bar.getBoundingClientRect();
        const thumbWidth = thumb.getBoundingClientRect().width;
        const available = Math.max(1, rect.width - thumbWidth);
        const offset = Math.min(Math.max(clientX - rect.left - thumbWidth / 2, 0), available);
        scroller.scrollLeft = (offset / available) * maxScroll;
    };

    bar.addEventListener("pointerdown", (event) => {
        if (event.target === thumb) {
            return;
        }

        event.preventDefault();
        scrollToClientX(event.clientX);
    });

    thumb.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        event.stopPropagation();

        const startClientX = event.clientX;
        const startScrollLeft = scroller.scrollLeft;

        const onPointerMove = (moveEvent: PointerEvent): void => {
            const maxScroll = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
            const trackWidth = bar.getBoundingClientRect().width;
            const thumbWidth = thumb.getBoundingClientRect().width;
            const available = Math.max(1, trackWidth - thumbWidth);
            if (maxScroll <= 0) {
                scroller.scrollLeft = 0;
                return;
            }

            const delta = moveEvent.clientX - startClientX;
            scroller.scrollLeft = startScrollLeft + (delta / available) * maxScroll;
        };

        const onPointerUp = (): void => {
            window.removeEventListener("pointermove", onPointerMove);
            window.removeEventListener("pointerup", onPointerUp);
        };

        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerUp);
    });
}

function renderProfileMainHtml(): string {
    validateExternalProfileView();

    const externalView = appState.externalProfileView;
    const externalRating = appState.externalProfileRating;
    const joinRequest = getActiveJoinRequestForExternalProfile();
    const viewingExternalProfile = Boolean(externalView);
    const profile = appState.profile;

    const leagueLabel = "ЛИГА";
    const ratingLabel = "РЕЙТИНГ";

    let leagueValue: string;
    let pointsValue: string;
    let ratingValue: string;
    let fullName: string;
    let group: string;
    let teamPillText: string;
    let avatarSrc: string;
    let achievementsContent: string;

    if (viewingExternalProfile && externalView) {
        fullName =
            externalRating?.name?.trim() ||
            joinRequest?.displayName?.trim() ||
            joinRequest?.userName?.trim() ||
            externalView.fallbackName?.trim() ||
            "Участник";
        group = externalRating?.groupTitle?.trim() || "—";
        teamPillText = externalRating?.teamName?.trim() || (externalRating?.hasTeam ? "КОМАНДА" : "БЕЗ КОМАНДЫ");
        leagueValue = externalRating?.league?.trim() || "Новичок";
        pointsValue = externalRating ? String(externalRating.points) : "—";
        ratingValue =
            externalRating && externalRating.rank > 0 ? `${externalRating.rank} место` : "—";
        avatarSrc =
            externalRating?.avatarUrl?.trim() ||
            joinRequest?.avatarUrl?.trim() ||
            externalView.fallbackAvatarUrl?.trim() ||
            "";
        achievementsContent =
            externalRating && externalRating.achievementsCount > 0
                ? `
                    <div class="profile-achievements-scroll-wrap">
                        <div class="profile-achievements-fade profile-achievements-fade-left" aria-hidden="true"></div>
                        <div class="profile-achievements-fade profile-achievements-fade-right" aria-hidden="true"></div>
                        <div class="profile-achievements-scroll" id="profileAchievementsScroll">
                            ${renderPublicAchievementsStrip(externalRating.achievementsCount)}
                        </div>
                    </div>`
                : `
                    <div class="profile-achievements-empty" aria-live="polite">
                        <p class="profile-achievements-empty-text">Достижения участника появятся здесь после выполнения челленджей.</p>
                    </div>`;
    } else {
        const actualPoints = profile?.userPoints ?? profile?.teamScore ?? 0;
        pointsValue = String(actualPoints);
        ratingValue =
            profile?.personalRating && profile.personalRating > 0
                ? `${profile.personalRating} место`
                : "—";
        const rawLeagueValue = profile?.personalLeague?.trim() ?? "";
        leagueValue =
            rawLeagueValue && rawLeagueValue.toLowerCase() !== "старт" ? rawLeagueValue : "Новичок";
        fullName = getFullNameDisplay();
        group = getGroupDisplay();
        teamPillText = getEffectiveTeamName() || "КОМАНДА";
        avatarSrc = getAvatarDisplay();
        achievementsContent = hasProfileAchievements(profile)
            ? `
                    <div class="profile-achievements-scroll-wrap">
                        <div class="profile-achievements-fade profile-achievements-fade-left" aria-hidden="true"></div>
                        <div class="profile-achievements-fade profile-achievements-fade-right" aria-hidden="true"></div>
                        <div class="profile-achievements-scroll" id="profileAchievementsScroll">
                            ${renderProfileAchievementStrip()}
                        </div>
                        <div class="profile-achievements-bar" id="profileAchievementsBar" aria-hidden="true">
                            <div class="profile-achievements-thumb" id="profileAchievementsThumb"></div>
                        </div>
                    </div>`
            : `
                    <div class="profile-achievements-empty" aria-live="polite">
                        <p class="profile-achievements-empty-text">Каждое достижение — это твой личный вклад в КРК. Выполни челлендж, чтобы получить свою первую ачивку!</p>
                        <button type="button" class="profile-achievements-empty-button">К ЧЕЛЛЕНДЖАМ</button>
                    </div>`;
    }

    const photoContent = avatarSrc
        ? `<img class="profile-photo-image" src="${escapeHtml(avatarSrc)}" alt="Фото профиля" loading="lazy">`
        : `<span class="profile-photo-placeholder">Фото</span>`;

    const ratingTrackHtml = viewingExternalProfile
        ? `
                            <div class="profile-stat-track profile-stat-track--rating">
                                <span class="profile-stat-orb profile-stat-orb--accent profile-stat-orb--rating" aria-hidden="true">
                                    <img class="profile-stat-icon" src="${ratingMenuIconUrl}" alt="" aria-hidden="true">
                                    <span class="profile-stat-label">${ratingLabel}</span>
                                </span>
                                <span class="profile-stat-value">${escapeHtml(ratingValue)}</span>
                            </div>`
        : `
                            <button type="button" class="profile-stat-track profile-stat-track--rating" id="profileRatingTrackButton">
                                <span class="profile-stat-orb profile-stat-orb--accent profile-stat-orb--rating" aria-hidden="true">
                                    <img class="profile-stat-icon" src="${ratingMenuIconUrl}" alt="" aria-hidden="true">
                                    <span class="profile-stat-label">${ratingLabel}</span>
                                </span>
                                <span class="profile-stat-value">${escapeHtml(ratingValue)}</span>
                            </button>`;

    const teamPillHtml = viewingExternalProfile
        ? `<div class="profile-info-pill profile-info-pill-accent">${escapeHtml(teamPillText)}</div>`
        : `<button type="button" class="profile-info-pill profile-info-pill-accent" id="profileTeamPillButton">${escapeHtml(teamPillText)}</button>`;

    const dockHtml =
        viewingExternalProfile && externalView
            ? renderExternalProfileDock({
                source: externalView.source,
                requestId: externalView.requestId,
                canAct: externalView.source === "join-request" ? isTeamCaptain() : false
            })
            : "";

    return `
            <section class="profile-main${viewingExternalProfile ? " profile-main--requests-review profile-main--external-view" : ""}">
                <div class="profile-hero-card">
                    <div class="profile-top">
                        <div class="profile-photo-col">
                            <div class="profile-photo${avatarSrc ? " has-image" : ""}" id="profileOwnPhoto">${photoContent}</div>
                        </div>
                        <div class="profile-stats-col" aria-label="Сводка: лига, баллы, рейтинг">
                            <div class="profile-stat-track">
                                <span class="profile-stat-orb profile-stat-orb--muted profile-stat-orb--league" aria-hidden="true">
                                    <img class="profile-stat-icon" src="${ligaMobileIconUrl}" alt="" aria-hidden="true">
                                    <span class="profile-stat-label">${leagueLabel}</span>
                                </span>
                                <span class="profile-stat-value">${escapeHtml(leagueValue)}</span>
                            </div>
                            <div class="profile-stat-track">
                                <span class="profile-stat-orb profile-stat-orb--muted profile-stat-orb--score" aria-hidden="true">
                                    <img class="profile-stat-icon" src="${scoreMobileIconUrl}" alt="" aria-hidden="true">
                                    <span class="profile-stat-label">БАЛЛЫ</span>
                                </span>
                                <span class="profile-stat-value profile-stat-value--num">${escapeHtml(pointsValue)}</span>
                            </div>
                            ${ratingTrackHtml}
                        </div>
                    </div>
                    <div class="profile-pills-row">
                        <div class="profile-info-pill profile-info-pill--name">${escapeHtml(fullName || "ИМЯ ФАМИЛИЯ")}</div>
                        <div class="profile-info-pill profile-info-pill--group">${escapeHtml(group || "РИ-XXXXXX")}</div>
                        ${teamPillHtml}
                    </div>
                </div>
                <div class="profile-achievements">
                    <h3 class="profile-achievements-title">ДОСТИЖЕНИЯ</h3>
                    ${achievementsContent}
                </div>
                ${dockHtml}
        </section>`;
}

function renderProfileView(): void {
    if (!isHTMLElement(profileMount)) {
        return;
    }

    if (!isDesktopDashboardLayout() && appState.dashboardSection === "settings") {
        appState.dashboardSection = "profile";
    }

    const statusHtml = renderStatusBlock();

    const navProfileActive = appState.dashboardSection === "profile" ? " is-active" : "";
    const navTeamActive = appState.dashboardSection === "team" ? " is-active" : "";
    const navRatingActive = appState.dashboardSection === "rating" ? " is-active" : "";
    const navTasksActive = appState.dashboardSection === "tasks" ? " is-active" : "";
    const navEventsActive = appState.dashboardSection === "events" ? " is-active" : "";
    const navSettingsActive = appState.dashboardSection === "settings" ? " is-active" : "";
    const profileAppModeClass = ` profile-app--dashboard-profile${appState.profileModal === "achievement" ? " is-achievement-modal-open" : ""}`;
    const extraNavHtml = `
                    <button type="button" class="profile-nav-button${navTasksActive}" data-dashboard="tasks"><img class="profile-nav-icon" src="${tasksMenuIconUrl}" alt="" aria-hidden="true"><span class="profile-nav-label">ЗАДАНИЯ</span></button>
                    <button type="button" class="profile-nav-button${navEventsActive}" data-dashboard="events"><img class="profile-nav-icon" src="${calendarMenuIconUrl}" alt="" aria-hidden="true"><span class="profile-nav-label">СОБЫТИЯ</span></button>`;

    const mainColumn =
        appState.dashboardSection === "team"
            ? renderTeamPageMain(statusHtml)
            : appState.dashboardSection === "rating"
              ? renderRatingPageMain(statusHtml)
              : appState.dashboardSection === "tasks"
                ? renderTasksPageMain(statusHtml, appState.tasksKrcTier)
                : appState.dashboardSection === "events"
                  ? renderEventsDashboardMain(statusHtml)
                  : appState.dashboardSection === "settings"
                    ? renderSettingsPageMain(
                        statusHtml,
                        appState.profileFormDraft ?? createProfileFormDraftFromDisplay(),
                        appState.profileAvatarFileName
                    )
                    : renderProfileMainHtml();

    profileMount.innerHTML = `
        <div class="profile-app${profileAppModeClass}">
            <button
                type="button"
                class="profile-menu-toggle"
                id="profileMobileMenuButton"
                aria-label="Открыть меню"
                aria-controls="profileDashboardMenu"
                aria-expanded="false"
            >
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
            </button>
            <div class="profile-menu-backdrop" data-profile-menu-close aria-hidden="true"></div>
            <aside class="profile-sidebar profile-sidebar--dashboard" id="profileDashboardMenu" aria-label="Разделы" aria-expanded="false">
                <div class="profile-sidebar-swipe-handle" aria-hidden="true"></div>
                <nav class="profile-nav-top">
                    <button type="button" class="profile-nav-button${navProfileActive}" data-dashboard="profile"><img class="profile-nav-icon" src="${profileMenuIconUrl}" alt="" aria-hidden="true"><span class="profile-nav-label">ПРОФИЛЬ</span></button>
                    <button type="button" class="profile-nav-button${navTeamActive}" data-dashboard="team"><img class="profile-nav-icon" src="${teamMenuIconUrl}" alt="" aria-hidden="true"><span class="profile-nav-label">КОМАНДА</span></button>
                    <button type="button" class="profile-nav-button${navRatingActive}" data-dashboard="rating"><img class="profile-nav-icon" src="${ratingMenuIconUrl}" alt="" aria-hidden="true"><span class="profile-nav-label">РЕЙТИНГ</span></button>
                    ${extraNavHtml}
                </nav>
                <nav class="profile-nav-bottom">
                    <button type="button" class="profile-nav-button${navSettingsActive}" id="profileSettingsButton"><img class="profile-nav-icon" src="${settingsMenuIconUrl}" alt="" aria-hidden="true"><span class="profile-nav-label">НАСТРОЙКИ</span></button>
                    <button type="button" class="profile-nav-button" id="profileLogoutButton"><img class="profile-nav-icon" src="${logoutMenuIconUrl}" alt="" aria-hidden="true"><span class="profile-nav-label">ПОКИНУТЬ</span></button>
                </nav>
            </aside>
            ${mainColumn}
        </div>
        ${renderProfileModal()}
        ${renderTeamModal()}
        ${renderEventsModal()}
        ${renderRatingPageModals()}
        ${renderTeamPageModals()}
    `;

    wireProfileViewEvents();

    if (appState.profileModal === "teamSuccess") {
        void paintTeamSuccessQr();
    }

    if (appState.teamModal === "requests") {
        void paintRequestsQr();
    }

    if (appState.eventsModal === "success") {
        void paintEventSuccessQr();
    }

    if (appState.dashboardSection === "team" && teamFlowState.eventModal === "success" && isHTMLElement(profileMount)) {
        void paintTeamPageEventSuccessQr(profileMount);
    }
}

function wireMobileProfileMenu(): void {
    if (!isHTMLElement(profileMount)) {
        return;
    }

    const profileApp = profileMount.querySelector<HTMLElement>(".profile-app");
    const menuButton = profileMount.querySelector("#profileMobileMenuButton");
    const backdrop = profileMount.querySelector("[data-profile-menu-close]");
    const sidebar = profileMount.querySelector<HTMLElement>("#profileDashboardMenu");
    const navBottom = profileMount.querySelector<HTMLElement>(".profile-sidebar .profile-nav-bottom");

    if (!profileApp || !sidebar || !navBottom) {
        return;
    }

    let startX = 0;
    let startY = 0;
    let activePointerId: number | null = null;
    let dragMode: "open" | "close" | null = null;
    let dragHeights: { closed: number; open: number } | null = null;
    let dragStartedOpen = false;
    let isDragging = false;
    let suppressNavClickUntil = 0;
    let lastProgress = 0;
    let displayedProgress = 0;
    let targetProgress = 0;
    let snapTimer: number | null = null;
    let dragFrameId: number | null = null;
    let lastDragFrameTime = 0;
    let lastMoveY = 0;
    let lastMoveTime = 0;
    let velocityY = 0;

    const isBottomNavLayout = (): boolean => window.matchMedia(MOBILE_BOTTOM_NAV_QUERY).matches;

    const isNavButtonTarget = (target: Element): boolean => Boolean(target.closest(".profile-nav-button"));

    const canStartMenuGesture = (target: Element, clientY: number): boolean => {
        if (isNavButtonTarget(target)) {
            return false;
        }

        if (target.closest(".profile-modal, button, input, textarea, select, a, label")) {
            return false;
        }

        const isOpen = profileApp.classList.contains("is-mobile-menu-open");
        if (target.closest(".profile-sidebar-swipe-handle")) {
            return true;
        }

        const sidebarRect = sidebar.getBoundingClientRect();
        const isInsideSidebar = clientY >= sidebarRect.top - 12 && clientY <= sidebarRect.bottom + 12;
        if (isOpen && isInsideSidebar) {
            return true;
        }

        const appRect = profileApp.getBoundingClientRect();
        return clientY >= appRect.bottom - 160;
    };

    const getMenuHeights = (): { closed: number; open: number } => ({
        closed: MOBILE_BOTTOM_NAV_CLOSED_HEIGHT,
        open: MOBILE_BOTTOM_NAV_OPEN_HEIGHT
    });

    const clampProgress = (value: number): number => Math.min(Math.max(value, 0), 1);

    const updateMenuAria = (isOpen: boolean): void => {
        if (isHTMLButtonElement(menuButton)) {
            menuButton.setAttribute("aria-expanded", String(isOpen));
            menuButton.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");
        }
        sidebar.setAttribute("aria-expanded", String(isOpen));
    };

    const clearInlineMenuProgress = (): void => {
        profileApp.style.removeProperty("--menu-progress");
        profileApp.style.removeProperty("touch-action");
        sidebar.style.removeProperty("touch-action");
    };

    const applyMenuProgress = (progress: number): void => {
        lastProgress = clampProgress(progress);
        profileApp.classList.add("is-mobile-menu-dragging");
        profileApp.style.setProperty("--menu-progress", lastProgress.toFixed(4));
        profileApp.style.touchAction = "none";
        sidebar.style.touchAction = "none";
    };

    const stopDragAnimation = (): void => {
        if (dragFrameId !== null) {
            window.cancelAnimationFrame(dragFrameId);
            dragFrameId = null;
        }
    };

    const runDragAnimation = (timestamp: number): void => {
        if (lastDragFrameTime === 0) {
            lastDragFrameTime = timestamp;
        }

        const frameDelta = Math.min(Math.max(timestamp - lastDragFrameTime, 8), 32);
        lastDragFrameTime = timestamp;
        const smoothing = 1 - Math.pow(1 - MOBILE_MENU_DRAG_SMOOTHING, frameDelta / 16.67);
        displayedProgress += (targetProgress - displayedProgress) * smoothing;

        if (Math.abs(targetProgress - displayedProgress) < 0.001) {
            displayedProgress = targetProgress;
            applyMenuProgress(displayedProgress);
            dragFrameId = null;
            lastDragFrameTime = 0;
            return;
        }

        applyMenuProgress(displayedProgress);
        dragFrameId = window.requestAnimationFrame(runDragAnimation);
    };

    const setTargetProgress = (progress: number): void => {
        targetProgress = clampProgress(progress);
        if (dragFrameId === null) {
            lastDragFrameTime = 0;
            dragFrameId = window.requestAnimationFrame(runDragAnimation);
        }
    };

    const readCurrentMenuProgress = (): number => {
        const inlineProgress = profileApp.style.getPropertyValue("--menu-progress");
        if (inlineProgress) {
            const parsed = Number.parseFloat(inlineProgress);
            if (Number.isFinite(parsed)) {
                return clampProgress(parsed);
            }
        }

        return profileApp.classList.contains("is-mobile-menu-open") ? 1 : 0;
    };

    const cancelSnapAnimation = (): void => {
        if (snapTimer !== null) {
            window.clearTimeout(snapTimer);
            snapTimer = null;
        }

        profileApp.classList.remove("is-mobile-menu-snapping");
    };

    const setMenuOpenInstant = (isOpen: boolean): void => {
        cancelSnapAnimation();
        stopDragAnimation();
        profileApp.classList.remove("is-mobile-menu-dragging");
        profileApp.classList.remove("is-mobile-menu-snapping");
        profileApp.classList.toggle("is-mobile-menu-open", isOpen);
        updateMenuAria(isOpen);
        clearInlineMenuProgress();
        lastProgress = isOpen ? 1 : 0;
        displayedProgress = lastProgress;
        targetProgress = lastProgress;
    };

    const snapMenuTo = (targetProgressValue: number): void => {
        cancelSnapAnimation();
        stopDragAnimation();

        const target = clampProgress(targetProgressValue);
        profileApp.classList.remove("is-mobile-menu-dragging");
        profileApp.classList.add("is-mobile-menu-snapping");
        profileApp.style.setProperty("--menu-progress", displayedProgress.toFixed(4));

        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
                profileApp.style.setProperty("--menu-progress", target.toFixed(4));
            });
        });

        snapTimer = window.setTimeout(() => {
            snapTimer = null;
            setMenuOpenInstant(target >= 0.5);
        }, MOBILE_MENU_SNAP_MS);
    };

    const setMenuOpen = (isOpen: boolean, animate = true): void => {
        const target = isOpen ? 1 : 0;
        if (!animate || Math.abs(lastProgress - target) < 0.02) {
            setMenuOpenInstant(isOpen);
            return;
        }

        snapMenuTo(target);
    };

    if (isHTMLButtonElement(menuButton)) {
        menuButton.addEventListener("click", () => {
            setMenuOpen(!profileApp.classList.contains("is-mobile-menu-open"));
        });
    }

    if (backdrop instanceof HTMLElement) {
        backdrop.addEventListener("click", () => {
            setMenuOpen(false);
        });
    }

    profileMount.querySelectorAll<HTMLButtonElement>(".profile-sidebar .profile-nav-button").forEach((button) => {
        button.addEventListener("click", (event) => {
            if (Date.now() < suppressNavClickUntil) {
                event.preventDefault();
                event.stopImmediatePropagation();
                return;
            }

            if (profileApp.classList.contains("is-mobile-menu-open")) {
                setMenuOpen(false, false);
            }
        });
    });

    const resetGesture = (): void => {
        activePointerId = null;
        dragMode = null;
        dragHeights = null;
        isDragging = false;
    };

    const updateGesture = (clientX: number, clientY: number, preventDefault?: () => void): void => {
        if (!dragMode || !dragHeights) {
            return;
        }

        const deltaY = startY - clientY;
        const deltaX = clientX - startX;

        if (!isDragging) {
            if (Math.abs(deltaY) < 4) {
                return;
            }

            if (Math.abs(deltaY) <= Math.abs(deltaX) * 0.85) {
                return;
            }

            isDragging = true;
            preventDefault?.();
        }

        preventDefault?.();

        const now = performance.now();
        if (lastMoveTime > 0) {
            const moveDelta = now - lastMoveTime;
            if (moveDelta > 0) {
                velocityY = (lastMoveY - clientY) / moveDelta;
            }
        }
        lastMoveY = clientY;
        lastMoveTime = now;

        const rawDistance = dragMode === "open" ? deltaY : -deltaY;
        const distance = Math.max(rawDistance, 0) * MOBILE_BOTTOM_NAV_SWIPE_SENSITIVITY;
        const maxDistance = Math.max(dragHeights.open - dragHeights.closed, 1);
        const progress =
            dragMode === "open"
                ? clampProgress(distance / maxDistance)
                : clampProgress(1 - distance / maxDistance);

        setTargetProgress(progress);
    };

    const finishGesture = (clientX: number, clientY: number): void => {
        if (activePointerId === null) {
            return;
        }

        if (!dragMode || !dragHeights) {
            activePointerId = null;
            return;
        }

        stopDragAnimation();
        displayedProgress = targetProgress;
        lastProgress = displayedProgress;

        const deltaY = startY - clientY;
        const rawDistance = dragMode === "open" ? deltaY : -deltaY;
        const distance = Math.max(rawDistance, 0) * MOBILE_BOTTOM_NAV_SWIPE_SENSITIVITY;
        const maxDistance = Math.max(dragHeights.open - dragHeights.closed, 1);
        const progress = clampProgress(distance / maxDistance);

        if (isDragging) {
            suppressNavClickUntil = Date.now() + 450;
        }

        let shouldOpen = dragStartedOpen;
        if (isDragging && dragMode === "open") {
            shouldOpen =
                velocityY >= MOBILE_BOTTOM_NAV_FLING_VELOCITY ||
                distance >= MOBILE_BOTTOM_NAV_OPEN_COMMIT_PX ||
                progress >= 0.2 ||
                lastProgress >= 0.55;
        } else if (isDragging && dragMode === "close") {
            shouldOpen = !(
                velocityY <= -MOBILE_BOTTOM_NAV_FLING_VELOCITY ||
                distance >= MOBILE_BOTTOM_NAV_OPEN_COMMIT_PX ||
                progress >= 0.2 ||
                lastProgress <= 0.45
            );
        }

        activePointerId = null;
        resetGesture();
        setMenuOpen(shouldOpen, isDragging);
    };

    const onPointerDown = (event: PointerEvent): void => {
        if (!isBottomNavLayout() || event.pointerType === "mouse" || event.button !== 0) {
            return;
        }

        if (appState.profileModal !== "none" || appState.teamModal !== "none" || appState.eventsModal !== "none") {
            return;
        }

        const target = event.target;
        if (!(target instanceof Element) || target.closest(".profile-modal")) {
            return;
        }

        if (!canStartMenuGesture(target, event.clientY)) {
            return;
        }

        const isOpen = profileApp.classList.contains("is-mobile-menu-open");
        cancelSnapAnimation();
        stopDragAnimation();

        startX = event.clientX;
        startY = event.clientY;
        activePointerId = event.pointerId;
        dragStartedOpen = isOpen;
        dragMode = isOpen ? "close" : "open";
        dragHeights = getMenuHeights();
        isDragging = false;
        lastMoveY = event.clientY;
        lastMoveTime = 0;
        velocityY = 0;
        lastProgress = readCurrentMenuProgress();
        displayedProgress = lastProgress;
        targetProgress = lastProgress;

        try {
            sidebar.setPointerCapture(event.pointerId);
        } catch {
            // Ignore capture errors on unsupported targets.
        }
    };

    const onPointerMove = (event: PointerEvent): void => {
        if (activePointerId !== event.pointerId) {
            return;
        }

        updateGesture(event.clientX, event.clientY, () => event.preventDefault());
    };

    const onPointerUp = (event: PointerEvent): void => {
        if (activePointerId !== event.pointerId) {
            return;
        }

        if (sidebar.hasPointerCapture(event.pointerId)) {
            sidebar.releasePointerCapture(event.pointerId);
        }

        finishGesture(event.clientX, event.clientY);
    };

    const onPointerCancel = (event: PointerEvent): void => {
        if (activePointerId !== event.pointerId) {
            return;
        }

        if (sidebar.hasPointerCapture(event.pointerId)) {
            sidebar.releasePointerCapture(event.pointerId);
        }

        setMenuOpenInstant(dragStartedOpen);
        resetGesture();
    };

    sidebar.addEventListener("pointerdown", onPointerDown, { passive: false });
    sidebar.addEventListener("pointermove", onPointerMove, { passive: false });
    sidebar.addEventListener("pointerup", onPointerUp, { passive: false });
    sidebar.addEventListener("pointercancel", onPointerCancel, { passive: false });
}

function wireProfileViewEvents(): void {
    if (!isHTMLElement(profileMount)) {
        return;
    }

    wireMobileProfileMenu();

    if (appState.dashboardSection === "profile" && !isViewingExternalProfile()) {
        const photoEl = profileMount.querySelector("#profileOwnPhoto");
        if (photoEl instanceof HTMLElement) {
            const src = getAvatarDisplay();
            const img = photoEl.querySelector(".profile-photo-image");
            if (src) {
                photoEl.classList.add("has-image");
                photoEl.style.removeProperty("background-image");
                if (img instanceof HTMLImageElement) {
                    img.src = src;
                }
            } else {
                photoEl.classList.remove("has-image");
                photoEl.style.removeProperty("background-image");
            }
        }
    }
    profileAchievementScrollResizeObserver?.disconnect();
    profileAchievementScrollResizeObserver = undefined;

    const achievementsScroll = profileMount.querySelector("#profileAchievementsScroll");
    if (achievementsScroll instanceof HTMLElement) {
        const syncAchievements = (): void => {
            syncAchievementScrollFadeClasses(achievementsScroll);
            syncAchievementCustomScrollbar(achievementsScroll);
        };

        bindAchievementCustomScrollbar(achievementsScroll);
        achievementsScroll.addEventListener("scroll", syncAchievements, { passive: true });
        requestAnimationFrame(syncAchievements);
        profileAchievementScrollResizeObserver = new ResizeObserver(() => syncAchievements());
        profileAchievementScrollResizeObserver.observe(achievementsScroll);
    }

    const logoutButton = profileMount.querySelector("#profileLogoutButton");
    if (isHTMLButtonElement(logoutButton)) {
        logoutButton.addEventListener("click", () => {
            clearSession();
            appState.profile = null;
            resetProfileUi();
            appState.signIn.password = "";
            setStatus("Сессия завершена.");
            setView("sign-in");
        });
    }

    const settingsButton = profileMount.querySelector("#profileSettingsButton");
    if (isHTMLButtonElement(settingsButton)) {
        settingsButton.addEventListener("click", () => {
            openSettingsView();
        });
    }

    const teamPill = profileMount.querySelector("#profileTeamPillButton");
    if (isHTMLButtonElement(teamPill)) {
        teamPill.addEventListener("click", () => {
            if (tryOpenNoTeamModal()) {
                return;
            }

            appState.dashboardSection = "team";
            persistDashboardSectionToStorage();
            clearStatus();
            render();
        });
    }

    const ratingTrackButton = profileMount.querySelector("#profileRatingTrackButton");
    if (isHTMLButtonElement(ratingTrackButton)) {
        ratingTrackButton.addEventListener("click", () => {
            openRatingDashboard();
        });
    }

    profileMount.querySelectorAll<HTMLButtonElement>("[data-dashboard]").forEach((button) => {
        button.addEventListener("click", () => {
            const section = button.dataset.dashboard as DashboardSection | undefined;
            if (!section) {
                return;
            }

            if (section === "team" && tryOpenNoTeamModal()) {
                return;
            }

            if (isViewingExternalProfile()) {
                clearExternalProfileView();
                appState.teamModal = "none";
            }

            if (section === "events") {
                resetEventsCalendarToToday();
            }

            if (section === "rating") {
                openRatingDashboard();
                return;
            }

            appState.dashboardSection = section;
            persistDashboardSectionToStorage();
            clearStatus();
            render();
        });
    });

    profileMount.querySelectorAll<HTMLButtonElement>("[data-dashboard-placeholder]").forEach((button) => {
        button.addEventListener("click", () => {
            setStatus("Раздел скоро будет доступен.");
            render();
        });
    });

    if (appState.dashboardSection === "rating" && isHTMLElement(profileMount)) {
        wireRatingPageEvents(profileMount);
    }
    if (appState.dashboardSection === "team" && isHTMLElement(profileMount)) {
        wireTeamPageEvents(profileMount);
    }
    if (appState.dashboardSection === "tasks" && isHTMLElement(profileMount)) {
        wireTasksPageEvents(profileMount, (tier: TasksKrcTier) => {
            appState.tasksKrcTier = tier;
            clearStatus();
            render();
        });
    }
    if (appState.dashboardSection === "settings") {
        wireSettingsPageEvents();
    }
    wireEventsDashboardEvents();
    wireEventsModalEvents();

    wireTeamRescueModalEvents();

    wireTeamVoteModalEvents();

    profileMount.querySelectorAll<HTMLElement>("[data-close-team-modal]").forEach((node) => {
        node.addEventListener("click", () => {
            closeTeamModal();
        });
    });

    const teamCloseVote = profileMount.querySelector("#teamCloseVoteButton");
    if (isHTMLButtonElement(teamCloseVote)) {
        teamCloseVote.addEventListener("click", () => {
            closeTeamModal();
        });
    }

    const teamCloseCheckIn = profileMount.querySelector("#teamCloseCheckInButton");
    if (isHTMLButtonElement(teamCloseCheckIn)) {
        teamCloseCheckIn.addEventListener("click", () => {
            closeTeamModal();
        });
    }

    const checkInWeek = profileMount.querySelector("#teamCheckInWeekInput");
    if (isHTMLInputElement(checkInWeek)) {
        checkInWeek.addEventListener("input", () => {
            teamFlowState.checkInWeek = checkInWeek.value;
            teamFlowState.checkInError = "";
        });
    }

    const checkInReport = profileMount.querySelector("#teamCheckInReportInput");
    if (checkInReport instanceof HTMLTextAreaElement) {
        checkInReport.addEventListener("input", () => {
            teamFlowState.checkInReport = checkInReport.value;
            teamFlowState.checkInError = "";
        });
    }

    const checkInForm = profileMount.querySelector("#teamCheckInForm");
    if (isHTMLFormElement(checkInForm)) {
        checkInForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const week = Number(isHTMLInputElement(checkInWeek) ? checkInWeek.value : teamFlowState.checkInWeek);
            const report = checkInReport instanceof HTMLTextAreaElement
                ? checkInReport.value.trim()
                : teamFlowState.checkInReport.trim();

            if (!Number.isInteger(week) || week < 1 || week > 52) {
                teamFlowState.checkInError = "Укажите неделю от 1 до 52.";
                render();
                return;
            }

            if (!report) {
                teamFlowState.checkInError = "Заполните текст отчета.";
                render();
                return;
            }

            void submitTeamCheckIn(week, report)
                .then(() => {
                    teamFlowState.checkInWeek = "";
                    teamFlowState.checkInReport = "";
                    teamFlowState.checkInError = "";
                    setStatus("Check-in отправлен.");
                    closeTeamModal();
                })
                .catch((error: unknown) => {
                    teamFlowState.checkInError = getErrorMessage(error);
                    render();
                });
        });
    }

    const teamCloseRequests = profileMount.querySelector("#teamCloseRequestsButton");
    if (isHTMLButtonElement(teamCloseRequests)) {
        teamCloseRequests.addEventListener("click", () => {
            closeTeamModal();
        });
    }

    const teamCopyRequests = profileMount.querySelector("#teamRequestsCopyLinkButton");
    if (isHTMLButtonElement(teamCopyRequests)) {
        teamCopyRequests.addEventListener("click", async () => {
            const link = appState.teamRequestsInviteLink || buildTeamInviteLink();
            try {
                await navigator.clipboard.writeText(link);
                setStatus("Ссылка-приглашение скопирована.");
            } catch {
                setStatus("Не удалось скопировать ссылку.", "error");
            }
            render();
        });
    }

    // Навигация карусели заявок
    const teamRequestsPrev = profileMount.querySelector("#teamRequestsPrev");
    const teamRequestsNext = profileMount.querySelector("#teamRequestsNext");
    if (isHTMLButtonElement(teamRequestsPrev)) {
        teamRequestsPrev.addEventListener("click", () => {
            appState.teamRequestsCurrentIndex = Math.max(0, appState.teamRequestsCurrentIndex - 1);
            render();
        });
    }
    if (isHTMLButtonElement(teamRequestsNext)) {
        teamRequestsNext.addEventListener("click", () => {
            const pendingCount = getPendingTeamJoinRequests().length;
            appState.teamRequestsCurrentIndex = Math.min(pendingCount - 1, appState.teamRequestsCurrentIndex + 1);
            render();
        });
    }

    profileMount.querySelectorAll<HTMLButtonElement>("[data-team-request-open-profile]").forEach((button) => {
        button.addEventListener("click", () => {
            const requestId = Number(button.dataset.teamRequestOpenProfile ?? "0");
            if (!Number.isInteger(requestId) || requestId <= 0) {
                return;
            }

            openTeamRequestApplicantProfile(requestId);
        });
    });

    profileMount.querySelectorAll<HTMLButtonElement>("[data-external-profile-back], [data-team-request-back]").forEach((button) => {
        button.addEventListener("click", () => {
            returnFromExternalProfile();
        });
    });

    profileMount.querySelectorAll<HTMLButtonElement>("[data-help-request-id]").forEach((button) => {
        button.addEventListener("click", () => {
            const id = Number(button.dataset.helpRequestId ?? "0");
            const status = button.dataset.helpRequestStatus ?? "";
            if (!Number.isInteger(id) || id <= 0 || !status) {
                return;
            }

            void submitHelpRequestStatus(id, status)
                .then(() => {
                    setStatus(status === "Accepted" ? "Заявка принята." : "Заявка отклонена.");
                    render();
                })
                .catch((error: unknown) => {
                    setStatus(getErrorMessage(error), "error");
                    render();
                });
        });
    });

    profileMount.querySelectorAll<HTMLButtonElement>("[data-team-join-request-id]").forEach((button) => {
        button.addEventListener("click", () => {
            const id = Number(button.dataset.teamJoinRequestId ?? "0");
            const status = button.dataset.teamJoinRequestStatus ?? "";
            if (!Number.isInteger(id) || id <= 0 || !status) {
                return;
            }

            handleTeamJoinRequestDecision(id, status);
        });
    });

    const teamAccept = profileMount.querySelector("#teamRequestAcceptButton");
    if (isHTMLButtonElement(teamAccept)) {
        teamAccept.addEventListener("click", () => {
            if (appState.localCreatedTeam) {
                const invited: TeamMemberRow = {
                    id: `invite-${Date.now().toString(36)}`,
                    displayName: "Новый участник (демо)",
                    roleLabel: "УЧАСТНИК",
                    avatarUrl: "",
                    isCaptain: false
                };
                appState.localCreatedTeam = {
                    ...appState.localCreatedTeam,
                    members: [...appState.localCreatedTeam.members, invited]
                };
                persistLocalTeam();
            }
            pushUserActivity({
                kind: "team_joined",
                title: "НОВЫЙ УЧАСТНИК",
                description: "Заявка в команду принята."
            });
            setStatus("Заявка принята (демо).");
            closeTeamModal();
        });
    }

    const teamDecline = profileMount.querySelector("#teamRequestDeclineButton");
    if (isHTMLButtonElement(teamDecline)) {
        teamDecline.addEventListener("click", () => {
            setStatus("Заявка отклонена (демо).");
            closeTeamModal();
        });
    }

    profileMount.querySelectorAll<HTMLButtonElement>(".profile-achievement-item").forEach((button) => {
        button.addEventListener("click", () => {
            const achievementId = button.dataset.achievementId ?? "";
            appState.profileAchievementId = getProfileAchievementById(achievementId).id;
            openProfileModal("achievement");
        });
    });

    profileMount.querySelectorAll<HTMLElement>("[data-close-modal]").forEach((node) => {
        node.addEventListener("click", () => {
            closeProfileModal();
        });
    });

    const personalNameInput = profileMount.querySelector("#profileNameInput");
    if (isHTMLInputElement(personalNameInput) && appState.profileFormDraft) {
        personalNameInput.addEventListener("input", () => {
            appState.profileFormDraft!.fullName = personalNameInput.value;
        });
    }

    const personalGroupInput = profileMount.querySelector("#profileGroupInput");
    if (isHTMLInputElement(personalGroupInput) && appState.profileFormDraft) {
        personalGroupInput.addEventListener("input", () => {
            const normalizedValue = normalizeAcademicGroupInput(personalGroupInput.value);
            personalGroupInput.value = normalizedValue;
            appState.profileFormDraft!.group = normalizedValue;
        });
    }

    const avatarInput = profileMount.querySelector("#profileAvatarInput");
    if (isHTMLInputElement(avatarInput) && appState.profileFormDraft) {
        avatarInput.addEventListener("change", () => {
            if (appState.dashboardSection === "settings") {
                return;
            }

            const file = avatarInput.files?.[0];
            if (!file) {
                return;
            }

            if (!isProfileAvatarFileWithinLimit(file)) {
                avatarInput.value = "";
                setStatus(getProfileAvatarSizeLimitMessage(), "error");
                render();
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                if (typeof reader.result === "string" && appState.profileFormDraft) {
                    appState.profileFormDraft.avatarDataUrl = reader.result;
                    render();
                }
            };
            reader.readAsDataURL(file);
        });
    }

    const openPasswordButton = profileMount.querySelector("#profileOpenPasswordButton");
    if (isHTMLButtonElement(openPasswordButton)) {
        openPasswordButton.addEventListener("click", () => {
            appState.profileModal = "password";
            appState.profileFormDraft = null;
            render();
        });
    }

    const savePasswordButton = profileMount.querySelector("#profileSavePasswordButton");
    if (isHTMLButtonElement(savePasswordButton)) {
        savePasswordButton.addEventListener("click", () => {
            setStatus("Пароль обновлён (демо).");
            closeProfileModal();
        });
    }

    const closeTeamFlow = profileMount.querySelector("#profileCloseTeamFlowButton");
    if (isHTMLButtonElement(closeTeamFlow)) {
        closeTeamFlow.addEventListener("click", () => {
            closeProfileModal();
        });
    }

    const findTeam = profileMount.querySelector("#profileFindTeamButton");
    if (isHTMLButtonElement(findTeam)) {
        findTeam.addEventListener("click", () => {
            appState.profileFindTeamQuery = "";
            appState.profileFindTeamSelectedId = null;
            appState.profileModal = "findTeam";
            void refreshTeamCatalog().then(() => render());
        });
    }

    const openCreateTeam = profileMount.querySelector("#profileOpenCreateTeamButton");
    if (isHTMLButtonElement(openCreateTeam)) {
        openCreateTeam.addEventListener("click", () => {
            appState.profileCreateTeamName = "";
            appState.profileCreateTeamDirection = "";
            appState.profileModal = "createTeam";
            render();
        });
    }

    const openFindFromCreate = profileMount.querySelector("#profileOpenFindTeamFromCreateButton");
    if (isHTMLButtonElement(openFindFromCreate)) {
        openFindFromCreate.addEventListener("click", () => {
            appState.profileFindTeamQuery = "";
            appState.profileFindTeamSelectedId = null;
            appState.profileModal = "findTeam";
            render();
        });
    }

    const backFromFindTeam = profileMount.querySelector("#profileBackFromFindTeamButton");
    if (isHTMLButtonElement(backFromFindTeam)) {
        backFromFindTeam.addEventListener("click", () => {
            appState.profileModal = "noTeam";
            render();
        });
    }

    const findTeamSearchInput = profileMount.querySelector("#profileFindTeamSearchInput");
    if (isHTMLInputElement(findTeamSearchInput)) {
        findTeamSearchInput.addEventListener("input", () => {
            appState.profileFindTeamQuery = findTeamSearchInput.value;
            appState.profileFindTeamSelectedId = null;
            void refreshTeamCatalog(findTeamSearchInput.value).then(() => {
                if (appState.profileModal === "findTeam") {
                    render();
                }
            });
        });
    }

    profileMount.querySelectorAll<HTMLButtonElement>("[data-team-pick-id]").forEach((button) => {
        button.addEventListener("click", () => {
            if (button.dataset.teamPending === "1") {
                return;
            }

            const teamId = Number(button.dataset.teamPickId ?? "0");
            if (!Number.isInteger(teamId) || teamId <= 0) {
                return;
            }

            appState.profileFindTeamSelectedId = teamId;
            render();
        });
    });

    const findTeamRequest = profileMount.querySelector("#profileFindTeamRequestButton");
    if (isHTMLButtonElement(findTeamRequest)) {
        findTeamRequest.addEventListener("click", async () => {
            const teamId = appState.profileFindTeamSelectedId;
            if (!teamId) {
                return;
            }

            try {
                findTeamRequest.disabled = true;
                await requestTeamJoin(teamId);
                setStatus("Заявка отправлена капитану команды.");
                closeProfileModal();
            } catch (error: unknown) {
                setStatus(getErrorMessage(error), "error");
                render();
            }
        });
    }

    const teamNameInput = profileMount.querySelector("#profileTeamNameInput");
    if (isHTMLInputElement(teamNameInput)) {
        teamNameInput.addEventListener("input", () => {
            appState.profileCreateTeamName = teamNameInput.value;
        });
        teamNameInput.addEventListener("keydown", (event) => {
            if (event.key !== "Enter" || !isHTMLElement(profileMount)) {
                return;
            }

            event.preventDefault();
            const confirmButton = profileMount.querySelector("#profileConfirmCreateTeamButton");
            if (isHTMLButtonElement(confirmButton)) {
                void submitProfileTeamCreate(confirmButton);
            }
        });
    }

    const confirmCreateTeam = profileMount.querySelector("#profileConfirmCreateTeamButton");
    if (isHTMLButtonElement(confirmCreateTeam)) {
        confirmCreateTeam.addEventListener("click", () => {
            void submitProfileTeamCreate(confirmCreateTeam);
        });
    }

    const copyInvite = profileMount.querySelector("#profileCopyInviteButton");
    if (isHTMLButtonElement(copyInvite)) {
        copyInvite.addEventListener("click", async () => {
            try {
                await navigator.clipboard.writeText(appState.profileInviteLink);
                setStatus("Ссылка скопирована.");
            } catch {
                setStatus("Не удалось скопировать ссылку.", "error");
            }
            render();
        });
    }

    const closeSuccess = profileMount.querySelector("#profileCloseSuccessButton");
    if (isHTMLButtonElement(closeSuccess)) {
        closeSuccess.addEventListener("click", () => {
            closeProfileModal();
        });
    }

    const successGo = profileMount.querySelector("#profileSuccessGoButton");
    if (isHTMLButtonElement(successGo)) {
        successGo.addEventListener("click", () => {
            closeProfileModal();
            appState.dashboardSection = "team";
            persistDashboardSectionToStorage();
            teamFlowState.noTeamView = "landing";
            clearStatus();
            render();
        });
    }

    const closeAchievement = profileMount.querySelector("#profileCloseAchievementButton");
    if (isHTMLButtonElement(closeAchievement)) {
        closeAchievement.addEventListener("click", () => {
            closeProfileModal();
        });
    }
}

async function submitLogin(form: HTMLFormElement): Promise<void> {
    appState.signIn.email = getInputValue(form.elements.namedItem("email")).trim();
    appState.signIn.password = getInputValue(form.elements.namedItem("password"));
    appState.isSubmitting = true;
    setStatus("Подключаемся к серверу...");
    render();

    try {
        const auth = await login({
            email: appState.signIn.email,
            password: appState.signIn.password
        });

        saveSession(auth);
        if (typeof auth.id === "number" && auth.id > 0) {
            appState.profile = buildUserProfileFromAuthResponse(
                auth as AuthResponse & { id: number }
            );
            applyPersistedClientStateAfterMe();
            await refreshTeamWorkspace();
            void syncProfileWithServerInBackground(auth.token);
        } else {
            appState.profile = await fetchCurrentUser(auth.token);
            applyPersistedClientStateAfterMe();
            await refreshTeamWorkspace();
        }
        appState.signIn.password = "";
        appState.view = "account";
        setStatus("Вход выполнен.");
    } catch (error) {
        setStatus(getErrorMessage(error), "error");
    } finally {
        appState.isSubmitting = false;
        render();
    }
}

const MIN_PASSWORD_LENGTH = 6;

async function submitRegister(form: HTMLFormElement): Promise<void> {
    appState.signUp.email = getInputValue(form.elements.namedItem("email")).trim();
    appState.signUp.password = getInputValue(form.elements.namedItem("password"));
    appState.signUp.passwordConfirm = getInputValue(form.elements.namedItem("passwordConfirm"));

    if (!appState.signUp.email || !appState.signUp.password) {
        setStatus("Заполните email и пароль.", "error");
        updateStatusBlock();
        return;
    }

    if (appState.signUp.password.length < MIN_PASSWORD_LENGTH) {
        setStatus(`Пароль не короче ${MIN_PASSWORD_LENGTH} символов (требование сервера).`, "error");
        updateStatusBlock();
        return;
    }

    if (appState.signUp.password !== appState.signUp.passwordConfirm) {
        setStatus("Пароли не совпадают.", "error");
        updateStatusBlock();
        return;
    }

    appState.isSubmitting = true;
    setStatus("Создаём аккаунт...");
    render();

    try {
        const auth = await register({
            userName: buildUserName(appState.signUp.email),
            email: appState.signUp.email,
            password: appState.signUp.password
        });

        saveSession(auth);
        if (typeof auth.id === "number" && auth.id > 0) {
            appState.profile = buildUserProfileFromAuthResponse(
                auth as AuthResponse & { id: number }
            );
            applyPersistedClientStateAfterMe();
            await refreshTeamWorkspace();
            void syncProfileWithServerInBackground(auth.token);
        } else {
            appState.profile = await fetchCurrentUser(auth.token);
            applyPersistedClientStateAfterMe();
            await refreshTeamWorkspace();
        }
        appState.view = "account";
        appState.signUp.password = "";
        appState.signUp.passwordConfirm = "";
        setStatus("Регистрация завершена.");
    } catch (error) {
        setStatus(getErrorMessage(error), "error");
    } finally {
        appState.isSubmitting = false;
        render();
    }
}

async function refreshProfile(): Promise<void> {
    const session = loadSession();
    if (!session) {
        setStatus("Сессия не найдена.", "error");
        render();
        return;
    }

    appState.isSubmitting = true;
    setStatus("Обновляем профиль...");
    render();

    try {
        appState.profile = await fetchCurrentUser(session.token);
        applyPersistedClientStateAfterMe();
        await refreshTeamWorkspace();
        setStatus("Данные обновлены.");
    } catch (error) {
        setStatus(getErrorMessage(error), "error");
    } finally {
        appState.isSubmitting = false;
        render();
    }
}

/**
 * Не блокирует вход: login/register уже отдают тот же профиль + id.
 * При успехе обновляет данные; при ошибке /me остаётся state из auth.
 */
function syncProfileWithServerInBackground(bearerToken: string): void {
    void (async () => {
        try {
            const p = await fetchCurrentUser(bearerToken);
            const session = loadSession();
            if (session?.token !== bearerToken || appState.view !== "account") {
                return;
            }
            appState.profile = p;
            applyPersistedClientStateAfterMe();
            await refreshTeamWorkspace();
            render();
        } catch {
            /* сессия уже валидна с данными из тела login/register */
        }
    })();
}

function buildUserName(email: string): string {
    const localPart = email.split("@")[0]?.trim() || "student";
    return localPart.replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 100) || "student";
}

function updateStatusBlock(): void {
    const statusNode = document.querySelector(".status-message");
    if (!(statusNode instanceof HTMLElement)) {
        return;
    }

    statusNode.textContent = "";
    statusNode.classList.add("hidden");
    statusNode.classList.remove("status-error");
    statusNode.setAttribute("aria-hidden", "true");
}

function renderStatusBlock(): string {
    return `<p class="status-message hidden" aria-hidden="true"></p>`;
}

function isInvalidCredentialsError(): boolean {
    return appState.statusTone === "error" && appState.statusMessage === INVALID_CREDENTIALS_MESSAGE;
}

function renderSignInFeedbackBlock(): string {
    if (isInvalidCredentialsError()) {
        return `
            <button type="button" class="auth-recovery-link" data-view="password-recovery">
                Забыли пароль? Нажмите для восстановления
            </button>
        `;
    }

    return renderStatusBlock();
}

function syncPersonalFormDraftFromDom(): void {
    if (!appState.profileFormDraft || !isHTMLElement(profileMount)) {
        return;
    }

    const nameInput = profileMount.querySelector("#profileNameInput");
    const groupInput = profileMount.querySelector("#profileGroupInput");

    if (isHTMLInputElement(nameInput)) {
        appState.profileFormDraft.fullName = nameInput.value;
    }

    if (isHTMLInputElement(groupInput)) {
        const normalizedGroup = normalizeAcademicGroupInput(groupInput.value);
        groupInput.value = normalizedGroup;
        appState.profileFormDraft.group = normalizedGroup;
    }
}

type PersonalProfileSaveOptions = {
    silent?: boolean;
    skipRender?: boolean;
};

async function submitPersonalProfileSave(options: PersonalProfileSaveOptions = {}): Promise<boolean> {
    const { silent = false, skipRender = false } = options;

    if (!isPersonalProfileEditingOpen()) {
        return false;
    }

    syncPersonalFormDraftFromDom();

    const draft = appState.profileFormDraft;
    const p = appState.profile;
    if (!draft || !p) {
        if (!silent) {
            setStatus("Откройте форму через «НАСТРОЙКИ» и попробуйте снова.", "error");
        }
        if (!skipRender) {
            render();
        }
        return false;
    }

    draft.group = normalizeAcademicGroupInput(draft.group);
    if (!isAcademicGroupValid(draft.group)) {
        if (!silent) {
            setStatus("Поле «АКАДЕМ. ГРУППА» заполните в формате РИ-150909.", "error");
        }
        if (!skipRender) {
            render();
        }
        return false;
    }

    if (!isProfileAvatarDataUrlWithinLimit(draft.avatarDataUrl)) {
        if (!silent) {
            setStatus(getProfileAvatarSizeLimitMessage(), "error");
        }
        if (!skipRender) {
            render();
        }
        return false;
    }

    appState.profileEdits = {
        fullName: draft.fullName,
        group: draft.group,
        avatarDataUrl: draft.avatarDataUrl
    };

    applyProfileEditsToInMemoryProfile();

    try {
        persistSavedProfileEdits();
    } catch {
        if (!silent) {
            setStatus(getProfileAvatarSizeLimitMessage(), "error");
        }
        if (!skipRender) {
            render();
        }
        return false;
    }

    try {
        syncCurrentUserInLocalTeamRoster();
    } catch {
        /* не мешаем закрыть форму, если не записался состав команды в storage */
    }

    const session = loadSession();
    const putBody = buildPersonalProfilePutBody(p, draft);
    const savedEdits: ProfileEdits = {
        fullName: draft.fullName,
        group: draft.group,
        avatarDataUrl: draft.avatarDataUrl
    };

    if (appState.profileModal === "personal") {
        closeProfileModal();
    } else {
        appState.profileFormDraft = { ...savedEdits };
        syncSettingsFieldDisplaysFromDraft();
    }

    if (!silent) {
        pushUserActivity({
            kind: "profile_updated",
            title: "ПРОФИЛЬ ОБНОВЛЁН",
            description: "Личные данные сохранены."
        });
    }

    if (session) {
        void (async () => {
            try {
                const updated = await updateProfile(session.token, putBody);
                appState.profile = updated;
                appState.profileEdits = savedEdits;
                applyProfileEditsToInMemoryProfile();
                persistSavedProfileEdits();
                if (!silent) {
                    setStatus("Данные сохранены на сервере и в этом браузере.");
                }
            } catch (error) {
                if (!silent) {
                    setStatus(`Сохранено в браузере. Сервер: ${getErrorMessage(error)}`, "error");
                }
            }
            if (!skipRender) {
                render();
            }
        })();
        return true;
    }

    if (!silent) {
        setStatus("Сохранено локально (нет активной сессии для сервера).");
    }
    if (!skipRender) {
        render();
    }
    return true;
}

if (profileMount instanceof HTMLElement) {
    profileMount.addEventListener("click", (event: MouseEvent) => {
        const target = event.target;
        if (!(target instanceof Element)) {
            return;
        }

        if (target.closest("#profileSavePersonalButton")) {
            event.preventDefault();
            void submitPersonalProfileSave();
        }
    });
}

document.querySelectorAll<HTMLElement>("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
        const nextView = button.dataset.view as View | undefined;
        if (nextView) {
            clearStatus();
            setView(nextView);
        }
    });
});

render();

import "../styles/start.css";
import QRCode from "qrcode";
import { setAppBridge } from "./app/bridge";
import type { JoinTeamResult } from "./app/bridge";
import { isDemoInviteCodeValid, normalizeInviteCode } from "./data/demoTeam";
import { DEMO_WEEK_CALENDAR_EVENTS, EVENTS_MONTH_LABELS, EVENTS_WEEKDAY_LABELS } from "./data/demoEvents";
import { renderRatingPageMain, renderRatingPageModals, wireRatingPageEvents } from "./pages/RatingPage";
import {
    paintTeamPageEventSuccessQr,
    renderTeamPageMain,
    renderTeamPageModals,
    wireTeamPageEvents
} from "./pages/TeamPage";
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
    getUserEventsForWeekDay,
    getWeekOffsetForEventDateTime,
    getWeekStartForOffset,
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
    ProfileModalKind,
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
import { parseEventDateTimeLocal } from "./utils/calendarEvents";
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
import { getProfileAchievementById } from "./data/profileAchievements";
import { fetchCurrentUser, login, register, updateProfile } from "./services/authApi";
import { fetchRatingTeams, fetchRatingUsers } from "./services/ratingApi";
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
    updateHelpRequestStatus,
    updateTeamJoinRequestStatus
} from "./services/teamApi";
import { getErrorMessage } from "./services/httpClient";
import { buildUserProfileFromAuthResponse } from "./services/profileMapper";
import { buildPersonalProfilePutBody } from "./services/profilePayload";
import { clearSession, loadSession, saveSession } from "./services/sessionStorage";
import { clearRatingData, setRatingData } from "./state/ratingDataState";

/** Событие открытия модалки «Спасение» с любого места UI. */
export const TEAM_RESCUE_OPEN_EVENT = "team-exam:open-rescue";

const LOCAL_TEAM_STORAGE_PREFIX = "team-exam-local-team:";
const LOCAL_PROFILE_STORAGE_PREFIX = "team-exam-profile:";

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
    profileInviteLink: "",
    profileFormDraft: null,
    dashboardSection: "profile",
    teamModal: "none",
    teamRescueDraft: null,
    eventsCalendarScope: "all",
    eventsFeedTab: "activity",
    eventsWeekOffset: 0,
    eventsModal: "none",
    eventsCreateDraft: null,
    eventsShowValidationError: false,
    eventsShareLink: "",
    newsCreateDraft: null,
    newsShowValidationError: false,
    teamVoteMemberIndex: 0,
    teamRequestsInviteLink: "",
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
        
        // Add animation classes to container
        authModalCard.classList.add(isMovingToSignUp ? "toggle-left" : "toggle-right");
        authModalCard.classList.add("toggle-switch-panel");

        // Get the form element to add exit animation class
        const currentForm = authFormContent.querySelector(".auth-form-modal");
        if (currentForm) {
            currentForm.classList.add("transition-exit");
        }

        // Wait for animation to complete (0.6s)
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
            }, 600);
        }, 600);
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
        photoFileName: ""
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

async function submitTeamVote(memberId: string, score: number): Promise<void> {
    const token = getSessionToken();
    const numericMemberId = Number(memberId);
    if (!token || !Number.isFinite(numericMemberId) || numericMemberId <= 0) {
        pushUserActivity({
            kind: "team_achievement",
            title: "ГОЛОС КОМАНДЫ",
            description: `Оценка ${score}/5 сохранена локально.`
        });
        return;
    }

    await createVote(token, numericMemberId, score);
    appState.teamMyVotes = await fetchMyVotes(token).catch(() => appState.teamMyVotes);
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
        pushUserActivity({
            kind: "invite_sent",
            title: "ЗАЯВКА В КОМАНДУ",
            description: "Заявка сохранена локально. Войдите в аккаунт, чтобы отправить её капитану."
        });
        return;
    }

    const created = await createTeamJoinRequest(token, teamId, "Хочу присоединиться к команде.");
    appState.teamJoinRequests = [
        created,
        ...appState.teamJoinRequests.filter((item) => item.id !== created.id)
    ];
    await refreshTeamWorkspace();
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

async function joinTeamByInviteCode(code: string): Promise<JoinTeamResult> {
    const token = getSessionToken();
    if (token) {
        try {
            const team = await joinTeamApi(token, code.trim());
            appState.currentTeam = team;
            appState.localCreatedTeam = null;
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
        appState.currentTeam = team;
        appState.localCreatedTeam = null;
        appState.profileInviteLink = buildTeamInviteLink();
        await refreshCurrentUserProfile();
        await refreshTeamWorkspace();
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
            teamInviteCode: appState.localCreatedTeam.inviteCode
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
        joinTeamByInviteCode,
        requestTeamJoin,
        createTeam: createTeamFromBridge,
        createTeamCheckIn: submitTeamCheckIn,
        submitTeamVote,
        createTeamRescueRequest: submitTeamRescueRequest,
        updateTeamHelpRequestStatus: submitHelpRequestStatus,
        openTeamOverlayModal: (kind, memberIndex) => openTeamModal(kind, memberIndex),
        openTeamRescue: openRescueModal,
        navigateToRating: () => {
            appState.dashboardSection = "rating";
            persistDashboardSectionToStorage();
            clearStatus();
            void refreshRatingWorkspace().then(() => {
                if (appState.dashboardSection === "rating") {
                    render();
                }
            });
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

    if (isHTMLElement(appScreen) && isHTMLElement(authModalCard)) {
        appScreen.addEventListener("click", (event: MouseEvent) => {
            if (appState.view === "home" || appState.view === "account") {
                return;
            }

            const target = event.target;
            if (!(target instanceof Node)) {
                return;
            }

            if (authModalCard.contains(target)) {
                return;
            }

            clearStatus();
            appState.view = "home";
            render();
        });
    }

    const session = loadSession();
    render();

    if (!session) {
        return;
    }

    appState.isSubmitting = true;
    appState.view = "sign-in";
    setStatus("Восстанавливаем сессию...");
    render();

    try {
        appState.profile = await fetchCurrentUser(session.token);
        applyPersistedClientStateAfterMe();
        await refreshTeamWorkspace();
        await refreshRatingWorkspace();
        appState.view = "account";
        setStatus("Сессия восстановлена.");
    } catch (error) {
        clearSession();
        setStatus(getErrorMessage(error), "error");
        appState.view = "sign-in";
    } finally {
        appState.isSubmitting = false;
        render();
    }
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
                    <button class="auth-password-peek-button" type="button" aria-label="Показать пароль, пока кнопка зажата" data-signin-password-peek></button>
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
            if (isHTMLButtonElement(passwordPeekButton)) {
                bindPressToRevealPassword(passwordPeekButton, passwordInput);
                syncPasswordPeekButtonState(passwordPeekButton, passwordInput);
            }

            passwordInput.addEventListener("input", () => {
                appState.signIn.password = passwordInput.value;
                if (isHTMLButtonElement(passwordPeekButton)) {
                    syncPasswordPeekButtonState(passwordPeekButton, passwordInput);
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
                        <button class="auth-password-peek-button" type="button" aria-label="Показать пароль, пока кнопка зажата" data-signup-password-peek ${appState.signUp.email.trim() ? "" : "disabled"}></button>
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
        appState.signUp.passwordConfirm.length > 0
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

function syncPasswordPeekButtonState(button: HTMLButtonElement, passwordInput: HTMLInputElement): void {
    button.disabled = passwordInput.disabled || passwordInput.value.length === 0;

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

        if (!hasPassword) {
            appState.signUp.passwordConfirm = "";
            passwordConfirmInput.value = "";
        }

        passwordShell.classList.toggle("hidden", !hasEmail);
        passwordShell.hidden = !hasEmail;
        passwordInput.disabled = !hasEmail;
        confirmShell.classList.toggle("hidden", !hasPassword);
        confirmShell.hidden = !hasPassword;
        passwordConfirmInput.disabled = !hasPassword;
        resetPasswordVisibility();

        if (isHTMLButtonElement(passwordPeekButton)) {
            syncPasswordPeekButtonState(passwordPeekButton, passwordInput);
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
    return pair || profile.nickname || profile.userName || "";
}

function getFullNameDisplay(): string {
    const fromEdits = appState.profileEdits?.fullName?.trim();
    if (fromEdits) {
        return appState.profileEdits!.fullName;
    }
    return buildFullNameFromProfile(appState.profile);
}

function getGroupDisplay(): string {
    return appState.profileEdits?.group ?? appState.profile?.groupTitle ?? "";
}

function getAvatarDisplay(): string {
    return appState.profileEdits?.avatarDataUrl ?? appState.profile?.avatarUrl ?? "";
}

function resetProfileUi(): void {
    appState.profileEdits = null;
    appState.profileModal = "none";
    appState.profileAchievementId = "";
    appState.profileCreateTeamName = "";
    appState.profileCreateTeamDirection = "";
    appState.profileInviteLink = "";
    appState.profileFormDraft = null;
    appState.dashboardSection = "profile";
    appState.teamModal = "none";
    appState.teamVoteMemberIndex = 0;
    appState.teamRequestsInviteLink = "";
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
        return appState.currentTeam.krk.toFixed(1);
    }

    return "—";
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
    if (typeof data.fullName === "string" && typeof data.group === "string") {
        appState.profileEdits = {
            fullName: data.fullName,
            group: data.group,
            avatarDataUrl: data.avatarDataUrl ?? null
        };
    }

    if (
        data.dashboardSection === "profile" ||
        data.dashboardSection === "team" ||
        data.dashboardSection === "rating" ||
        data.dashboardSection === "events"
    ) {
        appState.dashboardSection = data.dashboardSection;
    }
}

function getEventsWeekStart(): Date {
    return getWeekStartForOffset(appState.eventsWeekOffset);
}

function formatEventsMonthLabel(weekStart: Date): string {
    const month = EVENTS_MONTH_LABELS[weekStart.getMonth()] ?? "МЕСЯЦ";
    return `${month} ${weekStart.getFullYear()} Г.`;
}

function getDemoEventsForDay(dayIndex: number): CalendarEventItem[] {
    if (appState.eventsWeekOffset !== 0) {
        return [];
    }

    return DEMO_WEEK_CALENDAR_EVENTS[dayIndex] ?? [];
}

function getUserEventsForDay(dayIndex: number): CalendarEventItem[] {
    return getUserEventsForWeekDay(getEventsWeekStart(), dayIndex);
}

function sortEventsByTime(events: CalendarEventItem[]): CalendarEventItem[] {
    return [...events].sort((left, right) => {
        const leftDate = parseEventDateTimeLocal(left.dateTime)?.getTime() ?? 0;
        const rightDate = parseEventDateTimeLocal(right.dateTime)?.getTime() ?? 0;
        return leftDate - rightDate;
    });
}

function getMergedCalendarEvents(dayIndex: number): CalendarEventItem[] {
    return sortEventsByTime([...getDemoEventsForDay(dayIndex), ...getUserEventsForDay(dayIndex)]);
}

function getFilteredCalendarEvents(dayIndex: number): CalendarEventItem[] {
    const dayEvents = getMergedCalendarEvents(dayIndex);
    if (appState.eventsCalendarScope === "all") {
        return dayEvents;
    }
    return dayEvents.filter((event) => event.isMine);
}

function renderEventsCalendarEventCard(event: CalendarEventItem): string {
    return renderCalendarEventCard(event);
}

function renderEventsCalendarColumn(dayIndex: number): string {
    const weekStart = getEventsWeekStart();
    const dayDate = new Date(weekStart);
    dayDate.setDate(weekStart.getDate() + dayIndex);
    const weekday = EVENTS_WEEKDAY_LABELS[dayIndex] ?? "ПН";
    const dayNumber = dayDate.getDate();
    const events = getFilteredCalendarEvents(dayIndex);
    const cardsHtml = events.map((event) => renderEventsCalendarEventCard(event)).join("");

    return `
        <div class="events-calendar-col" role="listitem">
            <div class="events-calendar-col-head">${weekday}, ${dayNumber}</div>
            <div class="events-calendar-col-body" role="list">
                ${cardsHtml}
            </div>
        </div>`;
}

function renderEventsCalendarBlock(): string {
    const weekStart = getEventsWeekStart();
    const monthLabel = formatEventsMonthLabel(weekStart);
    const scopeAllActive = appState.eventsCalendarScope === "all";
    const scopeMineActive = appState.eventsCalendarScope === "mine";
    const columnsHtml = EVENTS_WEEKDAY_LABELS.map((_, index) => renderEventsCalendarColumn(index)).join("");

    return `
        <section class="events-calendar-block" aria-label="Календарь недели">
            <header class="events-calendar-toolbar">
                <div class="events-calendar-month-group">
                    <span class="events-calendar-month-pill">${escapeHtml(monthLabel)}</span>
                    <div class="events-calendar-week-nav" role="group" aria-label="Переключение недели">
                        <button
                            type="button"
                            class="events-calendar-week-nav-btn events-calendar-week-nav-btn--prev"
                            id="eventsWeekPrevButton"
                            aria-label="Предыдущая неделя"
                        ></button>
                        <button
                            type="button"
                            class="events-calendar-week-nav-btn events-calendar-week-nav-btn--next"
                            id="eventsWeekNextButton"
                            aria-label="Следующая неделя"
                        ></button>
                    </div>
                </div>
                <div class="events-calendar-toolbar-end">
                    <div class="events-calendar-scope" role="group" aria-label="Фильтр событий">
                        <button
                            type="button"
                            class="events-calendar-scope-btn${scopeAllActive ? " is-active" : ""}"
                            data-events-calendar-scope="all"
                            aria-pressed="${scopeAllActive}"
                        >ВСЕ</button>
                        <button
                            type="button"
                            class="events-calendar-scope-btn${scopeMineActive ? " is-active" : ""}"
                            data-events-calendar-scope="mine"
                            aria-pressed="${scopeMineActive}"
                        >МОИ</button>
                    </div>
                    <button type="button" class="events-calendar-create-btn" id="eventsOpenCreateButton" aria-label="Создать событие">+</button>
                </div>
            </header>
            <div class="events-calendar-grid" role="list" aria-label="Дни недели">
                ${columnsHtml}
            </div>
        </section>`;
}

function renderEventsFeedBlock(): string {
    const activityActive = appState.eventsFeedTab === "activity";
    const newsActive = appState.eventsFeedTab === "news";

    return `
        <section class="events-feed-block" aria-label="Информационные ленты">
            <div class="events-feed-tabs" role="tablist" aria-label="Ленты">
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
                <div class="events-panels-stack">
                    ${renderEventsCalendarBlock()}
                    ${renderEventsFeedBlock()}
                </div>
            </section>`;
}

function wireEventsDashboardEvents(): void {
    if (!isHTMLElement(profileMount) || appState.dashboardSection !== "events") {
        return;
    }

    const weekPrev = profileMount.querySelector("#eventsWeekPrevButton");
    if (isHTMLButtonElement(weekPrev)) {
        weekPrev.addEventListener("click", () => {
            appState.eventsWeekOffset -= 1;
            clearStatus();
            render();
        });
    }

    const weekNext = profileMount.querySelector("#eventsWeekNextButton");
    if (isHTMLButtonElement(weekNext)) {
        weekNext.addEventListener("click", () => {
            appState.eventsWeekOffset += 1;
            clearStatus();
            render();
        });
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
                appState.eventsFeedTab = tab;
                clearStatus();
                render();
            }
        });
    });

    const openCreate = profileMount.querySelector("#eventsOpenCreateButton");
    if (isHTMLButtonElement(openCreate)) {
        openCreate.addEventListener("click", () => {
            openEventsCreateModal();
        });
    }

    const openCreateNews = profileMount.querySelector("#eventsOpenCreateNewsButton");
    if (isHTMLButtonElement(openCreateNews)) {
        openCreateNews.addEventListener("click", () => {
            openNewsCreateModal();
        });
    }
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

    const weekOffset = getWeekOffsetForEventDateTime(draft.dateTime);
    if (weekOffset !== null) {
        appState.eventsWeekOffset = weekOffset;
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
        return `
                <div class="profile-modal team-overlay-modal event-success-modal" role="dialog" aria-modal="true" aria-label="Событие создано">
                    <div class="profile-modal-backdrop team-rescue-backdrop" data-close-events-modal="1"></div>
                    <div class="profile-modal-card event-success-card">
                        <button type="button" class="team-rescue-close" id="eventsCloseSuccessButton" aria-label="Закрыть"></button>
                        <h2 class="profile-modal-title event-success-title">УСПЕШНО!</h2>
                        <div class="event-success-link-row">
                            <div class="event-success-link-field">ССЫЛКА</div>
                            <button type="button" class="event-success-link-copy" id="eventsCopyLinkButton">СКОПИРОВАТЬ</button>
                        </div>
                        <div class="event-success-qr-wrap">
                            <img id="eventsSuccessQrImg" class="event-success-qr" width="200" height="200" alt="">
                        </div>
                        <button type="button" class="event-success-done" id="eventsSuccessDoneButton">ГОТОВО</button>
                    </div>
                </div>`;
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
                appState.eventsFeedTab = "news";
                closeNewsCreateModal();
                setStatus("Новость опубликована.");
                render();
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

async function refreshRatingWorkspace(token = getSessionToken()): Promise<void> {
    if (!token) {
        clearRatingData();
        return;
    }

    const [teams, users] = await Promise.all([
        fetchRatingTeams(token).catch(() => []),
        fetchRatingUsers(token).catch(() => [])
    ]);

    setRatingData(teams, users);
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
            // Если команды нет — сбрасываем в безопасные дефолтные значения (без null)
            appState.currentTeam = null;
            appState.localCreatedTeam = null;
            if (appState.profile) {
                appState.profile = {
                    ...appState.profile,
                    teamId: 0,
                    teamName: "",
                    teamInviteCode: "",
                    isCaptain: false,
                    teamScore: 0
                };
            }
        }
    } catch (err) {
        appState.currentTeam = null;
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
            avatarUrl: member.avatarUrl,
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
            avatarUrl: member.avatarUrl,
            userPoints: member.userPoints,
            canVote: member.id !== currentUserId && !voteByTarget.has(member.id),
            voteScore: voteByTarget.get(member.id) ?? null
        }));
    }

    return getTeamRoster().map((member) => ({
        id: member.id,
        displayName: member.displayName,
        roleLabel: member.roleLabel,
        avatarUrl: member.avatarUrl,
        canVote: member.id !== `user-${currentUserId ?? ""}`,
        voteScore: null
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

function getTeamHistoryItems(): TeamHistoryItem[] {
    const checkIns = appState.teamCheckIns.map<TeamHistoryItem>((checkIn) => ({
        label: "CHECK-IN",
        title: `${checkIn.weekNumber} неделя · ${checkIn.status || "Submitted"}`,
        meta: checkIn.reportText || formatShortDate(checkIn.submittedAtUtc ?? checkIn.createdAtUtc)
    }));

    const rescues = appState.teamHelpRequests.map<TeamHistoryItem>((request) => ({
        label: "СПАСЕНИЕ",
        title: `${request.topic || "Запрос помощи"} · ${request.status}`,
        meta: `${request.fromTeamName} → ${request.toTeamName}`,
        pointsLabel: request.bonusPoints > 0 ? `+${request.bonusPoints}` : undefined
    }));

    const joinRequests = appState.teamJoinRequests.map<TeamHistoryItem>((request) => ({
        label: "ЗАЯВКА",
        title: `${request.displayName || request.userName || "Участник"} · ${request.status}`,
        meta: formatShortDate(request.decidedAtUtc ?? request.createdAtUtc)
    }));

    const votes = appState.teamMyVotes.map<TeamHistoryItem>((vote) => ({
        label: "ГОЛОС",
        title: `${vote.toUserName || "Участник"} · ${vote.score}/5`,
        meta: formatShortDate(vote.createdAtUtc)
    }));

    const items = [...checkIns, ...rescues, ...joinRequests, ...votes];
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

function getJoinableTeams(): TeamSearchItem[] {
    const currentTeamId = appState.currentTeam?.id ?? appState.profile?.teamId;
    const query = teamFlowState.searchQuery.trim().toLowerCase();

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
            width: 200,
            margin: 2,
            color: {
                dark: "#2a2a2a",
                light: "#ffffff"
            }
        });
        img.alt = "QR-код ссылки-приглашения";
    } catch {
        img.removeAttribute("src");
        img.alt = "Не удалось сформировать QR";
    }
}

function openTeamModal(kind: TeamModalKind, memberIndex = 0): void {
    appState.profileModal = "none";
    appState.profileFormDraft = null;
    appState.eventsModal = "none";
    closeTeamEventModals();
    appState.teamModal = kind;
    const roster = getTeamRoster();
    const safeIndex =
        roster.length > 0 ? Math.min(Math.max(0, memberIndex), roster.length - 1) : 0;
    appState.teamVoteMemberIndex = safeIndex;

    if (kind === "requests") {
        appState.teamRequestsInviteLink = buildTeamInviteLink();
    }

    if (kind === "rescue") {
        ensureTeamRescueDraft();
    }

    if (kind === "checkIn") {
        teamFlowState.checkInWeek = teamFlowState.checkInWeek || String(Math.max(1, appState.teamCheckIns[0]?.weekNumber + 1 || 1));
        teamFlowState.checkInError = "";
    }

    render();
}

function closeTeamModal(): void {
    appState.teamModal = "none";
    render();
}

function syncTeamRescueDraftFromForm(): void {
    if (!isHTMLElement(profileMount) || appState.teamModal !== "rescue") {
        return;
    }

    const draft = ensureTeamRescueDraft();
    const target = profileMount.querySelector("#teamRescueTargetInput");
    const topic = profileMount.querySelector("#teamRescueTopicInput");
    const tag = profileMount.querySelector("#teamRescueTagInput");
    const description = profileMount.querySelector("#teamRescueDescriptionInput");
    const league = profileMount.querySelector("#teamRescueLeagueInput");
    const deadline = profileMount.querySelector("#teamRescueDeadlineInput");

    if (target instanceof HTMLSelectElement) {
        draft.targetTeamId = target.value;
    }
    if (isHTMLInputElement(topic)) {
        draft.topic = topic.value;
    }
    if (isHTMLInputElement(tag)) {
        draft.tag = tag.value;
    }
    if (description instanceof HTMLTextAreaElement) {
        draft.description = description.value;
    }
    if (isHTMLInputElement(league)) {
        draft.league = league.value;
    }
    if (isHTMLInputElement(deadline)) {
        draft.deadline = deadline.value;
    }
}

function wireTeamRescueModalEvents(): void {
    if (!isHTMLElement(profileMount) || appState.teamModal !== "rescue") {
        return;
    }

    const draft = ensureTeamRescueDraft();

    const teamCloseRescue = profileMount.querySelector("#teamCloseRescueButton");
    if (isHTMLButtonElement(teamCloseRescue)) {
        teamCloseRescue.addEventListener("click", () => {
            syncTeamRescueDraftFromForm();
            closeTeamModal();
        });
    }

    const target = profileMount.querySelector("#teamRescueTargetInput");
    const topic = profileMount.querySelector("#teamRescueTopicInput");
    const tag = profileMount.querySelector("#teamRescueTagInput");
    const description = profileMount.querySelector("#teamRescueDescriptionInput");
    const league = profileMount.querySelector("#teamRescueLeagueInput");
    const deadline = profileMount.querySelector("#teamRescueDeadlineInput");
    const photoInput = profileMount.querySelector("#teamRescuePhotoInput");
    const photoLabel = profileMount.querySelector("#teamRescuePhotoLabel");
    const rescueForm = profileMount.querySelector("#teamRescueForm");

    const bindInput = (el: Element | null, key: keyof Pick<TeamRescueDraft, "topic" | "tag" | "league" | "deadline">): void => {
        if (!isHTMLInputElement(el)) {
            return;
        }
        el.addEventListener("input", () => {
            draft[key] = el.value;
        });
    };

    bindInput(topic, "topic");
    bindInput(tag, "tag");
    bindInput(league, "league");
    bindInput(deadline, "deadline");

    if (target instanceof HTMLSelectElement) {
        target.addEventListener("change", () => {
            draft.targetTeamId = target.value;
        });
    }

    if (description instanceof HTMLTextAreaElement) {
        description.addEventListener("input", () => {
            draft.description = description.value;
        });
    }

    if (isHTMLInputElement(photoInput)) {
        photoInput.addEventListener("change", () => {
            const file = photoInput.files?.[0];
            draft.photoFileName = file?.name ?? "";
            if (photoLabel instanceof HTMLElement) {
                photoLabel.textContent = draft.photoFileName.trim() || "ФОТО";
            }
        });
    }

    if (isHTMLFormElement(rescueForm)) {
        rescueForm.addEventListener("submit", (event) => {
            event.preventDefault();
            syncTeamRescueDraftFromForm();

            if (!draft.targetTeamId.trim()) {
                setStatus("Выберите команду для запроса спасения.", "error");
                render();
                return;
            }

            if (!draft.topic.trim()) {
                setStatus("Укажите тему запроса на спасение.", "error");
                render();
                return;
            }

            if (!draft.description.trim()) {
                setStatus("Опишите ситуацию для запроса спасения.", "error");
                render();
                return;
            }

            void submitTeamRescueRequest({ ...draft })
                .then(() => {
                    appState.teamRescueDraft = createEmptyTeamRescueDraft();
                    closeTeamModal();
                    setStatus("Спасение: запрос помощи отправлен.");
                    render();
                })
                .catch((error: unknown) => {
                    setStatus(getErrorMessage(error), "error");
                    render();
                });
        });
    }
}

function renderTeamModal(): string {
    if (appState.teamModal === "vote") {
        const roster = getTeamRoster();
        const member = roster[appState.teamVoteMemberIndex] ?? roster[0];
        const existingVote = member ? appState.teamMyVotes.find((vote) => String(vote.toUserId) === member.id) : undefined;
        const voteAvatarInner = member?.avatarUrl
            ? `<img src="${escapeHtml(member.avatarUrl)}" alt="" loading="lazy">`
            : "";
        const voteRole = member?.roleLabel ?? "РОЛЬ";
        const avatarClass = voteAvatarInner ? "team-vote-avatar has-image" : "team-vote-avatar";
        const voteButtons = [1, 2, 3, 4, 5]
            .map((score) => `
                <button
                    type="button"
                    class="team-vote-score${existingVote?.score === score ? " is-active" : ""}"
                    data-team-vote-score="${score}"
                    ${existingVote ? "disabled" : ""}
                >${score}</button>`)
            .join("");

        return `
                <div class="profile-modal team-overlay-modal" role="dialog" aria-modal="true" aria-label="Голосование">
                    <div class="profile-modal-backdrop" data-close-team-modal="1"></div>
                    <div class="profile-modal-card team-vote-card" data-team-vote-member-id="${escapeHtml(member?.id ?? "")}">
                        <button type="button" class="profile-modal-dot" id="teamCloseVoteButton" aria-label="Закрыть"></button>
                        <h2 class="profile-modal-title">ГОЛОСОВАНИЕ</h2>
                        <div class="team-vote-hero">
                            <div class="${avatarClass}" aria-hidden="true">${voteAvatarInner}</div>
                            <div class="team-vote-role-pill">${escapeHtml(voteRole)}</div>
                            <p class="team-vote-name">${escapeHtml(member?.displayName ?? "УЧАСТНИК")}</p>
                        </div>
                        <div class="team-vote-score-row" aria-label="Оценка вклада по 5-балльной шкале">
                            ${voteButtons}
                        </div>
                        ${existingVote ? `<p class="team-vote-hint">Ваша оценка уже сохранена.</p>` : `<p class="team-vote-hint">Оцените вклад участника от 1 до 5.</p>`}
                    </div>
                </div>`;
    }

    if (appState.teamModal === "checkIn") {
        const nextWeek = String(teamFlowState.checkInWeek || Math.max(1, appState.teamCheckIns[0]?.weekNumber + 1 || 1));
        const errorHtml = teamFlowState.checkInError
            ? `<p class="team-validation-error team-validation-error--modal">${escapeHtml(teamFlowState.checkInError)}</p>`
            : "";

        return `
                <div class="profile-modal team-overlay-modal team-rescue-modal" role="dialog" aria-modal="true" aria-label="Check-in команды">
                    <div class="profile-modal-backdrop team-rescue-backdrop" data-close-team-modal="1"></div>
                    <div class="profile-modal-card team-rescue-card">
                        <button type="button" class="team-rescue-close" id="teamCloseCheckInButton" aria-label="Закрыть"></button>
                        <h2 class="team-rescue-title">CHECK-IN</h2>
                        ${errorHtml}
                        <form id="teamCheckInForm" class="team-rescue-form" novalidate>
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
                            <button type="submit" class="team-rescue-submit">ОТПРАВИТЬ</button>
                        </form>
                    </div>
                </div>`;
    }

    if (appState.teamModal === "rescue") {
        const draft = ensureTeamRescueDraft();
        const photoLabel = draft.photoFileName.trim() || "ФОТО";
        const currentTeamId = appState.currentTeam?.id ?? appState.profile?.teamId;
        const targetOptions = appState.teamCatalog
            .filter((team) => team.id !== currentTeamId)
            .map((team) => `<option value="${team.id}" ${draft.targetTeamId === String(team.id) ? "selected" : ""}>${escapeHtml(team.name)}</option>`)
            .join("");
        return `
                <div class="profile-modal team-overlay-modal team-rescue-modal" role="dialog" aria-modal="true" aria-label="Спасение">
                    <div class="profile-modal-backdrop team-rescue-backdrop" data-close-team-modal="1"></div>
                    <div class="profile-modal-card team-rescue-card">
                        <button type="button" class="team-rescue-close" id="teamCloseRescueButton" aria-label="Закрыть"></button>
                        <h2 class="team-rescue-title">СПАСЕНИЕ</h2>
                        <form id="teamRescueForm" class="team-rescue-form" novalidate>
                            <select id="teamRescueTargetInput" class="team-rescue-field" aria-label="Команда для помощи">
                                <option value="">КОМАНДА-ПОЛУЧАТЕЛЬ</option>
                                ${targetOptions}
                            </select>
                            <div class="team-rescue-topic-row">
                                <input
                                    id="teamRescueTopicInput"
                                    class="team-rescue-field team-rescue-field--topic"
                                    type="text"
                                    placeholder="ТЕМА"
                                    value="${escapeHtml(draft.topic)}"
                                    autocomplete="off"
                                >
                                <input
                                    id="teamRescueTagInput"
                                    class="team-rescue-field team-rescue-field--tag"
                                    type="text"
                                    placeholder="ТЕГ"
                                    value="${escapeHtml(draft.tag)}"
                                    autocomplete="off"
                                >
                            </div>
                            <textarea
                                id="teamRescueDescriptionInput"
                                class="team-rescue-textarea"
                                placeholder=" "
                                aria-label="Описание ситуации"
                            >${escapeHtml(draft.description)}</textarea>
                            <div class="team-rescue-photo-row">
                                <span class="team-rescue-photo-label" id="teamRescuePhotoLabel">${escapeHtml(photoLabel)}</span>
                                <label class="team-rescue-photo-btn">
                                    ВЫБРАТЬ
                                    <input
                                        type="file"
                                        id="teamRescuePhotoInput"
                                        class="team-rescue-file"
                                        accept="image/*"
                                        hidden
                                    >
                                </label>
                            </div>
                            <div class="team-rescue-duo-row">
                                <input
                                    id="teamRescueLeagueInput"
                                    class="team-rescue-field team-rescue-field--duo"
                                    type="text"
                                    placeholder="ЛИГА"
                                    value="${escapeHtml(draft.league)}"
                                    autocomplete="off"
                                >
                                <input
                                    id="teamRescueDeadlineInput"
                                    class="team-rescue-field team-rescue-field--duo"
                                    type="text"
                                    placeholder="ДЕДЛАЙН"
                                    value="${escapeHtml(draft.deadline)}"
                                    autocomplete="off"
                                >
                            </div>
                            <button type="submit" class="team-rescue-submit">ОТПРАВИТЬ</button>
                        </form>
                    </div>
                </div>`;
    }

    if (appState.teamModal === "requests") {
        const link = appState.teamRequestsInviteLink || buildTeamInviteLink();
        const currentTeamId = appState.currentTeam?.id ?? appState.profile?.teamId ?? 0;
        const joinRequests = appState.teamJoinRequests.filter((request) =>
            request.teamId === currentTeamId || request.userId === appState.profile?.id
        );
        const joinRequestsHtml = joinRequests.length
            ? joinRequests.map((request) => {
                  const incoming = request.teamId === currentTeamId;
                  const canAct = incoming && isTeamCaptain() && request.status === "Pending";
                  return `
                    <article class="team-request-row">
                        <div>
                            <h3 class="team-request-title">${escapeHtml(request.displayName || request.userName || "Участник")}</h3>
                            <p class="team-request-meta">${escapeHtml(request.teamName)} · ${escapeHtml(request.status)}</p>
                            ${request.message ? `<p class="team-request-meta">${escapeHtml(request.message)}</p>` : ""}
                        </div>
                        ${canAct ? `
                            <div class="team-request-actions">
                                <button type="button" class="team-request-dot-pill" data-team-join-request-status="Accepted" data-team-join-request-id="${request.id}" aria-label="Принять"></button>
                                <button type="button" class="team-request-dot-pill is-decline" data-team-join-request-status="Rejected" data-team-join-request-id="${request.id}" aria-label="Отклонить"></button>
                            </div>` : ""}
                    </article>`;
              }).join("")
            : `<p class="team-list-empty">Заявок на вступление пока нет.</p>`;

        const helpRequestsHtml = appState.teamHelpRequests.length
            ? appState.teamHelpRequests.map((request) => {
                  const incoming = request.toTeamId === currentTeamId;
                  const canAct = incoming && isTeamCaptain() && request.status === "Open";
                  return `
                    <article class="team-request-row">
                        <div>
                            <h3 class="team-request-title">${escapeHtml(request.topic || "Спасение")}</h3>
                            <p class="team-request-meta">${escapeHtml(request.fromTeamName)} → ${escapeHtml(request.toTeamName)}</p>
                            <p class="team-request-meta">${escapeHtml(request.status)}${request.bonusPoints ? ` · +${escapeHtml(String(request.bonusPoints))}` : ""}</p>
                        </div>
                        ${canAct ? `
                            <div class="team-request-actions">
                                <button type="button" class="team-request-dot-pill" data-help-request-status="Accepted" data-help-request-id="${request.id}" aria-label="Принять"></button>
                                <button type="button" class="team-request-dot-pill is-decline" data-help-request-status="Rejected" data-help-request-id="${request.id}" aria-label="Отклонить"></button>
                            </div>` : ""}
                    </article>`;
              }).join("")
            : `<p class="team-list-empty">Запросов «спасения» пока нет.</p>`;
        return `
                <div class="profile-modal team-overlay-modal" role="dialog" aria-modal="true" aria-label="Заявки">
                    <div class="profile-modal-backdrop" data-close-team-modal="1"></div>
                    <div class="profile-modal-card team-requests-card">
                        <button type="button" class="profile-modal-dot" id="teamCloseRequestsButton" aria-label="Закрыть"></button>
                        <h2 class="profile-modal-title">ЗАЯВКИ</h2>
                        <div class="team-request-list">
                            <h3 class="team-request-section-title">ВСТУПЛЕНИЕ</h3>
                            ${joinRequestsHtml}
                            <h3 class="team-request-section-title">СПАСЕНИЕ</h3>
                            ${helpRequestsHtml}
                        </div>
                        <div class="profile-link-row team-requests-link-row">
                            <div class="profile-link-field">${escapeHtml(link)}</div>
                            <button type="button" class="profile-link-copy" id="teamRequestsCopyLinkButton">СКОПИРОВАТЬ</button>
                        </div>
                    </div>
                </div>`;
    }

    return "";
}

function openProfileModal(kind: ProfileModalKind): void {
    appState.teamModal = "none";
    appState.eventsModal = "none";
    appState.profileModal = kind;

    if (kind === "personal") {
        appState.profileFormDraft = {
            fullName: getFullNameDisplay(),
            group: getGroupDisplay(),
            avatarDataUrl: getAvatarDisplay() || null
        };
    }

    render();
}

function closeProfileModal(): void {
    appState.profileModal = "none";
    appState.profileFormDraft = null;
    render();
}

const ACADEMIC_GROUP_PATTERN = /^[A-ZА-ЯЁ]{2}-\d{6}$/u;

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

            return `
                <div class="profile-modal" role="dialog" aria-modal="true" aria-label="Личные данные">
                    <div class="profile-modal-backdrop" data-close-modal="1"></div>
                    <div class="profile-modal-card">
                        <h2 class="profile-modal-title">ЛИЧНЫЕ ДАННЫЕ</h2>
                        <div class="profile-modal-field profile-modal-photo-row">
                            <span class="profile-modal-photo-label">ФОТО</span>
                            <label class="profile-modal-file">
                                <input id="profileAvatarInput" type="file" accept="image/*" hidden>
                                <span class="profile-pill-button">ВЫБРАТЬ</span>
                            </label>
                        </div>
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
                        <button type="button" class="profile-pill-wide" id="profileSavePersonalButton">СОХРАНИТЬ</button>
                        <button type="button" class="profile-modal-text" id="profileOpenPasswordButton">ВОССТАНОВЛЕНИЕ ПАРОЛЯ</button>
                    </div>
                </div>
            `;
        case "password":
            return `
                <div class="profile-modal" role="dialog" aria-modal="true" aria-label="Восстановление пароля">
                    <div class="profile-modal-backdrop" data-close-modal="1"></div>
                    <div class="profile-modal-card">
                        <h2 class="profile-modal-title">ВОССТАНОВЛЕНИЕ ПАРОЛЯ</h2>
                        <input id="profileNewPasswordInput" class="profile-modal-input" type="password" placeholder="НОВЫЙ ПАРОЛЬ">
                        <input id="profileConfirmPasswordInput" class="profile-modal-input" type="password" placeholder="ПОДТВЕРЖДЕНИЕ">
                        <button type="button" class="profile-pill-wide" id="profileSavePasswordButton">СОХРАНИТЬ</button>
                    </div>
                </div>
            `;
        case "noTeam":
            return `
                <div class="profile-modal" role="dialog" aria-modal="true" aria-label="Нет команды">
                    <div class="profile-modal-backdrop" data-close-modal="1"></div>
                    <div class="profile-modal-card profile-modal-card-compact">
                        <button type="button" class="profile-modal-dot" id="profileCloseNoTeamButton" aria-label="Закрыть"></button>
                        <h2 class="profile-modal-title">НЕТ КОМАНДЫ</h2>
                        <div class="profile-modal-stack">
                            <button type="button" class="profile-pill-wide" id="profileFindTeamButton">НАЙТИ</button>
                            <button type="button" class="profile-pill-wide" id="profileOpenCreateTeamButton">СОЗДАТЬ</button>
                        </div>
                    </div>
                </div>
            `;
        case "createTeam":
            return `
                <div class="profile-modal" role="dialog" aria-modal="true" aria-label="Создание команды">
                    <div class="profile-modal-backdrop" data-close-modal="1"></div>
                    <div class="profile-modal-card">
                        <h2 class="profile-modal-title">СОЗДАНИЕ КОМАНДЫ</h2>
                        <input id="profileTeamNameInput" class="profile-modal-input" type="text" placeholder="НАЗВАНИЕ" value="${escapeHtml(appState.profileCreateTeamName)}">
                        <input id="profileTeamDirectionInput" class="profile-modal-input" type="text" placeholder="НАПРАВЛЕНИЕ" value="${escapeHtml(appState.profileCreateTeamDirection)}">
                        <div class="profile-modal-stack">
                            <button type="button" class="profile-pill-wide" id="profileConfirmCreateTeamButton">СОЗДАТЬ</button>
                            <button type="button" class="profile-pill-wide profile-pill-outline" id="profileBackFromCreateTeamButton">НАЗАД</button>
                        </div>
                    </div>
                </div>
            `;
        case "teamSuccess":
            return `
                <div class="profile-modal" role="dialog" aria-modal="true" aria-label="Команда создана">
                    <div class="profile-modal-backdrop" data-close-modal="1"></div>
                    <div class="profile-modal-card profile-modal-card-success">
                        <button type="button" class="profile-modal-dot" id="profileCloseSuccessButton" aria-label="Закрыть"></button>
                        <h2 class="profile-modal-title">УСПЕШНО!</h2>
                        <div class="profile-link-row">
                            <div class="profile-link-field">ССЫЛКА</div>
                            <button type="button" class="profile-link-copy" id="profileCopyInviteButton">СКОПИРОВАТЬ</button>
                        </div>
                        <div class="profile-success-qr-wrap">
                            <img id="profileSuccessQrImg" class="profile-success-qr" width="200" height="200" alt="">
                        </div>
                        <button type="button" class="profile-pill-wide" id="profileSuccessGoButton">ПЕРЕЙТИ</button>
                    </div>
                </div>
            `;
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

function renderProfileView(): void {
    if (!isHTMLElement(profileMount)) {
        return;
    }

    const profile = appState.profile;
    const leagueLabel = "ЛИГА";
    const actualPoints = profile?.userPoints ?? profile?.teamScore ?? 0;
    const pointsValue = String(actualPoints);
    const ratingLabel = "РЕЙТИНГ";
    const ratingValue = profile?.personalRating ? String(profile.personalRating) : "—";
    const leagueValue = profile?.personalLeague || "Старт";
    const fullName = getFullNameDisplay();
    const group = getGroupDisplay();
    const teamName = getEffectiveTeamName();
    const teamPillText = teamName || "КОМАНДА";
    const statusHtml = "";

    const navProfileActive = appState.dashboardSection === "profile" ? " is-active" : "";
    const navTeamActive = appState.dashboardSection === "team" ? " is-active" : "";
    const navRatingActive = appState.dashboardSection === "rating" ? " is-active" : "";
    const navEventsActive = appState.dashboardSection === "events" ? " is-active" : "";
    const profileAppModeClass = appState.dashboardSection === "profile" ? " profile-app--dashboard-profile" : "";
    const extraNavHtml =
        appState.dashboardSection === "profile"
            ? `
                    <button type="button" class="profile-nav-button" data-dashboard-placeholder="tasks">ЗАДАНИЯ</button>
                    <button type="button" class="profile-nav-button${navEventsActive}" data-dashboard="events">СОБЫТИЯ</button>`
            : `
                    <button type="button" class="profile-nav-button${navEventsActive}" data-dashboard="events">СОБЫТИЯ</button>
                    <button type="button" class="profile-nav-button" data-dashboard-placeholder="news">НОВОСТИ</button>`;

    const mainColumn =
        appState.dashboardSection === "team"
            ? renderTeamPageMain(statusHtml)
            : appState.dashboardSection === "rating"
              ? renderRatingPageMain(statusHtml)
              : appState.dashboardSection === "events"
                ? renderEventsDashboardMain(statusHtml)
                : `
            <section class="profile-main">
                <div class="profile-hero-card">
                    <div class="profile-top">
                        <div class="profile-photo-col">
                            <div class="profile-photo"></div>
                        </div>
                        <div class="profile-stats-col" aria-label="Сводка: лига, баллы, рейтинг">
                            <div class="profile-stat-track">
                                <span class="profile-stat-orb profile-stat-orb--muted" aria-hidden="true">${leagueLabel}</span>
                                <span class="profile-stat-value">${escapeHtml(leagueValue)}</span>
                            </div>
                            <div class="profile-stat-track">
                                <span class="profile-stat-orb profile-stat-orb--muted" aria-hidden="true">БАЛЛЫ</span>
                                <span class="profile-stat-value profile-stat-value--num">${escapeHtml(pointsValue)}</span>
                            </div>
                            <div class="profile-stat-track profile-stat-track--rating">
                                <span class="profile-stat-orb profile-stat-orb--accent" aria-hidden="true">${ratingLabel}</span>
                                <span class="profile-stat-value">${escapeHtml(ratingValue)}</span>
                            </div>
                        </div>
                    </div>
                    <div class="profile-pills-row">
                        <div class="profile-info-pill profile-info-pill--name">${escapeHtml(fullName || "ИМЯ ФАМИЛИЯ")}</div>
                        <div class="profile-info-pill profile-info-pill--group">${escapeHtml(group || "АКАДЕМ. ГРУППА")}</div>
                        <button type="button" class="profile-info-pill profile-info-pill-accent" id="profileTeamPillButton">${escapeHtml(teamPillText)}</button>
                    </div>
                </div>
                <div class="profile-achievements">
                    <h3 class="profile-achievements-title">ДОСТИЖЕНИЯ</h3>
                    <div class="profile-achievements-scroll-wrap">
                        <div class="profile-achievements-fade profile-achievements-fade-left" aria-hidden="true"></div>
                        <div class="profile-achievements-fade profile-achievements-fade-right" aria-hidden="true"></div>
                        <div class="profile-achievements-scroll" id="profileAchievementsScroll">
                            ${renderProfileAchievementStrip()}
                        </div>
                    </div>
                </div>
        </section>`;

    profileMount.innerHTML = `
        <div class="profile-app${profileAppModeClass}">
            <aside class="profile-sidebar profile-sidebar--dashboard" aria-label="Разделы">
                <nav class="profile-nav-top">
                    <button type="button" class="profile-nav-button${navProfileActive}" data-dashboard="profile">ПРОФИЛЬ</button>
                    <button type="button" class="profile-nav-button${navTeamActive}" data-dashboard="team">КОМАНДА</button>
                    <button type="button" class="profile-nav-button${navRatingActive}" data-dashboard="rating">РЕЙТИНГ</button>
                    ${extraNavHtml}
                </nav>
                <nav class="profile-nav-bottom">
                    <button type="button" class="profile-nav-button" id="profileSettingsButton">НАСТРОЙКИ</button>
                    <button type="button" class="profile-nav-button" id="profileLogoutButton">ПОКИНУТЬ</button>
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

    if (appState.eventsModal === "success") {
        void paintEventSuccessQr();
    }

    if (appState.dashboardSection === "team" && teamFlowState.eventModal === "success" && isHTMLElement(profileMount)) {
        void paintTeamPageEventSuccessQr(profileMount);
    }
}

function wireProfileViewEvents(): void {
    if (!isHTMLElement(profileMount)) {
        return;
    }

    const photoEl = profileMount.querySelector(".profile-photo");
    if (photoEl instanceof HTMLElement) {
        const src = getAvatarDisplay();
        if (src) {
            photoEl.classList.add("has-image");
            photoEl.style.backgroundImage = `url(${JSON.stringify(src)})`;
        } else {
            photoEl.classList.remove("has-image");
            photoEl.style.removeProperty("background-image");
        }
    }

    profileAchievementScrollResizeObserver?.disconnect();
    profileAchievementScrollResizeObserver = undefined;

    const achievementsScroll = profileMount.querySelector("#profileAchievementsScroll");
    if (achievementsScroll instanceof HTMLElement) {
        const syncFades = (): void => {
            syncAchievementScrollFadeClasses(achievementsScroll);
        };

        achievementsScroll.addEventListener("scroll", syncFades, { passive: true });
        requestAnimationFrame(syncFades);
        profileAchievementScrollResizeObserver = new ResizeObserver(() => syncFades());
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
            openProfileModal("personal");
        });
    }

    const teamPill = profileMount.querySelector("#profileTeamPillButton");
    if (isHTMLButtonElement(teamPill)) {
        teamPill.addEventListener("click", () => {
            appState.dashboardSection = "team";
            persistDashboardSectionToStorage();
            clearStatus();
            render();
        });
    }

    profileMount.querySelectorAll<HTMLButtonElement>("[data-dashboard]").forEach((button) => {
        button.addEventListener("click", () => {
            const section = button.dataset.dashboard as DashboardSection | undefined;
            if (!section) {
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
    wireEventsDashboardEvents();
    wireEventsModalEvents();

    wireTeamRescueModalEvents();

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

    profileMount.querySelectorAll<HTMLButtonElement>("[data-team-vote-score]").forEach((button) => {
        button.addEventListener("click", () => {
            const card = button.closest<HTMLElement>("[data-team-vote-member-id]");
            const memberId = card?.dataset.teamVoteMemberId ?? "";
            const score = Number(button.dataset.teamVoteScore ?? "0");
            if (!memberId || score < 1 || score > 5) {
                return;
            }

            void submitTeamVote(memberId, score)
                .then(() => {
                    setStatus("Голос сохранен.");
                    closeTeamModal();
                })
                .catch((error: unknown) => {
                    setStatus(getErrorMessage(error), "error");
                    render();
                });
        });
    });

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

            void submitTeamJoinRequestStatus(id, status)
                .then(() => {
                    setStatus(status === "Accepted" ? "Заявка на вступление принята." : "Заявка на вступление отклонена.");
                    render();
                })
                .catch((error: unknown) => {
                    setStatus(getErrorMessage(error), "error");
                    render();
                });
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
            const file = avatarInput.files?.[0];
            if (!file) {
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

    const closeNoTeam = profileMount.querySelector("#profileCloseNoTeamButton");
    if (isHTMLButtonElement(closeNoTeam)) {
        closeNoTeam.addEventListener("click", () => {
            closeProfileModal();
        });
    }

    const findTeam = profileMount.querySelector("#profileFindTeamButton");
    if (isHTMLButtonElement(findTeam)) {
        findTeam.addEventListener("click", () => {
            setStatus("Поиск команды скоро будет доступен.");
            closeProfileModal();
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

    const teamNameInput = profileMount.querySelector("#profileTeamNameInput");
    if (isHTMLInputElement(teamNameInput)) {
        teamNameInput.addEventListener("input", () => {
            appState.profileCreateTeamName = teamNameInput.value;
        });
    }

    const teamDirectionInput = profileMount.querySelector("#profileTeamDirectionInput");
    if (isHTMLInputElement(teamDirectionInput)) {
        teamDirectionInput.addEventListener("input", () => {
            appState.profileCreateTeamDirection = teamDirectionInput.value;
        });
    }

    const confirmCreateTeam = profileMount.querySelector("#profileConfirmCreateTeamButton");
    if (isHTMLButtonElement(confirmCreateTeam)) {
        confirmCreateTeam.addEventListener("click", () => {
            const name = appState.profileCreateTeamName.trim() || "КОМАНДА";
            const direction = appState.profileCreateTeamDirection.trim();
            void createTeamFromBridge(name, direction)
                .then(() => {
                    appState.profileInviteLink = buildTeamInviteLink();
                    appState.profileModal = "teamSuccess";
                    render();
                })
                .catch((error: unknown) => {
                    setStatus(getErrorMessage(error), "error");
                    render();
                });
        });
    }

    const backCreateTeam = profileMount.querySelector("#profileBackFromCreateTeamButton");
    if (isHTMLButtonElement(backCreateTeam)) {
        backCreateTeam.addEventListener("click", () => {
            appState.profileModal = "noTeam";
            render();
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
            if (appState.profile && appState.localCreatedTeam) {
                appState.profile = {
                    ...appState.profile,
                    teamName: appState.localCreatedTeam.name,
                    teamInviteCode: appState.localCreatedTeam.inviteCode
                };
                persistLocalTeam();
            }

            closeProfileModal();
            appState.dashboardSection = "team";
            persistDashboardSectionToStorage();
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
        render();
        return;
    }

    statusNode.textContent = appState.statusMessage;
    statusNode.classList.toggle("status-error", appState.statusTone === "error");
    statusNode.classList.toggle("hidden", !appState.statusMessage);
}

function renderStatusBlock(): string {
    const toneClass = appState.statusTone === "error" ? "status-error" : "";
    const hiddenClass = appState.statusMessage ? "" : "hidden";
    return `<p class="status-message ${toneClass} ${hiddenClass}">${escapeHtml(appState.statusMessage)}</p>`;
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

async function submitPersonalProfileSave(): Promise<void> {
    if (appState.profileModal !== "personal") {
        return;
    }

    const draft = appState.profileFormDraft;
    const p = appState.profile;
    if (!draft || !p) {
        setStatus("Откройте форму через «НАСТРОЙКИ» и попробуйте снова.", "error");
        render();
        return;
    }

    draft.group = normalizeAcademicGroupInput(draft.group);
    if (!isAcademicGroupValid(draft.group)) {
        setStatus("Поле «АКАДЕМ. ГРУППА» заполните в формате РИ-150909.", "error");
        render();
        return;
    }

    appState.profileEdits = {
        fullName: draft.fullName,
        group: draft.group,
        avatarDataUrl: draft.avatarDataUrl
    };

    try {
        persistSavedProfileEdits();
    } catch {
        setStatus(
            "Не удалось сохранить в браузер (часто из‑за слишком большого фото). Попробуйте файл меньшего размера.",
            "error"
        );
        render();
        return;
    }

    try {
        syncCurrentUserInLocalTeamRoster();
    } catch {
        /* не мешаем закрыть форму, если не записался состав команды в storage */
    }

    const session = loadSession();
    const putBody = buildPersonalProfilePutBody(p, draft);

    closeProfileModal();

    pushUserActivity({
        kind: "profile_updated",
        title: "ПРОФИЛЬ ОБНОВЛЁН",
        description: "Личные данные сохранены."
    });

    if (session) {
        void (async () => {
            try {
                const updated = await updateProfile(session.token, putBody);
                appState.profile = updated;
                setStatus("Данные сохранены на сервере и в этом браузере.");
            } catch (error) {
                setStatus(`Сохранено в браузере. Сервер: ${getErrorMessage(error)}`, "error");
            }
            render();
        })();
        return;
    }

    setStatus("Сохранено локально (нет активной сессии для сервера).");
    render();
}

if (profileMount instanceof HTMLElement) {
    profileMount.addEventListener("click", (e: MouseEvent) => {
        const target = e.target;
        if (!(target instanceof Element)) {
            return;
        }

        if (target.closest("#profileSavePersonalButton")) {
            e.preventDefault();
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

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
    TeamMemberRow,
    TeamModalKind,
    TeamRescueDraft,
    TeamMemberView
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
import { getErrorMessage } from "./services/httpClient";
import { buildUserProfileFromAuthResponse } from "./services/profileMapper";
import { buildPersonalProfilePutBody } from "./services/profilePayload";
import { clearSession, loadSession, saveSession } from "./services/sessionStorage";

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

void bootstrap();

function setView(nextView: View): void {
    appState.view = nextView;
    render();
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

function getTeamMembersForView(): TeamMemberView[] {
    return getTeamRoster().map((member) => ({
        id: member.id,
        displayName: member.displayName,
        roleLabel: member.roleLabel,
        avatarUrl: member.avatarUrl
    }));
}

function pushUserActivity(input: ActivityFeedPushInput): void {
    pushActivityFeedItem(input);
}

function joinTeamByInviteCode(code: string): JoinTeamResult {
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

function createTeamFromBridge(name: string, direction: string): void {
    const teamName = name.trim() || "КОМАНДА";
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
        getTeamSubtitle: () => appState.localCreatedTeam?.direction?.trim() ?? "",
        getTeamMembers: getTeamMembersForView,
        joinTeamByInviteCode,
        createTeam: createTeamFromBridge,
        openTeamOverlayModal: (kind, memberIndex) => openTeamModal(kind, memberIndex),
        openTeamRescue: openRescueModal,
        navigateToRating: () => {
            appState.dashboardSection = "rating";
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
    setStatus("Восстанавливаем сессию...");
    render();

    try {
        appState.profile = await fetchCurrentUser(session.token);
        applyPersistedClientStateAfterMe();
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
        authSwitchColumn.innerHTML = `
            ${renderAuthSwitchPanel(
                "Новый игрок?",
                "Твоей будущей команде не хватает именно тебя. Создай аккаунт, зарабатывай ачивки и прокачивай КРК!",
                "РЕГИСТРАЦИЯ",
                "sign-up"
            )}
        `;

        formContent.innerHTML = `
            <form id="signInForm" class="auth-form auth-form-modal">
                <h1 class="auth-modal-heading">Уже с нами?</h1>
                <input class="auth-modal-field" name="email" type="email" placeholder="ЭЛЕКТРОННАЯ ПОЧТА" value="${escapeHtml(appState.signIn.email)}" autocomplete="email" required>
                <div class="auth-login-password-row">
                    <input class="auth-modal-field auth-modal-field-password" name="password" type="password" placeholder="ПАРОЛЬ" value="${escapeHtml(appState.signIn.password)}" autocomplete="current-password" required>
                    <button class="auth-inline-pill" type="button" id="signInRestoreButton">ЗАБЫЛИ?</button>
                </div>
                ${renderStatusBlock()}
                <button class="auth-submit-pill" type="submit" ${appState.isSubmitting ? "disabled" : ""}>
                    ${appState.isSubmitting ? "ПОДКЛЮЧЕНИЕ..." : "ПРИСОЕДИНИТЬСЯ"}
                </button>
            </form>
        `;

        const signInForm = getRequiredElement<HTMLFormElement>("#signInForm", isHTMLFormElement);
        const restoreButton = signInForm.querySelector("#signInRestoreButton");
        if (isHTMLButtonElement(restoreButton)) {
            restoreButton.addEventListener("click", () => {
                clearStatus();
                setView("password-recovery");
            });
        }

        const passwordInput = signInForm.elements.namedItem("password");
        if (isHTMLInputElement(passwordInput)) {
            passwordInput.addEventListener("input", () => {
                appState.signIn.password = passwordInput.value;
            });
        }

        const emailInput = signInForm.elements.namedItem("email");
        if (isHTMLInputElement(emailInput)) {
            emailInput.addEventListener("input", () => {
                appState.signIn.email = emailInput.value;
            });
        }

        signInForm.addEventListener("submit", (event: SubmitEvent) => {
            event.preventDefault();
            void submitLogin(signInForm);
        });
    }

    if (appState.view === "sign-up") {
        authSwitchColumn.innerHTML = `
            ${renderAuthSwitchPanel(
                "Уже с нами?",
                "Войди в профиль и продолжи работу с командой.",
                "ВХОД",
                "sign-in"
            )}
        `;

        formContent.innerHTML = `
            <form id="signUpForm" class="auth-form auth-form-modal">
                <h1 class="auth-modal-heading">Новый игрок?</h1>
                <input class="auth-modal-field" name="email" type="email" placeholder="ЭЛЕКТРОННАЯ ПОЧТА" value="${escapeHtml(appState.signUp.email)}" autocomplete="email" required>
                <div class="auth-reveal-field ${appState.signUp.email.trim() ? "" : "hidden"}" data-signup-password-shell>
                    <input class="auth-modal-field" name="password" type="password" placeholder="ПАРОЛЬ" value="${escapeHtml(appState.signUp.password)}" autocomplete="new-password" required minlength="6" ${appState.signUp.email.trim() ? "" : "disabled"}>
                </div>
                <div class="auth-reveal-field ${appState.signUp.password ? "" : "hidden"}" data-signup-confirm-shell>
                    <input class="auth-modal-field" name="passwordConfirm" type="password" placeholder="ПОДТВЕРЖДЕНИЕ ПАРОЛЯ" value="${escapeHtml(appState.signUp.passwordConfirm)}" autocomplete="new-password" required minlength="6" ${appState.signUp.password ? "" : "disabled"}>
                </div>
                ${renderStatusBlock()}
                <button class="auth-submit-pill" type="submit" ${appState.isSubmitting ? "disabled" : ""}>
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

            clearStatus();
            setView(nextView);
        });
    });
}

function renderAuthSwitchPanel(title: string, copy: string, buttonLabel: string, nextView: View): string {
    return `
        <div class="auth-switch-panel">
            <h2 class="auth-panel-title">${escapeHtml(title)}</h2>
            <p class="auth-panel-copy">${escapeHtml(copy)}</p>
            <button type="button" class="auth-switch-pill" data-view="${nextView}">${escapeHtml(buttonLabel)}</button>
        </div>
    `;
}

function initializeSignUpForm(signUpForm: HTMLFormElement): void {
    const emailInput = signUpForm.elements.namedItem("email");
    const passwordInput = signUpForm.elements.namedItem("password");
    const passwordConfirmInput = signUpForm.elements.namedItem("passwordConfirm");
    const passwordShell = signUpForm.querySelector<HTMLElement>("[data-signup-password-shell]");
    const confirmShell = signUpForm.querySelector<HTMLElement>("[data-signup-confirm-shell]");

    if (
        !isHTMLInputElement(emailInput) ||
        !isHTMLInputElement(passwordInput) ||
        !isHTMLInputElement(passwordConfirmInput) ||
        !passwordShell ||
        !confirmShell
    ) {
        return;
    }

    const syncVisibleFields = (): void => {
        const hasEmail = Boolean(appState.signUp.email.trim());
        const hasPassword = Boolean(appState.signUp.password);

        passwordShell.classList.toggle("hidden", !hasEmail);
        passwordInput.disabled = !hasEmail;
        confirmShell.classList.toggle("hidden", !hasPassword);
        passwordConfirmInput.disabled = !hasPassword;
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
    });

    syncVisibleFields();

    signUpForm.addEventListener("submit", (event: SubmitEvent) => {
        event.preventDefault();
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
    return Boolean(appState.profile?.teamId) || Boolean(appState.localCreatedTeam);
}

function getEffectiveTeamName(): string {
    return (
        appState.profile?.teamName?.trim() ||
        appState.localCreatedTeam?.name ||
        ""
    );
}

function buildTeamInviteLink(): string {
    const name = getEffectiveTeamName().trim() || "КОМАНДА";
    const invite =
        appState.profile?.teamInviteCode?.trim() ||
        appState.localCreatedTeam?.inviteCode ||
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

function isTeamCaptain(): boolean {
    if (!appState.profile) {
        return false;
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
    const topic = profileMount.querySelector("#teamRescueTopicInput");
    const tag = profileMount.querySelector("#teamRescueTagInput");
    const description = profileMount.querySelector("#teamRescueDescriptionInput");
    const league = profileMount.querySelector("#teamRescueLeagueInput");
    const deadline = profileMount.querySelector("#teamRescueDeadlineInput");

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

            if (!draft.topic.trim()) {
                setStatus("Укажите тему запроса на спасение.", "error");
                render();
                return;
            }

            appState.teamRescueDraft = createEmptyTeamRescueDraft();
            closeTeamModal();
            pushUserActivity({
                kind: "rescue_sent",
                title: "ЗАПРОС СПАСЕНИЯ",
                description: `Тема: «${topic}». Запрос отправлен в биржу помощи.`
            });
            setStatus("Спасение: запрос помощи отправлен (демо).");
            render();
        });
    }
}

function renderTeamModal(): string {
    if (appState.teamModal === "vote") {
        const roster = getTeamRoster();
        const member = roster[appState.teamVoteMemberIndex] ?? roster[0];
        const voteAvatarInner = member?.avatarUrl
            ? `<img src="${escapeHtml(member.avatarUrl)}" alt="" loading="lazy">`
            : "";
        const voteRole = member?.roleLabel ?? "РОЛЬ";
        const avatarClass = voteAvatarInner ? "team-vote-avatar has-image" : "team-vote-avatar";

        return `
                <div class="profile-modal team-overlay-modal" role="dialog" aria-modal="true" aria-label="Голосование">
                    <div class="profile-modal-backdrop" data-close-team-modal="1"></div>
                    <div class="profile-modal-card team-vote-card">
                        <button type="button" class="profile-modal-dot" id="teamCloseVoteButton" aria-label="Закрыть"></button>
                        <h2 class="profile-modal-title">ГОЛОСОВАНИЕ</h2>
                        <div class="team-vote-hero">
                            <div class="${avatarClass}" aria-hidden="true">${voteAvatarInner}</div>
                            <div class="team-vote-role-pill">${escapeHtml(voteRole)}</div>
                        </div>
                        <div class="team-history-rows team-vote-rows">
                            ${renderVoteModalRowsHtml()}
                        </div>
                    </div>
                </div>`;
    }

    if (appState.teamModal === "rescue") {
        const draft = ensureTeamRescueDraft();
        const photoLabel = draft.photoFileName.trim() || "ФОТО";
        return `
                <div class="profile-modal team-overlay-modal team-rescue-modal" role="dialog" aria-modal="true" aria-label="Спасение">
                    <div class="profile-modal-backdrop team-rescue-backdrop" data-close-team-modal="1"></div>
                    <div class="profile-modal-card team-rescue-card">
                        <button type="button" class="team-rescue-close" id="teamCloseRescueButton" aria-label="Закрыть"></button>
                        <h2 class="team-rescue-title">СПАСЕНИЕ</h2>
                        <form id="teamRescueForm" class="team-rescue-form" novalidate>
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
        return `
                <div class="profile-modal team-overlay-modal" role="dialog" aria-modal="true" aria-label="Заявки">
                    <div class="profile-modal-backdrop" data-close-team-modal="1"></div>
                    <div class="profile-modal-card team-requests-card">
                        <button type="button" class="profile-modal-dot" id="teamCloseRequestsButton" aria-label="Закрыть"></button>
                        <h2 class="profile-modal-title">ЗАЯВКИ</h2>
                        <div class="team-requests-carousel" aria-hidden="false">
                            <div class="team-request-slide is-dim">
                                <div class="team-request-avatar"></div>
                                <p class="team-request-label">ИМЯ ФАМИЛИЯ</p>
                                <div class="team-request-mini-row">
                                    <button type="button" class="team-request-dot-pill" disabled aria-hidden="true"></button>
                                    <button type="button" class="team-request-dot-pill is-muted" disabled aria-hidden="true"></button>
                                </div>
                            </div>
                            <div class="team-request-slide is-center">
                                <div class="team-request-avatar"></div>
                                <p class="team-request-label">ИМЯ ФАМИЛИЯ</p>
                                <div class="team-request-mini-row">
                                    <button type="button" class="team-request-dot-pill" id="teamRequestAcceptButton" aria-label="Принять"></button>
                                    <button type="button" class="team-request-dot-pill is-decline" id="teamRequestDeclineButton" aria-label="Отклонить"></button>
                                </div>
                            </div>
                            <div class="team-request-slide is-dim">
                                <div class="team-request-avatar"></div>
                                <p class="team-request-label">ИМЯ ФАМИЛИЯ</p>
                                <div class="team-request-mini-row">
                                    <button type="button" class="team-request-dot-pill" disabled aria-hidden="true"></button>
                                    <button type="button" class="team-request-dot-pill is-muted" disabled aria-hidden="true"></button>
                                </div>
                            </div>
                        </div>
                        <div class="profile-link-row team-requests-link-row">
                            <div class="profile-link-field">ССЫЛКА</div>
                            <button type="button" class="profile-link-copy" id="teamRequestsCopyLinkButton">СКОПИРОВАТЬ</button>
                        </div>
                        <div class="team-requests-bottom-placeholder" aria-hidden="true"></div>
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
                        <input id="profileGroupInput" class="profile-modal-input" type="text" placeholder="АКАДЕМ. ГРУППА" value="${escapeHtml(draft.group)}">
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
    const actualPoints = profile?.teamScore ?? 0;
    const pointsValue = String(actualPoints > 0 ? actualPoints : 100);
    const ratingLabel = "РЕЙТИНГ";
    const ratingValue = "1 место";
    const leagueValue = "Легенда";
    const fullName = getFullNameDisplay();
    const group = getGroupDisplay();
    const teamName = getEffectiveTeamName();
    const teamPillText = teamName || "КОМАНДА";
    const statusHtml = appState.statusMessage
        ? `<p class="profile-inline-status ${appState.statusTone === "error" ? "is-error" : ""}">${escapeHtml(appState.statusMessage)}</p>`
        : "";

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
                ${statusHtml}
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
            <aside class="profile-sidebar" aria-label="Разделы">
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
            appState.profileFormDraft!.group = personalGroupInput.value;
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
            const invite =
                appState.profile?.teamInviteCode?.trim() || `local-${Date.now().toString(36)}`;
            const link = `${window.location.origin}/team/${encodeURIComponent(name)}?invite=${encodeURIComponent(invite)}`;
            appState.profileInviteLink = link;
            const captain = buildLocalCaptainMemberRow();
            const members = captain ? [captain] : [];
            const direction = appState.profileCreateTeamDirection.trim();
            appState.localCreatedTeam = { name, inviteCode: invite, direction, members };
            persistLocalTeam();
            pushUserActivity({
                kind: "team_created",
                title: "КОМАНДА СОЗДАНА",
                description: `Создана команда «${name}»${direction ? ` · ${direction}` : ""}.`
            });
            appState.profileModal = "teamSuccess";
            render();
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
            void syncProfileWithServerInBackground(auth.token);
        } else {
            appState.profile = await fetchCurrentUser(auth.token);
            applyPersistedClientStateAfterMe();
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
            void syncProfileWithServerInBackground(auth.token);
        } else {
            appState.profile = await fetchCurrentUser(auth.token);
            applyPersistedClientStateAfterMe();
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

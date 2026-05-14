import "../styles/start.css";
import QRCode from "qrcode";

type View = "home" | "sign-in" | "sign-up" | "account";

type DashboardSection = "profile" | "team";

type TeamModalKind = "none" | "vote" | "requests";

type ProfileModalKind =
    | "none"
    | "personal"
    | "password"
    | "noTeam"
    | "createTeam"
    | "teamSuccess"
    | "achievement";

interface ProfileEdits {
    fullName: string;
    group: string;
    avatarDataUrl: string | null;
}

interface AuthResponse {
    /** С сервера с login/register; если нет (старый API), делаем GET /me. */
    id?: number;
    token: string;
    expiresAtUtc: string;
    userName: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
    middleName: string;
    nickname: string;
    bio: string;
    avatarUrl: string;
    contactEmail: string;
    telegramHandle: string;
    phoneNumber: string;
    studentTicketNumber: number | null;
    groupId: number | null;
    groupTitle: string;
    teamId: number | null;
    teamName: string;
    teamInviteCode: string;
    isCaptain: boolean;
    teamScore: number;
}

function buildUserProfileFromAuthResponse(auth: AuthResponse & { id: number }): UserProfileResponse {
    return {
        id: auth.id,
        userName: auth.userName,
        email: auth.email,
        role: auth.role,
        firstName: auth.firstName,
        lastName: auth.lastName,
        middleName: auth.middleName,
        nickname: auth.nickname,
        bio: auth.bio,
        avatarUrl: auth.avatarUrl,
        contactEmail: auth.contactEmail,
        telegramHandle: auth.telegramHandle,
        phoneNumber: auth.phoneNumber,
        studentTicketNumber: auth.studentTicketNumber,
        groupId: auth.groupId,
        groupTitle: auth.groupTitle,
        teamId: auth.teamId,
        teamName: auth.teamName,
        teamInviteCode: auth.teamInviteCode,
        isCaptain: auth.isCaptain,
        teamScore: auth.teamScore
    };
}

interface UserProfileResponse {
    id: number;
    userName: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
    middleName: string;
    nickname: string;
    bio: string;
    avatarUrl: string;
    contactEmail: string;
    telegramHandle: string;
    phoneNumber: string;
    studentTicketNumber: number | null;
    groupId: number | null;
    groupTitle: string;
    teamId: number | null;
    teamName: string;
    teamInviteCode: string;
    isCaptain: boolean;
    teamScore: number;
}

/** JSON для PUT /api/profile (сервер: UpdateProfileDto, camelCase). */
interface UpdateProfileJsonBody {
    firstName: string;
    lastName: string;
    middleName: string;
    nickname: string;
    bio: string;
    avatarUrl: string;
    contactEmail: string;
    telegramHandle: string;
    phoneNumber: string;
    studentTicketNumber: number | null;
    groupId: number | null;
    academicGroupLabel: string;
}

interface ProblemLike {
    title?: string;
    detail?: string;
    message?: string;
    /** ASP.NET 400 model validation: поле -> сообщения */
    errors?: Record<string, string[]>;
}

interface SessionState {
    token: string;
    expiresAtUtc: string;
}

interface SignInState {
    email: string;
    password: string;
}

interface SignUpState {
    email: string;
    password: string;
    passwordConfirm: string;
}

interface TeamMemberRow {
    id: string;
    displayName: string;
    roleLabel: string;
    avatarUrl: string;
    isCaptain: boolean;
}

interface LocalCreatedTeam {
    name: string;
    inviteCode: string;
    direction: string;
    members: TeamMemberRow[];
}

interface PersistedLocalTeamV1 {
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

interface PersistedClientProfileV1 {
    fullName: string;
    group: string;
    avatarDataUrl: string | null;
    dashboardSection?: DashboardSection;
}

interface AppState {
    view: View;
    signIn: SignInState;
    signUp: SignUpState;
    profile: UserProfileResponse | null;
    profileEdits: ProfileEdits | null;
    profileModal: ProfileModalKind;
    profileAchievementTitle: string;
    profileCreateTeamName: string;
    profileCreateTeamDirection: string;
    profileInviteLink: string;
    profileFormDraft: ProfileEdits | null;
    dashboardSection: DashboardSection;
    teamModal: TeamModalKind;
    teamVoteMemberIndex: number;
    teamRequestsInviteLink: string;
    localCreatedTeam: LocalCreatedTeam | null;
    statusMessage: string;
    statusTone: "default" | "error";
    isSubmitting: boolean;
}

const SESSION_KEY = "team-exam-auth";
const LOCAL_TEAM_STORAGE_PREFIX = "team-exam-local-team:";
const LOCAL_PROFILE_STORAGE_PREFIX = "team-exam-profile:";

const DEFAULT_LOCAL_API = "http://127.0.0.1:8080";

/**
 * По умолчанию — прямой вызов API (CORS на бэке уже открыт): и dev, и prod без путаницы с портом Vite.
 * Явно `VITE_API_BASE_URL=` (пусто) — только если поднимаете прокси на том же origin, что и страница.
 */
function resolveApiBaseUrl(): string {
    const raw = import.meta.env.VITE_API_BASE_URL as string | undefined;
    if (raw === "") {
        return "";
    }
    if (import.meta.env.PROD) {
        const explicit = (raw?.trim() ?? "") || "";
        if (explicit.length === 0) {
            return "";
        }
        return explicit.replace(/\/$/, "");
    }
    const trimmed = raw?.trim().replace(/\/$/, "") ?? "";
    return trimmed || DEFAULT_LOCAL_API;
}

const API_BASE_URL = resolveApiBaseUrl();

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
    profileAchievementTitle: "",
    profileCreateTeamName: "",
    profileCreateTeamDirection: "",
    profileInviteLink: "",
    profileFormDraft: null,
    dashboardSection: "profile",
    teamModal: "none",
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

function isHTMLElement(node: Element | null): node is HTMLElement {
    return node instanceof HTMLElement;
}

function isHTMLInputElement(node: Element | RadioNodeList | null): node is HTMLInputElement {
    return node instanceof HTMLInputElement;
}

function isHTMLButtonElement(node: Element | null): node is HTMLButtonElement {
    return node instanceof HTMLButtonElement;
}

function isHTMLFormElement(node: Element | null): node is HTMLFormElement {
    return node instanceof HTMLFormElement;
}

function getRequiredElement<T extends Element>(selector: string, guard: (node: Element | null) => node is T): T {
    const node = document.querySelector(selector);
    if (!guard(node)) {
        throw new Error(`Required element not found: ${selector}`);
    }

    return node;
}

function getInputValue(field: Element | RadioNodeList | null): string {
    return isHTMLInputElement(field) ? field.value : "";
}

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

async function bootstrap(): Promise<void> {
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
        appState.profile = await fetchMe(session.token);
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

    if (appState.view === "sign-in") {
        authSwitchColumn.innerHTML = `
            <button type="button" class="auth-switch-pill" data-view="sign-up">РЕГИСТРАЦИЯ</button>
        `;

        formContent.innerHTML = `
            <form id="signInForm" class="auth-form auth-form-modal">
                <h1 class="auth-modal-heading">ВХОД</h1>
                ${renderStatusBlock()}
                <input class="auth-modal-field" name="email" type="email" placeholder="ЭЛЕКТРОННАЯ ПОЧТА" value="${escapeHtml(appState.signIn.email)}" required>
                <div class="auth-login-password-row">
                    <input class="auth-modal-field auth-modal-field-password" name="password" type="password" placeholder="ПАРОЛЬ" value="${escapeHtml(appState.signIn.password)}" required>
                    <button class="auth-inline-pill" type="button" id="signInRestoreButton">ВОССТАНОВИТЬ</button>
                </div>
                <button class="auth-submit-pill" type="submit" ${appState.isSubmitting ? "disabled" : ""}>
                    ${appState.isSubmitting ? "ПОДКЛЮЧЕНИЕ..." : "ПРИСОЕДИНИТЬСЯ"}
                </button>
            </form>
        `;

        const signInForm = getRequiredElement<HTMLFormElement>("#signInForm", isHTMLFormElement);
        const restoreButton = signInForm.querySelector("#signInRestoreButton");
        if (isHTMLButtonElement(restoreButton)) {
            restoreButton.addEventListener("click", () => {
                setStatus("Восстановление пароля скоро будет доступно.");
                updateStatusBlock();
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
            <button type="button" class="auth-switch-pill" data-view="sign-in">ВХОД</button>
        `;

        formContent.innerHTML = `
            <form id="signUpForm" class="auth-form auth-form-modal">
                <h1 class="auth-modal-heading">РЕГИСТРАЦИЯ</h1>
                ${renderStatusBlock()}
                <input class="auth-modal-field" name="email" type="email" placeholder="ЭЛЕКТРОННАЯ ПОЧТА" value="${escapeHtml(appState.signUp.email)}" required>
                <input class="auth-modal-field" name="password" type="password" placeholder="ПАРОЛЬ" value="${escapeHtml(appState.signUp.password)}" required minlength="6">
                <input class="auth-modal-field" name="passwordConfirm" type="password" placeholder="ПОДТВЕРЖДЕНИЕ ПАРОЛЯ" value="${escapeHtml(appState.signUp.passwordConfirm)}" required minlength="6">
                <button class="auth-submit-pill" type="submit" ${appState.isSubmitting ? "disabled" : ""}>
                    ${appState.isSubmitting ? "СОЗДАНИЕ..." : "ПРИСОЕДИНИТЬСЯ"}
                </button>
            </form>
        `;

        initializeSignUpForm(getRequiredElement<HTMLFormElement>("#signUpForm", isHTMLFormElement));
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

function initializeSignUpForm(signUpForm: HTMLFormElement): void {
    const emailInput = signUpForm.elements.namedItem("email");
    const passwordInput = signUpForm.elements.namedItem("password");
    const passwordConfirmInput = signUpForm.elements.namedItem("passwordConfirm");

    if (!isHTMLInputElement(emailInput) || !isHTMLInputElement(passwordInput) || !isHTMLInputElement(passwordConfirmInput)) {
        return;
    }

    emailInput.addEventListener("input", () => {
        appState.signUp.email = emailInput.value;
    });

    passwordInput.addEventListener("input", () => {
        appState.signUp.password = passwordInput.value;
    });

    passwordConfirmInput.addEventListener("input", () => {
        appState.signUp.passwordConfirm = passwordConfirmInput.value;
    });

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
    appState.profileAchievementTitle = "";
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

    if (data.dashboardSection === "profile" || data.dashboardSection === "team") {
        appState.dashboardSection = data.dashboardSection;
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
    appState.teamModal = kind;
    const roster = getTeamRoster();
    const safeIndex =
        roster.length > 0 ? Math.min(Math.max(0, memberIndex), roster.length - 1) : 0;
    appState.teamVoteMemberIndex = safeIndex;

    if (kind === "requests") {
        appState.teamRequestsInviteLink = buildTeamInviteLink();
    }

    render();
}

function closeTeamModal(): void {
    appState.teamModal = "none";
    render();
}

function renderTeamMemberCardsHtml(): string {
    const roster = getTeamRoster();
    if (!roster.length) {
        return `<p class="team-members-empty">Участники появятся здесь после приглашения в команду.</p>`;
    }

    return roster
        .map((m, i) => {
            const avatarInner = m.avatarUrl
                ? `<img src="${escapeHtml(m.avatarUrl)}" alt="" loading="lazy">`
                : "";
            return `
            <div class="team-member-card">
                <div class="team-member-avatar" aria-hidden="true">${avatarInner}</div>
                <div class="team-member-name">${escapeHtml(m.displayName)}</div>
                <div class="team-member-role">${escapeHtml(m.roleLabel)}</div>
                <button type="button" class="team-member-action" data-team-card-action="vote" data-member-index="${i}">ГОЛОСОВАТЬ</button>
            </div>`;
        })
        .join("");
}

function renderTeamDashboardMain(statusHtml: string, teamTitle: string): string {
    const teamSubtitle = appState.localCreatedTeam?.direction?.trim() ?? "";
    const requestsControl = isTeamCaptain()
        ? `<button type="button" class="team-top-pill team-top-pill-plus" id="teamOpenRequestsHeaderButton" aria-label="Заявки">+</button>`
        : "";

    return `
            <section class="profile-main team-dashboard-main">
                ${statusHtml}
                <header class="team-top-bar">
                    <div class="team-top-headings">
                        <span class="team-top-title">${escapeHtml(teamTitle)}</span>
                        ${
                            teamSubtitle
                                ? `<span class="team-top-subtitle">${escapeHtml(teamSubtitle)}</span>`
                                : ""
                        }
                    </div>
                    <span class="team-top-dot" aria-hidden="true"></span>
                    <button type="button" class="team-top-pill" id="teamKrkButton">КРК</button>
                    ${requestsControl}
                </header>
                <div class="team-panel team-members-panel">
                    <div class="team-members-grid">
                        ${renderTeamMemberCardsHtml()}
                    </div>
                </div>
                <div class="team-panel team-history-panel">
                    <div class="team-history-head">
                        <h3 class="team-history-title">ИСТОРИЯ АКТИВНОСТИ</h3>
                        <button type="button" class="team-top-pill team-check-in-pill" id="teamCheckInButton">CHECK-IN</button>
                    </div>
                    <div class="team-history-rows team-history-rows--empty" aria-label="История активности пока пуста"></div>
                </div>
                <div class="team-rescue-bar">
                    <button type="button" class="team-rescue-pill" id="teamRescueButton">СПАСЕНИЕ</button>
                </div>
            </section>`;
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

const PROFILE_ACHIEVEMENT_STRIP_COUNT = 20;

function renderProfileAchievementStrip(): string {
    const items = Array.from({ length: PROFILE_ACHIEVEMENT_STRIP_COUNT }, (_, index) => index);
    return items
        .map(
            (i) => `
        <button type="button" class="profile-achievement-item" data-achievement-index="${i}">
            <span class="profile-achievement-circle"></span>
            <span class="profile-achievement-caption">НАЗВАНИЕ</span>
        </button>`
        )
        .join("");
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
            return `
                <div class="profile-modal" role="dialog" aria-modal="true" aria-label="Достижение">
                    <div class="profile-modal-backdrop" data-close-modal="1"></div>
                    <div class="profile-modal-card profile-modal-card-achievement">
                        <button type="button" class="profile-modal-dot" id="profileCloseAchievementButton" aria-label="Закрыть"></button>
                        <div class="profile-achievement-hero"></div>
                        <p class="profile-achievement-name">${escapeHtml(appState.profileAchievementTitle || "НАЗВАНИЕ")}</p>
                        <div class="profile-achievement-body"></div>
                        <div class="profile-achievement-meta">
                            <span class="profile-achievement-meta-label">БАЛЛЫ</span>
                            <span class="profile-achievement-meta-value"></span>
                        </div>
                    </div>
                </div>
            `;
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
    const pointsValue = String(profile?.teamScore ?? 0);
    const ratingLabel = "РЕЙТИНГ";
    const ratingValue = "—";
    const leagueValue = "—";
    const fullName = getFullNameDisplay();
    const group = getGroupDisplay();
    const teamName = getEffectiveTeamName();
    const teamPillText = teamName || "КОМАНДА";
    const teamScreenTitle = teamName || "НАЗВАНИЕ";
    const statusHtml = appState.statusMessage
        ? `<p class="profile-inline-status ${appState.statusTone === "error" ? "is-error" : ""}">${escapeHtml(appState.statusMessage)}</p>`
        : "";

    const navProfileActive = appState.dashboardSection === "profile" ? " is-active" : "";
    const navTeamActive = appState.dashboardSection === "team" ? " is-active" : "";

    const mainColumn =
        appState.dashboardSection === "team"
            ? renderTeamDashboardMain(statusHtml, teamScreenTitle)
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
        <div class="profile-app">
            <aside class="profile-sidebar" aria-label="Разделы">
                <nav class="profile-nav-top">
                    <button type="button" class="profile-nav-button${navProfileActive}" data-dashboard="profile">ПРОФИЛЬ</button>
                    <button type="button" class="profile-nav-button${navTeamActive}" data-dashboard="team">КОМАНДА</button>
                    <button type="button" class="profile-nav-button" data-dashboard-placeholder="rating">РЕЙТИНГ</button>
                    <button type="button" class="profile-nav-button" data-dashboard-placeholder="events">СОБЫТИЯ</button>
                    <button type="button" class="profile-nav-button" data-dashboard-placeholder="news">НОВОСТИ</button>
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
    `;

    wireProfileViewEvents();

    if (appState.profileModal === "teamSuccess") {
        void paintTeamSuccessQr();
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
            if (hasTeamAccess()) {
                appState.dashboardSection = "team";
                persistDashboardSectionToStorage();
                clearStatus();
                render();
                return;
            }

            openProfileModal("noTeam");
        });
    }

    profileMount.querySelectorAll<HTMLButtonElement>("[data-dashboard]").forEach((button) => {
        button.addEventListener("click", () => {
            const section = button.dataset.dashboard as DashboardSection | undefined;
            if (!section) {
                return;
            }

            if (section === "team" && !hasTeamAccess()) {
                openProfileModal("noTeam");
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

    const teamKrk = profileMount.querySelector("#teamKrkButton");
    if (isHTMLButtonElement(teamKrk)) {
        teamKrk.addEventListener("click", () => {
            setStatus("Экран рейтинга и КРК скоро будут здесь. Пока откройте «РЕЙТИНГ» в меню слева.");
            render();
        });
    }

    const teamOpenRequestsHeader = profileMount.querySelector("#teamOpenRequestsHeaderButton");
    if (isHTMLButtonElement(teamOpenRequestsHeader)) {
        teamOpenRequestsHeader.addEventListener("click", () => {
            openTeamModal("requests");
        });
    }

    const teamCheckIn = profileMount.querySelector("#teamCheckInButton");
    if (isHTMLButtonElement(teamCheckIn)) {
        teamCheckIn.addEventListener("click", () => {
            setStatus("Check-in зарегистрирован (демо).");
            render();
        });
    }

    const teamRescue = profileMount.querySelector("#teamRescueButton");
    if (isHTMLButtonElement(teamRescue)) {
        teamRescue.addEventListener("click", () => {
            setStatus("Спасение: запрос помощи отправлен (демо).");
            render();
        });
    }

    profileMount.querySelectorAll<HTMLButtonElement>("[data-team-card-action]").forEach((button) => {
        button.addEventListener("click", () => {
            const action = button.dataset.teamCardAction;
            const idx = Number(button.dataset.memberIndex ?? "0");
            if (action === "vote") {
                openTeamModal("vote", idx);
            }
        });
    });

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
            appState.profileAchievementTitle = "НАЗВАНИЕ";
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
        const auth = await request<AuthResponse>("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({
                email: appState.signIn.email,
                password: appState.signIn.password
            })
        });

        saveSession(auth);
        if (typeof auth.id === "number" && auth.id > 0) {
            appState.profile = buildUserProfileFromAuthResponse(
                auth as AuthResponse & { id: number }
            );
            applyPersistedClientStateAfterMe();
            void syncProfileWithServerInBackground(auth.token);
        } else {
            appState.profile = await fetchMe(auth.token);
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
        const auth = await request<AuthResponse>("/api/auth/register", {
            method: "POST",
            body: JSON.stringify({
                userName: buildUserName(appState.signUp.email),
                email: appState.signUp.email,
                password: appState.signUp.password
            })
        });

        saveSession(auth);
        if (typeof auth.id === "number" && auth.id > 0) {
            appState.profile = buildUserProfileFromAuthResponse(
                auth as AuthResponse & { id: number }
            );
            applyPersistedClientStateAfterMe();
            void syncProfileWithServerInBackground(auth.token);
        } else {
            appState.profile = await fetchMe(auth.token);
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
        appState.profile = await fetchMe(session.token);
        applyPersistedClientStateAfterMe();
        setStatus("Данные обновлены.");
    } catch (error) {
        setStatus(getErrorMessage(error), "error");
    } finally {
        appState.isSubmitting = false;
        render();
    }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const headers = new Headers(init?.headers);
    headers.set("Accept", "application/json");

    if (init?.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...init,
        headers
    });

    if (!response.ok) {
        let message = `Ошибка ${response.status}`;

        try {
            const body = (await response.json()) as ProblemLike;
            if (body.errors) {
                const fromModel = Object.values(body.errors)
                    .flat()
                    .find((line) => line?.trim().length);
                if (fromModel) {
                    message = fromModel;
                }
            }
            if (message === `Ошибка ${response.status}`) {
                message = body.detail || body.message || body.title || message;
            }
        } catch {
            message = response.statusText || message;
        }

        throw new Error(translateApiErrorMessage(message));
    }

    return await response.json() as T;
}

function fetchMe(bearerToken: string): Promise<UserProfileResponse> {
    return request<UserProfileResponse>("/api/auth/me", {
        headers: { Authorization: `Bearer ${bearerToken}` }
    });
}

/**
 * Не блокирует вход: login/register уже отдают тот же профиль + id.
 * При успехе обновляет данные; при ошибке /me остаётся state из auth.
 */
function syncProfileWithServerInBackground(bearerToken: string): void {
    void (async () => {
        try {
            const p = await fetchMe(bearerToken);
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

function saveSession(auth: AuthResponse): void {
    const session: SessionState = {
        token: auth.token,
        expiresAtUtc: auth.expiresAtUtc
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function loadSession(): SessionState | null {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) {
        return null;
    }

    try {
        const parsed = JSON.parse(raw) as SessionState;
        if (!parsed.token || !parsed.expiresAtUtc) {
            return null;
        }

        return parsed;
    } catch {
        return null;
    }
}

function clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
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

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : "Не удалось выполнить запрос.";
}

function translateApiErrorMessage(message: string): string {
    const known: Record<string, string> = {
        "User with this email already exists.": "Пользователь с таким email уже зарегистрирован.",
        "Invalid email or password.": "Неверная почта или пароль."
    };

    return known[message] ?? message;
}

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function splitFullNameForApi(fullName: string): { firstName: string; lastName: string } {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
        return { firstName: "", lastName: "" };
    }

    if (parts.length === 1) {
        return { firstName: parts[0] ?? "", lastName: "" };
    }

    return { firstName: parts[0] ?? "", lastName: parts.slice(1).join(" ") };
}

/**
 * Собирает тело PUT /api/profile из формы «личные данные» и текущего снимка с сервера
 * (остальные поля пока не редактируются в UI — копируются с server).
 */
function buildPersonalProfilePutBody(server: UserProfileResponse, draft: ProfileEdits): UpdateProfileJsonBody {
    const { firstName, lastName } = splitFullNameForApi(draft.fullName);
    const draftGroup = draft.group.trim();
    const serverGroupTitle = (server.groupTitle ?? "").trim();
    const groupId =
        draftGroup === serverGroupTitle && server.groupId != null && server.groupId > 0
            ? server.groupId
            : null;

    const newDataUrl = draft.avatarDataUrl && draft.avatarDataUrl.startsWith("data:");
    const avatarUrl: string = newDataUrl
        ? (draft.avatarDataUrl as string)
        : (draft.avatarDataUrl ?? server.avatarUrl ?? "");

    const st = server.studentTicketNumber;
    return {
        firstName,
        lastName,
        middleName: server.middleName ?? "",
        nickname: server.nickname ?? "",
        bio: server.bio ?? "",
        avatarUrl,
        contactEmail: server.contactEmail ?? "",
        telegramHandle: server.telegramHandle ?? "",
        phoneNumber: server.phoneNumber ?? "",
        studentTicketNumber: st && st > 0 ? st : null,
        groupId: groupId && groupId > 0 ? groupId : null,
        academicGroupLabel: draftGroup
    };
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

    if (session) {
        void (async () => {
            try {
                const updated = await request<UserProfileResponse>("/api/profile", {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${session.token}`
                    },
                    body: JSON.stringify(putBody)
                });
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

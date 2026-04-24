import "../styles/start.css";

type View = "home" | "sign-in" | "sign-up" | "account";

interface AuthResponse {
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

interface ProblemLike {
    title?: string;
    detail?: string;
    message?: string;
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
    code: string;
    password: string;
    passwordVisible: boolean;
}

interface AppState {
    view: View;
    signIn: SignInState;
    signUp: SignUpState;
    profile: UserProfileResponse | null;
    statusMessage: string;
    statusTone: "default" | "error";
    isSubmitting: boolean;
}

const SESSION_KEY = "team-exam-auth";
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ?? "";

const appState: AppState = {
    view: "home",
    signIn: {
        email: "",
        password: ""
    },
    signUp: {
        email: "",
        code: "",
        password: "",
        passwordVisible: false
    },
    profile: null,
    statusMessage: "",
    statusTone: "default",
    isSubmitting: false
};

const homeScreen = document.getElementById("homeScreen");
const appScreen = document.getElementById("appScreen");
const authLayout = document.getElementById("authLayout");
const formContent = document.getElementById("formContent");
const promoSignInButton = document.getElementById("promoSignInButton");
const promoSignUpButton = document.getElementById("promoSignUpButton");

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
        appState.profile = await request<UserProfileResponse>("/api/auth/me", {
            headers: {
                Authorization: `Bearer ${session.token}`
            }
        });
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
        !isHTMLElement(formContent) ||
        !isHTMLButtonElement(promoSignInButton) ||
        !isHTMLButtonElement(promoSignUpButton)
    ) {
        return;
    }

    const isHome = appState.view === "home";

    homeScreen.classList.add("screen-active");
    appScreen.classList.toggle("screen-active", !isHome);
    appScreen.setAttribute("aria-hidden", String(isHome));
    document.body.classList.toggle("modal-open", !isHome);

    if (!isHome) {
        renderAuthView();
    }
}

function renderAuthView(): void {
    if (
        !isHTMLElement(authLayout) ||
        !isHTMLElement(formContent)
    ) {
        return;
    }

    authLayout.classList.toggle("mode-sign-up", appState.view === "sign-up");

    if (appState.view === "sign-in") {
        formContent.innerHTML = `
            <form id="signInForm" class="auth-form">
                <h1>ВХОД</h1>
                ${renderStatusBlock()}
                <input name="email" type="email" placeholder="ЭЛЕКТРОННАЯ ПОЧТА" value="${escapeHtml(appState.signIn.email)}" required>
                <div class="password-row auth-password-row">
                    <input name="password" type="password" placeholder="ПАРОЛЬ" value="${escapeHtml(appState.signIn.password)}" required>
                    <button class="icon-button" id="signInPasswordToggle" type="button" aria-label="Показать пароль">◉</button>
                </div>
                <button class="primary-button form-button" type="submit" ${appState.isSubmitting ? "disabled" : ""}>
                    ${appState.isSubmitting ? "ПОДКЛЮЧЕНИЕ..." : "ПРИСОЕДИНИТЬСЯ"}
                </button>
                <button class="text-link" type="button" data-view="sign-up">Зарегистрироваться, если нет аккаунта</button>
            </form>
        `;

        const signInForm = getRequiredElement<HTMLFormElement>("#signInForm", isHTMLFormElement);
        const passwordToggle = getRequiredElement<HTMLButtonElement>("#signInPasswordToggle", isHTMLButtonElement);
        const passwordInput = signInForm.elements.namedItem("password");

        if (isHTMLInputElement(passwordInput)) {
            passwordToggle.addEventListener("click", () => {
                passwordInput.type = passwordInput.type === "password" ? "text" : "password";
            });

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
        formContent.innerHTML = `
            <form id="signUpForm" class="auth-form">
                <h1>РЕГИСТРАЦИЯ</h1>
                ${renderStatusBlock()}
                <input name="email" type="email" placeholder="ЭЛЕКТРОННАЯ ПОЧТА" value="${escapeHtml(appState.signUp.email)}" required>
                <div class="code-row">
                    <input name="code" type="text" placeholder="ПОДТВЕРЖДЕНИЕ" value="${escapeHtml(appState.signUp.code)}">
                    <button class="inline-button" id="repeatCodeButton" type="button">ПОВТОРИТЬ</button>
                </div>
                <div class="password-row auth-password-row">
                    <input name="password" type="${appState.signUp.passwordVisible ? "text" : "password"}" placeholder="ПАРОЛЬ" value="${escapeHtml(appState.signUp.password)}" required>
                    <button class="icon-button" id="signUpPasswordToggle" type="button" aria-label="Показать пароль">${appState.signUp.passwordVisible ? "○" : "◉"}</button>
                </div>
                <button class="primary-button form-button" type="submit" ${appState.isSubmitting ? "disabled" : ""}>
                    ${appState.isSubmitting ? "СОЗДАНИЕ..." : "ПРИСОЕДИНИТЬСЯ"}
                </button>
                <button class="text-link" type="button" data-view="sign-in">Уже есть аккаунт? Войти</button>
            </form>
        `;

        initializeSignUpForm(getRequiredElement<HTMLFormElement>("#signUpForm", isHTMLFormElement));
    }

    if (appState.view === "account") {
        const profile = appState.profile;
        formContent.innerHTML = `
            <div class="auth-form">
                <h1>АККАУНТ</h1>
                ${renderStatusBlock()}
                <div class="profile-summary">
                    <div class="summary-row"><span>Пользователь</span><strong>${escapeHtml(profile?.userName ?? "-")}</strong></div>
                    <div class="summary-row"><span>Email</span><strong>${escapeHtml(profile?.email ?? "-")}</strong></div>
                    <div class="summary-row"><span>Роль</span><strong>${escapeHtml(profile?.role ?? "-")}</strong></div>
                    <div class="summary-row"><span>Группа</span><strong>${escapeHtml(profile?.groupTitle || "Не указана")}</strong></div>
                    <div class="summary-row"><span>Команда</span><strong>${escapeHtml(profile?.teamName || "Не назначена")}</strong></div>
                    <div class="summary-row"><span>Код команды</span><strong>${escapeHtml(profile?.teamInviteCode || "Нет")}</strong></div>
                    <div class="summary-row"><span>Баллы команды</span><strong>${profile?.teamScore ?? 0}</strong></div>
                </div>
                <div class="summary-actions">
                    <button class="primary-button form-button" type="button" id="refreshProfileButton" ${appState.isSubmitting ? "disabled" : ""}>ОБНОВИТЬ</button>
                    <button class="text-link" type="button" id="logoutButton">ВЫЙТИ</button>
                </div>
            </div>
        `;

        const refreshProfileButton = getRequiredElement<HTMLButtonElement>("#refreshProfileButton", isHTMLButtonElement);
        const logoutButton = getRequiredElement<HTMLButtonElement>("#logoutButton", isHTMLButtonElement);

        refreshProfileButton.addEventListener("click", () => {
            void refreshProfile();
        });

        logoutButton.addEventListener("click", () => {
            clearSession();
            appState.profile = null;
            appState.signIn.password = "";
            setStatus("Сессия завершена.");
            setView("sign-in");
        });
    }

    formContent.querySelectorAll<HTMLElement>("[data-view]").forEach((button) => {
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
    const codeInput = signUpForm.elements.namedItem("code");
    const passwordInput = signUpForm.elements.namedItem("password");
    const repeatCodeButton = getRequiredElement<HTMLButtonElement>("#repeatCodeButton", isHTMLButtonElement);
    const passwordToggle = getRequiredElement<HTMLButtonElement>("#signUpPasswordToggle", isHTMLButtonElement);

    if (!isHTMLInputElement(emailInput) || !isHTMLInputElement(passwordInput)) {
        return;
    }

    emailInput.addEventListener("input", () => {
        appState.signUp.email = emailInput.value;
    });

    if (isHTMLInputElement(codeInput)) {
        codeInput.addEventListener("input", () => {
            appState.signUp.code = codeInput.value;
        });
    }

    passwordInput.addEventListener("input", () => {
        appState.signUp.password = passwordInput.value;
    });

    repeatCodeButton.addEventListener("click", () => {
        appState.signUp.email = emailInput.value;

        if (!appState.signUp.email.trim()) {
            setStatus("Сначала укажите электронную почту.", "error");
            updateStatusBlock();
            return;
        }

        setStatus(`Код подтверждения повторно отправлен на ${appState.signUp.email.trim()}.`);
        updateStatusBlock();
    });

    passwordToggle.addEventListener("click", () => {
        appState.signUp.passwordVisible = !appState.signUp.passwordVisible;
        passwordInput.type = appState.signUp.passwordVisible ? "text" : "password";
        passwordToggle.textContent = appState.signUp.passwordVisible ? "○" : "◉";
    });

    signUpForm.addEventListener("submit", (event: SubmitEvent) => {
        event.preventDefault();
        void submitRegister(signUpForm);
    });
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
        appState.profile = await request<UserProfileResponse>("/api/auth/me", {
            headers: {
                Authorization: `Bearer ${auth.token}`
            }
        });
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

async function submitRegister(form: HTMLFormElement): Promise<void> {
    appState.signUp.email = getInputValue(form.elements.namedItem("email")).trim();
    appState.signUp.code = getInputValue(form.elements.namedItem("code")).trim();
    appState.signUp.password = getInputValue(form.elements.namedItem("password"));

    if (!appState.signUp.email || !appState.signUp.password) {
        setStatus("Заполните email и пароль.", "error");
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
        appState.profile = await request<UserProfileResponse>("/api/auth/me", {
            headers: {
                Authorization: `Bearer ${auth.token}`
            }
        });
        appState.view = "account";
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
        appState.profile = await request<UserProfileResponse>("/api/auth/me", {
            headers: {
                Authorization: `Bearer ${session.token}`
            }
        });
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
            const body = await response.json() as ProblemLike;
            message = body.detail || body.message || body.title || message;
        } catch {
            message = response.statusText || message;
        }

        throw new Error(message);
    }

    return await response.json() as T;
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

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

if (isHTMLButtonElement(promoSignInButton)) {
    promoSignInButton.addEventListener("click", () => {
        clearStatus();
        setView("sign-in");
    });
}

if (isHTMLButtonElement(promoSignUpButton)) {
    promoSignUpButton.addEventListener("click", () => {
        clearStatus();
        setView("sign-up");
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

import "../styles/start.css";

type View = "home" | "sign-in" | "sign-up" | "recovery" | "sign-in-confirm" | "sign-up-confirm";

interface SignInState {
    email: string;
    password: string;
}

interface SignUpState {
    email: string;
    code: string;
    codeSent: boolean;
    password: string;
    passwordConfirm: string;
}

interface RecoveryState {
    email: string;
    password: string;
}

interface AppState {
    view: View;
    signIn: SignInState;
    signUp: SignUpState;
    recovery: RecoveryState;
}

type FormField = RadioNodeList | Element | null;

const appState: AppState = {
    view: "home",
    signIn: {
        email: "",
        password: ""
    },
    signUp: {
        email: "",
        code: "",
        codeSent: false,
        password: "",
        passwordConfirm: ""
    },
    recovery: {
        email: "",
        password: ""
    }
};

const homeScreen = document.getElementById("homeScreen");
const appScreen = document.getElementById("appScreen");
const authLayout = document.getElementById("authLayout");
const formContent = document.getElementById("formContent");
const promoButton = document.getElementById("promoButton");

function isHTMLElement(node: Element | null): node is HTMLElement {
    return node instanceof HTMLElement;
}

function isHTMLInputElement(node: FormField): node is HTMLInputElement {
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

function getInputValue(field: FormField): string {
    return isHTMLInputElement(field) ? field.value : "";
}

function setView(nextView: View): void {
    appState.view = nextView;
    render();
}

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function render(): void {
    if (!isHTMLElement(homeScreen) || !isHTMLElement(appScreen) || !isHTMLElement(authLayout) || !isHTMLElement(formContent) || !isHTMLButtonElement(promoButton)) {
        return;
    }

    const isHome = appState.view === "home";

    homeScreen.classList.toggle("screen-active", isHome);
    appScreen.classList.toggle("screen-active", !isHome);

    if (!isHome) {
        renderAuthView();
    }
}

function renderAuthView(): void {
    if (!isHTMLElement(authLayout) || !isHTMLElement(formContent) || !isHTMLButtonElement(promoButton)) {
        return;
    }

    const view = appState.view;
    const reverse = view === "sign-up" || view === "sign-up-confirm";

    authLayout.classList.toggle("layout-reverse", reverse);

    if (view === "sign-in") {
        promoButton.textContent = "РЕГИСТРАЦИЯ";
        promoButton.onclick = () => setView("sign-up");
        formContent.innerHTML = `
            <form id="signInForm" class="auth-form">
                <h1>ВХОД</h1>
                <input name="email" type="email" placeholder="ЭЛЕКТРОННАЯ ПОЧТА" value="${escapeHtml(appState.signIn.email)}" required>
                <input name="password" type="password" placeholder="ПАРОЛЬ" value="${escapeHtml(appState.signIn.password)}" required>
                <button class="text-link text-link-left" type="button" data-view="recovery">Забыли пароль? Восстановить</button>
                <button class="primary-button form-button" type="submit">ПРИСОЕДИНИТЬСЯ</button>
                <button class="text-link" type="button" data-view="sign-up">Зарегистрироваться, если нет аккаунта</button>
            </form>
        `;

        const signInForm = getRequiredElement<HTMLFormElement>("#signInForm", isHTMLFormElement);
        signInForm.addEventListener("submit", (event: SubmitEvent) => {
            event.preventDefault();
            appState.signIn.email = getInputValue(signInForm.elements.namedItem("email"));
            appState.signIn.password = getInputValue(signInForm.elements.namedItem("password"));
            setView("sign-in-confirm");
        });
    }

    if (view === "sign-up") {
        promoButton.textContent = "ВХОД";
        promoButton.onclick = () => setView("sign-in");
        formContent.innerHTML = `
            <form id="signUpForm" class="auth-form">
                <h1>РЕГИСТРАЦИЯ</h1>
                <input name="email" type="email" placeholder="ЭЛЕКТРОННАЯ ПОЧТА" value="${escapeHtml(appState.signUp.email)}" required>
                <button class="secondary-action ${appState.signUp.email.trim() ? "" : "hidden"}" id="sendCodeButton" type="button">ОТПРАВИТЬ КОД НА ПОЧТУ</button>
                <div class="code-row ${appState.signUp.codeSent ? "" : "hidden"}" id="codeRow">
                    <input name="code" type="text" placeholder="ПОДТВЕРЖДЕНИЕ" value="${escapeHtml(appState.signUp.code)}">
                    <button class="inline-button" id="repeatCodeButton" type="button">ПОВТОРИТЬ</button>
                </div>
                <input name="password" type="password" placeholder="ПАРОЛЬ" value="${escapeHtml(appState.signUp.password)}" required>
                <input class="${appState.signUp.password ? "" : "hidden"}" id="passwordConfirmInput" name="passwordConfirm" type="password" placeholder="ПОДТВЕРЖДЕНИЕ" value="${escapeHtml(appState.signUp.passwordConfirm)}" required>
                <p id="passwordMismatchMessage" class="field-error ${shouldShowPasswordMismatch() ? "" : "hidden"}">Пароли должны совпадать.</p>
                <button class="primary-button form-button" id="signUpSubmitButton" type="submit" ${canSubmitSignUp() ? "" : "disabled"}>ПРИСОЕДИНИТЬСЯ</button>
            </form>
        `;

        const signUpForm = getRequiredElement<HTMLFormElement>("#signUpForm", isHTMLFormElement);
        initializeSignUpForm(signUpForm);
        signUpForm.addEventListener("submit", (event: SubmitEvent) => {
            event.preventDefault();
            if (!canSubmitSignUp()) {
                return;
            }

            appState.signUp.email = getInputValue(signUpForm.elements.namedItem("email"));
            appState.signUp.code = getInputValue(signUpForm.elements.namedItem("code"));
            appState.signUp.password = getInputValue(signUpForm.elements.namedItem("password"));
            appState.signUp.passwordConfirm = getInputValue(signUpForm.elements.namedItem("passwordConfirm"));

            setView("sign-up-confirm");
        });
    }

    if (view === "recovery") {
        promoButton.textContent = "РЕГИСТРАЦИЯ";
        promoButton.onclick = () => setView("sign-up");
        formContent.innerHTML = `
            <form id="recoveryForm" class="auth-form">
                <h1>ВХОД</h1>
                <input name="email" type="email" placeholder="ЭЛЕКТРОННАЯ ПОЧТА" value="${escapeHtml(appState.recovery.email)}" required>
                <div class="password-row">
                    <input name="password" type="password" placeholder="ПАРОЛЬ" value="${escapeHtml(appState.recovery.password)}" required>
                    <button class="inline-button" type="submit">ВОССТАНОВИТЬ</button>
                </div>
                <button class="primary-button form-button" type="button" data-view="sign-in-confirm">ПРИСОЕДИНИТЬСЯ</button>
            </form>
        `;

        const recoveryForm = getRequiredElement<HTMLFormElement>("#recoveryForm", isHTMLFormElement);
        recoveryForm.addEventListener("submit", (event: SubmitEvent) => {
            event.preventDefault();
            appState.recovery.email = getInputValue(recoveryForm.elements.namedItem("email"));
            appState.recovery.password = getInputValue(recoveryForm.elements.namedItem("password"));
            appState.signIn.email = appState.recovery.email;
            appState.signIn.password = appState.recovery.password;
            setView("sign-in");
        });
    }

    if (view === "sign-in-confirm") {
        promoButton.textContent = "РЕГИСТРАЦИЯ";
        promoButton.onclick = () => setView("sign-up");
        formContent.innerHTML = `
            <div class="auth-form">
                <h1>ПОДТВЕРЖДЕНИЕ</h1>
                <input type="email" value="${escapeHtml(appState.signIn.email)}" placeholder="ЭЛЕКТРОННАЯ ПОЧТА" readonly>
                <input type="text" value="${escapeHtml(appState.signIn.password)}" placeholder="ПАРОЛЬ" readonly>
                <p class="confirm-message">Введённые поля сохранены после перехода внутри одной страницы.</p>
                <button class="primary-button form-button" type="button" data-view="home">ПЕРЕЙТИ В МЕНЮ</button>
            </div>
        `;
    }

    if (view === "sign-up-confirm") {
        promoButton.textContent = "ВХОД";
        promoButton.onclick = () => setView("sign-in");
        formContent.innerHTML = `
            <div class="auth-form">
                <h1>РЕГИСТРАЦИЯ</h1>
                <p class="confirm-message">Регистрация почти завершена. Проверьте почту и подтвердите аккаунт.</p>
                <button class="primary-button form-button" type="button" data-view="sign-in">ПЕРЕЙТИ КО ВХОДУ</button>
            </div>
        `;
    }

    formContent.querySelectorAll<HTMLElement>("[data-view]").forEach((button) => {
        button.addEventListener("click", () => {
            if (view === "sign-in") {
                const signInForm = document.getElementById("signInForm");
                if (signInForm instanceof HTMLFormElement) {
                    appState.signIn.email = getInputValue(signInForm.elements.namedItem("email"));
                    appState.signIn.password = getInputValue(signInForm.elements.namedItem("password"));
                }
            }

            if (view === "sign-up") {
                const signUpForm = document.getElementById("signUpForm");
                if (signUpForm instanceof HTMLFormElement) {
                    appState.signUp.email = getInputValue(signUpForm.elements.namedItem("email"));
                    appState.signUp.code = getInputValue(signUpForm.elements.namedItem("code"));
                    appState.signUp.password = getInputValue(signUpForm.elements.namedItem("password"));
                    appState.signUp.passwordConfirm = getInputValue(signUpForm.elements.namedItem("passwordConfirm"));
                }
            }

            if (view === "recovery") {
                const recoveryForm = document.getElementById("recoveryForm");
                if (recoveryForm instanceof HTMLFormElement) {
                    appState.recovery.email = getInputValue(recoveryForm.elements.namedItem("email"));
                    appState.recovery.password = getInputValue(recoveryForm.elements.namedItem("password"));
                }
            }

            const nextView = button.dataset.view as View | undefined;
            if (nextView) {
                setView(nextView);
            }
        });
    });
}

function canSubmitSignUp(): boolean {
    return Boolean(
        appState.signUp.email.trim() &&
        appState.signUp.codeSent &&
        appState.signUp.code.trim() &&
        appState.signUp.password &&
        appState.signUp.passwordConfirm &&
        appState.signUp.password === appState.signUp.passwordConfirm
    );
}

function shouldShowPasswordMismatch(): boolean {
    return Boolean(
        appState.signUp.password &&
        appState.signUp.passwordConfirm &&
        appState.signUp.password !== appState.signUp.passwordConfirm
    );
}

function initializeSignUpForm(signUpForm: HTMLFormElement): void {
    const emailInput = signUpForm.elements.namedItem("email");
    const codeInput = signUpForm.elements.namedItem("code");
    const passwordInput = signUpForm.elements.namedItem("password");
    const passwordConfirmInput = signUpForm.elements.namedItem("passwordConfirm");

    if (!isHTMLInputElement(emailInput) || !isHTMLInputElement(passwordInput)) {
        return;
    }

    const sendCodeButtonNode = document.getElementById("sendCodeButton");
    const repeatCodeButtonNode = document.getElementById("repeatCodeButton");
    const codeRowNode = document.getElementById("codeRow");
    const passwordMismatchMessageNode = document.getElementById("passwordMismatchMessage");
    const signUpSubmitButtonNode = document.getElementById("signUpSubmitButton");

    if (
        !isHTMLButtonElement(sendCodeButtonNode) ||
        !isHTMLElement(codeRowNode) ||
        !isHTMLElement(passwordMismatchMessageNode) ||
        !isHTMLButtonElement(signUpSubmitButtonNode)
    ) {
        return;
    }

    const sendCodeButton: HTMLButtonElement = sendCodeButtonNode;
    const repeatCodeButton: HTMLButtonElement | null = isHTMLButtonElement(repeatCodeButtonNode)
        ? repeatCodeButtonNode
        : null;
    const codeRow: HTMLElement = codeRowNode;
    const passwordMismatchMessage: HTMLElement = passwordMismatchMessageNode;
    const signUpSubmitButton: HTMLButtonElement = signUpSubmitButtonNode;

    function syncSignUpUi(): void {
        sendCodeButton.classList.toggle("hidden", !appState.signUp.email.trim());
        codeRow.classList.toggle("hidden", !appState.signUp.codeSent);

        if (isHTMLInputElement(passwordConfirmInput)) {
            passwordConfirmInput.classList.toggle("hidden", !appState.signUp.password);
        }

        passwordMismatchMessage.classList.toggle("hidden", !shouldShowPasswordMismatch());
        signUpSubmitButton.disabled = !canSubmitSignUp();
    }

    emailInput.addEventListener("input", () => {
        const previousEmail = appState.signUp.email;
        appState.signUp.email = emailInput.value;

        if (previousEmail !== appState.signUp.email && appState.signUp.codeSent) {
            appState.signUp.codeSent = false;
            appState.signUp.code = "";
            if (isHTMLInputElement(codeInput)) {
                codeInput.value = "";
            }
        }

        syncSignUpUi();
    });

    sendCodeButton.addEventListener("click", () => {
        appState.signUp.email = emailInput.value;
        if (!appState.signUp.email.trim()) {
            return;
        }

        appState.signUp.codeSent = true;
        syncSignUpUi();
    });

    if (repeatCodeButton) {
        repeatCodeButton.addEventListener("click", () => {
            appState.signUp.email = emailInput.value;
            if (!appState.signUp.email.trim()) {
                return;
            }

            appState.signUp.codeSent = true;
            syncSignUpUi();
        });
    }

    if (isHTMLInputElement(codeInput)) {
        codeInput.addEventListener("input", () => {
            appState.signUp.code = codeInput.value;
            syncSignUpUi();
        });
    }

    passwordInput.addEventListener("input", () => {
        appState.signUp.password = passwordInput.value;
        syncSignUpUi();
    });

    if (isHTMLInputElement(passwordConfirmInput)) {
        passwordConfirmInput.addEventListener("input", () => {
            appState.signUp.passwordConfirm = passwordConfirmInput.value;
            syncSignUpUi();
        });
    }

    syncSignUpUi();
}

document.querySelectorAll<HTMLElement>("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
        const nextView = button.dataset.view as View | undefined;
        if (nextView) {
            setView(nextView);
        }
    });
});

render();

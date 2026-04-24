const appState = {
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

function setView(nextView) {
    appState.view = nextView;
    render();
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function render() {
    if (!homeScreen || !appScreen || !authLayout || !formContent || !promoButton) {
        return;
    }

    const isHome = appState.view === "home";

    homeScreen.classList.toggle("screen-active", isHome);
    appScreen.classList.toggle("screen-active", !isHome);

    if (!isHome) {
        renderAuthView();
    }
}

function renderAuthView() {
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

        const signInForm = document.getElementById("signInForm");
        signInForm.addEventListener("submit", function (event) {
            event.preventDefault();
            appState.signIn.email = signInForm.elements.email.value;
            appState.signIn.password = signInForm.elements.password.value;
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

        const signUpForm = document.getElementById("signUpForm");
        initializeSignUpForm(signUpForm);
        signUpForm.addEventListener("submit", function (event) {
            event.preventDefault();
            if (!canSubmitSignUp()) {
                return;
            }
            appState.signUp.email = signUpForm.elements.email.value;
            appState.signUp.code = signUpForm.elements.code ? signUpForm.elements.code.value : appState.signUp.code;
            appState.signUp.password = signUpForm.elements.password.value;
            appState.signUp.passwordConfirm = signUpForm.elements.passwordConfirm ? signUpForm.elements.passwordConfirm.value : appState.signUp.passwordConfirm;
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

        const recoveryForm = document.getElementById("recoveryForm");
        recoveryForm.addEventListener("submit", function (event) {
            event.preventDefault();
            appState.recovery.email = recoveryForm.elements.email.value;
            appState.recovery.password = recoveryForm.elements.password.value;
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

    formContent.querySelectorAll("[data-view]").forEach(function (button) {
        button.addEventListener("click", function () {
            if (view === "sign-in") {
                const signInForm = document.getElementById("signInForm");
                if (signInForm) {
                    appState.signIn.email = signInForm.elements.email.value;
                    appState.signIn.password = signInForm.elements.password.value;
                }
            }

            if (view === "sign-up") {
                const signUpForm = document.getElementById("signUpForm");
                if (signUpForm) {
                    appState.signUp.email = signUpForm.elements.email.value;
                    appState.signUp.password = signUpForm.elements.password.value;
                }
            }

            if (view === "recovery") {
                const recoveryForm = document.getElementById("recoveryForm");
                if (recoveryForm) {
                    appState.recovery.email = recoveryForm.elements.email.value;
                    appState.recovery.password = recoveryForm.elements.password.value;
                }
            }

            setView(button.dataset.view);
        });
    });
}

function canSubmitSignUp() {
    return Boolean(
        appState.signUp.email.trim() &&
        appState.signUp.codeSent &&
        appState.signUp.code.trim() &&
        appState.signUp.password &&
        appState.signUp.passwordConfirm &&
        appState.signUp.password === appState.signUp.passwordConfirm
    );
}

function shouldShowPasswordMismatch() {
    return Boolean(
        appState.signUp.password &&
        appState.signUp.passwordConfirm &&
        appState.signUp.password !== appState.signUp.passwordConfirm
    );
}

function initializeSignUpForm(signUpForm) {
    const emailInput = signUpForm.elements.email;
    const codeInput = signUpForm.elements.code;
    const passwordInput = signUpForm.elements.password;
    const passwordConfirmInput = signUpForm.elements.passwordConfirm;
    const sendCodeButton = document.getElementById("sendCodeButton");
    const repeatCodeButton = document.getElementById("repeatCodeButton");
    const codeRow = document.getElementById("codeRow");
    const passwordMismatchMessage = document.getElementById("passwordMismatchMessage");
    const signUpSubmitButton = document.getElementById("signUpSubmitButton");

    function syncSignUpUi() {
        sendCodeButton.classList.toggle("hidden", !appState.signUp.email.trim());
        codeRow.classList.toggle("hidden", !appState.signUp.codeSent);
        passwordConfirmInput.classList.toggle("hidden", !appState.signUp.password);
        passwordMismatchMessage.classList.toggle("hidden", !shouldShowPasswordMismatch());
        signUpSubmitButton.disabled = !canSubmitSignUp();
    }

    emailInput.addEventListener("input", function () {
        const previousEmail = appState.signUp.email;
        appState.signUp.email = emailInput.value;

        if (previousEmail !== appState.signUp.email && appState.signUp.codeSent) {
            appState.signUp.codeSent = false;
            appState.signUp.code = "";
            if (codeInput) {
                codeInput.value = "";
            }
        }

        syncSignUpUi();
    });

    if (sendCodeButton) {
        sendCodeButton.addEventListener("click", function () {
            appState.signUp.email = emailInput.value;
            if (!appState.signUp.email.trim()) {
                return;
            }

            appState.signUp.codeSent = true;
            syncSignUpUi();
        });
    }

    if (repeatCodeButton) {
        repeatCodeButton.addEventListener("click", function () {
            appState.signUp.email = emailInput.value;
            if (!appState.signUp.email.trim()) {
                return;
            }

            appState.signUp.codeSent = true;
        });
    }

    if (codeInput) {
        codeInput.addEventListener("input", function () {
            appState.signUp.code = codeInput.value;
            syncSignUpUi();
        });
    }

    passwordInput.addEventListener("input", function () {
        appState.signUp.password = passwordInput.value;
        syncSignUpUi();
    });

    if (passwordConfirmInput) {
        passwordConfirmInput.addEventListener("input", function () {
            appState.signUp.passwordConfirm = passwordConfirmInput.value;
            syncSignUpUi();
        });
    }

    syncSignUpUi();
}

document.querySelectorAll("[data-view]").forEach(function (button) {
    button.addEventListener("click", function () {
        setView(button.dataset.view);
    });
});

render();

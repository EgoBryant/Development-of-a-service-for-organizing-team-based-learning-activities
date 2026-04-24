(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))r(t);new MutationObserver(t=>{for(const a of t)if(a.type==="childList")for(const f of a.addedNodes)f.tagName==="LINK"&&f.rel==="modulepreload"&&r(f)}).observe(document,{childList:!0,subtree:!0});function s(t){const a={};return t.integrity&&(a.integrity=t.integrity),t.referrerPolicy&&(a.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?a.credentials="include":t.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function r(t){if(t.ep)return;t.ep=!0;const a=s(t);fetch(t.href,a)}})();const e={view:"home",signIn:{email:"",password:""},signUp:{email:"",code:"",codeSent:!1,password:"",passwordConfirm:""},recovery:{email:"",password:""}},C=document.getElementById("homeScreen"),M=document.getElementById("appScreen"),h=document.getElementById("authLayout"),l=document.getElementById("formContent"),d=document.getElementById("promoButton");function p(n){return n instanceof HTMLElement}function g(n){return n instanceof HTMLInputElement}function w(n){return n instanceof HTMLButtonElement}function v(n){return n instanceof HTMLFormElement}function y(n,o){const s=document.querySelector(n);if(!o(s))throw new Error(`Required element not found: ${n}`);return s}function i(n){return g(n)?n.value:""}function c(n){e.view=n,S()}function m(n){return n.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function S(){if(!p(C)||!p(M)||!p(h)||!p(l)||!w(d))return;const n=e.view==="home";C.classList.toggle("screen-active",n),M.classList.toggle("screen-active",!n),n||x()}function x(){if(!p(h)||!p(l)||!w(d))return;const n=e.view,o=n==="sign-up"||n==="sign-up-confirm";if(h.classList.toggle("layout-reverse",o),n==="sign-in"){d.textContent="РЕГИСТРАЦИЯ",d.onclick=()=>c("sign-up"),l.innerHTML=`
            <form id="signInForm" class="auth-form">
                <h1>ВХОД</h1>
                <input name="email" type="email" placeholder="ЭЛЕКТРОННАЯ ПОЧТА" value="${m(e.signIn.email)}" required>
                <input name="password" type="password" placeholder="ПАРОЛЬ" value="${m(e.signIn.password)}" required>
                <button class="text-link text-link-left" type="button" data-view="recovery">Забыли пароль? Восстановить</button>
                <button class="primary-button form-button" type="submit">ПРИСОЕДИНИТЬСЯ</button>
                <button class="text-link" type="button" data-view="sign-up">Зарегистрироваться, если нет аккаунта</button>
            </form>
        `;const s=y("#signInForm",v);s.addEventListener("submit",r=>{r.preventDefault(),e.signIn.email=i(s.elements.namedItem("email")),e.signIn.password=i(s.elements.namedItem("password")),c("sign-in-confirm")})}if(n==="sign-up"){d.textContent="ВХОД",d.onclick=()=>c("sign-in"),l.innerHTML=`
            <form id="signUpForm" class="auth-form">
                <h1>РЕГИСТРАЦИЯ</h1>
                <input name="email" type="email" placeholder="ЭЛЕКТРОННАЯ ПОЧТА" value="${m(e.signUp.email)}" required>
                <button class="secondary-action ${e.signUp.email.trim()?"":"hidden"}" id="sendCodeButton" type="button">ОТПРАВИТЬ КОД НА ПОЧТУ</button>
                <div class="code-row ${e.signUp.codeSent?"":"hidden"}" id="codeRow">
                    <input name="code" type="text" placeholder="ПОДТВЕРЖДЕНИЕ" value="${m(e.signUp.code)}">
                    <button class="inline-button" id="repeatCodeButton" type="button">ПОВТОРИТЬ</button>
                </div>
                <input name="password" type="password" placeholder="ПАРОЛЬ" value="${m(e.signUp.password)}" required>
                <input class="${e.signUp.password?"":"hidden"}" id="passwordConfirmInput" name="passwordConfirm" type="password" placeholder="ПОДТВЕРЖДЕНИЕ" value="${m(e.signUp.passwordConfirm)}" required>
                <p id="passwordMismatchMessage" class="field-error ${F()?"":"hidden"}">Пароли должны совпадать.</p>
                <button class="primary-button form-button" id="signUpSubmitButton" type="submit" ${I()?"":"disabled"}>ПРИСОЕДИНИТЬСЯ</button>
            </form>
        `;const s=y("#signUpForm",v);N(s),s.addEventListener("submit",r=>{r.preventDefault(),I()&&(e.signUp.email=i(s.elements.namedItem("email")),e.signUp.code=i(s.elements.namedItem("code")),e.signUp.password=i(s.elements.namedItem("password")),e.signUp.passwordConfirm=i(s.elements.namedItem("passwordConfirm")),c("sign-up-confirm"))})}if(n==="recovery"){d.textContent="РЕГИСТРАЦИЯ",d.onclick=()=>c("sign-up"),l.innerHTML=`
            <form id="recoveryForm" class="auth-form">
                <h1>ВХОД</h1>
                <input name="email" type="email" placeholder="ЭЛЕКТРОННАЯ ПОЧТА" value="${m(e.recovery.email)}" required>
                <div class="password-row">
                    <input name="password" type="password" placeholder="ПАРОЛЬ" value="${m(e.recovery.password)}" required>
                    <button class="inline-button" type="submit">ВОССТАНОВИТЬ</button>
                </div>
                <button class="primary-button form-button" type="button" data-view="sign-in-confirm">ПРИСОЕДИНИТЬСЯ</button>
            </form>
        `;const s=y("#recoveryForm",v);s.addEventListener("submit",r=>{r.preventDefault(),e.recovery.email=i(s.elements.namedItem("email")),e.recovery.password=i(s.elements.namedItem("password")),e.signIn.email=e.recovery.email,e.signIn.password=e.recovery.password,c("sign-in")})}n==="sign-in-confirm"&&(d.textContent="РЕГИСТРАЦИЯ",d.onclick=()=>c("sign-up"),l.innerHTML=`
            <div class="auth-form">
                <h1>ПОДТВЕРЖДЕНИЕ</h1>
                <input type="email" value="${m(e.signIn.email)}" placeholder="ЭЛЕКТРОННАЯ ПОЧТА" readonly>
                <input type="text" value="${m(e.signIn.password)}" placeholder="ПАРОЛЬ" readonly>
                <p class="confirm-message">Введённые поля сохранены после перехода внутри одной страницы.</p>
                <button class="primary-button form-button" type="button" data-view="home">ПЕРЕЙТИ В МЕНЮ</button>
            </div>
        `),n==="sign-up-confirm"&&(d.textContent="ВХОД",d.onclick=()=>c("sign-in"),l.innerHTML=`
            <div class="auth-form">
                <h1>РЕГИСТРАЦИЯ</h1>
                <p class="confirm-message">Регистрация почти завершена. Проверьте почту и подтвердите аккаунт.</p>
                <button class="primary-button form-button" type="button" data-view="sign-in">ПЕРЕЙТИ КО ВХОДУ</button>
            </div>
        `),l.querySelectorAll("[data-view]").forEach(s=>{s.addEventListener("click",()=>{if(n==="sign-in"){const t=document.getElementById("signInForm");t instanceof HTMLFormElement&&(e.signIn.email=i(t.elements.namedItem("email")),e.signIn.password=i(t.elements.namedItem("password")))}if(n==="sign-up"){const t=document.getElementById("signUpForm");t instanceof HTMLFormElement&&(e.signUp.email=i(t.elements.namedItem("email")),e.signUp.code=i(t.elements.namedItem("code")),e.signUp.password=i(t.elements.namedItem("password")),e.signUp.passwordConfirm=i(t.elements.namedItem("passwordConfirm")))}if(n==="recovery"){const t=document.getElementById("recoveryForm");t instanceof HTMLFormElement&&(e.recovery.email=i(t.elements.namedItem("email")),e.recovery.password=i(t.elements.namedItem("password")))}const r=s.dataset.view;r&&c(r)})})}function I(){return!!(e.signUp.email.trim()&&e.signUp.codeSent&&e.signUp.code.trim()&&e.signUp.password&&e.signUp.passwordConfirm&&e.signUp.password===e.signUp.passwordConfirm)}function F(){return!!(e.signUp.password&&e.signUp.passwordConfirm&&e.signUp.password!==e.signUp.passwordConfirm)}function N(n){const o=n.elements.namedItem("email"),s=n.elements.namedItem("code"),r=n.elements.namedItem("password"),t=n.elements.namedItem("passwordConfirm");if(!g(o)||!g(r))return;const a=document.getElementById("sendCodeButton"),f=document.getElementById("repeatCodeButton"),U=document.getElementById("codeRow"),b=document.getElementById("passwordMismatchMessage"),E=document.getElementById("signUpSubmitButton");if(!w(a)||!p(U)||!p(b)||!w(E))return;const L=a,B=w(f)?f:null,H=U,T=b,$=E;function u(){L.classList.toggle("hidden",!e.signUp.email.trim()),H.classList.toggle("hidden",!e.signUp.codeSent),g(t)&&t.classList.toggle("hidden",!e.signUp.password),T.classList.toggle("hidden",!F()),$.disabled=!I()}o.addEventListener("input",()=>{const q=e.signUp.email;e.signUp.email=o.value,q!==e.signUp.email&&e.signUp.codeSent&&(e.signUp.codeSent=!1,e.signUp.code="",g(s)&&(s.value="")),u()}),L.addEventListener("click",()=>{e.signUp.email=o.value,e.signUp.email.trim()&&(e.signUp.codeSent=!0,u())}),B&&B.addEventListener("click",()=>{e.signUp.email=o.value,e.signUp.email.trim()&&(e.signUp.codeSent=!0,u())}),g(s)&&s.addEventListener("input",()=>{e.signUp.code=s.value,u()}),r.addEventListener("input",()=>{e.signUp.password=r.value,u()}),g(t)&&t.addEventListener("input",()=>{e.signUp.passwordConfirm=t.value,u()}),u()}document.querySelectorAll("[data-view]").forEach(n=>{n.addEventListener("click",()=>{const o=n.dataset.view;o&&c(o)})});S();

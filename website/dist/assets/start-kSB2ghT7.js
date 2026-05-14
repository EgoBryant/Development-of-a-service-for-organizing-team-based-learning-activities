(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))l(i);new MutationObserver(i=>{for(const r of i)if(r.type==="childList")for(const m of r.addedNodes)m.tagName==="LINK"&&m.rel==="modulepreload"&&l(m)}).observe(document,{childList:!0,subtree:!0});function a(i){const r={};return i.integrity&&(r.integrity=i.integrity),i.referrerPolicy&&(r.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?r.credentials="include":i.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function l(i){if(i.ep)return;i.ep=!0;const r=a(i);fetch(i.href,r)}})();const A="team-exam-auth",ie="",e={view:"home",signIn:{email:"",password:""},signUp:{email:"",confirmationCode:"",password:"",passwordConfirm:""},profile:null,profileEdits:null,profileModal:"none",profileAchievementTitle:"",profileCreateTeamName:"",profileInviteLink:"",profileFormDraft:null,statusMessage:"",statusTone:"default",isSubmitting:!1},_=document.getElementById("homeScreen"),M=document.getElementById("appScreen"),q=document.getElementById("profileShell"),n=document.getElementById("profileMount"),$=document.getElementById("authLayout"),P=document.getElementById("authModalCard"),B=document.getElementById("authSwitchColumn"),C=document.getElementById("formContent");ae();function f(t){return t instanceof HTMLElement}function v(t){return t instanceof HTMLInputElement}function u(t){return t instanceof HTMLButtonElement}function K(t){return t instanceof HTMLFormElement}function Y(t,o){const a=document.querySelector(t);if(!o(a))throw new Error(`Required element not found: ${t}`);return a}function y(t){return v(t)?t.value:""}function D(t){e.view=t,d()}function s(t,o="default"){e.statusMessage=t,e.statusTone=o}function Q(){e.statusMessage="",e.statusTone="default"}async function ae(){const t=ve();if(d(),!!t){e.isSubmitting=!0,e.view="sign-in",s("Восстанавливаем сессию..."),d();try{e.profile=await S("/api/auth/me",{headers:{Authorization:`Bearer ${t.token}`}}),e.view="account",s("Сессия восстановлена.")}catch(o){oe(),s(F(o),"error"),e.view="sign-in"}finally{e.isSubmitting=!1,d()}}}function d(){if(!f(_)||!f(M)||!f($)||!f(P)||!f(B)||!f(C))return;const t=e.view==="home",o=e.view==="account";_.classList.add("screen-active"),M.classList.toggle("screen-active",!t),M.setAttribute("aria-hidden",String(t)),document.body.classList.toggle("modal-open",!t),f(q)&&f(n)&&(q.classList.toggle("hidden",!o),q.setAttribute("aria-hidden",String(!o)),$.classList.toggle("hidden",o)),t||(o?pe():ne())}function ne(){if(!(!f($)||!f(P)||!f(B)||!f(C))){if(P.classList.toggle("mode-sign-up",e.view==="sign-up"),e.view==="sign-in"){B.innerHTML=`
            <button type="button" class="auth-switch-pill" data-view="sign-up">РЕГИСТРАЦИЯ</button>
        `,C.innerHTML=`
            <form id="signInForm" class="auth-form auth-form-modal">
                <h1 class="auth-modal-heading">ВХОД</h1>
                ${Z()}
                <input class="auth-modal-field" name="email" type="email" placeholder="ЭЛЕКТРОННАЯ ПОЧТА" value="${c(e.signIn.email)}" required>
                <div class="auth-login-password-row">
                    <input class="auth-modal-field auth-modal-field-password" name="password" type="password" placeholder="ПАРОЛЬ" value="${c(e.signIn.password)}" required>
                    <button class="auth-inline-pill" type="button" id="signInRestoreButton">ВОССТАНОВИТЬ</button>
                </div>
                <button class="auth-submit-pill" type="submit" ${e.isSubmitting?"disabled":""}>
                    ${e.isSubmitting?"ПОДКЛЮЧЕНИЕ...":"ПРИСОЕДИНИТЬСЯ"}
                </button>
            </form>
        `;const t=Y("#signInForm",K),o=t.querySelector("#signInRestoreButton");u(o)&&o.addEventListener("click",()=>{s("Восстановление пароля скоро будет доступно."),I()});const a=t.elements.namedItem("password");v(a)&&a.addEventListener("input",()=>{e.signIn.password=a.value});const l=t.elements.namedItem("email");v(l)&&l.addEventListener("input",()=>{e.signIn.email=l.value}),t.addEventListener("submit",i=>{i.preventDefault(),fe(t)})}e.view==="sign-up"&&(B.innerHTML=`
            <button type="button" class="auth-switch-pill" data-view="sign-in">ВХОД</button>
        `,C.innerHTML=`
            <form id="signUpForm" class="auth-form auth-form-modal">
                <h1 class="auth-modal-heading">РЕГИСТРАЦИЯ</h1>
                ${Z()}
                <input class="auth-modal-field" name="email" type="email" placeholder="ЭЛЕКТРОННАЯ ПОЧТА" value="${c(e.signUp.email)}" required>
                <div class="auth-confirm-row">
                    <input class="auth-modal-field auth-modal-field-confirm" name="confirmationCode" type="text" placeholder="ПОДТВЕРЖДЕНИЕ" value="${c(e.signUp.confirmationCode)}" autocomplete="one-time-code">
                    <button class="auth-inline-pill" type="button" id="repeatCodeButton">ПОВТОРИТЬ</button>
                </div>
                <input class="auth-modal-field" name="password" type="password" placeholder="ПАРОЛЬ" value="${c(e.signUp.password)}" required>
                <input class="auth-modal-field" name="passwordConfirm" type="password" placeholder="ПОДТВЕРЖДЕНИЕ" value="${c(e.signUp.passwordConfirm)}" required>
                <button class="auth-submit-pill" type="submit" ${e.isSubmitting?"disabled":""}>
                    ${e.isSubmitting?"СОЗДАНИЕ...":"ПРИСОЕДИНИТЬСЯ"}
                </button>
            </form>
        `,le(Y("#signUpForm",K))),$.querySelectorAll("[data-view]").forEach(t=>{t.addEventListener("click",()=>{const o=t.dataset.view;o&&(Q(),D(o))})})}}function le(t){const o=t.elements.namedItem("email"),a=t.elements.namedItem("confirmationCode"),l=t.elements.namedItem("password"),i=t.elements.namedItem("passwordConfirm"),r=t.querySelector("#repeatCodeButton");!v(o)||!v(l)||!v(i)||(o.addEventListener("input",()=>{e.signUp.email=o.value}),v(a)&&a.addEventListener("input",()=>{e.signUp.confirmationCode=a.value}),l.addEventListener("input",()=>{e.signUp.password=l.value}),i.addEventListener("input",()=>{e.signUp.passwordConfirm=i.value}),u(r)&&r.addEventListener("click",()=>{if(e.signUp.email=o.value.trim(),!e.signUp.email){s("Сначала укажите электронную почту.","error"),I();return}s(`Код отправлен на ${e.signUp.email} (демо).`),I()}),t.addEventListener("submit",m=>{m.preventDefault(),me(t)}))}function re(t){return t&&([t.firstName,t.lastName].filter(Boolean).join(" ").trim()||t.nickname||t.userName)||""}function W(){var o,a,l;return((a=(o=e.profileEdits)==null?void 0:o.fullName)==null?void 0:a.trim())?((l=e.profileEdits)==null?void 0:l.fullName)??"":re(e.profile)}function X(){var t,o;return((t=e.profileEdits)==null?void 0:t.group)??((o=e.profile)==null?void 0:o.groupTitle)??""}function ee(){var t,o;return((t=e.profileEdits)==null?void 0:t.avatarDataUrl)??((o=e.profile)==null?void 0:o.avatarUrl)??""}function se(){e.profileEdits=null,e.profileModal="none",e.profileAchievementTitle="",e.profileCreateTeamName="",e.profileInviteLink="",e.profileFormDraft=null}function U(t){e.profileModal=t,t==="personal"&&(e.profileFormDraft={fullName:W(),group:X(),avatarDataUrl:ee()||null}),d()}function h(){e.profileModal="none",e.profileFormDraft=null,d()}function ce(){return Array.from({length:8},(o,a)=>a).map(o=>`
        <button type="button" class="profile-achievement-item" data-achievement-index="${o}">
            <span class="profile-achievement-circle"></span>
            <span class="profile-achievement-caption">НАЗВАНИЕ</span>
        </button>`).join("")}function de(){const t=e.profileFormDraft;switch(e.profileModal){case"personal":return t?`
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
                        <input id="profileNameInput" class="profile-modal-input" type="text" placeholder="ИМЯ ФАМИЛИЯ" value="${c(t.fullName)}">
                        <input id="profileGroupInput" class="profile-modal-input" type="text" placeholder="АКАДЕМ. ГРУППА" value="${c(t.group)}">
                        <button type="button" class="profile-pill-wide" id="profileSavePersonalButton">СОХРАНИТЬ</button>
                        <button type="button" class="profile-modal-text" id="profileOpenPasswordButton">ВОССТАНОВЛЕНИЕ ПАРОЛЯ</button>
                    </div>
                </div>
            `:"";case"password":return`
                <div class="profile-modal" role="dialog" aria-modal="true" aria-label="Восстановление пароля">
                    <div class="profile-modal-backdrop" data-close-modal="1"></div>
                    <div class="profile-modal-card">
                        <h2 class="profile-modal-title">ВОССТАНОВЛЕНИЕ ПАРОЛЯ</h2>
                        <input id="profileNewPasswordInput" class="profile-modal-input" type="password" placeholder="НОВЫЙ ПАРОЛЬ">
                        <input id="profileConfirmPasswordInput" class="profile-modal-input" type="password" placeholder="ПОДТВЕРЖДЕНИЕ">
                        <button type="button" class="profile-pill-wide" id="profileSavePasswordButton">СОХРАНИТЬ</button>
                    </div>
                </div>
            `;case"noTeam":return`
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
            `;case"createTeam":return`
                <div class="profile-modal" role="dialog" aria-modal="true" aria-label="Создание команды">
                    <div class="profile-modal-backdrop" data-close-modal="1"></div>
                    <div class="profile-modal-card">
                        <h2 class="profile-modal-title">СОЗДАНИЕ КОМАНДЫ</h2>
                        <input id="profileTeamNameInput" class="profile-modal-input" type="text" placeholder="НАЗВАНИЕ" value="${c(e.profileCreateTeamName)}">
                        <div class="profile-modal-stack">
                            <button type="button" class="profile-pill-wide" id="profileConfirmCreateTeamButton">СОЗДАТЬ</button>
                            <button type="button" class="profile-pill-wide profile-pill-outline" id="profileBackFromCreateTeamButton">НАЗАД</button>
                        </div>
                    </div>
                </div>
            `;case"teamSuccess":return`
                <div class="profile-modal" role="dialog" aria-modal="true" aria-label="Команда создана">
                    <div class="profile-modal-backdrop" data-close-modal="1"></div>
                    <div class="profile-modal-card profile-modal-card-success">
                        <button type="button" class="profile-modal-dot" id="profileCloseSuccessButton" aria-label="Закрыть"></button>
                        <h2 class="profile-modal-title">УСПЕШНО!</h2>
                        <div class="profile-link-row">
                            <div class="profile-link-field">ССЫЛКА</div>
                            <button type="button" class="profile-link-copy" id="profileCopyInviteButton">СКОПИРОВАТЬ</button>
                        </div>
                        <div class="profile-success-placeholder" aria-hidden="true"></div>
                        <button type="button" class="profile-pill-wide" id="profileSuccessGoButton">ПЕРЕЙТИ</button>
                    </div>
                </div>
            `;case"achievement":return`
                <div class="profile-modal" role="dialog" aria-modal="true" aria-label="Достижение">
                    <div class="profile-modal-backdrop" data-close-modal="1"></div>
                    <div class="profile-modal-card profile-modal-card-achievement">
                        <button type="button" class="profile-modal-dot" id="profileCloseAchievementButton" aria-label="Закрыть"></button>
                        <div class="profile-achievement-hero"></div>
                        <p class="profile-achievement-name">${c(e.profileAchievementTitle||"НАЗВАНИЕ")}</p>
                        <div class="profile-achievement-body"></div>
                        <div class="profile-achievement-meta">
                            <span class="profile-achievement-meta-label">БАЛЛЫ</span>
                            <span class="profile-achievement-meta-value"></span>
                        </div>
                    </div>
                </div>
            `;default:return""}}function pe(){var w;if(!f(n))return;const t=e.profile,o="ЛИГА",a=String((t==null?void 0:t.teamScore)??0),l="РЕЙТИНГ",i="—",r="—",m=W(),L=X(),E=(((w=t==null?void 0:t.teamName)==null?void 0:w.trim())??"")||"КОМАНДА",T=e.statusMessage?`<p class="profile-inline-status ${e.statusTone==="error"?"is-error":""}">${c(e.statusMessage)}</p>`:"";n.innerHTML=`
        <div class="profile-app">
            <aside class="profile-sidebar" aria-label="Разделы">
                <nav class="profile-nav-top">
                    <button type="button" class="profile-nav-button is-active" data-nav="profile">ПРОФИЛЬ</button>
                    <button type="button" class="profile-nav-button" data-nav="team">КОМАНДА</button>
                    <button type="button" class="profile-nav-button" data-nav="rating">РЕЙТИНГ</button>
                    <button type="button" class="profile-nav-button" data-nav="events">СОБЫТИЯ</button>
                    <button type="button" class="profile-nav-button" data-nav="news">НОВОСТИ</button>
                </nav>
                <nav class="profile-nav-bottom">
                    <button type="button" class="profile-nav-button" id="profileSettingsButton">НАСТРОЙКИ</button>
                    <button type="button" class="profile-nav-button" id="profileLogoutButton">ПОКИНУТЬ</button>
                </nav>
            </aside>
            <section class="profile-main">
                ${T}
                <div class="profile-top">
                    <div class="profile-photo-col">
                        <div class="profile-photo"></div>
                        <div class="profile-name-pill">${c(m||"ИМЯ ФАМИЛИЯ")}</div>
                    </div>
                    <div class="profile-stats-col">
                        <div class="profile-stat-row">
                            <span class="profile-chip profile-chip-muted">${o}</span>
                            <span class="profile-value-pill">${c(r)}</span>
                        </div>
                        <div class="profile-stat-row">
                            <span class="profile-chip profile-chip-muted">БАЛЛЫ</span>
                            <span class="profile-value-pill">${c(a)}</span>
                        </div>
                        <div class="profile-stat-row">
                            <span class="profile-chip profile-chip-accent">${l}</span>
                            <span class="profile-value-pill">${c(i)}</span>
                        </div>
                    </div>
                </div>
                <div class="profile-pills-row">
                    <div class="profile-info-pill">${c(m||"ИМЯ ФАМИЛИЯ")}</div>
                    <div class="profile-info-pill">${c(L||"АКАДЕМ. ГРУППА")}</div>
                    <button type="button" class="profile-info-pill profile-info-pill-accent" id="profileTeamPillButton">${c(E)}</button>
                </div>
                <div class="profile-achievements">
                    <h3 class="profile-achievements-title">ДОСТИЖЕНИЯ</h3>
                    <div class="profile-achievements-scroll">
                        ${ce()}
                    </div>
                </div>
            </section>
        </div>
        ${de()}
    `,ue()}function ue(){if(!f(n))return;const t=n.querySelector(".profile-photo");if(t instanceof HTMLElement){const p=ee();p?(t.classList.add("has-image"),t.style.backgroundImage=`url(${JSON.stringify(p)})`):(t.classList.remove("has-image"),t.style.removeProperty("background-image"))}const o=n.querySelector("#profileLogoutButton");u(o)&&o.addEventListener("click",()=>{oe(),e.profile=null,se(),e.signIn.password="",s("Сессия завершена."),D("sign-in")});const a=n.querySelector("#profileSettingsButton");u(a)&&a.addEventListener("click",()=>{U("personal")});const l=n.querySelector("#profileTeamPillButton");u(l)&&l.addEventListener("click",()=>{var g,b;if(!!((g=e.profile)!=null&&g.teamId)){s(`Команда: ${((b=e.profile)==null?void 0:b.teamName)??""}`.trim()),d();return}U("noTeam")}),n.querySelectorAll(".profile-achievement-item").forEach(p=>{p.addEventListener("click",()=>{e.profileAchievementTitle="НАЗВАНИЕ",U("achievement")})}),n.querySelectorAll("[data-close-modal]").forEach(p=>{p.addEventListener("click",()=>{h()})});const i=n.querySelector("#profileNameInput");v(i)&&e.profileFormDraft&&i.addEventListener("input",()=>{e.profileFormDraft.fullName=i.value});const r=n.querySelector("#profileGroupInput");v(r)&&e.profileFormDraft&&r.addEventListener("input",()=>{e.profileFormDraft.group=r.value});const m=n.querySelector("#profileAvatarInput");v(m)&&e.profileFormDraft&&m.addEventListener("change",()=>{var b;const p=(b=m.files)==null?void 0:b[0];if(!p)return;const g=new FileReader;g.onload=()=>{typeof g.result=="string"&&e.profileFormDraft&&(e.profileFormDraft.avatarDataUrl=g.result,d())},g.readAsDataURL(p)});const L=n.querySelector("#profileSavePersonalButton");u(L)&&e.profileFormDraft&&L.addEventListener("click",()=>{const p=e.profileFormDraft;p&&(e.profileEdits={fullName:p.fullName,group:p.group,avatarDataUrl:p.avatarDataUrl},s("Личные данные сохранены."),h())});const k=n.querySelector("#profileOpenPasswordButton");u(k)&&k.addEventListener("click",()=>{e.profileModal="password",e.profileFormDraft=null,d()});const E=n.querySelector("#profileSavePasswordButton");u(E)&&E.addEventListener("click",()=>{s("Пароль обновлён (демо)."),h()});const T=n.querySelector("#profileCloseNoTeamButton");u(T)&&T.addEventListener("click",()=>{h()});const w=n.querySelector("#profileFindTeamButton");u(w)&&w.addEventListener("click",()=>{s("Поиск команды скоро будет доступен."),h()});const H=n.querySelector("#profileOpenCreateTeamButton");u(H)&&H.addEventListener("click",()=>{e.profileCreateTeamName="",e.profileModal="createTeam",d()});const N=n.querySelector("#profileTeamNameInput");v(N)&&N.addEventListener("input",()=>{e.profileCreateTeamName=N.value});const O=n.querySelector("#profileConfirmCreateTeamButton");u(O)&&O.addEventListener("click",()=>{var z,J;const p=e.profileCreateTeamName.trim()||"КОМАНДА",g=((J=(z=e.profile)==null?void 0:z.teamInviteCode)==null?void 0:J.trim())||"DEMO-INVITE",b=`${window.location.origin}/team/${encodeURIComponent(p)}?invite=${encodeURIComponent(g)}`;e.profileInviteLink=b,e.profileModal="teamSuccess",d()});const x=n.querySelector("#profileBackFromCreateTeamButton");u(x)&&x.addEventListener("click",()=>{e.profileModal="noTeam",d()});const V=n.querySelector("#profileCopyInviteButton");u(V)&&V.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(e.profileInviteLink),s("Ссылка скопирована.")}catch{s("Не удалось скопировать ссылку.","error")}d()});const R=n.querySelector("#profileCloseSuccessButton");u(R)&&R.addEventListener("click",()=>{h()});const G=n.querySelector("#profileSuccessGoButton");u(G)&&G.addEventListener("click",()=>{h()});const j=n.querySelector("#profileCloseAchievementButton");u(j)&&j.addEventListener("click",()=>{h()})}async function fe(t){e.signIn.email=y(t.elements.namedItem("email")).trim(),e.signIn.password=y(t.elements.namedItem("password")),e.isSubmitting=!0,s("Подключаемся к серверу..."),d();try{const o=await S("/api/auth/login",{method:"POST",body:JSON.stringify({email:e.signIn.email,password:e.signIn.password})});te(o),e.profile=await S("/api/auth/me",{headers:{Authorization:`Bearer ${o.token}`}}),e.signIn.password="",e.view="account",s("Вход выполнен.")}catch(o){s(F(o),"error")}finally{e.isSubmitting=!1,d()}}async function me(t){if(e.signUp.email=y(t.elements.namedItem("email")).trim(),e.signUp.confirmationCode=y(t.elements.namedItem("confirmationCode")).trim(),e.signUp.password=y(t.elements.namedItem("password")),e.signUp.passwordConfirm=y(t.elements.namedItem("passwordConfirm")),!e.signUp.email||!e.signUp.password){s("Заполните email и пароль.","error"),I();return}if(e.signUp.password!==e.signUp.passwordConfirm){s("Пароли не совпадают.","error"),I();return}e.isSubmitting=!0,s("Создаём аккаунт..."),d();try{const o=await S("/api/auth/register",{method:"POST",body:JSON.stringify({userName:ge(e.signUp.email),email:e.signUp.email,password:e.signUp.password})});te(o),e.profile=await S("/api/auth/me",{headers:{Authorization:`Bearer ${o.token}`}}),e.view="account",e.signUp.password="",e.signUp.passwordConfirm="",e.signUp.confirmationCode="",s("Регистрация завершена.")}catch(o){s(F(o),"error")}finally{e.isSubmitting=!1,d()}}async function S(t,o){const a=new Headers(o==null?void 0:o.headers);a.set("Accept","application/json"),o!=null&&o.body&&!a.has("Content-Type")&&a.set("Content-Type","application/json");const l=await fetch(`${ie}${t}`,{...o,headers:a});if(!l.ok){let i=`Ошибка ${l.status}`;try{const r=await l.json();i=r.detail||r.message||r.title||i}catch{i=l.statusText||i}throw new Error(i)}return await l.json()}function te(t){const o={token:t.token,expiresAtUtc:t.expiresAtUtc};localStorage.setItem(A,JSON.stringify(o))}function ve(){const t=localStorage.getItem(A);if(!t)return null;try{const o=JSON.parse(t);return!o.token||!o.expiresAtUtc?null:o}catch{return null}}function oe(){localStorage.removeItem(A)}function ge(t){var a;return(((a=t.split("@")[0])==null?void 0:a.trim())||"student").replace(/[^a-zA-Z0-9._-]/g,"").slice(0,100)||"student"}function I(){const t=document.querySelector(".status-message");if(!(t instanceof HTMLElement)){d();return}t.textContent=e.statusMessage,t.classList.toggle("status-error",e.statusTone==="error"),t.classList.toggle("hidden",!e.statusMessage)}function Z(){const t=e.statusTone==="error"?"status-error":"",o=e.statusMessage?"":"hidden";return`<p class="status-message ${t} ${o}">${c(e.statusMessage)}</p>`}function F(t){return t instanceof Error?t.message:"Не удалось выполнить запрос."}function c(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}document.querySelectorAll("[data-view]").forEach(t=>{t.addEventListener("click",()=>{const o=t.dataset.view;o&&(Q(),D(o))})});d();

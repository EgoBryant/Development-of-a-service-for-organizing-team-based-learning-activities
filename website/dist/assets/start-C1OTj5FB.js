(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))l(i);new MutationObserver(i=>{for(const r of i)if(r.type==="childList")for(const m of r.addedNodes)m.tagName==="LINK"&&m.rel==="modulepreload"&&l(m)}).observe(document,{childList:!0,subtree:!0});function a(i){const r={};return i.integrity&&(r.integrity=i.integrity),i.referrerPolicy&&(r.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?r.credentials="include":i.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function l(i){if(i.ep)return;i.ep=!0;const r=a(i);fetch(i.href,r)}})();const P="team-exam-auth",ae="",e={view:"home",signIn:{email:"",password:""},signUp:{email:"",password:"",passwordConfirm:""},profile:null,profileEdits:null,profileModal:"none",profileAchievementTitle:"",profileCreateTeamName:"",profileInviteLink:"",profileFormDraft:null,statusMessage:"",statusTone:"default",isSubmitting:!1},J=document.getElementById("homeScreen"),M=document.getElementById("appScreen"),q=document.getElementById("profileShell"),n=document.getElementById("profileMount"),N=document.getElementById("authLayout"),A=document.getElementById("authModalCard"),T=document.getElementById("authSwitchColumn"),B=document.getElementById("formContent");ne();function f(t){return t instanceof HTMLElement}function v(t){return t instanceof HTMLInputElement}function u(t){return t instanceof HTMLButtonElement}function K(t){return t instanceof HTMLFormElement}function W(t,o){const a=document.querySelector(t);if(!o(a))throw new Error(`Required element not found: ${t}`);return a}function y(t){return v(t)?t.value:""}function D(t){e.view=t,c()}function s(t,o="default"){e.statusMessage=t,e.statusTone=o}function Q(){e.statusMessage="",e.statusTone="default"}async function ne(){const t=ge();if(c(),!!t){e.isSubmitting=!0,e.view="sign-in",s("Восстанавливаем сессию..."),c();try{e.profile=await S("/api/auth/me",{headers:{Authorization:`Bearer ${t.token}`}}),e.view="account",s("Сессия восстановлена.")}catch(o){ie(),s(F(o),"error"),e.view="sign-in"}finally{e.isSubmitting=!1,c()}}}function c(){if(!f(J)||!f(M)||!f(N)||!f(A)||!f(T)||!f(B))return;const t=e.view==="home",o=e.view==="account";J.classList.add("screen-active"),M.classList.toggle("screen-active",!t),M.setAttribute("aria-hidden",String(t)),document.body.classList.toggle("modal-open",!t),f(q)&&f(n)&&(q.classList.toggle("hidden",!o),q.setAttribute("aria-hidden",String(!o)),N.classList.toggle("hidden",o)),t||(o?ue():le())}function le(){if(!(!f(N)||!f(A)||!f(T)||!f(B))){if(A.classList.toggle("mode-sign-up",e.view==="sign-up"),e.view==="sign-in"){T.innerHTML=`
            <button type="button" class="auth-switch-pill" data-view="sign-up">РЕГИСТРАЦИЯ</button>
        `,B.innerHTML=`
            <form id="signInForm" class="auth-form auth-form-modal">
                <h1 class="auth-modal-heading">ВХОД</h1>
                ${Z()}
                <input class="auth-modal-field" name="email" type="email" placeholder="ЭЛЕКТРОННАЯ ПОЧТА" value="${d(e.signIn.email)}" required>
                <div class="auth-login-password-row">
                    <input class="auth-modal-field auth-modal-field-password" name="password" type="password" placeholder="ПАРОЛЬ" value="${d(e.signIn.password)}" required>
                    <button class="auth-inline-pill" type="button" id="signInRestoreButton">ВОССТАНОВИТЬ</button>
                </div>
                <button class="auth-submit-pill" type="submit" ${e.isSubmitting?"disabled":""}>
                    ${e.isSubmitting?"ПОДКЛЮЧЕНИЕ...":"ПРИСОЕДИНИТЬСЯ"}
                </button>
            </form>
        `;const t=W("#signInForm",K),o=t.querySelector("#signInRestoreButton");u(o)&&o.addEventListener("click",()=>{s("Восстановление пароля скоро будет доступно."),C()});const a=t.elements.namedItem("password");v(a)&&a.addEventListener("input",()=>{e.signIn.password=a.value});const l=t.elements.namedItem("email");v(l)&&l.addEventListener("input",()=>{e.signIn.email=l.value}),t.addEventListener("submit",i=>{i.preventDefault(),me(t)})}e.view==="sign-up"&&(T.innerHTML=`
            <button type="button" class="auth-switch-pill" data-view="sign-in">ВХОД</button>
        `,B.innerHTML=`
            <form id="signUpForm" class="auth-form auth-form-modal">
                <h1 class="auth-modal-heading">РЕГИСТРАЦИЯ</h1>
                ${Z()}
                <input class="auth-modal-field" name="email" type="email" placeholder="ЭЛЕКТРОННАЯ ПОЧТА" value="${d(e.signUp.email)}" required>
                <input class="auth-modal-field" name="password" type="password" placeholder="ПАРОЛЬ" value="${d(e.signUp.password)}" required minlength="6">
                <input class="auth-modal-field" name="passwordConfirm" type="password" placeholder="ПОДТВЕРЖДЕНИЕ ПАРОЛЯ" value="${d(e.signUp.passwordConfirm)}" required minlength="6">
                <button class="auth-submit-pill" type="submit" ${e.isSubmitting?"disabled":""}>
                    ${e.isSubmitting?"СОЗДАНИЕ...":"ПРИСОЕДИНИТЬСЯ"}
                </button>
            </form>
        `,re(W("#signUpForm",K))),N.querySelectorAll("[data-view]").forEach(t=>{t.addEventListener("click",()=>{const o=t.dataset.view;o&&(Q(),D(o))})})}}function re(t){const o=t.elements.namedItem("email"),a=t.elements.namedItem("password"),l=t.elements.namedItem("passwordConfirm");!v(o)||!v(a)||!v(l)||(o.addEventListener("input",()=>{e.signUp.email=o.value}),a.addEventListener("input",()=>{e.signUp.password=a.value}),l.addEventListener("input",()=>{e.signUp.passwordConfirm=l.value}),t.addEventListener("submit",i=>{i.preventDefault(),ve(t)}))}function se(t){return t&&([t.firstName,t.lastName].filter(Boolean).join(" ").trim()||t.nickname||t.userName)||""}function X(){var o,a,l;return((a=(o=e.profileEdits)==null?void 0:o.fullName)==null?void 0:a.trim())?((l=e.profileEdits)==null?void 0:l.fullName)??"":se(e.profile)}function ee(){var t,o;return((t=e.profileEdits)==null?void 0:t.group)??((o=e.profile)==null?void 0:o.groupTitle)??""}function te(){var t,o;return((t=e.profileEdits)==null?void 0:t.avatarDataUrl)??((o=e.profile)==null?void 0:o.avatarUrl)??""}function ce(){e.profileEdits=null,e.profileModal="none",e.profileAchievementTitle="",e.profileCreateTeamName="",e.profileInviteLink="",e.profileFormDraft=null}function U(t){e.profileModal=t,t==="personal"&&(e.profileFormDraft={fullName:X(),group:ee(),avatarDataUrl:te()||null}),c()}function h(){e.profileModal="none",e.profileFormDraft=null,c()}function de(){return Array.from({length:8},(o,a)=>a).map(o=>`
        <button type="button" class="profile-achievement-item" data-achievement-index="${o}">
            <span class="profile-achievement-circle"></span>
            <span class="profile-achievement-caption">НАЗВАНИЕ</span>
        </button>`).join("")}function pe(){const t=e.profileFormDraft;switch(e.profileModal){case"personal":return t?`
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
                        <input id="profileNameInput" class="profile-modal-input" type="text" placeholder="ИМЯ ФАМИЛИЯ" value="${d(t.fullName)}">
                        <input id="profileGroupInput" class="profile-modal-input" type="text" placeholder="АКАДЕМ. ГРУППА" value="${d(t.group)}">
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
                        <input id="profileTeamNameInput" class="profile-modal-input" type="text" placeholder="НАЗВАНИЕ" value="${d(e.profileCreateTeamName)}">
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
                        <p class="profile-achievement-name">${d(e.profileAchievementTitle||"НАЗВАНИЕ")}</p>
                        <div class="profile-achievement-body"></div>
                        <div class="profile-achievement-meta">
                            <span class="profile-achievement-meta-label">БАЛЛЫ</span>
                            <span class="profile-achievement-meta-value"></span>
                        </div>
                    </div>
                </div>
            `;default:return""}}function ue(){var w;if(!f(n))return;const t=e.profile,o="ЛИГА",a=String((t==null?void 0:t.teamScore)??0),l="РЕЙТИНГ",i="—",r="—",m=X(),I=ee(),E=(((w=t==null?void 0:t.teamName)==null?void 0:w.trim())??"")||"КОМАНДА",L=e.statusMessage?`<p class="profile-inline-status ${e.statusTone==="error"?"is-error":""}">${d(e.statusMessage)}</p>`:"";n.innerHTML=`
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
                ${L}
                <div class="profile-top">
                    <div class="profile-photo-col">
                        <div class="profile-photo"></div>
                        <div class="profile-name-pill">${d(m||"ИМЯ ФАМИЛИЯ")}</div>
                    </div>
                    <div class="profile-stats-col">
                        <div class="profile-stat-row">
                            <span class="profile-chip profile-chip-muted">${o}</span>
                            <span class="profile-value-pill">${d(r)}</span>
                        </div>
                        <div class="profile-stat-row">
                            <span class="profile-chip profile-chip-muted">БАЛЛЫ</span>
                            <span class="profile-value-pill">${d(a)}</span>
                        </div>
                        <div class="profile-stat-row">
                            <span class="profile-chip profile-chip-accent">${l}</span>
                            <span class="profile-value-pill">${d(i)}</span>
                        </div>
                    </div>
                </div>
                <div class="profile-pills-row">
                    <div class="profile-info-pill">${d(m||"ИМЯ ФАМИЛИЯ")}</div>
                    <div class="profile-info-pill">${d(I||"АКАДЕМ. ГРУППА")}</div>
                    <button type="button" class="profile-info-pill profile-info-pill-accent" id="profileTeamPillButton">${d(E)}</button>
                </div>
                <div class="profile-achievements">
                    <h3 class="profile-achievements-title">ДОСТИЖЕНИЯ</h3>
                    <div class="profile-achievements-scroll">
                        ${de()}
                    </div>
                </div>
            </section>
        </div>
        ${pe()}
    `,fe()}function fe(){if(!f(n))return;const t=n.querySelector(".profile-photo");if(t instanceof HTMLElement){const p=te();p?(t.classList.add("has-image"),t.style.backgroundImage=`url(${JSON.stringify(p)})`):(t.classList.remove("has-image"),t.style.removeProperty("background-image"))}const o=n.querySelector("#profileLogoutButton");u(o)&&o.addEventListener("click",()=>{ie(),e.profile=null,ce(),e.signIn.password="",s("Сессия завершена."),D("sign-in")});const a=n.querySelector("#profileSettingsButton");u(a)&&a.addEventListener("click",()=>{U("personal")});const l=n.querySelector("#profileTeamPillButton");u(l)&&l.addEventListener("click",()=>{var g,b;if(!!((g=e.profile)!=null&&g.teamId)){s(`Команда: ${((b=e.profile)==null?void 0:b.teamName)??""}`.trim()),c();return}U("noTeam")}),n.querySelectorAll(".profile-achievement-item").forEach(p=>{p.addEventListener("click",()=>{e.profileAchievementTitle="НАЗВАНИЕ",U("achievement")})}),n.querySelectorAll("[data-close-modal]").forEach(p=>{p.addEventListener("click",()=>{h()})});const i=n.querySelector("#profileNameInput");v(i)&&e.profileFormDraft&&i.addEventListener("input",()=>{e.profileFormDraft.fullName=i.value});const r=n.querySelector("#profileGroupInput");v(r)&&e.profileFormDraft&&r.addEventListener("input",()=>{e.profileFormDraft.group=r.value});const m=n.querySelector("#profileAvatarInput");v(m)&&e.profileFormDraft&&m.addEventListener("change",()=>{var b;const p=(b=m.files)==null?void 0:b[0];if(!p)return;const g=new FileReader;g.onload=()=>{typeof g.result=="string"&&e.profileFormDraft&&(e.profileFormDraft.avatarDataUrl=g.result,c())},g.readAsDataURL(p)});const I=n.querySelector("#profileSavePersonalButton");u(I)&&e.profileFormDraft&&I.addEventListener("click",()=>{const p=e.profileFormDraft;p&&(e.profileEdits={fullName:p.fullName,group:p.group,avatarDataUrl:p.avatarDataUrl},s("Личные данные сохранены."),h())});const k=n.querySelector("#profileOpenPasswordButton");u(k)&&k.addEventListener("click",()=>{e.profileModal="password",e.profileFormDraft=null,c()});const E=n.querySelector("#profileSavePasswordButton");u(E)&&E.addEventListener("click",()=>{s("Пароль обновлён (демо)."),h()});const L=n.querySelector("#profileCloseNoTeamButton");u(L)&&L.addEventListener("click",()=>{h()});const w=n.querySelector("#profileFindTeamButton");u(w)&&w.addEventListener("click",()=>{s("Поиск команды скоро будет доступен."),h()});const H=n.querySelector("#profileOpenCreateTeamButton");u(H)&&H.addEventListener("click",()=>{e.profileCreateTeamName="",e.profileModal="createTeam",c()});const $=n.querySelector("#profileTeamNameInput");v($)&&$.addEventListener("input",()=>{e.profileCreateTeamName=$.value});const O=n.querySelector("#profileConfirmCreateTeamButton");u(O)&&O.addEventListener("click",()=>{var j,z;const p=e.profileCreateTeamName.trim()||"КОМАНДА",g=((z=(j=e.profile)==null?void 0:j.teamInviteCode)==null?void 0:z.trim())||"DEMO-INVITE",b=`${window.location.origin}/team/${encodeURIComponent(p)}?invite=${encodeURIComponent(g)}`;e.profileInviteLink=b,e.profileModal="teamSuccess",c()});const x=n.querySelector("#profileBackFromCreateTeamButton");u(x)&&x.addEventListener("click",()=>{e.profileModal="noTeam",c()});const R=n.querySelector("#profileCopyInviteButton");u(R)&&R.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(e.profileInviteLink),s("Ссылка скопирована.")}catch{s("Не удалось скопировать ссылку.","error")}c()});const V=n.querySelector("#profileCloseSuccessButton");u(V)&&V.addEventListener("click",()=>{h()});const G=n.querySelector("#profileSuccessGoButton");u(G)&&G.addEventListener("click",()=>{h()});const _=n.querySelector("#profileCloseAchievementButton");u(_)&&_.addEventListener("click",()=>{h()})}async function me(t){e.signIn.email=y(t.elements.namedItem("email")).trim(),e.signIn.password=y(t.elements.namedItem("password")),e.isSubmitting=!0,s("Подключаемся к серверу..."),c();try{const o=await S("/api/auth/login",{method:"POST",body:JSON.stringify({email:e.signIn.email,password:e.signIn.password})});oe(o),e.profile=await S("/api/auth/me",{headers:{Authorization:`Bearer ${o.token}`}}),e.signIn.password="",e.view="account",s("Вход выполнен.")}catch(o){s(F(o),"error")}finally{e.isSubmitting=!1,c()}}const Y=6;async function ve(t){if(e.signUp.email=y(t.elements.namedItem("email")).trim(),e.signUp.password=y(t.elements.namedItem("password")),e.signUp.passwordConfirm=y(t.elements.namedItem("passwordConfirm")),!e.signUp.email||!e.signUp.password){s("Заполните email и пароль.","error"),C();return}if(e.signUp.password.length<Y){s(`Пароль не короче ${Y} символов (требование сервера).`,"error"),C();return}if(e.signUp.password!==e.signUp.passwordConfirm){s("Пароли не совпадают.","error"),C();return}e.isSubmitting=!0,s("Создаём аккаунт..."),c();try{const o=await S("/api/auth/register",{method:"POST",body:JSON.stringify({userName:he(e.signUp.email),email:e.signUp.email,password:e.signUp.password})});oe(o),e.profile=await S("/api/auth/me",{headers:{Authorization:`Bearer ${o.token}`}}),e.view="account",e.signUp.password="",e.signUp.passwordConfirm="",s("Регистрация завершена.")}catch(o){s(F(o),"error")}finally{e.isSubmitting=!1,c()}}async function S(t,o){const a=new Headers(o==null?void 0:o.headers);a.set("Accept","application/json"),o!=null&&o.body&&!a.has("Content-Type")&&a.set("Content-Type","application/json");const l=await fetch(`${ae}${t}`,{...o,headers:a});if(!l.ok){let i=`Ошибка ${l.status}`;try{const r=await l.json();i=r.detail||r.message||r.title||i}catch{i=l.statusText||i}throw new Error(be(i))}return await l.json()}function oe(t){const o={token:t.token,expiresAtUtc:t.expiresAtUtc};localStorage.setItem(P,JSON.stringify(o))}function ge(){const t=localStorage.getItem(P);if(!t)return null;try{const o=JSON.parse(t);return!o.token||!o.expiresAtUtc?null:o}catch{return null}}function ie(){localStorage.removeItem(P)}function he(t){var a;return(((a=t.split("@")[0])==null?void 0:a.trim())||"student").replace(/[^a-zA-Z0-9._-]/g,"").slice(0,100)||"student"}function C(){const t=document.querySelector(".status-message");if(!(t instanceof HTMLElement)){c();return}t.textContent=e.statusMessage,t.classList.toggle("status-error",e.statusTone==="error"),t.classList.toggle("hidden",!e.statusMessage)}function Z(){const t=e.statusTone==="error"?"status-error":"",o=e.statusMessage?"":"hidden";return`<p class="status-message ${t} ${o}">${d(e.statusMessage)}</p>`}function F(t){return t instanceof Error?t.message:"Не удалось выполнить запрос."}function be(t){return{"User with this email already exists.":"Пользователь с таким email уже зарегистрирован.","Invalid email or password.":"Неверная почта или пароль."}[t]??t}function d(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}document.querySelectorAll("[data-view]").forEach(t=>{t.addEventListener("click",()=>{const o=t.dataset.view;o&&(Q(),D(o))})});c();

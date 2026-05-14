(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))r(a);new MutationObserver(a=>{for(const s of a)if(s.type==="childList")for(const f of s.addedNodes)f.tagName==="LINK"&&f.rel==="modulepreload"&&r(f)}).observe(document,{childList:!0,subtree:!0});function i(a){const s={};return a.integrity&&(s.integrity=a.integrity),a.referrerPolicy&&(s.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?s.credentials="include":a.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function r(a){if(a.ep)return;a.ep=!0;const s=i(a);fetch(a.href,s)}})();const D="team-exam-auth",ie="",e={view:"home",signIn:{email:"",password:""},signUp:{email:"",password:"",passwordConfirm:"",passwordVisible:!1},profile:null,profileEdits:null,profileModal:"none",profileAchievementTitle:"",profileCreateTeamName:"",profileInviteLink:"",profileFormDraft:null,statusMessage:"",statusTone:"default",isSubmitting:!1},K=document.getElementById("homeScreen"),M=document.getElementById("appScreen"),P=document.getElementById("profileShell"),n=document.getElementById("profileMount"),$=document.getElementById("authLayout"),y=document.getElementById("formContent"),A=document.getElementById("promoSignInButton"),F=document.getElementById("promoSignUpButton");ae();function m(t){return t instanceof HTMLElement}function v(t){return t instanceof HTMLInputElement}function l(t){return t instanceof HTMLButtonElement}function Y(t){return t instanceof HTMLFormElement}function k(t,o){const i=document.querySelector(t);if(!o(i))throw new Error(`Required element not found: ${t}`);return i}function S(t){return v(t)?t.value:""}function E(t){e.view=t,p()}function d(t,o="default"){e.statusMessage=t,e.statusTone=o}function C(){e.statusMessage="",e.statusTone="default"}async function ae(){const t=ve();if(p(),!!t){e.isSubmitting=!0,e.view="sign-in",d("Восстанавливаем сессию..."),p();try{e.profile=await I("/api/auth/me",{headers:{Authorization:`Bearer ${t.token}`}}),e.view="account",d("Сессия восстановлена.")}catch(o){oe(),d(x(o),"error"),e.view="sign-in"}finally{e.isSubmitting=!1,p()}}}function p(){if(!m(K)||!m(M)||!m($)||!m(y)||!l(A)||!l(F))return;const t=e.view==="home",o=e.view==="account";K.classList.add("screen-active"),M.classList.toggle("screen-active",!t),M.setAttribute("aria-hidden",String(t)),document.body.classList.toggle("modal-open",!t),m(P)&&m(n)&&(P.classList.toggle("hidden",!o),P.setAttribute("aria-hidden",String(!o)),$.classList.toggle("hidden",o)),t||(o?de():se())}function se(){if(!(!m($)||!m(y))){if($.classList.toggle("mode-sign-up",e.view==="sign-up"),e.view==="sign-in"){y.innerHTML=`
            <form id="signInForm" class="auth-form">
                <h1>ВХОД</h1>
                ${Q()}
                <input name="email" type="email" placeholder="ЭЛЕКТРОННАЯ ПОЧТА" value="${c(e.signIn.email)}" required>
                <div class="password-row auth-password-row">
                    <input name="password" type="password" placeholder="ПАРОЛЬ" value="${c(e.signIn.password)}" required>
                    <button class="icon-button" id="signInPasswordToggle" type="button" aria-label="Показать пароль">◉</button>
                </div>
                <button class="primary-button form-button" type="submit" ${e.isSubmitting?"disabled":""}>
                    ${e.isSubmitting?"ПОДКЛЮЧЕНИЕ...":"ПРИСОЕДИНИТЬСЯ"}
                </button>
                <button class="text-link" type="button" data-view="sign-up">Зарегистрироваться, если нет аккаунта</button>
            </form>
        `;const t=k("#signInForm",Y),o=k("#signInPasswordToggle",l),i=t.elements.namedItem("password");v(i)&&(o.addEventListener("click",()=>{i.type=i.type==="password"?"text":"password"}),i.addEventListener("input",()=>{e.signIn.password=i.value}));const r=t.elements.namedItem("email");v(r)&&r.addEventListener("input",()=>{e.signIn.email=r.value}),t.addEventListener("submit",a=>{a.preventDefault(),fe(t)})}e.view==="sign-up"&&(y.innerHTML=`
            <form id="signUpForm" class="auth-form auth-form-palette">
                <h1>РЕГИСТРАЦИЯ</h1>
                ${Q()}
                <input class="palette-input" name="email" type="email" placeholder="ЭЛЕКТРОННАЯ ПОЧТА" value="${c(e.signUp.email)}" required>
                <div class="password-row auth-password-row palette-password-row">
                    <input class="palette-input" name="password" type="${e.signUp.passwordVisible?"text":"password"}" placeholder="ПАРОЛЬ" value="${c(e.signUp.password)}" required>
                    <button class="icon-button palette-icon-button" id="signUpPasswordToggle" type="button" aria-label="Показать пароль">${e.signUp.passwordVisible?"○":"◉"}</button>
                </div>
                <div class="password-row auth-password-row palette-password-row">
                    <input class="palette-input" name="passwordConfirm" type="${e.signUp.passwordVisible?"text":"password"}" placeholder="ПОДТВЕРЖДЕНИЕ ПАРОЛЯ" value="${c(e.signUp.passwordConfirm)}" required>
                    <span class="password-row-spacer" aria-hidden="true"></span>
                </div>
                <button class="primary-button form-button palette-submit" type="submit" ${e.isSubmitting?"disabled":""}>
                    ${e.isSubmitting?"СОЗДАНИЕ...":"ПРИСОЕДИНИТЬСЯ"}
                </button>
                <button class="text-link" type="button" data-view="sign-in">Уже есть аккаунт? Войти</button>
            </form>
        `,ne(k("#signUpForm",Y))),y.querySelectorAll("[data-view]").forEach(t=>{t.addEventListener("click",()=>{const o=t.dataset.view;o&&(C(),E(o))})})}}function ne(t){const o=t.elements.namedItem("email"),i=t.elements.namedItem("password"),r=t.elements.namedItem("passwordConfirm"),a=k("#signUpPasswordToggle",l);!v(o)||!v(i)||!v(r)||(o.addEventListener("input",()=>{e.signUp.email=o.value}),i.addEventListener("input",()=>{e.signUp.password=i.value}),r.addEventListener("input",()=>{e.signUp.passwordConfirm=r.value}),a.addEventListener("click",()=>{e.signUp.passwordVisible=!e.signUp.passwordVisible;const s=e.signUp.passwordVisible?"text":"password";i.type=s,r.type=s,a.textContent=e.signUp.passwordVisible?"○":"◉"}),t.addEventListener("submit",s=>{s.preventDefault(),me(t)}))}function re(t){return t&&([t.firstName,t.lastName].filter(Boolean).join(" ").trim()||t.nickname||t.userName)||""}function W(){var o,i,r;return((i=(o=e.profileEdits)==null?void 0:o.fullName)==null?void 0:i.trim())?((r=e.profileEdits)==null?void 0:r.fullName)??"":re(e.profile)}function X(){var t,o;return((t=e.profileEdits)==null?void 0:t.group)??((o=e.profile)==null?void 0:o.groupTitle)??""}function ee(){var t,o;return((t=e.profileEdits)==null?void 0:t.avatarDataUrl)??((o=e.profile)==null?void 0:o.avatarUrl)??""}function le(){e.profileEdits=null,e.profileModal="none",e.profileAchievementTitle="",e.profileCreateTeamName="",e.profileInviteLink="",e.profileFormDraft=null}function q(t){e.profileModal=t,t==="personal"&&(e.profileFormDraft={fullName:W(),group:X(),avatarDataUrl:ee()||null}),p()}function b(){e.profileModal="none",e.profileFormDraft=null,p()}function pe(){return Array.from({length:8},(o,i)=>i).map(o=>`
        <button type="button" class="profile-achievement-item" data-achievement-index="${o}">
            <span class="profile-achievement-circle"></span>
            <span class="profile-achievement-caption">НАЗВАНИЕ</span>
        </button>`).join("")}function ce(){const t=e.profileFormDraft;switch(e.profileModal){case"personal":return t?`
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
            `;default:return""}}function de(){var h;if(!m(n))return;const t=e.profile,o="ЛИГА",i=String((t==null?void 0:t.teamScore)??0),r="РЕЙТИНГ",a="—",s="—",f=W(),L=X(),T=(((h=t==null?void 0:t.teamName)==null?void 0:h.trim())??"")||"КОМАНДА",B=e.statusMessage?`<p class="profile-inline-status ${e.statusTone==="error"?"is-error":""}">${c(e.statusMessage)}</p>`:"";n.innerHTML=`
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
                ${B}
                <div class="profile-top">
                    <div class="profile-photo-col">
                        <div class="profile-photo"></div>
                        <div class="profile-name-pill">${c(f||"ИМЯ ФАМИЛИЯ")}</div>
                    </div>
                    <div class="profile-stats-col">
                        <div class="profile-stat-row">
                            <span class="profile-chip profile-chip-muted">${o}</span>
                            <span class="profile-value-pill">${c(s)}</span>
                        </div>
                        <div class="profile-stat-row">
                            <span class="profile-chip profile-chip-muted">БАЛЛЫ</span>
                            <span class="profile-value-pill">${c(i)}</span>
                        </div>
                        <div class="profile-stat-row">
                            <span class="profile-chip profile-chip-accent">${r}</span>
                            <span class="profile-value-pill">${c(a)}</span>
                        </div>
                    </div>
                </div>
                <div class="profile-pills-row">
                    <div class="profile-info-pill">${c(f||"ИМЯ ФАМИЛИЯ")}</div>
                    <div class="profile-info-pill">${c(L||"АКАДЕМ. ГРУППА")}</div>
                    <button type="button" class="profile-info-pill profile-info-pill-accent" id="profileTeamPillButton">${c(T)}</button>
                </div>
                <div class="profile-achievements">
                    <h3 class="profile-achievements-title">ДОСТИЖЕНИЯ</h3>
                    <div class="profile-achievements-scroll">
                        ${pe()}
                    </div>
                </div>
            </section>
        </div>
        ${ce()}
    `,ue()}function ue(){if(!m(n))return;const t=n.querySelector(".profile-photo");if(t instanceof HTMLElement){const u=ee();u?(t.classList.add("has-image"),t.style.backgroundImage=`url(${JSON.stringify(u)})`):(t.classList.remove("has-image"),t.style.removeProperty("background-image"))}const o=n.querySelector("#profileLogoutButton");l(o)&&o.addEventListener("click",()=>{oe(),e.profile=null,le(),e.signIn.password="",d("Сессия завершена."),E("sign-in")});const i=n.querySelector("#profileSettingsButton");l(i)&&i.addEventListener("click",()=>{q("personal")});const r=n.querySelector("#profileTeamPillButton");l(r)&&r.addEventListener("click",()=>{var g,w;if(!!((g=e.profile)!=null&&g.teamId)){d(`Команда: ${((w=e.profile)==null?void 0:w.teamName)??""}`.trim()),p();return}q("noTeam")}),n.querySelectorAll(".profile-achievement-item").forEach(u=>{u.addEventListener("click",()=>{e.profileAchievementTitle="НАЗВАНИЕ",q("achievement")})}),n.querySelectorAll("[data-close-modal]").forEach(u=>{u.addEventListener("click",()=>{b()})});const a=n.querySelector("#profileNameInput");v(a)&&e.profileFormDraft&&a.addEventListener("input",()=>{e.profileFormDraft.fullName=a.value});const s=n.querySelector("#profileGroupInput");v(s)&&e.profileFormDraft&&s.addEventListener("input",()=>{e.profileFormDraft.group=s.value});const f=n.querySelector("#profileAvatarInput");v(f)&&e.profileFormDraft&&f.addEventListener("change",()=>{var w;const u=(w=f.files)==null?void 0:w[0];if(!u)return;const g=new FileReader;g.onload=()=>{typeof g.result=="string"&&e.profileFormDraft&&(e.profileFormDraft.avatarDataUrl=g.result,p())},g.readAsDataURL(u)});const L=n.querySelector("#profileSavePersonalButton");l(L)&&e.profileFormDraft&&L.addEventListener("click",()=>{const u=e.profileFormDraft;u&&(e.profileEdits={fullName:u.fullName,group:u.group,avatarDataUrl:u.avatarDataUrl},d("Личные данные сохранены."),b())});const N=n.querySelector("#profileOpenPasswordButton");l(N)&&N.addEventListener("click",()=>{e.profileModal="password",e.profileFormDraft=null,p()});const T=n.querySelector("#profileSavePasswordButton");l(T)&&T.addEventListener("click",()=>{d("Пароль обновлён (демо)."),b()});const B=n.querySelector("#profileCloseNoTeamButton");l(B)&&B.addEventListener("click",()=>{b()});const h=n.querySelector("#profileFindTeamButton");l(h)&&h.addEventListener("click",()=>{d("Поиск команды скоро будет доступен."),b()});const O=n.querySelector("#profileOpenCreateTeamButton");l(O)&&O.addEventListener("click",()=>{e.profileCreateTeamName="",e.profileModal="createTeam",p()});const U=n.querySelector("#profileTeamNameInput");v(U)&&U.addEventListener("input",()=>{e.profileCreateTeamName=U.value});const V=n.querySelector("#profileConfirmCreateTeamButton");l(V)&&V.addEventListener("click",()=>{var J,_;const u=e.profileCreateTeamName.trim()||"КОМАНДА",g=((_=(J=e.profile)==null?void 0:J.teamInviteCode)==null?void 0:_.trim())||"DEMO-INVITE",w=`${window.location.origin}/team/${encodeURIComponent(u)}?invite=${encodeURIComponent(g)}`;e.profileInviteLink=w,e.profileModal="teamSuccess",p()});const H=n.querySelector("#profileBackFromCreateTeamButton");l(H)&&H.addEventListener("click",()=>{e.profileModal="noTeam",p()});const R=n.querySelector("#profileCopyInviteButton");l(R)&&R.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(e.profileInviteLink),d("Ссылка скопирована.")}catch{d("Не удалось скопировать ссылку.","error")}p()});const G=n.querySelector("#profileCloseSuccessButton");l(G)&&G.addEventListener("click",()=>{b()});const j=n.querySelector("#profileSuccessGoButton");l(j)&&j.addEventListener("click",()=>{b()});const z=n.querySelector("#profileCloseAchievementButton");l(z)&&z.addEventListener("click",()=>{b()})}async function fe(t){e.signIn.email=S(t.elements.namedItem("email")).trim(),e.signIn.password=S(t.elements.namedItem("password")),e.isSubmitting=!0,d("Подключаемся к серверу..."),p();try{const o=await I("/api/auth/login",{method:"POST",body:JSON.stringify({email:e.signIn.email,password:e.signIn.password})});te(o),e.profile=await I("/api/auth/me",{headers:{Authorization:`Bearer ${o.token}`}}),e.signIn.password="",e.view="account",d("Вход выполнен.")}catch(o){d(x(o),"error")}finally{e.isSubmitting=!1,p()}}async function me(t){if(e.signUp.email=S(t.elements.namedItem("email")).trim(),e.signUp.password=S(t.elements.namedItem("password")),e.signUp.passwordConfirm=S(t.elements.namedItem("passwordConfirm")),!e.signUp.email||!e.signUp.password){d("Заполните email и пароль.","error"),Z();return}if(e.signUp.password!==e.signUp.passwordConfirm){d("Пароли не совпадают.","error"),Z();return}e.isSubmitting=!0,d("Создаём аккаунт..."),p();try{const o=await I("/api/auth/register",{method:"POST",body:JSON.stringify({userName:ge(e.signUp.email),email:e.signUp.email,password:e.signUp.password})});te(o),e.profile=await I("/api/auth/me",{headers:{Authorization:`Bearer ${o.token}`}}),e.view="account",e.signUp.password="",e.signUp.passwordConfirm="",d("Регистрация завершена.")}catch(o){d(x(o),"error")}finally{e.isSubmitting=!1,p()}}async function I(t,o){const i=new Headers(o==null?void 0:o.headers);i.set("Accept","application/json"),o!=null&&o.body&&!i.has("Content-Type")&&i.set("Content-Type","application/json");const r=await fetch(`${ie}${t}`,{...o,headers:i});if(!r.ok){let a=`Ошибка ${r.status}`;try{const s=await r.json();a=s.detail||s.message||s.title||a}catch{a=r.statusText||a}throw new Error(a)}return await r.json()}function te(t){const o={token:t.token,expiresAtUtc:t.expiresAtUtc};localStorage.setItem(D,JSON.stringify(o))}function ve(){const t=localStorage.getItem(D);if(!t)return null;try{const o=JSON.parse(t);return!o.token||!o.expiresAtUtc?null:o}catch{return null}}function oe(){localStorage.removeItem(D)}function ge(t){var i;return(((i=t.split("@")[0])==null?void 0:i.trim())||"student").replace(/[^a-zA-Z0-9._-]/g,"").slice(0,100)||"student"}function Z(){const t=document.querySelector(".status-message");if(!(t instanceof HTMLElement)){p();return}t.textContent=e.statusMessage,t.classList.toggle("status-error",e.statusTone==="error"),t.classList.toggle("hidden",!e.statusMessage)}function Q(){const t=e.statusTone==="error"?"status-error":"",o=e.statusMessage?"":"hidden";return`<p class="status-message ${t} ${o}">${c(e.statusMessage)}</p>`}function x(t){return t instanceof Error?t.message:"Не удалось выполнить запрос."}function c(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}l(A)&&A.addEventListener("click",()=>{C(),E("sign-in")});l(F)&&F.addEventListener("click",()=>{C(),E("sign-up")});document.querySelectorAll("[data-view]").forEach(t=>{t.addEventListener("click",()=>{const o=t.dataset.view;o&&(C(),E(o))})});p();

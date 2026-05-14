(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const u of s)if(u.type==="childList")for(const h of u.addedNodes)h.tagName==="LINK"&&h.rel==="modulepreload"&&n(h)}).observe(document,{childList:!0,subtree:!0});function i(s){const u={};return s.integrity&&(u.integrity=s.integrity),s.referrerPolicy&&(u.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?u.credentials="include":s.crossOrigin==="anonymous"?u.credentials="omit":u.credentials="same-origin",u}function n(s){if(s.ep)return;s.ep=!0;const u=i(s);fetch(s.href,u)}})();const x="team-exam-auth",be="",e={view:"home",signIn:{email:"",password:""},signUp:{email:"",password:"",passwordConfirm:""},profile:null,profileEdits:null,profileModal:"none",profileAchievementTitle:"",profileCreateTeamName:"",profileInviteLink:"",profileFormDraft:null,dashboardSection:"profile",teamModal:"none",teamVoteMemberIndex:0,teamRequestsInviteLink:"",statusMessage:"",statusTone:"default",isSubmitting:!1},se=document.getElementById("homeScreen"),F=document.getElementById("appScreen"),H=document.getElementById("profileShell"),o=document.getElementById("profileMount"),P=document.getElementById("authLayout"),O=document.getElementById("authModalCard"),N=document.getElementById("authSwitchColumn"),A=document.getElementById("formContent");he();function f(t){return t instanceof HTMLElement}function b(t){return t instanceof HTMLInputElement}function c(t){return t instanceof HTMLButtonElement}function le(t){return t instanceof HTMLFormElement}function ne(t,a){const i=document.querySelector(t);if(!a(i))throw new Error(`Required element not found: ${t}`);return i}function q(t){return b(t)?t.value:""}function V(t){e.view=t,d()}function r(t,a="default"){e.statusMessage=t,e.statusTone=a}function R(){e.statusMessage="",e.statusTone="default"}async function he(){const t=Ne();if(d(),!!t){e.isSubmitting=!0,e.view="sign-in",r("Восстанавливаем сессию..."),d();try{e.profile=await k("/api/auth/me",{headers:{Authorization:`Bearer ${t.token}`}}),e.view="account",r("Сессия восстановлена.")}catch(a){ve(),r(G(a),"error"),e.view="sign-in"}finally{e.isSubmitting=!1,d()}}}function d(){if(!f(se)||!f(F)||!f(P)||!f(O)||!f(N)||!f(A))return;const t=e.view==="home",a=e.view==="account";se.classList.add("screen-active"),F.classList.toggle("screen-active",!t),F.setAttribute("aria-hidden",String(t)),document.body.classList.toggle("modal-open",!t),f(H)&&f(o)&&(H.classList.toggle("hidden",!a),H.setAttribute("aria-hidden",String(!a)),P.classList.toggle("hidden",a)),t||(a?Be():ge())}function ge(){if(!(!f(P)||!f(O)||!f(N)||!f(A))){if(O.classList.toggle("mode-sign-up",e.view==="sign-up"),e.view==="sign-in"){N.innerHTML=`
            <button type="button" class="auth-switch-pill" data-view="sign-up">РЕГИСТРАЦИЯ</button>
        `,A.innerHTML=`
            <form id="signInForm" class="auth-form auth-form-modal">
                <h1 class="auth-modal-heading">ВХОД</h1>
                ${ce()}
                <input class="auth-modal-field" name="email" type="email" placeholder="ЭЛЕКТРОННАЯ ПОЧТА" value="${p(e.signIn.email)}" required>
                <div class="auth-login-password-row">
                    <input class="auth-modal-field auth-modal-field-password" name="password" type="password" placeholder="ПАРОЛЬ" value="${p(e.signIn.password)}" required>
                    <button class="auth-inline-pill" type="button" id="signInRestoreButton">ВОССТАНОВИТЬ</button>
                </div>
                <button class="auth-submit-pill" type="submit" ${e.isSubmitting?"disabled":""}>
                    ${e.isSubmitting?"ПОДКЛЮЧЕНИЕ...":"ПРИСОЕДИНИТЬСЯ"}
                </button>
            </form>
        `;const t=ne("#signInForm",le),a=t.querySelector("#signInRestoreButton");c(a)&&a.addEventListener("click",()=>{r("Восстановление пароля скоро будет доступно."),U()});const i=t.elements.namedItem("password");b(i)&&i.addEventListener("input",()=>{e.signIn.password=i.value});const n=t.elements.namedItem("email");b(n)&&n.addEventListener("input",()=>{e.signIn.email=n.value}),t.addEventListener("submit",s=>{s.preventDefault(),Me(t)})}e.view==="sign-up"&&(N.innerHTML=`
            <button type="button" class="auth-switch-pill" data-view="sign-in">ВХОД</button>
        `,A.innerHTML=`
            <form id="signUpForm" class="auth-form auth-form-modal">
                <h1 class="auth-modal-heading">РЕГИСТРАЦИЯ</h1>
                ${ce()}
                <input class="auth-modal-field" name="email" type="email" placeholder="ЭЛЕКТРОННАЯ ПОЧТА" value="${p(e.signUp.email)}" required>
                <input class="auth-modal-field" name="password" type="password" placeholder="ПАРОЛЬ" value="${p(e.signUp.password)}" required minlength="6">
                <input class="auth-modal-field" name="passwordConfirm" type="password" placeholder="ПОДТВЕРЖДЕНИЕ ПАРОЛЯ" value="${p(e.signUp.passwordConfirm)}" required minlength="6">
                <button class="auth-submit-pill" type="submit" ${e.isSubmitting?"disabled":""}>
                    ${e.isSubmitting?"СОЗДАНИЕ...":"ПРИСОЕДИНИТЬСЯ"}
                </button>
            </form>
        `,ye(ne("#signUpForm",le))),P.querySelectorAll("[data-view]").forEach(t=>{t.addEventListener("click",()=>{const a=t.dataset.view;a&&(R(),V(a))})})}}function ye(t){const a=t.elements.namedItem("email"),i=t.elements.namedItem("password"),n=t.elements.namedItem("passwordConfirm");!b(a)||!b(i)||!b(n)||(a.addEventListener("input",()=>{e.signUp.email=a.value}),i.addEventListener("input",()=>{e.signUp.password=i.value}),n.addEventListener("input",()=>{e.signUp.passwordConfirm=n.value}),t.addEventListener("submit",s=>{s.preventDefault(),$e(t)}))}function we(t){return t&&([t.firstName,t.lastName].filter(Boolean).join(" ").trim()||t.nickname||t.userName)||""}function ue(){var a,i,n;return((i=(a=e.profileEdits)==null?void 0:a.fullName)==null?void 0:i.trim())?((n=e.profileEdits)==null?void 0:n.fullName)??"":we(e.profile)}function pe(){var t,a;return((t=e.profileEdits)==null?void 0:t.group)??((a=e.profile)==null?void 0:a.groupTitle)??""}function me(){var t,a;return((t=e.profileEdits)==null?void 0:t.avatarDataUrl)??((a=e.profile)==null?void 0:a.avatarUrl)??""}function Se(){e.profileEdits=null,e.profileModal="none",e.profileAchievementTitle="",e.profileCreateTeamName="",e.profileInviteLink="",e.profileFormDraft=null,e.dashboardSection="profile",e.teamModal="none",e.teamVoteMemberIndex=0,e.teamRequestsInviteLink=""}function j(){var i,n,s,u;const t=((n=(i=e.profile)==null?void 0:i.teamName)==null?void 0:n.trim())||"КОМАНДА",a=((u=(s=e.profile)==null?void 0:s.teamInviteCode)==null?void 0:u.trim())||"DEMO-INVITE";return`${window.location.origin}/team/${encodeURIComponent(t)}?invite=${encodeURIComponent(a)}`}function re(t,a=0){e.profileModal="none",e.profileFormDraft=null,e.teamModal=t,e.teamVoteMemberIndex=a,t==="requests"&&(e.teamRequestsInviteLink=j()),d()}function E(){e.teamModal="none",d()}function Ie(){return Array.from({length:8},(t,a)=>{const i=a%2===0;return`
            <div class="team-member-card">
                <div class="team-member-avatar" aria-hidden="true"></div>
                <div class="team-member-role">РОЛЬ</div>
                <button type="button" class="team-member-action" data-team-card-action="${i?"vote":"edit"}" data-member-index="${a}">${i?"ГОЛОСОВАТЬ":"ИЗМЕНИТЬ"}</button>
            </div>`}).join("")}function Le(){return[!0,!1,!0,!1].map(a=>`
        <div class="team-history-row">
            ${a?'<span class="team-history-points-pill">БАЛЛЫ</span>':""}
        </div>`).join("")}function Ee(t,a){return`
            <section class="profile-main team-dashboard-main">
                ${t}
                <header class="team-top-bar">
                    <span class="team-top-title">${p(a)}</span>
                    <span class="team-top-dot" aria-hidden="true"></span>
                    <button type="button" class="team-top-pill" id="teamKrkButton">КРК</button>
                    <button type="button" class="team-top-pill" id="teamOpenRequestsHeaderButton">ЗАЯВКИ</button>
                </header>
                <div class="team-panel team-members-panel">
                    <div class="team-members-grid">
                        ${Ie()}
                    </div>
                </div>
                <div class="team-panel team-history-panel">
                    <div class="team-history-head">
                        <h3 class="team-history-title">ИСТОРИЯ АКТИВНОСТИ</h3>
                        <button type="button" class="team-top-pill" id="teamCheckInButton">CHECK-IN</button>
                    </div>
                    <div class="team-history-rows">
                        ${Le()}
                    </div>
                </div>
                <div class="team-rescue-bar">
                    <button type="button" class="team-rescue-pill" id="teamRescueButton">СПАСЕНИЕ</button>
                </div>
            </section>`}function qe(){return e.teamModal==="vote"?`
                <div class="profile-modal team-overlay-modal" role="dialog" aria-modal="true" aria-label="Голосование">
                    <div class="profile-modal-backdrop" data-close-team-modal="1"></div>
                    <div class="profile-modal-card team-vote-card">
                        <button type="button" class="profile-modal-dot" id="teamCloseVoteButton" aria-label="Закрыть"></button>
                        <h2 class="profile-modal-title">ГОЛОСОВАНИЕ</h2>
                        <div class="team-vote-avatar" aria-hidden="true"></div>
                        <div class="team-vote-role-pill">РОЛЬ</div>
                        <div class="team-vote-rows">
                            <div class="team-vote-bar team-vote-bar-full"></div>
                            <div class="team-vote-bar team-vote-bar-split">
                                <span class="team-vote-bar-left"></span>
                                <span class="team-vote-bar-right team-vote-bar-label">БАЛЛЫ</span>
                            </div>
                            <div class="team-vote-bar team-vote-bar-full"></div>
                            <div class="team-vote-bar team-vote-bar-split is-reverse">
                                <span class="team-vote-bar-left team-vote-bar-label">БАЛЛЫ</span>
                                <span class="team-vote-bar-right"></span>
                            </div>
                        </div>
                    </div>
                </div>`:e.teamModal==="requests"?(e.teamRequestsInviteLink||j(),`
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
                </div>`):""}function $(t){e.teamModal="none",e.profileModal=t,t==="personal"&&(e.profileFormDraft={fullName:ue(),group:pe(),avatarDataUrl:me()||null}),d()}function g(){e.profileModal="none",e.profileFormDraft=null,d()}function ke(){return Array.from({length:8},(a,i)=>i).map(a=>`
        <button type="button" class="profile-achievement-item" data-achievement-index="${a}">
            <span class="profile-achievement-circle"></span>
            <span class="profile-achievement-caption">НАЗВАНИЕ</span>
        </button>`).join("")}function Te(){const t=e.profileFormDraft;switch(e.profileModal){case"personal":return t?`
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
                        <input id="profileNameInput" class="profile-modal-input" type="text" placeholder="ИМЯ ФАМИЛИЯ" value="${p(t.fullName)}">
                        <input id="profileGroupInput" class="profile-modal-input" type="text" placeholder="АКАДЕМ. ГРУППА" value="${p(t.group)}">
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
                        <input id="profileTeamNameInput" class="profile-modal-input" type="text" placeholder="НАЗВАНИЕ" value="${p(e.profileCreateTeamName)}">
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
                        <p class="profile-achievement-name">${p(e.profileAchievementTitle||"НАЗВАНИЕ")}</p>
                        <div class="profile-achievement-body"></div>
                        <div class="profile-achievement-meta">
                            <span class="profile-achievement-meta-label">БАЛЛЫ</span>
                            <span class="profile-achievement-meta-value"></span>
                        </div>
                    </div>
                </div>
            `;default:return""}}function Be(){var y;if(!f(o))return;const t=e.profile,a="ЛИГА",i=String((t==null?void 0:t.teamScore)??0),n="РЕЙТИНГ",s="—",u="—",h=ue(),T=pe(),w=((y=t==null?void 0:t.teamName)==null?void 0:y.trim())??"",B=w||"КОМАНДА",C=w||"НАЗВАНИЕ",S=e.statusMessage?`<p class="profile-inline-status ${e.statusTone==="error"?"is-error":""}">${p(e.statusMessage)}</p>`:"",M=e.dashboardSection==="profile"?" is-active":"",I=e.dashboardSection==="team"?" is-active":"",L=e.dashboardSection==="team"?Ee(S,C):`
            <section class="profile-main">
                ${S}
                <div class="profile-top">
                    <div class="profile-photo-col">
                        <div class="profile-photo"></div>
                        <div class="profile-name-pill">${p(h||"ИМЯ ФАМИЛИЯ")}</div>
                    </div>
                    <div class="profile-stats-col">
                        <div class="profile-stat-row">
                            <span class="profile-chip profile-chip-muted">${a}</span>
                            <span class="profile-value-pill">${p(u)}</span>
                        </div>
                        <div class="profile-stat-row">
                            <span class="profile-chip profile-chip-muted">БАЛЛЫ</span>
                            <span class="profile-value-pill">${p(i)}</span>
                        </div>
                        <div class="profile-stat-row">
                            <span class="profile-chip profile-chip-accent">${n}</span>
                            <span class="profile-value-pill">${p(s)}</span>
                        </div>
                    </div>
                </div>
                <div class="profile-pills-row">
                    <div class="profile-info-pill">${p(h||"ИМЯ ФАМИЛИЯ")}</div>
                    <div class="profile-info-pill">${p(T||"АКАДЕМ. ГРУППА")}</div>
                    <button type="button" class="profile-info-pill profile-info-pill-accent" id="profileTeamPillButton">${p(B)}</button>
                </div>
                <div class="profile-achievements">
                    <h3 class="profile-achievements-title">ДОСТИЖЕНИЯ</h3>
                    <div class="profile-achievements-scroll">
                        ${ke()}
                    </div>
                </div>
            </section>`;o.innerHTML=`
        <div class="profile-app">
            <aside class="profile-sidebar" aria-label="Разделы">
                <nav class="profile-nav-top">
                    <button type="button" class="profile-nav-button${M}" data-dashboard="profile">ПРОФИЛЬ</button>
                    <button type="button" class="profile-nav-button${I}" data-dashboard="team">КОМАНДА</button>
                    <button type="button" class="profile-nav-button" data-dashboard-placeholder="rating">РЕЙТИНГ</button>
                    <button type="button" class="profile-nav-button" data-dashboard-placeholder="events">СОБЫТИЯ</button>
                    <button type="button" class="profile-nav-button" data-dashboard-placeholder="news">НОВОСТИ</button>
                </nav>
                <nav class="profile-nav-bottom">
                    <button type="button" class="profile-nav-button" id="profileSettingsButton">НАСТРОЙКИ</button>
                    <button type="button" class="profile-nav-button" id="profileLogoutButton">ПОКИНУТЬ</button>
                </nav>
            </aside>
            ${L}
        </div>
        ${Te()}
        ${qe()}
    `,Ce()}function Ce(){if(!f(o))return;const t=o.querySelector(".profile-photo");if(t instanceof HTMLElement){const l=me();l?(t.classList.add("has-image"),t.style.backgroundImage=`url(${JSON.stringify(l)})`):(t.classList.remove("has-image"),t.style.removeProperty("background-image"))}const a=o.querySelector("#profileLogoutButton");c(a)&&a.addEventListener("click",()=>{ve(),e.profile=null,Se(),e.signIn.password="",r("Сессия завершена."),V("sign-in")});const i=o.querySelector("#profileSettingsButton");c(i)&&i.addEventListener("click",()=>{$("personal")});const n=o.querySelector("#profileTeamPillButton");c(n)&&n.addEventListener("click",()=>{var m;if(!!((m=e.profile)!=null&&m.teamId)){e.dashboardSection="team",R(),d();return}$("noTeam")}),o.querySelectorAll("[data-dashboard]").forEach(l=>{l.addEventListener("click",()=>{var v;const m=l.dataset.dashboard;if(m){if(m==="team"&&!((v=e.profile)!=null&&v.teamId)){$("noTeam");return}e.dashboardSection=m,R(),d()}})}),o.querySelectorAll("[data-dashboard-placeholder]").forEach(l=>{l.addEventListener("click",()=>{r("Раздел скоро будет доступен."),d()})});const s=o.querySelector("#teamKrkButton");c(s)&&s.addEventListener("click",()=>{r("КРК: командный рейтинговый коэффициент (скоро)."),d()});const u=o.querySelector("#teamOpenRequestsHeaderButton");c(u)&&u.addEventListener("click",()=>{re("requests")});const h=o.querySelector("#teamCheckInButton");c(h)&&h.addEventListener("click",()=>{r("Check-in зарегистрирован (демо)."),d()});const T=o.querySelector("#teamRescueButton");c(T)&&T.addEventListener("click",()=>{r("Спасение: запрос помощи отправлен (демо)."),d()}),o.querySelectorAll("[data-team-card-action]").forEach(l=>{l.addEventListener("click",()=>{const m=l.dataset.teamCardAction,v=Number(l.dataset.memberIndex??"0");if(m==="vote"){re("vote",v);return}m==="edit"&&(r(`Редактирование участника ${v+1} (скоро).`),d())})}),o.querySelectorAll("[data-close-team-modal]").forEach(l=>{l.addEventListener("click",()=>{E()})});const w=o.querySelector("#teamCloseVoteButton");c(w)&&w.addEventListener("click",()=>{E()});const B=o.querySelector("#teamCloseRequestsButton");c(B)&&B.addEventListener("click",()=>{E()});const C=o.querySelector("#teamRequestsCopyLinkButton");c(C)&&C.addEventListener("click",async()=>{const l=e.teamRequestsInviteLink||j();try{await navigator.clipboard.writeText(l),r("Ссылка-приглашение скопирована.")}catch{r("Не удалось скопировать ссылку.","error")}d()});const S=o.querySelector("#teamRequestAcceptButton");c(S)&&S.addEventListener("click",()=>{r("Заявка принята (демо)."),E()});const M=o.querySelector("#teamRequestDeclineButton");c(M)&&M.addEventListener("click",()=>{r("Заявка отклонена (демо)."),E()}),o.querySelectorAll(".profile-achievement-item").forEach(l=>{l.addEventListener("click",()=>{e.profileAchievementTitle="НАЗВАНИЕ",$("achievement")})}),o.querySelectorAll("[data-close-modal]").forEach(l=>{l.addEventListener("click",()=>{g()})});const I=o.querySelector("#profileNameInput");b(I)&&e.profileFormDraft&&I.addEventListener("input",()=>{e.profileFormDraft.fullName=I.value});const L=o.querySelector("#profileGroupInput");b(L)&&e.profileFormDraft&&L.addEventListener("input",()=>{e.profileFormDraft.group=L.value});const y=o.querySelector("#profileAvatarInput");b(y)&&e.profileFormDraft&&y.addEventListener("change",()=>{var v;const l=(v=y.files)==null?void 0:v[0];if(!l)return;const m=new FileReader;m.onload=()=>{typeof m.result=="string"&&e.profileFormDraft&&(e.profileFormDraft.avatarDataUrl=m.result,d())},m.readAsDataURL(l)});const _=o.querySelector("#profileSavePersonalButton");c(_)&&e.profileFormDraft&&_.addEventListener("click",()=>{const l=e.profileFormDraft;l&&(e.profileEdits={fullName:l.fullName,group:l.group,avatarDataUrl:l.avatarDataUrl},r("Личные данные сохранены."),g())});const K=o.querySelector("#profileOpenPasswordButton");c(K)&&K.addEventListener("click",()=>{e.profileModal="password",e.profileFormDraft=null,d()});const z=o.querySelector("#profileSavePasswordButton");c(z)&&z.addEventListener("click",()=>{r("Пароль обновлён (демо)."),g()});const J=o.querySelector("#profileCloseNoTeamButton");c(J)&&J.addEventListener("click",()=>{g()});const W=o.querySelector("#profileFindTeamButton");c(W)&&W.addEventListener("click",()=>{r("Поиск команды скоро будет доступен."),g()});const Y=o.querySelector("#profileOpenCreateTeamButton");c(Y)&&Y.addEventListener("click",()=>{e.profileCreateTeamName="",e.profileModal="createTeam",d()});const D=o.querySelector("#profileTeamNameInput");b(D)&&D.addEventListener("input",()=>{e.profileCreateTeamName=D.value});const Z=o.querySelector("#profileConfirmCreateTeamButton");c(Z)&&Z.addEventListener("click",()=>{var oe,ie;const l=e.profileCreateTeamName.trim()||"КОМАНДА",m=((ie=(oe=e.profile)==null?void 0:oe.teamInviteCode)==null?void 0:ie.trim())||"DEMO-INVITE",v=`${window.location.origin}/team/${encodeURIComponent(l)}?invite=${encodeURIComponent(m)}`;e.profileInviteLink=v,e.profileModal="teamSuccess",d()});const Q=o.querySelector("#profileBackFromCreateTeamButton");c(Q)&&Q.addEventListener("click",()=>{e.profileModal="noTeam",d()});const X=o.querySelector("#profileCopyInviteButton");c(X)&&X.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(e.profileInviteLink),r("Ссылка скопирована.")}catch{r("Не удалось скопировать ссылку.","error")}d()});const ee=o.querySelector("#profileCloseSuccessButton");c(ee)&&ee.addEventListener("click",()=>{g()});const te=o.querySelector("#profileSuccessGoButton");c(te)&&te.addEventListener("click",()=>{g()});const ae=o.querySelector("#profileCloseAchievementButton");c(ae)&&ae.addEventListener("click",()=>{g()})}async function Me(t){e.signIn.email=q(t.elements.namedItem("email")).trim(),e.signIn.password=q(t.elements.namedItem("password")),e.isSubmitting=!0,r("Подключаемся к серверу..."),d();try{const a=await k("/api/auth/login",{method:"POST",body:JSON.stringify({email:e.signIn.email,password:e.signIn.password})});fe(a),e.profile=await k("/api/auth/me",{headers:{Authorization:`Bearer ${a.token}`}}),e.signIn.password="",e.view="account",r("Вход выполнен.")}catch(a){r(G(a),"error")}finally{e.isSubmitting=!1,d()}}const de=6;async function $e(t){if(e.signUp.email=q(t.elements.namedItem("email")).trim(),e.signUp.password=q(t.elements.namedItem("password")),e.signUp.passwordConfirm=q(t.elements.namedItem("passwordConfirm")),!e.signUp.email||!e.signUp.password){r("Заполните email и пароль.","error"),U();return}if(e.signUp.password.length<de){r(`Пароль не короче ${de} символов (требование сервера).`,"error"),U();return}if(e.signUp.password!==e.signUp.passwordConfirm){r("Пароли не совпадают.","error"),U();return}e.isSubmitting=!0,r("Создаём аккаунт..."),d();try{const a=await k("/api/auth/register",{method:"POST",body:JSON.stringify({userName:Ae(e.signUp.email),email:e.signUp.email,password:e.signUp.password})});fe(a),e.profile=await k("/api/auth/me",{headers:{Authorization:`Bearer ${a.token}`}}),e.view="account",e.signUp.password="",e.signUp.passwordConfirm="",r("Регистрация завершена.")}catch(a){r(G(a),"error")}finally{e.isSubmitting=!1,d()}}async function k(t,a){const i=new Headers(a==null?void 0:a.headers);i.set("Accept","application/json"),a!=null&&a.body&&!i.has("Content-Type")&&i.set("Content-Type","application/json");const n=await fetch(`${be}${t}`,{...a,headers:i});if(!n.ok){let s=`Ошибка ${n.status}`;try{const u=await n.json();s=u.detail||u.message||u.title||s}catch{s=n.statusText||s}throw new Error(Ue(s))}return await n.json()}function fe(t){const a={token:t.token,expiresAtUtc:t.expiresAtUtc};localStorage.setItem(x,JSON.stringify(a))}function Ne(){const t=localStorage.getItem(x);if(!t)return null;try{const a=JSON.parse(t);return!a.token||!a.expiresAtUtc?null:a}catch{return null}}function ve(){localStorage.removeItem(x)}function Ae(t){var i;return(((i=t.split("@")[0])==null?void 0:i.trim())||"student").replace(/[^a-zA-Z0-9._-]/g,"").slice(0,100)||"student"}function U(){const t=document.querySelector(".status-message");if(!(t instanceof HTMLElement)){d();return}t.textContent=e.statusMessage,t.classList.toggle("status-error",e.statusTone==="error"),t.classList.toggle("hidden",!e.statusMessage)}function ce(){const t=e.statusTone==="error"?"status-error":"",a=e.statusMessage?"":"hidden";return`<p class="status-message ${t} ${a}">${p(e.statusMessage)}</p>`}function G(t){return t instanceof Error?t.message:"Не удалось выполнить запрос."}function Ue(t){return{"User with this email already exists.":"Пользователь с таким email уже зарегистрирован.","Invalid email or password.":"Неверная почта или пароль."}[t]??t}function p(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}document.querySelectorAll("[data-view]").forEach(t=>{t.addEventListener("click",()=>{const a=t.dataset.view;a&&(R(),V(a))})});d();

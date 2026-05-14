(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))o(n);new MutationObserver(n=>{for(const i of n)if(i.type==="childList")for(const l of i.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&o(l)}).observe(document,{childList:!0,subtree:!0});function s(n){const i={};return n.integrity&&(i.integrity=n.integrity),n.referrerPolicy&&(i.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?i.credentials="include":n.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function o(n){if(n.ep)return;n.ep=!0;const i=s(n);fetch(n.href,i)}})();const C="team-exam-auth",G="",t={view:"home",modal:"none",sidebarTab:"profile",signIn:{email:"",password:"",passwordVisible:!1},signUp:{email:"",password:"",confirmPassword:"",passwordVisible:!1,confirmPasswordVisible:!1},profileEdit:{fullName:"",groupId:"",avatarUrl:""},teamCreate:{name:""},teamJoin:{inviteCode:""},success:{link:""},dashboard:{profile:null,groups:[],myTeam:null,teams:[]},statusMessage:"",statusTone:"default",isSubmitting:!1},O=document.getElementById("homeScreen"),q=document.getElementById("authScreen"),x=document.getElementById("dashboardScreen"),F=document.getElementById("authLayout"),$=document.getElementById("formContent"),V=document.getElementById("dashboardRoot"),H=document.getElementById("promoSignInButton"),D=document.getElementById("promoSignUpButton");Q();function f(e){return e instanceof HTMLElement}function p(e){return e instanceof HTMLInputElement}function T(e){return e instanceof HTMLButtonElement}function N(e){return e instanceof HTMLFormElement}function u(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function r(e,a="default"){t.statusMessage=e,t.statusTone=a}function P(){t.statusMessage="",t.statusTone="default"}function U(e){t.view=e,d()}function w(e){t.modal=e,d()}async function Q(){d();const e=B();if(e){t.isSubmitting=!0,t.view="sign-in",r("Восстанавливаем сессию..."),d();try{await k(e.token),r("Сессия восстановлена."),t.view="dashboard"}catch(a){Y(),r(h(a),"error"),t.view="sign-in"}finally{t.isSubmitting=!1,d()}}}async function k(e){var l;const a=e??((l=B())==null?void 0:l.token);if(!a)throw new Error("Сессия не найдена.");const[s,o,n]=await Promise.all([v("/api/profile",{headers:{Authorization:`Bearer ${a}`}}),v("/api/groups",{headers:{Authorization:`Bearer ${a}`}}),v("/api/teams",{headers:{Authorization:`Bearer ${a}`}})]);let i=null;if(s.teamId)try{i=await v("/api/teams/me",{headers:{Authorization:`Bearer ${a}`}})}catch{i=n.find(b=>b.id===s.teamId)??null}t.dashboard.profile=s,t.dashboard.groups=o,t.dashboard.teams=n,t.dashboard.myTeam=i,_(s)}function d(){if(!f(O)||!f(q)||!f(x)||!f(F)||!f($)||!f(V))return;const e=t.view==="home",a=t.view==="sign-in"||t.view==="sign-up",s=t.view==="dashboard";O.classList.toggle("screen-active",e),q.classList.toggle("screen-active",a),x.classList.toggle("screen-active",s),q.setAttribute("aria-hidden",String(!a)),x.setAttribute("aria-hidden",String(!s)),document.body.classList.toggle("modal-open",a),a&&W(),s&&X()}function W(){if(!(!f(F)||!f($))){if(F.classList.toggle("mode-sign-up",t.view==="sign-up"),t.view==="sign-in"){$.innerHTML=`
            <form id="signInForm" class="auth-form">
                <h1>ВХОД</h1>
                ${j()}
                <input name="email" type="email" placeholder="ЭЛЕКТРОННАЯ ПОЧТА" value="${u(t.signIn.email)}" required>
                <div class="password-row">
                    <input name="password" type="${t.signIn.passwordVisible?"text":"password"}" placeholder="ПАРОЛЬ" value="${u(t.signIn.password)}" required>
                    <button class="icon-button" id="signInPasswordToggle" type="button">◉</button>
                </div>
                <button class="primary-button form-button" type="submit" ${t.isSubmitting?"disabled":""}>
                    ${t.isSubmitting?"ПОДКЛЮЧЕНИЕ...":"ПРИСОЕДИНИТЬСЯ"}
                </button>
                <button class="text-link" type="button" data-view="sign-up">Зарегистрироваться, если нет аккаунта</button>
            </form>
        `;const e=J("#signInForm"),a=e.elements.namedItem("email"),s=e.elements.namedItem("password"),o=document.getElementById("signInPasswordToggle");p(a)&&a.addEventListener("input",()=>{t.signIn.email=a.value}),p(s)&&s.addEventListener("input",()=>{t.signIn.password=s.value}),T(o)&&p(s)&&o.addEventListener("click",()=>{t.signIn.passwordVisible=!t.signIn.passwordVisible,s.type=t.signIn.passwordVisible?"text":"password"}),e.addEventListener("submit",n=>{n.preventDefault(),ae(e)})}if(t.view==="sign-up"){$.innerHTML=`
            <form id="signUpForm" class="auth-form">
                <h1>РЕГИСТРАЦИЯ</h1>
                ${j()}
                <input name="email" type="email" placeholder="ЭЛЕКТРОННАЯ ПОЧТА" value="${u(t.signUp.email)}" required>
                <div class="password-row">
                    <input name="password" type="${t.signUp.passwordVisible?"text":"password"}" placeholder="ПАРОЛЬ" value="${u(t.signUp.password)}" required>
                    <button class="icon-button" id="signUpPasswordToggle" type="button">◉</button>
                </div>
                <div class="password-row">
                    <input name="confirmPassword" type="${t.signUp.confirmPasswordVisible?"text":"password"}" placeholder="ПОДТВЕРЖДЕНИЕ ПАРОЛЯ" value="${u(t.signUp.confirmPassword)}" required>
                    <button class="icon-button" id="signUpConfirmPasswordToggle" type="button">◉</button>
                </div>
                <p class="field-error ${z()?"":"hidden"}">Пароли должны совпадать.</p>
                <button class="primary-button form-button" type="submit" ${t.isSubmitting?"disabled":""}>
                    ${t.isSubmitting?"СОЗДАНИЕ...":"ПРИСОЕДИНИТЬСЯ"}
                </button>
                <button class="text-link" type="button" data-view="sign-in">Уже есть аккаунт? Войти</button>
            </form>
        `;const e=J("#signUpForm");re(e,"email","password","confirmPassword","signUpPasswordToggle","signUpConfirmPasswordToggle",t.signUp),e.addEventListener("submit",a=>{a.preventDefault(),se(e)})}$.querySelectorAll("[data-view]").forEach(e=>{e.addEventListener("click",()=>{const a=e.dataset.view;a&&(P(),U(a))})})}}function X(){var i;if(!f(V))return;const e=t.dashboard.profile,a=t.dashboard.myTeam,s=t.statusTone==="error"?"dashboard-status is-error":"dashboard-status",o=((i=t.dashboard.groups.find(l=>String(l.id)===t.profileEdit.groupId))==null?void 0:i.title)??(e==null?void 0:e.groupTitle)??"АКАДЕМ. ГРУППА",n=R(e);V.innerHTML=`
        <div class="dashboard-frame">
            <aside class="dashboard-sidebar">
                <div class="sidebar-stack">
                    ${S("profile","ПРОФИЛЬ")}
                    ${S("team","КОМАНДА")}
                    ${S("rating","РЕЙТИНГ")}
                    ${S("events","СОБЫТИЯ")}
                    ${S("news","НОВОСТИ")}
                </div>
                <div class="sidebar-bottom">
                    <button class="sidebar-button" type="button" data-action="open-personal">НАСТРОЙКИ</button>
                    <button class="sidebar-button" type="button" data-action="logout">ПОКИНУТЬ</button>
                </div>
            </aside>

            <section class="dashboard-main">
                ${t.statusMessage?`<div class="${s}">${u(t.statusMessage)}</div>`:""}
                <div class="dashboard-grid">
                    <div class="profile-visual">
                        <div class="avatar-panel"></div>
                        <div class="profile-name-row">
                            <div class="pill">${u(n)}</div>
                            <div class="pill">${u(o||"АКАДЕМ. ГРУППА")}</div>
                            <button class="pill pill-accent" type="button" data-action="team-primary">${u((a==null?void 0:a.name)||"КОМАНДА")}</button>
                        </div>
                    </div>
                    <div class="stats-column">
                        ${A("ЛИГА",(e==null?void 0:e.role)||"Student",!1)}
                        ${A("БАЛЛЫ",String((e==null?void 0:e.teamScore)??0),!1)}
                        ${A("РЕЙТИНГ",a?String(a.score):"0",!0)}
                    </div>
                </div>
                <section class="achievements-panel">
                    <h2 class="achievements-title">ДОСТИЖЕНИЯ</h2>
                    <div class="achievements-grid">
                        ${I("ДОСТИЖЕНИЕ",!0)}
                        ${I((a==null?void 0:a.name)||"НАЗВАНИЕ",!1)}
                        ${I("НАЗВАНИЕ",!1)}
                        ${I("НАЗВАНИЕ",!1)}
                        ${I("НАЗВАНИЕ",!0)}
                    </div>
                </section>
                ${ee()}
            </section>
        </div>
    `,te()}function S(e,a){const s=t.sidebarTab===e?' style="box-shadow: inset 0 0 0 999px rgba(255,128,187,1);"':"";return`<button class="sidebar-button" type="button" data-tab="${e}"${s}>${a}</button>`}function A(e,a,s){return`
        <div class="info-row">
            <div class="info-label${s?" pill-accent":""}">${u(e)}</div>
            <div class="info-value">${u(a)}</div>
        </div>
    `}function I(e,a){return`
        <article class="achievement-card">
            <div class="achievement-badge${a?" is-faded":""}"></div>
            <div class="achievement-name">${u(e)}</div>
        </article>
    `}function ee(){switch(t.modal){case"personal":return`
                <div class="modal-overlay">
                    <form id="personalDataForm" class="modal-card" aria-modal="true">
                        <button class="close-ghost" type="button" data-action="close-modal">×</button>
                        <h3 class="modal-title">ЛИЧНЫЕ ДАННЫЕ</h3>
                        <div class="modal-stack">
                            <div class="modal-composite-row">
                                <input name="avatarUrl" type="text" placeholder="ФОТО" value="${u(t.profileEdit.avatarUrl)}">
                                <button class="modal-inline-action" type="button">ВЫБРАТЬ</button>
                            </div>
                            <div class="modal-input-row">
                                <input name="fullName" type="text" placeholder="ИМЯ ФАМИЛИЯ" value="${u(t.profileEdit.fullName)}">
                            </div>
                            <div class="modal-input-row">
                                <select name="groupId">
                                    <option value="">АКАДЕМ. ГРУППА</option>
                                    ${t.dashboard.groups.map(e=>`
                                        <option value="${e.id}" ${String(e.id)===t.profileEdit.groupId?"selected":""}>${u(e.title)}</option>
                                    `).join("")}
                                </select>
                            </div>
                        </div>
                        <div class="modal-actions">
                            <button class="primary-button" type="submit" ${t.isSubmitting?"disabled":""}>СОХРАНИТЬ</button>
                            <button class="secondary-button" type="button" data-action="open-password">ПАРОЛЬ</button>
                        </div>
                    </form>
                </div>
            `;case"no-team":return`
                <div class="modal-overlay">
                    <div class="modal-card modal-card-small" aria-modal="true">
                        <button class="close-ghost" type="button" data-action="close-modal">×</button>
                        <div class="modal-dot"></div>
                        <h3 class="modal-title">НЕТ КОМАНДЫ</h3>
                        <div class="modal-actions">
                            <button class="primary-button" type="button" data-action="open-join-team">НАЙТИ</button>
                            <button class="primary-button" type="button" data-action="open-create-team">СОЗДАТЬ</button>
                        </div>
                    </div>
                </div>
            `;case"create-team":return`
                <div class="modal-overlay">
                    <form id="createTeamForm" class="modal-card" aria-modal="true">
                        <button class="close-ghost" type="button" data-action="close-modal">×</button>
                        <h3 class="modal-title">СОЗДАНИЕ КОМАНДЫ</h3>
                        <div class="modal-stack">
                            <div class="modal-input-row">
                                <input name="name" type="text" placeholder="НАЗВАНИЕ" value="${u(t.teamCreate.name)}" required>
                            </div>
                        </div>
                        <div class="modal-actions">
                            <button class="primary-button" type="submit" ${t.isSubmitting?"disabled":""}>СОЗДАТЬ</button>
                            <button class="primary-button" type="button" data-action="close-modal">НАЗАД</button>
                        </div>
                    </form>
                </div>
            `;case"success":return`
                <div class="modal-overlay">
                    <div class="modal-card" aria-modal="true">
                        <button class="close-ghost" type="button" data-action="close-modal">×</button>
                        <div class="modal-dot"></div>
                        <h3 class="modal-title">УСПЕШНО!</h3>
                        <div class="modal-composite-row">
                            <input id="successLinkInput" type="text" value="${u(t.success.link)}" placeholder="ССЫЛКА" readonly>
                            <button class="modal-inline-action" type="button" data-action="copy-link">СКОПИРОВАТЬ</button>
                        </div>
                        <div class="center-illustration"></div>
                        <div class="modal-actions">
                            <button class="primary-button" type="button" data-action="go-profile">ПЕРЕЙТИ</button>
                        </div>
                    </div>
                </div>
            `;case"password":return`
                <div class="modal-overlay">
                    <form id="passwordForm" class="modal-card" aria-modal="true">
                        <button class="close-ghost" type="button" data-action="close-modal">×</button>
                        <h3 class="modal-title">ВОССТАНОВЛЕНИЕ<br>ПАРОЛЯ</h3>
                        <div class="modal-stack">
                            <div class="modal-input-row">
                                <input name="password" type="password" placeholder="НОВЫЙ ПАРОЛЬ">
                            </div>
                            <div class="modal-input-row">
                                <input name="confirmPassword" type="password" placeholder="ПОДТВЕРЖДЕНИЕ">
                            </div>
                        </div>
                        <div class="modal-actions">
                            <button class="primary-button" type="submit">СОХРАНИТЬ</button>
                        </div>
                    </form>
                </div>
            `;case"team-card":{const e=t.dashboard.myTeam;return`
                <div class="modal-overlay">
                    <div class="modal-card modal-card-small" aria-modal="true">
                        <button class="close-ghost" type="button" data-action="close-modal">×</button>
                        <div class="modal-dot"></div>
                        <div class="team-card-avatar"></div>
                        <p class="modal-subtitle">${u((e==null?void 0:e.name)||"НАЗВАНИЕ")}</p>
                        <div class="team-description-box"></div>
                        <div class="info-row">
                            <div class="info-label">БАЛЛЫ</div>
                            <div class="info-value">${u(String((e==null?void 0:e.score)??0))}</div>
                        </div>
                    </div>
                </div>
            `}default:return""}}function te(){var o,n,i,l,b,g,y,E;document.querySelectorAll("[data-tab]").forEach(c=>{c.addEventListener("click",()=>{const m=c.dataset.tab;if(m){if(t.sidebarTab=m,m==="team"){w(t.dashboard.myTeam?"team-card":"no-team");return}P(),d()}})}),document.querySelectorAll("[data-action='close-modal']").forEach(c=>{c.addEventListener("click",()=>{w("none")})}),(o=document.querySelector("[data-action='logout']"))==null||o.addEventListener("click",()=>{Y(),t.dashboard.profile=null,t.dashboard.groups=[],t.dashboard.myTeam=null,t.dashboard.teams=[],t.modal="none",t.signIn.password="",r("Сессия завершена."),U("sign-in")}),(n=document.querySelector("[data-action='open-personal']"))==null||n.addEventListener("click",()=>{w("personal")}),(i=document.querySelector("[data-action='team-primary']"))==null||i.addEventListener("click",()=>{w(t.dashboard.myTeam?"team-card":"no-team")}),(l=document.querySelector("[data-action='open-create-team']"))==null||l.addEventListener("click",()=>{w("create-team")}),(b=document.querySelector("[data-action='open-join-team']"))==null||b.addEventListener("click",()=>{const c=window.prompt("Введите invite code команды",t.teamJoin.inviteCode);c&&(t.teamJoin.inviteCode=c.trim(),ie())}),(g=document.querySelector("[data-action='open-password']"))==null||g.addEventListener("click",()=>{w("password")}),(y=document.querySelector("[data-action='copy-link']"))==null||y.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(t.success.link),r("Ссылка скопирована."),d()}catch{r("Не удалось скопировать ссылку.","error"),d()}}),(E=document.querySelector("[data-action='go-profile']"))==null||E.addEventListener("click",()=>{w("none")});const e=document.getElementById("personalDataForm");if(N(e)){const c=e.elements.namedItem("fullName"),m=e.elements.namedItem("groupId"),M=e.elements.namedItem("avatarUrl");p(c)&&c.addEventListener("input",()=>{t.profileEdit.fullName=c.value}),m instanceof HTMLSelectElement&&m.addEventListener("change",()=>{t.profileEdit.groupId=m.value}),p(M)&&M.addEventListener("input",()=>{t.profileEdit.avatarUrl=M.value}),e.addEventListener("submit",Z=>{Z.preventDefault(),ne()})}const a=document.getElementById("createTeamForm");if(N(a)){const c=a.elements.namedItem("name");p(c)&&c.addEventListener("input",()=>{t.teamCreate.name=c.value}),a.addEventListener("submit",m=>{m.preventDefault(),oe()})}const s=document.getElementById("passwordForm");N(s)&&s.addEventListener("submit",c=>{c.preventDefault(),r("Смена пароля на сервере пока не реализована.","error"),d()})}async function ae(e){const a=L(e.elements.namedItem("email")).trim(),s=L(e.elements.namedItem("password"));t.signIn.email=a,t.signIn.password=s,t.isSubmitting=!0,r("Подключаемся к серверу..."),d();try{const o=await v("/api/auth/login",{method:"POST",body:JSON.stringify({email:a,password:s})});K(o),await k(o.token),t.view="dashboard",t.signIn.password="",r("Вход выполнен.")}catch(o){r(h(o),"error")}finally{t.isSubmitting=!1,d()}}async function se(e){const a=L(e.elements.namedItem("email")).trim(),s=L(e.elements.namedItem("password")),o=L(e.elements.namedItem("confirmPassword"));if(t.signUp.email=a,t.signUp.password=s,t.signUp.confirmPassword=o,s!==o){r("Пароли должны совпадать.","error"),d();return}t.isSubmitting=!0,r("Создаём аккаунт..."),d();try{const n=await v("/api/auth/register",{method:"POST",body:JSON.stringify({userName:le(a),email:a,password:s})});K(n),await k(n.token),t.view="dashboard",t.signUp.password="",t.signUp.confirmPassword="",r("Регистрация завершена.")}catch(n){r(h(n),"error")}finally{t.isSubmitting=!1,d()}}async function ne(){var o;const e=(o=B())==null?void 0:o.token;if(!e){r("Сессия не найдена.","error"),d();return}t.isSubmitting=!0,r("Сохраняем профиль..."),d();const{firstName:a,lastName:s}=de(t.profileEdit.fullName);try{const n=await v("/api/profile",{method:"PUT",headers:{Authorization:`Bearer ${e}`},body:JSON.stringify({firstName:a,lastName:s,avatarUrl:t.profileEdit.avatarUrl,groupId:t.profileEdit.groupId?Number(t.profileEdit.groupId):null})});t.dashboard.profile=n,_(n),t.modal="none",r("Профиль сохранён.")}catch(n){r(h(n),"error")}finally{t.isSubmitting=!1,d()}}async function oe(){var a;const e=(a=B())==null?void 0:a.token;if(!e){r("Сессия не найдена.","error"),d();return}t.isSubmitting=!0,r("Создаём команду..."),d();try{const s=await v("/api/teams/create",{method:"POST",headers:{Authorization:`Bearer ${e}`},body:JSON.stringify({name:t.teamCreate.name,description:""})});await k(e),t.success.link=s.inviteCode,t.modal="success",t.teamCreate.name="",r("Команда создана.")}catch(s){r(h(s),"error")}finally{t.isSubmitting=!1,d()}}async function ie(){var a;const e=(a=B())==null?void 0:a.token;if(!e){r("Сессия не найдена.","error"),d();return}t.isSubmitting=!0,r("Подключаем к команде..."),d();try{await v("/api/teams/join",{method:"POST",headers:{Authorization:`Bearer ${e}`},body:JSON.stringify({inviteCode:t.teamJoin.inviteCode})}),await k(e),t.modal="team-card",r("Команда подключена.")}catch(s){r(h(s),"error")}finally{t.isSubmitting=!1,d()}}async function v(e,a){const s=new Headers(a==null?void 0:a.headers);s.set("Accept","application/json"),a!=null&&a.body&&!s.has("Content-Type")&&s.set("Content-Type","application/json");const o=await fetch(`${G}${e}`,{...a,headers:s});if(!o.ok){let n=`Ошибка ${o.status}`;try{const i=await o.json();n=i.detail||i.message||i.title||n}catch{n=o.statusText||n}throw new Error(n)}return await o.json()}function re(e,a,s,o,n,i,l){const b=e.elements.namedItem(a),g=e.elements.namedItem(s),y=e.elements.namedItem(o),E=document.getElementById(n),c=document.getElementById(i);p(b)&&b.addEventListener("input",()=>{l.email=b.value}),p(g)&&g.addEventListener("input",()=>{l.password=g.value}),p(y)&&y.addEventListener("input",()=>{l.confirmPassword=y.value;const m=e.querySelector(".field-error");m instanceof HTMLElement&&m.classList.toggle("hidden",!z())}),T(E)&&p(g)&&E.addEventListener("click",()=>{l.passwordVisible=!l.passwordVisible,g.type=l.passwordVisible?"text":"password"}),T(c)&&p(y)&&c.addEventListener("click",()=>{l.confirmPasswordVisible=!l.confirmPasswordVisible,y.type=l.confirmPasswordVisible?"text":"password"})}function j(){return t.statusMessage?`<p class="status-message ${t.statusTone==="error"?"status-error":""}">${u(t.statusMessage)}</p>`:""}function z(){return!!(t.signUp.password&&t.signUp.confirmPassword&&t.signUp.password!==t.signUp.confirmPassword)}function J(e){const a=document.querySelector(e);if(!N(a))throw new Error(`Required form not found: ${e}`);return a}function L(e){return p(e)?e.value:""}function de(e){const a=e.trim().split(/\s+/).filter(Boolean);return{firstName:a[0]??"",lastName:a.slice(1).join(" ")}}function le(e){var s;return(((s=e.split("@")[0])==null?void 0:s.trim())||"student").replace(/[^a-zA-Z0-9._-]/g,"").slice(0,100)||"student"}function R(e){return e&&([e.firstName,e.lastName].filter(Boolean).join(" ")||e.userName)||"ИМЯ ФАМИЛИЯ"}function _(e){t.profileEdit.fullName=R(e),t.profileEdit.groupId=e.groupId?String(e.groupId):"",t.profileEdit.avatarUrl=e.avatarUrl??""}function h(e){return e instanceof Error?e.message:"Не удалось выполнить запрос."}function K(e){const a={token:e.token,expiresAtUtc:e.expiresAtUtc};localStorage.setItem(C,JSON.stringify(a))}function B(){const e=localStorage.getItem(C);if(!e)return null;try{const a=JSON.parse(e);return!a.token||!a.expiresAtUtc?null:a}catch{return null}}function Y(){localStorage.removeItem(C)}T(H)&&H.addEventListener("click",()=>{P(),U("sign-in")});T(D)&&D.addEventListener("click",()=>{P(),U("sign-up")});document.querySelectorAll("[data-view]").forEach(e=>{e.addEventListener("click",()=>{const a=e.dataset.view;a&&(P(),U(a))})});d();

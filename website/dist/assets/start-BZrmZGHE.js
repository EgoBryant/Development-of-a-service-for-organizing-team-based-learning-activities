(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))n(o);new MutationObserver(o=>{for(const l of o)if(l.type==="childList")for(const v of l.addedNodes)v.tagName==="LINK"&&v.rel==="modulepreload"&&n(v)}).observe(document,{childList:!0,subtree:!0});function s(o){const l={};return o.integrity&&(l.integrity=o.integrity),o.referrerPolicy&&(l.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?l.credentials="include":o.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function n(o){if(o.ep)return;o.ep=!0;const l=s(o);fetch(o.href,l)}})();const P="team-exam-auth",Y="",e={view:"home",modal:"none",sidebarTab:"profile",signIn:{email:"",password:""},signUp:{email:"",password:"",confirmPassword:""},dashboard:{profile:null,groups:[],myTeam:null},profileForm:{avatarUrl:"",fullName:"",groupId:""},teamName:"",teamInviteCode:"",successLink:"",statusMessage:"",statusTone:"default",isSubmitting:!1},A=document.getElementById("homeScreen"),T=document.getElementById("authScreen"),F=document.getElementById("dashboardScreen"),U=document.getElementById("authLayout"),h=document.getElementById("formContent"),k=document.getElementById("dashboardRoot"),O=document.getElementById("promoSignInButton"),H=document.getElementById("promoSignUpButton");Z();function u(t){return t instanceof HTMLElement}function D(t){return t instanceof HTMLInputElement}function z(t){return t instanceof HTMLButtonElement}function $(t){return t instanceof HTMLFormElement}function i(t,a="default"){e.statusMessage=t,e.statusTone=a}function L(){e.statusMessage="",e.statusTone="default"}function w(t){e.view=t,r()}function I(t){e.modal=t,r()}async function Z(){r();const t=E();if(t){e.isSubmitting=!0,e.view="sign-in",i("Восстанавливаем сессию..."),r();try{await S(t.token),e.view="dashboard",i("Сессия восстановлена.")}catch(a){K(),i(b(a),"error"),e.view="sign-in"}finally{e.isSubmitting=!1,r()}}}async function S(t){const[a,s]=await Promise.all([p("/api/profile",{headers:{Authorization:`Bearer ${t}`}}),p("/api/groups",{headers:{Authorization:`Bearer ${t}`}})]);let n=null;if(a.teamId)try{n=await p("/api/teams/me",{headers:{Authorization:`Bearer ${t}`}})}catch{n=null}e.dashboard.profile=a,e.dashboard.groups=s,e.dashboard.myTeam=n,V(a)}function r(){if(!u(A)||!u(T)||!u(F)||!u(U)||!u(h)||!u(k))return;const t=e.view==="home",a=e.view==="sign-in"||e.view==="sign-up",s=e.view==="dashboard";A.classList.toggle("screen-active",t),T.classList.toggle("screen-active",a),F.classList.toggle("screen-active",s),T.setAttribute("aria-hidden",String(!a)),F.setAttribute("aria-hidden",String(!s)),document.body.classList.toggle("modal-open",a),a&&G(),s&&Q()}function G(){if(!(!u(U)||!u(h))){if(U.classList.toggle("mode-sign-up",e.view==="sign-up"),e.view==="sign-in"){h.innerHTML=`
            <form id="signInForm" class="auth-form">
                <h1>ВХОД</h1>
                ${j()}
                <input name="email" type="email" placeholder="ЭЛЕКТРОННАЯ ПОЧТА" value="${d(e.signIn.email)}" required>
                <input name="password" type="password" placeholder="ПАРОЛЬ" value="${d(e.signIn.password)}" required>
                <button class="main-action-button form-submit-button" type="submit" ${e.isSubmitting?"disabled":""}>${e.isSubmitting?"ВХОД...":"ВОЙТИ"}</button>
                <button class="text-link" type="button" data-view="sign-up">Нет аккаунта? Зарегистрироваться</button>
            </form>
        `;const t=C("#signInForm");m(t,"email",a=>{e.signIn.email=a}),m(t,"password",a=>{e.signIn.password=a}),t.addEventListener("submit",a=>{a.preventDefault(),tt(t)})}if(e.view==="sign-up"){h.innerHTML=`
            <form id="signUpForm" class="auth-form">
                <h1>РЕГИСТРАЦИЯ</h1>
                ${j()}
                <input name="email" type="email" placeholder="ЭЛЕКТРОННАЯ ПОЧТА" value="${d(e.signUp.email)}" required>
                <input name="password" type="password" placeholder="ПАРОЛЬ" value="${d(e.signUp.password)}" required>
                <input name="confirmPassword" type="password" placeholder="ПОДТВЕРЖДЕНИЕ ПАРОЛЯ" value="${d(e.signUp.confirmPassword)}" required>
                <p class="field-error ${J()?"":"hidden"}">Пароли должны совпадать.</p>
                <button class="main-action-button form-submit-button" type="submit" ${e.isSubmitting?"disabled":""}>${e.isSubmitting?"СОЗДАНИЕ...":"СОЗДАТЬ"}</button>
                <button class="text-link" type="button" data-view="sign-in">Уже есть аккаунт? Войти</button>
            </form>
        `;const t=C("#signUpForm");m(t,"email",a=>{e.signUp.email=a}),m(t,"password",a=>{e.signUp.password=a,x(t)}),m(t,"confirmPassword",a=>{e.signUp.confirmPassword=a,x(t)}),t.addEventListener("submit",a=>{a.preventDefault(),et(t)})}h.querySelectorAll("[data-view]").forEach(t=>{t.addEventListener("click",()=>{const a=t.dataset.view;a&&(L(),w(a))})})}}function Q(){var n;if(!u(k))return;const t=e.dashboard.profile,a=e.dashboard.myTeam,s=((n=e.dashboard.groups.find(o=>String(o.id)===e.profileForm.groupId))==null?void 0:n.title)??(t==null?void 0:t.groupTitle)??"АКАДЕМ. ГРУППА";k.innerHTML=`
        <div class="dashboard-layout">
            <aside class="sidebar">
                <div class="sidebar-top">
                    <button class="sidebar-button" type="button" data-sidebar="profile">ПРОФИЛЬ</button>
                    <button class="sidebar-button" type="button" data-sidebar="team">КОМАНДА</button>
                    <button class="sidebar-button" type="button" data-sidebar="rating">РЕЙТИНГ</button>
                    <button class="sidebar-button" type="button" data-sidebar="events">СОБЫТИЯ</button>
                    <button class="sidebar-button" type="button" data-sidebar="news">НОВОСТИ</button>
                </div>
                <div class="sidebar-bottom">
                    <button class="sidebar-button" type="button" data-action="open-personal">НАСТРОЙКИ</button>
                    <button class="sidebar-button" type="button" data-action="logout">ПОКИНУТЬ</button>
                </div>
            </aside>

            <section class="content">
                ${e.statusMessage?`<div class="status-floating ${e.statusTone==="error"?"is-error":""}">${d(e.statusMessage)}</div>`:""}
                <div class="profile-grid">
                    <div class="avatar-card"></div>
                    <div class="stats-column">
                        ${N("ЛИГА",(t==null?void 0:t.role)||"")}
                        ${N("БАЛЛЫ",String((t==null?void 0:t.teamScore)??0))}
                        ${N("РЕЙТИНГ",a?String(a.score):"",!0)}
                    </div>
                </div>
                <div class="bottom-row">
                    <div class="bottom-pill">${d(R(t))}</div>
                    <div class="bottom-pill">${d(s)}</div>
                    <button class="bottom-pill is-accent" type="button" data-action="team-main">${d((a==null?void 0:a.name)||"КОМАНДА")}</button>
                </div>
                <section class="achievement-panel">
                    <h2 class="achievement-title">ДОСТИЖЕНИЯ</h2>
                    <div class="achievement-grid">
                        ${f("АНИЕ",!0)}
                        ${f("НАЗВАНИЕ")}
                        ${f("НАЗВАНИЕ")}
                        ${f("НАЗВАНИЕ")}
                        ${f("НАЗВАНИЕ")}
                        ${f("НАЗВ")}
                    </div>
                </section>
                ${W()}
            </section>
        </div>
    `,X()}function N(t,a,s=!1){return`
        <div class="stat-row">
            <div class="stat-label ${s?"is-accent":""}">${d(t)}</div>
            <div class="stat-value">${d(a)}</div>
        </div>
    `}function f(t,a=!1){return`
        <div class="achievement-item">
            <div class="achievement-circle ${a?"is-faded":""}"></div>
            <div class="achievement-name">${d(t)}</div>
        </div>
    `}function W(){switch(e.modal){case"personal":return`
                <div class="modal-overlay">
                    <form id="personalForm" class="modal-card">
                        <h3 class="modal-title">ЛИЧНЫЕ ДАННЫЕ</h3>
                        <div class="modal-stack">
                            <div class="modal-composite">
                                <input name="avatarUrl" type="text" placeholder="ФОТО" value="${d(e.profileForm.avatarUrl)}">
                                <button class="modal-inline-button" type="button">ВЫБРАТЬ</button>
                            </div>
                            <div class="modal-field">
                                <input name="fullName" type="text" placeholder="ИМЯ ФАМИЛИЯ" value="${d(e.profileForm.fullName)}">
                            </div>
                            <div class="modal-field">
                                <select name="groupId">
                                    <option value="">АКАДЕМ. ГРУППА</option>
                                    ${e.dashboard.groups.map(t=>`
                                        <option value="${t.id}" ${String(t.id)===e.profileForm.groupId?"selected":""}>${d(t.title)}</option>
                                    `).join("")}
                                </select>
                            </div>
                        </div>
                        <div class="modal-actions">
                            <button class="main-action-button" type="submit" ${e.isSubmitting?"disabled":""}>СОХРАНИТЬ</button>
                        </div>
                    </form>
                </div>
            `;case"password":return`
                <div class="modal-overlay">
                    <form id="passwordForm" class="modal-card">
                        <h3 class="modal-title">ВОССТАНОВЛЕНИЕ<br>ПАРОЛЯ</h3>
                        <div class="modal-stack">
                            <div class="modal-field">
                                <input name="password" type="password" placeholder="НОВЫЙ ПАРОЛЬ">
                            </div>
                            <div class="modal-field">
                                <input name="confirmPassword" type="password" placeholder="ПОДТВЕРЖДЕНИЕ">
                            </div>
                        </div>
                        <div class="modal-actions">
                            <button class="main-action-button" type="submit">СОХРАНИТЬ</button>
                        </div>
                    </form>
                </div>
            `;case"no-team":return`
                <div class="modal-overlay">
                    <div class="modal-card modal-card-small">
                        <div class="modal-dot"></div>
                        <h3 class="modal-title">НЕТ КОМАНДЫ</h3>
                        <div class="modal-actions">
                            <button class="main-action-button" type="button" data-action="join-team">НАЙТИ</button>
                            <button class="main-action-button" type="button" data-action="create-team-modal">СОЗДАТЬ</button>
                        </div>
                    </div>
                </div>
            `;case"create-team":return`
                <div class="modal-overlay">
                    <form id="createTeamForm" class="modal-card">
                        <h3 class="modal-title">СОЗДАНИЕ КОМАНДЫ</h3>
                        <div class="modal-stack">
                            <div class="modal-field">
                                <input name="name" type="text" placeholder="НАЗВАНИЕ" value="${d(e.teamName)}" required>
                            </div>
                        </div>
                        <div class="modal-actions">
                            <button class="main-action-button" type="submit" ${e.isSubmitting?"disabled":""}>СОЗДАТЬ</button>
                            <button class="secondary-action-button" type="button" data-action="close-modal">НАЗАД</button>
                        </div>
                    </form>
                </div>
            `;case"success":return`
                <div class="modal-overlay">
                    <div class="modal-card">
                        <div class="modal-dot"></div>
                        <h3 class="modal-title">УСПЕШНО!</h3>
                        <div class="modal-composite">
                            <input id="successLinkInput" type="text" placeholder="ССЫЛКА" value="${d(e.successLink)}" readonly>
                            <button class="modal-inline-button" type="button" data-action="copy-link">СКОПИРОВАТЬ</button>
                        </div>
                        <div class="success-figure"></div>
                        <div class="modal-actions">
                            <button class="main-action-button" type="button" data-action="close-modal">ПЕРЕЙТИ</button>
                        </div>
                    </div>
                </div>
            `;case"team-card":{const t=e.dashboard.myTeam;return`
                <div class="modal-overlay">
                    <div class="modal-card modal-card-small">
                        <div class="modal-dot"></div>
                        <div class="team-avatar"></div>
                        <p class="team-name">${d((t==null?void 0:t.name)||"НАЗВАНИЕ")}</p>
                        <div class="team-desc"></div>
                        <div class="team-score-row">
                            <div class="team-score-label">БАЛЛЫ</div>
                            <div class="team-score-value">${d(String((t==null?void 0:t.score)??0))}</div>
                        </div>
                    </div>
                </div>
            `}default:return""}}function X(){var n,o,l,v,B,M,q;(n=document.querySelector("[data-action='logout']"))==null||n.addEventListener("click",()=>{K(),e.dashboard.profile=null,e.dashboard.groups=[],e.dashboard.myTeam=null,e.modal="none",i("Сессия завершена."),w("sign-in")}),(o=document.querySelector("[data-action='open-personal']"))==null||o.addEventListener("click",()=>{I("personal")}),(l=document.querySelector("[data-action='team-main']"))==null||l.addEventListener("click",()=>{I(e.dashboard.myTeam?"team-card":"no-team")}),(v=document.querySelector("[data-action='close-modal']"))==null||v.addEventListener("click",()=>{I("none")}),(B=document.querySelector("[data-action='create-team-modal']"))==null||B.addEventListener("click",()=>{I("create-team")}),(M=document.querySelector("[data-action='join-team']"))==null||M.addEventListener("click",()=>{const c=window.prompt("Введите invite code команды",e.teamInviteCode);c&&(e.teamInviteCode=c.trim(),ot())}),(q=document.querySelector("[data-action='copy-link']"))==null||q.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(e.successLink),i("Ссылка скопирована."),r()}catch{i("Не удалось скопировать ссылку.","error"),r()}});const t=document.getElementById("personalForm");if($(t)){m(t,"avatarUrl",g=>{e.profileForm.avatarUrl=g}),m(t,"fullName",g=>{e.profileForm.fullName=g});const c=t.elements.namedItem("groupId");c instanceof HTMLSelectElement&&c.addEventListener("change",()=>{e.profileForm.groupId=c.value}),t.addEventListener("submit",g=>{g.preventDefault(),at()})}const a=document.getElementById("passwordForm");$(a)&&a.addEventListener("submit",c=>{c.preventDefault(),i("Смена пароля на сервере пока не реализована.","error"),r()});const s=document.getElementById("createTeamForm");$(s)&&(m(s,"name",c=>{e.teamName=c}),s.addEventListener("submit",c=>{c.preventDefault(),st()}))}async function tt(t){const a=y(t.elements.namedItem("email")).trim(),s=y(t.elements.namedItem("password"));e.signIn.email=a,e.signIn.password=s,e.isSubmitting=!0,i("Подключаемся к серверу..."),r();try{const n=await p("/api/auth/login",{method:"POST",body:JSON.stringify({email:a,password:s})});_(n),await S(n.token),e.view="dashboard",i("Вход выполнен.")}catch(n){i(b(n),"error")}finally{e.isSubmitting=!1,r()}}async function et(t){const a=y(t.elements.namedItem("email")).trim(),s=y(t.elements.namedItem("password")),n=y(t.elements.namedItem("confirmPassword"));if(e.signUp.email=a,e.signUp.password=s,e.signUp.confirmPassword=n,s!==n){i("Пароли должны совпадать.","error"),r();return}e.isSubmitting=!0,i("Создаём аккаунт..."),r();try{const o=await p("/api/auth/register",{method:"POST",body:JSON.stringify({userName:it(a),email:a,password:s})});_(o),await S(o.token),e.view="dashboard",i("Регистрация завершена.")}catch(o){i(b(o),"error")}finally{e.isSubmitting=!1,r()}}async function at(){var n;const t=(n=E())==null?void 0:n.token;if(!t){i("Сессия не найдена.","error"),r();return}const{firstName:a,lastName:s}=nt(e.profileForm.fullName);e.isSubmitting=!0,i("Сохраняем профиль..."),r();try{const o=await p("/api/profile",{method:"PUT",headers:{Authorization:`Bearer ${t}`},body:JSON.stringify({firstName:a,lastName:s,avatarUrl:e.profileForm.avatarUrl,groupId:e.profileForm.groupId?Number(e.profileForm.groupId):null})});e.dashboard.profile=o,V(o),e.modal="none",i("Профиль сохранён.")}catch(o){i(b(o),"error")}finally{e.isSubmitting=!1,r()}}async function st(){var a;const t=(a=E())==null?void 0:a.token;if(!t){i("Сессия не найдена.","error"),r();return}e.isSubmitting=!0,i("Создаём команду..."),r();try{const s=await p("/api/teams/create",{method:"POST",headers:{Authorization:`Bearer ${t}`},body:JSON.stringify({name:e.teamName,description:""})});await S(t),e.teamName="",e.successLink=s.inviteCode,e.modal="success",i("Команда создана.")}catch(s){i(b(s),"error")}finally{e.isSubmitting=!1,r()}}async function ot(){var a;const t=(a=E())==null?void 0:a.token;if(!t){i("Сессия не найдена.","error"),r();return}e.isSubmitting=!0,i("Подключаем к команде..."),r();try{await p("/api/teams/join",{method:"POST",headers:{Authorization:`Bearer ${t}`},body:JSON.stringify({inviteCode:e.teamInviteCode})}),await S(t),e.modal="team-card",i("Команда подключена.")}catch(s){i(b(s),"error")}finally{e.isSubmitting=!1,r()}}async function p(t,a){const s=new Headers(a==null?void 0:a.headers);s.set("Accept","application/json"),a!=null&&a.body&&!s.has("Content-Type")&&s.set("Content-Type","application/json");const n=await fetch(`${Y}${t}`,{...a,headers:s});if(!n.ok){let o=`Ошибка ${n.status}`;try{const l=await n.json();o=l.detail||l.message||l.title||o}catch{o=n.statusText||o}throw new Error(o)}return await n.json()}function m(t,a,s){const n=t.elements.namedItem(a);D(n)&&n.addEventListener("input",()=>{s(n.value)})}function x(t){const a=t.querySelector(".field-error");a instanceof HTMLElement&&a.classList.toggle("hidden",!J())}function J(){return!!(e.signUp.password&&e.signUp.confirmPassword&&e.signUp.password!==e.signUp.confirmPassword)}function j(){return e.statusMessage?`<p class="status-message ${e.statusTone==="error"?"status-error":""}">${d(e.statusMessage)}</p>`:""}function C(t){const a=document.querySelector(t);if(!$(a))throw new Error(`Required form not found: ${t}`);return a}function y(t){return D(t)?t.value:""}function R(t){return t&&[t.firstName,t.lastName].filter(Boolean).join(" ").trim()||"ИМЯ ФАМИЛИЯ"}function V(t){e.profileForm.fullName=R(t),e.profileForm.groupId=t.groupId?String(t.groupId):"",e.profileForm.avatarUrl=t.avatarUrl??""}function nt(t){const a=t.trim().split(/\s+/).filter(Boolean);return{firstName:a[0]??"",lastName:a.slice(1).join(" ")}}function it(t){var s;return(((s=t.split("@")[0])==null?void 0:s.trim())||"student").replace(/[^a-zA-Z0-9._-]/g,"").slice(0,100)||"student"}function _(t){const a={token:t.token,expiresAtUtc:t.expiresAtUtc};localStorage.setItem(P,JSON.stringify(a))}function E(){const t=localStorage.getItem(P);if(!t)return null;try{const a=JSON.parse(t);return!a.token||!a.expiresAtUtc?null:a}catch{return null}}function K(){localStorage.removeItem(P)}function b(t){return t instanceof Error?t.message:"Не удалось выполнить запрос."}function d(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}z(O)&&O.addEventListener("click",()=>{L(),w("sign-in")});z(H)&&H.addEventListener("click",()=>{L(),w("sign-up")});document.querySelectorAll("[data-view]").forEach(t=>{t.addEventListener("click",()=>{const a=t.dataset.view;a&&(L(),w(a))})});r();

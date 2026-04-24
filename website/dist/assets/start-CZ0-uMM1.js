(function(){const s=document.createElement("link").relList;if(s&&s.supports&&s.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))n(a);new MutationObserver(a=>{for(const c of a)if(c.type==="childList")for(const p of c.addedNodes)p.tagName==="LINK"&&p.rel==="modulepreload"&&n(p)}).observe(document,{childList:!0,subtree:!0});function r(a){const c={};return a.integrity&&(c.integrity=a.integrity),a.referrerPolicy&&(c.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?c.credentials="include":a.crossOrigin==="anonymous"?c.credentials="omit":c.credentials="same-origin",c}function n(a){if(a.ep)return;a.ep=!0;const c=r(a);fetch(a.href,c)}})();const x="",v="team-exam-session",$=document.querySelector("#app"),e={mode:"login",isLoading:!1,isSubmitting:!1,isRefreshing:!1,error:"",success:"",login:{email:"",password:""},register:{userName:"",email:"",password:"",confirmPassword:""},profile:{firstName:"",lastName:"",middleName:"",nickname:"",bio:"",avatarUrl:"",contactEmail:"",telegramHandle:"",phoneNumber:"",studentTicketNumber:"",groupId:""},createTeam:{name:"",description:""},joinTeam:{inviteCode:""},knowledge:{title:"",description:"",type:"Эксперт",publishToTeam:!1},helpRequest:{toTeamId:"",description:"",bonusPoints:"0"},checkIn:{weekNumber:"",reportText:""},vote:{toUserId:"",score:"5"},session:M(),dashboard:null};P().catch(t=>{e.error=b(t),l()});async function P(){if(l(),e.session){e.isLoading=!0,l();try{await f(),e.success="Сессия восстановлена."}catch(t){T(),e.error=b(t)}finally{e.isLoading=!1,l()}}}async function f(t=!1){if(!e.session)throw new Error("Сессия не найдена.");t&&(e.isRefreshing=!0,l());try{const[s,r,n,a,c,p,d]=await Promise.all([m("/api/profile"),m("/api/groups"),m("/api/teams"),m("/api/knowledge-posts"),m("/api/help-requests"),m("/api/checkins"),m("/api/votes")]);let h=null;if(s.teamId)try{h=await m("/api/teams/me")}catch{h=n.find(I=>I.id===s.teamId)??null}e.dashboard={profile:s,groups:r,teams:n,myTeam:h,knowledgePosts:a,helpRequests:c,checkIns:p,votes:d},B(s)}finally{e.isRefreshing=!1}}async function q(t){e.error="",e.success="";const s=o(t,"email"),r=o(t,"password");e.login={email:s,password:r},e.isSubmitting=!0,l();try{const n=await m("/api/auth/login",{method:"POST",body:JSON.stringify({email:s,password:r})});N(n),await f(),e.login.password="",e.success="Вход выполнен."}catch(n){e.error=b(n)}finally{e.isSubmitting=!1,l()}}async function O(t){e.error="",e.success="";const s=o(t,"userName"),r=o(t,"email"),n=o(t,"password"),a=o(t,"confirmPassword");if(e.register={userName:s,email:r,password:n,confirmPassword:a},n!==a){e.error="Пароли должны совпадать.",l();return}e.isSubmitting=!0,l();try{const c=await m("/api/auth/register",{method:"POST",body:JSON.stringify({userName:s,email:r,password:n})});N(c),await f(),e.register.password="",e.register.confirmPassword="",e.success="Аккаунт создан."}catch(c){e.error=b(c)}finally{e.isSubmitting=!1,l()}}async function E(t){e.error="",e.success="",e.profile=K(t),e.isSubmitting=!0,l();try{await m("/api/profile",{method:"PUT",body:JSON.stringify({firstName:e.profile.firstName,lastName:e.profile.lastName,middleName:e.profile.middleName,nickname:e.profile.nickname,bio:e.profile.bio,avatarUrl:e.profile.avatarUrl,contactEmail:e.profile.contactEmail,telegramHandle:e.profile.telegramHandle,phoneNumber:e.profile.phoneNumber,studentTicketNumber:w(e.profile.studentTicketNumber),groupId:w(e.profile.groupId)})}),await f(),e.success="Профиль обновлён."}catch(s){e.error=b(s)}finally{e.isSubmitting=!1,l()}}async function U(t){e.error="",e.success="",e.createTeam={name:o(t,"name"),description:o(t,"description")},e.isSubmitting=!0,l();try{await m("/api/teams/create",{method:"POST",body:JSON.stringify(e.createTeam)}),e.createTeam={name:"",description:""},await f(),e.success="Команда создана."}catch(s){e.error=b(s)}finally{e.isSubmitting=!1,l()}}async function F(t){e.error="",e.success="",e.joinTeam={inviteCode:o(t,"inviteCode")},e.isSubmitting=!0,l();try{await m("/api/teams/join",{method:"POST",body:JSON.stringify(e.joinTeam)}),e.joinTeam={inviteCode:""},await f(),e.success="Вы вступили в команду."}catch(s){e.error=b(s)}finally{e.isSubmitting=!1,l()}}async function R(t){e.error="",e.success="",e.knowledge={title:o(t,"title"),description:o(t,"description"),type:o(t,"type"),publishToTeam:t.get("publishToTeam")==="on"},e.isSubmitting=!0,l();try{await m("/api/knowledge-posts",{method:"POST",body:JSON.stringify(e.knowledge)}),e.knowledge={title:"",description:"",type:"Эксперт",publishToTeam:!1},await f(),e.success="Публикация добавлена."}catch(s){e.error=b(s)}finally{e.isSubmitting=!1,l()}}async function j(t){e.error="",e.success="",e.helpRequest={toTeamId:o(t,"toTeamId"),description:o(t,"description"),bonusPoints:o(t,"bonusPoints")},e.isSubmitting=!0,l();try{await m("/api/help-requests",{method:"POST",body:JSON.stringify({toTeamId:Number(e.helpRequest.toTeamId),description:e.helpRequest.description,bonusPoints:Number(e.helpRequest.bonusPoints)})}),e.helpRequest={toTeamId:"",description:"",bonusPoints:"0"},await f(),e.success="Запрос на помощь создан."}catch(s){e.error=b(s)}finally{e.isSubmitting=!1,l()}}async function L(t){e.error="",e.success="",e.checkIn={weekNumber:o(t,"weekNumber"),reportText:o(t,"reportText")},e.isSubmitting=!0,l();try{await m("/api/checkins",{method:"POST",body:JSON.stringify({weekNumber:Number(e.checkIn.weekNumber),reportText:e.checkIn.reportText})}),e.checkIn={weekNumber:"",reportText:""},await f(),e.success="Чек-ин сохранён."}catch(s){e.error=b(s)}finally{e.isSubmitting=!1,l()}}async function A(t){e.error="",e.success="",e.vote={toUserId:o(t,"toUserId"),score:o(t,"score")},e.isSubmitting=!0,l();try{await m("/api/votes",{method:"POST",body:JSON.stringify({toUserId:Number(e.vote.toUserId),score:Number(e.vote.score)})}),e.vote={toUserId:"",score:"5"},await f(),e.success="Голос отправлен."}catch(s){e.error=b(s)}finally{e.isSubmitting=!1,l()}}function l(){$&&($.innerHTML=e.dashboard?H():C(),J())}function C(){return`
        <div class="shell">
            <section class="hero">
                <div class="hero-copy">
                    <span class="eyebrow">Командный зачёт УрФУ</span>
                    <h1>Рабочий фронтенд для реального API, а не статичный макет.</h1>
                    <p class="lead">
                        Вход, регистрация, профиль, команда, биржа знаний, взаимопомощь, чек-ины и голосование
                        теперь работают через ASP.NET backend.
                    </p>
                    <div class="hero-points">
                        <div class="hero-point">
                            <strong>&lt; 2 сек</strong>
                            <span>одна точка входа в API</span>
                        </div>
                        <div class="hero-point">
                            <strong>JWT</strong>
                            <span>сохранение и восстановление сессии</span>
                        </div>
                        <div class="hero-point">
                            <strong>MVP</strong>
                            <span>основные модули платформы на одном экране</span>
                        </div>
                    </div>
                </div>
                <section class="auth-card">
                    <div class="auth-tabs">
                        <button class="tab ${e.mode==="login"?"tab-active":""}" type="button" data-action="switch-mode" data-mode="login">Вход</button>
                        <button class="tab ${e.mode==="register"?"tab-active":""}" type="button" data-action="switch-mode" data-mode="register">Регистрация</button>
                    </div>
                    ${S()}
                    ${e.mode==="login"?`
                                <form id="loginForm" class="stack">
                                    ${u("Email","email","email",e.login.email,{autocomplete:"email",required:!0})}
                                    ${u("Пароль","password","password",e.login.password,{autocomplete:"current-password",required:!0})}
                                    <button class="button button-primary" type="submit" ${e.isSubmitting?"disabled":""}>
                                        ${e.isSubmitting?"Входим...":"Войти"}
                                    </button>
                                </form>
                            `:`
                                <form id="registerForm" class="stack">
                                    ${u("Имя пользователя","userName","text",e.register.userName,{autocomplete:"username",required:!0})}
                                    ${u("Email","email","email",e.register.email,{autocomplete:"email",required:!0})}
                                    ${u("Пароль","password","password",e.register.password,{autocomplete:"new-password",required:!0})}
                                    ${u("Повтор пароля","confirmPassword","password",e.register.confirmPassword,{autocomplete:"new-password",required:!0})}
                                    <button class="button button-primary" type="submit" ${e.isSubmitting?"disabled":""}>
                                        ${e.isSubmitting?"Создаём...":"Создать аккаунт"}
                                    </button>
                                </form>
                            `}
                    <p class="muted">
                        API: <code>${i("через /api proxy")}</code>
                    </p>
                </section>
            </section>
        </div>
    `}function H(){var p;const t=e.dashboard;if(!t)return"";const s=t.profile,r=!!t.myTeam,n=(((p=t.myTeam)==null?void 0:p.members)??[]).filter(d=>d.userId!==s.id).map(d=>`<option value="${d.userId}">${i(d.userName)}${d.isCaptain?" • капитан":""}</option>`).join(""),a=t.teams.filter(d=>{var h;return d.id!==((h=t.myTeam)==null?void 0:h.id)}).map(d=>`<option value="${d.id}">${i(d.name)} (#${d.id})</option>`).join(""),c=t.groups.map(d=>`<option value="${d.id}" ${String(d.id)===e.profile.groupId?"selected":""}>${i(d.title)} • ${i(d.faculty)}</option>`).join("");return`
        <div class="shell shell-dashboard">
            <header class="topbar">
                <div>
                    <span class="eyebrow">Личный кабинет</span>
                    <h1>${i(G(s))}</h1>
                    <p class="lead">
                        ${i(s.email)} · ${i(s.role)} ·
                        КРК команды: <strong>${s.teamScore}</strong>
                    </p>
                </div>
                <div class="topbar-actions">
                    <button class="button button-secondary" type="button" data-action="refresh-dashboard" ${e.isRefreshing?"disabled":""}>
                        ${e.isRefreshing?"Обновляем...":"Обновить"}
                    </button>
                    <button class="button button-ghost" type="button" data-action="logout">Выйти</button>
                </div>
            </header>

            ${S()}

            <section class="stats-grid">
                ${y("Команд",String(t.teams.length),"доступно в общем рейтинге")}
                ${y("Публикаций",String(t.knowledgePosts.length),"на бирже знаний")}
                ${y("Запросов на помощь",String(t.helpRequests.length),"между командами")}
                ${y("Голосов",String(t.votes.length),"внутри команды")}
            </section>

            <section class="panel-grid">
                <article class="panel panel-wide">
                    <div class="panel-head">
                        <div>
                            <span class="eyebrow">Профиль</span>
                            <h2>Данные студента</h2>
                        </div>
                        <span class="badge">${i(s.groupTitle||"Группа не указана")}</span>
                    </div>
                    <form id="profileForm" class="form-grid">
                        ${u("Имя","firstName","text",e.profile.firstName)}
                        ${u("Фамилия","lastName","text",e.profile.lastName)}
                        ${u("Отчество","middleName","text",e.profile.middleName)}
                        ${u("Ник","nickname","text",e.profile.nickname)}
                        ${u("Email для связи","contactEmail","email",e.profile.contactEmail)}
                        ${u("Telegram","telegramHandle","text",e.profile.telegramHandle)}
                        ${u("Телефон","phoneNumber","tel",e.profile.phoneNumber)}
                        ${u("Ссылка на аватар","avatarUrl","url",e.profile.avatarUrl)}
                        ${u("Номер студбилета","studentTicketNumber","number",e.profile.studentTicketNumber)}
                        <label class="field">
                            <span>Учебная группа</span>
                            <select name="groupId">
                                <option value="">Не выбрана</option>
                                ${c}
                            </select>
                        </label>
                        <label class="field field-full">
                            <span>О себе</span>
                            <textarea name="bio" rows="4" placeholder="Чем полезен команде">${i(e.profile.bio)}</textarea>
                        </label>
                        <div class="field-actions field-full">
                            <button class="button button-primary" type="submit" ${e.isSubmitting?"disabled":""}>Сохранить профиль</button>
                        </div>
                    </form>
                </article>

                <article class="panel">
                    <div class="panel-head">
                        <div>
                            <span class="eyebrow">Команда</span>
                            <h2>${i(s.teamName||"Команда не выбрана")}</h2>
                        </div>
                        <span class="badge">${r?`invite ${i(s.teamInviteCode)}`:"MVP"}</span>
                    </div>
                    ${r&&t.myTeam?`
                                <p class="panel-text">${i(t.myTeam.description||"Описание пока не заполнено.")}</p>
                                <ul class="list">
                                    <li>Капитан: ${i(t.myTeam.captainUserName||"не назначен")}</li>
                                    <li>Участников: ${t.myTeam.memberCount}</li>
                                    <li>Счёт: ${t.myTeam.score}</li>
                                </ul>
                                <div class="chips">
                                    ${t.myTeam.members.map(d=>`<span class="chip">${i(d.userName)}</span>`).join("")}
                                </div>
                            `:`
                                <form id="createTeamForm" class="stack">
                                    ${u("Название команды","name","text",e.createTeam.name,{required:!0})}
                                    <label class="field">
                                        <span>Описание</span>
                                        <textarea name="description" rows="4" placeholder="Чем занимается команда">${i(e.createTeam.description)}</textarea>
                                    </label>
                                    <button class="button button-primary" type="submit" ${e.isSubmitting?"disabled":""}>Создать команду</button>
                                </form>
                                <form id="joinTeamForm" class="stack compact-top">
                                    ${u("Invite code","inviteCode","text",e.joinTeam.inviteCode,{required:!0})}
                                    <button class="button button-secondary" type="submit" ${e.isSubmitting?"disabled":""}>Вступить в команду</button>
                                </form>
                            `}
                </article>

                <article class="panel">
                    <div class="panel-head">
                        <div>
                            <span class="eyebrow">Биржа знаний</span>
                            <h2>Новая публикация</h2>
                        </div>
                    </div>
                    <form id="knowledgeForm" class="stack">
                        ${u("Заголовок","title","text",e.knowledge.title,{required:!0})}
                        ${u("Тип","type","text",e.knowledge.type,{required:!0})}
                        <label class="field">
                            <span>Описание</span>
                            <textarea name="description" rows="4" placeholder="Что именно вы умеете">${i(e.knowledge.description)}</textarea>
                        </label>
                        <label class="checkbox">
                            <input type="checkbox" name="publishToTeam" ${e.knowledge.publishToTeam?"checked":""}>
                            <span>Привязать публикацию к моей команде</span>
                        </label>
                        <button class="button button-primary" type="submit" ${e.isSubmitting?"disabled":""}>Опубликовать</button>
                    </form>
                </article>

                <article class="panel">
                    <div class="panel-head">
                        <div>
                            <span class="eyebrow">Спасение</span>
                            <h2>Запрос на помощь</h2>
                        </div>
                    </div>
                    <form id="helpRequestForm" class="stack">
                        <label class="field">
                            <span>Команда-цель</span>
                            <select name="toTeamId" ${a?"":"disabled"}>
                                <option value="">Выберите команду</option>
                                ${a}
                            </select>
                        </label>
                        ${u("Бонусные баллы","bonusPoints","number",e.helpRequest.bonusPoints)}
                        <label class="field">
                            <span>Описание задачи</span>
                            <textarea name="description" rows="4" placeholder="Какая помощь нужна">${i(e.helpRequest.description)}</textarea>
                        </label>
                        <button class="button button-primary" type="submit" ${e.isSubmitting||!a?"disabled":""}>Отправить запрос</button>
                    </form>
                </article>

                <article class="panel">
                    <div class="panel-head">
                        <div>
                            <span class="eyebrow">Check-in</span>
                            <h2>Недельный отчёт</h2>
                        </div>
                    </div>
                    <form id="checkInForm" class="stack">
                        ${u("Неделя","weekNumber","number",e.checkIn.weekNumber)}
                        <label class="field">
                            <span>Отчёт</span>
                            <textarea name="reportText" rows="4" placeholder="Что сделала команда за неделю">${i(e.checkIn.reportText)}</textarea>
                        </label>
                        <button class="button button-primary" type="submit" ${e.isSubmitting?"disabled":""}>Сохранить check-in</button>
                    </form>
                </article>

                <article class="panel">
                    <div class="panel-head">
                        <div>
                            <span class="eyebrow">Голосование</span>
                            <h2>Оценка вклада</h2>
                        </div>
                    </div>
                    <form id="voteForm" class="stack">
                        <label class="field">
                            <span>Участник</span>
                            <select name="toUserId" ${n?"":"disabled"}>
                                <option value="">Выберите участника</option>
                                ${n}
                            </select>
                        </label>
                        <label class="field">
                            <span>Оценка</span>
                            <select name="score">
                                ${[1,2,3,4,5].map(d=>`<option value="${d}" ${e.vote.score===String(d)?"selected":""}>${d}</option>`).join("")}
                            </select>
                        </label>
                        <button class="button button-primary" type="submit" ${e.isSubmitting||!n?"disabled":""}>Отправить голос</button>
                    </form>
                </article>
            </section>

            <section class="panel-grid bottom-grid">
                <article class="panel">
                    <div class="panel-head">
                        <div>
                            <span class="eyebrow">Лента</span>
                            <h2>Биржа знаний</h2>
                        </div>
                    </div>
                    ${_(t.knowledgePosts)}
                </article>

                <article class="panel">
                    <div class="panel-head">
                        <div>
                            <span class="eyebrow">Справочник</span>
                            <h2>Все команды</h2>
                        </div>
                    </div>
                    ${V(t.teams)}
                </article>

                <article class="panel">
                    <div class="panel-head">
                        <div>
                            <span class="eyebrow">Активность</span>
                            <h2>Запросы, check-ins, голоса</h2>
                        </div>
                    </div>
                    ${z(t.helpRequests,t.checkIns,t.votes)}
                </article>
            </section>
        </div>
    `}function J(){var t,s;document.querySelectorAll("[data-action='switch-mode']").forEach(r=>{r.addEventListener("click",()=>{const n=r.dataset.mode;(n==="login"||n==="register")&&(e.mode=n,e.error="",e.success="",l())})}),g("loginForm",q),g("registerForm",O),g("profileForm",E),g("createTeamForm",U),g("joinTeamForm",F),g("knowledgeForm",R),g("helpRequestForm",j),g("checkInForm",L),g("voteForm",A),(t=document.querySelector("[data-action='logout']"))==null||t.addEventListener("click",()=>{T(),e.success="Сессия завершена.",e.error="",l()}),(s=document.querySelector("[data-action='refresh-dashboard']"))==null||s.addEventListener("click",async()=>{e.error="",e.success="",l();try{await f(!0),e.success="Данные обновлены."}catch(r){e.error=b(r)}finally{l()}})}function g(t,s){const r=document.getElementById(t);r instanceof HTMLFormElement&&r.addEventListener("submit",async n=>{n.preventDefault(),await s(new FormData(r))})}async function m(t,s){var a;const r=new Headers(s==null?void 0:s.headers);r.set("Accept","application/json"),s!=null&&s.body&&!r.has("Content-Type")&&r.set("Content-Type","application/json"),(a=e.session)!=null&&a.token&&r.set("Authorization",`Bearer ${e.session.token}`);const n=await fetch(`${x}${t}`,{...s,headers:r});if(!n.ok){let c=`Ошибка ${n.status}`;try{const p=await n.json();c=p.detail||p.title||p.message||c}catch{c=n.statusText||c}throw new Error(c)}if(n.status!==204)return await n.json()}function N(t){e.session={token:t.token,expiresAtUtc:t.expiresAtUtc},localStorage.setItem(v,JSON.stringify(e.session))}function M(){const t=localStorage.getItem(v);if(!t)return null;try{const s=JSON.parse(t);return!s.token||!s.expiresAtUtc?null:s}catch{return null}}function T(){e.session=null,e.dashboard=null,localStorage.removeItem(v)}function B(t){e.profile={firstName:t.firstName??"",lastName:t.lastName??"",middleName:t.middleName??"",nickname:t.nickname??"",bio:t.bio??"",avatarUrl:t.avatarUrl??"",contactEmail:t.contactEmail??"",telegramHandle:t.telegramHandle??"",phoneNumber:t.phoneNumber??"",studentTicketNumber:t.studentTicketNumber?String(t.studentTicketNumber):"",groupId:t.groupId?String(t.groupId):""}}function K(t){return{firstName:o(t,"firstName"),lastName:o(t,"lastName"),middleName:o(t,"middleName"),nickname:o(t,"nickname"),bio:o(t,"bio"),avatarUrl:o(t,"avatarUrl"),contactEmail:o(t,"contactEmail"),telegramHandle:o(t,"telegramHandle"),phoneNumber:o(t,"phoneNumber"),studentTicketNumber:o(t,"studentTicketNumber"),groupId:o(t,"groupId")}}function w(t){if(!t.trim())return null;const s=Number(t);return Number.isFinite(s)?s:null}function o(t,s){const r=t.get(s);return typeof r=="string"?r.trim():""}function u(t,s,r,n,a={}){return`
        <label class="field">
            <span>${i(t)}</span>
            <input
                name="${i(s)}"
                type="${i(r)}"
                value="${i(n)}"
                ${a.autocomplete?`autocomplete="${i(a.autocomplete)}"`:""}
                ${a.required?"required":""}
            >
        </label>
    `}function y(t,s,r){return`
        <article class="stat-card">
            <span>${i(t)}</span>
            <strong>${i(s)}</strong>
            <small>${i(r)}</small>
        </article>
    `}function _(t){return t.length?`
        <div class="feed">
            ${t.slice(0,8).map(s=>`
                <article class="feed-item">
                    <div class="feed-meta">${k(s.createdAtUtc)} · ${i(s.type)}</div>
                    <h3>${i(s.title)}</h3>
                    <p>${i(s.description)}</p>
                    <div class="feed-meta">${i(s.userName)}${s.teamName?` · ${i(s.teamName)}`:""}</div>
                </article>
            `).join("")}
        </div>
    `:'<p class="empty-state">Публикаций пока нет.</p>'}function V(t){return t.length?`
        <div class="feed">
            ${t.slice(0,8).map(s=>`
                <article class="feed-item">
                    <div class="feed-meta">#${s.id} · score ${s.score}</div>
                    <h3>${i(s.name)}</h3>
                    <p>${i(s.description||"Описание отсутствует.")}</p>
                    <div class="feed-meta">Капитан: ${i(s.captainUserName||"не назначен")} · участников: ${s.memberCount}</div>
                </article>
            `).join("")}
        </div>
    `:'<p class="empty-state">Команды ещё не созданы.</p>'}function z(t,s,r){const n=[...t.slice(0,3).map(a=>({title:`${a.fromTeamName} → ${a.toTeamName}`,text:`${a.description} · ${a.status} · +${a.bonusPoints}`,date:a.createdAtUtc})),...s.slice(0,3).map(a=>({title:`${a.teamName}, неделя ${a.weekNumber}`,text:a.reportText,date:a.createdAtUtc})),...r.slice(0,3).map(a=>({title:`${a.fromUserName} → ${a.toUserName}`,text:`Оценка: ${a.score}`,date:a.createdAtUtc}))].sort((a,c)=>new Date(c.date).getTime()-new Date(a.date).getTime());return n.length?`
        <div class="feed">
            ${n.map(a=>`
                <article class="feed-item">
                    <div class="feed-meta">${k(a.date)}</div>
                    <h3>${i(a.title)}</h3>
                    <p>${i(a.text)}</p>
                </article>
            `).join("")}
        </div>
    `:'<p class="empty-state">Ещё нет активности по модулям.</p>'}function S(){return e.error?`<div class="notice notice-error">${i(e.error)}</div>`:e.success?`<div class="notice notice-success">${i(e.success)}</div>`:e.isLoading?'<div class="notice">Загружаю данные...</div>':""}function G(t){return[t.firstName,t.lastName].filter(Boolean).join(" ")||t.userName}function k(t){return new Intl.DateTimeFormat("ru-RU",{dateStyle:"medium",timeStyle:"short"}).format(new Date(t))}function b(t){return t instanceof Error?t.message:"Произошла ошибка."}function i(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}

import"./start-BONEZAgk.js";const r="team-exam-auth",d="",p=["ПРОФИЛЬ","КОМАНДА","РЕЙТИНГ","СОБЫТИЯ","НОВОСТИ"],v=Array.from({length:20},()=>({title:"НАЗВАНИЕ"})),c={profile:null},s=document.getElementById("accountContent");b();function f(t){return t instanceof HTMLElement}function m(t){return t instanceof HTMLButtonElement}function g(t,e){const a=document.querySelector(t);if(!e(a))throw new Error(`Required element not found: ${t}`);return a}async function b(){const t=y();if(!t){window.location.replace("/index.html");return}try{c.profile=await E("/api/auth/me",{headers:{Authorization:`Bearer ${t.token}`}}),h()}catch{u(),window.location.replace("/index.html")}}function h(){if(!f(s))return;const t=c.profile,e=$(t),a=(t==null?void 0:t.groupTitle)||"АКАДЕМ. ГРУППА",n=(t==null?void 0:t.teamName)||"КОМАНДА";s.innerHTML=`
        <div class="profile-page">
            <aside class="profile-sidebar">
                <nav class="profile-nav" aria-label="Навигация профиля">
                    ${p.map(o=>`<button class="profile-nav-button" type="button">${o}</button>`).join("")}
                </nav>
                <div class="profile-sidebar-footer">
                    <button class="profile-nav-button" type="button">НАСТРОЙКИ</button>
                    <button class="profile-nav-button profile-nav-button-exit" id="logoutButton" type="button">ПОКИНУТЬ</button>
                </div>
            </aside>

            <section class="profile-main">
                <div class="profile-top">
                    <div class="profile-photo-card">
                        ${w((t==null?void 0:t.avatarUrl)||"")}
                    </div>

                    <div class="profile-info-grid">
                        <div class="profile-stat-row">
                            <div class="profile-stat-label">ЛИГА</div>
                            <div class="profile-stat-value"></div>
                        </div>
                        <div class="profile-stat-row">
                            <div class="profile-stat-label">БАЛЛЫ</div>
                            <div class="profile-stat-value"></div>
                        </div>
                        <div class="profile-stat-row">
                            <div class="profile-stat-label profile-stat-label-accent">РЕЙТИНГ</div>
                            <div class="profile-stat-value"></div>
                        </div>
                    </div>
                </div>

                <div class="profile-bottom-pills">
                    <div class="profile-pill">${l(e)}</div>
                    <div class="profile-pill">${l(a)}</div>
                    <div class="profile-pill profile-pill-accent">${l(n)}</div>
                </div>

                <section class="achievement-panel">
                    <h2>ДОСТИЖЕНИЯ</h2>
                    <div class="achievement-scroller" aria-label="Список достижений">
                        ${v.map(o=>`
                            <article class="achievement-card">
                                <div class="achievement-icon"></div>
                                <strong>${l(o.title)}</strong>
                            </article>
                        `).join("")}
                    </div>
                </section>
            </section>
        </div>
    `,g("#logoutButton",m).addEventListener("click",()=>{u(),window.location.replace("/index.html")})}function w(t){const e=t.trim();return e?`<img class="profile-avatar-image" src="${l(e)}" alt="Аватар профиля">`:""}async function E(t,e){const a=new Headers(e==null?void 0:e.headers);a.set("Accept","application/json");const n=await fetch(`${d}${t}`,{...e,headers:a});if(!n.ok){let i=`Ошибка ${n.status}`;try{const o=await n.json();i=o.detail||o.message||o.title||i}catch{i=n.statusText||i}throw new Error(i)}return await n.json()}function y(){const t=localStorage.getItem(r);if(!t)return null;try{const e=JSON.parse(t);return!e.token||!e.expiresAtUtc?null:e}catch{return null}}function u(){localStorage.removeItem(r)}function $(t){return t&&([t.firstName,t.lastName].filter(Boolean).join(" ").trim()||t.nickname||t.userName)||"ИМЯ ФАМИЛИЯ"}function l(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}

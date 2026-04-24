import "../styles/start.css";

interface UserProfileResponse {
    id: number;
    userName: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
    middleName: string;
    nickname: string;
    bio: string;
    avatarUrl: string;
    contactEmail: string;
    telegramHandle: string;
    phoneNumber: string;
    studentTicketNumber: number | null;
    groupId: number | null;
    groupTitle: string;
    teamId: number | null;
    teamName: string;
    teamInviteCode: string;
    isCaptain: boolean;
    teamScore: number;
}

interface ProblemLike {
    title?: string;
    detail?: string;
    message?: string;
}

interface SessionState {
    token: string;
    expiresAtUtc: string;
}

interface ProfileState {
    profile: UserProfileResponse | null;
}

const SESSION_KEY = "team-exam-auth";
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ?? "";
const ACCOUNT_MENU_ITEMS = ["ПРОФИЛЬ", "КОМАНДА", "РЕЙТИНГ", "СОБЫТИЯ", "НОВОСТИ"] as const;
const ACHIEVEMENT_ITEMS = Array.from({ length: 20 }, () => ({
    title: "НАЗВАНИЕ"
}));

const state: ProfileState = {
    profile: null
};

const accountContent = document.getElementById("accountContent");

void bootstrap();

function isHTMLElement(node: Element | null): node is HTMLElement {
    return node instanceof HTMLElement;
}

function isHTMLButtonElement(node: Element | null): node is HTMLButtonElement {
    return node instanceof HTMLButtonElement;
}

function getRequiredElement<T extends Element>(selector: string, guard: (node: Element | null) => node is T): T {
    const node = document.querySelector(selector);
    if (!guard(node)) {
        throw new Error(`Required element not found: ${selector}`);
    }

    return node;
}

async function bootstrap(): Promise<void> {
    const session = loadSession();
    if (!session) {
        window.location.replace("/index.html");
        return;
    }

    try {
        state.profile = await request<UserProfileResponse>("/api/auth/me", {
            headers: {
                Authorization: `Bearer ${session.token}`
            }
        });
        render();
    } catch {
        clearSession();
        window.location.replace("/index.html");
    }
}

function render(): void {
    if (!isHTMLElement(accountContent)) {
        return;
    }

    const profile = state.profile;
    const displayName = getDisplayName(profile);
    const groupTitle = profile?.groupTitle || "АКАДЕМ. ГРУППА";
    const teamTitle = profile?.teamName || "КОМАНДА";

    accountContent.innerHTML = `
        <div class="profile-page">
            <aside class="profile-sidebar">
                <nav class="profile-nav" aria-label="Навигация профиля">
                    ${ACCOUNT_MENU_ITEMS.map((item) => `<button class="profile-nav-button" type="button">${item}</button>`).join("")}
                </nav>
                <div class="profile-sidebar-footer">
                    <button class="profile-nav-button" type="button">НАСТРОЙКИ</button>
                    <button class="profile-nav-button profile-nav-button-exit" id="logoutButton" type="button">ПОКИНУТЬ</button>
                </div>
            </aside>

            <section class="profile-main">
                <div class="profile-top">
                    <div class="profile-photo-card">
                        ${renderAvatar(profile?.avatarUrl || "")}
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
                    <div class="profile-pill">${escapeHtml(displayName)}</div>
                    <div class="profile-pill">${escapeHtml(groupTitle)}</div>
                    <div class="profile-pill profile-pill-accent">${escapeHtml(teamTitle)}</div>
                </div>

                <section class="achievement-panel">
                    <h2>ДОСТИЖЕНИЯ</h2>
                    <div class="achievement-scroller" aria-label="Список достижений">
                        ${ACHIEVEMENT_ITEMS.map((achievement) => `
                            <article class="achievement-card">
                                <div class="achievement-icon"></div>
                                <strong>${escapeHtml(achievement.title)}</strong>
                            </article>
                        `).join("")}
                    </div>
                </section>
            </section>
        </div>
    `;

    const logoutButton = getRequiredElement<HTMLButtonElement>("#logoutButton", isHTMLButtonElement);
    logoutButton.addEventListener("click", () => {
        clearSession();
        window.location.replace("/index.html");
    });
}

function renderAvatar(avatarUrl: string): string {
    const safeUrl = avatarUrl.trim();
    if (!safeUrl) {
        return "";
    }

    return `<img class="profile-avatar-image" src="${escapeHtml(safeUrl)}" alt="Аватар профиля">`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const headers = new Headers(init?.headers);
    headers.set("Accept", "application/json");

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...init,
        headers
    });

    if (!response.ok) {
        let message = `Ошибка ${response.status}`;

        try {
            const body = await response.json() as ProblemLike;
            message = body.detail || body.message || body.title || message;
        } catch {
            message = response.statusText || message;
        }

        throw new Error(message);
    }

    return await response.json() as T;
}

function loadSession(): SessionState | null {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) {
        return null;
    }

    try {
        const parsed = JSON.parse(raw) as SessionState;
        if (!parsed.token || !parsed.expiresAtUtc) {
            return null;
        }

        return parsed;
    } catch {
        return null;
    }
}

function clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
}

function getDisplayName(profile: UserProfileResponse | null): string {
    if (!profile) {
        return "ИМЯ ФАМИЛИЯ";
    }

    const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim();
    return fullName || profile.nickname || profile.userName || "ИМЯ ФАМИЛИЯ";
}

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

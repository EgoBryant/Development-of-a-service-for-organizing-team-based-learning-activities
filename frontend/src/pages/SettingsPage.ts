import type { ProfileEdits } from "../types/profile";
import { escapeHtml } from "../utils/html";

type SettingsFieldDisplay = {
    text: string;
    isPlaceholder: boolean;
};

function getAvatarLocationDisplay(avatarDataUrl: string | null, fileName: string): string {
    const trimmedFileName = fileName.trim();
    if (trimmedFileName) {
        return trimmedFileName;
    }

    if (!avatarDataUrl) {
        return "";
    }

    if (avatarDataUrl.startsWith("data:")) {
        return "Локальное фото";
    }

    try {
        const url = new URL(avatarDataUrl, window.location.origin);
        const segment = url.pathname.split("/").filter(Boolean).pop();
        return segment ? decodeURIComponent(segment) : "Фото профиля";
    } catch {
        return "Фото профиля";
    }
}

export function getSettingsPhotoDisplay(avatarDataUrl: string | null, fileName = ""): SettingsFieldDisplay {
    const location = getAvatarLocationDisplay(avatarDataUrl, fileName);
    return location
        ? { text: location, isPlaceholder: false }
        : { text: "ФОТО", isPlaceholder: true };
}

export function getSettingsNameDisplay(fullName: string): SettingsFieldDisplay {
    const trimmed = fullName.trim();
    return trimmed
        ? { text: trimmed, isPlaceholder: false }
        : { text: "ИМЯ ФАМИЛИЯ", isPlaceholder: true };
}

export function getSettingsGroupDisplay(group: string): SettingsFieldDisplay {
    const trimmed = group.trim();
    return trimmed
        ? { text: trimmed, isPlaceholder: false }
        : { text: "ГРУППА", isPlaceholder: true };
}

export function getSettingsTeamNameDisplay(teamName: string): SettingsFieldDisplay {
    const trimmed = teamName.trim();
    return trimmed
        ? { text: trimmed, isPlaceholder: false }
        : { text: "НАЗВАНИЕ КОМАНДЫ", isPlaceholder: true };
}

function renderSettingsFieldValue(display: SettingsFieldDisplay, dataAttr: string): string {
    const stateClass = display.isPlaceholder ? "is-placeholder" : "is-filled";
    return `<span class="settings-field-value ${stateClass}" ${dataAttr}>${escapeHtml(display.text)}</span>`;
}

export function renderSettingsPageMain(
    statusHtml: string,
    draft: ProfileEdits,
    avatarFileName = "",
    teamName: string | null = null
): string {
    const photoDisplay = getSettingsPhotoDisplay(draft.avatarDataUrl, avatarFileName);
    const nameDisplay = getSettingsNameDisplay(draft.fullName);
    const groupDisplay = getSettingsGroupDisplay(draft.group);
    const teamBlockHtml =
        teamName !== null
            ? `
                <article class="settings-card settings-card--team">
                    <h2 class="settings-card-title">Команда</h2>
                    <div class="settings-fields">
                        <div class="settings-field-row" data-settings-row="teamName">
                            ${renderSettingsFieldValue(getSettingsTeamNameDisplay(teamName), "data-settings-team-name-label")}
                            <input
                                id="settingsTeamNameInput"
                                class="settings-field-input"
                                type="text"
                                value="${escapeHtml(teamName)}"
                                maxlength="150"
                                autocomplete="organization"
                            >
                            <button type="button" class="settings-field-action" data-settings-edit="teamName">ИЗМЕНИТЬ</button>
                        </div>
                        <div class="settings-team-disband-row">
                            <button type="button" class="settings-team-disband-btn" id="settingsDisbandTeamButton">УДАЛИТЬ КОМАНДУ</button>
                        </div>
                    </div>
                </article>`
            : "";

    return `
        <section class="profile-main settings-dashboard-main settings-page-shell">
            ${statusHtml}
            <div class="settings-page">
                <article class="settings-card settings-card--profile">
                    <h2 class="settings-card-title">Профиль</h2>
                    <div class="settings-fields">
                        <div class="settings-field-block settings-field-block--photo">
                            <div class="settings-field-row settings-field-row--photo" data-settings-row="photo">
                                ${renderSettingsFieldValue(photoDisplay, "data-settings-photo-label")}
                                <input id="settingsProfileAvatarInput" type="file" accept="image/*" hidden>
                                <button type="button" class="settings-field-action" data-settings-edit="photo">ВЫБРАТЬ</button>
                            </div>
                            <p class="settings-field-error" id="settingsPhotoError" hidden></p>
                        </div>
                        <div class="settings-field-row" data-settings-row="name">
                            ${renderSettingsFieldValue(nameDisplay, "data-settings-name-label")}
                            <input
                                id="profileNameInput"
                                class="settings-field-input"
                                type="text"
                                value="${escapeHtml(draft.fullName)}"
                                autocomplete="name"
                            >
                            <button type="button" class="settings-field-action" data-settings-edit="name">ИЗМЕНИТЬ</button>
                        </div>
                        <div class="settings-field-row" data-settings-row="group">
                            ${renderSettingsFieldValue(groupDisplay, "data-settings-group-label")}
                            <input
                                id="profileGroupInput"
                                class="settings-field-input"
                                type="text"
                                value="${escapeHtml(draft.group)}"
                                placeholder="РИ-150909"
                                maxlength="9"
                                autocapitalize="characters"
                                spellcheck="false"
                            >
                            <button type="button" class="settings-field-action" data-settings-edit="group">ИЗМЕНИТЬ</button>
                        </div>
                    </div>
                </article>
                ${teamBlockHtml}
            </div>
        </section>`;
}

export function renderMobileTeamSettingsSection(teamName: string): string {
    return `
        <div class="profile-modal-team-section">
            <h3 class="profile-modal-section-title">Команда</h3>
            <input
                id="settingsTeamNameInput"
                class="profile-modal-input profile-modal-input--team-name"
                type="text"
                placeholder="НАЗВАНИЕ КОМАНДЫ"
                value="${escapeHtml(teamName)}"
                maxlength="150"
                autocomplete="organization"
            >
            <button
                type="button"
                class="profile-team-flow-btn profile-team-flow-btn--search profile-modal-team-action"
                id="profileApplyTeamNameButton"
            >ИЗМЕНИТЬ</button>
            <button
                type="button"
                class="profile-modal-team-disband-btn"
                id="settingsDisbandTeamButton"
            >УДАЛИТЬ КОМАНДУ</button>
        </div>`;
}

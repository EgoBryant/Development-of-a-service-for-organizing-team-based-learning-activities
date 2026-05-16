import { getAppBridge } from "../app/bridge";
import { isRescueDraftComplete, renderRescueModal } from "../components/modals/RescueModal";
import { renderUserProfileCard, handleUserProfileTeamOpen } from "../components/profile/UserProfileCard";
import { handleTeamMemberClick, handleTeamRescueOpen, renderTeamProfileCard } from "../components/profile/TeamProfileCard";
import { renderTeamsRatingBlock } from "../components/rating/TeamsRatingBlock";
import { renderUsersRatingBlock } from "../components/rating/UsersRatingBlock";
import {
    backToRatingLeaderboard,
    closeRatingRescueModal,
    createEmptyRescueDraft,
    openRatingTeamProfile,
    openRatingUserProfile,
    ratingFlowState
} from "../state/ratingFlowState";
import type { RatingSortKey } from "../types/rating";
import {
    isHTMLButtonElement,
    isHTMLFormElement,
    isHTMLInputElement,
    isHTMLTextAreaElement
} from "../utils/dom";

function renderRatingBody(): string {
    if (ratingFlowState.view === "user" && ratingFlowState.selectedUserId) {
        return renderUserProfileCard(ratingFlowState.selectedUserId);
    }

    if (ratingFlowState.view === "team" && ratingFlowState.selectedTeamId) {
        return renderTeamProfileCard(ratingFlowState.selectedTeamId);
    }

    return `
        <div class="rating-panels-stack">
            ${renderTeamsRatingBlock()}
            ${renderUsersRatingBlock()}
        </div>`;
}

export function renderRatingPageMain(statusHtml: string): string {
    return `
        <section class="profile-main rating-dashboard-main rating-page">
            ${statusHtml}
            ${renderRatingBody()}
        </section>`;
}

export function renderRatingPageModals(): string {
    return ratingFlowState.rescueOpen ? renderRescueModal() : "";
}

function syncRescueDraftFromForm(root: HTMLElement): void {
    const topic = root.querySelector("#ratingRescueTopicInput");
    const tag = root.querySelector("#ratingRescueTagInput");
    const description = root.querySelector("#ratingRescueDescriptionInput");
    const format = root.querySelector("#ratingRescueFormatInput");
    const dateTime = root.querySelector("#ratingRescueDateTimeInput");

    if (isHTMLInputElement(topic)) {
        ratingFlowState.rescueDraft.topic = topic.value;
    }
    if (isHTMLInputElement(tag)) {
        ratingFlowState.rescueDraft.tag = tag.value;
    }
    if (isHTMLTextAreaElement(description)) {
        ratingFlowState.rescueDraft.description = description.value;
    }
    if (isHTMLInputElement(format)) {
        ratingFlowState.rescueDraft.format = format.value;
    }
    if (isHTMLInputElement(dateTime)) {
        ratingFlowState.rescueDraft.dateTime = dateTime.value;
    }
}

function restoreSearchFocus(root: HTMLElement): void {
    if (ratingFlowState.usersSearchFocus) {
        ratingFlowState.usersSearchFocus = false;
        const input = root.querySelector("#ratingUsersSearchInput");
        if (isHTMLInputElement(input)) {
            const cursor = input.value.length;
            input.focus();
            input.setSelectionRange(cursor, cursor);
        }
        return;
    }

    if (ratingFlowState.teamsSearchFocus) {
        ratingFlowState.teamsSearchFocus = false;
        const input = root.querySelector("#ratingTeamsSearchInput");
        if (isHTMLInputElement(input)) {
            const cursor = input.value.length;
            input.focus();
            input.setSelectionRange(cursor, cursor);
        }
    }
}

export function wireRatingPageEvents(root: HTMLElement): void {
    const bridge = getAppBridge();

    const usersSearch = root.querySelector("#ratingUsersSearchInput");
    if (isHTMLInputElement(usersSearch)) {
        usersSearch.addEventListener("input", () => {
            ratingFlowState.usersSearch = usersSearch.value;
            ratingFlowState.usersSearchFocus = true;
            bridge.render();
        });
    }

    const teamsSearch = root.querySelector("#ratingTeamsSearchInput");
    if (isHTMLInputElement(teamsSearch)) {
        teamsSearch.addEventListener("input", () => {
            ratingFlowState.teamsSearch = teamsSearch.value;
            ratingFlowState.teamsSearchFocus = true;
            bridge.render();
        });
    }

    root.querySelectorAll<HTMLButtonElement>("[data-rating-filter-toggle]").forEach((button) => {
        button.addEventListener("click", (event) => {
            event.stopPropagation();
            const block = button.dataset.ratingFilterToggle;
            if (block === "users") {
                ratingFlowState.usersFilterOpen = !ratingFlowState.usersFilterOpen;
                ratingFlowState.teamsFilterOpen = false;
            } else if (block === "teams") {
                ratingFlowState.teamsFilterOpen = !ratingFlowState.teamsFilterOpen;
                ratingFlowState.usersFilterOpen = false;
            }
            bridge.render();
        });
    });

    root.querySelectorAll<HTMLButtonElement>("[data-rating-sort-key]").forEach((button) => {
        button.addEventListener("click", () => {
            const block = button.dataset.ratingSort;
            const sortKey = button.dataset.ratingSortKey as RatingSortKey | undefined;
            if (!sortKey) {
                return;
            }
            if (block === "users") {
                ratingFlowState.usersSort = sortKey;
                ratingFlowState.usersFilterOpen = false;
            } else if (block === "teams") {
                ratingFlowState.teamsSort = sortKey;
                ratingFlowState.teamsFilterOpen = false;
            }
            bridge.render();
        });
    });

    if (ratingFlowState.view === "leaderboard") {
        root.querySelectorAll<HTMLButtonElement>("[data-rating-user-id]").forEach((button) => {
            button.addEventListener("click", () => {
                const userId = button.dataset.ratingUserId;
                if (!userId) {
                    return;
                }
                openRatingUserProfile(userId);
                bridge.render();
            });
        });

        root.querySelectorAll<HTMLButtonElement>("[data-rating-team-id]").forEach((button) => {
            button.addEventListener("click", () => {
                const teamId = button.dataset.ratingTeamId;
                if (!teamId) {
                    return;
                }
                openRatingTeamProfile(teamId);
                bridge.render();
            });
        });
    }

    const backBtn = root.querySelector("[data-rating-back]");
    if (isHTMLButtonElement(backBtn)) {
        backBtn.addEventListener("click", () => {
            backToRatingLeaderboard();
            bridge.render();
        });
    }

    root.querySelectorAll<HTMLButtonElement>("[data-rating-user-tab]").forEach((button) => {
        button.addEventListener("click", () => {
            const tab = button.dataset.ratingUserTab;
            if (tab === "rating" || tab === "achievements") {
                ratingFlowState.userProfileTab = tab;
                bridge.render();
            }
        });
    });

    root.querySelectorAll<HTMLButtonElement>("[data-rating-invite-user]").forEach((button) => {
        button.addEventListener("click", () => {
            bridge.setStatus("Приглашение отправлено (демо).");
            bridge.render();
        });
    });

    root.querySelectorAll<HTMLButtonElement>("[data-rating-open-team]").forEach((button) => {
        button.addEventListener("click", () => {
            const teamId = button.dataset.ratingOpenTeam ?? "";
            handleUserProfileTeamOpen(teamId);
        });
    });

    if (ratingFlowState.view === "team") {
        root.querySelectorAll<HTMLButtonElement>(".rating-team-member-row[data-rating-user-id]").forEach((button) => {
            button.addEventListener("click", () => {
                const userId = button.dataset.ratingUserId;
                if (!userId) {
                    return;
                }
                handleTeamMemberClick(userId);
                bridge.render();
            });
        });
    }

    root.querySelectorAll<HTMLButtonElement>("[data-rating-open-rescue]").forEach((button) => {
        button.addEventListener("click", () => {
            handleTeamRescueOpen();
        });
    });

    restoreSearchFocus(root);

    if (!ratingFlowState.rescueOpen) {
        return;
    }

    const closeRescue = root.querySelector("#ratingRescueCloseButton");
    if (isHTMLButtonElement(closeRescue)) {
        closeRescue.addEventListener("click", () => {
            closeRatingRescueModal();
            bridge.render();
        });
    }

    root.querySelectorAll<HTMLElement>("[data-close-rating-rescue]").forEach((node) => {
        node.addEventListener("click", () => {
            closeRatingRescueModal();
            bridge.render();
        });
    });

    const rescueForm = root.querySelector("#ratingRescueForm");
    const bindRescueInput = (selector: string, key: keyof typeof ratingFlowState.rescueDraft): void => {
        const el = root.querySelector(selector);
        if (isHTMLInputElement(el)) {
            el.addEventListener("input", () => {
                ratingFlowState.rescueDraft[key] = el.value;
                ratingFlowState.rescueShowError = false;
            });
        } else if (isHTMLTextAreaElement(el)) {
            el.addEventListener("input", () => {
                ratingFlowState.rescueDraft[key] = el.value;
                ratingFlowState.rescueShowError = false;
            });
        }
    };

    bindRescueInput("#ratingRescueTopicInput", "topic");
    bindRescueInput("#ratingRescueTagInput", "tag");
    bindRescueInput("#ratingRescueDescriptionInput", "description");
    bindRescueInput("#ratingRescueFormatInput", "format");
    bindRescueInput("#ratingRescueDateTimeInput", "dateTime");

    if (isHTMLFormElement(rescueForm)) {
        rescueForm.addEventListener("submit", (event) => {
            event.preventDefault();
            syncRescueDraftFromForm(root);

            if (!isRescueDraftComplete()) {
                ratingFlowState.rescueShowError = true;
                bridge.render();
                return;
            }

            ratingFlowState.rescueShowError = false;
            ratingFlowState.rescueDraft = createEmptyRescueDraft();
            closeRatingRescueModal();
            bridge.setStatus("Спасение: запрос помощи отправлен (демо).");
            bridge.render();
        });
    }
}

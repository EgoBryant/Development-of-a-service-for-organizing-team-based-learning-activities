import { getAppBridge } from "../app/bridge";
import { isRescueDraftComplete, renderRescueModal } from "../components/modals/RescueModal";
import { renderRatingLeaderboardBlock } from "../components/rating/RatingLeaderboardBlock";
import { handleTeamMemberClick, renderPublicTeamProfile } from "../components/rating/PublicTeamProfile";
import { renderPublicUserProfile } from "../components/rating/PublicUserProfile";
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
        return renderPublicUserProfile(ratingFlowState.selectedUserId);
    }

    if (ratingFlowState.view === "team" && ratingFlowState.selectedTeamId) {
        return renderPublicTeamProfile(ratingFlowState.selectedTeamId);
    }

    return renderRatingLeaderboardBlock();
}

function resolveRatingMainClass(): string {
    if (ratingFlowState.view === "user") {
        return "profile-main rating-dashboard-main rating-page rating-page--public-user";
    }
    if (ratingFlowState.view === "team") {
        return "profile-main team-dashboard-main team-page rating-page rating-page--public-team";
    }
    return "profile-main rating-dashboard-main rating-page";
}

export function renderRatingPageMain(statusHtml: string): string {
    return `
        <section class="${resolveRatingMainClass()}">
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
    const tab = ratingFlowState.leaderboardTab;
    const shouldFocus =
        (tab === "users" && ratingFlowState.usersSearchFocus) ||
        (tab === "teams" && ratingFlowState.teamsSearchFocus);

    if (!shouldFocus) {
        return;
    }

    if (tab === "users") {
        ratingFlowState.usersSearchFocus = false;
    } else {
        ratingFlowState.teamsSearchFocus = false;
    }

    const input = root.querySelector("#ratingLeaderboardSearchInput");
    if (isHTMLInputElement(input)) {
        const cursor = input.value.length;
        input.focus();
        input.setSelectionRange(cursor, cursor);
    }
}

export function wireRatingPageEvents(root: HTMLElement): void {
    const bridge = getAppBridge();

    root.querySelectorAll<HTMLButtonElement>("[data-rating-leaderboard-tab]").forEach((button) => {
        button.addEventListener("click", () => {
            const tab = button.dataset.ratingLeaderboardTab;
            if (tab !== "teams" && tab !== "users") {
                return;
            }
            ratingFlowState.leaderboardTab = tab;
            ratingFlowState.usersFilterOpen = false;
            ratingFlowState.teamsFilterOpen = false;
            bridge.render();
        });
    });

    const leaderboardSearch = root.querySelector("#ratingLeaderboardSearchInput");
    if (isHTMLInputElement(leaderboardSearch)) {
        leaderboardSearch.addEventListener("input", () => {
            if (ratingFlowState.leaderboardTab === "users") {
                ratingFlowState.usersSearch = leaderboardSearch.value;
                ratingFlowState.usersSearchFocus = true;
            } else {
                ratingFlowState.teamsSearch = leaderboardSearch.value;
                ratingFlowState.teamsSearchFocus = true;
            }
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

    root.querySelectorAll<HTMLButtonElement>("[data-rating-open-team]").forEach((button) => {
        button.addEventListener("click", () => {
            const teamId = button.dataset.ratingOpenTeam ?? "";
            if (!teamId) {
                return;
            }
            openRatingTeamProfile(teamId);
            bridge.render();
        });
    });

    if (ratingFlowState.view === "team") {
        root.querySelectorAll<HTMLButtonElement>(".rating-team-member-card[data-rating-user-id]").forEach((button) => {
            button.addEventListener("click", () => {
                const userId = button.dataset.ratingUserId;
                if (!userId) {
                    return;
                }
                handleTeamMemberClick(userId);
                bridge.render();
            });
        });

        const carousel = root.querySelector<HTMLElement>("#ratingTeamCarousel");
        const carouselPrev = root.querySelector("#ratingTeamCarouselPrev");
        const carouselNext = root.querySelector("#ratingTeamCarouselNext");

        if (isHTMLButtonElement(carouselPrev) && carousel) {
            carouselPrev.addEventListener("click", () => {
                carousel.scrollBy({ left: -212, behavior: "smooth" });
            });
        }

        if (isHTMLButtonElement(carouselNext) && carousel) {
            carouselNext.addEventListener("click", () => {
                carousel.scrollBy({ left: 212, behavior: "smooth" });
            });
        }
    }

    root.querySelectorAll<HTMLButtonElement>("[data-rating-open-rescue]").forEach((button) => {
        button.addEventListener("click", () => {
            ratingFlowState.rescueOpen = true;
            bridge.render();
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
            const topic = ratingFlowState.rescueDraft.topic.trim() || "Запрос";
            const targetTeamId = ratingFlowState.selectedTeamId ?? "";

            void bridge.createTeamRescueRequest({
                targetTeamId,
                topic,
                tag: ratingFlowState.rescueDraft.tag,
                description: ratingFlowState.rescueDraft.description,
                league: "",
                deadline: ratingFlowState.rescueDraft.dateTime,
                attachments: []
            })
                .then(() => {
                    ratingFlowState.rescueDraft = createEmptyRescueDraft();
                    closeRatingRescueModal();
                    bridge.pushActivity({
                        kind: "rescue_sent",
                        title: "ЗАПРОС СПАСЕНИЯ",
                        description: `Тема: «${topic}». Запрос отправлен в биржу помощи.`
                    });
                    bridge.setStatus("Спасение: запрос помощи отправлен.");
                    bridge.render();
                })
                .catch((error: unknown) => {
                    bridge.setStatus(error instanceof Error ? error.message : "Не удалось отправить запрос помощи.", "error");
                    bridge.render();
                });
        });
    }
}

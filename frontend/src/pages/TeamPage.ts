import QRCode from "qrcode";
import { getAppBridge } from "../app/bridge";
import { renderCreateEventModal } from "../components/modals/CreateEventModal";
import {
    bindEventCreateFormSubmit,
    syncEventCreateDraftFromForm as syncSharedEventCreateDraftFromForm,
    wireEventCreateFormInputs
} from "../components/modals/eventCreateForm";
import { renderSuccessEventModal } from "../components/modals/SuccessEventModal";
import { renderActiveTeamBlock } from "../components/team/ActiveTeamBlock";
import { renderNoTeamBlock } from "../components/team/NoTeamBlock";
import {
    closeTeamEventModals,
    openTeamEventCreateModal,
    openTeamEventSuccessModal,
    resetTeamEventDraft,
    teamFlowState
} from "../state/teamFlowState";
import {
    isHTMLButtonElement,
    isHTMLFormElement,
    isHTMLInputElement
} from "../utils/dom";

function buildTeamEventShareLink(): string {
    const draft = teamFlowState.eventDraft;
    const slug = encodeURIComponent((draft.topic.trim() || "sobytie").replace(/\s+/g, "-").toLowerCase());
    return `${window.location.origin}/events/${slug}`;
}

let teamCarouselResizeObserver: ResizeObserver | undefined;

function setTeamCarouselArrowVisible(button: HTMLButtonElement | null, isVisible: boolean): void {
    if (!button) {
        return;
    }

    button.classList.toggle("team-carousel-arrow--hidden", !isVisible);
    button.setAttribute("aria-hidden", String(!isVisible));
    button.tabIndex = isVisible ? 0 : -1;
}

function syncTeamCarouselArrows(root: HTMLElement): void {
    const carousel = root.querySelector<HTMLElement>("#teamCarousel");
    const carouselWrap = root.querySelector<HTMLElement>(".team-carousel-wrap");
    const carouselPrev = root.querySelector<HTMLButtonElement>("#teamCarouselPrev");
    const carouselNext = root.querySelector<HTMLButtonElement>("#teamCarouselNext");

    teamCarouselResizeObserver?.disconnect();
    teamCarouselResizeObserver = undefined;

    if (!carousel || !carouselWrap) {
        return;
    }

    const sync = (): void => {
        const overflows = carousel.scrollWidth - carousel.clientWidth > 1;
        carouselWrap.classList.toggle("team-carousel-wrap--scrollable", overflows);
        setTeamCarouselArrowVisible(carouselPrev, overflows);
        setTeamCarouselArrowVisible(carouselNext, overflows);
    };

    const scheduleSync = (): void => {
        window.requestAnimationFrame(sync);
    };

    scheduleSync();

    carousel.querySelectorAll("img").forEach((image) => {
        if (!image.complete) {
            image.addEventListener("load", scheduleSync, { once: true });
        }
    });

    if (typeof ResizeObserver !== "undefined") {
        teamCarouselResizeObserver = new ResizeObserver(scheduleSync);
        teamCarouselResizeObserver.observe(carousel);
    }
}

export function renderTeamPageMain(statusHtml: string): string {
    const bridge = getAppBridge();
    const hasTeamAccess = bridge.hasTeamAccess();
    const isCaptain = bridge.isCurrentUserCaptain();
    const body = hasTeamAccess ? renderActiveTeamBlock() : renderNoTeamBlock();
    const rescueButton = hasTeamAccess
        ? `<button type="button" class="team-action-btn team-action-btn--pink team-rescue-mobile-action" id="teamRescueButton" data-team-rescue-button ${isCaptain ? "" : "disabled"}>СПАСЕНИЕ</button>`
        : "";

    return `
        <section class="profile-main team-dashboard-main team-page">
            ${statusHtml}
            ${body}
        </section>
        ${rescueButton}`;
}

export function renderTeamPageModals(): string {
    if (teamFlowState.eventModal === "create") {
        return renderCreateEventModal();
    }
    if (teamFlowState.eventModal === "success") {
        return renderSuccessEventModal();
    }
    return "";
}

export async function paintTeamPageEventSuccessQr(root: HTMLElement): Promise<void> {
    const img = root.querySelector("#teamEventSuccessQrImg");
    if (!(img instanceof HTMLImageElement)) {
        return;
    }

    const url = teamFlowState.eventShareLink.trim() || buildTeamEventShareLink();
    try {
        img.src = await QRCode.toDataURL(url, {
            width: 200,
            margin: 2,
            color: {
                dark: "#2a2a2a",
                light: "#ffffff"
            }
        });
        img.alt = "QR-код ссылки на событие";
    } catch {
        img.removeAttribute("src");
        img.alt = "Не удалось сформировать QR";
    }
}

function syncTeamEventDraftFromForm(root: HTMLElement): void {
    syncSharedEventCreateDraftFromForm(root, "teamEventCreate", teamFlowState.eventDraft);
}

export function wireTeamPageEvents(root: HTMLElement): void {
    const bridge = getAppBridge();

    if (!bridge.hasTeamAccess()) {
        const openCreateForm = root.querySelector("#teamOpenCreateFormButton");
        if (isHTMLButtonElement(openCreateForm)) {
            openCreateForm.addEventListener("click", () => {
                bridge.openTeamOnboardingModal("create");
            });
        }

        const openSearch = root.querySelector("#teamOpenSearchButton");
        if (isHTMLButtonElement(openSearch)) {
            openSearch.addEventListener("click", () => {
                bridge.openTeamOnboardingModal("find");
            });
        }

        root.querySelectorAll<HTMLButtonElement>("[data-team-no-team-back]").forEach((button) => {
            button.addEventListener("click", () => {
                teamFlowState.noTeamView = "landing";
                bridge.render();
            });
        });

        const createName = root.querySelector("#teamCreateNameInput");
        if (isHTMLInputElement(createName)) {
            createName.addEventListener("input", () => {
                teamFlowState.createTeamDraft.name = createName.value;
            });
        }

        const createDirection = root.querySelector("#teamCreateDirectionInput");
        if (isHTMLInputElement(createDirection)) {
            createDirection.addEventListener("input", () => {
                teamFlowState.createTeamDraft.direction = createDirection.value;
            });
        }

        const confirmCreate = root.querySelector("#teamConfirmCreateButton");
        if (isHTMLButtonElement(confirmCreate)) {
            confirmCreate.addEventListener("click", async () => {
                const nameInput = root.querySelector("#teamCreateNameInput");
                const directionInput = root.querySelector("#teamCreateDirectionInput");
                if (isHTMLInputElement(nameInput)) {
                    teamFlowState.createTeamDraft.name = nameInput.value;
                }
                if (isHTMLInputElement(directionInput)) {
                    teamFlowState.createTeamDraft.direction = directionInput.value;
                }

                const name = teamFlowState.createTeamDraft.name.trim() || "КОМАНДА";
                const direction = teamFlowState.createTeamDraft.direction.trim();
                try {
                    confirmCreate.disabled = true;
                    await bridge.createTeam(name, direction);
                    teamFlowState.noTeamView = "landing";
                    teamFlowState.createTeamDraft = { name: "", direction: "" };
                    bridge.setStatus("Команда создана.");
                    bridge.render();
                } catch (error) {
                    bridge.setStatus(error instanceof Error ? error.message : "Не удалось создать команду.", "error");
                    bridge.render();
                } finally {
                    confirmCreate.disabled = false;
                }
            });
        }

        const searchInput = root.querySelector("#teamSearchInput");
        if (isHTMLInputElement(searchInput)) {
            searchInput.addEventListener("input", () => {
                teamFlowState.searchQuery = searchInput.value;
                const query = teamFlowState.searchQuery.trim().toLowerCase();
                root.querySelectorAll<HTMLElement>("[data-team-search-text]").forEach((card) => {
                    const haystack = card.dataset.teamSearchText ?? "";
                    card.hidden = Boolean(query) && !haystack.includes(query);
                });
            });
        }

        root.querySelectorAll<HTMLButtonElement>("[data-team-request-id]").forEach((button) => {
            button.addEventListener("click", async () => {
                const teamId = Number(button.dataset.teamRequestId ?? "0");
                if (!Number.isInteger(teamId) || teamId <= 0) {
                    return;
                }

                try {
                    button.disabled = true;
                    await bridge.requestTeamJoin(teamId);
                    bridge.setStatus("Заявка отправлена капитану команды.");
                    bridge.render();
                } catch (error) {
                    button.disabled = false;
                    bridge.setStatus(error instanceof Error ? error.message : "Не удалось отправить заявку.", "error");
                    bridge.render();
                }
            });
        });

        const inviteInput = root.querySelector("#teamInviteCodeInput");
        if (isHTMLInputElement(inviteInput)) {
            inviteInput.addEventListener("input", () => {
                teamFlowState.inviteCodeInput = inviteInput.value;
                teamFlowState.inviteCodeError = "";
            });
        }

        const joinForm = root.querySelector("#teamJoinByCodeForm");
        if (isHTMLFormElement(joinForm)) {
            joinForm.addEventListener("submit", async (event) => {
                event.preventDefault();
                if (isHTMLInputElement(inviteInput)) {
                    teamFlowState.inviteCodeInput = inviteInput.value;
                }
                const result = await bridge.joinTeamByInviteCode(teamFlowState.inviteCodeInput);
                if (!result.ok) {
                    teamFlowState.inviteCodeError = result.errorMessage;
                    bridge.render();
                    return;
                }
                teamFlowState.inviteCodeInput = "";
                teamFlowState.inviteCodeError = "";
                bridge.setStatus("Вы вступили в команду.");
                bridge.render();
            });
        }

        return;
    }

    const goToEvents = root.querySelector("#teamGoToEventsButton");
    if (isHTMLButtonElement(goToEvents)) {
        goToEvents.addEventListener("click", () => {
            bridge.navigateToEvents();
        });
    }

    const carousel = root.querySelector<HTMLElement>("#teamCarousel");
    const carouselPrev = root.querySelector("#teamCarouselPrev");
    const carouselNext = root.querySelector("#teamCarouselNext");

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

    syncTeamCarouselArrows(root);

    const teamKrk = root.querySelector("#teamKrkButton");
    if (isHTMLButtonElement(teamKrk)) {
        teamKrk.addEventListener("click", () => {
            bridge.navigateToRating();
        });
    }

    const teamCheckIn = root.querySelector("#teamCheckInButton");
    if (isHTMLButtonElement(teamCheckIn)) {
        teamCheckIn.addEventListener("click", () => {
            bridge.openTeamOverlayModal("checkIn");
        });
    }

    root.querySelectorAll("[data-team-rescue-button]").forEach((teamRescue) => {
        if (!isHTMLButtonElement(teamRescue)) {
            return;
        }

        teamRescue.addEventListener("click", () => {
            bridge.openTeamRescue();
        });
    });

    const teamOpenRequests = root.querySelector("#teamOpenRequestsHeaderButton");
    if (isHTMLButtonElement(teamOpenRequests)) {
        teamOpenRequests.addEventListener("click", () => {
            bridge.openTeamOverlayModal("requests");
        });
    }

    root.querySelectorAll<HTMLButtonElement>("[data-team-open-member-profile]").forEach((button) => {
        button.addEventListener("click", () => {
            const memberId = button.dataset.teamOpenMemberProfile ?? "";
            if (!memberId) {
                return;
            }

            bridge.openTeamMemberProfile(memberId);
        });
    });

    root.querySelectorAll<HTMLButtonElement>("[data-team-card-action]").forEach((button) => {
        button.addEventListener("click", () => {
            const idx = Number(button.dataset.memberIndex ?? "0");
            bridge.openTeamOverlayModal("vote", idx);
        });
    });

    if (teamFlowState.eventModal === "none") {
        return;
    }

    root.querySelectorAll<HTMLElement>("[data-close-team-event-modal]").forEach((node) => {
        node.addEventListener("click", () => {
            if (teamFlowState.eventModal === "create") {
                syncTeamEventDraftFromForm(root);
            }
            closeTeamEventModals();
            bridge.render();
        });
    });

    if (teamFlowState.eventModal === "create") {
        const closeCreate = root.querySelector("#teamEventCloseCreateButton");
        if (isHTMLButtonElement(closeCreate)) {
            closeCreate.addEventListener("click", () => {
                syncTeamEventDraftFromForm(root);
                closeTeamEventModals();
                bridge.render();
            });
        }

        wireEventCreateFormInputs(root, "teamEventCreate", teamFlowState.eventDraft, () => {
            teamFlowState.eventShowValidationError = false;
        });

        bindEventCreateFormSubmit(
            root,
            "teamEventCreate",
            teamFlowState.eventDraft,
            "teamEventCreateForm",
            () => {
                syncTeamEventDraftFromForm(root);
                const added = bridge.addCalendarEventFromDraft({ ...teamFlowState.eventDraft });
                const link = buildTeamEventShareLink();
                openTeamEventSuccessModal(link);
                if (added) {
                    bridge.setStatus("Событие добавлено в календарь.");
                }
                bridge.render();
            },
            () => {
                teamFlowState.eventShowValidationError = true;
                bridge.render();
            }
        );

        return;
    }

    if (teamFlowState.eventModal === "success") {
        const copyLink = root.querySelector("#teamEventCopyLinkButton");
        if (isHTMLButtonElement(copyLink)) {
            copyLink.addEventListener("click", async () => {
                const link = teamFlowState.eventShareLink || buildTeamEventShareLink();
                try {
                    await navigator.clipboard.writeText(link);
                    bridge.setStatus("Ссылка на событие скопирована.");
                } catch {
                    bridge.setStatus("Не удалось скопировать ссылку.", "error");
                }
                bridge.render();
            });
        }

        const closeSuccess = root.querySelector("#teamEventCloseSuccessButton");
        if (isHTMLButtonElement(closeSuccess)) {
            closeSuccess.addEventListener("click", () => {
                resetTeamEventDraft();
                closeTeamEventModals();
                bridge.setStatus("Событие создано (демо).");
                bridge.render();
            });
        }

        const done = root.querySelector("#teamEventSuccessDoneButton");
        if (isHTMLButtonElement(done)) {
            done.addEventListener("click", () => {
                resetTeamEventDraft();
                closeTeamEventModals();
                bridge.setStatus("Событие создано (демо).");
                bridge.render();
            });
        }
    }
}

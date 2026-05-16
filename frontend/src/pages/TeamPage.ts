import QRCode from "qrcode";
import { getAppBridge } from "../app/bridge";
import { renderCreateEventModal, isTeamEventDraftComplete } from "../components/modals/CreateEventModal";
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
    isHTMLInputElement,
    isHTMLTextAreaElement
} from "../utils/dom";

function buildTeamEventShareLink(): string {
    const draft = teamFlowState.eventDraft;
    const slug = encodeURIComponent((draft.topic.trim() || "sobytie").replace(/\s+/g, "-").toLowerCase());
    return `${window.location.origin}/events/${slug}`;
}

export function renderTeamPageMain(statusHtml: string): string {
    const bridge = getAppBridge();
    const body = bridge.hasTeamAccess() ? renderActiveTeamBlock() : renderNoTeamBlock();

    return `
        <section class="profile-main team-dashboard-main team-page">
            ${statusHtml}
            ${body}
        </section>`;
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
    const topic = root.querySelector("#teamEventCreateTopicInput");
    const tag = root.querySelector("#teamEventCreateTagInput");
    const description = root.querySelector("#teamEventCreateDescriptionInput");
    const format = root.querySelector("#teamEventCreateFormatInput");
    const dateTime = root.querySelector("#teamEventCreateDateTimeInput");

    if (isHTMLInputElement(topic)) {
        teamFlowState.eventDraft.topic = topic.value;
    }
    if (isHTMLInputElement(tag)) {
        teamFlowState.eventDraft.tag = tag.value;
    }
    if (isHTMLTextAreaElement(description)) {
        teamFlowState.eventDraft.description = description.value;
    }
    if (isHTMLInputElement(format)) {
        teamFlowState.eventDraft.format = format.value;
    }
    if (isHTMLInputElement(dateTime)) {
        teamFlowState.eventDraft.dateTime = dateTime.value;
    }
}

export function wireTeamPageEvents(root: HTMLElement): void {
    const bridge = getAppBridge();

    if (!bridge.hasTeamAccess()) {
        const openCreateForm = root.querySelector("#teamOpenCreateFormButton");
        if (isHTMLButtonElement(openCreateForm)) {
            openCreateForm.addEventListener("click", () => {
                teamFlowState.noTeamView = "create-form";
                teamFlowState.inviteCodeError = "";
                bridge.render();
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
            confirmCreate.addEventListener("click", () => {
                const name = teamFlowState.createTeamDraft.name.trim() || "КОМАНДА";
                const direction = teamFlowState.createTeamDraft.direction.trim();
                bridge.createTeam(name, direction);
                teamFlowState.noTeamView = "landing";
                teamFlowState.createTeamDraft = { name: "", direction: "" };
                bridge.setStatus("Команда создана (демо).");
                bridge.render();
            });
        }

        const inviteInput = root.querySelector("#teamInviteCodeInput");
        if (isHTMLInputElement(inviteInput)) {
            inviteInput.addEventListener("input", () => {
                teamFlowState.inviteCodeInput = inviteInput.value;
                teamFlowState.inviteCodeError = "";
            });
        }

        const joinForm = root.querySelector("#teamJoinByCodeForm");
        if (isHTMLFormElement(joinForm)) {
            joinForm.addEventListener("submit", (event) => {
                event.preventDefault();
                if (isHTMLInputElement(inviteInput)) {
                    teamFlowState.inviteCodeInput = inviteInput.value;
                }
                const result = bridge.joinTeamByInviteCode(teamFlowState.inviteCodeInput);
                if (!result.ok) {
                    teamFlowState.inviteCodeError = result.errorMessage;
                    bridge.render();
                    return;
                }
                teamFlowState.inviteCodeInput = "";
                teamFlowState.inviteCodeError = "";
                bridge.setStatus("Вы вступили в команду (демо).");
                bridge.render();
            });
        }

        return;
    }

    const openCreateEvent = root.querySelector("#teamOpenCreateEventButton");
    if (isHTMLButtonElement(openCreateEvent)) {
        openCreateEvent.addEventListener("click", () => {
            openTeamEventCreateModal();
            bridge.render();
        });
    }

    const teamKrk = root.querySelector("#teamKrkButton");
    if (isHTMLButtonElement(teamKrk)) {
        teamKrk.addEventListener("click", () => {
            bridge.navigateToRating();
        });
    }

    const teamCheckIn = root.querySelector("#teamCheckInButton");
    if (isHTMLButtonElement(teamCheckIn)) {
        teamCheckIn.addEventListener("click", () => {
            bridge.setStatus("Check-in зарегистрирован (демо).");
            bridge.render();
        });
    }

    const teamRescue = root.querySelector("#teamRescueButton");
    if (isHTMLButtonElement(teamRescue)) {
        teamRescue.addEventListener("click", () => {
            bridge.openTeamRescue();
        });
    }

    const teamOpenRequests = root.querySelector("#teamOpenRequestsHeaderButton");
    if (isHTMLButtonElement(teamOpenRequests)) {
        teamOpenRequests.addEventListener("click", () => {
            bridge.openTeamOverlayModal("requests");
        });
    }

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

        const bindInput = (selector: string, key: keyof typeof teamFlowState.eventDraft): void => {
            const el = root.querySelector(selector);
            if (isHTMLInputElement(el)) {
                el.addEventListener("input", () => {
                    teamFlowState.eventDraft[key] = el.value;
                    teamFlowState.eventShowValidationError = false;
                });
            } else if (isHTMLTextAreaElement(el)) {
                el.addEventListener("input", () => {
                    teamFlowState.eventDraft[key] = el.value;
                    teamFlowState.eventShowValidationError = false;
                });
            }
        };

        bindInput("#teamEventCreateTopicInput", "topic");
        bindInput("#teamEventCreateTagInput", "tag");
        bindInput("#teamEventCreateDescriptionInput", "description");
        bindInput("#teamEventCreateFormatInput", "format");
        bindInput("#teamEventCreateDateTimeInput", "dateTime");

        const createForm = root.querySelector("#teamEventCreateForm");
        if (isHTMLFormElement(createForm)) {
            createForm.addEventListener("submit", (event) => {
                event.preventDefault();
                syncTeamEventDraftFromForm(root);

                if (!isTeamEventDraftComplete(teamFlowState.eventDraft)) {
                    teamFlowState.eventShowValidationError = true;
                    bridge.render();
                    return;
                }

                const link = buildTeamEventShareLink();
                openTeamEventSuccessModal(link);
                bridge.render();
            });
        }

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

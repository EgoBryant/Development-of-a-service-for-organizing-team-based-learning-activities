import {
    renderRescueFormModal,
    wireRescueFormModal,
    TEAM_RESCUE_DOM_IDS,
    readRescueDraftFromMount,
    type RescueFormModalRenderOptions,
    type RescueFormModalWireOptions
} from "./RescueRequestFormModal";
import type { TeamRescueDraft } from "../../types/team";

export function readTeamRescueDraftFromMount(
    profileMount: HTMLElement,
    draft: TeamRescueDraft
): TeamRescueDraft {
    return readRescueDraftFromMount(profileMount, draft, TEAM_RESCUE_DOM_IDS);
}

export type TeamRescueModalRenderOptions = Omit<
    RescueFormModalRenderOptions,
    "domIds" | "purposeLabel" | "modalAriaLabel" | "backdropCloseAttr" | "includeTargetTeam"
> & {
    targetOptionsHtml: string;
};

export type TeamRescueModalWireOptions = Omit<RescueFormModalWireOptions, "domIds">;

export function renderTeamRescueModal(options: TeamRescueModalRenderOptions): string {
    return renderRescueFormModal({
        ...options,
        domIds: TEAM_RESCUE_DOM_IDS,
        purposeLabel: "СПАСЕНИЕ",
        modalAriaLabel: "Спасение",
        backdropCloseAttr: 'data-close-team-modal="1"',
        includeTargetTeam: true
    });
}

export function wireTeamRescueModal(
    profileMount: HTMLElement,
    options: TeamRescueModalWireOptions
): void {
    wireRescueFormModal(profileMount, {
        ...options,
        domIds: TEAM_RESCUE_DOM_IDS
    });
}

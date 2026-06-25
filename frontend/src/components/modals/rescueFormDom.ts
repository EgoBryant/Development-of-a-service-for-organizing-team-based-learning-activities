import type { TeamRescueDraft } from "../../types/team";
import { isHTMLInputElement } from "../../utils/dom";

export interface RescueFormDomIds {
    form: string;
    closeButton: string;
    topicInput: string;
    descriptionInput: string;
    leagueValue: string;
    tagValue: string;
    deadlineValue: string;
    submitButton: string;
    targetInput: string;
    photoInput: string;
    tagTrigger: string;
    leagueTrigger: string;
    deadlineTrigger: string;
    deadlinePicker: string;
    calendarPopup: string;
    tagDropdown: string;
    leagueDropdown: string;
    attachmentsListWrap: string;
    attachmentsCount: string;
}

export const TEAM_RESCUE_DOM_IDS: RescueFormDomIds = {
    form: "teamRescueForm",
    closeButton: "teamCloseRescueButton",
    topicInput: "teamRescueTopicInput",
    descriptionInput: "teamRescueDescriptionInput",
    leagueValue: "teamRescueLeagueValue",
    tagValue: "teamRescueTagValue",
    deadlineValue: "teamRescueDeadlineValue",
    submitButton: "teamRescueSubmitButton",
    targetInput: "teamRescueTargetInput",
    photoInput: "teamRescuePhotoInput",
    tagTrigger: "teamRescueTagTrigger",
    leagueTrigger: "teamRescueLeagueTrigger",
    deadlineTrigger: "teamRescueDeadlineTrigger",
    deadlinePicker: "teamRescueDeadlinePicker",
    calendarPopup: "teamRescueCalendarPopup",
    tagDropdown: "teamRescueTagDropdown",
    leagueDropdown: "teamRescueLeagueDropdown",
    attachmentsListWrap: "teamRescueAttachmentsListWrap",
    attachmentsCount: "teamRescueAttachmentsCount"
};

export const TASKS_REQUEST_DOM_IDS: RescueFormDomIds = {
    form: "tasksRequestForm",
    closeButton: "tasksCloseRequestButton",
    topicInput: "tasksRequestTopicInput",
    descriptionInput: "tasksRequestDescriptionInput",
    leagueValue: "tasksRequestLeagueValue",
    tagValue: "tasksRequestTagValue",
    deadlineValue: "tasksRequestDeadlineValue",
    submitButton: "tasksRequestSubmitButton",
    targetInput: "tasksRequestTargetInput",
    photoInput: "tasksRequestPhotoInput",
    tagTrigger: "tasksRequestTagTrigger",
    leagueTrigger: "tasksRequestLeagueTrigger",
    deadlineTrigger: "tasksRequestDeadlineTrigger",
    deadlinePicker: "tasksRequestDeadlinePicker",
    calendarPopup: "tasksRequestCalendarPopup",
    tagDropdown: "tasksRequestTagDropdown",
    leagueDropdown: "tasksRequestLeagueDropdown",
    attachmentsListWrap: "tasksRequestAttachmentsListWrap",
    attachmentsCount: "tasksRequestAttachmentsCount"
};

export function readRescueDraftFromMount(
    profileMount: HTMLElement,
    draft: TeamRescueDraft,
    ids: RescueFormDomIds
): TeamRescueDraft {
    const target = profileMount.querySelector(`#${ids.targetInput}`);
    const topic = profileMount.querySelector(`#${ids.topicInput}`);
    const description = profileMount.querySelector(`#${ids.descriptionInput}`);
    const leagueValue = profileMount.querySelector(`#${ids.leagueValue}`);
    const tagValue = profileMount.querySelector(`#${ids.tagValue}`);
    const deadlineValue = profileMount.querySelector(`#${ids.deadlineValue}`);

    return {
        ...draft,
        targetTeamId: target instanceof HTMLSelectElement ? target.value : draft.targetTeamId,
        topic: isHTMLInputElement(topic) ? topic.value : draft.topic,
        description: description instanceof HTMLTextAreaElement ? description.value : draft.description,
        league: isHTMLInputElement(leagueValue) ? leagueValue.value : draft.league,
        tag: isHTMLInputElement(tagValue) ? tagValue.value : draft.tag,
        deadline: isHTMLInputElement(deadlineValue) ? deadlineValue.value : draft.deadline
    };
}

import { getRescueTagDisplayLabel } from "../constants/rescueTags";
import { HIDDEN_USER_REQUEST_TAG } from "../constants/assignmentTags";
import type { CreateAssignmentPayload, AssignmentLeagueTier } from "../types/assignment";
import type { TasksKrcTier } from "../types/app";
import type { TeamRescueDraft } from "../types/team";
import { formatRescueDeadlineDisplay } from "../utils/rescueFormUi";
import { request } from "./httpClient";
import type { AssignmentItem } from "../types/assignment";

function authHeaders(token: string): HeadersInit {
    return { Authorization: `Bearer ${token}` };
}

const VALID_LEAGUE_TIERS = new Set<TasksKrcTier>(["novice", "pro", "legend"]);

function parseRescueDeadlineToUtc(isoDate: string): string | null {
    const trimmed = isoDate.trim();
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
    if (!match) {
        return null;
    }

    const date = new Date(`${match[1]}-${match[2]}-${match[3]}T23:59:59`);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function normalizeLeagueTier(value: string): AssignmentLeagueTier | null {
    const normalized = value.trim().toLowerCase();
    return VALID_LEAGUE_TIERS.has(normalized as TasksKrcTier)
        ? normalized as AssignmentLeagueTier
        : null;
}

export function mapTeamRescueDraftToCreatePayload(draft: TeamRescueDraft): CreateAssignmentPayload {
    const leagueTier = normalizeLeagueTier(draft.league);
    if (!leagueTier) {
        throw new Error("Выберите лигу для задания.");
    }

    const tag = getRescueTagDisplayLabel(draft.tag) || draft.tag.trim();
    if (!tag) {
        throw new Error("Выберите тег для задания.");
    }

    const deadlineLabel = formatRescueDeadlineDisplay(draft.deadline);
    if (!deadlineLabel) {
        throw new Error("Укажите дедлайн для задания.");
    }

    const title = draft.topic.trim();
    if (!title) {
        throw new Error("Укажите название задания.");
    }

    const description = draft.description.trim();
    if (!description) {
        throw new Error("Опишите задание.");
    }

    return {
        title,
        tag,
        description,
        deadlineLabel,
        deadlineUtc: parseRescueDeadlineToUtc(draft.deadline),
        leagueTier
    };
}

export function mapTasksRequestDraftToCreatePayload(draft: TeamRescueDraft): CreateAssignmentPayload {
    const payload = mapTeamRescueDraftToCreatePayload(draft);
    return {
        ...payload,
        tag: HIDDEN_USER_REQUEST_TAG
    };
}

export function fetchAssignmentsFeed(token: string, league: TasksKrcTier): Promise<AssignmentItem[]> {
    const query = new URLSearchParams({ league });
    return request<AssignmentItem[]>(`/api/assignments/feed?${query.toString()}`, {
        headers: authHeaders(token)
    });
}

export function createAssignment(token: string, payload: CreateAssignmentPayload): Promise<AssignmentItem> {
    return request<AssignmentItem>("/api/assignments", {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify(payload)
    });
}

export function reserveAssignment(token: string, assignmentId: number): Promise<AssignmentItem> {
    return request<AssignmentItem>(`/api/assignments/${assignmentId}/reserve`, {
        method: "POST",
        headers: authHeaders(token)
    });
}

export function releaseAssignment(token: string, assignmentId: number): Promise<void> {
    return request<void>(`/api/assignments/${assignmentId}/release`, {
        method: "POST",
        headers: authHeaders(token)
    });
}

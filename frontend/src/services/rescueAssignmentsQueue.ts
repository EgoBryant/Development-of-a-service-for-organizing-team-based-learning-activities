import type { TeamRescueDraft } from "../types/team";

const RESCUE_ASSIGNMENTS_QUEUE_KEY = "team-exam:rescue-assignments-queue:v1";

export interface RescueAssignmentTask {
    id: string;
    createdAtUtc: string;
    draft: TeamRescueDraft;
}

/**
 * Заглушка очереди для раздела «ЗАДАНИЯ».
 * TODO(assignments-section): заменить на API / state раздела заданий, когда раздел будет готов.
 */
export function queueRescueAssignmentTask(draft: TeamRescueDraft): RescueAssignmentTask {
    const task: RescueAssignmentTask = {
        id: `rescue-${Date.now()}`,
        createdAtUtc: new Date().toISOString(),
        draft: {
            ...draft,
            topic: draft.topic.trim(),
            description: draft.description.trim(),
            tag: draft.tag.trim(),
            league: draft.league.trim(),
            deadline: draft.deadline.trim(),
            attachments: [...draft.attachments]
        }
    };

    try {
        const raw = localStorage.getItem(RESCUE_ASSIGNMENTS_QUEUE_KEY);
        const queue = raw ? (JSON.parse(raw) as RescueAssignmentTask[]) : [];
        queue.unshift(task);
        localStorage.setItem(RESCUE_ASSIGNMENTS_QUEUE_KEY, JSON.stringify(queue.slice(0, 50)));
    } catch {
        // localStorage недоступен — задача всё равно возвращается вызывающему коду
    }

    return task;
}

export function readRescueAssignmentQueue(): RescueAssignmentTask[] {
    try {
        const raw = localStorage.getItem(RESCUE_ASSIGNMENTS_QUEUE_KEY);
        if (!raw) {
            return [];
        }

        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? (parsed as RescueAssignmentTask[]) : [];
    } catch {
        return [];
    }
}

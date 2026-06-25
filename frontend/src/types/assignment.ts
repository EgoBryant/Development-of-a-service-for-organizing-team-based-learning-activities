import type { TasksKrcTier } from "./app";

export type AssignmentLeagueTier = TasksKrcTier;

export interface CreateAssignmentPayload {
    title: string;
    tag: string;
    description: string;
    deadlineLabel: string;
    deadlineUtc: string | null;
    leagueTier: AssignmentLeagueTier;
}

export interface AssignmentItem {
    id: number;
    title: string;
    tag: string;
    description: string;
    deadlineLabel: string;
    deadlineUtc: string | null;
    leagueTier: AssignmentLeagueTier;
    isAvailableInFeed: boolean;
}

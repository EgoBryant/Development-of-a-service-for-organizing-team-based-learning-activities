import type { ActivityFeedItem } from "../types/activity";
import type { HelpRequestResponse, TeamActivityFeedItem, TeamHistoryItem, TeamWeeklyStats } from "../types/team";
import { getMondayOfWeek } from "./calendarEvents";

export type CheckInSliderKey = "productivity" | "communication" | "satisfaction";

export interface CheckInWeeklyStats {
    pointsEarned: number;
    teamsRescued: number;
    eventsHeld: number;
}

const EVENT_HISTORY_LABELS = new Set(["WORKSHOP", "TRAINING", "EVENT", "СОБЫТИЕ"]);
const POINTS_IN_MESSAGE_PATTERN = /\(\+(\d+)\s*бал/i;
const HELP_COMPLETED_TOPIC_PATTERN = /«Спасение» завершено: «(.+?)»/i;

function getWeekEnd(weekStart: Date): Date {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    return weekEnd;
}

function isWithinWeek(isoDate: string | null | undefined, weekStart: Date, weekEnd: Date): boolean {
    if (!isoDate) {
        return false;
    }

    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) {
        return false;
    }

    return date >= weekStart && date < weekEnd;
}

function parsePointsLabel(value: string | undefined): number {
    if (!value) {
        return 0;
    }

    const normalized = value.replace(/^\+/, "").trim();
    const parsed = Number(normalized);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function extractBonusPointsFromMessage(message: string): number {
    const match = POINTS_IN_MESSAGE_PATTERN.exec(message);
    if (!match) {
        return 0;
    }

    const parsed = Number(match[1]);
    return Number.isFinite(parsed) ? parsed : 0;
}

function extractHelpCompletedTopic(message: string): string | null {
    const match = HELP_COMPLETED_TOPIC_PATTERN.exec(message);
    return match?.[1]?.trim() ?? null;
}

function isEventHistoryItem(item: TeamHistoryItem): boolean {
    const label = item.label.trim().toUpperCase();
    if (EVENT_HISTORY_LABELS.has(label)) {
        return true;
    }

    const title = item.title.toLowerCase();
    return title.includes("провел") || title.includes("провела") || title.includes("создал") || title.includes("создала");
}

function getActivityTimestamp(item: TeamActivityFeedItem | ActivityFeedItem): string {
    return "createdAtUtc" in item ? item.createdAtUtc : item.createdAt;
}

function getActivityType(item: TeamActivityFeedItem | ActivityFeedItem): string {
    if ("type" in item) {
        return item.type;
    }

    switch (item.kind) {
        case "event_created":
            return "EVENT_CREATED";
        case "rescue_sent":
            return "HELP_CREATED";
        case "check_in":
            return "CHECKIN";
        default:
            return item.kind.toUpperCase();
    }
}

function getActivityMessage(item: TeamActivityFeedItem | ActivityFeedItem): string {
    if ("message" in item) {
        return item.message;
    }

    return `${item.title} ${item.description}`.trim();
}

export function mapApiWeeklyStats(stats: TeamWeeklyStats): CheckInWeeklyStats {
    return {
        pointsEarned: Math.max(0, stats.pointsEarned),
        teamsRescued: Math.max(0, stats.teamsRescued),
        eventsHeld: Math.max(0, stats.eventsHeld)
    };
}

export function computeCheckInWeeklyStats(input: {
    history: TeamHistoryItem[];
    helpRequests: HelpRequestResponse[];
    activityItems: Array<TeamActivityFeedItem | ActivityFeedItem>;
    currentTeamId: number | null;
    now?: Date;
    includeUndatedHistory?: boolean;
}): CheckInWeeklyStats {
    const weekStart = getMondayOfWeek(input.now ?? new Date());
    const weekEnd = getWeekEnd(weekStart);
    const currentTeamId = input.currentTeamId;

    let pointsEarned = 0;
    let teamsRescued = 0;
    let eventsHeld = 0;

    const weekActivities = input.activityItems.filter((item) =>
        isWithinWeek(getActivityTimestamp(item), weekStart, weekEnd)
    );

    if (weekActivities.length > 0) {
        for (const activity of weekActivities) {
            const type = getActivityType(activity);
            const message = getActivityMessage(activity);

            if (type === "EVENT_CREATED") {
                eventsHeld += 1;
            }

            if (type === "HELP_COMPLETED") {
                teamsRescued += 1;
                const topic = extractHelpCompletedTopic(message);
                const matchedRequest = topic
                    ? input.helpRequests.find((request) =>
                        request.toTeamId === currentTeamId &&
                        request.status === "Completed" &&
                        request.topic.trim().toLowerCase() === topic.toLowerCase()
                    )
                    : undefined;
                pointsEarned += matchedRequest
                    ? Math.max(0, Math.round(matchedRequest.bonusPoints))
                    : 0;
            }

            if (type === "CHALLENGE_APPROVED") {
                pointsEarned += extractBonusPointsFromMessage(message);
            }
        }
    } else if (currentTeamId !== null) {
        for (const request of input.helpRequests) {
            if (request.toTeamId !== currentTeamId || request.status !== "Completed") {
                continue;
            }

            if (!isWithinWeek(request.createdAtUtc, weekStart, weekEnd)) {
                continue;
            }

            teamsRescued += 1;
            pointsEarned += Math.max(0, Math.round(request.bonusPoints));
        }
    }

    for (const item of input.history) {
        const inWeek = item.occurredAtUtc
            ? isWithinWeek(item.occurredAtUtc, weekStart, weekEnd)
            : Boolean(input.includeUndatedHistory);

        if (!inWeek) {
            continue;
        }

        pointsEarned += parsePointsLabel(item.pointsLabel);

        if (weekActivities.length === 0 && isEventHistoryItem(item)) {
            eventsHeld += 1;
        }
    }

    return {
        pointsEarned: Math.max(0, pointsEarned),
        teamsRescued: Math.max(0, teamsRescued),
        eventsHeld: Math.max(0, eventsHeld)
    };
}

export function getCheckInWeeklyStatsDisplayOrder(stats: CheckInWeeklyStats): Array<{
    slot: "second" | "first" | "third";
    value: number;
}> {
    return [
        { slot: "second", value: stats.teamsRescued },
        { slot: "first", value: stats.pointsEarned },
        { slot: "third", value: stats.eventsHeld }
    ];
}

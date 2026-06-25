import {
    fetchAssignmentsFeed,
    releaseAssignment,
    reserveAssignment
} from "../../services/assignmentsApi";
import { tasksFlowState, isAssignmentVisibleInFeed } from "../../state/tasksFlowState";
import type { AssignmentItem } from "../../types/assignment";
import type { TasksKrcTier } from "../../types/app";
import { shouldShowAssignmentTag } from "../../constants/assignmentTags";
import { formatAssignmentCardDeadlineDisplay } from "../../utils/rescueFormUi";
import { escapeHtml } from "../../utils/html";

const DESKTOP_LANE_COUNT = 4;
const MOBILE_LANE_COUNT = 2;
const MOBILE_FEED_QUERY = "(max-width: 1024px)";
const SPAWN_TICK_MS = 100;
const CARD_TRAVEL_MS = 15000;
const LANE_CARD_GAP_PX = 4;
const DEFAULT_CARD_HEIGHT_PX = 325;
const RECENT_SPAWN_WINDOW = 10;
const MAX_SPAWN_ATTEMPTS = 5;

export function getTasksAssignmentFeedLaneCount(): number {
    if (typeof window !== "undefined" && window.matchMedia(MOBILE_FEED_QUERY).matches) {
        return MOBILE_LANE_COUNT;
    }

    return DESKTOP_LANE_COUNT;
}

function resolveLaneCount(root?: ParentNode): number {
    if (root) {
        const laneCount = root.querySelectorAll("[data-tasks-lane]").length;
        if (laneCount > 0) {
            return laneCount;
        }
    }

    return getTasksAssignmentFeedLaneCount();
}

function getLaneCardSeparationPx(cardHeightPx: number): number {
    return cardHeightPx + LANE_CARD_GAP_PX;
}

function computeLaneSpawnGapMs(feedHeightPx: number, cardHeightPx: number): number {
    const totalTravelPx = cardHeightPx * 2.1 + feedHeightPx;
    const separationPx = getLaneCardSeparationPx(cardHeightPx);
    return Math.ceil((separationPx / Math.max(totalTravelPx, 1)) * CARD_TRAVEL_MS);
}

function createStaggeredLaneTimestamps(gapMs: number, laneCount: number): number[] {
    const now = Date.now();
    const laneOffsetMs = gapMs / laneCount;

    return Array.from({ length: laneCount }, (_, laneIndex) =>
        now - gapMs + laneIndex * laneOffsetMs
    );
}

function pickSpawnLane(laneLastSpawnAt: number[], laneSpawnGapMs: number): number | null {
    const now = Date.now();
    const readyLanes = laneLastSpawnAt
        .map((lastSpawnAt, laneIndex) => ({ laneIndex, lastSpawnAt }))
        .filter(({ lastSpawnAt }) => now - lastSpawnAt >= laneSpawnGapMs)
        .map(({ laneIndex }) => laneIndex);

    if (readyLanes.length === 0) {
        return null;
    }

    return readyLanes[Math.floor(Math.random() * readyLanes.length)] ?? null;
}

function createCardHeightProbe(): HTMLButtonElement {
    const probe = document.createElement("button");
    probe.type = "button";
    probe.className = "tasks-assignment-card";
    probe.style.visibility = "hidden";
    probe.style.animation = "none";
    probe.style.pointerEvents = "none";
    probe.innerHTML = `
        <span class="tasks-assignment-card-tag">TAG</span>
        <div class="tasks-assignment-card-body">
            <span class="tasks-assignment-card-title">TITLE</span>
        </div>
        <span class="tasks-assignment-card-deadline">01.01 00:00</span>`;
    return probe;
}

export interface TasksAssignmentFeedHandle {
    stop(): void;
}

let activeFeedHandle: TasksAssignmentFeedHandle | null = null;

export function stopTasksAssignmentFeed(): void {
    activeFeedHandle?.stop();
    activeFeedHandle = null;
}

export function renderTasksAssignmentFeed(): string {
    const laneCount = getTasksAssignmentFeedLaneCount();
    const lanesHtml = Array.from({ length: laneCount }, (_, laneIndex) => `
        <div class="tasks-assignment-lane" data-tasks-lane="${laneIndex}" aria-hidden="true"></div>`
    ).join("");

    return `
        <section class="tasks-assignment-feed" aria-label="Лента заданий">
            <div class="tasks-assignment-feed-viewport">
                ${lanesHtml}
            </div>
        </section>`;
}

function buildAssignmentCard(assignment: AssignmentItem): HTMLButtonElement {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "tasks-assignment-card";
    card.dataset.assignmentId = String(assignment.id);
    card.style.animationDuration = `${CARD_TRAVEL_MS}ms`;

    const titleHtml = assignment.title.trim()
        ? `<span class="tasks-assignment-card-title">${escapeHtml(assignment.title)}</span>`
        : "";

    const tagHtml = shouldShowAssignmentTag(assignment.tag)
        ? `<span class="tasks-assignment-card-tag">${escapeHtml(assignment.tag)}</span>`
        : "";

    const deadlineLabel = formatAssignmentCardDeadlineDisplay(
        assignment.deadlineLabel,
        assignment.deadlineUtc
    );

    card.innerHTML = `
        ${tagHtml}
        <div class="tasks-assignment-card-body">${titleHtml}</div>
        <span class="tasks-assignment-card-deadline">${escapeHtml(deadlineLabel)}</span>`;
    return card;
}

function patchAssignmentAvailability(assignmentId: number, isAvailableInFeed: boolean): void {
    const index = tasksFlowState.assignments.findIndex((item) => item.id === assignmentId);
    if (index === -1) {
        return;
    }

    tasksFlowState.assignments[index] = {
        ...tasksFlowState.assignments[index],
        isAvailableInFeed
    };
}

function getAvailableAssignments(): AssignmentItem[] {
    return tasksFlowState.assignments.filter(
        (item) => item.isAvailableInFeed && isAssignmentVisibleInFeed(item.tag)
    );
}

function pickRandomAssignment(items: AssignmentItem[]): AssignmentItem | null {
    if (items.length === 0) {
        return null;
    }

    return items[Math.floor(Math.random() * items.length)] ?? null;
}

function pickRandomAssignmentWithVariety(
    items: AssignmentItem[],
    recentlySpawnedIds: number[]
): AssignmentItem | null {
    if (items.length === 0) {
        return null;
    }

    const recentIds = new Set(recentlySpawnedIds);
    const freshPool = items.filter((item) => !recentIds.has(item.id));
    return pickRandomAssignment(freshPool.length > 0 ? freshPool : items);
}

function rememberRecentSpawn(recentlySpawnedIds: number[], assignmentId: number, windowSize: number): void {
    recentlySpawnedIds.push(assignmentId);
    if (recentlySpawnedIds.length > windowSize) {
        recentlySpawnedIds.splice(0, recentlySpawnedIds.length - windowSize);
    }
}

interface SpawnQueueState {
    ids: number[];
    queuedIds: Set<number>;
}

function createSpawnQueueState(): SpawnQueueState {
    return {
        ids: [],
        queuedIds: new Set<number>()
    };
}

function pruneSpawnQueue(queue: SpawnQueueState): void {
    while (queue.ids.length > 0) {
        const assignmentId = queue.ids[0];
        const isValid = tasksFlowState.assignments.some(
            (item) => item.id === assignmentId && item.isAvailableInFeed
        );

        if (isValid) {
            return;
        }

        queue.ids.shift();
        queue.queuedIds.delete(assignmentId);
    }
}

function peekQueuedAssignment(queue: SpawnQueueState): AssignmentItem | null {
    pruneSpawnQueue(queue);

    const assignmentId = queue.ids[0];
    if (assignmentId === undefined) {
        return null;
    }

    return tasksFlowState.assignments.find(
        (item) => item.id === assignmentId && item.isAvailableInFeed
    ) ?? null;
}

function enqueueAssignment(queue: SpawnQueueState, assignment: AssignmentItem): void {
    if (queue.queuedIds.has(assignment.id)) {
        return;
    }

    queue.ids.push(assignment.id);
    queue.queuedIds.add(assignment.id);
}

function dequeueAssignment(queue: SpawnQueueState, assignmentId: number): void {
    queue.ids = queue.ids.filter((id) => id !== assignmentId);
    queue.queuedIds.delete(assignmentId);
}

function pickNextSpawnCandidate(
    queue: SpawnQueueState,
    recentlySpawnedIds: number[]
): AssignmentItem | null {
    const queued = peekQueuedAssignment(queue);
    if (queued) {
        return queued;
    }

    const excludedIds = new Set<number>(queue.queuedIds);
    const available = getAvailableAssignments().filter((item) => !excludedIds.has(item.id));
    return pickRandomAssignmentWithVariety(available, recentlySpawnedIds);
}

export function startTasksAssignmentFeed(
    root: HTMLElement,
    token: string,
    leagueTier: TasksKrcTier,
    onOpenAssignment: (assignment: AssignmentItem) => void
): TasksAssignmentFeedHandle {
    stopTasksAssignmentFeed();

    let stopped = false;
    let spawnInFlight = false;
    let spawnTimer: number | undefined;
    let resizeObserver: ResizeObserver | undefined;
    const activeReservedIds = new Set<number>();
    const recentlySpawnedIds: number[] = [];
    const spawnQueue = createSpawnQueueState();
    const laneCount = resolveLaneCount(root);
    let laneSpawnGapMs = computeLaneSpawnGapMs(350, DEFAULT_CARD_HEIGHT_PX);
    let laneLastSpawnAt = createStaggeredLaneTimestamps(laneSpawnGapMs, laneCount);
    let cardHeightPx = DEFAULT_CARD_HEIGHT_PX;

    const viewport = root.querySelector<HTMLElement>(".tasks-assignment-feed-viewport");

    const measureCardHeight = (): number => {
        const existingCard = root.querySelector<HTMLElement>(".tasks-assignment-card");
        if (existingCard) {
            return existingCard.getBoundingClientRect().height;
        }

        const lane = root.querySelector<HTMLElement>('[data-tasks-lane="0"]');
        if (!lane) {
            return DEFAULT_CARD_HEIGHT_PX;
        }

        const probe = createCardHeightProbe();
        lane.appendChild(probe);
        const height = probe.getBoundingClientRect().height;
        probe.remove();
        return height > 0 ? height : DEFAULT_CARD_HEIGHT_PX;
    };

    const refreshSpawnMetrics = (): void => {
        const feedHeight = viewport?.clientHeight ?? 350;
        cardHeightPx = measureCardHeight();
        laneSpawnGapMs = computeLaneSpawnGapMs(feedHeight, cardHeightPx);
    };

    const syncFeedHeight = (): void => {
        if (!viewport) {
            return;
        }

        root.style.setProperty("--tasks-feed-height", `${viewport.clientHeight}px`);
        refreshSpawnMetrics();
    };

    syncFeedHeight();
    if (viewport && typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(syncFeedHeight);
        resizeObserver.observe(viewport);
    }

    const spawnCard = (assignment: AssignmentItem, laneIndex: number): void => {
        const lane = root.querySelector<HTMLElement>(`[data-tasks-lane="${laneIndex}"]`);
        if (!lane || stopped) {
            return;
        }

        const card = buildAssignmentCard(assignment);

        card.addEventListener("animationend", () => {
            card.remove();
            activeReservedIds.delete(assignment.id);
            void releaseAssignment(token, assignment.id)
                .then(() => {
                    patchAssignmentAvailability(assignment.id, true);
                })
                .catch(() => {
                    patchAssignmentAvailability(assignment.id, true);
                });
        }, { once: true });

        lane.appendChild(card);
    };

    const trySpawn = async (): Promise<void> => {
        if (stopped || spawnInFlight) {
            return;
        }

        spawnInFlight = true;

        try {
            refreshSpawnMetrics();

            const laneIndex = pickSpawnLane(laneLastSpawnAt, laneSpawnGapMs);
            if (laneIndex === null) {
                const candidate = pickNextSpawnCandidate(spawnQueue, recentlySpawnedIds);
                if (candidate) {
                    enqueueAssignment(spawnQueue, candidate);
                }
                return;
            }

            for (let attempt = 0; attempt < MAX_SPAWN_ATTEMPTS; attempt += 1) {
                const candidate = pickNextSpawnCandidate(spawnQueue, recentlySpawnedIds);
                if (!candidate) {
                    return;
                }

                const wasQueued = spawnQueue.queuedIds.has(candidate.id);

                try {
                    const reserved = await reserveAssignment(token, candidate.id);
                    if (stopped) {
                        void releaseAssignment(token, reserved.id).then(() => {
                            patchAssignmentAvailability(reserved.id, true);
                        });
                        return;
                    }

                    if (wasQueued) {
                        dequeueAssignment(spawnQueue, candidate.id);
                    }

                    activeReservedIds.add(reserved.id);
                    patchAssignmentAvailability(reserved.id, false);
                    rememberRecentSpawn(recentlySpawnedIds, reserved.id, RECENT_SPAWN_WINDOW);
                    spawnCard(reserved, laneIndex);
                    laneLastSpawnAt[laneIndex] = Date.now();
                    return;
                } catch {
                    if (wasQueued) {
                        dequeueAssignment(spawnQueue, candidate.id);
                    }
                }
            }
        } finally {
            spawnInFlight = false;
        }
    };

    const healStaleReservations = async (): Promise<void> => {
        const unavailable = tasksFlowState.assignments.filter((item) => !item.isAvailableInFeed);
        if (unavailable.length === 0) {
            return;
        }

        await Promise.allSettled(
            unavailable.map((item) => releaseAssignment(token, item.id))
        );

        unavailable.forEach((item) => {
            patchAssignmentAvailability(item.id, true);
        });
    };

    const bootstrap = async (): Promise<void> => {
        try {
            tasksFlowState.assignments = await fetchAssignmentsFeed(token, leagueTier);
            tasksFlowState.activeLeagueTier = leagueTier;
        } catch {
            tasksFlowState.assignments = [];
            return;
        }

        if (stopped) {
            return;
        }

        await healStaleReservations();
        if (stopped) {
            return;
        }

        try {
            tasksFlowState.assignments = await fetchAssignmentsFeed(token, leagueTier);
        } catch {
            tasksFlowState.assignments = [];
            return;
        }

        if (stopped) {
            return;
        }

        void trySpawn();
        spawnTimer = window.setInterval(() => {
            void trySpawn();
        }, SPAWN_TICK_MS);
    };

    root.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) {
            return;
        }

        const card = target.closest<HTMLButtonElement>(".tasks-assignment-card");
        if (!card) {
            return;
        }

        const assignmentId = Number(card.dataset.assignmentId);
        const assignment = tasksFlowState.assignments.find((item) => item.id === assignmentId);
        if (!assignment) {
            return;
        }

        onOpenAssignment(assignment);
    });

    void bootstrap();

    const handle: TasksAssignmentFeedHandle = {
        stop() {
            stopped = true;
            resizeObserver?.disconnect();
            if (spawnTimer !== undefined) {
                window.clearInterval(spawnTimer);
            }

            root.querySelectorAll(".tasks-assignment-card").forEach((card) => card.remove());

            spawnQueue.ids.length = 0;
            spawnQueue.queuedIds.clear();
            recentlySpawnedIds.length = 0;

            const reservedIds = [...activeReservedIds];
            activeReservedIds.clear();
            if (reservedIds.length > 0) {
                void Promise.allSettled(
                    reservedIds.map((assignmentId) => releaseAssignment(token, assignmentId))
                ).then(() => {
                    reservedIds.forEach((assignmentId) => {
                        patchAssignmentAvailability(assignmentId, true);
                    });
                });
            }
        }
    };

    activeFeedHandle = handle;
    return handle;
}

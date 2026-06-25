import { buildChallengeItems, FALLBACK_CHALLENGES } from "../data/challengesCatalog";
import type { ChallengeItem, ChallengeResponse } from "../types/challenge";

let activeChallenges: ChallengeItem[] = [...FALLBACK_CHALLENGES];

export function setActiveChallenges(items: readonly ChallengeResponse[]): void {
    const built = buildChallengeItems(items);
    activeChallenges = built.length > 0 ? built : [...FALLBACK_CHALLENGES];
}

export function clearChallengesData(): void {
    activeChallenges = [...FALLBACK_CHALLENGES];
}

export function getActiveChallenges(): ChallengeItem[] {
    return activeChallenges;
}

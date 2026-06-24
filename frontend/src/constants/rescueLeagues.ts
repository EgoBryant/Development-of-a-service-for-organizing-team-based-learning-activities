export interface RescueLeagueOption {
    value: string;
    label: string;
    displayLabel: string;
}

export const RESCUE_LEAGUE_OPTIONS: RescueLeagueOption[] = [
    { value: "novice", label: "новичок", displayLabel: "НОВИЧОК" },
    { value: "pro", label: "профи", displayLabel: "ПРОФИ" },
    { value: "legend", label: "легенда", displayLabel: "ЛЕГЕНДА" }
];

export function getRescueLeagueDisplayLabel(value: string): string {
    const normalized = value.trim().toLowerCase();
    if (normalized === "medium") {
        return "ПРОФИ";
    }

    const match = RESCUE_LEAGUE_OPTIONS.find(
        (option) => option.value === normalized || option.label === normalized
    );
    return match?.displayLabel ?? "";
}

export interface RescueTagOption {
    value: string;
    label: string;
}

export const RESCUE_TAG_OPTIONS: RescueTagOption[] = [
    { value: "backend", label: "#Backend" },
    { value: "frontend-design", label: "#Frontend&Design" },
    { value: "math-theory", label: "#Math&Theory" }
];

export function getRescueTagDisplayLabel(value: string): string {
    const normalized = value.trim().toLowerCase();
    const match = RESCUE_TAG_OPTIONS.find((option) => option.value === normalized);
    return match?.label ?? "";
}

export function getRescueTagButtonLabel(tagValue: string): string {
    return getRescueTagDisplayLabel(tagValue) || "ТЕГ";
}

export type CheckInSliderKey = "productivity" | "communication" | "satisfaction";

export const CHECK_IN_SLIDER_CONFIG: ReadonlyArray<{ key: CheckInSliderKey; label: string; inputId: string }> = [
    { key: "productivity", label: "ПРОДУКТИВНОСТЬ", inputId: "teamCheckInProductivityInput" },
    { key: "communication", label: "КОММУНИКАЦИЯ", inputId: "teamCheckInCommunicationInput" },
    { key: "satisfaction", label: "УДОВЛЕТВОРЁННОСТЬ", inputId: "teamCheckInSatisfactionInput" }
];

export function buildCheckInReportPayload(
    reportText: string,
    productivity: number,
    communication: number,
    satisfaction: number
): string {
    const trimmedReport = reportText.trim();
    const metricsBlock = [
        `Продуктивность: ${productivity}%`,
        `Коммуникация: ${communication}%`,
        `Удовлетворённость: ${satisfaction}%`
    ].join("\n");

    return trimmedReport ? `${metricsBlock}\n\n${trimmedReport}` : metricsBlock;
}

export function updateCheckInSliderVisual(input: HTMLInputElement): void {
    const track = input.closest(".team-checkin-slider-track");
    if (!(track instanceof HTMLElement)) {
        return;
    }

    const label = track.querySelector(".team-checkin-slider-label");
    if (!(label instanceof HTMLElement)) {
        return;
    }

    const value = Number(input.value);
    const normalized = Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;
    const trackWidth = track.clientWidth;
    const fillWidth = (trackWidth * normalized) / 100;
    const attachGap = 10;
    const edgePadding = 18;
    const labelWidth = label.offsetWidth;
    const centeredLeft = Math.max(edgePadding, (trackWidth - labelWidth) / 2);
    const labelRightAtCenter = centeredLeft + labelWidth;

    track.style.setProperty("--checkin-slider-value", `${normalized}%`);
    track.classList.toggle("is-filled", normalized > 0);

    let labelLeft = centeredLeft;
    if (fillWidth >= labelRightAtCenter + attachGap) {
        labelLeft = fillWidth - labelWidth - attachGap;
    }

    const maxLeft = Math.max(edgePadding, trackWidth - labelWidth - edgePadding);
    labelLeft = Math.min(Math.max(labelLeft, edgePadding), maxLeft);

    track.style.setProperty("--checkin-slider-label-left", `${labelLeft}px`);

    const overlapPx = Math.max(0, Math.min(fillWidth - labelLeft, labelWidth));
    const overlapPercent = labelWidth > 0 ? (overlapPx / labelWidth) * 100 : 0;
    const blend = Math.min(18, Math.max(8, overlapPercent > 0 ? 12 : 0));
    const blendStart = Math.max(0, overlapPercent - blend);
    const blendMid = overlapPercent;
    const blendEnd = Math.min(100, overlapPercent + blend);

    label.style.setProperty("--checkin-label-fill-start", `${blendStart}%`);
    label.style.setProperty("--checkin-label-fill-mid", `${blendMid}%`);
    label.style.setProperty("--checkin-label-fill-end", `${blendEnd}%`);
    label.classList.toggle("has-fill-overlap", overlapPercent > 0);
    track.classList.toggle("is-label-attached", fillWidth >= labelRightAtCenter + attachGap);
}

export function syncCheckInSliderVisuals(root: ParentNode): void {
    root.querySelectorAll<HTMLInputElement>(".team-checkin-slider-input").forEach((input) => {
        updateCheckInSliderVisual(input);
    });
}

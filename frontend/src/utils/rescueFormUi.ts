import { getRescueLeagueDisplayLabel } from "../constants/rescueLeagues";
import type { TeamRescueAttachment } from "../types/team";
import {
    registerDraftAttachmentFile,
    unregisterDraftAttachmentFile
} from "../services/assignmentAttachmentsStore";

const RESCUE_WEEKDAY_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const RESCUE_MONTH_LABELS = [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь"
];

export function formatRescueDeadlineDisplay(isoDate: string): string {
    const trimmed = isoDate.trim();
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
    if (!match) {
        return "";
    }

    return `${match[3]}.${match[2]}.${match[1].slice(-2)}`;
}

export function createRescueAttachmentId(): string {
    return `rescue-file-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function appendRescueAttachments(
    attachments: TeamRescueAttachment[],
    files: FileList | File[]
): TeamRescueAttachment[] {
    const next = [...attachments];
    Array.from(files).forEach((file) => {
        const id = createRescueAttachmentId();
        registerDraftAttachmentFile(id, file);
        next.push({
            id,
            name: file.name
        });
    });
    return next;
}

export function removeRescueAttachment(
    attachments: TeamRescueAttachment[],
    attachmentId: string
): TeamRescueAttachment[] {
    unregisterDraftAttachmentFile(attachmentId);
    return attachments.filter((item) => item.id !== attachmentId);
}

export function formatRescueAttachmentCount(count: number): string {
    const mod10 = count % 10;
    const mod100 = count % 100;

    if (mod10 === 1 && mod100 !== 11) {
        return `${count} файл`;
    }

    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
        return `${count} файла`;
    }

    return `${count} файлов`;
}

export function getRescueLeagueButtonLabel(leagueValue: string): string {
    return getRescueLeagueDisplayLabel(leagueValue) || "ЛИГА";
}

export function getRescueDeadlineButtonLabel(deadlineIso: string): string {
    return formatRescueDeadlineDisplay(deadlineIso) || "ДЕДЛАЙН";
}

export function getRescueCalendarMonthKey(date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
}

export function shiftRescueCalendarMonthKey(monthKey: string, delta: number): string {
    const [yearRaw, monthRaw] = monthKey.split("-");
    const year = Number(yearRaw);
    const month = Number(monthRaw);
    if (!Number.isFinite(year) || !Number.isFinite(month)) {
        return getRescueCalendarMonthKey();
    }

    const date = new Date(year, month - 1 + delta, 1);
    return getRescueCalendarMonthKey(date);
}

export function toRescueIsoDate(year: number, month: number, day: number): string {
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export interface RescueCalendarDayCell {
    day: number;
    isoDate: string;
    isCurrentMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
    isPast: boolean;
}

export function getRescueTodayIsoDate(date = new Date()): string {
    return toRescueIsoDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

export function isRescueIsoDatePast(isoDate: string, todayIso = getRescueTodayIsoDate()): boolean {
    return isoDate.trim() < todayIso;
}

export function canShiftRescueCalendarMonth(monthKey: string, delta: number): boolean {
    if (delta >= 0) {
        return true;
    }

    const minMonthKey = getRescueCalendarMonthKey();
    const nextMonthKey = shiftRescueCalendarMonthKey(monthKey, delta);
    return nextMonthKey >= minMonthKey;
}

export function buildRescueCalendarCells(monthKey: string, selectedIsoDate: string): RescueCalendarDayCell[] {
    const [yearRaw, monthRaw] = monthKey.split("-");
    const year = Number(yearRaw);
    const month = Number(monthRaw);
    if (!Number.isFinite(year) || !Number.isFinite(month)) {
        return [];
    }

    const todayIso = getRescueTodayIsoDate();
    const firstDay = new Date(year, month - 1, 1);
    const daysInMonth = new Date(year, month, 0).getDate();
    const leadingEmpty = (firstDay.getDay() + 6) % 7;
    const cells: RescueCalendarDayCell[] = [];

    const pushCell = (day: number, isoDate: string, isCurrentMonth: boolean): void => {
        cells.push({
            day,
            isoDate,
            isCurrentMonth,
            isToday: isoDate === todayIso,
            isSelected: isoDate === selectedIsoDate,
            isPast: isRescueIsoDatePast(isoDate, todayIso)
        });
    };

    const prevMonthDays = new Date(year, month - 1, 0).getDate();
    for (let index = leadingEmpty; index > 0; index -= 1) {
        const day = prevMonthDays - index + 1;
        const prevMonth = month === 1 ? 12 : month - 1;
        const prevYear = month === 1 ? year - 1 : year;
        pushCell(day, toRescueIsoDate(prevYear, prevMonth, day), false);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
        pushCell(day, toRescueIsoDate(year, month, day), true);
    }

    while (cells.length % 7 !== 0) {
        const day = cells.length - leadingEmpty - daysInMonth + 1;
        const nextMonth = month === 12 ? 1 : month + 1;
        const nextYear = month === 12 ? year + 1 : year;
        pushCell(day, toRescueIsoDate(nextYear, nextMonth, day), false);
    }

    return cells;
}

export function getRescueCalendarTitle(monthKey: string): string {
    const [yearRaw, monthRaw] = monthKey.split("-");
    const year = Number(yearRaw);
    const month = Number(monthRaw);
    if (!Number.isFinite(year) || !Number.isFinite(month)) {
        return "";
    }

    return `${RESCUE_MONTH_LABELS[month - 1] ?? ""} ${year}`;
}

export function getRescueCalendarWeekdayLabels(): string[] {
    return [...RESCUE_WEEKDAY_LABELS];
}

export function syncRescueDescriptionHeight(textarea: HTMLTextAreaElement): void {
    const styles = window.getComputedStyle(textarea);
    const flexGrow = Number.parseFloat(styles.flexGrow);
    if (flexGrow > 0) {
        textarea.style.height = "";
        textarea.style.overflowY = "auto";
        return;
    }

    textarea.style.height = "auto";
    const lineHeight = Number.parseFloat(styles.lineHeight) || 20;
    const paddingTop = Number.parseFloat(styles.paddingTop) || 0;
    const paddingBottom = Number.parseFloat(styles.paddingBottom) || 0;
    const maxHeight = lineHeight * 2 + paddingTop + paddingBottom;
    const nextHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY = textarea.scrollHeight > maxHeight + 1 ? "auto" : "hidden";
}

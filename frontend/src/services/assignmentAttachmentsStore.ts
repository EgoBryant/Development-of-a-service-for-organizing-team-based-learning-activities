import type { TeamRescueAttachment } from "../types/team";

export interface AssignmentAttachmentMeta {
    id: string;
    name: string;
}

const draftFiles = new Map<string, File>();
const assignmentFiles = new Map<number, Map<string, File>>();
const assignmentMeta = new Map<number, AssignmentAttachmentMeta[]>();

export function registerDraftAttachmentFile(attachmentId: string, file: File): void {
    draftFiles.set(attachmentId, file);
}

export function unregisterDraftAttachmentFile(attachmentId: string): void {
    draftFiles.delete(attachmentId);
}

export function persistDraftAttachments(assignmentId: number, attachments: TeamRescueAttachment[]): void {
    if (attachments.length === 0) {
        return;
    }

    const files = new Map<string, File>();
    const meta: AssignmentAttachmentMeta[] = [];

    attachments.forEach((attachment) => {
        meta.push({ id: attachment.id, name: attachment.name });
        const file = draftFiles.get(attachment.id);
        if (file) {
            files.set(attachment.id, file);
            draftFiles.delete(attachment.id);
        }
    });

    assignmentMeta.set(assignmentId, meta);
    if (files.size > 0) {
        assignmentFiles.set(assignmentId, files);
    }
}

export function getAssignmentAttachments(assignmentId: number): AssignmentAttachmentMeta[] {
    return assignmentMeta.get(assignmentId) ?? [];
}

export function canDownloadAssignmentAttachment(assignmentId: number, attachmentId: string): boolean {
    return assignmentFiles.get(assignmentId)?.has(attachmentId) ?? false;
}

export function downloadAssignmentAttachment(assignmentId: number, attachmentId: string): boolean {
    const file = assignmentFiles.get(assignmentId)?.get(attachmentId);
    if (!file) {
        return false;
    }

    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 0);

    return true;
}

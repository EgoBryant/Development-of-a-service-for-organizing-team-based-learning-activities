import { renderProfileModalShell } from "../profile/ProfileModalShell";
import { closeTasksAssignmentModal, tasksFlowState } from "../../state/tasksFlowState";
import type { AssignmentItem } from "../../types/assignment";
import {
    canDownloadAssignmentAttachment,
    downloadAssignmentAttachment,
    getAssignmentAttachments
} from "../../services/assignmentAttachmentsStore";
import { escapeHtml } from "../../utils/html";
import { isHTMLInputElement } from "../../utils/dom";

function renderAssignmentFilesBlock(assignmentId: number): string {
    const attachments = getAssignmentAttachments(assignmentId);

    if (attachments.length === 0) {
        return `
            <p class="tasks-assignment-modal-files-empty">файлы не прикреплены</p>`;
    }

    const itemsHtml = attachments
        .map((attachment) => {
            const canDownload = canDownloadAssignmentAttachment(assignmentId, attachment.id);

            return `
                <li class="tasks-assignment-modal-file-item">
                    <button
                        type="button"
                        class="tasks-assignment-modal-file-link${canDownload ? "" : " is-disabled"}"
                        data-assignment-file-id="${escapeHtml(attachment.id)}"
                        ${canDownload ? "" : "disabled aria-disabled=\"true\""}
                        title="${escapeHtml(attachment.name)}"
                    >${escapeHtml(attachment.name)}</button>
                </li>`;
        })
        .join("");

    return `<ul class="tasks-assignment-modal-files-list">${itemsHtml}</ul>`;
}

export function renderTasksAssignmentModal(assignment: AssignmentItem): string {
    const modalTitle = assignment.title.trim() || "Задание";
    const topic = assignment.title.trim() || "Без темы";
    const description = assignment.description.trim() || "Описание не указано.";
    const deadline = assignment.deadlineLabel.trim() || "Не указан";
    const filesHtml = renderAssignmentFilesBlock(assignment.id);
    const contactValue = escapeHtml(tasksFlowState.assignmentContactDraft);

    return renderProfileModalShell({
        ariaLabel: modalTitle,
        closeButtonId: "tasksCloseAssignmentButton",
        backdropCloseAttr: 'data-close-tasks-assignment-modal="1"',
        extraCardClass: "tasks-assignment-modal-card",
        bodyHtml: `
            <div class="tasks-assignment-modal-body">
                <section class="tasks-assignment-modal-field">
                    <div class="tasks-assignment-modal-panel tasks-assignment-modal-panel--files">
                        ${filesHtml}
                    </div>
                </section>

                <p class="tasks-assignment-modal-topic">${escapeHtml(topic)}</p>

                <section class="tasks-assignment-modal-field">
                    <div class="tasks-assignment-modal-panel tasks-assignment-modal-panel--description">
                        <p class="tasks-assignment-modal-panel-text">${escapeHtml(description)}</p>
                    </div>
                </section>

                <section class="tasks-assignment-modal-field tasks-assignment-modal-field--deadline">
                    <div class="tasks-assignment-modal-deadline-row">
                        <span class="tasks-assignment-modal-deadline-label">Дедлайн до:</span>
                        <div class="tasks-assignment-modal-panel tasks-assignment-modal-panel--deadline">
                            <p class="tasks-assignment-modal-panel-text">${escapeHtml(deadline)}</p>
                        </div>
                    </div>
                </section>

                <section class="tasks-assignment-modal-field">
                    <div class="tasks-assignment-modal-panel tasks-assignment-modal-panel--contact">
                        <input
                            type="text"
                            id="tasksAssignmentContactInput"
                            class="tasks-assignment-modal-contact-input"
                            placeholder="Введите контакт"
                            aria-label="Контакт"
                            value="${contactValue}"
                        >
                        <button type="button" class="tasks-assignment-modal-submit" id="tasksAssignmentSubmitButton">
                            Отправить
                        </button>
                    </div>
                </section>
            </div>`
    });
}

export function closeTasksAssignmentModalView(root: HTMLElement, onClose?: () => void): void {
    closeTasksAssignmentModal();
    root.querySelector("#tasksAssignmentModalMount")?.remove();
    onClose?.();
}

export function wireTasksAssignmentModal(
    mount: HTMLElement,
    root: HTMLElement,
    onClose?: () => void
): void {
    const assignment = tasksFlowState.selectedAssignment;
    if (!assignment) {
        return;
    }

    const handleClose = (): void => {
        closeTasksAssignmentModalView(root, onClose);
    };

    mount.querySelectorAll<HTMLElement>('[data-close-tasks-assignment-modal="1"]').forEach((node) => {
        node.addEventListener("click", handleClose);
    });

    const closeButton = mount.querySelector("#tasksCloseAssignmentButton");
    if (closeButton instanceof HTMLButtonElement) {
        closeButton.addEventListener("click", handleClose);
    }

    const contactInput = mount.querySelector("#tasksAssignmentContactInput");
    if (isHTMLInputElement(contactInput)) {
        contactInput.addEventListener("input", () => {
            tasksFlowState.assignmentContactDraft = contactInput.value;
        });
    }

    mount.querySelectorAll<HTMLButtonElement>("[data-assignment-file-id]").forEach((button) => {
        button.addEventListener("click", () => {
            const attachmentId = button.dataset.assignmentFileId ?? "";
            if (!attachmentId || button.disabled) {
                return;
            }

            downloadAssignmentAttachment(assignment.id, attachmentId);
        });
    });

    const submitButton = mount.querySelector("#tasksAssignmentSubmitButton");
    if (submitButton instanceof HTMLButtonElement) {
        submitButton.addEventListener("click", handleClose);
    }
}

export function isHTMLElement(node: Element | null): node is HTMLElement {
    return node instanceof HTMLElement;
}

export function isHTMLInputElement(node: Element | RadioNodeList | null): node is HTMLInputElement {
    return node instanceof HTMLInputElement;
}

export function isHTMLButtonElement(node: Element | null): node is HTMLButtonElement {
    return node instanceof HTMLButtonElement;
}

export function isHTMLFormElement(node: Element | null): node is HTMLFormElement {
    return node instanceof HTMLFormElement;
}

export function isHTMLTextAreaElement(node: Element | null): node is HTMLTextAreaElement {
    return node instanceof HTMLTextAreaElement;
}

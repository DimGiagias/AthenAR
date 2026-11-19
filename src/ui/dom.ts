// Tiny DOM helpers for the render functions. Each write is skipped when the
// value is already there, so re-running a renderer is cheap and never resets
// focus, scroll or animations unnecessarily.

export const $ = (id: string): HTMLElement | null => document.getElementById(id);

export function setText(id: string, text: string): void {
    const el = $(id);
    if (el && el.textContent !== text) el.textContent = text;
}

export function setClass(id: string, className: string): void {
    const el = $(id);
    if (el && el.className !== className) el.className = className;
}

export function setHtml(id: string, html: string): void {
    const el = $(id);
    if (el) el.innerHTML = html;
}

export function setHidden(id: string, hidden: boolean): void {
    $(id)?.classList.toggle('hidden', hidden);
}

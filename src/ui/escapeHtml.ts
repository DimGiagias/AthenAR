const ENTITIES: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
};

/** Make user-supplied text safe to place inside an HTML template string. */
export function escapeHtml(text: string): string {
    return text.replace(/[&<>"']/g, (ch) => ENTITIES[ch]);
}

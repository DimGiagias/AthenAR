// Thin JSON wrapper over localStorage. Works in the browser, the installed
// PWA and the Capacitor WebView. Every access is guarded: storage can be
// unavailable (private mode, blocked site data) and the app must still run.

export function loadJson<T>(key: string, fallback: T): T {
    try {
        const raw = localStorage.getItem(key);
        return raw === null ? fallback : (JSON.parse(raw) as T);
    } catch {
        return fallback;
    }
}

export function saveJson(key: string, value: unknown): void {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Quota exceeded or storage disabled: state simply won't persist.
    }
}

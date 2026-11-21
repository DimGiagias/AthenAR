// Getting the app onto the phone's home screen.
//  - Chrome (Android): the browser's own install prompt. That version keeps
//    room AR, which the APK cannot have (Android's WebView has no WebXR).
//  - iPhone: websites get no install button, so the sheet shows Safari's steps.
// Each phone is offered the sheet once; the passport keeps an install row.
import { APP_VERSION, LATEST_RELEASE_API } from '../config';
import { isNativeApp } from '../platform/native';
import { loadJson, saveJson } from '../platform/storage';
import { getState, setState } from '../state/store';
import { t } from '../ui/i18n';
import { showToast } from './toast';

type InstallPrompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> };
let deferredPrompt: InstallPrompt | null = null;
const SEEN_KEY = 'athenar.installOffered.v1';

const isIos = (): boolean =>
    /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.userAgent.includes('Macintosh') && navigator.maxTouchPoints > 1);
const isStandalone = (): boolean =>
    window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
const isPhoneSized = (): boolean => window.matchMedia('(max-width: 639px)').matches;

/** Find out how this browser can install the app; nothing to do once installed. */
export function initInstall(): void {
    if (isNativeApp() || isStandalone()) return;
    if (isIos()) setState({ installable: 'ios' });
    // Chrome hands over its prompt only when the app can be installed, and keeps it for our button.
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e as InstallPrompt;
        setState({ installable: 'prompt' });
    });
    window.addEventListener('appinstalled', () => {
        deferredPrompt = null;
        setState({ installable: null, installSheet: false });
        showToast(t('toastInstalled'));
    });
}

/** Show the "get the app" sheet, once per phone (never on a computer). */
export function offerInstallOnce(): void {
    if (getState().installable === null || !isPhoneSized()) return;
    if (loadJson<boolean>(SEEN_KEY, false)) return;
    saveJson(SEEN_KEY, true);
    setState({ installSheet: true });
}

export function showInstallSheet(): void {
    if (getState().installable !== null) setState({ installSheet: true });
}

export function closeInstallSheet(): void {
    setState({ installSheet: false });
}

/** The install button: Chrome's own prompt. It can be used only once. */
export async function install(): Promise<void> {
    const prompt = deferredPrompt;
    if (!prompt) return;
    deferredPrompt = null;
    setState({ installSheet: false });
    try {
        await prompt.prompt();
        const { outcome } = await prompt.userChoice;
        // Accepted: 'appinstalled' follows. Dismissed: Chrome offers again on a later visit.
        if (outcome === 'dismissed') setState({ installable: null });
    } catch {
        setState({ installable: null });
    }
}

/** Native app only: say so when a newer release exists (the web app updates itself). */
export async function checkForUpdate(): Promise<void> {
    if (!isNativeApp() || !LATEST_RELEASE_API || !APP_VERSION) return;
    try {
        const res = await fetch(LATEST_RELEASE_API, { headers: { accept: 'application/vnd.github+json' } });
        if (!res.ok) return;
        const latest = ((await res.json()) as { tag_name?: string }).tag_name;
        if (latest && latest !== APP_VERSION) showToast(t('toastUpdateAvailable', { version: latest }));
    } catch {
        // Offline or rate-limited: nothing to report.
    }
}

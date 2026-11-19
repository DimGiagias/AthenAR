// Getting the app onto a phone: the Android APK, or "Add to Home Screen".
import { APK_URL, APP_VERSION, LATEST_RELEASE_API } from '../config';
import { isNativeApp } from '../platform/native';
import { loadJson, saveJson } from '../platform/storage';
import { setState } from '../state/store';
import { t } from '../ui/i18n';
import { showToast } from './toast';

type InstallPrompt = Event & { prompt: () => void };
let deferredPrompt: InstallPrompt | null = null;
const SEEN_KEY = 'athenar.installOffered.v1';

const isAndroid = (): boolean => /android/i.test(navigator.userAgent);
const isStandalone = (): boolean =>
    window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
const isPhoneSized = (): boolean => window.matchMedia('(max-width: 639px)').matches;

/** Keep the browser's own install prompt so our button can show it. */
export function captureInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e as InstallPrompt;
    });
}

/** Install: the APK on Android, the browser's prompt where it has one, otherwise a hint. */
export function install(): void {
    setState({ modalQr: false });
    if (isNativeApp() || isStandalone()) {
        showToast(t('toastAlreadyInstalled'));
    } else if (isAndroid() && APK_URL) {
        window.location.href = APK_URL; // real app from GitHub Releases
    } else if (deferredPrompt) {
        deferredPrompt.prompt();
    } else {
        showToast(t('toastInstallHint')); // iPhone: Share -> Add to Home Screen
    }
}

/**
 * Someone who opened the link on a phone (typically by scanning the QR code)
 * is offered the install options once.
 */
export function offerInstallOnce(): void {
    if (isNativeApp() || isStandalone() || !isPhoneSized()) return;
    if (loadJson<boolean>(SEEN_KEY, false)) return;
    saveJson(SEEN_KEY, true);
    setState({ modalQr: true });
}

/** Native app only: say so when a newer release exists (the PWA updates itself). */
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

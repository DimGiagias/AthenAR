import { startCamera, stopCamera } from '../../platform/camera';
import { startCompass } from '../../platform/compass';
import { getState, setState, watch } from '../../state/store';
import { t } from '../../ui/i18n';
import { currentAssessment } from '../exhibits';
import { setDemoMode, startGps, waitForFix } from '../location';
import { showToast } from '../toast';

/** Length of the scanner sweep animation. */
const SCAN_MS = 1900;
const SCAN_FIX_TIMEOUT_MS = 8000;
/** Demo: how far the simulated phone looks away in the wrong-building test. */
const DEMO_WRONG_OFFSET_DEG = -35;

/** Increases on every on/off, so a camera that opens after AR was left is closed again. */
let cameraRun = 0;
/** The camera being opened, so two callers share one request. */
let opening: Promise<void> | null = null;

/**
 * The live camera behind the AR view: on while Live AR is open, off when it
 * closes or room AR needs the camera for itself. Without a camera (refused,
 * or a desktop) the view shows a simulated backdrop instead.
 */
export function setArCamera(on: boolean): Promise<void> {
    if (!on) {
        cameraRun++;
        opening = null;
        if (getState().camera !== 'off') {
            stopCamera();
            setState({ camera: 'off' });
        }
        return Promise.resolve();
    }
    if (getState().camera !== 'off') return Promise.resolve();
    if (opening) return opening;
    const mine = ++cameraRun;
    opening = startCamera().then((stream) => {
        if (mine !== cameraRun) {
            stopCamera(); // AR was left while the camera was opening
            return;
        }
        opening = null;
        setState({ camera: stream ? 'live' : 'simulated' });
    });
    return opening;
}

/** Ask for compass access; only works inside a tap on iOS. */
export function wakeCompass(): void {
    void startCompass();
}

const delay = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/** "Scan": read GPS + compass and report whether the exhibit is locked. */
export async function scanLock(): Promise<void> {
    if (getState().scanning) return;
    const exhibitId = getState().exhibitId;
    void startCompass();

    if (getState().demoMode) setState({ demoHeadingOffset: 0 });
    else if (getState().gps !== 'active') startGps();

    setState({ scanning: true, offTargetOverlay: false });
    await Promise.all([delay(SCAN_MS), getState().demoMode ? Promise.resolve(true) : waitForFix(SCAN_FIX_TIMEOUT_MS)]);
    setState({ scanning: false });
    if (getState().exhibitId !== exhibitId) return;

    const lock = currentAssessment();
    if (lock.status === 'locked' || lock.status === 'here') {
        showToast(t('toastLocked', { score: lock.score }));
    } else {
        setState({ offTargetOverlay: true });
    }
}

/**
 * The amber "test wrong building" button. It is a simulation by nature, so it
 * runs in Demo Mode (switching it on if needed): the simulated phone turns
 * 35° away and the normal lock logic reports it.
 */
export function simulateWrongBuilding(): void {
    if (!getState().demoMode) setDemoMode(true);
    setState({ demoHeadingOffset: DEMO_WRONG_OFFSET_DEG, offTargetOverlay: true });
}

/** Close the off-target overlay by itself once the visitor locks on. */
export function initArControls(): void {
    watch(
        (s) => [s.offTargetOverlay, s.coords, s.heading, s.exhibitId],
        (s) => {
            if (!s.offTargetOverlay) return;
            const lock = currentAssessment(s);
            if (lock.status === 'locked') {
                setState({ offTargetOverlay: false });
                showToast(t('toastLocked', { score: lock.score }));
            }
        },
    );
    // Leaving an exhibit dismisses anything tied to it.
    let last = getState().exhibitId;
    watch(
        (s) => [s.exhibitId],
        (s) => {
            if (s.exhibitId === last) return;
            last = s.exhibitId;
            setState({ offTargetOverlay: false });
        },
    );
}

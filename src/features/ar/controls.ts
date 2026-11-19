import type { ArEra } from '../../data/types';
import { startCamera, stopCamera } from '../../platform/camera';
import { startCompass } from '../../platform/compass';
import { getState, setState, watch } from '../../state/store';
import { t } from '../../ui/i18n';
import { currentAssessment } from '../exhibits';
import { setDemoMode, startGps, waitForFix } from '../location';
import { showToast } from '../toast';

const ERAS: ArEra[] = ['1900', '1950', 'today'];
const TIMELAPSE_STEP_MS = 2000;
/** Length of the scanner sweep animation. */
const SCAN_MS = 1900;
const SCAN_FIX_TIMEOUT_MS = 8000;
/** Demo: how far the simulated phone looks away in the wrong-building test. */
const DEMO_WRONG_OFFSET_DEG = -35;

let timelapseTimer: ReturnType<typeof setInterval> | undefined;

export function stopTimelapse(): void {
    clearInterval(timelapseTimer);
    timelapseTimer = undefined;
    setState({ timelapse: false });
}

/** Cycle 1900 -> 1950 -> today so the building visibly evolves. */
export function toggleTimelapse(): void {
    if (getState().timelapse) {
        stopTimelapse();
        return;
    }
    let step = 0;
    setState({ timelapse: true, arEra: ERAS[step] });
    timelapseTimer = setInterval(() => {
        step = (step + 1) % ERAS.length;
        setState({ arEra: ERAS[step] });
    }, TIMELAPSE_STEP_MS);
}

/** Camera on => live feed (or a simulated backdrop) behind the 3D hologram. */
export async function toggleCamera(): Promise<void> {
    if (getState().camera !== 'off') {
        stopCamera();
        stopTimelapse();
        setState({ camera: 'off', dimension: '2d' });
        return;
    }
    void startCompass(); // user gesture: lets iOS show its motion prompt
    setState({ dimension: '3d' });
    const stream = await startCamera();
    setState({ camera: stream ? 'live' : 'simulated' });
    showToast(t(stream ? 'toastCameraOn' : 'toastCameraSim'));
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

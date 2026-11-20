// Sensors controller: real GPS + compass, or the clearly-labelled Demo Mode
// that simulates a position at the selected exhibit. Writes only to the store.
import { bearingDegrees, normalizeDegrees, offsetPoint, signedAngleDelta } from '../platform/geoMath';
import { getHeading, onHeading, startCompass } from '../platform/compass';
import { startWatching, stopWatching, type Fix, type GeoFailure } from '../platform/geo';
import { getState, setState, watch } from '../state/store';
import { t } from '../ui/i18n';
import { currentExhibit } from './exhibits';
import { showToast } from './toast';

/** Where the simulated visitor stands: this far south of the exhibit. */
const DEMO_DISTANCE_M = 20;
const DEMO_ACCURACY_M = 5;
/** Push a new heading into the store only when it moved this much. */
const HEADING_STEP_DEG = 2;

let fixWaiters: Array<(ok: boolean) => void> = [];
const settleWaiters = (ok: boolean): void => {
    const pending = fixWaiters;
    fixWaiters = [];
    pending.forEach((resolve) => resolve(ok));
};

function onFix(fix: Fix): void {
    if (getState().demoMode) return;
    setState({ gps: 'active', coords: [fix.lat, fix.lng], accuracy: fix.accuracy });
    settleWaiters(true);
}

function onFail(reason: GeoFailure): void {
    const s = getState();
    if (s.demoMode) return;
    // A hiccup while we already have a position is not worth losing it for.
    if (reason === 'unavailable' && s.gps === 'active') return;
    stopWatching();
    setState({ gps: reason, coords: null, accuracy: null });
    settleWaiters(false);
}

/** Start the position watch only (no compass), unless one is already running. Safe at launch. */
export function startPosition(): void {
    const s = getState();
    if (s.demoMode || s.gps === 'acquiring' || s.gps === 'active') return;
    setState({ gps: 'acquiring' });
    startWatching({ onFix, onFail });
}

/** Start real GPS and compass. Call from a user gesture (iOS compass prompt). */
export function startGps(): void {
    if (getState().demoMode) return;
    void startCompass();
    setState({ gps: 'acquiring' });
    startWatching({ onFix, onFail });
}

export function stopGps(): void {
    stopWatching();
    settleWaiters(false);
    setState({ gps: 'off', coords: null, accuracy: null });
}

/** The map's GPS pill: stop when on (or leave Demo Mode), otherwise start. */
export function toggleGps(): void {
    const s = getState();
    if (s.demoMode) setDemoMode(false);
    else if (s.gps === 'active' || s.gps === 'acquiring') stopGps();
    else startGps();
}

/** Resolves true once a position is known, false on failure or timeout. */
export function waitForFix(timeoutMs: number): Promise<boolean> {
    const s = getState();
    if (s.gps === 'active' && s.coords) return Promise.resolve(true);
    if (s.gps !== 'acquiring') return Promise.resolve(false);
    return new Promise((resolve) => {
        let done = false;
        const finish = (ok: boolean): void => {
            if (done) return;
            done = true;
            resolve(ok);
        };
        fixWaiters.push(finish);
        setTimeout(() => finish(false), timeoutMs);
    });
}

// ---------------------------------------------------------------- Demo Mode

function applyDemoPosition(): void {
    const s = getState();
    if (!s.demoMode) return;
    const ex = currentExhibit(s);
    const pos = offsetPoint(ex.coords[0], ex.coords[1], 180, DEMO_DISTANCE_M);
    const facing = bearingDegrees(pos[0], pos[1], ex.coords[0], ex.coords[1]);
    setState({
        gps: 'active',
        coords: pos,
        accuracy: DEMO_ACCURACY_M,
        heading: Math.round(normalizeDegrees(facing + s.demoHeadingOffset)),
    });
}

export function setDemoMode(on: boolean): void {
    if (getState().demoMode === on) return;
    if (on) {
        stopWatching();
        settleWaiters(false);
        setState({ demoMode: true, demoHeadingOffset: 0 });
        applyDemoPosition();
        showToast(t('toastDemoOn'));
    } else {
        setState({
            demoMode: false,
            demoHeadingOffset: 0,
            gps: 'off',
            coords: null,
            accuracy: null,
            heading: realHeadingForStore(),
            offTargetOverlay: false,
        });
        showToast(t('toastDemoOff'));
    }
}

export function toggleDemoMode(): void {
    setDemoMode(!getState().demoMode);
}

function realHeadingForStore(): number | null {
    const h = getHeading();
    return h === null ? null : Math.round(h);
}

/** Wire the compass into the store and keep the demo position in sync. */
export function initLocation(): void {
    onHeading((h) => {
        const s = getState();
        if (s.demoMode) return;
        if (s.heading === null || Math.abs(signedAngleDelta(s.heading, h)) >= HEADING_STEP_DEG) {
            setState({ heading: Math.round(h) });
        }
    });
    watch(
        (s) => [s.demoMode, s.exhibitId, s.demoHeadingOffset],
        () => applyDemoPosition(),
    );
}

// Image-anchored AR: point the camera at a known picture (see
// data/arTargets.ts) and the exhibit's 3D model appears on it, with its
// numbered story pins. Indoors this replaces GPS + compass, which cannot work
// inside a building.
//
// Pose updates go straight from the tracker to the 3D engine (many per
// second); the store only hears about status changes. When the image goes out
// of view, the engine holds the model in place with the gyroscope ('holding').
import { AR_TARGETS_FILE, IMAGE_TARGETS } from '../../data/arTargets';
import { getCameraStream } from '../../platform/camera';
import { startCompass } from '../../platform/compass';
import { startMotion, stopMotion } from '../../platform/motion';
import { startImageTracker, type TrackerSession } from '../../platform/imageTracker';
import { getState, setState, watch } from '../../state/store';
import { t } from '../../ui/i18n';
import { getExhibit } from '../exhibits';
import { showToast } from '../toast';
import { setArCamera } from './controls';
import { setImageTracking, setTrackedPose } from './three/engine';

let session: TrackerSession | null = null;
/** Increases on every start/stop, so a slow start that was cancelled does nothing. */
let run = 0;

const targetsUrl = (): string => new URL(AR_TARGETS_FILE, document.baseURI).href;

/** Start scanning for a picture. Resolves false when it could not start (no camera, or the tracker failed). */
export async function startImageAr(): Promise<boolean> {
    const mine = ++run;
    void startCompass(); // inside the tap: lets iOS ask for motion access
    startMotion();
    setState({ imageAr: 'loading', imageArExhibit: null });

    await setArCamera(true);
    const stream = getCameraStream();
    if (getState().camera !== 'live' || !stream) {
        if (mine !== run) return true; // stopped while the camera was opening
        setState({ imageAr: 'off' });
        showToast(t('toastImageArNoCamera'));
        return false;
    }

    try {
        const started = await startImageTracker(stream, targetsUrl(), (index, pose) => {
            if (mine === run) onPose(index, pose);
        });
        if (mine !== run) {
            started.stop(); // switched off while loading
            return true;
        }
        session = started;
        setImageTracking({ projection: started.projection, inputWidth: started.inputWidth, inputHeight: started.inputHeight });
        setState({ imageAr: 'scanning' });
        return true;
    } catch (err) {
        console.warn('Image AR failed to start', err);
        if (mine !== run) return true;
        setState({ imageAr: 'off' });
        showToast(t('toastImageArError'));
        return false;
    }
}

let lastIndex = -1;

function onPose(index: number, pose: number[] | null): void {
    const target = IMAGE_TARGETS[index];
    const size = session?.targetSizes[index];
    if (!target || !size) return;

    if (pose) {
        setTrackedPose(pose, { width: size[0], height: size[1], placement: target.placement, modelWidth: target.modelWidth });
        if (getState().imageAr !== 'tracking' || lastIndex !== index) {
            const wasHolding = getState().imageAr === 'holding' && lastIndex === index;
            lastIndex = index;
            const found = !wasHolding && (target.exhibitId !== getState().exhibitId || getState().imageArExhibit === null);
            setState({ imageAr: 'tracking', imageArExhibit: target.exhibitId, exhibitId: target.exhibitId, hotspotIndex: found ? 0 : getState().hotspotIndex });
            if (found) showToast(t('toastImageArFound', { title: getExhibit(target.exhibitId)[getState().lang].title }));
        }
    } else if (index === lastIndex) {
        setTrackedPose(null, { width: size[0], height: size[1], placement: target.placement, modelWidth: target.modelWidth });
        if (getState().imageAr === 'tracking') setState({ imageAr: 'holding' });
    }
}

export function stopImageAr(): void {
    run++;
    session?.stop();
    session = null;
    lastIndex = -1;
    setImageTracking(null);
    stopMotion();
    if (getState().imageAr !== 'off') setState({ imageAr: 'off', imageArExhibit: null });
}

/** Stop when the camera goes off, as it does when the visitor leaves Live AR (saves battery). */
export function initImageAr(): void {
    watch(
        (s) => [s.camera],
        (s) => {
            if (s.imageAr !== 'off' && s.imageAr !== 'loading' && s.camera !== 'live') stopImageAr();
        },
    );
}

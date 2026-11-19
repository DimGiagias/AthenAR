// The WebXR session behind room AR: finds the floor with a hit test from the
// centre of the screen, shows a ring there, and on a tap stands the model on
// it. Loaded on demand by room.ts.
import type { XRFrame, XRHitTestSource, XRSession, XRSessionInit } from 'three/src/renderers/webxr/WebXR';
import { getState, setState, type RoomArStatus } from '../../state/store';
import { t } from '../../ui/i18n';
import { showToast } from '../toast';
import { toggleCamera } from './controls';
import { ROOM_SCALES, webXr } from './room';
import { getRenderer, placeRoomModel, setReticle, setRoomFrameHook, setRoomMode } from './three/engine';

/** The page element WebXR shows over the camera view (buttons, pins, story). */
const OVERLAY_ID = 'xrOverlay';

let session: XRSession | null = null;
let hitSource: XRHitTestSource | null = null;

function setStatus(roomAr: RoomArStatus): void {
    if (getState().roomAr !== roomAr) setState({ roomAr });
}

export async function startRoomAr(): Promise<void> {
    const xr = webXr();
    const renderer = getRenderer();
    if (!xr || !renderer || session) return;
    setStatus('starting');
    // ARCore needs the camera for itself.
    if (getState().camera !== 'off') await toggleCamera();

    const options = {
        requiredFeatures: ['hit-test'],
        optionalFeatures: ['dom-overlay'],
        domOverlay: { root: document.getElementById(OVERLAY_ID) },
    } as XRSessionInit;
    try {
        session = await xr.requestSession('immersive-ar', options);
        renderer.xr.enabled = true;
        renderer.xr.setReferenceSpaceType('local');
        await renderer.xr.setSession(session);
        const viewer = await session.requestReferenceSpace('viewer');
        hitSource = await session.requestHitTestSource({ space: viewer });
    } catch {
        await session?.end().catch(() => undefined);
        cleanUp();
        showToast(t('toastRoomFailed'));
        return;
    }
    session.addEventListener('select', onTap);
    session.addEventListener('end', cleanUp);
    setRoomMode(true, ROOM_SCALES[getState().roomSize]);
    setRoomFrameHook(onFrame);
    setStatus('searching');
}

export function endRoomAr(): void {
    void session?.end();
}

function onFrame(frame: XRFrame): void {
    const space = getRenderer()?.xr.getReferenceSpace();
    if (!hitSource || !space) return;
    const hit = frame.getHitTestResults(hitSource)[0]?.getPose(space);
    setReticle(hit ? hit.transform.matrix : null);
    if (getState().roomAr !== 'placed') setStatus(hit ? 'aiming' : 'searching');
}

/** A tap on the camera view (taps on the overlay's buttons are filtered out by the UI). */
function onTap(): void {
    if (placeRoomModel()) setStatus('placed');
}

function cleanUp(): void {
    hitSource?.cancel();
    hitSource = null;
    session = null;
    setRoomMode(false);
    const renderer = getRenderer();
    if (renderer) renderer.xr.enabled = false;
    setStatus('off');
}

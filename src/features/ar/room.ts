// Room AR: put the exhibit's 3D model on the real floor and walk around it.
// Uses WebXR (Chrome on Android phones with ARCore). The session code in
// roomSession.ts loads on first use, and APK builds (VITE_TARGET=android)
// leave it out entirely: Android's WebView has no WebXR.
import type { XR } from 'three/src/renderers/webxr/WebXR';
import { isNativeApp } from '../../platform/native';
import { getState, setState } from '../../state/store';
import { START_SCALE } from './roomControls';
import { faceRoomFront, getRoomTurn, placeRoomModel, setRoomScale, setRoomSpin, setRoomTurn } from './three/engine';

const DEG = Math.PI / 180;

export function webXr(): XR | undefined {
    return (navigator as Navigator & { xr?: XR }).xr;
}

/** Find out once, at start-up, whether this device can run room AR. */
export async function detectRoomAr(): Promise<void> {
    if (import.meta.env.VITE_TARGET === 'android' || isNativeApp()) return;
    try {
        if (await webXr()?.isSessionSupported('immersive-ar')) setState({ roomAr: 'off' });
    } catch {
        // Blocked by a permissions policy or not implemented: stays unsupported.
    }
}

/** Starts the session; call from a tap (the browser requires a user gesture). */
export function placeInRoom(): void {
    if (import.meta.env.VITE_TARGET === 'android' || getState().roomAr !== 'off') return;
    void import('./roomSession').then((m) => m.startRoomAr());
}

export function exitRoom(): void {
    if (import.meta.env.VITE_TARGET === 'android') return;
    void import('./roomSession').then((m) => m.endRoomAr());
}

/** The big button in room AR: stand the model where the ring on the floor is. */
export function placeHere(): void {
    if (placeRoomModel()) setState({ roomAr: 'placed' });
}

/** `scale` is metres per model unit (see SIZE_STOPS). */
export function setRoomSize(scale: number): void {
    setState({ roomScale: scale });
    setRoomScale(scale);
}

export function resetRoomSize(): void {
    setRoomSize(START_SCALE);
}

/** Turn the model to `degrees` from facing the visitor; any number of turns. */
export function turnRoom(degrees: number): void {
    setRoomTurn(degrees * DEG);
}

export function roomTurnDegrees(): number {
    return getRoomTurn() / DEG;
}

export function toggleRoomSpin(): void {
    const on = !getState().roomSpin;
    setState({ roomSpin: on });
    setRoomSpin(on);
}

export function resetRoomTurn(): void {
    setState({ roomSpin: false });
    setRoomSpin(false);
    faceRoomFront();
}

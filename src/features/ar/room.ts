// Room AR: put the exhibit's 3D model on the real floor and walk around it.
// Uses WebXR (Chrome on Android phones with ARCore). The session code in
// roomSession.ts loads on first use, and APK builds (VITE_TARGET=android)
// leave it out entirely: Android's WebView has no WebXR.
import type { XR } from 'three/src/renderers/webxr/WebXR';
import { isNativeApp } from '../../platform/native';
import { getState, setState } from '../../state/store';
import { rotateRoomModel, setRoomScale } from './three/engine';

/** Metres per model unit: about 0.6 m (tabletop), 2 m and 6 m wide. */
export const ROOM_SCALES = [0.1, 0.35, 1] as const;

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

export function cycleRoomSize(): void {
    const next = (getState().roomSize + 1) % ROOM_SCALES.length;
    setState({ roomSize: next });
    setRoomScale(ROOM_SCALES[next]);
}

export function rotateRoom(degrees: number): void {
    rotateRoomModel((degrees * Math.PI) / 180);
}

// Phone orientation from the gyroscope (the relative `deviceorientation`
// event: smooth, no magnetometer noise). Used to hold the image-AR model in
// place while the picture is out of view. On iOS, permission is asked by
// startCompass() in platform/compass.ts, which covers this event too.

export interface DeviceAngles {
    /** Degrees, W3C DeviceOrientationEvent convention. */
    alpha: number;
    beta: number;
    gamma: number;
    /** Screen rotation in degrees (0 in portrait). */
    screen: number;
}

let latest: DeviceAngles | null = null;
let listening = false;

function onOrientation(e: DeviceOrientationEvent): void {
    if (e.alpha === null || e.beta === null || e.gamma === null) return;
    latest = { alpha: e.alpha, beta: e.beta, gamma: e.gamma, screen: screen.orientation?.angle ?? 0 };
}

export function startMotion(): void {
    if (listening || typeof window === 'undefined') return;
    listening = true;
    window.addEventListener('deviceorientation', onOrientation);
}

export function stopMotion(): void {
    if (!listening) return;
    listening = false;
    latest = null;
    window.removeEventListener('deviceorientation', onOrientation);
}

/** Latest phone orientation, or null if the device has not reported one. */
export function getDeviceAngles(): DeviceAngles | null {
    return latest;
}

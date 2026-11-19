// Device compass and tilt. Reports the direction the BACK of the phone (the
// camera) is pointing, as a true-north heading, plus the phone's pitch.
import { MAGNETIC_DECLINATION_DEG } from '../data/geo';
import { normalizeDegrees } from './geoMath';

export type CompassStatus = 'off' | 'active' | 'denied' | 'unavailable';

interface IosOrientationEvent extends DeviceOrientationEvent {
    webkitCompassHeading?: number;
}
interface IosOrientationEventStatic {
    requestPermission?: () => Promise<'granted' | 'denied'>;
}

const DEG = Math.PI / 180;
/** Low-pass factor per sensor event: lower = steadier but slower. */
const SMOOTHING = 0.18;

let status: CompassStatus = 'off';
let listening = false;
let permissionGranted = false;
// Smoothed heading kept as a unit vector so 359° -> 1° does not swing through 180°.
let sx = 0;
let sy = 0;
let hasHeading = false;
let pitchDeg: number | null = null;
let listeners: Array<(heading: number) => void> = [];

/**
 * Heading of the camera direction from the W3C orientation angles
 * (formula from the DeviceOrientation spec, "compass heading" example).
 */
export function headingFromEuler(alpha: number, beta: number, gamma: number): number {
    const x = beta * DEG;
    const y = gamma * DEG;
    const z = alpha * DEG;
    const cY = Math.cos(y);
    const cZ = Math.cos(z);
    const sX = Math.sin(x);
    const sY = Math.sin(y);
    const sZ = Math.sin(z);
    const vx = -cZ * sY - sZ * sX * cY;
    const vy = -sZ * sY + cZ * sX * cY;
    let h = Math.atan(vx / vy);
    if (vy < 0) h += Math.PI;
    else if (vx < 0) h += 2 * Math.PI;
    return normalizeDegrees(h / DEG);
}

function onOrientation(ev: DeviceOrientationEvent): void {
    const e = ev as IosOrientationEvent;
    let magnetic: number | null = null;

    if (typeof e.webkitCompassHeading === 'number' && !Number.isNaN(e.webkitCompassHeading)) {
        magnetic = e.webkitCompassHeading; // iOS: already a compass heading
    } else if (e.absolute && e.alpha !== null && e.beta !== null && e.gamma !== null) {
        // Held upright the camera direction comes from the full rotation; lying
        // flat that direction points at the ground, so use the top edge instead.
        magnetic = Math.abs(e.beta) > 25 ? headingFromEuler(e.alpha, e.beta, e.gamma) : normalizeDegrees(360 - e.alpha);
    }
    if (e.beta !== null) pitchDeg = e.beta;
    if (magnetic === null) return;

    const trueHeading = (magnetic + MAGNETIC_DECLINATION_DEG) * DEG;
    const cx = Math.cos(trueHeading);
    const cy = Math.sin(trueHeading);
    if (!hasHeading) {
        sx = cx;
        sy = cy;
        hasHeading = true;
    } else {
        sx += (cx - sx) * SMOOTHING;
        sy += (cy - sy) * SMOOTHING;
    }
    status = 'active';
    const h = getHeading();
    if (h !== null) listeners.forEach((fn) => fn(h));
}

/**
 * Start the compass. Must be called from a user gesture: iOS only shows its
 * motion-permission prompt in response to a tap.
 */
export async function startCompass(): Promise<CompassStatus> {
    if (typeof window === 'undefined' || typeof DeviceOrientationEvent === 'undefined') {
        status = 'unavailable';
        return status;
    }
    // Always listen: where no permission is needed the readings just arrive,
    // and where it is still missing the listeners stay silent and harmless.
    // Android Chrome/WebView delivers true compass data on the "absolute"
    // event; iOS delivers webkitCompassHeading on the plain one.
    if (!listening) {
        window.addEventListener('deviceorientationabsolute', onOrientation as EventListener);
        window.addEventListener('deviceorientation', onOrientation as EventListener);
        listening = true;
    }

    // iOS (and newer Chrome) gate motion sensors behind a prompt that only a
    // tap may open. Ask on every call until granted, so a later tap can
    // succeed where an earlier, non-gesture call was refused.
    const ctor = DeviceOrientationEvent as unknown as IosOrientationEventStatic;
    if (!permissionGranted && typeof ctor.requestPermission === 'function') {
        try {
            permissionGranted = (await ctor.requestPermission()) === 'granted';
        } catch {
            permissionGranted = false;
        }
        if (!permissionGranted && !hasHeading) status = 'denied';
    }
    // Otherwise stays 'off' until the first real reading; desktops never send one.
    return status;
}

/** Smoothed true heading of the camera direction, or null if no reading yet. */
export function getHeading(): number | null {
    if (!hasHeading) return null;
    return normalizeDegrees(Math.atan2(sy, sx) / DEG);
}

/** Phone pitch in degrees: 90 = held upright, 0 = lying flat. Null if unknown. */
export function getPitch(): number | null {
    return pitchDeg;
}

export function onHeading(fn: (heading: number) => void): () => void {
    listeners.push(fn);
    return () => {
        listeners = listeners.filter((l) => l !== fn);
    };
}

// Decides when the 3D hologram is anchored towards the real building.
import type { AppState } from '../../state/store';
import { currentAssessment } from '../exhibits';
import { isOnSite } from './verification';

/** Closer than this the bearing to the building swings wildly with GPS noise. */
const MIN_ANCHOR_DISTANCE_M = 15;

/**
 * Compass bearing the hologram should sit at, or null for the centred model.
 * Anchoring needs the live camera, real sensors (not Demo Mode), a compass
 * reading and the visitor inside the exhibit's geofence. A found picture
 * takes over.
 */
export function anchorBearingFor(s: Readonly<AppState>): number | null {
    if (s.camera !== 'live' || s.demoMode || s.heading === null || s.imageAr === 'tracking' || s.imageAr === 'holding') return null;
    const lock = currentAssessment(s);
    if (!isOnSite(lock) || lock.distance === null || lock.distance < MIN_ANCHOR_DISTANCE_M) return null;
    return lock.bearing;
}

// Location & direction lock: decides whether the visitor is at an exhibit and
// facing it, from GPS and compass readings alone. Pure functions, no sensors.
//
// It is not visual recognition: it cannot see the building, only where the
// phone is and which way it points.
import { bearingDegrees, distanceMeters, signedAngleDelta } from '../../platform/geoMath';

export type LockStatus =
    | 'no-fix' // no position known
    | 'far' // outside the exhibit's geofence
    | 'here' // inside the geofence, but no compass to judge direction
    | 'misaligned' // inside the geofence, facing away
    | 'locked'; // inside the geofence and facing the building

export interface AssessInput {
    /** Visitor [lat, lng], or null without a fix. */
    user: [number, number] | null;
    /** GPS accuracy radius in metres. */
    accuracy: number | null;
    /** True heading of the camera direction, or null without a compass. */
    heading: number | null;
    /** Exhibit [lat, lng]. */
    target: [number, number];
    /** Geofence radius in metres. */
    radius: number;
}

export interface Assessment {
    status: LockStatus;
    /** Metres to the exhibit. */
    distance: number | null;
    /** Compass bearing from the visitor to the exhibit. */
    bearing: number | null;
    /** Degrees to turn to face the exhibit: positive = right, negative = left. */
    headingError: number | null;
    /** 0-100 confidence that the visitor is at the exhibit and facing it. */
    score: number;
    radius: number;
}

/** Facing within this many degrees of the building counts as locked. */
export const LOCK_TOLERANCE_DEG = 25;
/** GPS error we are willing to forgive at the edge of a geofence. */
const ACCURACY_ALLOWANCE_CAP_M = 30;
/** This close, the bearing to "the building" is meaningless: you are at it. */
const AT_BUILDING_M = 15;

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

export function assess(input: AssessInput): Assessment {
    const { user, heading, target, radius } = input;
    if (!user) {
        return { status: 'no-fix', distance: null, bearing: null, headingError: null, score: 0, radius };
    }

    const accuracy = Math.max(0, input.accuracy ?? 0);
    const allowance = Math.min(accuracy, ACCURACY_ALLOWANCE_CAP_M);
    const distance = distanceMeters(user[0], user[1], target[0], target[1]);
    const bearing = bearingDegrees(user[0], user[1], target[0], target[1]);
    const headingError = heading === null ? null : signedAngleDelta(heading, bearing);
    const inRange = distance <= radius + allowance;

    // Location confidence: inside the geofence it only drops with poor GPS
    // accuracy; outside it falls off with distance and never exceeds 50%.
    const locationScore = inRange
        ? Math.max(0.7, 1 - accuracy / 150)
        : 0.5 * clamp01(1 - (distance - radius - allowance) / (radius * 4));

    const atBuilding = distance <= Math.max(AT_BUILDING_M, allowance);
    // Direction confidence: cos² of the angle off the building.
    const directionScore =
        headingError === null || atBuilding ? 1 : Math.cos((Math.min(90, Math.abs(headingError)) * Math.PI) / 180) ** 2;

    const score = Math.round(100 * locationScore * directionScore);

    let status: LockStatus;
    if (!inRange) status = 'far';
    else if (atBuilding) status = 'locked';
    else if (headingError === null) status = 'here';
    else status = Math.abs(headingError) <= LOCK_TOLERANCE_DEG ? 'locked' : 'misaligned';

    return { status, distance, bearing, headingError, score, radius };
}

/** True when the visitor is close enough to collect the exhibit's stamp. */
export function isOnSite(a: Assessment): boolean {
    return a.status === 'here' || a.status === 'misaligned' || a.status === 'locked';
}

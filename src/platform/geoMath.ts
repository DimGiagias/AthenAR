// Pure geographic maths. No DOM, no sensors: safe to unit test.

const EARTH_RADIUS_M = 6371000;
const toRad = (deg: number): number => (deg * Math.PI) / 180;
const toDeg = (rad: number): number => (rad * 180) / Math.PI;

/** Great-circle distance in whole metres (haversine). */
export function distanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(EARTH_RADIUS_M * c);
}

/** Initial compass bearing from point 1 to point 2, in degrees [0, 360). 0 = north, 90 = east. */
export function bearingDegrees(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const phi1 = toRad(lat1);
    const phi2 = toRad(lat2);
    const dLon = toRad(lon2 - lon1);
    const y = Math.sin(dLon) * Math.cos(phi2);
    const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLon);
    return normalizeDegrees(toDeg(Math.atan2(y, x)));
}

/** Wrap any angle into [0, 360). */
export function normalizeDegrees(deg: number): number {
    return ((deg % 360) + 360) % 360;
}

/**
 * Shortest signed turn from `from` to `to`, in (-180, 180].
 * Positive = clockwise (turn right), negative = counter-clockwise (turn left).
 */
export function signedAngleDelta(from: number, to: number): number {
    const d = normalizeDegrees(to - from);
    return d > 180 ? d - 360 : d;
}

/** Point `meters` away from [lat, lng] along `bearing` (short distances). */
export function offsetPoint(lat: number, lng: number, bearing: number, meters: number): [number, number] {
    const dLat = (meters * Math.cos(toRad(bearing))) / EARTH_RADIUS_M;
    const dLng = (meters * Math.sin(toRad(bearing))) / (EARTH_RADIUS_M * Math.cos(toRad(lat)));
    return [lat + toDeg(dLat), lng + toDeg(dLng)];
}

/** "📍 420m" below one kilometre, "📍 1.3 km" above. */
export function formatDistance(meters: number): string {
    return meters < 1000 ? `📍 ${meters}m` : `📍 ${(meters / 1000).toFixed(1)} km`;
}

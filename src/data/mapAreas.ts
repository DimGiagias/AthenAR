import { exhibitsData } from './exhibits';
import type { EraRoom } from './types';

/**
 * Area covered by the bundled map tiles: [west, south, east, north].
 * Keep in sync with BBOX and the zooms in scripts/fetch-map-data.mjs.
 */
export const MAP_BBOX: [number, number, number, number] = [23.675, 37.945, 23.79, 38.045];
export const MAP_TILE_MIN_ZOOM = 10;
export const MAP_TILE_MAX_ZOOM = 15;

export type LngLat = [number, number];

const M_PER_DEG_LAT = 111195;

/**
 * A rounded outline around a set of [lat, lng] points, `radiusM` metres away
 * from them: the convex hull of a circle drawn round each point.
 * Returns a closed ring of [lng, lat], ready for GeoJSON.
 */
export function bufferedHull(points: ReadonlyArray<[number, number]>, radiusM: number): LngLat[] {
    const lat0 = points.reduce((sum, p) => sum + p[0], 0) / points.length;
    const mPerDegLng = M_PER_DEG_LAT * Math.cos((lat0 * Math.PI) / 180);
    const STEPS = 20;
    const cloud: Array<[number, number]> = [];
    for (const [lat, lng] of points) {
        for (let i = 0; i < STEPS; i++) {
            const a = (i / STEPS) * 2 * Math.PI;
            cloud.push([lng * mPerDegLng + radiusM * Math.cos(a), lat * M_PER_DEG_LAT + radiusM * Math.sin(a)]);
        }
    }
    // Convex hull by the monotone chain method.
    cloud.sort((p, q) => p[0] - q[0] || p[1] - q[1]);
    const cross = (o: number[], a: number[], b: number[]): number => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const half = (pts: Array<[number, number]>): Array<[number, number]> => {
        const h: Array<[number, number]> = [];
        for (const p of pts) {
            while (h.length >= 2 && cross(h[h.length - 2], h[h.length - 1], p) <= 0) h.pop();
            h.push(p);
        }
        h.pop();
        return h;
    };
    const hull = [...half(cloud), ...half([...cloud].reverse())];
    const ring = hull.map(([x, y]): LngLat => [x / mPerDegLng, y / M_PER_DEG_LAT]);
    ring.push(ring[0]);
    return ring;
}

/** Middle of a closed ring (plain average of its corners; fine for placing a label). */
export function ringCentre(ring: ReadonlyArray<LngLat>): LngLat {
    const n = ring.length - 1; // the last point repeats the first
    let lng = 0;
    let lat = 0;
    for (let i = 0; i < n; i++) {
        lng += ring[i][0];
        lat += ring[i][1];
    }
    return [lng / n, lat / n];
}

/**
 * Outline of an era room, drawn around its exhibits. (The Ancient room uses
 * the Acropolis protection zone from the City's open data instead; see
 * ui/map/streetMap.ts.)
 */
export function roomOutline(room: EraRoom, radiusM: number): LngLat[] {
    return bufferedHull(
        exhibitsData.filter((e) => e.eraRoom === room).map((e) => e.coords),
        radiusM,
    );
}

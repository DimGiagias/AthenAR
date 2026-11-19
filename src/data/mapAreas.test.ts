import { describe, expect, it } from 'vitest';
import { exhibitsData } from './exhibits';
import { bufferedHull, ringCentre, roomOutline, type LngLat } from './mapAreas';

const inside = ([lng, lat]: LngLat, ring: ReadonlyArray<LngLat>): boolean => {
    let hit = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const [xi, yi] = ring[i];
        const [xj, yj] = ring[j];
        if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) hit = !hit;
    }
    return hit;
};

describe('bufferedHull', () => {
    it('returns a closed ring about radius metres from a single point', () => {
        const ring = bufferedHull([[37.98, 23.72]], 100);
        expect(ring[0]).toEqual(ring[ring.length - 1]);
        const northmost = Math.max(...ring.map((p) => p[1]));
        expect((northmost - 37.98) * 111195).toBeCloseTo(100, 0);
        const [lng, lat] = ringCentre(ring);
        expect(lng).toBeCloseTo(23.72, 4);
        expect(lat).toBeCloseTo(37.98, 4);
    });

    it('wraps every exhibit of a room and leaves distant ones out', () => {
        const ring = roomOutline('byzantine', 150);
        for (const e of exhibitsData) {
            if (e.eraRoom === 'byzantine') expect(inside([e.coords[1], e.coords[0]], ring)).toBe(true);
        }
        const serafeio = exhibitsData[0];
        expect(inside([serafeio.coords[1], serafeio.coords[0]], ring)).toBe(false);
    });
});

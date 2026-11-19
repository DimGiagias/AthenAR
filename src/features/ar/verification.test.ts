import { describe, expect, it } from 'vitest';
import { offsetPoint } from '../../platform/geoMath';
import { assess, isOnSite } from './verification';

const TARGET: [number, number] = [37.9763, 23.7286]; // Kapnikarea
const RADIUS = 80;
/** A visitor `meters` south of the target; the target is then due north (bearing 0). */
const southOf = (meters: number): [number, number] => offsetPoint(TARGET[0], TARGET[1], 180, meters);
const at = (meters: number, heading: number | null, accuracy = 10) => assess({ user: southOf(meters), accuracy, heading, target: TARGET, radius: RADIUS });

describe('assess', () => {
    it('reports no-fix without a position', () => {
        const a = assess({ user: null, accuracy: null, heading: 0, target: TARGET, radius: RADIUS });
        expect(a.status).toBe('no-fix');
        expect(a.score).toBe(0);
        expect(isOnSite(a)).toBe(false);
    });

    it('locks when in range and facing the building', () => {
        const a = at(50, 0);
        expect(a.status).toBe('locked');
        expect(a.distance).toBeGreaterThan(45);
        expect(a.bearing).toBeCloseTo(0, 0);
        expect(a.score).toBeGreaterThan(85);
        expect(isOnSite(a)).toBe(true);
    });

    it('stays locked up to the tolerance and tells which way to turn beyond it', () => {
        expect(at(50, 20).status).toBe('locked');
        expect(at(50, 340).status).toBe('locked');

        const lookingLeft = at(50, 325); // phone points 35° left of the building
        expect(lookingLeft.status).toBe('misaligned');
        expect(lookingLeft.headingError).toBeCloseTo(35, 0); // turn right

        const lookingRight = at(50, 35);
        expect(lookingRight.status).toBe('misaligned');
        expect(lookingRight.headingError).toBeCloseTo(-35, 0); // turn left
    });

    it('scores lower the further the phone is turned away', () => {
        expect(at(50, 0).score).toBeGreaterThan(at(50, 35).score);
        expect(at(50, 35).score).toBeGreaterThan(at(50, 80).score);
        expect(at(50, 180).score).toBe(0);
    });

    it('is still on site when facing away: the stamp only needs presence', () => {
        expect(isOnSite(at(50, 180))).toBe(true);
    });

    it('reports "here" in range without a compass', () => {
        const a = at(50, null);
        expect(a.status).toBe('here');
        expect(a.headingError).toBeNull();
        expect(isOnSite(a)).toBe(true);
    });

    it('is far outside the geofence, whatever the heading', () => {
        const a = at(400, 0);
        expect(a.status).toBe('far');
        expect(a.score).toBeLessThanOrEqual(50);
        expect(isOnSite(a)).toBe(false);
    });

    it('forgives GPS error at the edge of the geofence, up to a cap', () => {
        expect(at(95, 0, 5).status).toBe('far'); // 95 m > 80 + 5
        expect(at(95, 0, 20).status).toBe('locked'); // 95 m <= 80 + 20
        expect(at(140, 0, 200).status).toBe('far'); // allowance capped at 30 m
    });

    it('treats standing at the building as locked regardless of heading', () => {
        expect(at(8, 180).status).toBe('locked');
        expect(at(8, null).status).toBe('locked');
    });

    it('lowers the score when GPS accuracy is poor', () => {
        expect(at(50, 0, 5).score).toBeGreaterThan(at(50, 0, 60).score);
    });
});

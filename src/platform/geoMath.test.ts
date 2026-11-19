import { describe, expect, it } from 'vitest';
import { bearingDegrees, distanceMeters, formatDistance, normalizeDegrees, offsetPoint, signedAngleDelta } from './geoMath';

const KAPNIKAREA: [number, number] = [37.9763, 23.7286];
const PARTHENON: [number, number] = [37.9715, 23.7267];

describe('distanceMeters', () => {
    it('is zero for the same point', () => {
        expect(distanceMeters(...KAPNIKAREA, ...KAPNIKAREA)).toBe(0);
    });
    it('measures Kapnikarea to the Parthenon at roughly 560 m', () => {
        const d = distanceMeters(...KAPNIKAREA, ...PARTHENON);
        expect(d).toBeGreaterThan(540);
        expect(d).toBeLessThan(580);
    });
    it('matches one degree of latitude (~111.2 km)', () => {
        expect(distanceMeters(37, 23, 38, 23)).toBeCloseTo(111195, -2);
    });
});

describe('bearingDegrees', () => {
    it('points north, east, south and west', () => {
        expect(bearingDegrees(37, 23, 38, 23)).toBeCloseTo(0, 5);
        expect(bearingDegrees(37, 23, 37, 24)).toBeCloseTo(90, 0);
        expect(bearingDegrees(38, 23, 37, 23)).toBeCloseTo(180, 5);
        expect(bearingDegrees(37, 24, 37, 23)).toBeCloseTo(270, 0);
    });
    it('puts the Parthenon south-south-west of Kapnikarea', () => {
        const b = bearingDegrees(...KAPNIKAREA, ...PARTHENON);
        expect(b).toBeGreaterThan(190);
        expect(b).toBeLessThan(205);
    });
});

describe('angles', () => {
    it('normalises into [0, 360)', () => {
        expect(normalizeDegrees(370)).toBe(10);
        expect(normalizeDegrees(-10)).toBe(350);
        expect(normalizeDegrees(360)).toBe(0);
    });
    it('gives the shortest signed turn', () => {
        expect(signedAngleDelta(10, 45)).toBe(35); // turn right
        expect(signedAngleDelta(45, 10)).toBe(-35); // turn left
        expect(signedAngleDelta(350, 10)).toBe(20); // across north
        expect(signedAngleDelta(10, 350)).toBe(-20);
        expect(signedAngleDelta(0, 180)).toBe(180);
    });
});

describe('offsetPoint', () => {
    it('moves the requested distance in the requested direction', () => {
        const p = offsetPoint(...KAPNIKAREA, 180, 60);
        expect(distanceMeters(...KAPNIKAREA, ...p)).toBeGreaterThanOrEqual(59);
        expect(distanceMeters(...KAPNIKAREA, ...p)).toBeLessThanOrEqual(61);
        expect(bearingDegrees(...p, ...KAPNIKAREA)).toBeCloseTo(0, 0); // looking back north
    });
});

describe('formatDistance', () => {
    it('uses metres below a kilometre and km above', () => {
        expect(formatDistance(420)).toBe('📍 420m');
        expect(formatDistance(1340)).toBe('📍 1.3 km');
    });
});

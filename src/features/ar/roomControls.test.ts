import { describe, expect, it } from 'vitest';
import { FACES, SIZE_STOPS, shownDegrees, sizeAt, sizeToPos, stopAt, turnAt } from './roomControls';

describe('size ruler', () => {
    it('runs from the smallest named size to the largest', () => {
        expect(sizeToPos(SIZE_STOPS[0].scale)).toBe(0);
        expect(sizeToPos(SIZE_STOPS[2].scale)).toBe(1);
    });
    it('goes back and forth between position and size', () => {
        expect(sizeAt(sizeToPos(0.2))).toBeCloseTo(0.2, 6);
    });
    it('sticks to a named size when close to it', () => {
        const room = sizeToPos(0.35);
        expect(sizeAt(room + 0.02)).toBe(0.35);
        expect(sizeAt(room + 0.05)).not.toBe(0.35);
    });
    it('stays within the ruler', () => {
        expect(sizeAt(-1)).toBe(0.1);
        expect(sizeAt(2)).toBe(1);
    });
    it('names only the exact stops', () => {
        expect(stopAt(1)?.label).toBe('sizeReal');
        expect(stopAt(0.5)).toBeUndefined();
    });
});

describe('turn ruler', () => {
    it('never wraps, so many turns in a row keep adding up', () => {
        expect(turnAt(725)).toBe(725);
        expect(turnAt(-400)).toBe(-400);
    });
    it('sticks to each side when close', () => {
        expect(turnAt(452)).toBe(450);
        expect(turnAt(-88)).toBe(-90);
        expect(turnAt(80)).toBe(80);
    });
    it('shows any turn as 0..359°', () => {
        expect(shownDegrees(370)).toBe(10);
        expect(shownDegrees(-90)).toBe(270);
        expect(shownDegrees(720)).toBe(0);
    });
    it('names the four sides', () => {
        expect(FACES[shownDegrees(-180)]).toBe('faceBack');
        expect(FACES[45]).toBeUndefined();
    });
});

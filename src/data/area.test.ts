import { describe, expect, it } from 'vitest';
import { METRO_LINE, metroFill } from './area';
import { EXHIBIT_AREAS, METRO_STATIONS } from './areaData';
import { MAP_BBOX } from './mapAreas';

describe('METRO_STATIONS', () => {
    it('has the municipality’s stations, on known lines, inside the map', () => {
        const [west, south, east, north] = MAP_BBOX;
        expect(METRO_STATIONS.length).toBeGreaterThan(20);
        for (const m of METRO_STATIONS) {
            expect(m.lines.length).toBeGreaterThan(0);
            expect(m.lines.every((n) => METRO_LINE[n])).toBe(true);
            expect(m.lng).toBeGreaterThan(west);
            expect(m.lng).toBeLessThan(east);
            expect(m.lat).toBeGreaterThan(south);
            expect(m.lat).toBeLessThan(north);
        }
    });
    it("includes every exhibit's nearby stations", () => {
        const names = new Set(METRO_STATIONS.map((m) => m.name.el));
        for (const area of EXHIBIT_AREAS) for (const m of area.metro) expect(names.has(m.name.el)).toBe(true);
    });
});

describe('metroFill', () => {
    it("is the line's colour, or both split for two lines", () => {
        expect(metroFill([1])).toBe(METRO_LINE[1].colour);
        expect(metroFill([1, 3])).toBe(`linear-gradient(135deg, ${METRO_LINE[1].colour} 50%, ${METRO_LINE[3].colour} 50%)`);
    });
});

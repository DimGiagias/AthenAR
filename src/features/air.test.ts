import { describe, expect, it } from 'vitest';
import type { AirReading, ExhibitArea } from '../data/area';
import { EXHIBIT_AREAS } from '../data/areaData';
import { exhibitsData } from '../data/exhibits';
import { airNow, FRESH_MS, HOURS, readingsFrom, type AirRow } from './air';

const row = (station: number, time: string, aqi: number | null = 2): AirRow => ({
    station_id: station,
    interval_timestamp: time,
    aqi,
    pm2_5: 8.1,
    pm10: 16.4,
    no2: 2.6,
    o3: 63.6,
    temperature: 22,
    humidity: 43,
});
const named = (el: string) => ({ el, en: el });
const area: ExhibitArea = {
    neighbourhood: { name: named('Γκαζοχώρι'), url: 'https://example.org/37' },
    air: { id: 108, name: named('Σεράφειο'), hood: named('Γκαζοχώρι'), metres: 0 },
    airBackup: { id: 111, name: named('Αγίας Αικατερίνης'), hood: named('Αγίας Αικατερίνης'), metres: 374 },
    metro: [],
};
const NOW = Date.parse('2026-11-21T17:00:00Z');
const at = (msAgo: number): AirReading[] => [{ at: NOW - msAgo, aqi: 2, pm25: 8, pm10: 16, no2: 3, o3: 60, temperature: 22, humidity: 43 }];

describe('readingsFrom', () => {
    it('groups rows by station, newest first, reading the times as UTC', () => {
        const out = readingsFrom([row(108, '2026-11-21T15:00:00'), row(111, '2026-11-21T16:00:00'), row(108, '2026-11-21T16:00:00')]);
        expect(out[108].map((r) => r.at)).toEqual([Date.parse('2026-11-21T16:00:00Z'), Date.parse('2026-11-21T15:00:00Z')]);
        expect(out[111]).toHaveLength(1);
        expect(out[108][0]).toMatchObject({ aqi: 2, pm25: 8.1, pm10: 16.4, temperature: 22 });
    });
    it(`keeps at most ${HOURS} hours a station`, () => {
        const rows = Array.from({ length: HOURS + 5 }, (_, i) => row(108, `2026-11-20T${String(i).padStart(2, '0')}:00:00`));
        expect(readingsFrom(rows)[108]).toHaveLength(HOURS);
    });
    it('skips rows without a valid index', () => {
        expect(readingsFrom([row(108, '2026-11-21T16:00:00', null), row(108, '2026-11-21T15:00:00', 9)])[108]).toBeUndefined();
    });
});

describe('airNow', () => {
    it("shows the exhibit's own station while it reports", () => {
        expect(airNow(area, { 108: at(3600000), 111: at(0) }, NOW)).toMatchObject({ station: { id: 108 }, backup: false });
    });
    it('falls back to the station close by when its own has gone quiet', () => {
        expect(airNow(area, { 108: at(FRESH_MS + 1), 111: at(3600000) }, NOW)).toMatchObject({ station: { id: 111 }, backup: true });
        expect(airNow(area, { 111: at(3600000) }, NOW)).toMatchObject({ station: { id: 111 }, backup: true });
    });
    it('shows nothing when neither reports', () => {
        expect(airNow(area, { 108: at(FRESH_MS + 1), 111: at(FRESH_MS + 1) }, NOW)).toBeNull();
        expect(airNow({ ...area, airBackup: null }, { 108: at(FRESH_MS + 1) }, NOW)).toBeNull();
    });
});

describe('EXHIBIT_AREAS', () => {
    it('has every exhibit, with an air station and a metro station', () => {
        expect(EXHIBIT_AREAS).toHaveLength(exhibitsData.length);
        for (const a of EXHIBIT_AREAS) {
            expect(a.neighbourhood.url).toMatch(/^https:\/\//);
            expect(a.metro.length).toBeGreaterThan(0);
            expect(a.metro.every((m, i) => i === 0 || m.metres >= a.metro[i - 1].metres)).toBe(true);
            if (a.airBackup) expect(a.airBackup.metres).toBeLessThanOrEqual(500);
        }
    });
});

// Air quality now around an exhibit, from the City's air stations (Athens Smart
// Neighbourhood, City of Athens open data): the last hours of the exhibit's
// station, fetched from the portal's API when the "Around the exhibit" sheet opens.
import type { AirReading, AirStation, ExhibitArea } from '../data/area';
import { AIR_READINGS } from '../data/areaData';
import { jsonp } from '../platform/jsonp';
import { getState, setState } from '../state/store';

const API = 'https://opendata.cityofathens.gr/api/3/action/datastore_search';
/** A station with no reading for this long has stopped reporting. */
export const FRESH_MS = 3 * 3600000;
/** The readings are hourly, so one fetch is good for a while. */
const REFETCH_MS = 10 * 60000;
/** Hours of readings kept per station, for the chart. */
export const HOURS = 12;

/** A row of the portal's air readings table. */
export interface AirRow {
    station_id: number;
    /** Start of the hour, UTC, e.g. "2026-11-21T16:00:00". */
    interval_timestamp: string;
    aqi: number | null;
    pm2_5: number | null;
    pm10: number | null;
    no2: number | null;
    o3: number | null;
    temperature: number | null;
    humidity: number | null;
}

const isAqi = (v: unknown): v is number => Number.isInteger(v) && (v as number) >= 1 && (v as number) <= 6;

/** The table's rows as readings per station, newest first, at most HOURS each. */
export function readingsFrom(rows: readonly AirRow[]): Record<number, AirReading[]> {
    const out: Record<number, AirReading[]> = {};
    for (const r of rows) {
        const at = Date.parse(`${r.interval_timestamp}Z`);
        if (!isAqi(r.aqi) || Number.isNaN(at)) continue;
        (out[r.station_id] ??= []).push({ at, aqi: r.aqi, pm25: r.pm2_5, pm10: r.pm10, no2: r.no2, o3: r.o3, temperature: r.temperature, humidity: r.humidity });
    }
    for (const id of Object.keys(out)) out[Number(id)] = out[Number(id)].sort((a, b) => b.at - a.at).slice(0, HOURS);
    return out;
}

export interface AirNow {
    station: AirStation;
    /** Newest first. */
    readings: AirReading[];
    /** The exhibit's own station has stopped reporting; this is the one close by. */
    backup: boolean;
}

/** What to show for an exhibit: its station, or the one close by if its own has gone quiet; null if neither reports. */
export function airNow(area: ExhibitArea, readings: Readonly<Record<number, AirReading[]>>, now: number): AirNow | null {
    const reporting = (s: AirStation | null): s is AirStation => s !== null && (readings[s.id]?.[0]?.at ?? 0) > now - FRESH_MS;
    if (reporting(area.air)) return { station: area.air, readings: readings[area.air.id], backup: false };
    if (reporting(area.airBackup)) return { station: area.airBackup, readings: readings[area.airBackup.id], backup: true };
    return null;
}

const fetchedAt = new Map<number, number>();

/** Fetch the latest readings of an exhibit's stations, unless that was done lately. */
export async function loadAir(area: ExhibitArea): Promise<void> {
    const ids = [area.air, area.airBackup].filter((s): s is AirStation => s !== null).map((s) => s.id);
    if (getState().air.loading || ids.every((id) => Date.now() - (fetchedAt.get(id) ?? 0) < REFETCH_MS)) return;
    setState({ air: { ...getState().air, loading: true } });
    const query = new URLSearchParams({
        resource_id: AIR_READINGS,
        filters: JSON.stringify({ station_id: ids }),
        sort: 'interval_timestamp desc',
        limit: String(ids.length * HOURS * 2),
        fields: 'station_id,interval_timestamp,aqi,pm2_5,pm10,no2,o3,temperature,humidity',
    });
    try {
        const res = await jsonp<{ result?: { records?: AirRow[] } }>(`${API}?${query}`);
        for (const id of ids) fetchedAt.set(id, Date.now());
        setState({ air: { loading: false, readings: { ...getState().air.readings, ...readingsFrom(res.result?.records ?? []) } } });
    } catch {
        // offline or the portal is down: the sheet says there are no readings
        setState({ air: { ...getState().air, loading: false } });
    }
}

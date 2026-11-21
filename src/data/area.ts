// What the exhibit page's "Around the exhibit" sheet shows for each exhibit,
// from the City of Athens open data: its neighbourhood, its air station and its
// nearest metro. scripts/fetch-area-data.mjs picks them and writes areaData.ts.
import type { Lang } from './types';

export type Named = Record<Lang, string>;

export interface AirStation {
    /** The station's id in the City's air data. */
    id: number;
    name: Named;
    /** The neighbourhood the station is in. */
    hood: Named;
    /**
     * Metres from the exhibit to the centre of the station's neighbourhood (the
     * data has no station coordinates); 0 for a station in the exhibit's own.
     */
    metres: number;
}

export interface MetroStation {
    name: Named;
    lines: number[];
    lat: number;
    lng: number;
    /** Straight-line metres from the exhibit. */
    metres: number;
}

export interface ExhibitArea {
    neighbourhood: { name: Named; url: string };
    air: AirStation;
    /** A station close by, shown when `air` has stopped reporting; null if none is close. */
    airBackup: AirStation | null;
    /** The nearest metro station, and the next one if it is close too. */
    metro: MetroStation[];
}

/** One hourly reading of an air station (features/air.ts). */
export interface AirReading {
    /** Start of the hour, ms since epoch. */
    at: number;
    /** European Air Quality Index, 1 (good) to 6 (extremely poor). */
    aqi: number;
    /** μg/m³ */
    pm25: number | null;
    pm10: number | null;
    no2: number | null;
    o3: number | null;
    /** °C */
    temperature: number | null;
    /** % */
    humidity: number | null;
}

/** Where each metro line runs. */
export const METRO_LINE: Record<number, Named> = {
    1: { el: 'Πειραιάς – Κηφισιά', en: 'Piraeus – Kifisia' },
    2: { el: 'Ανθούπολη – Ελληνικό', en: 'Anthoupoli – Elliniko' },
    3: { el: 'Δημοτικό Θέατρο – Αεροδρόμιο', en: 'Dimotiko Theatro – Airport' },
};

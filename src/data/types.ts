export type Lang = 'el' | 'en';
export type EraRoom = 'ancient' | 'byzantine' | 'modern';
export type ArEra = '1900' | '1950' | 'today';

/** A numbered story pin on a building. x/y are CSS percentages on the 2D drawing. */
export interface Hotspot {
    x: string;
    y: string;
    type: string;
    title: string;
    text: string;
    /** Set when the pin comes from a user-contributed memory. */
    memoryId?: string;
}

export interface ExhibitText {
    code: string;
    roomBadge: string;
    title: string;
    street: string;
    walk: string;
    archTag: string;
    shortDesc: string;
    audioScript: string;
    hotspots: Hotspot[];
}

export interface Exhibit {
    id: number;
    num: string;
    eraRoom: EraRoom;
    /** Modern exhibit that also belongs to the Ancient room (City Hall / Acharnian Gate). */
    dualAncient?: boolean;
    year: string;
    /**
     * Years the era dial shows instead of 1900 / 1950, where the exhibit's
     * history fits other years better (its 3D model follows the same slots).
     */
    eraLabels?: Partial<Record<ArEra, string>>;
    /** [latitude, longitude] */
    coords: [number, number];
    svgStyle: string;
    el: ExhibitText;
    en: ExhibitText;
}

/** A memory contributed by a user of this device. */
export interface Memory {
    id: string;
    exhibitId: number;
    author: string;
    decade: string;
    text: string;
    createdAt: number;
}

/** Curated testimony bundled with the app (bilingual). */
export interface SeedMemory {
    exhibitId: number;
    author: string;
    decade: string;
    elText: string;
    enText: string;
}

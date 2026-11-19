import type { CorridorId, EraRoom } from './types';

/**
 * How close (metres) the visitor must be for the app to treat them as "at"
 * an exhibit: this gates stamps and the location lock.
 *
 * The default suits a building on a street. Exhibits inside ticketed
 * archaeological sites get a larger radius so they can be collected from the
 * public viewpoints around them.
 */
export const DEFAULT_GEOFENCE_M = 80;

const GEOFENCE_OVERRIDES_M: Record<number, number> = {
    6: 150, // Temple of Hephaestus — inside the Ancient Agora site
    10: 250, // Acropolis & Parthenon — visible from the slopes around the rock
};

export function geofenceRadius(exhibitId: number): number {
    return GEOFENCE_OVERRIDES_M[exhibitId] ?? DEFAULT_GEOFENCE_M;
}

/** Magnetic declination in Athens (degrees east); added to compass readings. */
export const MAGNETIC_DECLINATION_DEG = 5;

/** Short name plate for each exhibit's pin on the map. */
export interface MapPin {
    id: number;
    num: string;
    corridor: CorridorId;
    eraRoom: EraRoom;
    dualAncient?: boolean;
    labelEl: string;
    labelEn: string;
}

export const MAP_PINS: MapPin[] = [
    { id: 0, num: '#01', corridor: 'peiraios', eraRoom: 'modern', labelEl: 'Σεράφειο', labelEn: 'Serafeio' },
    { id: 1, num: '#02', corridor: 'peiraios', eraRoom: 'modern', labelEl: 'Γκάζι', labelEn: 'Gazi' },
    { id: 2, num: '#03', corridor: 'patision', eraRoom: 'modern', labelEl: 'Αγ. Κυψέλης', labelEn: 'Kypseli Mkt' },
    { id: 3, num: '#04', corridor: 'patision', eraRoom: 'modern', labelEl: 'Μπλε Πολυκ.', labelEn: 'Blue Bldg' },
    { id: 4, num: '#05', corridor: 'athinas', eraRoom: 'modern', labelEl: 'Βαρβάκειος', labelEn: 'Varvakeios' },
    { id: 5, num: '#06', corridor: 'athinas', eraRoom: 'modern', dualAncient: true, labelEl: 'Δημαρχείο/Πύλη', labelEn: 'City Hall/Gate' },
    { id: 6, num: '#07', corridor: 'peiraios', eraRoom: 'ancient', labelEl: 'Ναός Ηφαίστου', labelEn: 'Hephaestus' },
    { id: 7, num: '#08', corridor: 'athinas', eraRoom: 'ancient', labelEl: 'Αέρηδες', labelEn: 'Tower Winds' },
    { id: 8, num: '#09', corridor: 'athinas', eraRoom: 'byzantine', labelEl: 'Καπνικαρέα', labelEn: 'Kapnikarea' },
    { id: 9, num: '#10', corridor: 'peiraios', eraRoom: 'byzantine', labelEl: 'Άγ. Ασώματοι', labelEn: 'Asomatoi' },
    { id: 10, num: '#11', corridor: 'athinas', eraRoom: 'ancient', labelEl: 'Παρθενώνας', labelEn: 'Parthenon' },
];

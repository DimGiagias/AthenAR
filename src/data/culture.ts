// The City's culture venues (City of Athens open data, «Χώροι πολιτισμού
// Δήμου Αθηναίων»), downloaded into cultureVenues.ts by scripts/fetch-map-data.mjs.
// The dataset is in Greek; this adds the type labels and English names.
import type { Lang } from './types';

export interface CultureVenue {
    /** The dataset's own id (fid). */
    id: number;
    /** The dataset's venue type, e.g. "ΜΟΥΣΕΙΟ". */
    type: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
    /** The venue's official page. */
    link: string;
}

export const VENUE_TYPE_LABEL: Record<string, Record<Lang, string>> = {
    ΜΟΥΣΕΙΟ: { el: 'Μουσείο', en: 'Museum' },
    ΠΙΝΑΚΟΘΗΚΗ: { el: 'Πινακοθήκη', en: 'Gallery' },
    ΘΕΑΤΡΟ: { el: 'Θέατρο', en: 'Theatre' },
    ΚΙΝΗΜΑΤΟΓΡΑΦΟΣ: { el: 'Κινηματογράφος', en: 'Cinema' },
    ΒΙΒΛΙΟΘΗΚΗ: { el: 'Βιβλιοθήκη', en: 'Library' },
    'ΠΟΛΙΤΙΣΤΙΚΟ ΚΕΝΤΡΟ': { el: 'Πολιτιστικό κέντρο', en: 'Cultural centre' },
    ΤΕΧΝΟΠΟΛΙΣ: { el: 'Τεχνόπολις', en: 'Technopolis' },
};

/** English names of the venues that are rewards, by dataset id. */
const NAME_EN: Record<number, string> = {
    39: 'Museum of Folk Art and Tradition',
    55: 'Kolonos Open-Air Theatre',
    60: 'Olympia Municipal Music Theatre “Maria Callas”',
    87: 'Anna and Maria Kalouta Arts Space',
    122: 'Charidimos Shadow Theatre Museum',
    130: 'Industrial Gas Museum',
    134: 'Plato’s Academy Digital Museum',
    144: 'New Municipal Gallery',
    147: 'Old Municipal Gallery',
    150: 'Hellenic Children’s Museum',
    168: 'Dodecanese House Museum',
    170: 'STELLA Municipal Cinema',
    177: 'Gravas Open-Air Theatre',
    229: 'Maria Callas Museum',
    230: 'Lycabettus Municipal Theatre',
};

export const venueName = (v: CultureVenue, lang: Lang): string => (lang === 'en' ? (NAME_EN[v.id] ?? v.name) : v.name);
export const venueType = (v: CultureVenue, lang: Lang): string => VENUE_TYPE_LABEL[v.type]?.[lang] ?? v.type;

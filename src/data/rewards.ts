// Passport rewards at 3, 6 and all 11 stamps, each a kind of municipal venue
// from the City's open data (data/culture.ts): you choose the venue, and the
// same reward goes to someone in need through the City's solidarity centre
// (ΚΥΑΔΑ). A venue the City adds to the dataset becomes a choice on its own.
import type { Lang } from './types';

export interface RewardText {
    /** The kind of venue, e.g. "A municipal museum or gallery". */
    title: string;
    /** What you get, e.g. "1 free entry". */
    mine: string;
    /** The same for someone in need. */
    gift: string;
    /** Heading of the venue chooser. */
    pick: string;
}

export interface Reward extends Record<Lang, RewardText> {
    /** Stamps needed to earn it. */
    stamps: number;
    /** Venue types (the dataset's) it can be used at. */
    types: readonly string[];
}

export const REWARDS: readonly Reward[] = [
    {
        stamps: 3,
        types: ['ΜΟΥΣΕΙΟ', 'ΠΙΝΑΚΟΘΗΚΗ'],
        el: {
            title: 'Μουσείο ή πινακοθήκη του Δήμου',
            mine: '1 δωρεάν είσοδος',
            gift: '+1 δωρεάν είσοδος για κάποιον που τη χρειάζεται',
            pick: 'Διάλεξε μουσείο ή πινακοθήκη',
        },
        en: {
            title: 'A municipal museum or gallery',
            mine: '1 free entry',
            gift: '+1 free entry for someone in need',
            pick: 'Choose a museum or gallery',
        },
    },
    {
        stamps: 6,
        types: ['ΘΕΑΤΡΟ'],
        el: {
            title: 'Παράσταση σε δημοτικό θέατρο',
            mine: '1 δωρεάν εισιτήριο',
            gift: '+1 δωρεάν εισιτήριο για κάποιον που το χρειάζεται',
            pick: 'Διάλεξε θέατρο',
        },
        en: {
            title: 'A show at a municipal theatre',
            mine: '1 free ticket',
            gift: '+1 free ticket for someone in need',
            pick: 'Choose a theatre',
        },
    },
    {
        stamps: 11,
        types: ['ΚΙΝΗΜΑΤΟΓΡΑΦΟΣ'],
        el: {
            title: 'Δημοτικός κινηματογράφος',
            mine: '2 δωρεάν εισιτήρια',
            gift: '+2 δωρεάν εισιτήρια για όσους τα χρειάζονται',
            pick: 'Διάλεξε κινηματογράφο',
        },
        en: {
            title: 'The municipal cinema',
            mine: '2 free tickets',
            gift: '+2 free tickets for people in need',
            pick: 'Choose a cinema',
        },
    },
];

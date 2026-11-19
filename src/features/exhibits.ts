// Read-only helpers over the exhibit data and the current state.
import { exhibitsData } from '../data/exhibits';
import { geofenceRadius } from '../data/geo';
import type { Exhibit, Hotspot, Lang, Memory } from '../data/types';
import { distanceMeters } from '../platform/geoMath';
import { getState, type AppState } from '../state/store';
import { assess, type Assessment } from './ar/verification';

export function getExhibit(id: number): Exhibit {
    return exhibitsData[id] ?? exhibitsData[0];
}

export function currentExhibit(s: Readonly<AppState> = getState()): Exhibit {
    return getExhibit(s.exhibitId);
}

/** Where pins from user memories go on the 2D drawing; cycles when full. */
const MEMORY_PIN_SLOTS: Array<[string, string]> = [
    ['58%', '48%'],
    ['40%', '28%'],
    ['76%', '62%'],
    ['22%', '64%'],
    ['62%', '24%'],
    ['36%', '56%'],
];

/**
 * The curated hotspots of an exhibit followed by one pin per memory the user
 * has contributed to it. `labels` supplies the translated type/title text.
 */
export function hotspotsFor(
    exhibit: Exhibit,
    lang: Lang,
    memories: readonly Memory[],
    labels: { type: (decade: string) => string; title: (author: string) => string },
): Hotspot[] {
    const own = memories
        .filter((m) => m.exhibitId === exhibit.id)
        .sort((a, b) => a.createdAt - b.createdAt)
        .map((m, i): Hotspot => {
            const [x, y] = MEMORY_PIN_SLOTS[i % MEMORY_PIN_SLOTS.length];
            return { x, y, type: labels.type(m.decade), title: labels.title(m.author), text: m.text, memoryId: m.id };
        });
    return [...exhibit[lang].hotspots, ...own];
}

export function matchesFilters(ex: Exhibit, s: Readonly<AppState>): boolean {
    const corridorOk = s.corridorFilter === 'all' || ex.corridorId === s.corridorFilter;
    const eraOk = s.eraFilter === 'all' || ex.eraRoom === s.eraFilter || (s.eraFilter === 'ancient' && ex.dualAncient === true);
    return corridorOk && eraOk;
}

export function nearestExhibit(coords: [number, number]): { exhibit: Exhibit; meters: number } {
    let best = exhibitsData[0];
    let min = Infinity;
    for (const ex of exhibitsData) {
        const d = distanceMeters(coords[0], coords[1], ex.coords[0], ex.coords[1]);
        if (d < min) {
            min = d;
            best = ex;
        }
    }
    return { exhibit: best, meters: min };
}

/** Location & direction lock of the selected exhibit, from the current sensors. */
export function currentAssessment(s: Readonly<AppState> = getState()): Assessment {
    const ex = currentExhibit(s);
    return assess({
        user: s.coords,
        accuracy: s.accuracy,
        heading: s.heading,
        target: ex.coords,
        radius: geofenceRadius(ex.id),
    });
}

export function stampCount(s: Readonly<AppState> = getState()): number {
    return exhibitsData.filter((ex) => s.stamps[ex.id] !== undefined).length;
}

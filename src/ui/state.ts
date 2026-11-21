// Navigation state (which screen, which sheet). Everything else — language,
// exhibit, sensors, stamps, memories — stays in the app's store (src/state).
import { getState, watch, type AppState } from '../state/store';

export type Screen = 'explore' | 'exhibit' | 'ar' | 'passport';
/** Room AR's two small tools, each opening a ruler above the big button. */
export type RoomTool = 'size' | 'turn';
/** A place marked on the explore map: a reward's culture venue, or one of an exhibit's metro stations. */
export type MapPlace = { kind: 'venue'; id: number } | { kind: 'metro'; exhibit: number; index: number };
/** The explore map's optional layers (City open data): metro stations and culture venues. */
export type MapLayer = 'metro' | 'venue';

export interface UiState {
    welcome: boolean;
    screen: Screen;
    /** Where the exhibit page's back button goes. */
    exhibitBack: Screen;
    /** Where closing the AR view goes. */
    arBack: Screen;
    exhibitTab: 'stories' | 'memories';
    /** Exhibit page: the story being read in the sheet (index into the exhibit's AR stories), or null. */
    storySheet: number | null;
    /** Exhibit page: the "Around the exhibit" sheet, on its list or one of its details, or null. */
    areaSheet: 'list' | 'air' | 'metro' | null;
    /** Live AR: the story card of the selected pin is open. */
    story: boolean;
    /** Room AR: which tool's ruler is open, if any. */
    roomTool: RoomTool | null;
    memorySheet: boolean;
    memoryExhibitId: number;
    /** Passport: the screen listing every reward is open. */
    rewardList: boolean;
    /** Rewards: the reward (index into REWARDS) whose venue is being chosen, or null. */
    rewardChoose: number | null;
    /** The venue chooser: the venue picked (data/culture.ts id), and the venue type shown ('all' or a type). */
    rewardPick: number | null;
    rewardFilter: string;
    /** The ticket of a reward for one venue, or null. */
    rewardTicket: { reward: number; venue: number } | null;
    /** Explore map: a place marked on it, or null. */
    mapPlace: MapPlace | null;
    /** Explore map: the layers shown, and whether their panel is open. */
    mapLayers: Record<MapLayer, boolean>;
    mapLayersPanel: boolean;
    /** Explore map: the layer pin whose card is open (an index into METRO_STATIONS, or a culture venue id), or null. */
    mapCard: { layer: MapLayer; id: number } | null;
}

let ui: UiState = {
    welcome: true,
    screen: 'explore',
    exhibitBack: 'explore',
    arBack: 'explore',
    exhibitTab: 'stories',
    storySheet: null,
    areaSheet: null,
    story: false,
    roomTool: null,
    memorySheet: false,
    memoryExhibitId: 0,
    rewardList: false,
    rewardChoose: null,
    rewardPick: null,
    rewardFilter: 'all',
    rewardTicket: null,
    mapPlace: null,
    mapLayers: { metro: false, venue: false },
    mapLayersPanel: false,
    mapCard: null,
};

type Select = (s: Readonly<AppState>, u: Readonly<UiState>) => readonly unknown[];
type Run = (s: Readonly<AppState>, u: Readonly<UiState>) => void;

const uiWatchers: Array<{ select: Select; run: Run; last: readonly unknown[] }> = [];
let queued = false;

export const getUi = (): Readonly<UiState> => ui;

export function setUi(patch: Partial<UiState>): void {
    let changed = false;
    for (const key of Object.keys(patch) as Array<keyof UiState>) {
        if (!Object.is(ui[key], patch[key])) changed = true;
    }
    if (!changed) return;
    ui = { ...ui, ...patch };
    if (!queued) {
        queued = true;
        queueMicrotask(flushUi);
    }
}

const same = (a: readonly unknown[], b: readonly unknown[]): boolean => a.length === b.length && a.every((v, i) => Object.is(v, b[i]));

function flushUi(): void {
    queued = false;
    for (const w of uiWatchers) {
        const next = w.select(getState(), ui);
        if (!same(w.last, next)) {
            w.last = next;
            w.run(getState(), ui);
        }
    }
}

/**
 * Like the store's watch(), over both the app state and the navigation state:
 * `run` runs now and whenever a value returned by `select` changes.
 */
export function view(select: Select, run: Run): void {
    watch(
        (s) => select(s, ui),
        (s) => run(s, ui),
    );
    uiWatchers.push({ select, run, last: select(getState(), ui) });
}

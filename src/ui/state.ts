// Navigation state (which screen, which sheet). Everything else — language,
// exhibit, sensors, stamps, memories — stays in the app's store (src/state).
import { getState, watch, type AppState } from '../state/store';

export type Screen = 'explore' | 'exhibit' | 'ar' | 'passport';

export interface UiState {
    welcome: boolean;
    screen: Screen;
    /** Where the exhibit page's back button goes. */
    exhibitBack: Screen;
    /** Where closing the AR view goes. */
    arBack: Screen;
    exhibitTab: 'stories' | 'memories';
    /** Live AR: the story card of the selected pin is open. */
    story: boolean;
    memorySheet: boolean;
    memoryExhibitId: number;
}

let ui: UiState = {
    welcome: true,
    screen: 'explore',
    exhibitBack: 'explore',
    arBack: 'explore',
    exhibitTab: 'stories',
    story: false,
    memorySheet: false,
    memoryExhibitId: 0,
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

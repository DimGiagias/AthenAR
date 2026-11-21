// The single source of truth for the app.
//
// Rules (they also keep a later move to React cheap):
//  - all state lives here; nothing is remembered only in the DOM;
//  - feature code changes state with setState() and never touches the DOM;
//  - UI code reads state inside watch() callbacks and only writes the DOM.
import type { AirReading } from '../data/area';
import type { ArEra, EraRoom, Lang, Memory } from '../data/types';
import { START_SCALE } from '../features/ar/roomControls';
import { loadJson, saveJson } from '../platform/storage';

export type Tab = 'explore' | 'ar' | 'memories';
export type GpsStatus = 'off' | 'acquiring' | 'active' | 'denied' | 'unavailable' | 'unsupported';
export type CameraStatus = 'off' | 'live' | 'simulated';
/**
 * Image-anchored AR: off, loading the tracker, looking for the image, image in
 * view, or image out of view with the model held in place by the gyroscope.
 */
export type ImageArStatus = 'off' | 'loading' | 'scanning' | 'tracking' | 'holding';
/**
 * Room AR (WebXR): not available on this device, off, starting, looking for
 * the floor, floor found (tap to place), or model placed.
 */
export type RoomArStatus = 'unsupported' | 'off' | 'starting' | 'searching' | 'aiming' | 'placed';

export interface AppState {
    // language & audio guide
    lang: Lang;
    audioLang: Lang;
    audioSpeed: number;
    audioPlaying: boolean;
    /** 0..1 */
    audioProgress: number;

    // navigation & filters
    tab: Tab;
    eraFilter: EraRoom | 'all';
    exhibitId: number;
    hotspotIndex: number;

    // AR viewport
    arEra: ArEra;
    camera: CameraStatus;
    imageAr: ImageArStatus;
    /** Index into IMAGE_TARGETS (data/arTargets.ts) of the image last found, or null. */
    imageArTarget: number | null;
    roomAr: RoomArStatus;
    /** Room AR model size, metres per model unit (features/ar/roomControls.ts). */
    roomScale: number;
    /** Room AR turntable: the model turns slowly on its own. */
    roomSpin: boolean;

    // sensors
    gps: GpsStatus;
    /** [lat, lng] of the visitor, real or simulated. */
    coords: [number, number] | null;
    accuracy: number | null;
    /** True-north heading of the camera direction, throttled for the UI. */
    heading: number | null;
    /** Simulated position at the selected exhibit, for presenting off site. */
    demoMode: boolean;
    /** Degrees the simulated phone is turned away from the building. */
    demoHeadingOffset: number;

    // location & direction lock
    scanning: boolean;
    offTargetOverlay: boolean;

    // passport & memories
    /** exhibit id -> time the stamp was collected (ms since epoch) */
    stamps: Record<number, number>;
    /** reward stamp count (data/rewards.ts) -> when it was claimed, and for which venue (data/culture.ts id) */
    rewardsClaimed: Record<number, { at: number; venue: number }>;
    memories: Memory[];

    // City open data
    /** Air readings by station id, newest first (features/air.ts), and whether a fetch is under way. */
    air: { loading: boolean; readings: Record<number, AirReading[]> };

    // chrome
    toast: { text: string; seq: number } | null;
    /** How this browser can install the app: Chrome's prompt, Safari's steps (iPhone), or not at all. */
    installable: 'prompt' | 'ios' | null;
    /** The "get the app" sheet is open. */
    installSheet: boolean;
}

const PERSIST_KEY = 'athenar.state.v1';
type Persisted = Pick<AppState, 'lang' | 'audioLang' | 'audioSpeed' | 'exhibitId' | 'stamps' | 'rewardsClaimed'>;

const saved = loadJson<Partial<Persisted>>(PERSIST_KEY, {});
const isLang = (v: unknown): v is Lang => v === 'el' || v === 'en';

let state: AppState = {
    lang: isLang(saved.lang) ? saved.lang : 'el',
    audioLang: isLang(saved.audioLang) ? saved.audioLang : 'el',
    audioSpeed: saved.audioSpeed === 1.25 ? 1.25 : 1.0,
    audioPlaying: false,
    audioProgress: 0,

    tab: 'explore',
    eraFilter: 'all',
    exhibitId: typeof saved.exhibitId === 'number' && saved.exhibitId >= 0 && saved.exhibitId <= 10 ? saved.exhibitId : 0,
    hotspotIndex: 0,

    arEra: 'today',
    camera: 'off',
    imageAr: 'off',
    imageArTarget: null,
    roomAr: 'unsupported',
    roomScale: START_SCALE,
    roomSpin: false,

    gps: 'off',
    coords: null,
    accuracy: null,
    heading: null,
    demoMode: false,
    demoHeadingOffset: 0,

    scanning: false,
    offTargetOverlay: false,

    stamps: saved.stamps && typeof saved.stamps === 'object' ? saved.stamps : {},
    rewardsClaimed: saved.rewardsClaimed && typeof saved.rewardsClaimed === 'object' ? saved.rewardsClaimed : {},
    memories: [],

    air: { loading: false, readings: {} },

    toast: null,
    installable: null,
    installSheet: false,
};

interface Watcher {
    select: (s: AppState) => readonly unknown[];
    run: (s: AppState) => void;
    last: readonly unknown[];
}

const watchers: Watcher[] = [];
let flushQueued = false;
let lastPersisted = '';

export function getState(): Readonly<AppState> {
    return state;
}

/** Merge a patch into the state. Watchers run once, after the current task. */
export function setState(patch: Partial<AppState>): void {
    let changed = false;
    for (const key of Object.keys(patch) as Array<keyof AppState>) {
        if (!Object.is(state[key], patch[key])) changed = true;
    }
    if (!changed) return;
    state = { ...state, ...patch };
    if (!flushQueued) {
        flushQueued = true;
        queueMicrotask(flush);
    }
}

function sameDeps(a: readonly unknown[], b: readonly unknown[]): boolean {
    return a.length === b.length && a.every((v, i) => Object.is(v, b[i]));
}

function flush(): void {
    flushQueued = false;
    // A watcher may itself call setState; that queues another flush.
    for (const w of watchers) {
        const next = w.select(state);
        if (!sameDeps(w.last, next)) {
            w.last = next;
            w.run(state);
        }
    }
    persist();
}

function persist(): void {
    const slice: Persisted = {
        lang: state.lang,
        audioLang: state.audioLang,
        audioSpeed: state.audioSpeed,
        exhibitId: state.exhibitId,
        stamps: state.stamps,
        rewardsClaimed: state.rewardsClaimed,
    };
    const json = JSON.stringify(slice);
    if (json !== lastPersisted) {
        lastPersisted = json;
        saveJson(PERSIST_KEY, slice);
    }
}

/**
 * Run `run` now and again whenever any value returned by `select` changes.
 * The dependency array works like the one of a React effect.
 */
export function watch(select: (s: AppState) => readonly unknown[], run: (s: AppState) => void): void {
    watchers.push({ select, run, last: select(state) });
    run(state);
}

// Every user action, by name. The markup calls them through inline handlers
// (onclick="app.openExhibit(3)"); main.ts puts this object on window.app.
import { exhibitsData } from '../data/exhibits';
import type { ArEra, CorridorId, EraRoom, Lang } from '../data/types';
import { scanLock, simulateWrongBuilding, stopTimelapse, toggleCamera, toggleTimelapse } from '../features/ar/controls';
import { zoomBy } from '../features/ar/three/engine';
import { setAudioLang, toggleAudio, toggleAudioSpeed } from '../features/audio';
import { getExhibit, hotspotsFor, nearestExhibit } from '../features/exhibits';
import { toggleDemoMode } from '../features/location';
import { deleteMemory, MAX_AUTHOR_CHARS, MAX_STORY_CHARS, memoryPinLabels, submitMemory } from '../features/memories';
import { collectStamp } from '../features/stamps';
import { showToast } from '../features/toast';
import { getState, setState } from '../state/store';
import { t } from './i18n';
import { focusStreetMapOn, zoomStreetMap } from './map/streetMap';
import { getUi, setUi } from './state';

const field = (id: string): HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null =>
    document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;

function selectExhibit(id: number): void {
    if (!Number.isInteger(id) || id < 0 || id >= exhibitsData.length) return;
    if (id !== getState().exhibitId) setState({ exhibitId: id, hotspotIndex: 0 });
}

function stopArExtras(): void {
    if (getState().camera !== 'off') void toggleCamera(); // also stops the timelapse
    else if (getState().timelapse) stopTimelapse();
    setState({ offTargetOverlay: false });
}

export const app = {
    // --- welcome & language ---
    enter(): void {
        setUi({ welcome: false });
    },
    showWelcome(): void {
        setUi({ welcome: true });
    },
    setLang(lang: Lang): void {
        setAudioLang(lang); // narration follows the interface language
        setState({ lang });
    },

    // --- navigation ---
    go(screen: 'explore' | 'passport'): void {
        setUi({ screen });
    },
    openExhibit(id: number): void {
        selectExhibit(id);
        const u = getUi();
        const back = u.screen === 'exhibit' || u.screen === 'ar' ? u.exhibitBack : u.screen;
        setUi({ screen: 'exhibit', exhibitBack: back, exhibitTab: 'stories' });
        document.getElementById('xScroll')?.scrollTo(0, 0);
    },
    back(): void {
        setUi({ screen: getUi().exhibitBack });
    },
    openAr(hotspotIndex?: number): void {
        if (typeof hotspotIndex === 'number') setState({ hotspotIndex });
        const u = getUi();
        setUi({ screen: 'ar', arBack: u.screen === 'ar' ? u.arBack : u.screen });
    },
    /** Bottom bar "Live AR": the nearest exhibit when GPS knows where you are. */
    liveAr(): void {
        const s = getState();
        if (s.gps === 'active' && s.coords && !s.demoMode) selectExhibit(nearestExhibit(s.coords).exhibit.id);
        app.openAr();
    },
    closeAr(): void {
        stopArExtras();
        setUi({ screen: getUi().arBack });
    },
    showOnMap(): void {
        stopArExtras();
        setUi({ screen: 'explore' });
    },

    // --- explore ---
    eraFilter(era: EraRoom | 'all'): void {
        setState({ eraFilter: era });
    },
    corridor(value: string): void {
        setState({ corridorFilter: value as CorridorId | 'all' });
    },
    zoomMap(steps: number): void {
        zoomStreetMap(steps);
    },
    /** A tap on an exhibit card in the list: select it and show it on the map. */
    focusExhibit(id: number): void {
        selectExhibit(id);
        const ex = exhibitsData[id];
        if (ex) focusStreetMapOn(ex.coords[0], ex.coords[1]);
        // Without GPS the selected exhibit becomes the top card; bring it into view.
        document.getElementById('exList')?.scrollTo({ top: 0, behavior: 'smooth' });
    },

    // --- exhibit page & audio ---
    exhibitTab(tab: 'stories' | 'memories'): void {
        setUi({ exhibitTab: tab });
    },
    audio: toggleAudio,
    audioLang: setAudioLang,
    speed: toggleAudioSpeed,

    // --- AR ---
    dim(dimension: '2d' | '3d'): void {
        setState({ dimension });
    },
    era(era: ArEra): void {
        setState({ arEra: era });
    },
    camera(): void {
        void toggleCamera();
    },
    timelapse: toggleTimelapse,
    xray(): void {
        setState({ xray: !getState().xray });
    },
    zoom3d(delta: number): void {
        zoomBy(delta);
    },
    scan(): void {
        void scanLock();
    },
    dismissOverlay(): void {
        setState({ offTargetOverlay: false });
    },
    view3d(): void {
        setState({ offTargetOverlay: false, dimension: '3d' });
    },
    collect(): void {
        void collectStamp();
    },
    pin(index: number): void {
        setState({ hotspotIndex: index });
    },
    step(delta: number, total: number): void {
        if (total < 1) return;
        setState({ hotspotIndex: (getState().hotspotIndex + delta + total) % total });
    },

    // --- memories ---
    openMemory(): void {
        setUi({ memorySheet: true, memoryExhibitId: getState().exhibitId });
    },
    closeMemory(): void {
        setUi({ memorySheet: false });
    },
    memoryExhibit(value: string): void {
        setUi({ memoryExhibitId: parseInt(value, 10) || 0 });
    },
    async saveMemory(): Promise<void> {
        const story = field('msStory');
        const text = (story?.value ?? '').trim();
        if (!text) {
            showToast(t('msEmpty'));
            story?.focus();
            return;
        }
        await submitMemory({
            exhibitId: getUi().memoryExhibitId,
            author: (field('msName')?.value ?? '').slice(0, MAX_AUTHOR_CHARS),
            decade: field('msDecade')?.value ?? '1970s',
            text: text.slice(0, MAX_STORY_CHARS),
        });
        // submitMemory selected the building and its new pin: show it in AR.
        const u = getUi();
        setUi({ memorySheet: false, screen: 'ar', arBack: u.screen === 'ar' ? u.arBack : u.screen });
    },
    deleteMemory(id: string): void {
        void deleteMemory(id);
    },
    /** Open AR on the building of one of your memories, with its pin selected. */
    memoryAr(id: string): void {
        const s = getState();
        const memory = s.memories.find((m) => m.id === id);
        if (!memory) return;
        selectExhibit(memory.exhibitId);
        const pins = hotspotsFor(getExhibit(memory.exhibitId), s.lang, s.memories, memoryPinLabels);
        app.openAr(Math.max(0, pins.findIndex((p) => p.memoryId === id)));
    },

    // --- presenter tools ---
    demo: toggleDemoMode,
    wrongBuilding(): void {
        simulateWrongBuilding();
        app.openAr();
    },
};

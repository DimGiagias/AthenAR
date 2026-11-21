// Every user action, by name. The markup calls them through inline handlers
// (onclick="app.openExhibit(3)"); main.ts puts this object on window.app.
import { EXHIBIT_AREAS } from '../data/areaData';
import { exhibitsData } from '../data/exhibits';
import type { ArEra, EraRoom, Lang } from '../data/types';
import { scanLock, setArCamera, simulateWrongBuilding, wakeCompass } from '../features/ar/controls';
import { foundTarget, stopImageAr } from '../features/ar/imageAr';
import { exitRoom, placeHere, placeInRoom, resetRoomSize, resetRoomTurn, toggleRoomSpin } from '../features/ar/room';
import { isOnSite } from '../features/ar/verification';
import { loadAir } from '../features/air';
import { setAudioLang, toggleAudio, toggleAudioSpeed } from '../features/audio';
import { closeInstallSheet, install, showInstallSheet } from '../features/install';
import { currentAssessment, getExhibit, hotspotsFor, nearestExhibit } from '../features/exhibits';
import { toggleDemoMode, toggleGps } from '../features/location';
import { deleteMemory, MAX_AUTHOR_CHARS, MAX_STORY_CHARS, memoryPinLabels, submitMemory } from '../features/memories';
import { knownPosition, venueById, venuesFor } from '../features/rewards';
import { REWARDS } from '../data/rewards';
import { collectStamp } from '../features/stamps';
import { showToast } from '../features/toast';
import { getState, setState } from '../state/store';
import { t } from './i18n';
import { focusStreetMapOn, resetStreetMapNorth, zoomStreetMap } from './map/streetMap';
import { getUi, setUi, type RoomTool } from './state';

const field = (id: string): HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null =>
    document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;

function selectExhibit(id: number): void {
    if (!Number.isInteger(id) || id < 0 || id >= exhibitsData.length) return;
    if (id !== getState().exhibitId) setState({ exhibitId: id, hotspotIndex: 0 });
}

function stopArExtras(): void {
    stopImageAr();
    void setArCamera(false);
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
    // --- getting the app ---
    install(): void {
        void install();
    },
    /** iPhone: the sheet with Safari's steps. */
    installHow: showInstallSheet,
    closeInstall: closeInstallSheet,

    toggleLang(): void {
        app.setLang(getState().lang === 'el' ? 'en' : 'el');
    },

    // --- navigation ---
    go(screen: 'explore' | 'passport'): void {
        setUi({ screen });
    },
    openExhibit(id: number): void {
        selectExhibit(id);
        const u = getUi();
        const back = u.screen === 'exhibit' || u.screen === 'ar' ? u.exhibitBack : u.screen;
        setUi({ screen: 'exhibit', exhibitBack: back, exhibitTab: 'stories', storySheet: null, areaSheet: null, mapPlace: null });
        document.getElementById('xScroll')?.scrollTo(0, 0);
    },
    back(): void {
        setUi({ screen: getUi().exhibitBack, storySheet: null, areaSheet: null });
    },
    readStory(index: number): void {
        setUi({ storySheet: index });
    },
    storyStep(delta: number): void {
        const open = getUi().storySheet;
        const total = getExhibit(getState().exhibitId)[getState().lang].hotspots.length;
        if (open === null || total < 1) return;
        setUi({ storySheet: (open + delta + total) % total });
    },
    closeStorySheet(): void {
        setUi({ storySheet: null });
    },
    /** The sheet's "See it in AR": Live AR on that story's pin, with its card already open. */
    storyAr(index: number): void {
        setUi({ storySheet: null });
        app.openAr(index);
        setUi({ story: true });
    },
    /**
     * Live AR opens as the scanner: the model appears once a picture or the
     * building is found. A pin index selects that pin; its story card stays
     * closed so the big button shows, and a tap on the pin opens it.
     */
    openAr(hotspotIndex?: number): void {
        if (typeof hotspotIndex === 'number') setState({ hotspotIndex });
        wakeCompass(); // inside the tap: lets iOS ask for motion access
        const u = getUi();
        setUi({ screen: 'ar', arBack: u.screen === 'ar' ? u.arBack : u.screen, story: false });
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
    toggleGps,
    zoomMap(steps: number): void {
        zoomStreetMap(steps);
    },
    mapNorthUp(): void {
        resetStreetMapNorth();
    },
    /** A tap on an exhibit card in the list: select it and show it on the map. */
    focusExhibit(id: number): void {
        selectExhibit(id);
        setUi({ mapPlace: null });
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
    /** The big round button: the next step for what was scanned. */
    shutter(): void {
        const s = getState();
        if (foundTarget(s)?.kind === 'poster' && s.roomAr === 'off') placeInRoom();
        else if (s.stamps[s.exhibitId] === undefined && isOnSite(currentAssessment(s))) void collectStamp();
        else void scanLock();
    },
    era(era: ArEra): void {
        setState({ arEra: era });
    },
    scan(): void {
        void scanLock();
    },
    dismissOverlay(): void {
        setState({ offTargetOverlay: false });
    },
    pin(index: number): void {
        setState({ hotspotIndex: index });
        setUi({ story: true });
    },
    closeStory(): void {
        setUi({ story: false });
    },
    step(delta: number, total: number): void {
        if (total < 1) return;
        setState({ hotspotIndex: (getState().hotspotIndex + delta + total) % total });
    },
    exitRoom,
    placeHere,
    /** Open a room AR tool's ruler, or close it when it is already open. */
    roomTool(tool: RoomTool): void {
        setUi({ roomTool: getUi().roomTool === tool ? null : tool });
    },
    roomSizeReset: resetRoomSize,
    roomTurnReset: resetRoomTurn,
    roomSpin: toggleRoomSpin,

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
        // submitMemory selected the building: show its memories, the new one among them.
        setUi({ memorySheet: false });
        app.openExhibit(getState().exhibitId);
        setUi({ exhibitTab: 'memories' });
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

    // --- rewards ---
    openRewards(): void {
        setUi({ rewardList: true });
    },
    closeRewards(): void {
        setUi({ rewardList: false });
    },
    /** "Choose a venue" for an earned reward, with the nearest venue picked. */
    chooseVenue(index: number): void {
        const reward = REWARDS[index];
        if (!reward) return;
        const first = venuesFor(reward, knownPosition(getState()))[0];
        setUi({ rewardChoose: index, rewardPick: first?.id ?? null, rewardFilter: 'all' });
    },
    pickVenue(id: number): void {
        setUi({ rewardPick: id });
    },
    /** Show one venue type in the chooser; the pick moves to its nearest venue if it was another type. */
    venueFilter(type: string): void {
        const u = getUi();
        const reward = u.rewardChoose === null ? undefined : REWARDS[u.rewardChoose];
        if (!reward) return;
        const shown = venuesFor(reward, knownPosition(getState())).filter((v) => type === 'all' || v.type === type);
        const keep = shown.some((v) => v.id === u.rewardPick);
        setUi({ rewardFilter: type, rewardPick: keep ? u.rewardPick : (shown[0]?.id ?? null) });
    },
    closeChooser(): void {
        setUi({ rewardChoose: null });
    },
    /** A reward's ticket for one venue; it opens over the list, so closing it goes back there. */
    openTicket(index: number, venue: number): void {
        setUi({ rewardChoose: null, rewardTicket: { reward: index, venue } });
    },
    /** The ticket of a claimed reward, for the venue it was claimed at. */
    openClaimed(index: number): void {
        const claimed = REWARDS[index] && getState().rewardsClaimed[REWARDS[index].stamps];
        if (claimed) app.openTicket(index, claimed.venue);
    },
    closeTicket(): void {
        setUi({ rewardTicket: null });
    },
    /** "On the map": the explore map, moved to the venue, with the venue marked. */
    venueOnMap(id: number): void {
        const venue = venueById(id);
        if (!venue) return;
        setUi({ rewardTicket: null, rewardChoose: null, rewardList: false, screen: 'explore', mapPlace: { kind: 'venue', id } });
        // after the explore screen is shown, so the map has its size
        window.setTimeout(() => focusStreetMapOn(venue.lat, venue.lng), 80);
    },

    // --- around the exhibit (City open data) ---
    openArea(): void {
        setUi({ areaSheet: 'list' });
        const area = EXHIBIT_AREAS[getState().exhibitId];
        if (area) void loadAir(area);
    },
    areaTo(to: 'list' | 'air' | 'metro'): void {
        setUi({ areaSheet: to });
    },
    closeArea(): void {
        setUi({ areaSheet: null });
    },
    /** "See it on the map": the explore map, moved to the station, with the station marked. */
    metroOnMap(index: number): void {
        const exhibit = getState().exhibitId;
        const station = EXHIBIT_AREAS[exhibit]?.metro[index];
        if (!station) return;
        setUi({ areaSheet: null, screen: 'explore', mapPlace: { kind: 'metro', exhibit, index } });
        window.setTimeout(() => focusStreetMapOn(station.lat, station.lng), 80);
    },

    // --- presenter tools ---
    demo: toggleDemoMode,
    wrongBuilding(): void {
        simulateWrongBuilding();
        app.openAr();
    },
};

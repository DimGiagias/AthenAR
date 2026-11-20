// Live AR, full screen: the camera is the screen. Glass controls float over it:
// the exhibit at the top, a time dial on the right edge, and at the bottom a
// hint, the AR modes (street / room) and one big button that does the next
// step in the current mode. Pins on the model open a story card. Scanning an
// exhibit's picture (the Scan buttons) stands the model on that picture.
// While room AR runs, the same controls live in the WebXR overlay (xr*).
import type { ArEra, Hotspot } from '../../data/types';
import { anchorBearingFor } from '../../features/ar/anchor';
import { setArCamera } from '../../features/ar/controls';
import { AR_TARGETS_IMAGE } from '../../data/arTargets';
import { ROOM_SCALES } from '../../features/ar/room';
import { initEngine, projectHotspot, roomModelWidth, setAnchorBearing, setEngineActive, showModel } from '../../features/ar/three/engine';
import { isOnSite } from '../../features/ar/verification';
import { currentAssessment, currentExhibit, hotspotsFor } from '../../features/exhibits';
import { memoryPinLabels } from '../../features/memories';
import { getCameraStream } from '../../platform/camera';
import { getState, setState, type AppState, type ArMode } from '../../state/store';
import { $, setClass, setHidden, setHtml, setText } from '../dom';
import { escapeHtml } from '../escapeHtml';
import { t, type StringKey } from '../i18n';
import { icon, type IconName } from '../icons';
import { dist } from '../shared';
import { view } from '../state';

const PIN_BASE = 'ar-node-pin pointer-events-auto absolute w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition shadow-lg';
const PIN_ON = 'bg-sky-500 text-white border-[3px] border-white';
const PIN_OFF = 'bg-white text-sky-700 border-2 border-sky-400';
const CHIP = 'pointer-events-auto max-w-full flex items-center gap-2 h-9 pl-3 pr-1.5 rounded-2xl bg-white/95 backdrop-blur-md border shadow-sm text-left transition';
const BADGE = 'shrink-0 px-2 py-0.5 rounded-lg border text-[11px] font-semibold';

const MODES: Array<{ mode: ArMode; label: StringKey }> = [
    { mode: 'street', label: 'modeStreet' },
    { mode: 'room', label: 'modeRoom' },
];
/** Top to bottom on the time dial. */
const ERAS: ArEra[] = ['today', '1950', '1900'];

const roomRunning = (s: Readonly<AppState>): boolean => s.roomAr !== 'off' && s.roomAr !== 'unsupported';
/** Room AR has the model on the floor: pins and the story live in the WebXR overlay. */
const inRoom = (s: Readonly<AppState>): boolean => s.roomAr === 'placed';
/** Scanning for an exhibit's picture, not found yet: only the aiming frame shows. */
const aiming = (s: Readonly<AppState>): boolean => s.imageAr === 'loading' || s.imageAr === 'scanning';
/** The model stands on a scanned picture. */
const onPicture = (s: Readonly<AppState>): boolean => s.imageAr === 'tracking' || s.imageAr === 'holding';

const exhibitNum = (s: Readonly<AppState>): string => `#${String(currentExhibit(s).num).padStart(2, '0')}`;

function pins(s: Readonly<AppState>): Hotspot[] {
    return hotspotsFor(currentExhibit(s), s.lang, s.memories, memoryPinLabels);
}

function renderPins(s: Readonly<AppState>): void {
    const room = inRoom(s);
    const html = pins(s)
        .map((_h, i) => `<button onclick="app.pin(${i})" data-pin="${i}" style="left:-100px;top:-100px;" class="${PIN_BASE} ${i === s.hotspotIndex ? PIN_ON : PIN_OFF}">${i + 1}</button>`)
        .join('');
    setHtml('arPins3d', room || aiming(s) ? '' : html);
    setHtml('xrPins', room ? html : '');
    positionPins();
}

/** Called by the 3D engine after every frame. */
function positionPins(): void {
    $(inRoom(getState()) ? 'xrPins' : 'arPins3d')
        ?.querySelectorAll<HTMLElement>('[data-pin]')
        .forEach((el) => {
            const p = projectHotspot(Number(el.dataset.pin));
            if (!p) return;
            el.style.left = `${p.x.toFixed(1)}px`;
            el.style.top = `${p.y.toFixed(1)}px`;
            el.style.visibility = p.visible ? 'visible' : 'hidden';
        });
}

function dialHtml(s: Readonly<AppState>): string {
    const stops = ERAS.map((era) => {
        const on = era === s.arEra;
        const label = era === 'today' ? t('eraToday') : era;
        return `<button onclick="app.era('${era}')" class="w-12 h-12 rounded-full text-[11px] font-semibold transition ${on ? 'bg-sky-500 text-white shadow-lg' : 'text-white/75 hover:text-white'}">${label}</button>`;
    }).join('');
    return `<div class="glass rounded-full p-1.5 flex flex-col items-center gap-1">${stops}<span class="pb-1.5 pt-0.5 text-[9px] font-semibold tracking-[0.14em] text-sky-200">${t('arTime')}</span></div>`;
}

/** The mode switch; empty when the phone has only one mode. */
function modesHtml(s: Readonly<AppState>): string {
    const modes = MODES.filter((m) => m.mode !== 'room' || s.roomAr !== 'unsupported');
    if (modes.length < 2) return '';
    return modes
        .map(({ mode, label }) => {
            const on = mode === s.arMode && !onPicture(s);
            return `<button onclick="app.arMode('${mode}')" class="px-1 py-1 text-[11px] font-semibold tracking-[0.14em] transition ${on ? 'text-sky-300' : 'text-white/60 hover:text-white'}" style="text-shadow: 0 1px 4px rgba(0,0,0,.5)">${t(label)}</button>`;
        })
        .join('');
}

/** What the big button does now: its icon, label and whether it is busy. */
function shutterFor(s: Readonly<AppState>): { glyph: IconName; label: string; busy: boolean } {
    if (s.arMode === 'room') return { glyph: 'box', label: t('placeInRoom'), busy: s.roomAr === 'starting' };
    if (s.stamps[s.exhibitId] !== undefined) return { glyph: 'check', label: t('collected'), busy: false };
    if (isOnSite(currentAssessment(s))) return { glyph: 'award', label: t('collect'), busy: false };
    return { glyph: 'target', label: t('bScan'), busy: s.scanning };
}

function shutterHtml(s: Readonly<AppState>): string {
    const { glyph, label, busy } = shutterFor(s);
    return `<button onclick="app.shutter()" aria-label="${label}" ${busy ? 'disabled' : ''} class="w-[76px] h-[76px] rounded-full border-4 border-white/90 flex items-center justify-center shadow-xl active:scale-95 transition ${busy ? 'opacity-60' : ''}">
        <span class="w-[60px] h-[60px] rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-white flex items-center justify-center ${busy ? 'animate-pulse' : ''}">${icon(glyph, 'w-7 h-7')}</span>
    </button>`;
}

function hintFor(s: Readonly<AppState>): string {
    if (s.imageAr !== 'off') {
        const keys = { loading: 'hintImageLoading', scanning: 'hintScan', tracking: 'hintImageTracking', holding: 'hintImageHolding' } as const;
        return t(keys[s.imageAr]);
    }
    if (s.arMode === 'room') return t(s.roomAr === 'starting' ? 'roomStarting' : 'hintRoom');
    if (s.stamps[s.exhibitId] !== undefined) return t('collected');
    return t(isOnSite(currentAssessment(s)) ? 'hintCollect' : 'hintStreet');
}

function renderLockChip(s: Readonly<AppState>): void {
    const lock = currentAssessment(s);
    let border = 'border-sky-200';
    let dot = 'bg-slate-400';
    let text = t('lockIdle');
    let badge = `<span class="${BADGE} bg-sky-50 border-sky-200 text-sky-700">${t('bScan')}</span>`;
    const amber = (label: string): string => `<span class="${BADGE} bg-amber-50 border-amber-200 text-amber-800">${label}</span>`;
    const green = `<span class="${BADGE} bg-emerald-50 border-emerald-200 text-emerald-700">${t('bLocked')}</span>`;

    if (s.gps === 'acquiring' || s.scanning) {
        dot = 'bg-sky-400 animate-pulse';
        text = t('lockAcquiring');
        badge = `<span class="${BADGE} bg-slate-50 border-slate-200 text-slate-600">${t('bSearching')}</span>`;
    } else if (s.gps === 'denied' || s.gps === 'unavailable' || s.gps === 'unsupported') {
        border = 'border-amber-200';
        dot = 'bg-amber-500';
        text = t('lockNoGps');
        badge = amber(t('bNoGps'));
    } else if (lock.status !== 'no-fix' && lock.distance !== null) {
        if (lock.status === 'locked' || lock.status === 'here') {
            border = 'border-emerald-200';
            dot = 'bg-emerald-500';
            text = t(lock.status === 'locked' ? 'lockLocked' : 'lockHere', { score: lock.score });
            badge = green;
        } else if (lock.status === 'misaligned') {
            border = 'border-amber-200';
            dot = 'bg-amber-500';
            text = t('lockMisaligned', { side: t((lock.headingError ?? 0) > 0 ? 'sideRight' : 'sideLeft') });
            badge = amber(t('bOffTarget'));
        } else {
            border = 'border-amber-200';
            dot = 'bg-amber-500';
            text = t('lockFar', { dist: dist(lock.distance) });
            badge = amber(t('bFar'));
        }
    }
    setClass('arLock', `${CHIP} ${border}`);
    setHtml('arLock', `<span class="shrink-0 w-2.5 h-2.5 rounded-full ${dot}"></span><span class="min-w-0 truncate text-[11px] font-semibold text-marble-ink">${text}${s.demoMode ? ' · DEMO' : ''}</span>${badge}`);
}

function renderOverlay(s: Readonly<AppState>): void {
    setHidden('arOverlay', !s.offTargetOverlay);
    if (!s.offTargetOverlay) return;
    const ex = currentExhibit(s);
    const lock = currentAssessment(s);
    const amberTile = 'bg-amber-500/20 border-amber-400 text-amber-300';
    const amberBadge = 'bg-amber-500/20 border-amber-400/50 text-amber-300';
    const retry = `<button onclick="app.scan()" class="h-11 px-4 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-[13px] font-semibold flex items-center gap-1.5 transition">${icon('target', 'w-4 h-4')}${t('wrongRetryBtn')}</button>`;

    let tile = amberTile;
    let badgeTone = amberBadge;
    let glyph = icon('alert', 'w-8 h-8');
    let badge: string;
    let title: string;
    let body: string;
    let buttons = retry;

    if (lock.status === 'no-fix' || lock.distance === null) {
        badge = t('wrongNoGpsBadge');
        title = t('wrongNoGpsTitle');
        body = t('wrongNoGpsSub');
        buttons = `${retry}<button onclick="app.demo()" class="h-11 px-4 rounded-2xl border border-white/30 bg-white/10 text-white text-[13px] font-semibold">${t('gpsDemoPill')}</button>`;
    } else if (lock.status === 'far') {
        tile = 'bg-sky-500/20 border-sky-400 text-sky-300';
        badgeTone = 'bg-sky-500/20 border-sky-400/50 text-sky-300';
        glyph = icon('navigation', 'w-8 h-8');
        badge = t('ovFarBadge');
        title = t('ovFarTitle', { dist: dist(lock.distance) });
        body = t('ovFarBody', { radius: lock.radius, title: ex[s.lang].title });
        buttons = `<button onclick="app.showOnMap()" class="h-11 px-4 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-[13px] font-semibold transition">${t('ovShowMap')}</button>
            <button onclick="app.seeModel()" class="h-11 px-4 rounded-2xl border border-white/30 bg-white/10 text-white text-[13px] font-semibold">${t('ov3d')}</button>`;
    } else {
        const err = lock.headingError ?? 0;
        const side = t(err > 0 ? 'sideRight' : 'sideLeft');
        glyph = icon(err > 0 ? 'turnRight' : 'turnLeft', 'w-8 h-8');
        badge = t('ovTurnBadge', { score: lock.score });
        title = t('ovTurnTitle', { deg: Math.abs(Math.round(err)), side });
        body = t('wrongDirSub', { deg: Math.abs(Math.round(err)), offSide: t(err > 0 ? 'sideLeft' : 'sideRight'), turnSide: side });
    }

    setHtml(
        'arOverlay',
        `<div class="relative rounded-3xl bg-slate-950/85 backdrop-blur-md p-5 pt-6 flex flex-col items-center text-center gap-2.5 shadow-2xl fade-in">
            <button onclick="app.dismissOverlay()" aria-label="${t('close')}" class="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 text-white/80 flex items-center justify-center">${icon('x', 'w-4 h-4')}</button>
            <span class="w-16 h-16 rounded-[18px] border flex items-center justify-center ${tile}">${glyph}</span>
            <span class="px-2.5 py-0.5 rounded-full border text-[10px] font-semibold tracking-[0.08em] ${badgeTone}">${badge}</span>
            <span class="text-[22px] leading-7 font-semibold text-white">${title}</span>
            <span class="text-[13px] leading-[19px] text-slate-300">${body}</span>
            <div class="flex flex-wrap justify-center gap-2 mt-1.5">${buttons}</div>
        </div>`,
    );
}

function storyHtml(s: Readonly<AppState>): string {
    const list = pins(s);
    const h = list[s.hotspotIndex] ?? list[0];
    if (!h) return '';
    const nav = (dir: 'chevronLeft' | 'chevronRight', delta: number): string =>
        `<button onclick="app.step(${delta}, ${list.length})" aria-label="${dir}" class="w-[34px] h-[34px] rounded-xl border border-sky-200 bg-sky-50 text-sky-700 flex items-center justify-center hover:bg-sky-100 transition">${icon(dir, 'w-4 h-4')}</button>`;
    return `<div class="flex items-start justify-between gap-2">
            <span class="flex items-center gap-2.5 min-w-0">
                <span class="shrink-0 w-7 h-7 rounded-full bg-sky-500 text-white text-xs font-semibold flex items-center justify-center">${s.hotspotIndex + 1}</span>
                <span class="min-w-0">
                    <span class="block text-[10px] font-semibold uppercase tracking-[0.08em] text-sky-600">${escapeHtml(h.type)}</span>
                    <span class="block text-[15px] font-semibold leading-snug">${escapeHtml(h.title)}</span>
                </span>
            </span>
            <button onclick="app.closeStory()" aria-label="${t('close')}" class="shrink-0 w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">${icon('x', 'w-4 h-4')}</button>
        </div>
        <p class="text-[13px] leading-5 text-marble-muted">${escapeHtml(h.text)}</p>
        <div class="flex items-center justify-between gap-2">
            ${nav('chevronLeft', -1)}
            <span class="text-[11px] font-semibold text-slate-500">${t('nodeOf', { i: s.hotspotIndex + 1, n: list.length })}</span>
            ${nav('chevronRight', 1)}
        </div>`;
}

/** The WebXR overlay while room AR runs: same look as the camera screen. */
function mountRoomOverlay(): void {
    const hints = { searching: 'roomSearching', aiming: 'roomAiming', placed: 'roomPlaced', starting: 'roomStarting' } as const;
    view(
        (s, u) => [s.lang, s.roomAr, s.roomSize, s.exhibitId, s.arEra, s.hotspotIndex, s.memories, u.story],
        (s, u) => {
            setHidden('xrOverlay', !roomRunning(s));
            if (s.roomAr === 'off' || s.roomAr === 'unsupported') return;
            const placed = s.roomAr === 'placed';
            const story = placed && u.story;
            setText('xrNum', exhibitNum(s));
            setText('xrTitle', currentExhibit(s)[s.lang].title);
            setHtml('xrExit', icon('x', 'w-5 h-5'));
            $('xrExit')?.setAttribute('aria-label', t('roomExit'));
            setText('xrHint', t(hints[s.roomAr]));
            setHidden('xrCoach', s.roomAr !== 'searching');
            setHidden('xrDial', !placed);
            if (placed) setHtml('xrDial', dialHtml(s));
            setHidden('xrTools', !placed);
            setHidden('xrControls', story);
            setHidden('xrStory', !story);
            if (story) setHtml('xrStory', storyHtml(s));
            const metres = roomModelWidth(ROOM_SCALES[s.roomSize] ?? 1);
            setHtml('xrSizeBtn', `${icon('resize', 'w-4 h-4')}${t('roomSize', { m: metres < 1 ? metres.toFixed(1) : Math.round(metres) })}`);
            setHtml('xrRotL', icon('rotateLeft', 'w-[18px] h-[18px]'));
            setHtml('xrRotR', icon('rotateRight', 'w-[18px] h-[18px]'));
            $('xrRotL')?.setAttribute('aria-label', t('roomRotate'));
            $('xrRotR')?.setAttribute('aria-label', t('roomRotate'));
        },
    );
    // A tap on a button or the story card must not also move the model in the room.
    $('xrOverlay')?.addEventListener('beforexrselect', (e) => {
        if ((e.target as Element | null)?.closest('button, #xrStory')) e.preventDefault();
    });
}

export function mountAr(): void {
    const stage = $('arThree');
    const has3d = stage ? initEngine(stage, positionPins) : false;

    // The camera runs while Live AR is open, except while room AR uses it.
    view(
        (s, u) => [u.screen, s.roomAr],
        (s, u) => {
            if (u.screen === 'ar' && !roomRunning(s)) void setArCamera(true);
        },
    );
    view(
        (s) => [s.camera],
        (s) => {
            const video = $('arVideo') as HTMLVideoElement | null;
            if (video) {
                const stream = s.camera === 'live' ? getCameraStream() : null;
                if (video.srcObject !== stream) video.srcObject = stream;
                video.classList.toggle('hidden', stream === null);
            }
            setHidden('arSimBackdrop', s.camera !== 'simulated');
        },
    );

    // The model: shown unless the picture has not been found yet.
    view(
        (s, u) => [u.screen, aiming(s)],
        (s, u) => {
            const show = has3d && u.screen === 'ar' && !aiming(s);
            setHidden('arThree', !show); // visible first: the engine measures it
            setEngineActive(show);
            setHidden('arTarget', !aiming(s));
        },
    );
    view(
        (s) => [s.exhibitId, s.arEra],
        (s) => showModel(currentExhibit(s), s.arEra),
    );
    view(
        (s) => [s.arMode, s.camera, s.demoMode, s.heading === null, s.coords, s.accuracy, s.exhibitId, s.imageAr],
        (s) => setAnchorBearing(s.arMode === 'street' ? anchorBearingFor(s) : null),
    );

    // Top: the exhibit (or, while scanning, what is happening), scan and the audio guide.
    view(
        (s) => [s.lang, s.exhibitId, s.audioPlaying, aiming(s)],
        (s) => {
            const scanning = aiming(s);
            setText('arNum', scanning ? '' : exhibitNum(s));
            setText('arTitle', scanning ? t('scanTitle') : currentExhibit(s)[s.lang].title);
            setHtml('arScanBtn', icon('scanEye', 'w-5 h-5'));
            $('arScanBtn')?.setAttribute('aria-label', t('scanTitle'));
            setHidden('arScanBtn', scanning);
            setHtml('arClose', icon('x', 'w-5 h-5'));
            $('arClose')?.setAttribute('aria-label', t('close'));
            setHtml('arAudio', icon(s.audioPlaying ? 'pause' : 'headphones', 'w-5 h-5'));
            $('arAudio')?.setAttribute('aria-label', t('audioGuide'));
            $('arAudio')?.classList.toggle('bg-sky-500/70', s.audioPlaying);
        },
    );

    view(
        (s) => [s.lang, s.arEra],
        (s) => setHtml('arDial', dialHtml(s)),
    );

    // Bottom: hint, modes and the big button; or the story card.
    view(
        (s, u) => [s.lang, s.arMode, s.roomAr, s.imageAr, s.exhibitId, s.stamps, s.scanning, s.gps, s.coords, s.accuracy, s.heading, u.story],
        (s, u) => {
            const scanning = aiming(s);
            setText('arHint', hintFor(s));
            setHidden('arScanCard', !scanning);
            setText('arScanWhere', t('scanWhere'));
            const thumb = $('arScanThumb') as HTMLImageElement | null;
            if (thumb && !thumb.getAttribute('src')) thumb.src = AR_TARGETS_IMAGE;
            setHtml('arModes', scanning ? '' : modesHtml(s));
            setHtml('arShutter', scanning ? '' : shutterHtml(s));
            setHidden('arControls', u.story);
            setHidden('arStory', !u.story);
            setHidden('arLockRow', s.arMode !== 'street' || s.imageAr !== 'off');
        },
    );

    // Pins and the story.
    view(
        (s, u) => [s.lang, s.exhibitId, s.hotspotIndex, s.memories, inRoom(s), aiming(s), u.story],
        (s, u) => {
            if (s.hotspotIndex > pins(s).length - 1) {
                setState({ hotspotIndex: 0 });
                return;
            }
            renderPins(s);
            if (u.story) setHtml('arStory', storyHtml(s));
        },
    );

    // Street mode: lock chip, scanner, off-target card.
    view((s) => [s.lang, s.exhibitId, s.gps, s.coords, s.accuracy, s.heading, s.demoMode, s.scanning], renderLockChip);
    view(
        (s) => [s.scanning],
        (s) => setHidden('arScanner', !s.scanning),
    );
    view((s) => [s.offTargetOverlay, s.lang, s.exhibitId, s.coords, s.accuracy, s.heading], renderOverlay);

    mountRoomOverlay();
}

// Live AR, full screen: the 2D drawing or 3D hologram (camera behind it
// when on), a compact lock chip, the off-target card, the era bar, a large
// "Collect your stamp" button on site, and the story card as a bottom sheet.
import type { Hotspot } from '../../data/types';
import { anchorBearingFor } from '../../features/ar/anchor';
import { render2dArchitecturalSvg } from '../../features/ar/svg2d';
import { initEngine, projectHotspot, setAnchorBearing, setEngineActive, showModel } from '../../features/ar/three/engine';
import { isOnSite } from '../../features/ar/verification';
import { currentAssessment, currentExhibit, hotspotsFor } from '../../features/exhibits';
import { memoryPinLabels } from '../../features/memories';
import { getCameraStream } from '../../platform/camera';
import { getState, setState, type AppState } from '../../state/store';
import { $, setClass, setHidden, setHtml, setText } from '../dom';
import { escapeHtml } from '../escapeHtml';
import { t } from '../i18n';
import { icon } from '../icons';
import { dist, PRIMARY } from '../shared';
import { view } from '../state';

const DIM_ON = 'h-10 px-2.5 rounded-[13px] text-xs font-extrabold bg-white text-sky-700 shadow-sm transition';
const DIM_OFF = 'h-10 px-2.5 rounded-[13px] text-xs font-bold text-marble-muted hover:text-marble-ink transition';
const ERA_ON = 'h-9 rounded-xl text-xs font-extrabold bg-sky-600 text-white shadow-sm transition';
const ERA_OFF = 'h-9 rounded-xl text-xs font-bold text-marble-muted hover:text-marble-ink transition';
const TOOL = 'h-9 px-3 rounded-xl border text-[11px] font-semibold shadow-sm flex items-center gap-1.5 transition';
const TOOL_WHITE = `${TOOL} bg-white/95 border-sky-200 text-sky-700 hover:bg-sky-50`;
const TOOL_BLUE = `${TOOL} bg-sky-600 border-sky-400 text-white hover:bg-sky-500`;
const PIN_BASE = 'ar-node-pin pointer-events-auto absolute w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition shadow-lg';
const PIN_ON = 'bg-sky-600 text-white border-4 border-white';
const PIN_OFF = 'bg-white/95 text-sky-700 border-2 border-sky-400';
const CHIP = 'pointer-events-auto max-w-full flex items-center gap-2 h-9 pl-3 pr-1.5 rounded-2xl bg-white/95 backdrop-blur-md border shadow-sm text-left transition';
const BADGE = 'shrink-0 px-2 py-0.5 rounded-lg border text-[11px] font-semibold';

function pins(s: Readonly<AppState>): Hotspot[] {
    return hotspotsFor(currentExhibit(s), s.lang, s.memories, memoryPinLabels);
}

function renderPins(s: Readonly<AppState>): void {
    const list = pins(s);
    const is3d = s.dimension === '3d';
    const html = list
        .map((_h, i) => {
            const pos = is3d ? 'left:-100px;top:-100px;' : `left:${list[i].x};top:${list[i].y};`;
            return `<button onclick="app.pin(${i})" data-pin="${i}" style="${pos}" class="${PIN_BASE} ${i === s.hotspotIndex ? PIN_ON : PIN_OFF}">${i + 1}</button>`;
        })
        .join('');
    setHtml('arPins2d', is3d ? '' : html);
    setHtml('arPins3d', is3d ? html : '');
    if (is3d) positionPins3d();
}

/** Called by the 3D engine after every frame. */
function positionPins3d(): void {
    if (getState().dimension !== '3d') return;
    $('arPins3d')
        ?.querySelectorAll<HTMLElement>('[data-pin]')
        .forEach((el) => {
            const p = projectHotspot(Number(el.dataset.pin));
            if (!p) return;
            el.style.left = `${p.x.toFixed(1)}px`;
            el.style.top = `${p.y.toFixed(1)}px`;
            el.style.visibility = p.visible ? 'visible' : 'hidden';
        });
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
        if (lock.status === 'locked') {
            border = 'border-emerald-200';
            dot = 'bg-emerald-500';
            text = t('lockLocked', { score: lock.score });
            badge = green;
        } else if (lock.status === 'here') {
            border = 'border-emerald-200';
            dot = 'bg-emerald-500';
            text = t('lockHere', { score: lock.score });
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
            <button onclick="app.view3d()" class="h-11 px-4 rounded-2xl border border-white/30 bg-white/10 text-white text-[13px] font-semibold">${t('ov3d')}</button>`;
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

function renderCollect(s: Readonly<AppState>): void {
    const ex = currentExhibit(s);
    if (s.stamps[ex.id] !== undefined) {
        setHtml('arCollect', `<span class="mx-auto w-fit px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-1.5 shadow-sm">${icon('check', 'w-3.5 h-3.5', 2.6)}${t('collected')}</span>`);
    } else if (isOnSite(currentAssessment(s))) {
        setHtml('arCollect', `<button onclick="app.collect()" class="w-full h-[52px] rounded-2xl ${PRIMARY} text-[15px] font-semibold flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(37,99,235,0.3)] hover:opacity-95 transition">${icon('award', 'w-5 h-5')}+ ${t('collect')}</button>`);
    } else {
        setHtml('arCollect', '');
    }
}

function renderStory(s: Readonly<AppState>): void {
    const list = pins(s);
    const h = list[s.hotspotIndex] ?? list[0];
    if (!h) return;
    const nav = (dir: 'chevronLeft' | 'chevronRight', delta: number): string =>
        `<button onclick="app.step(${delta}, ${list.length})" aria-label="${dir}" class="w-[34px] h-[34px] rounded-xl border border-sky-200 bg-sky-50 text-sky-700 flex items-center justify-center hover:bg-sky-100 transition">${icon(dir, 'w-4 h-4')}</button>`;
    setHtml(
        'arStory',
        `<div class="flex items-start justify-between gap-2">
            <span class="flex items-center gap-2.5 min-w-0">
                <span class="shrink-0 w-[26px] h-[26px] rounded-full bg-sky-500 text-white text-xs font-semibold flex items-center justify-center">${s.hotspotIndex + 1}</span>
                <span class="min-w-0">
                    <span class="block text-[10px] font-semibold uppercase tracking-[0.08em] text-sky-600">${escapeHtml(h.type)}</span>
                    <span class="block text-[15px] font-semibold leading-snug text-marble-ink">${escapeHtml(h.title)}</span>
                </span>
            </span>
            <span class="flex gap-1 shrink-0">${nav('chevronLeft', -1)}${nav('chevronRight', 1)}</span>
        </div>
        <p class="text-[13px] leading-5 text-marble-muted">${escapeHtml(h.text)}</p>
        <span class="inline-block px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-[11px] font-semibold">${t('nodeOf', { i: s.hotspotIndex + 1, n: list.length })}</span>`,
    );
}

export function mountAr(): void {
    const stage3d = $('arThree');
    const has3d = stage3d ? initEngine(stage3d, positionPins3d) : false;

    // plaque
    view(
        (s) => [s.lang, s.exhibitId, s.dimension],
        (s) => {
            const ex = currentExhibit(s);
            setText('arNum', `${ex[s.lang].code} • ${ex.year}`);
            setText('arTitle', ex[s.lang].title);
            setText('arModePill', t(s.dimension === '3d' ? 'pill3d' : 'pill2d'));
        },
    );

    // 2D / 3D layers, then the engine (it measures its now-visible container)
    view(
        (s) => [s.dimension],
        (s) => {
            const is3d = s.dimension === '3d';
            setClass('arDim-2d', is3d ? DIM_OFF : DIM_ON);
            setClass('arDim-3d', is3d ? DIM_ON : DIM_OFF);
            setHidden('arDrawingBox', is3d);
            setHidden('arThreeBox', !is3d);
            setHidden('ar3dTools', !is3d);
            setHidden('ar3dHint', !is3d);
        },
    );
    view(
        (s, u) => [u.screen, s.dimension],
        (s, u) => setEngineActive(has3d && u.screen === 'ar' && s.dimension === '3d'),
    );

    // camera
    view(
        (s) => [s.lang, s.camera],
        (s) => {
            const on = s.camera !== 'off';
            setClass('arCamBtn', on ? TOOL_BLUE : TOOL_WHITE);
            setHtml('arCamBtn', `${icon('camera', 'w-4 h-4')}${t(on ? 'cameraOff' : 'camera')}`);
            const video = $('arVideo') as HTMLVideoElement | null;
            if (video) {
                const stream = s.camera === 'live' ? getCameraStream() : null;
                if (video.srcObject !== stream) video.srcObject = stream;
                video.classList.toggle('hidden', stream === null);
            }
            setHidden('arSimBackdrop', s.camera !== 'simulated');
        },
    );

    // 3D tools
    view(
        (s) => [s.lang, s.timelapse, s.xray],
        (s) => {
            setText('arTimelapseText', s.timelapse ? t('timelapseStop') : `▶ ${t('timelapseStart')}`);
            setClass('arXray', s.xray ? TOOL_BLUE : TOOL_WHITE);
        },
    );
    view(
        (s) => [s.lang, anchorBearingFor(s) !== null],
        (s) => setText('ar3dHintText', t(anchorBearingFor(s) !== null ? 'hintAnchored' : 'hint3d')),
    );

    // era time machine
    view(
        (s) => [s.lang, s.arEra],
        (s) => {
            setText('arEraLabel', t('arTimeMachineLabel'));
            setText('arEra-todayText', t('eraToday'));
            for (const era of ['1900', '1950', 'today'] as const) setClass('arEra-' + era, era === s.arEra ? ERA_ON : ERA_OFF);
            const ill = $('arDrawing');
            if (ill) {
                ill.classList.remove('era-filter-1900', 'era-filter-1950', 'era-filter-today');
                ill.classList.add('era-filter-' + s.arEra);
            }
        },
    );

    // the building itself
    view(
        (s) => [s.exhibitId, s.arEra],
        (s) => {
            const host = $('arDrawing');
            if (host) render2dArchitecturalSvg(host, currentExhibit(s), s.arEra);
        },
    );
    view(
        (s) => [s.exhibitId, s.arEra, s.xray],
        (s) => showModel(currentExhibit(s), s.arEra, s.xray),
    );
    view(
        (s) => [s.camera, s.demoMode, s.heading === null, s.coords, s.accuracy, s.exhibitId],
        (s) => setAnchorBearing(anchorBearingFor(s)),
    );

    // pins + story sheet
    view(
        (s) => [s.lang, s.exhibitId, s.hotspotIndex, s.dimension, s.memories],
        (s) => {
            if (s.hotspotIndex > pins(s).length - 1) {
                setState({ hotspotIndex: 0 });
                return;
            }
            renderPins(s);
            renderStory(s);
        },
    );

    // lock chip, scanner, off-target card, stamp button
    view((s) => [s.lang, s.exhibitId, s.gps, s.coords, s.accuracy, s.heading, s.demoMode, s.scanning], renderLockChip);
    view(
        (s) => [s.scanning],
        (s) => setHidden('arScanner', !s.scanning),
    );
    view((s) => [s.offTargetOverlay, s.lang, s.exhibitId, s.coords, s.accuracy, s.heading], renderOverlay);
    view((s) => [s.lang, s.exhibitId, s.stamps, s.gps, s.coords, s.accuracy, s.heading], renderCollect);
}

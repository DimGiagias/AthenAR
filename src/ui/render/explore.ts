// Explore: the street map fills the screen; a sheet over it holds the exhibit
// count, the era filter, the featured (nearest or selected) exhibit and the
// rest of the list. The sheet's top edge drags down to a strip (map nearly full
// screen) and back up. A layers button over the map shows the City's metro
// stations and culture venues (open data); a tap on one opens its card.
import { METRO_LINE, metroFill, type MetroStation } from '../../data/area';
import { exhibitsData } from '../../data/exhibits';
import { geofenceRadius, MAP_PINS } from '../../data/geo';
import type { EraRoom, Exhibit } from '../../data/types';
import { matchesFilters } from '../../features/exhibits';
import { venueById } from '../../features/rewards';
import { EXHIBIT_AREAS, METRO_STATIONS } from '../../data/areaData';
import { venueName, venueType } from '../../data/culture';
import { CULTURE_VENUES } from '../../data/cultureVenues';
import { REWARDS } from '../../data/rewards';
import { distanceMeters } from '../../platform/geoMath';
import type { AppState } from '../../state/store';
import { app } from '../actions';
import { $, setClass, setHidden, setHtml, setText } from '../dom';
import { escapeHtml } from '../escapeHtml';
import { t } from '../i18n';
import { mountStreetMap, updateStreetMap, type MapStopView, type MapView } from '../map/streetMap';
import { icon, type IconName } from '../icons';
import { dist, lineBadge, metresTo, PRIMARY, ROOM_BADGE, roomLabel } from '../shared';
import { view, type MapLayer, type UiState } from '../state';
import { venueLook } from './rewardChooser';

// The era filter: a dropdown pill that takes on the chosen era's colour.
const ERA_PILL = 'relative h-7 max-w-[132px] pl-2 pr-1.5 rounded-full border text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition';
const ERAS: Array<{ id: EraRoom | 'all'; label: () => string; pill: string; dot: string }> = [
    { id: 'all', label: () => t('chipAll'), pill: 'bg-sky-50 border-sky-200 text-sky-700', dot: 'bg-gradient-to-br from-amber-400 via-indigo-500 to-blue-500' },
    { id: 'ancient', label: () => t('chipAncient'), pill: 'bg-amber-50 border-amber-300 text-amber-800', dot: 'bg-amber-500' },
    { id: 'byzantine', label: () => t('chipByzantine'), pill: 'bg-indigo-50 border-indigo-300 text-indigo-800', dot: 'bg-indigo-600' },
    { id: 'modern', label: () => t('chipModern'), pill: 'bg-blue-50 border-blue-300 text-blue-800', dot: 'bg-blue-600' },
];

/** The place marked on the map, in the interface language. */
function mapPlace(s: Readonly<AppState>, u: Readonly<UiState>): MapView['place'] {
    const p = u.mapPlace;
    if (p?.kind === 'venue') {
        const venue = venueById(p.id);
        return venue ? { kind: 'venue', lat: venue.lat, lng: venue.lng, label: venueName(venue, s.lang) } : null;
    }
    if (p?.kind === 'metro') {
        const station = EXHIBIT_AREAS[p.exhibit]?.metro[p.index];
        return station ? { kind: 'metro', lat: station.lat, lng: station.lng, label: station.name[s.lang] } : null;
    }
    return null;
}

const VENUE_STYLE = 'background:#FFFFFF;color:#E11D48;box-shadow:inset 0 0 0 1.5px #E11D48';

function mapStops(s: Readonly<AppState>, u: Readonly<UiState>): MapStopView[] {
    const selected = (layer: MapLayer, id: number): boolean => u.mapCard?.layer === layer && u.mapCard.id === id;
    const stops: MapStopView[] = [];
    if (u.mapLayers.venue) {
        for (const v of CULTURE_VENUES) {
            stops.push({ layer: 'venue', id: v.id, lat: v.lat, lng: v.lng, label: venueName(v, s.lang), fill: '#FFFFFF', glyph: venueLook(v).glyph, selected: selected('venue', v.id) });
        }
    }
    if (u.mapLayers.metro) {
        METRO_STATIONS.forEach((m, i) => stops.push({ layer: 'metro', id: i, lat: m.lat, lng: m.lng, label: m.name[s.lang], fill: metroFill(m.lines), glyph: 'train', selected: selected('metro', i) }));
    }
    return stops;
}

function layersPanel(u: Readonly<UiState>): string {
    const row = (layer: MapLayer, glyph: IconName, look: string, title: string, sub: string): string => {
        const on = u.mapLayers[layer];
        return `<button onclick="app.toggleLayer('${layer}')" role="switch" aria-checked="${on}" class="w-full text-left flex items-center gap-2.5 py-1.5">
            <span class="shrink-0 w-8 h-8 rounded-[10px] flex items-center justify-center" style="${look}">${icon(glyph, 'w-4 h-4')}</span>
            <span class="flex-1 min-w-0"><span class="block text-[13px] font-semibold text-marble-ink">${title}</span><span class="block text-[10.5px] text-slate-500">${sub}</span></span>
            <span class="shrink-0 relative w-9 h-[21px] rounded-full transition ${on ? 'bg-sky-600' : 'bg-slate-300'}"><span class="absolute top-0.5 ${on ? 'left-[17px]' : 'left-0.5'} w-[17px] h-[17px] rounded-full bg-white shadow transition-all"></span></span>
        </button>`;
    };
    return `<span class="text-[10px] font-bold tracking-[0.1em] uppercase text-sky-600">${t('layersTitle')}</span>
        ${row('metro', 'train', 'background:#0284C7;color:#FFFFFF', t('layerMetro'), t('layerMetroCount', { n: METRO_STATIONS.length }))}
        ${row('venue', 'landmark', VENUE_STYLE, t('layerVenues'), t('layerVenuesCount', { n: CULTURE_VENUES.length }))}
        <span class="text-[9.5px] text-slate-400">${t('layersSource')}</span>`;
}

function nearestExhibit(m: MetroStation): { ex: Exhibit; metres: number } {
    return exhibitsData.map((ex) => ({ ex, metres: distanceMeters(m.lat, m.lng, ex.coords[0], ex.coords[1]) })).reduce((a, b) => (b.metres < a.metres ? b : a));
}

function mapCard(s: Readonly<AppState>, u: Readonly<UiState>): string {
    const card = u.mapCard;
    if (!card) return '';
    const close = `<button onclick="app.closeMapCard()" aria-label="${t('close')}" class="shrink-0 w-[30px] h-[30px] rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">${icon('x', 'w-3.5 h-3.5')}</button>`;
    const head = (look: string, glyph: IconName, kicker: string, title: string, sub: string): string => `<div class="flex items-start gap-2.5">
            <span class="shrink-0 w-[38px] h-[38px] rounded-xl flex items-center justify-center" style="${look}">${icon(glyph, 'w-5 h-5')}</span>
            <span class="flex-1 min-w-0">
                <span class="block text-[10px] font-bold tracking-[0.08em] uppercase text-slate-500">${kicker}</span>
                <span class="block text-[15px] leading-5 font-semibold text-marble-ink">${title}</span>
                <span class="block mt-0.5 text-[11.5px] leading-4 text-slate-500">${sub}</span>
            </span>
            ${close}
        </div>`;
    let inner = '';
    if (card.layer === 'metro') {
        const m = METRO_STATIONS[card.id];
        if (!m) return '';
        const near = nearestExhibit(m);
        inner = `${head(`background:${metroFill(m.lines)};color:#FFFFFF`, 'train', t('metroStation'), m.name[s.lang], m.name[s.lang === 'el' ? 'en' : 'el'])}
            <div class="flex flex-col gap-1">${m.lines.map((n) => `<span class="flex items-center text-xs text-slate-700">${lineBadge(n)}${METRO_LINE[n]?.ends[s.lang] ?? ''}</span>`).join('')}</div>
            <button onclick="app.openExhibit(${near.ex.id})" class="flex items-center gap-1.5 text-left text-[11.5px] font-semibold text-sky-700">${icon('mapPin', 'w-3.5 h-3.5 shrink-0')}<span class="flex-1 min-w-0 truncate">${t('mapNearestExhibit', { name: near.ex[s.lang].title, dist: dist(near.metres) })}</span>${icon('chevronRight', 'w-3.5 h-3.5 shrink-0')}</button>`;
    } else {
        const v = venueById(card.id);
        if (!v) return '';
        const reward = REWARDS.find((r) => r.types.includes(v.type));
        inner = `${head(VENUE_STYLE, venueLook(v).glyph, venueType(v, s.lang), escapeHtml(venueName(v, s.lang)), escapeHtml(v.address))}
            ${reward ? `<button onclick="app.openRewards()" class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-50 text-rose-700 text-[11.5px] font-semibold text-left">${icon('gift', 'w-3.5 h-3.5 shrink-0')}<span class="flex-1 min-w-0">${t('mapVenueReward', { mine: reward[s.lang].mine, n: reward.stamps })}</span>${icon('chevronRight', 'w-3.5 h-3.5 shrink-0')}</button>` : ''}
            ${/^https?:\/\//.test(v.link) ? `<a href="${escapeHtml(v.link)}" target="_blank" rel="noopener" class="h-9 rounded-xl border-[1.5px] border-sky-300 text-sky-700 text-[12.5px] font-semibold flex items-center justify-center gap-1.5">${icon('externalLink', 'w-3.5 h-3.5')}${t('passWebsite')}</a>` : ''}`;
    }
    return `<div role="dialog" aria-label="${t('layersTitle')}" class="bg-white rounded-[20px] p-3 shadow-[0_16px_36px_rgba(15,23,42,0.22)] flex flex-col gap-2 fade-in">${inner}</div>`;
}

function mapView(s: Readonly<AppState>, u: Readonly<UiState>): MapView {
    return {
        lang: s.lang,
        eraFilter: s.eraFilter,
        selectedId: s.exhibitId,
        pins: MAP_PINS.map((p) => {
            const ex = exhibitsData[p.id];
            return { id: p.id, num: p.num.slice(1), label: s.lang === 'el' ? p.labelEl : p.labelEn, room: p.eraRoom, lat: ex.coords[0], lng: ex.coords[1], dimmed: !matchesFilters(ex, s) };
        }),
        user: s.gps === 'active' && s.coords ? { lat: s.coords[0], lng: s.coords[1], demo: s.demoMode, label: t(s.demoMode ? 'youLabelDemo' : 'youLabel') } : null,
        place: mapPlace(s, u),
        stops: mapStops(s, u),
        roomLabels: { ancient: t('mapRoomAncient'), byzantine: t('mapRoomByzantine'), modern: t('mapRoomModern') },
        unavailableText: t('mapUnavailable'),
    };
}

function featuredCard(ex: Exhibit, s: Readonly<AppState>, metres: number | null): string {
    const d = ex[s.lang];
    let kicker = t('kSelected');
    let here = false;
    if (metres !== null) {
        here = metres <= geofenceRadius(ex.id);
        kicker = here ? (s.demoMode ? t('kHereDemo') : t('kHere', { dist: dist(metres) })) : t('kNearest', { dist: dist(metres) });
    }
    const kickerTone = here ? 'bg-emerald-50 text-emerald-700' : 'bg-sky-100/90 text-sky-700';
    const dotTone = here ? 'bg-emerald-500' : 'bg-sky-500';
    // The card shows the exhibit on the map; only the button on the right opens its page.
    return `
        <div onclick="app.focusExhibit(${ex.id})" class="relative w-full overflow-hidden flex items-center gap-3 p-3.5 rounded-3xl bg-gradient-to-br from-white via-sky-50 to-blue-50 border border-sky-200 shadow-sm hover:border-sky-400 transition cursor-pointer">
            <span aria-hidden="true" class="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-sky-200/35"></span>
            <button type="button" class="relative flex-1 min-w-0 flex flex-col items-start gap-1 text-left focus:outline-none">
                <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${kickerTone} text-[11px] font-semibold tracking-[0.04em]"><span class="w-1.5 h-1.5 rounded-full ${dotTone}"></span>${kicker}</span>
                <span class="text-[17px] font-semibold leading-snug text-marble-ink">${d.title}</span>
                <span class="text-xs font-medium text-sky-700">${ex.num} · ${roomLabel(ex.eraRoom)}</span>
            </button>
            <button type="button" onclick="event.stopPropagation(); app.openExhibit(${ex.id})" class="relative shrink-0 h-10 px-3.5 rounded-2xl ${PRIMARY} text-[13px] font-semibold flex items-center shadow-sm hover:opacity-95 transition">${t('open')}</button>
        </div>`;
}

function rowCard(ex: Exhibit, s: Readonly<AppState>, metres: number | null): string {
    const d = ex[s.lang];
    const stamped = s.stamps[ex.id] !== undefined;
    const where = metres !== null ? `<span class="text-emerald-700 font-semibold">${dist(metres)}</span>` : `<span class="text-marble-muted">${d.walk}</span>`;
    // Selected (shown on the map) while another exhibit is the top card.
    const selected = ex.id === s.exhibitId ? 'border-sky-500 ring-2 ring-sky-200' : 'border-sky-200 hover:border-sky-400';
    // Like the featured card: only the arrow on the right opens the page.
    return `
        <div onclick="app.focusExhibit(${ex.id})" class="w-full flex items-center gap-1.5 p-3 pr-1.5 rounded-[20px] bg-white border ${selected} shadow-sm transition cursor-pointer">
            <button type="button" class="flex-1 min-w-0 flex flex-col gap-1 text-left focus:outline-none">
                <span class="flex flex-wrap items-center gap-1.5">
                    <span class="px-1.5 py-0.5 rounded-lg bg-sky-100 text-sky-700 text-[11px] font-semibold">${ex.num}</span>
                    <span class="px-1.5 py-0.5 rounded-lg border text-[11px] font-semibold ${ROOM_BADGE[ex.eraRoom]}">${roomLabel(ex.eraRoom)}</span>
                    <span class="text-[11px] font-medium text-marble-muted">· ${ex.year}</span>
                    ${stamped ? `<span class="px-1.5 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold">${t('stamped')}</span>` : ''}
                </span>
                <span class="text-[15px] font-semibold leading-snug text-marble-ink">${d.title}</span>
                <span class="text-xs font-medium text-sky-700 truncate">${d.street} · ${where}</span>
            </button>
            <button type="button" onclick="event.stopPropagation(); app.openExhibit(${ex.id})" aria-label="${t('open')}" class="shrink-0 w-10 h-10 rounded-xl text-sky-400 hover:text-sky-700 hover:bg-sky-50 flex items-center justify-center transition">${icon('chevronRight', 'w-5 h-5')}</button>
        </div>`;
}

/** How far the sheet's rounded top reaches over the visible map edge. */
const SHEET_OVERLAP = 24;
/** A drag faster than this (px per ms) decides the direction on its own. */
const FLING_SPEED = 0.5;
const SHEET_EASE = 'transform 0.32s cubic-bezier(.22, 1, .36, 1)';

/**
 * The sheet over the map. Drag its top strip (handle + title row) down to
 * leave only that strip showing, and up to bring the list back. A tap on the
 * strip, or Enter/Space on the handle, does the same.
 */
function mountSheet(): void {
    const sheet = $('exSheet');
    const grab = $('exSheetGrab');
    const handle = $('exSheetHandle');
    if (!sheet || !grab || !handle) return;

    let collapsed = false;
    let drag: { id: number; startY: number; from: number; at: number; moved: boolean; lastY: number; lastT: number; speed: number } | null = null;

    const peek = (): number => grab.offsetHeight;
    const travel = (): number => Math.max(0, sheet.offsetHeight - peek());

    // The map is only as tall as the part the sheet leaves visible, so centring,
    // fitting and the pan limits all work on what you can see. While the sheet
    // moves, the map reaches the bottom of the screen, so nothing blank shows.
    const mapHost = $('exMap');
    let shrinkTimer = 0;
    // (a height, not `bottom`: MapLibre makes its container position:relative)
    const setMapBottom = (px: number): void => {
        if (mapHost) mapHost.style.height = `calc(100% - ${Math.max(0, Math.round(px))}px)`;
    };
    const fitMapToSheet = (): void => {
        if (drag?.moved || sheet.offsetHeight === 0) return; // moving, or the screen is hidden
        setMapBottom((collapsed ? peek() : sheet.offsetHeight) - SHEET_OVERLAP);
    };

    const settle = (next: boolean): void => {
        collapsed = next;
        sheet.style.transition = SHEET_EASE;
        // In % of the sheet's own height, so it stays right if the screen resizes.
        sheet.style.transform = collapsed ? `translateY(calc(100% - ${peek()}px))` : '';
        handle.setAttribute('aria-expanded', String(!collapsed));
        window.clearTimeout(shrinkTimer);
        // Collapsing: the map grows now and the sheet slides off it. Expanding:
        // the map shrinks once the sheet has slid over it.
        if (collapsed) fitMapToSheet();
        else shrinkTimer = window.setTimeout(fitMapToSheet, 340);
    };

    grab.addEventListener('pointerdown', (e) => {
        if (e.button !== 0 || (e.target as Element).closest('label, select')) return;
        const from = collapsed ? travel() : 0;
        drag = { id: e.pointerId, startY: e.clientY, from, at: from, moved: false, lastY: e.clientY, lastT: e.timeStamp, speed: 0 };
        grab.setPointerCapture(e.pointerId);
    });

    grab.addEventListener('pointermove', (e) => {
        if (!drag || e.pointerId !== drag.id) return;
        const dy = e.clientY - drag.startY;
        if (!drag.moved && Math.abs(dy) < 6) return;
        if (!drag.moved) {
            window.clearTimeout(shrinkTimer);
            setMapBottom(0); // full height under the sheet while it follows the finger
        }
        drag.moved = true;
        const dt = e.timeStamp - drag.lastT;
        if (dt > 0) drag.speed = (e.clientY - drag.lastY) / dt;
        drag.lastY = e.clientY;
        drag.lastT = e.timeStamp;
        drag.at = Math.min(travel(), Math.max(0, drag.from + dy));
        sheet.style.transition = 'none';
        sheet.style.transform = `translateY(${drag.at}px)`;
    });

    const end = (e: PointerEvent): void => {
        if (!drag || e.pointerId !== drag.id) return;
        const d = drag;
        drag = null;
        if (e.type === 'pointercancel') return settle(collapsed);
        if (!d.moved) return settle(!collapsed); // a tap on the strip
        if (Math.abs(d.speed) > FLING_SPEED) return settle(d.speed > 0);
        settle(d.at > travel() / 2);
    };
    grab.addEventListener('pointerup', end);
    grab.addEventListener('pointercancel', end);

    // Keyboard: the handle is a button (a pointer tap is handled above).
    handle.addEventListener('click', (e) => {
        if (e.detail === 0) settle(!collapsed);
    });

    new ResizeObserver(fitMapToSheet).observe(sheet);
    fitMapToSheet();
}

export function mountExplore(): void {
    mountSheet(); // first, so the map starts at its visible size
    const host = $('exMap');
    const northBtn = $('exNorthBtn');
    const needle = $('exNorthNeedle');
    const onBearing = (bearing: number): void => {
        const turned = Math.abs(bearing) > 0.5;
        northBtn?.classList.toggle('hidden', !turned);
        northBtn?.classList.toggle('flex', turned);
        if (needle) needle.style.transform = `rotate(${-bearing}deg)`;
    };
    if (host) void mountStreetMap(host, (id) => app.openExhibit(id), { keepTopOnResize: true, onBearing, onPickStop: (layer, id) => app.openMapCard(layer, id) });

    view(
        (s, u) => [s.lang, s.eraFilter, s.exhibitId, s.gps, s.coords, s.demoMode, u.mapPlace, u.mapLayers, u.mapCard],
        (s, u) => updateStreetMap(mapView(s, u)),
    );

    // The layers button and its panel.
    view(
        (s, u) => [s.lang, u.mapLayers, u.mapLayersPanel],
        (s, u) => {
            const anyOn = u.mapLayers.metro || u.mapLayers.venue;
            const dot = anyOn ? '<span class="absolute -top-1 -right-1 w-[11px] h-[11px] rounded-full bg-sky-600 border-2 border-white"></span>' : '';
            setHtml('exLayersBtn', icon('layers', 'w-5 h-5') + dot);
            $('exLayersBtn')?.setAttribute('aria-label', t('layersButton'));
            $('exLayersBtn')?.setAttribute('aria-expanded', String(u.mapLayersPanel));
            setHidden('exLayersPanel', !u.mapLayersPanel);
            if (u.mapLayersPanel) setHtml('exLayersPanel', layersPanel(u));
        },
    );

    // The card of a tapped station or venue.
    view(
        (s, u) => [s.lang, u.mapCard],
        (s, u) => {
            const card = mapCard(s, u);
            setHidden('exMapCard', card === '');
            setHtml('exMapCard', card);
        },
    );

    // GPS pill: green when on, pulsing while locating, amber when blocked or in Demo Mode.
    view(
        (s) => [s.lang, s.gps, s.demoMode],
        (s) => {
            let dot = 'bg-slate-400';
            let label = t('gpsPillOff');
            if (s.demoMode) [dot, label] = ['bg-amber-500', t('gpsDemoPill')];
            else if (s.gps === 'active') [dot, label] = ['bg-emerald-500', t('gpsPillOn')];
            else if (s.gps === 'acquiring') [dot, label] = ['bg-sky-500 animate-pulse', t('gpsPillLocating')];
            else if (s.gps !== 'off') [dot, label] = ['bg-amber-500', t('gpsPillBlocked')];
            setClass('exGpsDot', `w-2 h-2 rounded-full ${dot}`);
            setText('exGpsText', label);
            $('exGpsBtn')?.setAttribute('aria-label', t('gpsPillAria'));
        },
    );

    view(
        (s) => [s.lang],
        () => {
            setText('exCredit', t('mapCreditShort'));
            $('exEraSelect')?.setAttribute('aria-label', t('eraFilterLabel'));
        },
    );

    // Exhibit count and the era filter (its options count per era).
    view(
        (s) => [s.lang, s.eraFilter],
        (s) => {
            const shown = exhibitsData.filter((ex) => matchesFilters(ex, s)).length;
            setText('exCount', t(shown === 1 ? 'exCountOne' : 'exCount', { n: shown }));
            const era = ERAS.find((e) => e.id === s.eraFilter) ?? ERAS[0];
            setClass('exEraPill', `${ERA_PILL} ${era.pill}`);
            setClass('exEraDot', `w-2 h-2 rounded-full shrink-0 ${era.dot}`);
            setText('exEraText', era.id === 'all' ? t('eraPillAll') : era.label());
            setHtml(
                'exEraSelect',
                ERAS.map((e) => {
                    const n = exhibitsData.filter((ex) => matchesFilters(ex, { ...s, eraFilter: e.id })).length;
                    const label = e.id === 'all' ? t('eraAll') : e.label();
                    return `<option value="${e.id}" ${e.id === s.eraFilter ? 'selected' : ''}>${label} (${n})</option>`;
                }).join(''),
            );
        },
    );

    // Featured card + list, sorted by distance when the position is known.
    view(
        (s) => [s.lang, s.eraFilter, s.exhibitId, s.stamps, s.gps, s.coords, s.demoMode],
        (s) => {
            const shown = exhibitsData.filter((ex) => matchesFilters(ex, s));
            if (shown.length === 0) {
                setHtml('exList', `<p class="py-6 text-center text-sm text-marble-muted">${t('listEmpty')}</p>`);
                return;
            }
            const withDist = shown.map((ex) => ({ ex, m: metresTo(ex, s) }));
            const located = withDist[0].m !== null;
            if (located) withDist.sort((a, b) => (a.m ?? 0) - (b.m ?? 0));
            const featured = located ? withDist[0] : (withDist.find((e) => e.ex.id === s.exhibitId) ?? withDist[0]);
            const rest = withDist.filter((e) => e !== featured);
            setHtml('exList', featuredCard(featured.ex, s, featured.m) + rest.map((e) => rowCard(e.ex, s, e.m)).join(''));
        },
    );
}

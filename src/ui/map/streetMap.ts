// The street map on the Explore screen: a real, offline map of Athens
// (MapLibre drawing bundled OpenStreetMap tiles) with the exhibits, museum
// rooms, corridors and the visitor on it.
//
// Like the 3D engine, this is a drawing module: it is given a container and a
// plain description of what to show (`MapView`), and never reads the store.
// Pan with one finger, zoom by pinching, double-tapping or the + / − buttons.
import 'maplibre-gl/dist/maplibre-gl.css';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import type { GeoJSONSource, LngLatBoundsLike, Map as MapLibreMap, Marker } from 'maplibre-gl';
import { MAP_BBOX, ringCentre, roomOutline, type LngLat } from '../../data/mapAreas';
import type { Feature, FeatureCollection } from 'geojson';
import type { CorridorId, EraRoom, Lang } from '../../data/types';
import { buildStyle, corridorColour, NAME_LAYERS, nameField, ROOM_COLOURS, roomOpacity } from './style';

export interface MapPinView {
    id: number;
    num: string;
    label: string;
    room: EraRoom;
    lat: number;
    lng: number;
    /** outside the current room / corridor filter */
    dimmed: boolean;
}

export interface MapView {
    lang: Lang;
    eraFilter: EraRoom | 'all';
    corridorFilter: CorridorId | 'all';
    selectedId: number;
    pins: MapPinView[];
    user: { lat: number; lng: number; demo: boolean; label: string } | null;
    roomLabels: Record<EraRoom, string>;
    /** shown instead of the map if the device cannot draw it */
    unavailableText: string;
}

/** Pin name plates appear from this zoom up; below it they would overlap. */
const LABEL_ZOOM = 12.8;
/** Room outlines are drawn this far (metres) around their exhibits. */
const ROOM_MARGIN_M = 170;
// Keeps pins clear of the edges and of the zoom buttons that float over the map.
const FIT_PADDING = { top: 56, bottom: 62, left: 40, right: 48 };

let map: MapLibreMap | null = null;
let ready = false;
let host: HTMLElement | null = null;
let view: MapView | null = null;
let MarkerClass: typeof Marker | null = null;
let onPickPin: (id: number) => void = () => {};

const pinMarkers = new Map<number, { marker: Marker; el: HTMLButtonElement; label: HTMLSpanElement }>();
let userMarker: { marker: Marker; el: HTMLDivElement; label: HTMLSpanElement } | null = null;

let fittedFor = '';
let fitPending = false;
let labelsFor = '';
let ancientRing: LngLat[] | null = null;

const assetBase = (): string => new URL('map/', document.baseURI).href;

async function loadJson(name: string): Promise<FeatureCollection | null> {
    try {
        const res = await fetch(`${assetBase()}city/${name}.geojson`);
        return res.ok ? ((await res.json()) as FeatureCollection) : null;
    } catch {
        return null;
    }
}

const source = (id: string): GeoJSONSource | undefined => map?.getSource(id) as GeoJSONSource | undefined;

/** Outer ring of the first polygon of a Polygon / MultiPolygon feature. */
function outerRing(feature: Feature | undefined): LngLat[] | null {
    const g = feature?.geometry;
    if (g?.type === 'Polygon') return g.coordinates[0] as LngLat[];
    if (g?.type === 'MultiPolygon') return g.coordinates[0][0] as LngLat[];
    return null;
}

export interface StreetMapOptions {
    /**
     * When only the map's height changes (a panel below it grows or shrinks),
     * keep what is at the top of the map where it is, instead of keeping the
     * centre (which would make the whole map jump by half the change).
     */
    keepTopOnResize?: boolean;
}

export async function mountStreetMap(container: HTMLElement, onPick: (id: number) => void, options: StreetMapOptions = {}): Promise<void> {
    if (host) return;
    host = container;
    onPickPin = onPick;
    try {
        const ml = await import('maplibre-gl');
        ml.setWorkerUrl(workerUrl);
        MarkerClass = ml.Marker;
        const [west, south, east, north] = MAP_BBOX;
        map = new ml.Map({
            container,
            style: buildStyle(assetBase(), view?.lang ?? 'el'),
            center: [23.7245, 37.9815],
            zoom: 12.4,
            minZoom: 11,
            maxZoom: 18.5,
            maxBounds: [
                [west, south],
                [east, north],
            ],
            attributionControl: false, // credited in the caption under the map
            dragRotate: false,
            pitchWithRotate: false,
            touchPitch: false,
            keyboard: false,
        });
    } catch (err) {
        console.warn('Street map unavailable', err);
        container.textContent = view?.unavailableText ?? '';
        container.classList.add('map-unavailable');
        return;
    }
    // North stays up: two fingers zoom, they do not twist the map.
    map.touchZoomRotate.disableRotation();

    map.on('zoom', syncLabelVisibility);
    map.on('load', () => {
        ready = true;
        void loadAreas();
        apply();
    });

    // The screen can be hidden when the map starts, and the phone can rotate.
    let lastW = 0;
    let lastH = 0;
    new ResizeObserver(() => {
        if (!map || !host || host.clientWidth === 0) return;
        const w = host.clientWidth;
        const h = host.clientHeight;
        map.resize();
        if (options.keepTopOnResize && lastH > 0 && w === lastW && h !== lastH) {
            // resize() kept the centre, which moved everything down by half the change: undo that
            map.panBy([0, (h - lastH) / 2], { duration: 0 });
        }
        lastW = w;
        lastH = h;
        if (fitPending) fitToFocus(false);
    }).observe(container);
}

/** Describe what the map should show. Safe to call before the map has loaded. */
export function updateStreetMap(next: MapView): void {
    view = next;
    if (ready) apply();
    else if (host?.classList.contains('map-unavailable')) host.textContent = next.unavailableText;
}

export function zoomStreetMap(steps: number): void {
    map?.easeTo({ zoom: map.getZoom() + steps, duration: 250 });
}

/** Zoom used when the map moves to one exhibit. */
const FOCUS_ZOOM = 16;

/** Move the map to one point, centred in the part not covered by a panel. */
export function focusStreetMapOn(lat: number, lng: number): void {
    if (!map || !host || host.clientWidth === 0) return;
    map.easeTo({ center: [lng, lat], zoom: Math.max(map.getZoom(), FOCUS_ZOOM), duration: 600 });
}

async function loadAreas(): Promise<void> {
    const [districts, acropolis] = await Promise.all([loadJson('districts'), loadJson('acropolis-zone')]);
    if (districts) {
        source('districts')?.setData(districts);
        source('district-labels')?.setData({
            type: 'FeatureCollection',
            features: districts.features.flatMap((f): Feature[] => {
                const ring = outerRing(f);
                return ring ? [{ type: 'Feature', properties: { label: String(f.properties?.name ?? '') }, geometry: { type: 'Point', coordinates: ringCentre(ring) } }] : [];
            }),
        });
    }
    ancientRing = outerRing(acropolis?.features[0]);
    labelsFor = '';
    drawRooms();
}

/** Rooms: the Ancient one is the official Acropolis protection zone; the others wrap their exhibits. */
function drawRooms(): void {
    if (!view || !ready) return;
    const key = `${view.lang}|${ancientRing ? 1 : 0}`;
    if (key === labelsFor) return;
    labelsFor = key;
    const rings: Record<EraRoom, LngLat[]> = {
        ancient: ancientRing ?? roomOutline('ancient', ROOM_MARGIN_M),
        byzantine: roomOutline('byzantine', ROOM_MARGIN_M),
        modern: roomOutline('modern', ROOM_MARGIN_M),
    };
    const rooms = Object.keys(rings) as EraRoom[];
    source('rooms')?.setData({
        type: 'FeatureCollection',
        features: rooms.map((room) => ({
            type: 'Feature',
            properties: { room, fill: ROOM_COLOURS[room].fill, line: ROOM_COLOURS[room].line },
            geometry: { type: 'Polygon', coordinates: [rings[room]] },
        })),
    });
    const labels = view.roomLabels;
    source('room-labels')?.setData({
        type: 'FeatureCollection',
        features: rooms.map((room) => ({
            type: 'Feature',
            properties: { room, label: labels[room], text: ROOM_COLOURS[room].text },
            geometry: { type: 'Point', coordinates: ringCentre(rings[room]) },
        })),
    });
}

function apply(): void {
    if (!map || !view) return;
    for (const id of NAME_LAYERS) map.setLayoutProperty(id, 'text-field', nameField(view.lang));
    map.setPaintProperty('corridors', 'line-color', corridorColour(view.corridorFilter));
    map.setPaintProperty('rooms-fill', 'fill-opacity', roomOpacity(view.eraFilter));
    map.setPaintProperty('pireos-axis', 'fill-opacity', view.corridorFilter === 'all' || view.corridorFilter === 'peiraios' ? 0.1 : 0.03);
    drawRooms();
    drawPins();
    drawUser();
    syncLabelVisibility();

    const filterKey = `${view.eraFilter}|${view.corridorFilter}`;
    if (filterKey !== fittedFor) {
        const first = fittedFor === '';
        fittedFor = filterKey;
        fitToFocus(!first);
    }
}

function drawPins(): void {
    if (!map || !view || !MarkerClass) return;
    for (const pin of view.pins) {
        let entry = pinMarkers.get(pin.id);
        if (!entry) {
            const el = document.createElement('button');
            el.type = 'button';
            const label = document.createElement('span');
            label.className = 'map-pin__label';
            const dot = document.createElement('span');
            dot.className = 'map-pin__dot';
            dot.textContent = pin.num;
            el.append(label, dot);
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                onPickPin(pin.id);
            });
            entry = { el, label, marker: new MarkerClass({ element: el, anchor: 'center' }).setLngLat([pin.lng, pin.lat]).addTo(map) };
            pinMarkers.set(pin.id, entry);
        }
        const selected = pin.id === view.selectedId;
        // MapLibre adds its own classes to the element, so toggle ours one by one.
        const cl = entry.el.classList;
        cl.add('map-pin');
        for (const room of ['ancient', 'byzantine', 'modern']) cl.toggle(`map-pin--${room}`, room === pin.room);
        cl.toggle('is-selected', selected);
        cl.toggle('is-dimmed', pin.dimmed);
        entry.el.style.zIndex = selected ? '3' : pin.dimmed ? '1' : '2';
        entry.el.setAttribute('aria-label', `${pin.num} ${pin.label}`);
        if (entry.label.textContent !== pin.label) entry.label.textContent = pin.label;
    }
}

function drawUser(): void {
    if (!map || !view || !MarkerClass) return;
    if (!view.user) {
        userMarker?.marker.remove();
        userMarker = null;
        return;
    }
    if (!userMarker) {
        const el = document.createElement('div');
        const pulse = document.createElement('span');
        pulse.className = 'map-user__pulse';
        const dot = document.createElement('span');
        dot.className = 'map-user__dot';
        const label = document.createElement('span');
        label.className = 'map-user__label';
        el.append(pulse, dot, label);
        userMarker = { el, label, marker: new MarkerClass({ element: el, anchor: 'center' }).setLngLat([view.user.lng, view.user.lat]).addTo(map) };
    }
    userMarker.marker.setLngLat([view.user.lng, view.user.lat]);
    userMarker.el.classList.add('map-user');
    userMarker.el.classList.toggle('map-user--demo', view.user.demo);
    if (userMarker.label.textContent !== view.user.label) userMarker.label.textContent = view.user.label;
}

function syncLabelVisibility(): void {
    if (map && host) host.classList.toggle('map-labels-on', map.getZoom() >= LABEL_ZOOM);
}

function fitToFocus(animate: boolean): void {
    if (!map || !view || !host) return;
    if (host.clientWidth === 0) {
        fitPending = true; // hidden screen: do it when the map becomes visible
        return;
    }
    fitPending = false;
    const shown = view.pins.filter((p) => !p.dimmed);
    const pins = shown.length > 0 ? shown : view.pins;
    if (pins.length === 0) return;
    const lngs = pins.map((p) => p.lng);
    const lats = pins.map((p) => p.lat);
    const bounds: LngLatBoundsLike = [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
    ];
    map.fitBounds(bounds, { padding: FIT_PADDING, maxZoom: 16, duration: animate ? 600 : 0 });
}

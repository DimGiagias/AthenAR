// The look of the street map: OpenStreetMap data drawn in the app's own
// sky-and-marble palette, with the museum rooms and the City's
// district boundaries on top. Pure data: no map instance, no DOM.
import type { ExpressionSpecification, LayerSpecification, StyleSpecification } from 'maplibre-gl';
import { MAP_BBOX, MAP_TILE_MAX_ZOOM, MAP_TILE_MIN_ZOOM } from '../../data/mapAreas';
import type { FeatureCollection } from 'geojson';
import type { EraRoom, Lang } from '../../data/types';

const C = {
    land: '#F1F7FD',
    green: '#DBF0E2',
    plaza: '#FAFCFE',
    water: '#BFE3FA',
    building: '#E2EAF4',
    buildingEdge: '#D2DDEB',
    road: '#FFFFFF',
    roadEdge: '#C7D8EA',
    highway: '#FFF4D9',
    highwayEdge: '#EBD39A',
    rail: '#B6C2D2',
    path: '#C3CFDE',
    roadText: '#5B6B80',
    placeText: '#1E3A5F',
    halo: '#FFFFFF',
    pireosAxis: '#38BDF8',
};

export const ROOM_COLOURS: Record<EraRoom, { fill: string; line: string; text: string }> = {
    ancient: { fill: '#FCD34D', line: '#D97706', text: '#92400E' },
    byzantine: { fill: '#818CF8', line: '#4F46E5', text: '#3730A3' },
    modern: { fill: '#38BDF8', line: '#0284C7', text: '#0369A1' },
};

const GREEN_KINDS = [
    'park', 'garden', 'grass', 'wood', 'forest', 'cemetery', 'scrub', 'pitch', 'playground',
    'recreation_ground', 'village_green', 'grassland', 'meadow', 'nature_reserve', 'dog_park', 'allotments',
];

const EMPTY: FeatureCollection = { type: 'FeatureCollection', features: [] };

/** A line width that grows with zoom: pairs of zoom, pixels. */
const width = (...stops: number[]): ExpressionSpecification => ['interpolate', ['exponential', 1.6], ['zoom'], ...stops] as ExpressionSpecification;

export function nameField(lang: Lang): ExpressionSpecification {
    return lang === 'en' ? ['coalesce', ['get', 'name:en'], ['get', 'name']] : ['get', 'name'];
}

/** Layers whose text follows the interface language. */
export const NAME_LAYERS = ['road-labels', 'place-labels'];

/** A road class as two layers: a slightly wider edge under a lighter centre. */
function road(id: string, kind: string, minzoom: number, stops: number[], edge: string, fill: string): [LayerSpecification, LayerSpecification] {
    const common = {
        type: 'line' as const,
        source: 'osm',
        'source-layer': 'roads',
        minzoom,
        filter: ['==', ['get', 'kind'], kind] as ExpressionSpecification,
        layout: { 'line-cap': 'round' as const, 'line-join': 'round' as const },
    };
    const inner = stops.map((v, i) => (i % 2 === 1 ? v * 0.76 : v));
    return [
        { ...common, id: `${id}-edge`, paint: { 'line-color': edge, 'line-width': width(...stops) } },
        { ...common, id, paint: { 'line-color': fill, 'line-width': width(...inner) } },
    ];
}

/** Room fill strength, with the rooms outside the current filter faded. */
export function roomOpacity(active: EraRoom | 'all'): ExpressionSpecification {
    const pick = (room: EraRoom): number => (active === 'all' || active === room ? 0.2 : 0.05);
    return ['match', ['get', 'room'], 'ancient', pick('ancient'), 'byzantine', pick('byzantine'), 'modern', pick('modern'), 0.05];
}

/** @param baseUrl absolute address of the public/map/ folder, ending in "/" */
export function buildStyle(baseUrl: string, lang: Lang): StyleSpecification {
    const roads = [
        road('road-minor', 'minor_road', 13, [13, 0.8, 15, 3.6, 18, 16], C.roadEdge, C.road),
        road('road-major', 'major_road', 10, [10, 0.9, 13, 2.8, 15, 7.5, 18, 26], C.roadEdge, C.road),
        road('road-highway', 'highway', 10, [10, 1.6, 13, 4, 15, 10, 18, 30], C.highwayEdge, C.highway),
    ];
    return {
        version: 8,
        glyphs: `${baseUrl}fonts/{fontstack}/{range}.pbf`,
        sources: {
            osm: {
                type: 'vector',
                tiles: [`${baseUrl}tiles/{z}/{x}/{y}.pbf`],
                minzoom: MAP_TILE_MIN_ZOOM,
                maxzoom: MAP_TILE_MAX_ZOOM,
                bounds: MAP_BBOX,
            },
            rooms: { type: 'geojson', data: EMPTY },
            'room-labels': { type: 'geojson', data: EMPTY },
            'pireos-axis': { type: 'geojson', data: `${baseUrl}city/pireos-axis.geojson` },
            districts: { type: 'geojson', data: EMPTY },
            'district-labels': { type: 'geojson', data: EMPTY },
        },
        layers: [
            { id: 'background', type: 'background', paint: { 'background-color': C.land } },
            { id: 'green', type: 'fill', source: 'osm', 'source-layer': 'landuse', filter: ['in', ['get', 'kind'], ['literal', GREEN_KINDS]], paint: { 'fill-color': C.green } },
            { id: 'plaza', type: 'fill', source: 'osm', 'source-layer': 'landuse', filter: ['==', ['get', 'kind'], 'pedestrian'], paint: { 'fill-color': C.plaza } },
            { id: 'water', type: 'fill', source: 'osm', 'source-layer': 'water', filter: ['==', ['geometry-type'], 'Polygon'], paint: { 'fill-color': C.water } },
            {
                id: 'buildings',
                type: 'fill',
                source: 'osm',
                'source-layer': 'buildings',
                minzoom: 14,
                paint: { 'fill-color': C.building, 'fill-outline-color': C.buildingEdge, 'fill-opacity': ['interpolate', ['linear'], ['zoom'], 14, 0.5, 15.5, 1] },
            },

            // The City's "historic axis of Pireos Street" (open data).
            { id: 'pireos-axis', type: 'fill', source: 'pireos-axis', paint: { 'fill-color': C.pireosAxis, 'fill-opacity': 0.1 } },
            // Museum rooms.
            { id: 'rooms-fill', type: 'fill', source: 'rooms', paint: { 'fill-color': ['get', 'fill'], 'fill-opacity': roomOpacity('all') } },

            { id: 'rail', type: 'line', source: 'osm', 'source-layer': 'roads', minzoom: 12, filter: ['==', ['get', 'kind'], 'rail'], paint: { 'line-color': C.rail, 'line-width': 1, 'line-dasharray': [4, 2] } },
            {
                id: 'paths',
                type: 'line',
                source: 'osm',
                'source-layer': 'roads',
                minzoom: 15,
                filter: ['==', ['get', 'kind'], 'path'],
                paint: { 'line-color': C.path, 'line-width': width(15, 0.8, 18, 3), 'line-dasharray': [2, 1.5] },
            },
            ...roads.map((r) => r[0]),
            ...roads.map((r) => r[1]),

            { id: 'rooms-line', type: 'line', source: 'rooms', paint: { 'line-color': ['get', 'line'], 'line-width': 1.4, 'line-dasharray': [3, 2], 'line-opacity': 0.9 } },
            // Municipal districts of the City of Athens (open data).
            { id: 'districts-line', type: 'line', source: 'districts', paint: { 'line-color': '#94A3B8', 'line-width': 1, 'line-opacity': 0.7 } },

            {
                id: 'road-labels',
                type: 'symbol',
                source: 'osm',
                'source-layer': 'roads',
                minzoom: 14,
                filter: ['in', ['get', 'kind'], ['literal', ['minor_road', 'major_road', 'highway']]],
                layout: {
                    'symbol-placement': 'line',
                    'text-field': nameField(lang),
                    'text-font': ['regular'],
                    'text-size': ['interpolate', ['linear'], ['zoom'], 14, 9.5, 17, 12.5],
                    'symbol-spacing': 260,
                },
                paint: { 'text-color': C.roadText, 'text-halo-color': C.halo, 'text-halo-width': 1.4 },
            },
            {
                id: 'place-labels',
                type: 'symbol',
                source: 'osm',
                'source-layer': 'places',
                minzoom: 12,
                filter: ['in', ['get', 'kind'], ['literal', ['neighbourhood', 'macrohood', 'locality']]],
                layout: {
                    'text-field': nameField(lang),
                    'text-font': ['medium'],
                    'text-size': ['interpolate', ['linear'], ['zoom'], 12, 10, 16, 13],
                    'text-max-width': 7,
                    'text-padding': 6,
                },
                paint: { 'text-color': C.placeText, 'text-halo-color': C.halo, 'text-halo-width': 1.5, 'text-opacity': 0.85 },
            },
            {
                id: 'district-labels',
                type: 'symbol',
                source: 'district-labels',
                maxzoom: 13.8,
                layout: { 'text-field': ['get', 'label'], 'text-font': ['medium'], 'text-size': 11 },
                paint: { 'text-color': '#475569', 'text-halo-color': C.halo, 'text-halo-width': 1.6 },
            },
            {
                id: 'room-labels',
                type: 'symbol',
                source: 'room-labels',
                minzoom: 12.6,
                maxzoom: 15.5,
                layout: { 'text-field': ['get', 'label'], 'text-font': ['medium'], 'text-size': 10.5, 'text-max-width': 9, 'text-letter-spacing': 0.04 },
                paint: { 'text-color': ['get', 'text'], 'text-halo-color': C.halo, 'text-halo-width': 1.8 },
            },
        ],
    };
}

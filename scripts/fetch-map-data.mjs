// Download everything the offline street map needs into public/map/:
//
//   node scripts/fetch-map-data.mjs            (all steps)
//   node scripts/fetch-map-data.mjs tiles      (one step: tiles | fonts | city | streets)
//
// The results are committed, so this only needs re-running to refresh the map
// or change its area. Sources and licences:
//   tiles    Protomaps daily build of OpenStreetMap    © OpenStreetMap contributors, ODbL
//   fonts    Noto Sans glyphs from protomaps/basemaps-assets          SIL Open Font License
//   city     City of Athens open data, gis.cityofathens.gr / opendata.cityofathens.gr
//   streets  OpenStreetMap via the Overpass API        © OpenStreetMap contributors, ODbL
import fs from 'node:fs';
import path from 'node:path';
import { fromVectorTileJs } from '@maplibre/vt-pbf';
import { VectorTile } from '@mapbox/vector-tile';
import { PbfReader } from 'pbf';
import { PMTiles } from 'pmtiles';

const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, 'public/map');

/** Area covered: the Municipality of Athens with a small margin. [west, south, east, north] */
const BBOX = [23.675, 37.945, 23.79, 38.045];
const MIN_ZOOM = 10;
const MAX_ZOOM = 15; // the map over-zooms beyond this, so street level stays sharp enough

const step = process.argv[2] ?? 'all';
const isMain = process.argv[1] && path.resolve(process.argv[1]) === import.meta.filename;
const wants = (name) => step === 'all' || step === name;

const write = (file, data) => {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, data);
};
const get = async (url, init) => {
    const res = await fetch(url, { ...init, signal: AbortSignal.timeout(120000) });
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    return res;
};

const lngToX = (lng, z) => Math.floor(((lng + 180) / 360) * 2 ** z);
const latToY = (lat, z) => {
    const r = (lat * Math.PI) / 180;
    return Math.floor(((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * 2 ** z);
};

/**
 * What the app's map style actually draws: layer -> properties to keep.
 * Everything else (shop and bus-stop points, house numbers, names in forty
 * languages...) is dropped, which cuts the download to roughly a third.
 */
const KEEP = {
    earth: ['kind'],
    water: ['kind', 'name', 'name:en'],
    landuse: ['kind'],
    roads: ['kind', 'kind_detail', 'name', 'name:en', 'is_tunnel'],
    buildings: ['kind'],
    places: ['kind', 'name', 'name:en', 'min_zoom', 'population_rank'],
};

const LATIN = { α: 'a', β: 'v', γ: 'g', δ: 'd', ε: 'e', ζ: 'z', η: 'i', θ: 'th', ι: 'i', κ: 'k', λ: 'l', μ: 'm', ν: 'n', ξ: 'x', ο: 'o', π: 'p', ρ: 'r', σ: 's', ς: 's', τ: 't', υ: 'y', φ: 'f', χ: 'ch', ψ: 'ps', ω: 'o' };

/**
 * Greek name in Latin letters, the way Athens street signs spell them
 * (ELOT 743, simplified). OpenStreetMap has an English name for very few
 * streets, so the English interface would otherwise show Greek only.
 */
export function toLatin(name) {
    const s = name.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // drop accents
    const allCaps = name === name.toUpperCase();
    const lower = (i) => (s[i] ?? '').toLowerCase();
    let out = '';
    for (let i = 0; i < s.length; i++) {
        const c = lower(i);
        const next = lower(i + 1);
        const pair = c !== '' && ((c === 'ο' && next === 'υ') || ('αεη'.includes(c) && next === 'υ') || (c === 'γ' && next === 'γ') || (c === 'μ' && next === 'π'));
        let r;
        if (c === 'ο' && next === 'υ') r = 'ou';
        else if ('αεη'.includes(c) && c !== '' && next === 'υ') r = LATIN[c] + ('θκξπστφχψ'.includes(lower(i + 2)) || !/\p{L}/u.test(lower(i + 2)) ? 'f' : 'v');
        else if (c === 'γ' && next === 'γ') r = 'ng';
        else if (c === 'μ' && next === 'π') r = i === 0 || !/\p{L}/u.test(s[i - 1]) ? 'b' : 'mp';
        else r = LATIN[c];
        if (r === undefined) {
            out += s[i];
            continue;
        }
        const upper = s[i] !== c;
        if (pair) i++; // two Greek letters were used
        out += allCaps ? r.toUpperCase() : upper ? r[0].toUpperCase() + r.slice(1) : r;
    }
    return out;
}

function slim(data) {
    const tile = new VectorTile(new PbfReader(data));
    const layers = {};
    for (const [name, keep] of Object.entries(KEEP)) {
        const layer = tile.layers[name];
        if (!layer) continue;
        const features = [];
        for (let i = 0; i < layer.length; i++) {
            const f = layer.feature(i);
            if (name === 'buildings' && f.properties.kind !== 'building') continue; // drop address points
            const properties = {};
            for (const key of keep) if (f.properties[key] !== undefined) properties[key] = f.properties[key];
            if (keep.includes('name:en') && properties.name && !properties['name:en'] && /[\u0370-\u03ff]/.test(properties.name)) {
                properties['name:en'] = toLatin(properties.name);
            }
            features.push({ id: f.id, type: f.type, properties, loadGeometry: () => f.loadGeometry() });
        }
        layers[name] = { version: layer.version, name, extent: layer.extent, length: features.length, feature: (i) => features[i] };
    }
    return Buffer.from(fromVectorTileJs({ layers }));
}

async function tiles() {
    const builds = await (await get('https://build-metadata.protomaps.dev/builds.json')).json();
    const build = builds.at(-1).key;
    const archive = new PMTiles(`https://build.protomaps.com/${build}`);
    fs.rmSync(path.join(out, 'tiles'), { recursive: true, force: true });
    let count = 0;
    let bytes = 0;
    for (let z = MIN_ZOOM; z <= MAX_ZOOM; z++) {
        for (let x = lngToX(BBOX[0], z); x <= lngToX(BBOX[2], z); x++) {
            for (let y = latToY(BBOX[3], z); y <= latToY(BBOX[1], z); y++) {
                const tile = await archive.getZxy(z, x, y);
                if (!tile) continue;
                const data = slim(new Uint8Array(tile.data));
                write(path.join(out, 'tiles', String(z), String(x), `${y}.pbf`), data);
                count++;
                bytes += data.length;
            }
        }
    }
    write(path.join(out, 'tiles.json'), JSON.stringify({ build, bbox: BBOX, minzoom: MIN_ZOOM, maxzoom: MAX_ZOOM }, null, 2) + '\n');
    console.log(`tiles: ${count} files, ${(bytes / 1048576).toFixed(1)} MB, build ${build}`);
}

async function fonts() {
    // Latin, Latin Extended, Greek, Greek Extended, punctuation.
    const ranges = ['0-255', '256-511', '768-1023', '7936-8191', '8192-8447'];
    for (const [dir, name] of [['regular', 'Noto Sans Regular'], ['medium', 'Noto Sans Medium']]) {
        for (const range of ranges) {
            const res = await get(`https://protomaps.github.io/basemaps-assets/fonts/${encodeURIComponent(name)}/${range}.pbf`);
            write(path.join(out, 'fonts', dir, `${range}.pbf`), Buffer.from(await res.arrayBuffer()));
        }
    }
    console.log('fonts: done');
}

/** Round coordinates to ~1 m and drop repeated points, to keep the files small. */
function tidy(coords) {
    if (typeof coords[0] === 'number') return [Math.round(coords[0] * 1e5) / 1e5, Math.round(coords[1] * 1e5) / 1e5];
    const done = coords.map(tidy);
    if (typeof done[0]?.[0] !== 'number') return done;
    return done.filter((p, i) => i === 0 || p[0] !== done[i - 1][0] || p[1] !== done[i - 1][1]);
}

async function city() {
    const wfs = 'http://gis.cityofathens.gr/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&outputFormat=json&srsName=EPSG%3A4326&typename=geonode%3A';
    const layers = { districts: 'dimotikes_koinotites0', 'pireos-axis': 'istoriko2021', 'acropolis-zone': 'buffer_efapa' };
    for (const [name, typename] of Object.entries(layers)) {
        const src = await (await get(wfs + typename)).json();
        const features = src.features.map((f) => ({ type: 'Feature', properties: f.properties, geometry: { type: f.geometry.type, coordinates: tidy(f.geometry.coordinates) } }));
        const file = path.join(out, 'city', `${name}.geojson`);
        write(file, JSON.stringify({ type: 'FeatureCollection', features }));
        console.log(`city: ${name} — ${features.length} features, ${(fs.statSync(file).size / 1024).toFixed(0)} KB`);
        console.log('   e.g.', JSON.stringify(features[0].properties).slice(0, 220), features[0].geometry.type, JSON.stringify(features[0].geometry.coordinates).slice(0, 60));
    }
}

/**
 * The three museum corridors as lines along the real streets.
 * Each rule: street names in OpenStreetMap + the stretch of them we use.
 */
const CORRIDORS = [
    // Pireos is called Panagi Tsaldari on its last stretch into Omonia.
    { id: 'peiraios', names: ['Πειραιώς', 'Παναγή Τσαλδάρη'], keep: ([lng]) => lng >= 23.7035 },
    { id: 'patision', names: ['Πατησίων'], keep: ([, lat]) => lat <= 38.0022 },
    { id: 'patision', names: ['Φωκίωνος Νέγρη'], keep: ([lng]) => lng <= 23.7385 },
    { id: 'athinas', names: ['Αθηνάς'], keep: () => true },
];

async function streets() {
    const names = CORRIDORS.flatMap((c) => c.names).join('|');
    const query = `[out:json][timeout:60];way["highway"]["name"~"^(${names})$"](37.955,23.69,38.012,23.745);out geom;`;
    // The public Overpass servers are often busy: try each in turn.
    const servers = ['https://overpass-api.de/api/interpreter', 'https://overpass.private.coffee/api/interpreter', 'https://maps.mail.ru/osm/tools/overpass/api/interpreter'];
    let data;
    for (const server of servers) {
        try {
            const res = await get(server, { method: 'POST', body: new URLSearchParams({ data: query }), headers: { 'User-Agent': 'map-data-build-script' } });
            data = await res.json();
            break;
        } catch (err) {
            console.log(`   ${server} failed (${err.message}), trying the next one`);
        }
    }
    if (!data) throw new Error('No Overpass server answered; try again later.');
    const features = [];
    for (const way of data.elements) {
        const rule = CORRIDORS.find((c) => c.names.includes(way.tags.name));
        const line = tidy(way.geometry.map((p) => [p.lon, p.lat])).filter(rule.keep);
        if (line.length >= 2) features.push({ type: 'Feature', properties: { corridor: rule.id }, geometry: { type: 'LineString', coordinates: line } });
    }
    const file = path.join(out, 'city', 'corridors.geojson');
    write(file, JSON.stringify({ type: 'FeatureCollection', features }));
    console.log(`streets: ${features.length} lines, ${(fs.statSync(file).size / 1024).toFixed(0)} KB`);
}

if (isMain) {
    if (wants('tiles')) await tiles();
    if (wants('fonts')) await fonts();
    if (wants('city')) await city();
    if (wants('streets')) await streets();
}

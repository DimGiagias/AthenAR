// For each exhibit, what the exhibit page's "Around the exhibit" sheet shows,
// and the metro stations of the explore map's layer, into src/data/areaData.ts:
//
//   node scripts/fetch-area-data.mjs
//
//   neighbourhood  the one the exhibit is in, with its page on the City's Citizen Hub
//   air            the City's air station in that neighbourhood, or else the one whose
//                  neighbourhood centre is nearest (the stations have an address but no
//                  coordinates); a second one within BACKUP_M stands in when it goes quiet
//   metro          the nearest metro station, and the next one if it is also within
//                  BACKUP_M or at most METRO_EXTRA_M farther than the nearest
//   stations       every metro station in the municipality, for the map
//
// The result is committed, so this only needs re-running when the exhibits move
// or to pick up changes in the City's data. Source: the City of Athens open data
// portal (opendata.cityofathens.gr), CC BY 4.0, through its CKAN API: the Athens
// Smart Neighbourhood datasets «Γειτονιές Αθήνας», «Περιβαλλοντικοί Σταθμοί —
// Μητρώο Συσχετίσεων Datasets» and «Περιβαλλοντικά Δεδομένα — Όλοι οι Σταθμοί»,
// and «Σταθμοί Μετρό, Τραμ, ΟΣΕ», served by the City's GIS server.
import fs from 'node:fs';
import path from 'node:path';
import { exhibitsData } from '../src/data/exhibits.ts';
import { toLatin } from './fetch-map-data.mjs';

const root = path.resolve(import.meta.dirname, '..');
const file = path.join(root, 'src/data/areaData.ts');

const PORTAL = 'https://opendata.cityofathens.gr';
const METRO_TITLE = 'Σταθμοί Μετρό, Τραμ, ΟΣΕ';
/** A second air or metro station is offered only this close to the exhibit (metres). */
const BACKUP_M = 500;
/** The second metro station is also offered when it is at most this much farther than the nearest (metres). */
const METRO_EXTRA_M = 300;
/** Air stations with no reading for this long are left out (out of service). */
const SILENT_DAYS = 7;

/** Greek names written in capitals in the City's data, with their accents. */
const GREEK = {
    ΓΚΑΖΟΧΩΡΙ: 'Γκαζοχώρι',
    'ΦΩΚΙΩΝΟΣ ΝΕΓΡΗ': 'Φωκίωνος Νέγρη',
    ΕΞΑΡΧΕΙΑ: 'Εξάρχεια',
    'ΕΜΠΟΡΙΚΟ ΚΕΝΤΡΟ': 'Εμπορικό Κέντρο',
    'ΜΟΝΑΣΤΗΡΑΚΙ-ΠΛΑΚΑ': 'Μοναστηράκι-Πλάκα',
    ΚΑΜΠΑ: 'Κάμπα',
    'ΑΡΧΑΙΟΛΟΓΙΚΟΣ ΧΩΡΟΣ ΑΚΡΟΠΟΛΗΣ-ΦΙΛΟΠΑΠΠΟΥ': 'Αρχαιολογικός χώρος Ακρόπολης-Φιλοπάππου',
    'ΑΓΙΑΣ ΑΙΚΑΤΕΡΙΝΗΣ': 'Αγίας Αικατερίνης',
    'ΠΛΑΤΕΙΑ ΚΑΝΑΡΗ': 'Πλατεία Κανάρη',
    ΜΟΥΣΕΙΟ: 'Μουσείο',
    ΜΕΤΑΞΟΥΡΓΕΙΟ: 'Μεταξουργείο',
    ΦΙΛΟΠΑΠΠΟΥ: 'Φιλοπάππου',
    ΠΕΤΡΑΛΩΝΑ: 'Πετράλωνα',
    ΚΕΡΑΜΕΙΚΟΣ: 'Κεραμεικός',
    ΘΗΣΕΙΟ: 'Θησείο',
    ΜΟΝΑΣΤΗΡΑΚΙ: 'Μοναστηράκι',
    ΟΜΟΝΟΙΑ: 'Ομόνοια',
    ΠΑΝΕΠΙΣΤΗΜΙΟ: 'Πανεπιστήμιο',
    ΣΥΝΤΑΓΜΑ: 'Σύνταγμα',
    ΑΚΡΟΠΟΛΗ: 'Ακρόπολη',
    ΒΙΚΤΩΡΙΑ: 'Βικτώρια',
    'ΑΓΙΟΣ ΝΙΚΟΛΑΟΣ': 'Άγιος Νικόλαος',
    'ΕΘΝΙΚΗ ΑΜΥΝΑ': 'Εθνική Άμυνα',
    ΚΑΤΕΧΑΚΗ: 'Κατεχάκη',
    ΠΑΝΟΡΜΟΥ: 'Πανόρμου',
    ΑΜΠΕΛΟΚΗΠΟΙ: 'Αμπελόκηποι',
    'ΜΕΓΑΡΟ ΜΟΥΣΙΚΗΣ': 'Μέγαρο Μουσικής',
    ΕΥΑΓΓΕΛΙΣΜΟΣ: 'Ευαγγελισμός',
    'ΣΥΓΓΡΟΥ-ΦΙΞ': 'Συγγρού-Φιξ',
    'ΣΤΑΘΜΟΣ ΛΑΡΙΣΗΣ': 'Σταθμός Λαρίσης',
    ΑΤΤΙΚΗ: 'Αττική',
    ΣΕΠΟΛΙΑ: 'Σεπόλια',
    'ΝΕΟΣ ΚΟΣΜΟΣ': 'Νέος Κόσμος',
    'ΑΓΙΟΣ ΙΩΑΝΝΗΣ': 'Άγιος Ιωάννης',
    'ΑΝΩ ΠΑΤΗΣΙΑ': 'Άνω Πατήσια',
    'ΑΓΙΟΣ ΕΛΕΥΘΕΡΙΟΣ': 'Άγιος Ελευθέριος',
    'ΚΑΤΩ ΠΑΤΗΣΙΑ': 'Κάτω Πατήσια',
    ΤΑΥΡΟΣ: 'Ταύρος',
    ΕΛΑΙΩΝΑΣ: 'Ελαιώνας',
};
/** English names where spelling the Greek in Latin letters would not read as a name. */
const ENGLISH = {
    'Αρχαιολογικός χώρος Ακρόπολης-Φιλοπάππου': 'Acropolis and Filopappou archaeological site',
    'Εμπορικό Κέντρο': 'Commercial Centre',
};
/** Shorter names for air stations whose registry name is long, by station id. */
const AIR_NAMES = {
    64: 'Πολιτιστικό Κέντρο Κυψέλης',
    108: 'Σεράφειο',
    110: 'Πλατεία Αυδή',
    111: 'Πλατεία Αγίας Αικατερίνης',
};

const greek = (caps) => {
    const name = caps.trim().replace(/\s+/g, ' ');
    if (GREEK[name]) return GREEK[name];
    console.warn(`  no accented name for «${name}»: add it to GREEK`);
    return name.charAt(0) + name.slice(1).toLowerCase();
};
const named = (el) => ({ el, en: ENGLISH[el] ?? toLatin(el) });

const api = async (action, params) => {
    const url = `${PORTAL}/api/3/action/${action}?${new URLSearchParams(params)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(120000) });
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    const body = await res.json();
    if (!body.success) throw new Error(`${action} failed: ${url}`);
    return body.result;
};
/** The datastore table of a portal dataset, by the dataset's name. */
const tableOf = async (dataset) => {
    const pkg = await api('package_show', { id: dataset });
    const table = pkg.resources.find((r) => r.datastore_active);
    if (!table) throw new Error(`no datastore table in ${dataset}`);
    return { id: table.id, url: `${PORTAL}/dataset/${pkg.name}` };
};
const rowsOf = async (table) => (await api('datastore_search', { resource_id: table, limit: '5000' })).records;

const metresBetween = ([lat1, lng1], [lat2, lng2]) => {
    const r = Math.PI / 180;
    const h = Math.sin(((lat2 - lat1) * r) / 2) ** 2 + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(((lng2 - lng1) * r) / 2) ** 2;
    return Math.round(2 * 6371000 * Math.asin(Math.sqrt(h)));
};
/** The rings of a WKT POLYGON or MULTIPOLYGON, as [lng, lat] points. */
const rings = (wkt) => [...wkt.matchAll(/\(([^()]+)\)/g)].map((m) => m[1].split(',').map((p) => p.trim().split(/\s+/).map(Number)));
const inside = ([lat, lng], ring) => {
    let hit = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const [xi, yi] = ring[i];
        const [xj, yj] = ring[j];
        if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) hit = !hit;
    }
    return hit;
};

// --- the City's data ---
const hoodsTable = await tableOf('neighbourhoods-athens');
const hoods = await rowsOf(hoodsTable.id);
const registry = await rowsOf((await tableOf('env-stations-registry')).id);
const readings = await tableOf('env-all-stations');
console.log(`${hoods.length} neighbourhoods, ${registry.length} air stations`);

// The latest reading of each air station, to leave out those out of service.
const latest = new Map();
for (let i = 0; i < registry.length; i += 10) {
    await Promise.all(
        registry.slice(i, i + 10).map(async (s) => {
            const r = await api('datastore_search', { resource_id: readings.id, filters: JSON.stringify({ station_id: s.station_id }), sort: 'interval_timestamp desc', limit: '1', fields: 'interval_timestamp' });
            latest.set(s.station_id, r.records[0] ? Date.parse(`${r.records[0].interval_timestamp}Z`) : 0);
        }),
    );
}
const newest = Math.max(...latest.values());
const inService = registry.filter((s) => newest - latest.get(s.station_id) <= SILENT_DAYS * 86400000);
console.log(`${inService.length} air stations reported in the last ${SILENT_DAYS} days`);

const search = await api('package_search', { q: `"${METRO_TITLE}"`, rows: '20' });
const metroPkg = search.results.find((p) => p.title.trim() === METRO_TITLE);
if (!metroPkg) throw new Error(`"${METRO_TITLE}" not found on ${PORTAL}`);
// e.g. a WMS resource "http://gis.cityofathens.gr/geoserver/wms#geonode:stasy2024"
const [server, layer] = metroPkg.resources.find((r) => String(r.format).toUpperCase() === 'WMS')?.url.split('#') ?? [];
if (!server || !layer) throw new Error(`no GIS layer listed for "${METRO_TITLE}"`);
const wfs = `${server.replace(/\/wms$/, '/ows')}?service=WFS&version=1.0.0&request=GetFeature&outputFormat=json&srsName=EPSG%3A4326&typename=${encodeURIComponent(layer)}`;
const { features } = await (await fetch(wfs, { signal: AbortSignal.timeout(120000) })).json();
const metroStations = features
    .filter((f) => f.properties.eidos === 'ΜΕΤΡΟ')
    .map((f) => {
        let point = f.geometry.coordinates;
        while (Array.isArray(point[0])) point = point[0];
        const p = f.properties;
        return {
            caps: p.name,
            en: p.name_en.trim(),
            lines: [...String(p.lines).matchAll(/\d/g)].map((m) => Number(m[0])), // "Γραμμή 1&3-ΜΕΤΡΟ"
            lat: Math.round(point[1] * 1e5) / 1e5,
            lng: Math.round(point[0] * 1e5) / 1e5,
        };
    });
console.log(`${metroStations.length} metro stations (${layer})`);

// --- each exhibit ---
const hoodById = new Map(hoods.map((h) => [h.neighbourhood_id, h]));
const areas = exhibitsData.map((ex) => {
    const at = ex.coords;
    const hood = hoods.find((h) => h.polygon_geo && rings(h.polygon_geo).some((ring) => inside(at, ring)));
    if (!hood) throw new Error(`${ex.el.title}: in no neighbourhood`);

    const air = inService
        .map((s) => {
            const own = s.neighbourhood_id === hood.neighbourhood_id;
            const h = hoodById.get(s.neighbourhood_id);
            return { s, metres: own ? 0 : metresBetween(at, [h.position_lat, h.position_lon]) };
        })
        .sort((a, b) => a.metres - b.metres);
    const airStation = ({ s, metres }) => ({
        id: s.station_id,
        name: named(AIR_NAMES[s.station_id] ?? s.station_name.trim()),
        hood: named(greek(s.neighbourhood_name)),
        metres,
    });

    const metro = metroStations.map((m) => ({ ...m, metres: metresBetween(at, [m.lat, m.lng]) })).sort((a, b) => a.metres - b.metres);

    const area = {
        neighbourhood: { name: named(greek(hood.name)), url: hood.url },
        air: airStation(air[0]),
        airBackup: air[1] && air[1].metres <= BACKUP_M ? airStation(air[1]) : null,
        metro: metro
            .slice(0, 2)
            .filter((m, i) => i === 0 || m.metres <= BACKUP_M || m.metres - metro[0].metres <= METRO_EXTRA_M)
            .map(({ caps, en, lines, lat, lng, metres }) => ({ name: { el: greek(caps), en }, lines, lat, lng, metres })),
    };
    console.log(`${ex.num} ${area.neighbourhood.name.el}: air ${area.air.name.el}${area.airBackup ? ` (+${area.airBackup.name.el})` : ''}, metro ${area.metro.map((m) => `${m.name.el} ${m.metres} m`).join(' / ')}`);
    return area;
});

const stations = metroStations
    .map(({ caps, en, lines, lat, lng }) => ({ name: { el: greek(caps), en }, lines, lat, lng }))
    .sort((a, b) => a.name.el.localeCompare(b.name.el, 'el'));

const sources = { neighbourhoods: hoodsTable.url, air: readings.url, metro: `${PORTAL}/dataset/${metroPkg.name}` };
fs.writeFileSync(
    file,
    `// Generated by scripts/fetch-area-data.mjs; edit the script, not this file.\n` +
        `import type { ExhibitArea, MetroStation } from './area';\n\n` +
        `/** The City's datasets on its open data portal. */\n` +
        `export const AREA_SOURCES = ${JSON.stringify(sources, null, 4)} as const;\n\n` +
        `/** The portal's table of every air station's hourly readings. */\n` +
        `export const AIR_READINGS = ${JSON.stringify(readings.id)};\n\n` +
        `/** By exhibit id. */\n` +
        `export const EXHIBIT_AREAS: readonly ExhibitArea[] = ${JSON.stringify(areas, null, 4)};\n\n` +
        `/** Every metro station in the municipality, by name. */\n` +
        `export const METRO_STATIONS: readonly MetroStation[] = ${JSON.stringify(stations, null, 4)};\n`,
);
console.log(`${areas.length} exhibits, ${stations.length} metro stations -> ${path.relative(root, file)}`);

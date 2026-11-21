// Exhibit #01, the Serafeio (Pireos St & Petrou Ralli), as a site model.
//
// Footprints are from OpenStreetMap (© OpenStreetMap contributors, ODbL),
// turned so Pireos Street runs along x and faces the viewer (+z). They are in
// metres: x towards Petrou Ralli, z towards Pireos. Heights follow the 2011
// building permit (a 4-storey, 15 m office building) and photos. Which part of
// the main footprint is the 4-storey block is inferred from the permit's floor
// areas: the rest matches its single-storey exhibition hall and café.
//
// Eras: 1900 is the open land by Pireos Street, with today's buildings
// outlined on the ground (the bequest's public baths were never built). The
// middle era is 1980 for this exhibit (its '1950' slot, labelled by
// Exhibit.eraLabels): the open-air Serafeio pool of the 1960s. No photos of it
// were found, so its layout is a reconstruction; it stands where the
// pool hall stands today, which replaced it.
import * as THREE from 'three';
import { addDetailedMesh } from './meshHelpers';

type Pt = [number, number];
type MakeMat = (opts: THREE.MeshStandardMaterialParameters) => THREE.MeshStandardMaterial;

/** Office building: 4 storeys, 15 m, on the Petrou Ralli side. */
const OFFICES: Pt[] = [[25.3, 5.1], [25.3, -0.8], [16.3, -0.9], [16.3, -14.9], [39.8, -14.5], [39.8, 12.1], [46.2, 12.1], [46.2, 33.5], [39.8, 33.5], [39.8, 39], [25.3, 39.4], [25.3, 30.9]];
/** Single-storey wing along Pireos: exhibition hall and café. */
const WING: Pt[] = [[25.3, 5.1], [25.3, 30.9], [-16.1, 36.2], [-16.4, 33.7], [-18.5, 33.9], [-14.9, 10.5]];
/** Indoor pool hall (25 m pool, 370 seats). */
const POOL_HALL: Pt[] = [[-22.4, -57.5], [39.3, -57.3], [40.7, -16.7], [-23.2, -16.6]];
/** The nearest of the three outdoor basketball courts. */
const COURT: Pt[] = [[-45, -11.1], [-44.5, -43.1], [-63.6, -43.4], [-64.1, -11.4]];

const OFFICES_H = 15;
const WING_H = 5.5;
const HALL_H = 10;

// The model shows x -66…62 m and z -62…58 m (Pireos Street included).
const CX = -2;
const CZ = -2;
/** Model units per metre, across and up (heights a little raised so the low buildings read). */
const H = 0.062;
const V = 0.085;
const X = (x: number): number => (x - CX) * H;
const Z = (z: number): number => (z - CZ) * H;

/** Size of the base the site stands on, model units (width, depth). */
export const SERAFEIO_BASE: [number, number] = [8.1, 7.6];

/**
 * Pin positions: first the three stories (1 the Serafis bequest by Pireos,
 * 2 the pool, 3 the office building), then visitors' memories, spread over the
 * site. Keep room for memories: pins past the end of the list wrap round onto
 * the stories.
 */
export const SERAFEIO_PINS: Array<[number, number, number]> = [
    [X(-30), 0.3, Z(42)],
    [X(9), (HALL_H + 2) * V + 0.15, Z(-37)],
    [X(33), OFFICES_H * V + 0.25, Z(12)],
    [X(5), WING_H * V + 0.25, Z(22)],
    [X(-55), 0.35, Z(-27)],
    [X(-50), 0.4, Z(35)],
    [X(47), 0.45, Z(-40)],
    [X(-18), HALL_H * V + 0.2, Z(-22)],
    [X(-26), 0.45, Z(0)],
];

// ------------------------------------------------------------------ textures

const canvases: Record<string, HTMLCanvasElement> = {};

function paint(kind: string, draw: (ctx: CanvasRenderingContext2D) => void): HTMLCanvasElement {
    if (!canvases[kind]) {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 512;
        draw(canvas.getContext('2d') as CanvasRenderingContext2D);
        canvases[kind] = canvas;
    }
    return canvases[kind];
}

/** Offices, one tile = 2 window bays × 4 floors: pale plaster, deep window hoods, glazed ground floor. */
function drawOffices(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#E7E5E1';
    ctx.fillRect(0, 0, 512, 512);
    const glass = ctx.createLinearGradient(0, 0, 0, 128);
    glass.addColorStop(0, '#5D86B5');
    glass.addColorStop(1, '#A9CBEB');
    for (let floor = 0; floor < 3; floor++) {
        const top = floor * 128;
        ctx.fillStyle = '#D6D3D1';
        ctx.fillRect(0, top, 512, 3);
        for (let bay = 0; bay < 2; bay++) {
            const x = bay * 256 + 60;
            ctx.fillStyle = '#A8A29E'; // hood shadow
            ctx.fillRect(x - 16, top + 26, 168, 14);
            ctx.fillStyle = '#F5F5F4';
            ctx.fillRect(x - 16, top + 22, 168, 5);
            ctx.save();
            ctx.translate(0, top);
            ctx.fillStyle = glass;
            ctx.fillRect(x, 42, 136, 66);
            ctx.restore();
            ctx.fillStyle = '#F8FAFC';
            ctx.fillRect(x + 66, top + 42, 4, 66);
            ctx.strokeStyle = '#78716C';
            ctx.lineWidth = 3;
            ctx.strokeRect(x, top + 42, 136, 66);
        }
    }
    // Ground floor: glass with mullions under a plaster band.
    ctx.fillStyle = '#D6D3D1';
    ctx.fillRect(0, 384, 512, 3);
    ctx.save();
    ctx.translate(0, 400);
    ctx.fillStyle = glass;
    ctx.fillRect(0, 10, 512, 102);
    ctx.restore();
    ctx.fillStyle = '#57534E';
    for (let x = 0; x < 512; x += 64) ctx.fillRect(x, 410, 5, 102);
}

/** Single-storey wing, one tile = 6 m × 5.5 m: plaster band over a glass front. */
function drawWing(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#E7E5E1';
    ctx.fillRect(0, 0, 512, 512);
    ctx.fillStyle = '#A8A29E'; // canopy shadow
    ctx.fillRect(0, 150, 512, 18);
    const glass = ctx.createLinearGradient(0, 168, 0, 512);
    glass.addColorStop(0, '#6E97C2');
    glass.addColorStop(1, '#BFDBFE');
    ctx.fillStyle = glass;
    ctx.fillRect(0, 168, 512, 344);
    ctx.fillStyle = '#475569';
    for (let x = 0; x < 512; x += 128) ctx.fillRect(x, 168, 6, 344);
    ctx.fillRect(0, 330, 512, 4);
}

/** Pool hall, one tile = 8 m × 10 m: plaster panels with a high band of windows. */
function drawHall(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#ECEAE4';
    ctx.fillRect(0, 0, 512, 512);
    ctx.fillStyle = '#D6D3D1';
    for (let x = 0; x < 512; x += 128) ctx.fillRect(x, 0, 3, 512);
    ctx.fillRect(0, 480, 512, 32);
    ctx.fillStyle = '#8FB8DE';
    ctx.fillRect(0, 58, 512, 58);
    ctx.fillStyle = '#64748B';
    for (let x = 0; x < 512; x += 64) ctx.fillRect(x, 58, 4, 58);
    ctx.fillRect(0, 56, 512, 3);
    ctx.fillRect(0, 115, 512, 3);
}

/**
 * A wall texture for an extruded footprint. ExtrudeGeometry gives side walls
 * u = distance along the wall and v = 1 - height, both in model units; this
 * maps one tile to `tileM` metres across and the whole wall height.
 */
function wallTexture(kind: string, draw: (ctx: CanvasRenderingContext2D) => void, tileM: number, heightM: number): THREE.Texture {
    const tex = new THREE.CanvasTexture(paint(kind, draw));
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1 / (tileM * H), -1 / (heightM * V));
    tex.offset.set(0, 1 / (heightM * V));
    return tex;
}

function letteringTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 96;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.fillStyle = '#44403C';
    ctx.font = 'bold 72px Arial, Helvetica, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ΣΕΡΑΦΕΙΟ', 256, 52);
    return new THREE.CanvasTexture(canvas);
}

// ------------------------------------------------------------------ geometry

/** A footprint extruded up from `baseM` by `heightM` metres. */
function prism(points: Pt[], heightM: number, baseM = 0): THREE.ExtrudeGeometry {
    const shape = new THREE.Shape(points.map(([x, z]) => new THREE.Vector2(X(x), -Z(z))));
    const geo = new THREE.ExtrudeGeometry(shape, { depth: heightM * V, bevelEnabled: false });
    geo.rotateX(-Math.PI / 2);
    geo.translate(0, baseM * V, 0);
    return geo;
}

/** A flat patch on the ground, x0…x1 × z0…z1 metres, `lift` units up (to avoid z-fighting). */
function patch(group: THREE.Group, mat: THREE.Material, x0: number, x1: number, z0: number, z1: number, lift: number, edge = 0x94a3b8): void {
    const w = (x1 - x0) * H;
    const d = (z1 - z0) * H;
    addDetailedMesh(group, new THREE.BoxGeometry(w, 0.012, d), mat, [X((x0 + x1) / 2), lift, Z((z0 + z1) / 2)], null, edge);
}

function cypress(group: THREE.Group, mat: THREE.Material, x: number, z: number, heightM = 11): void {
    addDetailedMesh(group, new THREE.ConeGeometry(1.5 * H, heightM * V, 8), mat, [X(x), (heightM * V) / 2 + 0.02, Z(z)], null, 0x14532d);
}

function roundTree(group: THREE.Group, leaf: THREE.Material, trunk: THREE.Material, x: number, z: number, sizeM = 6): void {
    const trunkH = sizeM * 0.4 * V;
    addDetailedMesh(group, new THREE.CylinderGeometry(0.3 * H, 0.4 * H, trunkH, 6), trunk, [X(x), trunkH / 2, Z(z)], null, 0x78350f);
    const crown = addDetailedMesh(group, new THREE.SphereGeometry(sizeM * 0.5 * H, 10, 8), leaf, [X(x), trunkH + sizeM * 0.4 * V, Z(z)], null, 0x166534);
    crown.scale.y = V / H;
}

function lamp(group: THREE.Group, pole: THREE.Material, globe: THREE.Material, x: number, z: number): void {
    const h = 4 * V;
    addDetailedMesh(group, new THREE.CylinderGeometry(0.008, 0.008, h, 6), pole, [X(x), h / 2, Z(z)], null, 0x334155);
    addDetailedMesh(group, new THREE.SphereGeometry(0.03, 10, 8), globe, [X(x), h + 0.02, Z(z)], null, 0xe2e8f0);
}

/** Today's footprints, dashed on the ground: where the complex will stand. */
function outline(group: THREE.Group, points: Pt[]): void {
    const pts = points.map(([x, z]) => new THREE.Vector3(X(x), 0.035, Z(z)));
    const line = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineDashedMaterial({ color: 0x0284c7, dashSize: 0.08, gapSize: 0.05, transparent: true, opacity: 0.8 }),
    );
    line.computeLineDistances();
    group.add(line);
}

// ------------------------------------------------------------------ the model

/** 1980: the open-air Serafeio pool and the Rouf sports ground, behind a wall on Pireos. */
function buildOldPool(
    group: THREE.Group,
    makeMat: MakeMat,
    m: { treeDark: THREE.Material; treeLeaf: THREE.Material; trunk: THREE.Material },
): void {
    const ground = makeMat({ color: 0x8a7b5c, roughness: 1 });
    const grass = makeMat({ color: 0x5d7a2a, roughness: 1 });
    const concrete = makeMat({ color: 0xc8c4bc, roughness: 0.8 });
    const plaster = makeMat({ color: 0xe7e2d6, roughness: 0.8 });
    const roof = makeMat({ color: 0xb8b2aa, roughness: 0.8 });
    patch(group, ground, -66, 52, -62, 43, 0.004, 0x6b5d45);
    patch(group, grass, -31, -16, -14, 38, 0.012, 0x4d7c0f);
    patch(group, grass, 34, 51, -60, 30, 0.012, 0x4d7c0f);

    // Wall along both streets, with the gate on Pireos.
    const wallH = 2.6 * V;
    const wallX = (x0: number, x1: number): void => {
        addDetailedMesh(group, new THREE.BoxGeometry((x1 - x0) * H, wallH, 0.5 * H), plaster, [X((x0 + x1) / 2), wallH / 2, Z(42.5)], null, 0x78716c);
    };
    wallX(-66, -2);
    wallX(10, 52);
    addDetailedMesh(group, new THREE.BoxGeometry(0.5 * H, wallH, 105 * H), plaster, [X(51.7), wallH / 2, Z(-9.5)], null, 0x78716c);
    // Gatehouse and ticket window.
    addDetailedMesh(group, new THREE.BoxGeometry(7 * H, 3.2 * V, 5 * H), plaster, [X(15), 1.6 * V, Z(39)], null, 0x78716c);
    addDetailedMesh(group, new THREE.BoxGeometry(7.6 * H, 0.3 * V, 5.6 * H), roof, [X(15), 3.35 * V, Z(39)], null, 0x78716c);

    // The pool: 33 × 16 m on a concrete deck, with a few lanes.
    patch(group, concrete, -12, 30, -50, -22, 0.014, 0x94a3b8);
    const water = makeMat({ color: 0x0ea5e9, roughness: 0.1, metalness: 0.2 });
    patch(group, water, -7.5, 25.5, -45, -29, 0.022, 0x38bdf8);
    const laneMat = makeMat({ color: 0x1e3a8a, roughness: 0.4 });
    for (let z = -42.5; z < -30; z += 2.6) patch(group, laneMat, -6, 24, z, z + 0.3, 0.03, 0x1e3a8a);

    // Changing rooms behind the pool: one storey, small high windows.
    const roomsWall = makeMat({ map: wallTexture('hall', drawHall, 6, 4), roughness: 0.8 });
    addDetailedMesh(group, prism([[-12, -58], [30, -58], [30, -51], [-12, -51]], 4), [roof, roomsWall], null, null, 0x78716c);

    // Concrete terraces for spectators, facing the pool from the front.
    [0, 1, 2].forEach((step) => {
        const h = (step + 1) * 0.7 * V;
        addDetailedMesh(group, new THREE.BoxGeometry(30 * H, h, 1.6 * H), concrete, [X(9), h / 2, Z(-19.5 + step * 1.6)], null, 0x94a3b8);
    });

    // Floodlight masts at the corners of the deck.
    const mast = makeMat({ color: 0x475569, roughness: 0.5 });
    const lightBox = makeMat({ color: 0xf8fafc, emissive: 0xfef3c7, emissiveIntensity: 0.5, roughness: 0.4 });
    ([[-12, -50], [30, -50], [-12, -22], [30, -22]] as Pt[]).forEach(([x, z]) => {
        const h = 12 * V;
        addDetailedMesh(group, new THREE.CylinderGeometry(0.012, 0.016, h, 6), mast, [X(x), h / 2, Z(z)], null, 0x334155);
        addDetailedMesh(group, new THREE.BoxGeometry(0.12, 0.05, 0.03), lightBox, [X(x), h, Z(z)], null, 0x94a3b8);
    });

    // An open-air basketball court of the sports ground, faded.
    const court = makeMat({ color: 0x9a5b4f, roughness: 0.9 });
    patch(group, court, -64, -45, -43, -11, 0.012, 0x7c2d12);
    for (const z of [-41.5, -12.5]) {
        addDetailedMesh(group, new THREE.CylinderGeometry(0.01, 0.01, 3 * V, 6), mast, [X(-54.5), 1.5 * V, Z(z)], null, 0x334155);
    }

    // Pines along the wall, cypresses by the pool.
    ([[-60, 36], [-46, 36], [-32, 36], [30, 36], [44, 36], [46, 15], [46, -5], [-60, -55], [-40, -56]] as Pt[]).forEach(([x, z]) =>
        roundTree(group, m.treeLeaf, m.trunk, x, z, 8),
    );
    ([[-17, -56], [-17, -46], [-17, -36], [-17, -26], [35, -56], [35, -46], [35, -36]] as Pt[]).forEach(([x, z]) => cypress(group, m.treeDark, x, z, 10));
}

export function buildSerafeio(group: THREE.Group, era: string, makeMat: MakeMat): void {
    const today = era === 'today';
    const asphalt = makeMat({ color: 0x475569, roughness: 0.9 });
    const sidewalk = makeMat({ color: 0xd6d3d1, roughness: 0.8 });
    const marking = makeMat({ color: 0xf8fafc, roughness: 0.6 });
    const treeDark = makeMat({ color: 0x166534, roughness: 0.7 });
    const treeLeaf = makeMat({ color: 0x4d7c0f, roughness: 0.7 });
    const trunk = makeMat({ color: 0x78350f, roughness: 0.8 });

    // Pireos Street along the front; a dirt road in 1900.
    const pireos = era === '1900' ? makeMat({ color: 0x7a5a32, roughness: 1 }) : asphalt;
    patch(group, pireos, -66, 62, 46, 58, 0.006, 0x64748b);
    if (era !== '1900') {
        for (let x = -62; x < 60; x += 9) patch(group, marking, x, x + 4.5, 51.7, 52.3, 0.014, 0xe2e8f0);
    }

    if (era === '1900') {
        // Open land, with today's buildings outlined on it.
        const earth = makeMat({ color: 0x8f6c3f, roughness: 1 });
        const grass = makeMat({ color: 0x5d7a2a, roughness: 1 });
        patch(group, earth, -66, 62, -62, 46, 0.004, 0xb8a27a);
        patch(group, grass, -60, -20, -50, -5, 0.01, 0x84a35b);
        patch(group, grass, 0, 45, -55, -25, 0.01, 0x84a35b);
        patch(group, grass, -40, 10, 15, 40, 0.01, 0x84a35b);
        [OFFICES, WING, POOL_HALL, COURT].forEach((p) => outline(group, p));
        const olive = makeMat({ color: 0x4f7a32, roughness: 0.8 });
        ([[-50, -30], [-35, 25], [-10, -5], [20, 20], [45, -40], [-55, 10], [5, -45], [35, 0]] as Pt[]).forEach(([x, z]) =>
            roundTree(group, olive, trunk, x, z, 7),
        );
        return;
    }

    // Petrou Ralli along the right, sidewalks on both streets.
    patch(group, asphalt, 54, 62, -62, 46, 0.007, 0x64748b);
    for (let z = -58; z < 44; z += 9) patch(group, marking, 57.7, 58.3, z, z + 4.5, 0.015, 0xe2e8f0);
    patch(group, sidewalk, -66, 54, 43, 46, 0.009);
    patch(group, sidewalk, 52, 54, -62, 46, 0.009);

    if (!today) {
        buildOldPool(group, makeMat, { treeDark, treeLeaf, trunk });
        return;
    }

    // ---- today: the 2017 complex

    // Grounds: paving, lawns, parking, one of the basketball courts.
    const paving = makeMat({ color: 0xb8b2aa, roughness: 0.85 });
    const lawn = makeMat({ color: 0x3f7a2e, roughness: 0.95 });
    const parking = makeMat({ color: 0x4b5563, roughness: 0.9 });
    const courtMat = makeMat({ color: 0xc2554a, roughness: 0.8 });
    const keyMat = makeMat({ color: 0x3f7a5a, roughness: 0.8 });
    patch(group, paving, -66, 52, -62, 43, 0.004, 0xcbd5e1);
    patch(group, lawn, -31, -20, -14, 8, 0.012, 0x4d7c0f);
    patch(group, lawn, -31, -21, 12, 40, 0.012, 0x4d7c0f);
    patch(group, lawn, -66, -45, -62, -45, 0.012, 0x4d7c0f);
    patch(group, lawn, 43, 51, -60, -18, 0.012, 0x4d7c0f);
    patch(group, lawn, -20, 42, -62, -59, 0.012, 0x4d7c0f);
    // Park and playground between the parking and Pireos.
    patch(group, lawn, -66, -34, 28, 42, 0.012, 0x4d7c0f);
    const sand = makeMat({ color: 0xd6b98c, roughness: 1 });
    patch(group, sand, -58, -46, 31, 39, 0.02, 0xa8865a);
    const play = makeMat({ color: 0xdc2626, roughness: 0.6 });
    const slide = makeMat({ color: 0x64748b, roughness: 0.4 });
    addDetailedMesh(group, new THREE.BoxGeometry(2.5 * H, 2.5 * V, 2.5 * H), play, [X(-55), 1.25 * V, Z(35)], null, 0x7f1d1d);
    addDetailedMesh(group, new THREE.BoxGeometry(4 * H, 0.4 * V, 1.2 * H), slide, [X(-51.5), 1.2 * V, Z(35)], [0, 0, -0.35], 0x334155);
    patch(group, parking, -66, -34, -9, 26, 0.012, 0x6b7280);
    for (let z = -6; z < 25; z += 2.6) patch(group, marking, -50.5, -49.5, z, z + 0.3, 0.02, 0xe2e8f0);
    patch(group, courtMat, -64, -45, -43, -11, 0.012, 0xb45309);
    patch(group, keyMat, -58.5, -50.5, -43, -37, 0.02, 0x166534);
    patch(group, keyMat, -58.5, -50.5, -17, -11, 0.02, 0x166534);

    // Office building, 4 storeys, with its name on the Pireos front.
    const roof = makeMat({ color: 0xd6d3d1, roughness: 0.7 });
    const officesWall = makeMat({ map: wallTexture('offices', drawOffices, 7.2, OFFICES_H), roughness: 0.6 });
    addDetailedMesh(group, prism(OFFICES, OFFICES_H), [roof, officesWall], null, null, 0x78716c);
    const plant = makeMat({ color: 0xa8a29e, roughness: 0.6 });
    addDetailedMesh(group, new THREE.BoxGeometry(6 * H, 1.5 * V, 4 * H), plant, [X(30), (OFFICES_H + 0.75) * V, Z(-8)], null, 0x78716c);
    addDetailedMesh(group, new THREE.BoxGeometry(4 * H, 2.5 * V, 4 * H), plant, [X(42), (OFFICES_H + 1.25) * V, Z(22)], null, 0x78716c);
    const sign = new THREE.Mesh(
        new THREE.PlaneGeometry(11 * H, 2 * V),
        new THREE.MeshBasicMaterial({ map: letteringTexture(), transparent: true, depthWrite: false }),
    );
    sign.position.set(X(32.5), 11.6 * V, Z(39.6));
    group.add(sign);

    // Single-storey exhibition hall and café.
    const wingWall = makeMat({ map: wallTexture('wing', drawWing, 6, WING_H), roughness: 0.4 });
    addDetailedMesh(group, prism(WING, WING_H), [roof, wingWall], null, null, 0x78716c);

    // Indoor pool hall with a glazed roof lantern; the pool and stand inside show in x-ray.
    const hallWall = makeMat({ map: wallTexture('hall', drawHall, 8, HALL_H), roughness: 0.7 });
    const hallRoof = makeMat({ color: 0xe2e8f0, roughness: 0.5, metalness: 0.2 });
    addDetailedMesh(group, prism(POOL_HALL, HALL_H), [hallRoof, hallWall], null, null, 0x78716c);
    const lantern = makeMat({ color: 0x7dd3fc, roughness: 0.15, metalness: 0.3, transparent: true, opacity: 0.7 });
    addDetailedMesh(group, new THREE.BoxGeometry(42 * H, 2 * V, 8 * H), lantern, [X(9), (HALL_H + 1) * V, Z(-37)], null, 0x0284c7);
    const water = makeMat({ color: 0x0ea5e9, roughness: 0.1, metalness: 0.2 });
    patch(group, water, -7.5, 25.5, -49.5, -24.5, 0.03, 0x38bdf8);
    const laneMat = makeMat({ color: 0x1e3a8a, roughness: 0.4 });
    for (let z = -47; z < -25; z += 2.5) patch(group, laneMat, -6, 24, z, z + 0.3, 0.04, 0x1e3a8a);
    const seats = makeMat({ color: 0xf1f5f9, roughness: 0.6 });
    [0, 1, 2].forEach((step) => {
        const z0 = -55 + step * 1.4;
        addDetailedMesh(group, new THREE.BoxGeometry(30 * H, (step + 1) * 0.8 * V, 1.4 * H), seats, [X(9), ((step + 1) * 0.8 * V) / 2, Z(z0 + 0.7)], null, 0x94a3b8);
    });

    // Cypresses along the park edges, trees on the lawns, globe lamps on the plaza.
    ([[-65, -58], [-65, -48], [-65, -38], [-65, -28], [-65, -18], [-44, -48], [-34, -50], [-24, -61], [-14, -61], [50, -62]] as Pt[]).forEach(([x, z]) =>
        cypress(group, treeDark, x, z),
    );
    ([[-26, -4], [-26, 20], [-26, 32], [47, -50], [47, -30], [-58, -52], [-62, 30], [-40, 31], [-40, 40]] as Pt[]).forEach(([x, z]) => roundTree(group, treeLeaf, trunk, x, z));
    const pole = makeMat({ color: 0x334155, roughness: 0.5 });
    const globe = makeMat({ color: 0xffffff, emissive: 0xfef3c7, emissiveIntensity: 0.6, roughness: 0.3 });
    ([[-19, 0], [-19, 14], [-19, 28], [-8, 41], [8, 41], [24, 42]] as Pt[]).forEach(([x, z]) => lamp(group, pole, globe, x, z));
}

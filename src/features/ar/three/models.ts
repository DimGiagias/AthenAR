// Procedural 3D models of the 11 exhibits, per historical era.
// The target group and x-ray flag are parameters, and the animated smoke puffs
// are returned to the caller, which animates them.
import * as THREE from 'three';
import type { Exhibit } from '../../../data/types';
import { createArchitecturalTexture } from './textures';
import { addDetailedMesh, createPedimentPrismGeometry, createBarrelVaultGeometry, setXrayMode } from './meshHelpers';
import { buildSerafeio, SERAFEIO_BASE } from './serafeio';

export function buildMonumentMesh(group: THREE.Group, exhibit: Exhibit, era: string, xray: boolean): THREE.Object3D[] {
    while (group.children.length > 0) {
        group.remove(group.children[0]);
    }
    const smoke: THREE.Object3D[] = [];
    setXrayMode(xray);

    // 1. ARCHITECTURAL PLAZA PLINTH & HOLOGRAPHIC COMPASS RING
    // The Serafeio is a whole site, so it stands on a larger base.
    const [baseW, baseD] = exhibit.id === 0 ? SERAFEIO_BASE : [7.6, 5.6];
    const plinthMat = new THREE.MeshStandardMaterial({
        color: 0xf1f5f9,
        roughness: 0.7,
        transparent: xray,
        opacity: xray ? 0.25 : 0.95
    });
    addDetailedMesh(group, new THREE.BoxGeometry(baseW, 0.22, baseD), plinthMat, [0, -0.11, 0], null, 0x94a3b8);

    const ringR = (4.4 * baseW) / 7.6;
    const ringGeo = new THREE.RingGeometry(ringR - 0.1, ringR + 0.1, 48);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.55 });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = 0.02;
    group.add(ringMesh);

    const makeMat = (opts: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial({
        ...opts,
        wireframe: xray,
        transparent: xray || opts.transparent === true,
        opacity: xray ? 0.45 : (opts.opacity !== undefined ? opts.opacity : 1.0)
    });

    // 2. BESPOKE DETAILED 3D ARCHITECTURE PER MONUMENT & HISTORICAL ERA
    if (exhibit.id === 0) {
        buildSerafeio(group, era, makeMat);
    } else if (exhibit.svgStyle === 'gazi') {
        // =============================================================
        // #02 OLD GASWORKS (GAZI - TECHNOPOLIS): Red-Brick Chimneys, Retort Halls, Steel Gasholder & 3D Smoke
        // =============================================================
        const brickTex = createArchitecturalTexture('brick_gazi', era);
        const brickMat = makeMat({ map: brickTex, roughness: 0.55 });
        const darkIronMat = makeMat({ color: 0x1e293b, metalness: 0.65, roughness: 0.3 });
        const roofSlateMat = makeMat({ color: 0x475569, roughness: 0.5 });
        const skyGlassMat = makeMat({ color: era === 'today' ? 0x38bdf8 : 0xf59e0b, emissive: era === 'today' ? 0x0284c7 : 0xd97706, emissiveIntensity: 0.35 });

        // Main Retort Furnace Hall + Real Pitched Industrial Roof & Raised Clerestory Monitor
        addDetailedMesh(group, new THREE.BoxGeometry(3.2, 1.75, 2.1), brickMat, [0.4, 0.88, 0.1], null, 0x7c2d12);
        addDetailedMesh(group, createPedimentPrismGeometry(3.35, 0.72, 2.2), roofSlateMat, [0.4, 1.75, 0.1], null, 0x334155);
        addDetailedMesh(group, new THREE.BoxGeometry(2.1, 0.36, 0.75), skyGlassMat, [0.4, 2.38, 0.1], null, 0x38bdf8);

        // Secondary Purifier Industrial Wing
        addDetailedMesh(group, new THREE.BoxGeometry(1.7, 1.35, 1.6), brickMat, [2.35, 0.68, -0.6], null, 0x7c2d12);
        addDetailedMesh(group, createPedimentPrismGeometry(1.8, 0.45, 1.68), roofSlateMat, [2.35, 1.35, -0.6], null, 0x334155);

        // Twin Iconic Red-Brick Industrial Chimneys with Iron Bands & Brick Crowns
        [[-0.95, -0.65], [1.75, -0.65]].forEach(([cx, cz]) => {
            addDetailedMesh(group, new THREE.BoxGeometry(0.75, 0.85, 0.75), brickMat, [cx, 0.42, cz], null, 0x7c2d12);
            addDetailedMesh(group, new THREE.CylinderGeometry(0.22, 0.36, 3.6, 18), brickMat, [cx, 2.2, cz], null, 0x9a3412);
            [1.6, 2.5, 3.4].forEach(ry => {
                addDetailedMesh(group, new THREE.CylinderGeometry(0.31, 0.31, 0.08, 18), darkIronMat, [cx, ry, cz], null, 0x0f172a);
            });
            addDetailedMesh(group, new THREE.CylinderGeometry(0.32, 0.24, 0.25, 18), darkIronMat, [cx, 4.05, cz], null, 0x38bdf8);

            if (era === '1900' || era === '1950') {
                for (let s = 0; s < 4; s++) {
                    const smokeGeo = new THREE.SphereGeometry(0.18 + s * 0.07, 10, 10);
                    const smokeMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, transparent: true, opacity: 0.55 - s * 0.1 });
                    const puff = new THREE.Mesh(smokeGeo, smokeMat);
                    puff.position.set(cx + s * 0.12, 4.35 + s * 0.38, cz);
                    puff.userData = { baseY: 4.35, baseX: cx, offset: s * 0.8 };
                    group.add(puff);
                    smoke.push(puff);
                }
            }
        });

        // Cylindrical Telescopic Gasholder (Αεριοφυλάκιο) with Steel Guide-Frame Columns
        const gasholderX = -2.25, gasholderZ = 0.55;
        const tankMat = makeMat({ color: era === 'today' ? 0x0284c7 : 0x475569, metalness: 0.5, roughness: 0.35 });
        addDetailedMesh(group, new THREE.CylinderGeometry(1.15, 1.18, 1.35, 24), tankMat, [gasholderX, 0.68, gasholderZ], null, 0x38bdf8);
        addDetailedMesh(group, new THREE.SphereGeometry(1.15, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2.6), tankMat, [gasholderX, 1.32, gasholderZ], null, 0x38bdf8);
        for (let a = 0; a < 8; a++) {
            const ang = (a / 8) * Math.PI * 2;
            const gx = gasholderX + Math.cos(ang) * 1.24;
            const gz = gasholderZ + Math.sin(ang) * 1.24;
            addDetailedMesh(group, new THREE.CylinderGeometry(0.04, 0.04, 1.85, 8), darkIronMat, [gx, 0.92, gz], null, 0x0284c7);
        }

    } else if (exhibit.id === 2) {
        // =============================================================
        // #03 KYPSELI MUNICIPAL MARKET (1935 Interwar Art Deco Arcade on Fokionos Negri)
        // Authentic long horizontal modernist building, cantilevered canopy,
        // 10 shopfront bays, stepped Art Deco portals, interior gallery & raised clerestory roof
        // =============================================================
        const stuccoColor = era === '1900' ? 0xfef3c7 : (era === '1950' ? 0xf1f5f9 : 0xffffff);
        const artDecoWallMat = makeMat({ color: stuccoColor, roughness: 0.32 });
        const plinthGreyMat = makeMat({ color: 0x334155, roughness: 0.6 });
        const canopyBlueMat = makeMat({ color: 0x0284c7, roughness: 0.3 });
        const shopGlassMat = makeMat({
            color: era === 'today' ? 0x7dd3fc : 0xfde68a,
            emissive: era === 'today' ? 0x0284c7 : 0xd97706,
            emissiveIntensity: 0.28,
            transparent: true,
            opacity: xray ? 0.35 : 0.85
        });
        const treeFoliageMat = makeMat({ color: 0x16a34a, roughness: 0.55 });
        const trunkMat = makeMat({ color: 0x78350f, roughness: 0.7 });

        // 1. Dark Terrazzo / Stone Base Plinth
        addDetailedMesh(group, new THREE.BoxGeometry(6.1, 0.24, 2.75), plinthGreyMat, [0, 0.12, -0.15], null, 0x475569);

        // 2. Left & Right Symmetrical Art Deco Market Wings (with central open-air/covered gallery passage)
        [-1.78, 1.78].forEach(wx => {
            // Main Wing Body
            addDetailedMesh(group, new THREE.BoxGeometry(2.25, 1.38, 2.55), artDecoWallMat, [wx, 0.93, -0.15], null, 0x0284c7);
            // Rounded Art Deco End Rotunda / Corner Pier
            const endX = wx < 0 ? -2.9 : 2.9;
            addDetailedMesh(group, new THREE.CylinderGeometry(0.46, 0.46, 1.38, 18), artDecoWallMat, [endX, 0.93, -0.15], null, 0x0284c7);
            // Horizontal Art Deco Parapet Crown Band & Coping
            addDetailedMesh(group, new THREE.BoxGeometry(2.38, 0.12, 2.65), canopyBlueMat, [wx, 1.66, -0.15], null, 0x38bdf8);
        });

        // 3. Continuous Cantilevered Concrete Canopy (Μαρκίζα) shading the perimeter shopfronts
        addDetailedMesh(group, new THREE.BoxGeometry(6.35, 0.09, 2.98), canopyBlueMat, [0, 1.12, -0.15], null, 0x38bdf8);

        // 4. Rhythmic Shopfront Bays, Recessed Windows & Transom Grilles (Front +Z & Back -Z)
        const shopXPositions = [-2.55, -2.0, -1.45, -0.92, 0.92, 1.45, 2.0, 2.55];
        shopXPositions.forEach(sx => {
            // Front Shopfront Window (+Z facing Fokionos Negri)
            addDetailedMesh(group, new THREE.BoxGeometry(0.38, 0.76, 0.08), shopGlassMat, [sx, 0.62, 1.13], null, 0x0284c7);
            // Art Deco Transom Vent Window above canopy
            addDetailedMesh(group, new THREE.BoxGeometry(0.38, 0.24, 0.08), shopGlassMat, [sx, 1.34, 1.13], null, 0x0369a1);
            // Back Shopfront Window (-Z)
            addDetailedMesh(group, new THREE.BoxGeometry(0.38, 0.76, 0.08), shopGlassMat, [sx, 0.62, -1.43], null, 0x0284c7);
            // Vertical Pilaster Pier between shops
            addDetailedMesh(group, new THREE.BoxGeometry(0.09, 1.36, 2.60), artDecoWallMat, [sx + 0.26, 0.92, -0.15], null, 0x94a3b8);

            // 1950s–1970s Heyday Striped Market Awnings
            if (era === '1950') {
                const awningMat = makeMat({ color: 0x0284c7, roughness: 0.4 });
                addDetailedMesh(group, new THREE.BoxGeometry(0.42, 0.05, 0.36), awningMat, [sx, 0.96, 1.32], [0.35, 0, 0], 0xffffff);
            }
        });

        // 5. Monumental Stepped Art Deco Central Entrance Portal (Fokionos Negri & Back Facade)
        addDetailedMesh(group, new THREE.BoxGeometry(1.38, 1.92, 2.78), artDecoWallMat, [0, 1.08, -0.15], null, 0x0369a1);
        // Stepped Upper Ziggurat Crown ("ΔΗΜΟΤΙΚΗ ΑΓΟΡΑ" frieze block)
        addDetailedMesh(group, new THREE.BoxGeometry(1.06, 0.28, 2.84), canopyBlueMat, [0, 2.18, -0.15], null, 0x38bdf8);
        addDetailedMesh(group, new THREE.BoxGeometry(0.68, 0.20, 2.88), artDecoWallMat, [0, 2.42, -0.15], null, 0x0284c7);

        // 4 Vertical Art Deco Fluted Relief Fins flanking the Central Entrance
        [-0.54, -0.40, 0.40, 0.54].forEach(fx => {
            addDetailedMesh(group, new THREE.BoxGeometry(0.06, 1.75, 0.14), canopyBlueMat, [fx, 1.15, 1.24], null, 0x38bdf8);
            addDetailedMesh(group, new THREE.BoxGeometry(0.06, 1.75, 0.14), canopyBlueMat, [fx, 1.15, -1.54], null, 0x38bdf8);
        });

        // Tall Illuminated Central Archway / Gallery Passageway
        addDetailedMesh(group, new THREE.BoxGeometry(0.66, 1.45, 2.82), shopGlassMat, [0, 0.85, -0.15], null, 0x0284c7);
        addDetailedMesh(group, new THREE.CylinderGeometry(0.33, 0.33, 2.84, 16), shopGlassMat, [0, 1.56, -0.15], [Math.PI / 2, 0, 0], 0x38bdf8);

        // 6. Raised Central Clerestory Roof Monitor (Υπερυψωμένος Φωταγωγός Αερισμού) running full length
        addDetailedMesh(group, new THREE.BoxGeometry(5.1, 0.42, 1.12), artDecoWallMat, [0, 1.88, -0.15], null, 0x0284c7);
        addDetailedMesh(group, new THREE.BoxGeometry(4.95, 0.22, 1.18), shopGlassMat, [0, 1.90, -0.15], null, 0x38bdf8);
        addDetailedMesh(group, new THREE.BoxGeometry(5.25, 0.09, 1.26), canopyBlueMat, [0, 2.13, -0.15], null, 0x0369a1);

        // 7. Fokionos Negri Leafy Pedestrian Promenade Trees & Planters in front (+Z)
        if (era === '1950' || era === 'today') {
            [-2.4, -1.15, 1.15, 2.4].forEach(tx => {
                addDetailedMesh(group, new THREE.BoxGeometry(0.42, 0.16, 0.42), artDecoWallMat, [tx, 0.08, 1.95], null, 0x0284c7);
                addDetailedMesh(group, new THREE.CylinderGeometry(0.05, 0.07, 0.48, 8), trunkMat, [tx, 0.32, 1.95], null, 0x78350f);
                addDetailedMesh(group, new THREE.SphereGeometry(0.32, 12, 10), treeFoliageMat, [tx, 0.72, 1.95], null, 0x15803d);
            });
        }

    } else if (exhibit.svgStyle === 'modernist') {
        // =============================================================
        // #04 THE BLUE APARTMENT BUILDING (EXARCHEIA - 1933 PANAGIOTAKOS & PAPALOUKAS)
        // =============================================================
        const cobaltTex = createArchitecturalTexture('cobalt_modernist', era);
        const cobaltMat = makeMat({ map: cobaltTex, roughness: 0.35 });
        const whiteStuccoMat = makeMat({ color: 0xf8fafc, roughness: 0.3 });
        const terracottaRailMat = makeMat({ color: era === '1900' ? 0xc2410c : 0x0284c7, roughness: 0.4 });
        const darkBaseMat = makeMat({ color: 0x1e293b });

        addDetailedMesh(group, new THREE.BoxGeometry(4.2, 0.55, 2.5), darkBaseMat, [0, 0.28, 0], null, 0x38bdf8);
        addDetailedMesh(group, new THREE.BoxGeometry(4.4, 2.65, 2.7), cobaltMat, [0, 1.85, 0], null, 0x38bdf8);

        [-1.15, 1.15].forEach(ex => {
            addDetailedMesh(group, new THREE.BoxGeometry(1.55, 2.35, 0.52), cobaltMat, [ex, 1.9, 1.52], null, 0xffffff);
            [0.95, 1.5, 2.05, 2.6].forEach(by => {
                addDetailedMesh(group, new THREE.BoxGeometry(1.65, 0.1, 0.62), whiteStuccoMat, [ex, by, 1.56], null, 0x0284c7);
            });
        });

        [0.95, 1.5, 2.05, 2.6].forEach(by => {
            addDetailedMesh(group, new THREE.BoxGeometry(0.45, 0.12, 2.2), terracottaRailMat, [2.32, by, 0], null, 0xffffff);
        });

        addDetailedMesh(group, new THREE.BoxGeometry(2.8, 0.52, 1.6), whiteStuccoMat, [0, 3.42, -0.1], null, 0x0284c7);
        addDetailedMesh(group, new THREE.BoxGeometry(3.4, 0.08, 2.0), whiteStuccoMat, [0, 3.75, 0], null, 0x38bdf8);

    } else if (exhibit.id === 4) {
        // =============================================================
        // #05 VARVAKEIOS CENTRAL MARKET (1886 Cast-Iron & Glass Skylight Agora + Neoclassical Wings)
        // =============================================================
        const stoneTex = createArchitecturalTexture('neoclassical_palace', era);
        const stoneWingMat = makeMat({ map: stoneTex, roughness: 0.42 });
        const castIronMat = makeMat({ color: 0x1e293b, metalness: 0.72, roughness: 0.28 });
        const skylightGlassMat = makeMat({
            color: era === '1900' ? 0xfde68a : 0x7dd3fc,
            transparent: true,
            opacity: xray ? 0.35 : 0.68,
            metalness: 0.35,
            roughness: 0.12
        });
        const roofTerracottaMat = makeMat({ color: 0xb45309, roughness: 0.5 });
        const stallMat = makeMat({ color: 0x0284c7, roughness: 0.4 });
        const warmLampMat = makeMat({ color: 0xfbbf24, emissive: 0xf59e0b, emissiveIntensity: 0.6 });

        // 1. Left & Right Neoclassical Stone Market Wings along Athinas Street
        [-2.05, 2.05].forEach(wx => {
            addDetailedMesh(group, new THREE.BoxGeometry(1.45, 1.68, 3.2), stoneWingMat, [wx, 0.84, 0], null, 0x0284c7);
            // Pitched Neoclassical Tile Roofs on Left & Right Wings
            addDetailedMesh(group, createPedimentPrismGeometry(1.58, 0.48, 3.3), roofTerracottaMat, [wx, 1.68, 0], null, 0x7c2d12);
            // Corner Pavilions Facing Athinas Street
            addDetailedMesh(group, new THREE.BoxGeometry(1.55, 1.9, 0.75), stoneWingMat, [wx, 0.95, 1.38], null, 0x0369a1);
            addDetailedMesh(group, createPedimentPrismGeometry(1.65, 0.48, 0.82), roofTerracottaMat, [wx, 1.9, 1.38], null, 0x0284c7);
        });

        // 2. Central Cast-Iron & Glass Barrel-Vaulted Skylight Gallery (Les Halles Parisian Style)
        const vaultGeo = createBarrelVaultGeometry(2.65, 1.05, 3.25);
        addDetailedMesh(group, vaultGeo, skylightGlassMat, [0, 1.62, 0], null, 0x38bdf8);

        // 7 Cast-Iron Arched Roof Trusses / Ribs spanning the glass vault
        for (let tz = -1.5; tz <= 1.5; tz += 0.5) {
            const ribGeo = createBarrelVaultGeometry(2.74, 1.1, 0.07);
            addDetailedMesh(group, ribGeo, castIronMat, [0, 1.62, tz], null, 0x0f172a);
            // Cast-iron support columns along the central market aisle
            [-1.25, 1.25].forEach(cx => {
                addDetailedMesh(group, new THREE.CylinderGeometry(0.06, 0.07, 1.62, 10), castIronMat, [cx, 0.81, tz], null, 0x0284c7);
            });
        }

        // Raised Ventilation Lantern running along the ridge of the glass vault
        addDetailedMesh(group, new THREE.BoxGeometry(0.65, 0.24, 3.1), skylightGlassMat, [0, 2.72, 0], null, 0x0284c7);
        addDetailedMesh(group, createPedimentPrismGeometry(0.78, 0.22, 3.18), castIronMat, [0, 2.84, 0], null, 0x38bdf8);

        // 3. Monumental Central Arched Entrance Portal & Historic Market Clock on Athinas Street (+Z)
        addDetailedMesh(group, new THREE.BoxGeometry(2.6, 1.62, 0.22), stoneWingMat, [0, 0.81, 1.62], null, 0x0284c7);
        // Central Clock Pediment Badge
        const clockFaceMat = makeMat({ color: 0xffffff, emissive: 0xe0f2fe, emissiveIntensity: 0.3 });
        addDetailedMesh(group, new THREE.CylinderGeometry(0.28, 0.28, 0.12, 20), clockFaceMat, [0, 2.15, 1.68], [Math.PI / 2, 0, 0], 0x0f172a);

        // 4. Interior Market Stalls & Warm Market Lights (Visible under the glass vault)
        [-0.55, 0.55].forEach(sx => {
            for (let sz = -1.0; sz <= 1.0; sz += 0.65) {
                addDetailedMesh(group, new THREE.BoxGeometry(0.55, 0.42, 0.45), stallMat, [sx, 0.21, sz], null, 0x38bdf8);
                addDetailedMesh(group, new THREE.SphereGeometry(0.08, 8, 8), warmLampMat, [sx, 1.35, sz], null, 0xf59e0b);
            }
        });

        // 1950s Traditional Market Awnings along the street
        if (era === '1950' || era === 'today') {
            const awningMat = makeMat({ color: 0x0284c7, roughness: 0.4 });
            [-2.05, 2.05].forEach(ax => {
                addDetailedMesh(group, new THREE.BoxGeometry(1.4, 0.08, 0.45), awningMat, [ax, 0.72, 1.88], [0.35, 0, 0], 0xffffff);
            });
        }

    } else if (exhibit.id === 5) {
        // =============================================================
        // #06 ATHENS CITY HALL & ANCIENT ACHARNIAN GATE (KOTZIA SQUARE)
        // High-Precision 3D Neoclassical Civic Palace (Panagiotis Kalkos 1874 + 1937 3rd Floor)
        // Tripartite Facade, Sculpted 3D Window Pediments, Rusticated Arched Ground Floor,
        // 4-Column Classical Portico & Kotzia Square 479 BC Archaeological Excavation
        // =============================================================
        const isTwoStory1874 = (era === '1900');
        const stuccoColor = era === '1900' ? 0xfef3c7 : 0xf8fafc;
        const wallMat = makeMat({ color: stuccoColor, roughness: 0.32 });
        const rusticatedMat = makeMat({ color: 0xdbeafe, roughness: 0.5 });
        const marbleMat = makeMat({ color: 0xffffff, roughness: 0.2 });
        const corniceBlueMat = makeMat({ color: 0x0284c7, roughness: 0.32 });
        const windowGlassMat = makeMat({
            color: era === '1900' ? 0xfde68a : 0x7dd3fc,
            emissive: era === '1900' ? 0xd97706 : 0x0284c7,
            emissiveIntensity: 0.25,
            roughness: 0.15
        });
        const roofTileMat = makeMat({ color: 0xb45309, roughness: 0.45 });

        // Building heights: 1874 has Ground Floor (0.74) + Piano Nobile (0.96) = 1.70
        // 1937+ has Ground Floor (0.74) + Piano Nobile (0.92) + 2nd Floor (0.76) = 2.42
        const totalWingH = isTwoStory1874 ? 1.70 : 2.42;
        const totalCenterH = isTwoStory1874 ? 1.84 : 2.56;
        const bldgZ = -0.38;

        // 1. Rusticated Stone Ground Floor Base (Ισόγειο με Λιθοδομή)
        addDetailedMesh(group, new THREE.BoxGeometry(5.2, 0.74, 2.24), rusticatedMat, [0, 0.37, bldgZ], null, 0x0369a1);
        // Molded Belt Course Cornice above Ground Floor
        addDetailedMesh(group, new THREE.BoxGeometry(5.32, 0.08, 2.34), marbleMat, [0, 0.76, bldgZ], null, 0x0284c7);

        // 2. Left & Right Symmetrical Neoclassical Wings + Corner Quoin Pilasters
        const upperWingH = totalWingH - 0.74;
        [-1.72, 1.72].forEach(wx => {
            addDetailedMesh(group, new THREE.BoxGeometry(1.76, upperWingH, 2.16), wallMat, [wx, 0.74 + upperWingH / 2, bldgZ], null, 0x0284c7);
            // Intermediate Cornice separating 1st Floor (Piano Nobile) & 1937 2nd Floor
            if (!isTwoStory1874) {
                addDetailedMesh(group, new THREE.BoxGeometry(1.84, 0.06, 2.24), marbleMat, [wx, 1.66, bldgZ], null, 0x0284c7);
            }
            // Top Dentil Cornice & Classical Roof over each Wing
            addDetailedMesh(group, new THREE.BoxGeometry(1.88, 0.1, 2.28), marbleMat, [wx, totalWingH + 0.05, bldgZ], null, 0x0284c7);
            addDetailedMesh(group, createPedimentPrismGeometry(1.84, 0.42, 2.20), roofTileMat, [wx, totalWingH + 0.1, bldgZ], null, 0x7c2d12);
        });

        // 3. Central Projecting Avant-Corps (Κεντρικό Τμήμα Δημαρχείου)
        const upperCenterH = totalCenterH - 0.74;
        addDetailedMesh(group, new THREE.BoxGeometry(1.88, upperCenterH, 2.38), wallMat, [0, 0.74 + upperCenterH / 2, bldgZ + 0.06], null, 0x0369a1);
        if (!isTwoStory1874) {
            addDetailedMesh(group, new THREE.BoxGeometry(1.96, 0.07, 2.44), marbleMat, [0, 1.66, bldgZ + 0.06], null, 0x0284c7);
        }
        addDetailedMesh(group, new THREE.BoxGeometry(2.0, 0.11, 2.48), marbleMat, [0, totalCenterH + 0.05, bldgZ + 0.06], null, 0x0284c7);
        addDetailedMesh(group, createPedimentPrismGeometry(1.96, 0.48, 2.38), roofTileMat, [0, totalCenterH + 0.1, bldgZ + 0.06], null, 0x7c2d12);

        // 4. 3D Sculpted Neoclassical Windows, Frames & Triangular Window Pediments on Both Wings
        const wingWindowX = [-2.28, -1.72, -1.16, 1.16, 1.72, 2.28];
        wingWindowX.forEach(xPos => {
            // Ground Floor Arched Window (+Z)
            addDetailedMesh(group, new THREE.BoxGeometry(0.28, 0.42, 0.08), windowGlassMat, [xPos, 0.38, bldgZ + 1.11], null, 0x0369a1);
            // 1st Floor (Piano Nobile) Tall Window + Marble Frame + Triangular Pediment
            addDetailedMesh(group, new THREE.BoxGeometry(0.34, 0.56, 0.08), marbleMat, [xPos, 1.18, bldgZ + 1.08], null, 0x0284c7);
            addDetailedMesh(group, new THREE.BoxGeometry(0.26, 0.48, 0.10), windowGlassMat, [xPos, 1.18, bldgZ + 1.09], null, 0x0284c7);
            addDetailedMesh(group, createPedimentPrismGeometry(0.38, 0.13, 0.12), corniceBlueMat, [xPos, 1.48, bldgZ + 1.10], null, 0x38bdf8);

            // 2nd Floor (1937 Addition) Windows
            if (!isTwoStory1874) {
                addDetailedMesh(group, new THREE.BoxGeometry(0.32, 0.42, 0.08), marbleMat, [xPos, 2.02, bldgZ + 1.08], null, 0x0284c7);
                addDetailedMesh(group, new THREE.BoxGeometry(0.24, 0.34, 0.10), windowGlassMat, [xPos, 2.02, bldgZ + 1.09], null, 0x0284c7);
            }
        });

        // 5. Protruding Classical Marble Portico, 3 Arched Doors, Ceremonial Balcony & 4 Columns
        const porticoZ = bldgZ + 1.42;
        // Ground-floor projecting rusticated loggia with 3 arched doors
        addDetailedMesh(group, new THREE.BoxGeometry(1.84, 0.74, 0.56), rusticatedMat, [0, 0.37, porticoZ], null, 0x0369a1);
        [-0.54, 0, 0.54].forEach(dx => {
            // Ground floor arched entrance doors
            addDetailedMesh(group, new THREE.BoxGeometry(0.32, 0.52, 0.08), windowGlassMat, [dx, 0.32, porticoZ + 0.27], null, 0x0f172a);
            // 1st Floor Ceremonial French Doors opening onto the Balcony
            addDetailedMesh(group, new THREE.BoxGeometry(0.34, 0.62, 0.08), windowGlassMat, [dx, 1.18, bldgZ + 1.25], null, 0x0284c7);
            if (!isTwoStory1874) {
                addDetailedMesh(group, new THREE.BoxGeometry(0.30, 0.42, 0.08), windowGlassMat, [dx, 2.02, bldgZ + 1.25], null, 0x0284c7);
            }
        });

        // Ceremonial 1st-Floor Marble Balcony Slab & Carved Balustrade
        addDetailedMesh(group, new THREE.BoxGeometry(1.98, 0.10, 0.68), marbleMat, [0, 0.78, porticoZ + 0.02], null, 0x0284c7);
        addDetailedMesh(group, new THREE.BoxGeometry(1.94, 0.16, 0.06), corniceBlueMat, [0, 0.90, porticoZ + 0.31], null, 0x38bdf8);

        // 4 Classical Fluted Columns supporting the Portico Pediment
        const colH = isTwoStory1874 ? 0.92 : 1.56;
        const colBaseY = 0.83;
        [-0.72, -0.24, 0.24, 0.72].forEach(cx => {
            addDetailedMesh(group, new THREE.BoxGeometry(0.18, 0.08, 0.18), marbleMat, [cx, colBaseY + 0.04, porticoZ + 0.20], null, 0x0284c7);
            addDetailedMesh(group, new THREE.CylinderGeometry(0.065, 0.082, colH, 16), marbleMat, [cx, colBaseY + colH / 2, porticoZ + 0.20], null, 0x0284c7);
            addDetailedMesh(group, new THREE.BoxGeometry(0.20, 0.09, 0.20), marbleMat, [cx, colBaseY + colH, porticoZ + 0.20], null, 0x0369a1);
        });

        // Classical Portico Entablature, Triangular Marble Pediment, Tympanum Relief & Acroteria
        const entablatureY = colBaseY + colH + 0.08;
        addDetailedMesh(group, new THREE.BoxGeometry(2.02, 0.14, 0.64), marbleMat, [0, entablatureY, porticoZ + 0.02], null, 0x0284c7);
        addDetailedMesh(group, createPedimentPrismGeometry(2.08, 0.56, 0.66), marbleMat, [0, entablatureY + 0.07, porticoZ + 0.02], null, 0x0284c7);
        addDetailedMesh(group, createPedimentPrismGeometry(1.72, 0.40, 0.69), corniceBlueMat, [0, entablatureY + 0.10, porticoZ + 0.02], null, 0x38bdf8);
        // Owl of Athena Medallion in the center of the Pediment Tympanum
        addDetailedMesh(group, new THREE.CylinderGeometry(0.13, 0.13, 0.08, 16), marbleMat, [0, entablatureY + 0.26, porticoZ + 0.35], [Math.PI / 2, 0, 0], 0xffffff);
        // Apex Acroterion & Greek Flagpole atop the City Hall
        addDetailedMesh(group, new THREE.BoxGeometry(0.12, 0.18, 0.12), corniceBlueMat, [0, entablatureY + 0.68, porticoZ + 0.26], null, 0x38bdf8);
        addDetailedMesh(group, new THREE.CylinderGeometry(0.02, 0.02, 0.65, 8), marbleMat, [0, entablatureY + 0.95, porticoZ + 0.26], null, 0x94a3b8);
        addDetailedMesh(group, new THREE.BoxGeometry(0.36, 0.22, 0.03), corniceBlueMat, [0.18, entablatureY + 1.15, porticoZ + 0.26], null, 0xffffff);

        // 6. Kotzia Square Archaeological Excavation Trench (479 BC Ancient Acharnian Gate & Classical Road)
        if (era === 'today') {
            const trenchWallMat = makeMat({ color: 0x334155, roughness: 0.85 });
            const ancientLimestoneMat = makeMat({ color: 0xd6d3d1, roughness: 0.75 });
            const ancientRoadMat = makeMat({ color: 0xa8a29e, roughness: 0.9 });
            const glassRailMat = makeMat({ color: 0x38bdf8, transparent: true, opacity: 0.45 });

            addDetailedMesh(group, new THREE.BoxGeometry(3.8, 0.16, 1.05), trenchWallMat, [0, 0.04, 2.02], null, 0x0284c7);
            addDetailedMesh(group, new THREE.BoxGeometry(3.5, 0.06, 0.88), ancientRoadMat, [0, 0.08, 2.02], null, 0x94a3b8);
            addDetailedMesh(group, new THREE.BoxGeometry(3.84, 0.22, 0.04), glassRailMat, [0, 0.18, 1.50], null, 0x38bdf8);
            addDetailedMesh(group, new THREE.BoxGeometry(3.84, 0.22, 0.04), glassRailMat, [0, 0.18, 2.54], null, 0x38bdf8);

            addDetailedMesh(group, new THREE.BoxGeometry(1.25, 0.32, 0.22), ancientLimestoneMat, [-0.95, 0.22, 1.92], [0, 0.18, 0], 0x64748b);
            addDetailedMesh(group, new THREE.BoxGeometry(1.15, 0.28, 0.22), ancientLimestoneMat, [0.95, 0.20, 2.10], [0, -0.15, 0], 0x64748b);
            addDetailedMesh(group, new THREE.CylinderGeometry(0.30, 0.32, 0.3, 14), ancientLimestoneMat, [-0.15, 0.21, 2.06], null, 0x0284c7);
        }

    } else if (exhibit.svgStyle === 'parthenon') {
        // =============================================================
        // #11 THE ACROPOLIS & PARTHENON (447–432 BC OCTASTYLE DORIC TEMPLE ON THE SACRED ROCK)
        // =============================================================
        const acropolisRockMat = makeMat({ color: 0xcbd5e1, roughness: 0.82 });
        const kimoliaWallMat = makeMat({ color: 0x94a3b8, roughness: 0.7 });
        const pentelicMat = makeMat({ color: era === '1900' ? 0xfef3c7 : 0xffffff, roughness: 0.22 });
        const cellaMat = makeMat({ color: 0xf8fafc, roughness: 0.35 });
        const panathenaicFriezeMat = makeMat({ color: 0x0284c7, roughness: 0.3 });
        const goldAthenaMat = makeMat({ color: 0xfbbf24, metalness: 0.75, roughness: 0.2, emissive: 0xd97706, emissiveIntensity: 0.35 });

        // 1. Sacred Rock of the Acropolis & Classical Fortification Wall Base
        addDetailedMesh(group, new THREE.CylinderGeometry(3.45, 3.85, 0.42, 12), acropolisRockMat, [0, 0.21, 0], null, 0x64748b);
        addDetailedMesh(group, new THREE.BoxGeometry(4.9, 0.24, 6.5), kimoliaWallMat, [0, 0.48, 0], null, 0x475569);

        // 2. Three-Stepped Pentelic Marble Crepidoma & Curved Stylobate
        addDetailedMesh(group, new THREE.BoxGeometry(4.65, 0.12, 6.25), pentelicMat, [0, 0.66, 0], null, 0x94a3b8);
        addDetailedMesh(group, new THREE.BoxGeometry(4.45, 0.12, 6.05), pentelicMat, [0, 0.78, 0], null, 0x0284c7);

        // 3. Inner Naos (Cella), Opisthodomos & Panathenaic Frieze Band + Golden Athena Parthenos Statue Inside
        addDetailedMesh(group, new THREE.BoxGeometry(2.55, 1.68, 3.85), cellaMat, [0, 1.68, 0], null, 0x0369a1);
        addDetailedMesh(group, new THREE.BoxGeometry(2.62, 0.22, 3.92), panathenaicFriezeMat, [0, 2.38, 0], null, 0x38bdf8);
        // Phidias' Chryselephantine Statue of Athena Parthenos inside the Cella (glows in X-Ray & 360 view)
        addDetailedMesh(group, new THREE.CylinderGeometry(0.16, 0.22, 1.25, 12), goldAthenaMat, [0, 1.52, 0.35], null, 0xf59e0b);

        // 4. Octastyle (8 Front & 8 Back Columns x 11 Side Columns) Peripteral Doric Colonnade
        const octastyleX = [-1.89, -1.35, -0.81, -0.27, 0.27, 0.81, 1.35, 1.89];
        const flankZ = [-2.7, -2.16, -1.62, -1.08, -0.54, 0, 0.54, 1.08, 1.62, 2.16, 2.7];
        const parthenonCols = [];

        octastyleX.forEach(cx => {
            parthenonCols.push([cx, 2.7]);
            parthenonCols.push([cx, -2.7]);
        });
        for (let i = 1; i < flankZ.length - 1; i++) {
            parthenonCols.push([-1.89, flankZ[i]]);
            parthenonCols.push([1.89, flankZ[i]]);
        }

        parthenonCols.forEach(([cx, cz]) => {
            // Doric Fluted Column Shaft with Entasis
            addDetailedMesh(group, new THREE.CylinderGeometry(0.095, 0.125, 1.65, 14), pentelicMat, [cx, 1.66, cz], null, 0x0284c7);
            // Doric Echinus & Abacus Capital
            addDetailedMesh(group, new THREE.BoxGeometry(0.28, 0.08, 0.28), pentelicMat, [cx, 2.52, cz], null, 0x0369a1);
        });

        // 5. Architrave & Sculpted Doric Frieze (Metopes & Triglyphs)
        addDetailedMesh(group, new THREE.BoxGeometry(4.18, 0.18, 5.76), pentelicMat, [0, 2.65, 0], null, 0x0284c7);
        addDetailedMesh(group, new THREE.BoxGeometry(4.22, 0.22, 5.80), cellaMat, [0, 2.85, 0], null, 0x0369a1);
        for (let tx = -1.89; tx <= 1.9; tx += 0.27) {
            addDetailedMesh(group, new THREE.BoxGeometry(0.09, 0.20, 0.05), panathenaicFriezeMat, [tx, 2.85, 2.91], null, 0x38bdf8);
            addDetailedMesh(group, new THREE.BoxGeometry(0.09, 0.20, 0.05), panathenaicFriezeMat, [tx, 2.85, -2.91], null, 0x38bdf8);
        }

        // 6. Iconic Triangular Pediments of Phidias (Birth of Athena & Contest of Athena and Poseidon)
        addDetailedMesh(group, new THREE.BoxGeometry(4.36, 0.08, 5.95), pentelicMat, [0, 3.0, 0], null, 0x0284c7);
        const parthenonRoofGeo = createPedimentPrismGeometry(4.34, 0.86, 5.90);
        addDetailedMesh(group, parthenonRoofGeo, pentelicMat, [0, 3.04, 0], null, 0x0284c7);
        const parthenonTympanum = createPedimentPrismGeometry(3.68, 0.64, 5.96);
        addDetailedMesh(group, parthenonTympanum, panathenaicFriezeMat, [0, 3.06, 0], null, 0x38bdf8);

        // Pedimental Sculptures of Phidias on the East Facade (+Z)
        [-0.85, -0.42, 0, 0.42, 0.85].forEach((sx, sIdx) => {
            const sh = sIdx === 2 ? 0.42 : (sIdx === 1 || sIdx === 3 ? 0.30 : 0.18);
            addDetailedMesh(group, new THREE.CylinderGeometry(0.05, 0.07, sh, 8), goldAthenaMat, [sx, 3.06 + sh / 2, 2.98], null, 0xffffff);
        });

    } else if (exhibit.svgStyle === 'ancient_temple' || exhibit.svgStyle === 'ancient_tower') {
        // =============================================================
        // ROOM I (ANCIENT ATHENS): #07 TEMPLE OF HEPHAESTUS (AUTHENTIC DORIC PERIPTERAL TEMPLE) & #08 TOWER OF THE WINDS
        // =============================================================
        const pentelicMarbleMat = makeMat({ color: era === '1900' ? 0xfef3c7 : 0xffffff, roughness: 0.26 });
        const cellaWallMat = makeMat({ color: 0xf1f5f9, roughness: 0.38 });
        const triglyphBlueMat = makeMat({ color: 0x0284c7, roughness: 0.35 });
        const tympanumReliefMat = makeMat({ color: era === '1900' ? 0xb45309 : 0x0369a1, roughness: 0.4 });
        const marbleTileRoofMat = makeMat({ color: era === '1900' ? 0xd97706 : 0xe2e8f0, roughness: 0.35 });
        const bronzeDoorMat = makeMat({ color: 0x78350f, metalness: 0.65, roughness: 0.3 });

        if (exhibit.svgStyle === 'ancient_tower') {
            // #08 OCTAGONAL HOROLOGION OF KYRRHESTOS (TOWER OF THE WINDS)
            addDetailedMesh(group, new THREE.CylinderGeometry(1.75, 1.85, 0.28, 8), pentelicMarbleMat, [0, 0.14, 0], null, 0x0284c7);
            addDetailedMesh(group, new THREE.CylinderGeometry(1.45, 1.45, 2.65, 8), pentelicMarbleMat, [0, 1.6, 0], null, 0x0284c7);
            addDetailedMesh(group, new THREE.CylinderGeometry(1.52, 1.52, 0.48, 8), triglyphBlueMat, [0, 2.75, 0], null, 0x38bdf8);
            addDetailedMesh(group, new THREE.ConeGeometry(1.68, 0.95, 8), marbleTileRoofMat, [0, 3.45, 0], null, 0x0284c7);
            addDetailedMesh(group, new THREE.BoxGeometry(1.1, 1.45, 0.85), pentelicMarbleMat, [0, 0.85, 1.55], null, 0x0284c7);
            addDetailedMesh(group, createPedimentPrismGeometry(1.2, 0.38, 0.9), triglyphBlueMat, [0, 1.58, 1.55], null, 0x38bdf8);
        } else {
            // #07 TEMPLE OF HEPHAESTUS — THISEIO (449 BC DORIC PERIPTERAL TEMPLE)
            // 1. Three-Stepped Pentelic Marble Crepidoma & Stylobate
            addDetailedMesh(group, new THREE.BoxGeometry(4.6, 0.14, 6.2), pentelicMarbleMat, [0, 0.07, 0], null, 0x94a3b8);
            addDetailedMesh(group, new THREE.BoxGeometry(4.3, 0.14, 5.9), pentelicMarbleMat, [0, 0.21, 0], null, 0x64748b);
            addDetailedMesh(group, new THREE.BoxGeometry(4.0, 0.16, 5.6), pentelicMarbleMat, [0, 0.36, 0], null, 0x0284c7);

            // 2. Inner Cella (Naos), Pronaos & Opisthodomos Sanctuary Walls + Bronze Doors
            addDetailedMesh(group, new THREE.BoxGeometry(2.2, 1.78, 3.6), cellaWallMat, [0, 1.33, 0], null, 0x0369a1);
            addDetailedMesh(group, new THREE.BoxGeometry(0.75, 1.35, 0.08), bronzeDoorMat, [0, 1.12, 1.82], null, 0xf59e0b);

            // 3. Peripteral Doric Colonnade (6 Front & 6 Back Columns x 9 Side Columns) with Fluted Shafts, Echinus & Abacus Capitals
            const colPositions = [];
            const frontBackX = [-1.7, -1.02, -0.34, 0.34, 1.02, 1.7];
            const sideZ = [-2.48, -1.86, -1.24, -0.62, 0, 0.62, 1.24, 1.86, 2.48];

            // Front (+Z) and Back (-Z) 6-Column Hexastyle Facades
            frontBackX.forEach(cx => {
                colPositions.push([cx, 2.48]);
                colPositions.push([cx, -2.48]);
            });
            // Left (-X) and Right (+X) Peripteral Flanks (excluding corners already added)
            for (let i = 1; i < sideZ.length - 1; i++) {
                colPositions.push([-1.7, sideZ[i]]);
                colPositions.push([1.7, sideZ[i]]);
            }

            colPositions.forEach(([cx, cz]) => {
                // Doric Fluted Shaft (Tapered upward with entasis)
                addDetailedMesh(group, new THREE.CylinderGeometry(0.105, 0.135, 1.66, 14), pentelicMarbleMat, [cx, 1.27, cz], null, 0x0284c7);
                // Doric Echinus Ring
                addDetailedMesh(group, new THREE.CylinderGeometry(0.155, 0.11, 0.07, 14), pentelicMarbleMat, [cx, 2.13, cz], null, 0x0369a1);
                // Doric Square Abacus Capital Block
                addDetailedMesh(group, new THREE.BoxGeometry(0.32, 0.07, 0.32), pentelicMarbleMat, [cx, 2.20, cz], null, 0x0284c7);
            });

            // 4. Doric Entablature: Smooth Architrave (Epistyle) + Sculpted Triglyph & Metope Frieze
            addDetailedMesh(group, new THREE.BoxGeometry(3.82, 0.20, 5.38), pentelicMarbleMat, [0, 2.34, 0], null, 0x0284c7);
            addDetailedMesh(group, new THREE.BoxGeometry(3.86, 0.24, 5.42), cellaWallMat, [0, 2.56, 0], null, 0x0369a1);

            // Blue Doric Triglyph Tablets along the Front & Back Friezes (Labors of Theseus & Heracles)
            for (let tx = -1.7; tx <= 1.71; tx += 0.34) {
                addDetailedMesh(group, new THREE.BoxGeometry(0.11, 0.22, 0.06), triglyphBlueMat, [tx, 2.56, 2.71], null, 0x38bdf8);
                addDetailedMesh(group, new THREE.BoxGeometry(0.11, 0.22, 0.06), triglyphBlueMat, [tx, 2.56, -2.71], null, 0x38bdf8);
            }

            // 5. True Triangular Classical Pediment & Pitched Marble Roof (facing front +Z and back -Z)
            addDetailedMesh(group, new THREE.BoxGeometry(4.06, 0.09, 5.62), pentelicMarbleMat, [0, 2.72, 0], null, 0x0284c7);
            const templeRoofGeo = createPedimentPrismGeometry(4.04, 0.82, 5.56);
            addDetailedMesh(group, templeRoofGeo, marbleTileRoofMat, [0, 2.76, 0], null, 0x0284c7);

            // Recessed Sculpted Tympanum & Pedimental Statues on East (+Z) & West (-Z) Facades
            const tympanumPrism = createPedimentPrismGeometry(3.35, 0.62, 5.62);
            addDetailedMesh(group, tympanumPrism, tympanumReliefMat, [0, 2.78, 0], null, 0x38bdf8);
            // Pedimental Sculptural Group (Hephaestus, Athena & Theseus in the East Pediment)
            [-0.65, -0.22, 0, 0.22, 0.65].forEach((sx, sIdx) => {
                const sh = sIdx === 2 ? 0.38 : (sIdx === 1 || sIdx === 3 ? 0.28 : 0.18);
                addDetailedMesh(group, new THREE.CylinderGeometry(0.05, 0.07, sh, 8), pentelicMarbleMat, [sx, 2.78 + sh / 2, 2.79], null, 0xffffff);
            });

            // Apex & Corner Acroteria Statues
            addDetailedMesh(group, new THREE.CylinderGeometry(0.06, 0.1, 0.28, 10), triglyphBlueMat, [0, 3.72, 2.72], null, 0x38bdf8);
            addDetailedMesh(group, new THREE.CylinderGeometry(0.06, 0.1, 0.28, 10), triglyphBlueMat, [0, 3.72, -2.72], null, 0x38bdf8);
        }

    } else if (exhibit.svgStyle === 'byzantine_church') {
        // =============================================================
        // ROOM II (BYZANTINE ATHENS): #09 PANAGIA KAPNIKAREA & #10 AGIOI ASOMATOI
        // (cross-in-square church)
        // =============================================================
        const cloisonneTex = createArchitecturalTexture('brick_gazi', era);
        const cloisonneMat = makeMat({ map: cloisonneTex, roughness: 0.48 });
        const stoneTrimMat = makeMat({ color: 0xf8fafc, roughness: 0.35 });
        const domeTileMat = makeMat({ color: 0xb45309, roughness: 0.45 });

        // Cross-in-Square Lower Sanctuary Body & Narthex
        addDetailedMesh(group, new THREE.BoxGeometry(3.4, 1.65, 2.5), cloisonneMat, [0, 0.82, 0], null, 0x7c2d12);
        // Cruciform Transverse & Longitudinal Vaulted Gables (Σταυροειδείς Κεραίες) + Pitched Tile Roofs
        addDetailedMesh(group, new THREE.BoxGeometry(1.5, 2.15, 2.85), cloisonneMat, [0, 1.08, 0], null, 0x0284c7);
        addDetailedMesh(group, createPedimentPrismGeometry(1.62, 0.42, 2.92), domeTileMat, [0, 2.15, 0], null, 0x7c2d12);
        addDetailedMesh(group, new THREE.BoxGeometry(3.75, 2.15, 1.45), cloisonneMat, [0, 1.08, 0], null, 0x0284c7);

        // Eastern Three-Sided Sanctuary Apse (Ιερό Βήμα)
        addDetailedMesh(group, new THREE.CylinderGeometry(0.65, 0.68, 1.45, 6), cloisonneMat, [2.0, 0.72, 0], null, 0x7c2d12);

        // Signature Octagonal "Athenian Dome" (Αθηναϊκός Τρούλος) + Cross
        addDetailedMesh(group, new THREE.CylinderGeometry(0.78, 0.82, 1.15, 8), stoneTrimMat, [0, 2.55, 0], null, 0x0284c7);
        addDetailedMesh(group, new THREE.SphereGeometry(0.82, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), domeTileMat, [0, 3.08, 0], null, 0x38bdf8);
        // Byzantine Cross atop the Dome
        addDetailedMesh(group, new THREE.BoxGeometry(0.08, 0.55, 0.08), stoneTrimMat, [0, 4.05, 0], null, 0x38bdf8);
        addDetailedMesh(group, new THREE.BoxGeometry(0.34, 0.08, 0.08), stoneTrimMat, [0, 4.12, 0], null, 0x38bdf8);

    } else {
        // =============================================================
        // ANY OTHER EXHIBIT: a generic neoclassical building
        // =============================================================
        const neoTex = createArchitecturalTexture('neoclassical_palace', era);
        const neoMat = makeMat({ map: neoTex, roughness: 0.4 });
        const marbleMat = makeMat({ color: 0xffffff, roughness: 0.25 });
        const roofMat = makeMat({ color: exhibit.id === 4 ? 0x0284c7 : 0xb45309, roughness: 0.4, metalness: exhibit.id === 4 ? 0.5 : 0.1 });

        // Historical Evolution of Athens City Hall (#06): 2 floors in 1874 ('1900'), 3 floors after 1937 ('1950' & 'today')
        const bodyHeight = (exhibit.id === 5 && era === '1900') ? 1.75 : 2.45;

        // Main Neoclassical Palace / Agora Wings
        addDetailedMesh(group, new THREE.BoxGeometry(4.8, bodyHeight, 2.6), neoMat, [0, bodyHeight / 2, -0.15], null, 0x0284c7);

        // Protruding Central Classical Propylon (Entrance Projection)
        addDetailedMesh(group, new THREE.BoxGeometry(2.1, bodyHeight + 0.1, 0.55), marbleMat, [0, (bodyHeight + 0.1) / 2, 1.32], null, 0x0369a1);

        // 4 Fluted Ionic/Doric Columns on Marble Stylobate Steps
        addDetailedMesh(group, new THREE.BoxGeometry(2.3, 0.2, 0.8), marbleMat, [0, 0.1, 1.48], null, 0x94a3b8);
        [-0.82, -0.28, 0.28, 0.82].forEach(cx => {
            addDetailedMesh(group, new THREE.CylinderGeometry(0.11, 0.13, bodyHeight - 0.15, 16), marbleMat, [cx, bodyHeight / 2, 1.68], null, 0x0284c7);
        });

        // Triangular Classical Pediment & Pitched Roof
        addDetailedMesh(group, new THREE.ConeGeometry(1.65, 0.78, 4), marbleMat, [0, bodyHeight + 0.44, 1.38], [0, Math.PI / 4, 0], 0x0284c7);
        addDetailedMesh(group, new THREE.ConeGeometry(3.4, 0.95, 4), roofMat, [0, bodyHeight + 0.46, -0.15], [0, Math.PI / 4, 0], 0x7c2d12);

        // Archaeological Excavation Pit (Σκάμμα Πλατείας Κοτζιά - Ancient Acharnian Gate) for City Hall Today
        if (exhibit.id === 5 && era === 'today') {
            const ruinMat = makeMat({ color: 0xd6d3d1, roughness: 0.8 });
            const pitMat = makeMat({ color: 0x0f172a, roughness: 0.9 });
            addDetailedMesh(group, new THREE.BoxGeometry(3.2, 0.08, 0.95), pitMat, [0, 0.02, 2.22], null, 0x38bdf8);
            addDetailedMesh(group, new THREE.BoxGeometry(1.1, 0.28, 0.18), ruinMat, [-0.7, 0.14, 2.2], [0, 0.2, 0], 0x94a3b8);
            addDetailedMesh(group, new THREE.BoxGeometry(1.2, 0.24, 0.18), ruinMat, [0.65, 0.12, 2.25], [0, -0.15, 0], 0x94a3b8);
        }
    }

    return smoke;
}

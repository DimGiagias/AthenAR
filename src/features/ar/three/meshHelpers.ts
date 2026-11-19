// Mesh and geometry helpers shared by the procedural models.
import * as THREE from 'three';

let xrayMode = false;

/** Set before building a model: x-ray draws brighter, more opaque edges. */
export function setXrayMode(enabled: boolean): void {
    xrayMode = enabled;
}

/** Add a mesh with crisp architectural edge outlines. */
export function addDetailedMesh(
    parent: THREE.Object3D,
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    pos?: number[] | null,
    rot?: number[] | null,
    edgeColor = 0x0284c7,
): THREE.Mesh {
    const mesh = new THREE.Mesh(geometry, material);
    if (pos) mesh.position.set(pos[0], pos[1], pos[2]);
    if (rot) mesh.rotation.set(rot[0], rot[1], rot[2]);
    parent.add(mesh);

    const edges = new THREE.EdgesGeometry(geometry, 22);
    const lineMat = new THREE.LineBasicMaterial({
        color: xrayMode ? 0x38bdf8 : edgeColor,
        transparent: true,
        opacity: xrayMode ? 0.85 : 0.35,
    });
    const line = new THREE.LineSegments(edges, lineMat);
    mesh.add(line);
    return mesh;
}

/** Triangular pediment / gable roof prism (faces front +Z and back -Z). */
export function createPedimentPrismGeometry(width: number, height: number, depth: number): THREE.ExtrudeGeometry {
    const shape = new THREE.Shape();
    shape.moveTo(-width / 2, 0);
    shape.lineTo(width / 2, 0);
    shape.lineTo(0, height);
    shape.closePath();

    const geo = new THREE.ExtrudeGeometry(shape, { steps: 1, depth, bevelEnabled: false });
    geo.translate(0, 0, -depth / 2);
    return geo;
}

/** Barrel-vaulted skylight roof (faces front +Z and back -Z). */
export function createBarrelVaultGeometry(width: number, height: number, depth: number): THREE.ExtrudeGeometry {
    const shape = new THREE.Shape();
    shape.moveTo(-width / 2, 0);
    shape.absarc(0, 0, width / 2, Math.PI, 0, true);
    shape.closePath();

    const geo = new THREE.ExtrudeGeometry(shape, { steps: 1, depth, bevelEnabled: false });
    geo.scale(1, height / (width / 2), 1);
    geo.translate(0, 0, -depth / 2);
    return geo;
}

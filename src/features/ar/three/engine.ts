// Three.js scene for the 3D hologram: renderer, lights, drag-to-orbit, the
// animation loop and the three ways of anchoring it to the real world:
//  - direction-anchored: the camera turns with the compass (outdoors, GPS);
//  - image-anchored: the model sits on a tracked picture (setImageTracking);
//  - room-anchored: WebXR tracks the phone and the model stands on the real
//    floor, so you can walk around it (setRoomMode, driven by roomSession.ts).
// Owns its own objects; talks to the rest of the app only through
// the functions exported here.
import * as THREE from 'three';
import type { XRFrame } from 'three/src/renderers/webxr/WebXR';
import type { Exhibit } from '../../../data/types';
import { getHeading, getPitch } from '../../../platform/compass';
import { signedAngleDelta } from '../../../platform/geoMath';
import { getDeviceAngles } from '../../../platform/motion';
import { buildMonumentMesh } from './models';

/** Where hotspot pins sit on a model, in model space. Cycles when there are more pins. */
const HOTSPOT_ANCHORS: Array<[number, number, number]> = [
    [-2.1, 1.2, 1.6],
    [2.0, 2.1, 1.4],
    [0.0, 0.5, 2.3],
    [0.4, 2.8, 0.0],
    [-1.2, 2.6, 0.9],
    [1.5, 0.9, 2.0],
    [-2.4, 0.5, -0.6],
    [2.3, 1.4, -0.8],
];

const AUTO_SPIN_PER_FRAME = 0.0032;
const DEFAULT_ROT_Y = 0.55;
const DEFAULT_ROT_X = 0.18;
/**
 * Anchored mode: how much the virtual camera turns per degree the phone
 * turns. Below 1 because the phone camera sees a wider angle than the 40°
 * virtual one, so the hologram should drift across the screen at the same
 * pace as the real scene behind it.
 */
const ANCHOR_GAIN = 0.75;
const ANCHOR_SMOOTHING = 0.2;
const DEG = Math.PI / 180;
const WORLD_UP = new THREE.Vector3(0, 1, 0);
/** Image-anchored: start slightly turned so the model reads as 3D, not a flat facade. */
const TRACKED_ROT_Y = 0.4;
/**
 * Smoothing of the tracked pose. The tracker reports 10-30 slightly noisy
 * poses a second; the model eases towards the latest one every frame. When
 * still it eases slowly (hides jitter); the further the pose jumps, the
 * faster it follows (no lag when the phone really moves).
 */
const SMOOTH_TIME_S = 0.22;
const SMOOTH_MOVE_GAIN = 25; // per image-width of movement
const SMOOTH_TURN_GAIN = 10; // per radian of turn

/** What the image tracker reports about the camera. */
export interface TrackingCamera {
    /** OpenGL projection matrix of the camera input, column-major. */
    projection: number[];
    inputWidth: number;
    inputHeight: number;
}

/** How the model is placed on a tracked image. */
export interface TrackedTarget {
    /** Image size in the units of the pose matrix. */
    width: number;
    height: number;
    placement: 'upright' | 'flat';
    /** Model width as a share of the image width. */
    modelWidth: number;
}

let container: HTMLElement | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let renderer: THREE.WebGLRenderer | null = null;
let group: THREE.Group | null = null;
let smoke: THREE.Object3D[] = [];

let dragging = false;
let prevX = 0;
let prevY = 0;
let targetRotY = DEFAULT_ROT_Y;
let targetRotX = DEFAULT_ROT_X;
const zoomDist = 11.2;

let active = false;
let onFrame: (() => void) | null = null;
/** Bearing to the real building, or null for the free-orbit hologram. */
let anchorBearing: number | null = null;
let anchorYaw = 0;
let anchorPitch = 0;

/** Image-anchored mode: set while the image tracker runs. */
let tracking: TrackingCamera | null = null;
/** Follows the tracked image; the model group hangs from it in that mode. */
let trackRoot: THREE.Group | null = null;
let trackedZoom = 1;
/** Where the tracker last saw the image (camera space, before zoom/offset). */
const goal = { pos: new THREE.Vector3(), quat: new THREE.Quaternion(), scale: new THREE.Vector3(1, 1, 1) };
/** What is drawn: eases towards `goal`. */
const shown = { pos: new THREE.Vector3(), quat: new THREE.Quaternion(), scale: new THREE.Vector3(1, 1, 1) };
/** Model lift so it stands on / centres on the image, in model units. */
let trackedLift = 0;
let trackedImageWidth = 1;
/**
 * Image out of view: the model stays where it was in the room, using the
 * phone's gyroscope. `holdWorld` is the model in room space at that moment;
 * null while the image is in view (or no model yet).
 */
let holdWorld: THREE.Matrix4 | null = null;
let lastFrameTime = 0;
/** Bounds of the current model in its own space, for fitting it on the image. */
let modelBox = new THREE.Box3(new THREE.Vector3(-3, 0, -2), new THREE.Vector3(3, 4, 2));

/** Room-anchored mode: the model group stands in this, on the floor. Null when off. */
let roomRoot: THREE.Group | null = null;
/** Ring on the floor where a tap would put the model. */
let reticle: THREE.Mesh | null = null;
let roomFrameHook: ((frame: XRFrame) => void) | null = null;
/** Extra turn from the rotate ruler or the turntable, on top of facing the visitor. Never wrapped. */
let roomTurn = 0;
let roomFacing = 0;
/** Turntable speed: 30° a second. */
const TURNTABLE_SPEED = Math.PI / 6;
let roomSpin = false;
/** While set, the model eases to this turn (reset: the front, the short way round). */
let roomTurnGoal: number | null = null;
/** When a finger last turned the model: the turntable waits while it is held. */
let lastHandTurn = 0;

export function initEngine(host: HTMLElement, frameCallback: () => void): boolean {
    container = host;
    onFrame = frameCallback;
    try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
        return false; // no WebGL: the 2D drawings still work
    }
    const w = host.clientWidth || 360;
    const h = host.clientHeight || 365;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 120);
    camera.position.set(0, 3.8, zoomDist);
    camera.lookAt(0, 1.3, 0);

    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    host.innerHTML = '';
    host.appendChild(renderer.domElement);

    // Studio architectural lighting
    const hemi = new THREE.HemisphereLight(0xffffff, 0xbae6fd, 0.95);
    hemi.position.set(0, 18, 0);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xffffff, 0.9);
    sun.position.set(10, 18, 12);
    scene.add(sun);
    const rim = new THREE.DirectionalLight(0x38bdf8, 0.55);
    rim.position.set(-10, 8, -10);
    scene.add(rim);

    group = new THREE.Group();
    scene.add(group);

    trackRoot = new THREE.Group();
    trackRoot.matrixAutoUpdate = false;
    trackRoot.visible = false;
    scene.add(trackRoot);

    // Pointer / touch 360° orbit
    const canvas = renderer.domElement;
    canvas.addEventListener('pointerdown', (e) => {
        dragging = true;
        prevX = e.clientX;
        prevY = e.clientY;
    });
    window.addEventListener('pointermove', (e) => {
        if (!dragging) return;
        targetRotY += (e.clientX - prevX) * 0.012;
        // On a tracked image, tilting comes from moving the phone.
        if (!tracking) targetRotX = Math.max(-0.2, Math.min(0.65, targetRotX + (e.clientY - prevY) * 0.008));
        prevX = e.clientX;
        prevY = e.clientY;
    });
    window.addEventListener('pointerup', () => {
        dragging = false;
    });
    window.addEventListener('resize', resizeEngine);

    renderer.setAnimationLoop(animate);
    return true;
}

export function resizeEngine(): void {
    if (!container || !renderer || !camera || renderer.xr.isPresenting) return;
    const w = container.clientWidth || 360;
    const h = container.clientHeight || 365;
    camera.aspect = w / h;
    if (tracking) applyTrackingProjection(w, h);
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
}

/**
 * Match the virtual camera to the phone camera, as the live video is shown
 * (object-fit: cover, centred), so the model lines up with the image on screen.
 * Same maths as MindAR's own three.js add-on.
 */
function applyTrackingProjection(w: number, h: number): void {
    if (!camera || !tracking) return;
    const { projection: p, inputWidth, inputHeight } = tracking;
    const shownHeight = inputHeight * Math.max(w / inputWidth, h / inputHeight);
    camera.fov = (2 * Math.atan((1 / p[5]) * (h / shownHeight)) * 180) / Math.PI;
    camera.near = p[14] / (p[10] - 1);
    camera.far = p[14] / (p[10] + 1);
    camera.position.set(0, 0, 0);
    camera.quaternion.identity();
}

/**
 * Switch image-anchored mode on (with the tracker's camera) or off (null).
 * While on, the model is hidden until setTrackedPose first reports the image.
 */
export function setImageTracking(cam: TrackingCamera | null): void {
    if (!scene || !group || !trackRoot || !camera) return;
    holdWorld = null;
    if (cam) {
        if (!tracking) {
            targetRotY = TRACKED_ROT_Y;
            group.rotation.y = TRACKED_ROT_Y;
            trackedZoom = 1;
        }
        tracking = cam;
        targetRotX = 0;
        group.rotation.x = 0;
        trackRoot.add(group);
        trackRoot.visible = false;
        resizeEngine();
        return;
    }
    if (!tracking) return;
    tracking = null;
    scene.add(group);
    trackRoot.visible = false;
    targetRotX = DEFAULT_ROT_X;
    camera.fov = 40;
    camera.near = 0.1;
    camera.far = 120;
    camera.quaternion.identity();
    camera.position.set(0, 3.8, zoomDist);
    camera.lookAt(0, 1.3, 0);
    resizeEngine();
}

export function isImageTracking(): boolean {
    return tracking !== null;
}

const poseMatrix = new THREE.Matrix4();
const placeMatrix = new THREE.Matrix4();
const stepMatrix = new THREE.Matrix4();
const holdMatrix = new THREE.Matrix4();
const cameraQuat = new THREE.Quaternion();
const eulerYXZ = new THREE.Euler();
const BACK_CAMERA = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));
const SCREEN_AXIS = new THREE.Vector3(0, 0, 1);
const screenTurn = new THREE.Quaternion();

/**
 * Direction the phone's camera looks, in room space (y up), from the
 * gyroscope; null if the phone reports no orientation. Same maths as three.js'
 * DeviceOrientationControls.
 */
function cameraOrientation(): THREE.Quaternion | null {
    const a = getDeviceAngles();
    if (!a) return null;
    eulerYXZ.set(a.beta * DEG, a.alpha * DEG, -a.gamma * DEG, 'YXZ');
    cameraQuat.setFromEuler(eulerYXZ).multiply(BACK_CAMERA);
    return cameraQuat.multiply(screenTurn.setFromAxisAngle(SCREEN_AXIS, -a.screen * DEG));
}

/**
 * Where the tracked image is (MindAR's 4x4 model-view matrix, column-major),
 * or null when it is out of view. Called many times a second by the tracker.
 *
 * Out of view, the model is not hidden: it stays where it was in the room and
 * the gyroscope keeps it there as the phone turns (walking is not tracked).
 * When the image is seen again, the model eases back onto it.
 */
export function setTrackedPose(pose: number[] | null, target: TrackedTarget): void {
    if (!trackRoot || !tracking) return;
    if (!pose) {
        if (trackRoot.visible && !holdWorld) {
            // Remember the model in room space: camera orientation × model in camera space.
            holdWorld = new THREE.Matrix4().compose(shown.pos, shown.quat, shown.scale);
            const cam = cameraOrientation();
            if (cam) holdWorld.premultiply(holdMatrix.makeRotationFromQuaternion(cam));
            else holdWorld.premultiply(holdMatrix.identity()); // no gyroscope: it stays put on screen
        }
        return;
    }
    // Image space: origin at the image centre, 1 unit = image width,
    // x right, y up the image, z out of the image towards the viewer.
    poseMatrix.fromArray(pose);
    placeMatrix.compose(
        new THREE.Vector3(target.width / 2, target.height / 2, 0),
        new THREE.Quaternion(),
        new THREE.Vector3(target.width, target.width, target.width),
    );
    poseMatrix.multiply(placeMatrix);

    // Fit the model: scale it to the requested width and stand it up. The lift
    // that puts it on / centres it on the image is applied when drawing.
    const size = modelBox.getSize(new THREE.Vector3());
    const scale = target.modelWidth / Math.max(size.x, 0.001);
    if (target.placement === 'flat') {
        // Lying image: the model's up (+y) points out of the image, base on the image.
        poseMatrix.multiply(stepMatrix.makeRotationX(Math.PI / 2));
        trackedLift = -modelBox.min.y;
    } else {
        // Hanging image: the model stands up, centred on it.
        trackedLift = -(modelBox.min.y + modelBox.max.y) / 2;
    }
    poseMatrix.multiply(stepMatrix.makeScale(scale, scale, scale));
    poseMatrix.decompose(goal.pos, goal.quat, goal.scale);
    trackedImageWidth = target.width;

    if (!trackRoot.visible) {
        // First sight: appear in place, no sliding in.
        shown.pos.copy(goal.pos);
        shown.quat.copy(goal.quat);
        shown.scale.copy(goal.scale);
        trackRoot.visible = true;
    }
    holdWorld = null;
}

/** Image-anchored mode, every frame: hold or follow, ease, then place the model. */
function updateTrackedModel(dt: number): void {
    if (!trackRoot || !trackRoot.visible) return;
    if (holdWorld) {
        // Model in camera space = (camera orientation now)⁻¹ × model in room space.
        const cam = cameraOrientation();
        holdMatrix.copy(holdWorld);
        if (cam) holdMatrix.premultiply(stepMatrix.makeRotationFromQuaternion(cam).invert());
        holdMatrix.decompose(goal.pos, goal.quat, goal.scale);
    }
    const moved = shown.pos.distanceTo(goal.pos) / Math.max(trackedImageWidth, 1e-6);
    const turned = shown.quat.angleTo(goal.quat);
    const timeConstant = SMOOTH_TIME_S / (1 + SMOOTH_MOVE_GAIN * moved + SMOOTH_TURN_GAIN * turned);
    const k = holdWorld ? 1 : 1 - Math.exp(-dt / timeConstant); // the gyroscope is smooth already
    shown.pos.lerp(goal.pos, k);
    shown.quat.slerp(goal.quat, k);
    shown.scale.lerp(goal.scale, k);

    trackRoot.matrix
        .compose(shown.pos, shown.quat, shown.scale)
        .multiply(stepMatrix.makeScale(trackedZoom, trackedZoom, trackedZoom))
        .multiply(placeMatrix.makeTranslation(0, trackedLift, 0));
    trackRoot.matrixWorldNeedsUpdate = true;
}

/** Measure the model in its own space (ignores the drag rotation). */
function measureModel(): void {
    if (!group) return;
    group.updateMatrixWorld(true);
    const toLocal = group.matrixWorld.clone().invert();
    const box = new THREE.Box3();
    const part = new THREE.Box3();
    const m = new THREE.Matrix4();
    group.traverse((o) => {
        const geometry = (o as THREE.Mesh).geometry as THREE.BufferGeometry | undefined;
        if (!geometry || o.userData.offset !== undefined) return; // skip moving smoke puffs
        if (!geometry.boundingBox) geometry.computeBoundingBox();
        if (!geometry.boundingBox) return;
        m.multiplyMatrices(toLocal, o.matrixWorld);
        box.union(part.copy(geometry.boundingBox).applyMatrix4(m));
    });
    if (!box.isEmpty()) modelBox = box;
}

/** Only render while the 3D view is on screen; saves battery on phones. */
export function setEngineActive(on: boolean): void {
    active = on;
    if (on) resizeEngine();
}

export function showModel(exhibit: Exhibit, era: string): void {
    if (!group) return;
    smoke = buildMonumentMesh(group, exhibit, era, false);
    measureModel();
    if (roomRoot) standOnFloor();
}

/** Room mode: the model centred on its spot, its base on the floor. */
function standOnFloor(): void {
    if (!group) return;
    const centre = modelBox.getCenter(new THREE.Vector3());
    group.position.set(-centre.x, -modelBox.min.y, -centre.z);
}

/**
 * Anchor the hologram towards a compass bearing (the real building), or pass
 * null to return to the centred, slowly spinning model.
 */
export function setAnchorBearing(bearing: number | null): void {
    if (bearing !== null && anchorBearing === null) {
        // Entering anchored mode: stop the spin at a flattering angle.
        targetRotY = DEFAULT_ROT_Y;
    }
    anchorBearing = bearing;
}

export function isAnchored(): boolean {
    return anchorBearing !== null && getHeading() !== null;
}

/** Chimney smoke (Gazi, 1900 & 1950). */
function animateSmoke(): void {
    const now = performance.now() * 0.0018;
    smoke.forEach((puff, idx) => {
        const cycle = (now + puff.userData.offset) % 2.4;
        puff.position.y = puff.userData.baseY + cycle * 0.55;
        puff.position.x = puff.userData.baseX + Math.sin(now * 1.5 + idx) * 0.14;
        const scale = 0.85 + cycle * 0.45;
        puff.scale.set(scale, scale, scale);
    });
}

function animate(_time: number, frame?: XRFrame): void {
    const nowMs = performance.now();
    const dt = Math.min(0.1, (nowMs - (lastFrameTime || nowMs)) / 1000);
    lastFrameTime = nowMs;
    if (!renderer || !scene || !camera || !group) return;

    if (renderer.xr.isPresenting) {
        // WebXR moves the camera with the phone; the model stays on the floor.
        animateSmoke();
        stepRoomTurn(dt);
        if (frame) roomFrameHook?.(frame);
        renderer.render(scene, camera);
        onFrame?.();
        return;
    }
    if (!active) return;

    const anchored = !tracking && isAnchored();
    if (!dragging && !anchored && !tracking) targetRotY += AUTO_SPIN_PER_FRAME;
    group.rotation.y += (targetRotY - group.rotation.y) * 0.1;
    group.rotation.x += (targetRotX - group.rotation.x) * 0.1;
    animateSmoke();

    if (tracking) {
        // The camera stays put; the tracker (or, out of view, the gyroscope) moves the model.
        updateTrackedModel(dt);
        renderer.render(scene, camera);
        onFrame?.();
        return;
    }

    // A tall, narrow screen sees less width: step back so the whole building fits.
    const fit = 1 / Math.min(1, Math.max(camera.aspect, 0.55));
    camera.position.z += (zoomDist * fit - camera.position.z) * 0.12;
    camera.lookAt(0, 1.25, 0);

    // Direction anchoring: turn the virtual camera by how far the phone is
    // turned away from the building, so the hologram slides off screen when
    // you look elsewhere and returns when you face it.
    let yawTarget = 0;
    let pitchTarget = 0;
    if (anchored) {
        const heading = getHeading() as number;
        const toBuilding = signedAngleDelta(heading, anchorBearing as number); // + = building is to the right
        yawTarget = Math.max(-120, Math.min(120, toBuilding)) * ANCHOR_GAIN * DEG;
        const pitch = getPitch();
        if (pitch !== null) pitchTarget = Math.max(-60, Math.min(60, pitch - 90)) * ANCHOR_GAIN * DEG;
    }
    anchorYaw += (yawTarget - anchorYaw) * ANCHOR_SMOOTHING;
    anchorPitch += (pitchTarget - anchorPitch) * ANCHOR_SMOOTHING;
    if (Math.abs(anchorYaw) > 1e-4 || Math.abs(anchorPitch) > 1e-4) {
        camera.rotateOnWorldAxis(WORLD_UP, anchorYaw); // turn left => model drifts right
        camera.rotateX(anchorPitch); // look up => model drifts down
    }

    renderer.render(scene, camera);
    onFrame?.();
}

const viewInverse = new THREE.Matrix4();

/**
 * Screen position of hotspot pin `index`: px inside the container, or, in room
 * mode, inside the full-screen AR overlay.
 */
export function projectHotspot(index: number): { x: number; y: number; visible: boolean } | null {
    if (!container || !camera || !group || !renderer) return null;
    const room = renderer.xr.isPresenting;
    const view = room ? ((renderer.xr.getCamera(camera) as THREE.ArrayCamera).cameras[0] ?? camera) : camera;
    const [ax, ay, az] = HOTSPOT_ANCHORS[index % HOTSPOT_ANCHORS.length];
    const v = new THREE.Vector3(ax, ay, az);
    v.applyMatrix4(group.matrixWorld); // the model's rotation, and on a tracked image or the floor its pose
    v.applyMatrix4(viewInverse.copy(view.matrixWorld).invert()).applyMatrix4(view.projectionMatrix);
    const w = room ? window.innerWidth : container.clientWidth || 360;
    const h = room ? window.innerHeight : container.clientHeight || 365;
    const modelShown = room ? (roomRoot?.visible ?? false) : !tracking || (trackRoot?.visible ?? false);
    return {
        x: (v.x * 0.5 + 0.5) * w,
        y: (-v.y * 0.5 + 0.5) * h,
        visible: modelShown && v.z < 1 && Math.abs(v.x) < 1.15 && Math.abs(v.y) < 1.15,
    };
}

// ---------------------------------------------------------------- room mode

export function getRenderer(): THREE.WebGLRenderer | null {
    return renderer;
}

/** Called with every WebXR frame while room mode runs (hit testing). */
export function setRoomFrameHook(hook: ((frame: XRFrame) => void) | null): void {
    roomFrameHook = hook;
}

/** A soft dark ellipse under the model, so it looks like it stands on the floor. */
function makeContactShadow(): THREE.Mesh {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    const fade = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    fade.addColorStop(0, 'rgba(15, 23, 42, 0.45)');
    fade.addColorStop(0.6, 'rgba(15, 23, 42, 0.18)');
    fade.addColorStop(1, 'rgba(15, 23, 42, 0)');
    ctx.fillStyle = fade;
    ctx.fillRect(0, 0, 128, 128);
    const size = modelBox.getSize(new THREE.Vector3());
    const disc = new THREE.Mesh(
        new THREE.PlaneGeometry(size.x * 1.3, size.z * 1.3),
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true, depthWrite: false }),
    );
    disc.rotation.x = -Math.PI / 2;
    disc.position.y = 0.01;
    disc.renderOrder = -1;
    return disc;
}

function dispose(mesh: THREE.Mesh): void {
    mesh.geometry.dispose();
    const material = mesh.material as THREE.MeshBasicMaterial;
    material.map?.dispose();
    material.dispose();
}

/**
 * Room mode on: the model stands, centred and upright, in a floor-level group
 * that stays hidden until placeRoomModel(). `scale` is metres per model unit.
 * Off: the model returns to the normal 3D view.
 */
export function setRoomMode(on: boolean, scale = 1): void {
    if (!scene || !group) return;
    if (on) {
        if (roomRoot) return;
        roomRoot = new THREE.Group();
        roomRoot.visible = false;
        roomRoot.scale.setScalar(scale);
        group.rotation.set(0, 0, 0);
        roomRoot.add(group, makeContactShadow());
        reticle = new THREE.Mesh(
            new THREE.RingGeometry(0.1, 0.13, 40).rotateX(-Math.PI / 2),
            new THREE.MeshBasicMaterial({ color: 0x38bdf8 }),
        );
        reticle.matrixAutoUpdate = false;
        reticle.visible = false;
        scene.add(roomRoot, reticle);
        standOnFloor();
        roomTurn = 0;
        roomTurnGoal = null;
        roomSpin = false;
        return;
    }
    roomSpin = false;
    roomTurnGoal = null;
    if (!roomRoot) return;
    roomRoot.children.forEach((child) => {
        if (child !== group) dispose(child as THREE.Mesh);
    });
    if (reticle) {
        dispose(reticle);
        scene.remove(reticle);
    }
    scene.remove(roomRoot);
    roomRoot = null;
    reticle = null;
    roomFrameHook = null;
    group.position.set(0, 0, 0);
    targetRotY = DEFAULT_ROT_Y;
    targetRotX = DEFAULT_ROT_X;
    group.rotation.set(DEFAULT_ROT_X, DEFAULT_ROT_Y, 0);
    scene.add(group);
    resizeEngine();
}

/** Show the ring where the floor was found (a WebXR pose matrix), or hide it. */
export function setReticle(matrix: Float32Array | null): void {
    if (!reticle) return;
    reticle.visible = matrix !== null;
    if (matrix) reticle.matrix.fromArray(matrix);
}

/** Put the model where the ring is, turned to face the visitor. False if there is no ring. */
export function placeRoomModel(): boolean {
    if (!roomRoot || !reticle?.visible || !renderer || !camera) return false;
    const spot = new THREE.Vector3().setFromMatrixPosition(reticle.matrix);
    const eye = new THREE.Vector3().setFromMatrixPosition(renderer.xr.getCamera(camera).matrixWorld);
    roomFacing = Math.atan2(eye.x - spot.x, eye.z - spot.z); // the model's front is +z
    roomRoot.position.copy(spot);
    applyRoomTurn();
    roomRoot.visible = true;
    return true;
}

export function setRoomScale(scale: number): void {
    roomRoot?.scale.setScalar(scale);
}

function applyRoomTurn(): void {
    roomRoot?.rotation.set(0, roomFacing + roomTurn, 0);
}

/** Turn the model to `radians` (from the rotate ruler). Any number of turns: it never wraps. */
export function setRoomTurn(radians: number): void {
    roomTurn = radians;
    roomTurnGoal = null;
    lastHandTurn = performance.now();
    applyRoomTurn();
}

export function getRoomTurn(): number {
    return roomTurn;
}

/** The turntable: the model keeps turning slowly on its own while on. */
export function setRoomSpin(on: boolean): void {
    roomSpin = on;
    if (on) roomTurnGoal = null;
}

/** Ease the model back to its front, the short way round. */
export function faceRoomFront(): void {
    const turn = 2 * Math.PI;
    roomTurnGoal = Math.round(roomTurn / turn) * turn;
}

/** Each WebXR frame: the easing back to the front, or the turntable. */
function stepRoomTurn(dt: number): void {
    if (roomTurnGoal !== null) {
        roomTurn += (roomTurnGoal - roomTurn) * Math.min(1, dt * 8);
        if (Math.abs(roomTurnGoal - roomTurn) < 1e-3) {
            roomTurn = roomTurnGoal;
            roomTurnGoal = null;
        }
        applyRoomTurn();
    } else if (roomSpin && performance.now() - lastHandTurn > 200) {
        roomTurn += TURNTABLE_SPEED * dt;
        applyRoomTurn();
    }
}

/** Width of the current model in metres at a room scale. */
export function roomModelWidth(scale: number): number {
    return modelBox.getSize(new THREE.Vector3()).x * scale;
}

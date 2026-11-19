// Image tracking: finds a known picture in the camera feed and reports where
// it is, many times a second. Wraps MindAR (vendored in src/vendor/mindar),
// which is loaded on first use only: it is about 2 MB with TensorFlow.js.
//
// The tracker works on its own hidden copy of the camera stream, so it never
// touches the page. Each new camera frame is copied to a canvas and the
// tracker reads the canvas: reading the <video> directly gives blank frames on
// some WebViews and headless browsers (checked: 0 features from the video,
// 143 from the same frame on a canvas).

/** 4x4 column-major matrix: where the target sits relative to the camera. */
export type PoseMatrix = number[];

export interface TrackerSession {
    /** Projection matrix of the camera input (OpenGL, column-major). */
    projection: number[];
    /** Camera frame size the tracker works on. */
    inputWidth: number;
    inputHeight: number;
    /** [width, height] of each target image, in the units of PoseMatrix. */
    targetSizes: Array<[number, number]>;
    stop(): void;
}

type Vendor = typeof import('../vendor/mindar/mindar-image.prod.js');
type Controller = InstanceType<Vendor['Controller']>;

/**
 * MindAR's own smoothing (a one-euro filter on the pose). Its defaults
 * (0.001 / 1000) barely smooth at all; this damps rotation jitter a little.
 * The 3D engine does the main, adaptive smoothing on top.
 */
const FILTER_MIN_CUTOFF = 0.001;
const FILTER_BETA = 1;
/** Frames the image may be missed before it counts as lost (default 5). */
const MISS_TOLERANCE = 8;

let vendor: Promise<Vendor> | null = null;
let controller: Controller | null = null;
let controllerKey = '';
let targetSizes: Array<[number, number]> = [];
let onPose: (targetIndex: number, pose: PoseMatrix | null) => void = () => {};

let video: HTMLVideoElement | null = null;
let frame: HTMLCanvasElement | null = null;
let frameCtx: CanvasRenderingContext2D | null = null;
let pumping = false;

async function openVideo(stream: MediaStream): Promise<HTMLVideoElement> {
    if (!video) {
        video = document.createElement('video');
        video.muted = true;
        video.playsInline = true;
        video.setAttribute('playsinline', '');
    }
    const v = video;
    if (v.srcObject !== stream) v.srcObject = stream;
    if (v.readyState < HTMLMediaElement.HAVE_METADATA) {
        await new Promise<void>((resolve) => v.addEventListener('loadedmetadata', () => resolve(), { once: true }));
    }
    await v.play();
    // Some WebViews report the size a moment after playback starts.
    for (let i = 0; i < 50 && v.videoWidth === 0; i++) await new Promise((r) => setTimeout(r, 40));
    return v;
}

/** Copy each new camera frame to the canvas the tracker reads. */
function startPump(v: HTMLVideoElement): HTMLCanvasElement {
    frame ??= document.createElement('canvas');
    if (frame.width !== v.videoWidth || frame.height !== v.videoHeight) {
        frame.width = v.videoWidth;
        frame.height = v.videoHeight;
        frameCtx = null;
    }
    frameCtx ??= frame.getContext('2d', { alpha: false });
    const draw = (): void => {
        if (!pumping || !frameCtx || !frame) return;
        frameCtx.drawImage(v, 0, 0, frame.width, frame.height);
        next();
    };
    const next = (): void => {
        if (!pumping) return;
        if ('requestVideoFrameCallback' in v) v.requestVideoFrameCallback(draw);
        else requestAnimationFrame(draw);
    };
    pumping = true;
    frameCtx?.drawImage(v, 0, 0, frame.width, frame.height);
    next();
    return frame;
}

/**
 * Start looking for the targets in `targetsUrl` (a compiled .mind file) in the
 * camera stream. `pose` is called with the target's matrix while it is in
 * view, and with null when it is lost.
 */
export async function startImageTracker(
    stream: MediaStream,
    targetsUrl: string,
    pose: (targetIndex: number, matrix: PoseMatrix | null) => void,
): Promise<TrackerSession> {
    onPose = pose;
    vendor ??= import('../vendor/mindar/mindar-image.prod.js');
    const { Controller } = await vendor;
    const v = await openVideo(stream);
    if (v.videoWidth === 0) throw new Error('Camera frames have no size');
    const input = startPump(v);

    // One tracker per camera resolution and target file; reused when switched back on.
    const key = `${input.width}x${input.height}|${targetsUrl}`;
    if (!controller || controllerKey !== key) {
        disposeController();
        controller = new Controller({
            inputWidth: input.width,
            inputHeight: input.height,
            maxTrack: 1,
            filterMinCF: FILTER_MIN_CUTOFF,
            filterBeta: FILTER_BETA,
            missTolerance: MISS_TOLERANCE,
            onUpdate: (data) => {
                if (data.type === 'updateMatrix' && data.targetIndex !== undefined) onPose(data.targetIndex, data.worldMatrix ?? null);
            },
        });
        controllerKey = key;
        const { dimensions } = await controller.addImageTargets(targetsUrl);
        targetSizes = dimensions;
        controller.dummyRun(input); // builds the GPU programs before the first real frame
    }

    controller.processVideo(input);
    const running = controller;
    return {
        projection: running.getProjectionMatrix(),
        inputWidth: running.inputWidth,
        inputHeight: running.inputHeight,
        targetSizes,
        stop: () => {
            running.stopProcessVideo();
            onPose = () => {};
            pumping = false;
            video?.pause();
        },
    };
}

function disposeController(): void {
    if (!controller) return;
    controller.dispose();
    controller.worker?.terminate();
    controller = null;
    controllerKey = '';
}

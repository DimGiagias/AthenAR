// Typings for the parts of MindAR 1.2.5 the app uses.

export interface MindArUpdate {
    type: 'updateMatrix' | 'processDone';
    targetIndex?: number;
    /** 4x4 column-major model-view matrix of the target, or null when it is lost. */
    worldMatrix?: number[] | null;
}

export interface ControllerOptions {
    inputWidth: number;
    inputHeight: number;
    onUpdate?: (data: MindArUpdate) => void;
    maxTrack?: number;
    filterMinCF?: number | null;
    filterBeta?: number | null;
    warmupTolerance?: number | null;
    missTolerance?: number | null;
}

export class Controller {
    constructor(options: ControllerOptions);
    inputWidth: number;
    inputHeight: number;
    worker: Worker;
    /** Loads a compiled .mind file. `dimensions` are [width, height] of each target image, in pixels. */
    addImageTargets(url: string): Promise<{ dimensions: Array<[number, number]> }>;
    addImageTargetsFromBuffer(buffer: ArrayBuffer): { dimensions: Array<[number, number]> };
    dummyRun(input: HTMLVideoElement | HTMLCanvasElement): void;
    /** Runs the tracking loop on `input` until stopProcessVideo(); reads it again every round. */
    processVideo(input: HTMLVideoElement | HTMLCanvasElement): void;
    stopProcessVideo(): void;
    dispose(): void;
    /** 4x4 column-major OpenGL projection matrix matching the camera input. */
    getProjectionMatrix(): number[];
}

export class Compiler {
    compileImageTargets(images: HTMLImageElement[], progress: (percent: number) => void): Promise<unknown>;
    exportData(): Uint8Array;
}

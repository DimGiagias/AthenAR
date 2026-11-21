/** Named sizes on the size ruler, in metres per model unit; the ruler sticks to them. */
export const SIZE_STOPS = [
    { scale: 0.1, label: 'sizeTable' },
    { scale: 0.35, label: 'sizeRoom' },
    { scale: 1, label: 'sizeReal' },
] as const;
export type SizeStop = (typeof SIZE_STOPS)[number];

export const START_SCALE = 0.35;
const MIN_SCALE = SIZE_STOPS[0].scale;
const MAX_SCALE = SIZE_STOPS[SIZE_STOPS.length - 1].scale;
/** How close (as a share of the ruler) a drag must come to a named size to stick to it. */
const SIZE_STICK = 0.03;
/** How close (in degrees) a turn must come to a side to stick to it. */
const TURN_STICK = 3;

export const FACES: Readonly<Partial<Record<number, 'faceFront' | 'faceRight' | 'faceBack' | 'faceLeft'>>> = {
    0: 'faceFront',
    90: 'faceRight',
    180: 'faceBack',
    270: 'faceLeft',
};

/**
 * Where a size sits along the ruler, 0..1. The scale is logarithmic, so every
 * stretch of the ruler multiplies the size by the same amount.
 */
export function sizeToPos(scale: number): number {
    return Math.log(scale / MIN_SCALE) / Math.log(MAX_SCALE / MIN_SCALE);
}

/** The size at a ruler position, sticking to a named size when close to one. */
export function sizeAt(pos: number): number {
    const p = Math.min(1, Math.max(0, pos));
    const stop = SIZE_STOPS.find((s) => Math.abs(sizeToPos(s.scale) - p) < SIZE_STICK);
    return stop ? stop.scale : MIN_SCALE * (MAX_SCALE / MIN_SCALE) ** p;
}

export function stopAt(scale: number): SizeStop | undefined {
    return SIZE_STOPS.find((s) => s.scale === scale);
}

/**
 * A turn in degrees, sticking to the nearest side (every 90°) when close.
 * Turns are never wrapped: 370° stays 370°, so the model can go round and
 * round without jumping back.
 */
export function turnAt(degrees: number): number {
    const side = Math.round(degrees / 90) * 90;
    return Math.abs(side - degrees) < TURN_STICK ? side : degrees;
}

/** A turn as the 0..359° the visitor sees. */
export function shownDegrees(degrees: number): number {
    return ((Math.round(degrees) % 360) + 360) % 360;
}

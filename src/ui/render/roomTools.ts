import { FACES, SIZE_STOPS, START_SCALE, shownDegrees, sizeAt, sizeToPos, stopAt, turnAt } from '../../features/ar/roomControls';
import { roomTurnDegrees, setRoomSize, turnRoom } from '../../features/ar/room';
import { roomModelWidth } from '../../features/ar/three/engine';
import { getState, type AppState } from '../../state/store';
import { $ } from '../dom';
import { t } from '../i18n';
import { icon, type IconName } from '../icons';
import { getUi, type RoomTool, type UiState } from '../state';

export const CONTROL_LABEL = 'text-[9px] font-bold tracking-[0.08em] text-sky-200 [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]';

/** Ruler pixels for the whole size range, and per degree of turn. */
const SIZE_SPAN = 420;
const TURN_PX = 1.2;
const SIZE_WIDTH = 270;
const TURN_WIDTH = 218;
const ROUND = 'glass shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition';

export function roomToolsHtml(u: Readonly<UiState>): string {
    const tool = (name: RoomTool, glyph: IconName, label: string, aria: string): string => {
        const on = u.roomTool === name;
        return `<div class="flex flex-col items-center gap-1.5"><span class="${CONTROL_LABEL}">${label}</span>
            <button onclick="app.roomTool('${name}')" aria-label="${aria}" aria-expanded="${on}" class="${ROUND} relative ${on ? 'tool-on' : ''}">${icon(glyph, 'w-5 h-5')}<span data-badge="${name}" class="hidden absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-sky-400 ring-2 ring-slate-900"></span></button></div>`;
    };
    return tool('turn', 'rotateRight', t('toolTurn'), t('roomRotate')) + tool('size', 'resize', t('toolSize'), t('roomSizeName'));
}

/** The open tool's panel; its ruler is filled in by refreshRoomTools(). */
export function roomPanelHtml(s: Readonly<AppState>, u: Readonly<UiState>): string {
    const ruler = (kind: RoomTool, width: number): string =>
        `<div data-ruler="${kind}" class="glass ruler" style="width:${width}px"><span class="ruler-val"></span><span class="ruler-marks"></span><span class="ruler-mark"></span></div>`;
    const reset = (kind: RoomTool): string =>
        `<button onclick="app.${kind === 'size' ? 'roomSizeReset' : 'roomTurnReset'}()" data-reset aria-label="${t('roomReset')}" class="${ROUND} disabled:opacity-40">${icon('undo', 'w-[18px] h-[18px]')}</button>`;
    if (u.roomTool === 'size') return ruler('size', SIZE_WIDTH) + reset('size');
    if (u.roomTool !== 'turn') return '';
    const spin = `<button onclick="app.roomSpin()" aria-label="${t(s.roomSpin ? 'roomSpinStop' : 'roomSpinStart')}" aria-pressed="${s.roomSpin}" class="${ROUND} ${s.roomSpin ? 'tool-on' : ''}">${icon(s.roomSpin ? 'pause' : 'play', 'w-[18px] h-[18px]')}</button>`;
    return spin + ruler('turn', TURN_WIDTH) + reset('turn');
}

const px = (x: number): string => `${x.toFixed(1)}px`;

function sizeMarks(scale: number, width: number): string {
    const offset = width / 2 - sizeToPos(scale) * SIZE_SPAN;
    let html = '';
    for (let i = 0; i <= 40; i++) html += `<span class="ruler-tick" style="left:${px(offset + (i / 40) * SIZE_SPAN)}"></span>`;
    for (const stop of SIZE_STOPS) {
        const x = px(offset + sizeToPos(stop.scale) * SIZE_SPAN);
        html += `<span class="ruler-major" style="left:${x}"></span><span class="ruler-name" style="left:${x}">${t(stop.label)}</span>`;
    }
    return html;
}

/** Endless: only the marks near the current turn are drawn, every 15°, with the four sides named. */
function turnMarks(degrees: number, width: number): string {
    const reach = width / 2 / TURN_PX + 20;
    let html = '';
    for (let d = Math.ceil((degrees - reach) / 15) * 15; d <= degrees + reach; d += 15) {
        const x = px(width / 2 + (d - degrees) * TURN_PX);
        const face = FACES[shownDegrees(d)];
        html += face ? `<span class="ruler-major" style="left:${x}"></span><span class="ruler-name" style="left:${x}">${t(face)}</span>` : `<span class="ruler-tick" style="left:${x}"></span>`;
    }
    return html;
}

function sizeLabel(scale: number): string {
    const stop = stopAt(scale);
    if (stop) return t(stop.label);
    const metres = roomModelWidth(scale);
    return t('roomAbout', { m: metres < 1 ? metres.toFixed(1) : Math.round(metres) });
}

function turnLabel(degrees: number): string {
    const shown = shownDegrees(degrees);
    const face = FACES[shown];
    return face ? `${shown}° · ${t(face)}` : `${shown}°`;
}

let drawn = '';

/**
 * Bring the open ruler, its reset button and the tools' "changed" dots up to
 * date. Called after every 3D frame; skips the work when nothing moved.
 */
export function refreshRoomTools(force = false): void {
    const s = getState();
    const u = getUi();
    if (s.roomAr !== 'placed') {
        drawn = '';
        return;
    }
    const turn = roomTurnDegrees();
    const key = `${u.roomTool}|${s.roomScale}|${turn.toFixed(1)}|${s.roomSpin}|${s.lang}`;
    if (!force && key === drawn) return;
    drawn = key;

    const sizeChanged = s.roomScale !== START_SCALE;
    const turnChanged = s.roomSpin || shownDegrees(turn) !== 0;
    document.querySelector('[data-badge="size"]')?.classList.toggle('hidden', !sizeChanged || u.roomTool === 'size');
    document.querySelector('[data-badge="turn"]')?.classList.toggle('hidden', !turnChanged || u.roomTool === 'turn');

    const panel = $('xrPanel');
    const ruler = panel?.querySelector<HTMLElement>('[data-ruler]');
    if (!panel || !ruler) return;
    const width = ruler.offsetWidth || (ruler.dataset.ruler === 'size' ? SIZE_WIDTH : TURN_WIDTH);
    const size = ruler.dataset.ruler === 'size';
    const val = ruler.querySelector('.ruler-val');
    const marks = ruler.querySelector('.ruler-marks');
    if (val) val.textContent = size ? sizeLabel(s.roomScale) : turnLabel(turn);
    if (marks) marks.innerHTML = size ? sizeMarks(s.roomScale, width) : turnMarks(turn, width);
    const reset = panel.querySelector<HTMLButtonElement>('[data-reset]');
    if (reset) reset.disabled = !(size ? sizeChanged : turnChanged);
}

/** Dragging a ruler slides its scale under the mark: drag left for more. */
export function bindRulers(panel: HTMLElement | null): void {
    panel?.addEventListener('pointerdown', (e) => {
        const ruler = (e.target as Element | null)?.closest<HTMLElement>('[data-ruler]');
        if (!ruler) return;
        e.preventDefault();
        ruler.setPointerCapture(e.pointerId);
        const size = ruler.dataset.ruler === 'size';
        const x0 = e.clientX;
        const start = size ? sizeToPos(getState().roomScale) : roomTurnDegrees();
        const move = (ev: PointerEvent): void => {
            const dx = ev.clientX - x0;
            if (size) setRoomSize(sizeAt(start - dx / SIZE_SPAN));
            else turnRoom(turnAt(start - dx / TURN_PX));
            refreshRoomTools(true);
        };
        const stop = (): void => {
            ruler.removeEventListener('pointermove', move);
            ruler.removeEventListener('pointerup', release);
            ruler.removeEventListener('pointercancel', stop);
        };
        // A busy frame can drop the last moves: the finger's final position still counts.
        const release = (ev: PointerEvent): void => {
            move(ev);
            stop();
        };
        ruler.addEventListener('pointermove', move);
        ruler.addEventListener('pointerup', release);
        ruler.addEventListener('pointercancel', stop);
    });
}

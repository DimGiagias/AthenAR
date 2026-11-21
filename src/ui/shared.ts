import { METRO_LINE } from '../data/area';
import type { EraRoom, Exhibit } from '../data/types';
import { distanceMeters, formatDistance } from '../platform/geoMath';
import type { AppState } from '../state/store';
import { t } from './i18n';

/** "40m" / "1.2 km" */
export const dist = (meters: number): string => formatDistance(Math.round(meters)).replace('📍 ', '');

/** Metres from the visitor to the exhibit, or null without a position. */
export function metresTo(ex: Exhibit, s: Readonly<AppState>): number | null {
    return s.gps === 'active' && s.coords ? distanceMeters(s.coords[0], s.coords[1], ex.coords[0], ex.coords[1]) : null;
}

export const ROOM_BADGE: Record<EraRoom, string> = {
    ancient: 'bg-amber-50 border-amber-200 text-amber-800',
    byzantine: 'bg-indigo-50 border-indigo-200 text-indigo-800',
    modern: 'bg-sky-50 border-sky-200 text-sky-800',
};

export function roomLabel(room: EraRoom): string {
    return t(room === 'ancient' ? 'roomAncient' : room === 'byzantine' ? 'roomByzantine' : 'roomModern');
}

const LOCALE: Record<AppState['lang'], string> = { el: 'el-GR', en: 'en-GB' };

/** "21 Nov · 14:41" in the interface language, 24-hour so it stays short. */
export function dayTime(ms: number, lang: AppState['lang']): string {
    const at = new Date(ms);
    return `${at.toLocaleDateString(LOCALE[lang], { day: 'numeric', month: 'short' })} · ${at.toLocaleTimeString(LOCALE[lang], { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })}`;
}

/** "14:41" in the interface language, 24-hour. */
export function clock(ms: number, lang: AppState['lang']): string {
    return new Date(ms).toLocaleTimeString(LOCALE[lang], { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
}

/** A measurement with at most one decimal ("15,6" in Greek), or a dash when missing. */
export function num(value: number | null, lang: AppState['lang']): string {
    return value === null ? '–' : value.toLocaleString(LOCALE[lang], { maximumFractionDigits: 1 });
}

/** A metro line's number in its colour. */
export const lineBadge = (n: number, small = false): string =>
    `<span class="inline-flex items-center justify-center px-1 rounded-[5px] text-white font-extrabold align-[1px] ${small ? 'min-w-[15px] h-[15px] text-[9px] mr-[3px]' : 'min-w-[18px] h-[18px] text-[10.5px] mr-[5px]'}" style="background:${METRO_LINE[n]?.colour ?? '#64748B'}">${n}</span>`;

/** Straight-line metres ×1.25 for the streets, at 80 m a minute. */
export const walkMinutes = (metres: number): number => Math.max(1, Math.round((metres * 1.25) / 80));

/** Classes of the primary call-to-action button. */
export const PRIMARY = 'bg-gradient-to-r from-sky-600 to-blue-600 text-white';

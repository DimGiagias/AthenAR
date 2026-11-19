// Passport: stamps, the next stamp nearby, your memories, and the
// presenter tools (Demo Mode) folded away at the bottom.
import { exhibitsData } from '../../data/exhibits';
import { MAP_PINS } from '../../data/geo';
import { exhibitPhotos } from '../../data/photos';
import type { EraRoom, Exhibit } from '../../data/types';
import { getExhibit, stampCount } from '../../features/exhibits';
import type { AppState } from '../../state/store';
import { setClass, setHtml, setText } from '../dom';
import { escapeHtml } from '../escapeHtml';
import { t } from '../i18n';
import { icon } from '../icons';
import { dist, metresTo, PRIMARY } from '../shared';
import { view } from '../state';

/** Seal colours per era room: ring, tint behind an empty seal, and the number. */
const SEAL: Record<EraRoom, { ring: string; tint: string; text: string; fill: string }> = {
    ancient: { ring: 'border-amber-500', tint: 'bg-amber-50', text: 'text-amber-700', fill: 'from-amber-400 to-amber-600' },
    byzantine: { ring: 'border-indigo-500', tint: 'bg-indigo-50', text: 'text-indigo-700', fill: 'from-indigo-400 to-indigo-600' },
    modern: { ring: 'border-blue-500', tint: 'bg-blue-50', text: 'text-blue-700', fill: 'from-sky-400 to-blue-600' },
};

/** "21 Nov · 10:41" in the interface language. */
function stampTime(ms: number, lang: AppState['lang']): string {
    const at = new Date(ms);
    const locale = lang === 'el' ? 'el-GR' : 'en-GB';
    return `${at.toLocaleDateString(locale, { day: 'numeric', month: 'short' })} · ${at.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}`;
}

/**
 * One stamp as a round seal in its era colour. Collected: the exhibit's photo
 * (or a stamp mark if it has none), tilted, with a tick and when it was collected.
 */
function seal(ex: Exhibit, s: Readonly<AppState>): string {
    const at = s.stamps[ex.id];
    const c = SEAL[ex.eraRoom];
    const label = s.lang === 'el' ? MAP_PINS[ex.id].labelEl : MAP_PINS[ex.id].labelEn;
    if (at === undefined) {
        return `<button onclick="app.openExhibit(${ex.id})" class="flex flex-col items-center gap-1 min-w-0 group">
            <span class="w-14 h-14 rounded-full border-2 border-dashed ${c.ring} ${c.tint} ${c.text} opacity-70 group-hover:opacity-100 flex items-center justify-center text-xs font-semibold transition">${ex.num}</span>
            <span class="w-full text-center text-[10px] leading-tight text-marble-muted truncate">${label}</span>
        </button>`;
    }
    const photo = exhibitPhotos[ex.id];
    const face = photo
        ? `<img src="exhibits/${photo.file}" alt="" loading="lazy" class="w-full h-full object-cover">`
        : `<span class="w-full h-full bg-gradient-to-br ${c.fill} text-white flex items-center justify-center">${icon('award', 'w-6 h-6')}</span>`;
    return `<button onclick="app.openExhibit(${ex.id})" class="flex flex-col items-center gap-1 min-w-0">
        <span class="relative w-14 h-14 -rotate-[8deg]">
            <span class="block w-full h-full rounded-full overflow-hidden border-[3px] border-double ${c.ring} bg-white shadow-[0_0_0_3px_#fff,0_4px_10px_rgba(37,99,235,0.25)]">${face}</span>
            <span class="absolute -right-1 -bottom-0.5 w-[18px] h-[18px] rounded-full bg-emerald-500 border-2 border-white text-white flex items-center justify-center rotate-[8deg]">${icon('check', 'w-2.5 h-2.5', 3.5)}</span>
        </span>
        <span class="w-full text-center text-[10px] leading-tight font-semibold text-marble-ink truncate">${label}</span>
        <span class="-mt-0.5 text-[9.5px] leading-tight font-semibold text-emerald-700 whitespace-nowrap">${stampTime(at, s.lang)}</span>
    </button>`;
}

function stampsCard(s: Readonly<AppState>): string {
    const count = stampCount(s);
    const total = exhibitsData.length;
    const tiles = exhibitsData.map((ex) => seal(ex, s)).join('');
    return `
        <div class="bg-white border border-sky-200 rounded-3xl shadow-sm p-4 space-y-3">
            <div class="flex items-center justify-between gap-2">
                <span class="flex flex-col gap-0.5">
                    <span class="text-[10px] font-semibold uppercase tracking-[0.12em] text-sky-600">${t('passportKicker')}</span>
                    <h1 class="text-xl leading-6 text-marble-ink">${t('passportHeadline')}</h1>
                </span>
                <span class="shrink-0 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-[13px] font-semibold">${count} / ${total}</span>
            </div>
            <div class="h-2 rounded-full bg-sky-100 overflow-hidden"><div class="h-2 rounded-full bg-gradient-to-r from-sky-400 to-blue-600 transition-all duration-500" style="width:${Math.round((count / total) * 100)}%"></div></div>
            <div class="grid grid-cols-4 gap-x-1.5 gap-y-3 pt-1">${tiles}</div>
        </div>`;
}

function nextStampCard(s: Readonly<AppState>): string {
    const open = exhibitsData.filter((ex) => s.stamps[ex.id] === undefined);
    if (open.length === 0) {
        return `<div class="flex items-center gap-3 p-4 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold">${icon('award', 'w-6 h-6')}${t('allDone')}</div>`;
    }
    const ranked = open.map((ex) => ({ ex, m: metresTo(ex, s) }));
    if (ranked[0].m !== null) ranked.sort((a, b) => (a.m ?? 0) - (b.m ?? 0));
    const { ex, m } = ranked[0];
    const d = ex[s.lang];
    return `
        <button onclick="app.openExhibit(${ex.id})" class="relative w-full text-left overflow-hidden flex items-center gap-3 px-3.5 py-3 rounded-3xl bg-gradient-to-br from-white via-sky-50 to-blue-50 border border-sky-200 shadow-sm hover:border-sky-400 transition">
            <span aria-hidden="true" class="absolute -right-6 -top-6 w-[88px] h-[88px] rounded-full bg-sky-200/35"></span>
            <span class="relative flex-1 min-w-0 flex flex-col gap-0.5">
                <span class="text-[10px] font-semibold uppercase tracking-[0.1em] text-sky-600">${t(m !== null ? 'nextKicker' : 'nextKickerNoGps')}</span>
                <span class="text-[15px] font-semibold leading-snug text-marble-ink">${ex.num} ${d.title}</span>
                <span class="text-xs font-medium text-sky-700">${d.street} · ${m !== null ? `<span class="text-emerald-700 font-semibold">${dist(m)}</span>` : `<span class="text-marble-muted">${d.walk}</span>`}</span>
            </span>
            <span class="relative shrink-0 h-10 px-3.5 rounded-2xl ${PRIMARY} text-[13px] font-semibold flex items-center shadow-sm">${t('nextGo')}</span>
        </button>`;
}

function memoriesCard(s: Readonly<AppState>): string {
    const own = [...s.memories].sort((a, b) => b.createdAt - a.createdAt);
    const list =
        own.length === 0
            ? `<p class="text-[13px] leading-5 text-marble-muted">${t('myMemoriesEmpty')}</p>`
            : own
                  .map((m) => {
                      const ex = getExhibit(m.exhibitId);
                      return `
                <div class="p-3 rounded-2xl bg-marble-subtle border border-sky-200 space-y-1.5">
                    <div class="flex items-center justify-between gap-2 text-[11px] font-semibold">
                        <span class="text-sky-700 truncate">${ex.num} • ${ex[s.lang].title}</span>
                        <span class="shrink-0 px-2 py-0.5 rounded-full bg-white border border-sky-200 text-sky-700">${escapeHtml(m.decade)}</span>
                    </div>
                    <p class="text-[13px] leading-[19px] italic text-marble-ink">${escapeHtml(m.text)}</p>
                    <div class="flex items-center justify-between gap-2 text-[11px] font-semibold">
                        <span class="text-marble-muted font-medium truncate">— ${escapeHtml(m.author)}</span>
                        <span class="flex items-center gap-3 shrink-0">
                            <button onclick="app.deleteMemory('${escapeHtml(m.id)}')" class="text-slate-500 hover:underline">${t('memoryDelete')}</button>
                            <button onclick="app.memoryAr('${escapeHtml(m.id)}')" class="text-sky-700 hover:underline">${t('viewOnBuildingBtn')}</button>
                        </span>
                    </div>
                </div>`;
                  })
                  .join('');
    return `
        <div class="bg-white border border-sky-200 rounded-3xl shadow-sm p-3.5 space-y-2.5">
            <span class="flex items-center gap-2.5">
                <span class="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">${icon('feather', 'w-4 h-4')}</span>
                <span class="text-[15px] font-semibold text-marble-ink">${t('myMemories', { n: own.length })}</span>
            </span>
            ${list}
        </div>`;
}

export function mountPassport(): void {
    view(
        (s) => [s.lang, s.stamps, s.memories, s.gps, s.coords, s.demoMode],
        (s) => setHtml('ppMain', stampsCard(s) + nextStampCard(s) + memoriesCard(s)),
    );

    // Presenter tools: rendered separately so the open/closed state survives updates.
    view(
        (s) => [s.lang],
        () => {
            setText('ppPresenterTitle', t('presenter'));
            setText('ppPresenterSub', t('presenterSub'));
            setText('ppDemoTitle', t('demoRowTitle'));
            setText('ppDemoSub', t('demoRowSub'));
            setText('ppWrongBtn', t('btnSimulateWrong'));
        },
    );
    view(
        (s) => [s.lang, s.demoMode],
        (s) => {
            setText('ppDemoBtn', t(s.demoMode ? 'demoOn' : 'demoOff'));
            setClass(
                'ppDemoBtn',
                `shrink-0 h-8 px-3 rounded-xl text-xs font-semibold border transition ${s.demoMode ? 'bg-amber-500 border-amber-600 text-white' : 'bg-white border-slate-200 text-slate-600'}`,
            );
        },
    );
}

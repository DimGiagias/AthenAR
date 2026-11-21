// "Around the exhibit": the sheet of the exhibit page's ⓘ button, with the air
// quality now (the City's air station nearest the exhibit) and the nearest
// metro, both from the City of Athens open data. Each row opens its details.
import { METRO_LINE, type ExhibitArea, type MetroStation } from '../../data/area';
import { AREA_SOURCES, EXHIBIT_AREAS } from '../../data/areaData';
import type { Lang } from '../../data/types';
import { airNow, type AirNow } from '../../features/air';
import { currentExhibit } from '../../features/exhibits';
import type { AppState } from '../../state/store';
import { setHidden, setHtml } from '../dom';
import { t, type StringKey } from '../i18n';
import { icon } from '../icons';
import { clock, dist, num } from '../shared';
import { view, type UiState } from '../state';

/** The European Air Quality Index levels 1–6: name, badge, word and scale colours. */
const AQI: ReadonlyArray<{ name: StringKey; badge: string; word: string; bar: string }> = [
    { name: 'aqi1', badge: 'bg-cyan-100 text-cyan-800', word: 'text-cyan-700', bar: 'bg-cyan-300' },
    { name: 'aqi2', badge: 'bg-emerald-100 text-emerald-800', word: 'text-emerald-700', bar: 'bg-emerald-400' },
    { name: 'aqi3', badge: 'bg-yellow-100 text-yellow-800', word: 'text-yellow-700', bar: 'bg-yellow-300' },
    { name: 'aqi4', badge: 'bg-red-100 text-red-800', word: 'text-red-700', bar: 'bg-red-400' },
    { name: 'aqi5', badge: 'bg-rose-100 text-rose-900', word: 'text-rose-800', bar: 'bg-rose-800' },
    { name: 'aqi6', badge: 'bg-purple-100 text-purple-900', word: 'text-purple-800', bar: 'bg-purple-800' },
];
const LINE_COLOUR: Record<number, string> = { 1: 'bg-green-600', 2: 'bg-red-600', 3: 'bg-blue-600' };

const CHEVRON = icon('chevronRight', 'w-4 h-4 shrink-0 text-slate-400');
const ROW = 'w-full text-left flex items-center gap-3 p-3';
const SUB = 'block mt-0.5 text-[11.5px] leading-4 text-slate-500';

/** Straight-line metres ×1.25 for the streets, at 80 m a minute. */
const walkMinutes = (metres: number): number => Math.max(1, Math.round((metres * 1.25) / 80));
const lineBadge = (n: number, small = false): string =>
    `<span class="inline-flex items-center justify-center px-1 rounded-[5px] ${LINE_COLOUR[n] ?? 'bg-slate-500'} text-white font-extrabold align-[1px] ${small ? 'min-w-[15px] h-[15px] text-[9px] mr-[3px]' : 'min-w-[18px] h-[18px] text-[10.5px] mr-[5px]'}">${n}</span>`;
const sourceLink = (url: string, text: string): string =>
    `<a href="${url}" target="_blank" rel="noopener" class="self-center text-center text-[10.5px] leading-4 text-slate-400 underline decoration-slate-300 underline-offset-2">${text}</a>`;

function header(kicker: string, title: string, sub: string, back: boolean): string {
    const button = back
        ? `<button onclick="app.areaTo('list')" aria-label="${t('back')}" class="shrink-0 w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">${icon('chevronLeft', 'w-5 h-5')}</button>`
        : '';
    const close = back ? '' : `<button onclick="app.closeArea()" aria-label="${t('close')}" class="shrink-0 w-9 h-9 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">${icon('x', 'w-4 h-4')}</button>`;
    return `<div class="flex items-center gap-2.5">
        ${button}
        <span class="flex-1 min-w-0">
            <span class="block text-[10px] font-bold tracking-[0.1em] uppercase text-sky-600">${kicker}</span>
            <h2 id="areaTitle" class="mt-0.5 text-[17px] leading-[22px] font-semibold text-marble-ink">${title}</h2>
            ${sub ? `<span class="${SUB}">${sub}</span>` : ''}
        </span>
        ${close}
    </div>`;
}

function airRow(area: ExhibitArea, now: AirNow | null, loading: boolean, lang: Lang): string {
    if (!now) {
        return `<div class="${ROW}">
            <span class="shrink-0 w-[38px] h-[38px] rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center font-semibold">–</span>
            <span class="flex-1 min-w-0"><span class="block text-sm font-semibold text-marble-ink">${t('airTitle')}</span><span class="${SUB}">${loading ? t('airLoading') : t('airNone', { name: area.air.name[lang] })}</span></span>
        </div>`;
    }
    const r = now.readings[0];
    const q = AQI[r.aqi - 1];
    return `<button onclick="app.areaTo('air')" class="${ROW} active:bg-sky-50 transition">
        <span class="shrink-0 w-[38px] h-[38px] rounded-xl ${q.badge} flex items-center justify-center text-base font-bold">${r.aqi}</span>
        <span class="flex-1 min-w-0">
            <span class="block text-sm font-semibold text-marble-ink">${t('airTitle')} · <span class="${q.word}">${t(q.name)}</span></span>
            <span class="${SUB}">${t('airLine', { temp: num(r.temperature === null ? null : Math.round(r.temperature), lang), hum: num(r.humidity === null ? null : Math.round(r.humidity), lang), pm: num(r.pm25, lang) })}<br>${t('airStation', { name: now.station.name[lang], time: clock(r.at, lang) })}</span>
        </span>
        ${CHEVRON}
    </button>`;
}

function metroRow(metro: readonly MetroStation[], lang: Lang): string {
    const [first, second] = metro;
    if (!first) return '';
    const sub = second ? `${t('metroOr')} ${second.lines.map((n) => lineBadge(n, true)).join('')}${second.name[lang]} · ${dist(second.metres)}` : t('metroNearest');
    return `<button onclick="app.areaTo('metro')" class="${ROW} border-t border-sky-50 active:bg-sky-50 transition">
        <span class="shrink-0 w-[38px] h-[38px] rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">${icon('train', 'w-5 h-5')}</span>
        <span class="flex-1 min-w-0"><span class="block text-sm font-semibold text-marble-ink">${first.lines.map((n) => lineBadge(n)).join('')}${first.name[lang]}</span><span class="${SUB}">${sub}</span></span>
        <span class="shrink-0 text-right text-[13px] font-bold text-sky-700">${t('walkMin', { n: walkMinutes(first.metres) })}<span class="block text-[11px] font-semibold text-slate-500">${dist(first.metres)}</span></span>
        ${CHEVRON}
    </button>`;
}

function listView(area: ExhibitArea, now: AirNow | null, s: Readonly<AppState>): string {
    return `${header(t('areaTitle'), currentExhibit(s)[s.lang].title, '', false)}
        <div class="rounded-[18px] border border-sky-100 overflow-hidden">${airRow(area, now, s.air.loading, s.lang)}${metroRow(area.metro, s.lang)}</div>
        ${sourceLink('https://opendata.cityofathens.gr', t('areaSource'))}`;
}

function airView(area: ExhibitArea, now: AirNow, lang: Lang): string {
    const r = now.readings[0];
    const q = AQI[r.aqi - 1];
    const station = now.station;
    const why = now.backup
        ? t('airWhyBackup', { name: area.air.name[lang], dist: dist(station.metres) })
        : station.metres === 0
          ? t('airWhyOwn')
          : t('airWhyNearest', { dist: dist(station.metres) });
    const tiles: Array<[string, string]> = [
        ['PM2.5', `${num(r.pm25, lang)} <small class="text-[9px] font-semibold text-slate-500">μg/m³</small>`],
        ['PM10', `${num(r.pm10, lang)} <small class="text-[9px] font-semibold text-slate-500">μg/m³</small>`],
        ['NO₂', `${num(r.no2, lang)} <small class="text-[9px] font-semibold text-slate-500">μg/m³</small>`],
        ['O₃', `${num(r.o3, lang)} <small class="text-[9px] font-semibold text-slate-500">μg/m³</small>`],
        [t('airTemp'), `${num(r.temperature, lang)}°`],
        [t('airHumidity'), `${num(r.humidity === null ? null : Math.round(r.humidity), lang)}%`],
    ];
    // PM10 over the last hours, oldest first
    const hours = now.readings.filter((x) => x.pm10 !== null).reverse();
    let chart = '';
    if (hours.length > 1) {
        const max = Math.max(...hours.map((x) => x.pm10 as number), 1) * 1.15;
        const points = hours.map((x, i) => `${((i / (hours.length - 1)) * 300).toFixed(1)},${(48 - ((x.pm10 as number) / max) * 44).toFixed(1)}`).join(' ');
        chart = `<div class="rounded-2xl bg-slate-50 px-3 pt-2.5 pb-1.5">
            <div class="flex justify-between text-[11px] font-bold text-slate-600"><span>${t('airHistory', { n: hours.length })}</span><span>${num(r.pm10, lang)}</span></div>
            <svg viewBox="0 0 300 50" preserveAspectRatio="none" class="block w-full h-[50px]" aria-hidden="true"><polyline points="0,50 ${points} 300,50" fill="rgba(14,165,233,0.12)" stroke="none"/><polyline points="${points}" fill="none" stroke="#0284C7" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>
            <div class="flex justify-between text-[9.5px] text-slate-400"><span>${clock(hours[0].at, lang)}</span><span>${clock(r.at, lang)}</span></div>
        </div>`;
    }
    return `${header(t('airKicker', { time: clock(r.at, lang) }), t('airStationTitle', { name: station.name[lang], hood: station.hood[lang] }), why, true)}
        <div class="flex items-center gap-3.5">
            <span class="shrink-0 w-[60px] h-[60px] rounded-[18px] ${q.badge} flex flex-col items-center justify-center text-[26px] leading-none font-bold">${r.aqi}<small class="mt-1 text-[8px] tracking-[0.08em] font-extrabold opacity-80">AQI</small></span>
            <span class="min-w-0"><span class="block text-lg font-semibold ${q.word}">${t(q.name)}</span><span class="block mt-0.5 text-[12.5px] leading-[18px] text-slate-600">${t('airIndex')}</span></span>
        </div>
        <div>
            <div class="grid grid-cols-6 gap-[3px]">${AQI.map((level, i) => `<span class="h-2 rounded-[3px] ${level.bar} ${i + 1 === r.aqi ? 'ring-2 ring-marble-ink ring-offset-1' : 'opacity-35'}"></span>`).join('')}</div>
            <div class="mt-1 flex justify-between text-[9.5px] text-slate-500"><span>${t('aqi1')}</span><span>${t('aqi6')}</span></div>
        </div>
        <div class="grid grid-cols-3 gap-1.5">${tiles.map(([label, value]) => `<div class="rounded-xl bg-slate-50 p-2 text-[10px] font-bold text-slate-500">${label}<b class="block mt-0.5 text-[15px] text-marble-ink">${value}</b></div>`).join('')}</div>
        ${chart}
        <a href="${area.neighbourhood.url}" target="_blank" rel="noopener" class="flex items-center gap-3 p-3 rounded-[18px] border border-sky-100 active:bg-sky-50 transition">
            <span class="shrink-0 w-[38px] h-[38px] rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">${icon('users', 'w-5 h-5')}</span>
            <span class="flex-1 min-w-0"><span class="block text-sm font-semibold text-marble-ink">${area.neighbourhood.name[lang]}</span><span class="${SUB}">${t('hoodLink')}</span></span>
            ${icon('externalLink', 'w-[18px] h-[18px] shrink-0 text-sky-600')}
        </a>
        ${sourceLink(AREA_SOURCES.air, t('airSource'))}`;
}

function metroView(area: ExhibitArea, lang: Lang): string {
    const other: Lang = lang === 'el' ? 'en' : 'el';
    const cards = area.metro
        .map(
            (m, i) => `<div class="rounded-[18px] border border-sky-100 p-3 flex flex-col gap-2.5">
            <div class="flex items-start gap-2.5">
                <span class="flex-1 min-w-0"><span class="block text-base font-semibold text-marble-ink">${m.name[lang]}</span><span class="${SUB}">${m.name[other]} · ${t('metroStation')}</span></span>
                <span class="shrink-0 text-right text-[15px] font-bold text-sky-700">${t('walkMin', { n: walkMinutes(m.metres) })}<span class="block text-[11px] font-semibold text-slate-500">${dist(m.metres)}</span></span>
            </div>
            <div class="flex flex-wrap gap-1.5">${m.lines.map((n) => `<span class="inline-flex items-center pl-1 pr-2.5 py-1 rounded-full bg-slate-50 text-xs font-semibold text-slate-700">${lineBadge(n)}${METRO_LINE[n]?.[lang] ?? ''}</span>`).join('')}</div>
            <button onclick="app.metroOnMap(${i})" class="h-10 rounded-xl border-[1.5px] border-sky-300 text-sky-700 text-[13px] font-semibold flex items-center justify-center gap-1.5 active:bg-sky-50 transition">${icon('mapPin', 'w-4 h-4')}${t('metroOnMap')}</button>
        </div>`,
        )
        .join('');
    return `${header(t('metroKicker'), t(area.metro.length > 1 ? 'metroTwo' : 'metroOne'), '', true)}
        ${cards}
        <p class="text-[11.5px] leading-[17px] text-slate-500">${t('metroNote')}</p>
        ${sourceLink(AREA_SOURCES.metro, t('metroSource'))}`;
}

function sheetHtml(s: Readonly<AppState>, u: Readonly<UiState>, animate: boolean): string {
    const area = EXHIBIT_AREAS[s.exhibitId];
    if (!u.areaSheet || !area) return '';
    const now = airNow(area, s.air.readings, Date.now());
    let body: string;
    if (u.areaSheet === 'air' && now) body = airView(area, now, s.lang);
    else if (u.areaSheet === 'metro' && area.metro.length) body = metroView(area, s.lang);
    else body = listView(area, now, s);
    return `<div class="absolute inset-0 bg-slate-950/45 ${animate ? 'fade-in' : ''}" onclick="app.closeArea()"></div>
        <div role="dialog" aria-modal="true" aria-labelledby="areaTitle" class="${animate ? 'sheet-in' : ''} absolute inset-x-0 bottom-0 max-h-[92%] overflow-y-auto mobile-scroll bg-white rounded-t-3xl border-t border-sky-200 px-4 pt-2.5 flex flex-col gap-3" style="padding-bottom: max(18px, env(safe-area-inset-bottom))">
            <span class="self-center shrink-0 w-10 h-1 rounded-full bg-sky-200"></span>
            ${body}
        </div>`;
}

export function mountAreaSheet(): void {
    // Slides in when it opens, not again when it changes view or the readings arrive.
    let open = false;
    let drawn = '';
    view(
        (s, u) => [u.areaSheet, s.exhibitId, s.lang, s.air],
        (s, u) => {
            const html = sheetHtml(s, u, !open);
            open = html !== '';
            if (html === drawn) return;
            drawn = html;
            setHidden('areaSheet', !open);
            setHtml('areaSheet', html);
        },
    );
}

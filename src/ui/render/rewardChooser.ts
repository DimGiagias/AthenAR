// "Choose a venue" for an earned reward: the municipal venues of its kind from
// the City's open data, nearest first when the position is known, with a
// filter when the reward covers more than one kind (museums and galleries).
import { venueName, venueType, type CultureVenue } from '../../data/culture';
import { REWARDS } from '../../data/rewards';
import { knownPosition, metresToVenue, venueById, venuesFor } from '../../features/rewards';
import type { AppState } from '../../state/store';
import { setHidden, setHtml } from '../dom';
import { escapeHtml } from '../escapeHtml';
import { t } from '../i18n';
import { icon, type IconName } from '../icons';
import { dist, PRIMARY } from '../shared';
import { view, type UiState } from '../state';

/** Icon and tint per venue type of the dataset. */
const LOOK: Record<string, { glyph: IconName; tint: string }> = {
    ΜΟΥΣΕΙΟ: { glyph: 'landmark', tint: 'bg-amber-50 text-amber-700' },
    ΠΙΝΑΚΟΘΗΚΗ: { glyph: 'image', tint: 'bg-indigo-50 text-indigo-700' },
    ΘΕΑΤΡΟ: { glyph: 'music', tint: 'bg-rose-50 text-rose-700' },
    ΚΙΝΗΜΑΤΟΓΡΑΦΟΣ: { glyph: 'film', tint: 'bg-slate-100 text-slate-700' },
};
export const venueLook = (v: CultureVenue): { glyph: IconName; tint: string } => LOOK[v.type] ?? { glyph: 'landmark', tint: 'bg-sky-50 text-sky-700' };

function chooserHtml(s: Readonly<AppState>, u: Readonly<UiState>, animate: boolean): string {
    const index = u.rewardChoose;
    const reward = index === null ? undefined : REWARDS[index];
    if (index === null || !reward) return '';
    const r = reward[s.lang];
    const from = knownPosition(s);
    const all = venuesFor(reward, from);
    const shown = u.rewardFilter === 'all' ? all : all.filter((v) => v.type === u.rewardFilter);
    const pick = venueById(u.rewardPick ?? -1) ?? shown[0];
    if (!pick) return '';
    const types = [...new Set(all.map((v) => v.type))];
    const filter = (key: string, label: string, n: number): string =>
        `<button onclick="app.venueFilter('${key}')" class="shrink-0 h-[30px] px-3 rounded-full border text-xs font-semibold transition ${u.rewardFilter === key ? 'bg-sky-600 border-sky-600 text-white' : 'bg-white border-sky-200 text-slate-600'}">${label} · ${n}</button>`;
    const filters =
        types.length > 1
            ? `<div class="flex gap-1.5 px-[18px] pb-1 overflow-x-auto">${filter('all', t('chooseAll'), all.length)}${types.map((type) => filter(type, venueType(all.find((v) => v.type === type) as CultureVenue, s.lang), all.filter((v) => v.type === type).length)).join('')}</div>`
            : '';
    const rows = shown
        .map((v) => {
            const look = venueLook(v);
            const on = v.id === pick.id;
            return `<button onclick="app.pickVenue(${v.id})" aria-pressed="${on}" class="w-full text-left flex items-center gap-2.5 px-2 py-2.5 rounded-2xl transition ${on ? 'bg-sky-50 ring-[1.5px] ring-sky-300' : ''}">
                <span class="shrink-0 w-5 h-5 rounded-full border-2 ${on ? 'border-sky-600' : 'border-sky-200'} flex items-center justify-center">${on ? '<span class="w-2.5 h-2.5 rounded-full bg-sky-600"></span>' : ''}</span>
                <span class="shrink-0 w-9 h-9 rounded-xl ${look.tint} flex items-center justify-center">${icon(look.glyph, 'w-[18px] h-[18px]')}</span>
                <span class="flex-1 min-w-0">
                    <span class="block text-[13.5px] font-semibold leading-tight text-marble-ink">${escapeHtml(venueName(v, s.lang))}</span>
                    <span class="block mt-0.5 text-[11px] text-slate-500 truncate">${venueType(v, s.lang)} · ${escapeHtml(v.address)}</span>
                </span>
                ${from ? `<span class="shrink-0 text-xs font-semibold text-sky-700">${dist(metresToVenue(from, v))}</span>` : ''}
            </button>`;
        })
        .join('');
    return `<div class="absolute inset-0 bg-slate-950/45 ${animate ? 'fade-in' : ''}" onclick="app.closeChooser()"></div>
        <div role="dialog" aria-modal="true" aria-labelledby="chooseTitle" class="${animate ? 'sheet-in' : ''} absolute inset-x-0 bottom-0 max-h-[88%] bg-white rounded-t-3xl border-t border-sky-200 flex flex-col">
            <span class="self-center w-10 h-1 rounded-full bg-sky-200 mt-2.5 mb-2"></span>
            <div class="flex items-start gap-3 px-[18px]">
                <span class="flex-1 min-w-0">
                    <span class="block text-xs font-semibold text-sky-700">${t('chooseKicker', { n: reward.stamps, mine: r.mine })}</span>
                    <h2 id="chooseTitle" class="mt-0.5 text-lg leading-6 font-semibold text-marble-ink">${r.pick}</h2>
                    <span class="block mt-0.5 text-[11.5px] text-slate-500">${t(from ? 'chooseNearest' : 'chooseByName')}</span>
                </span>
                <button onclick="app.closeChooser()" aria-label="${t('close')}" class="shrink-0 w-[34px] h-[34px] rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">${icon('x', 'w-4 h-4')}</button>
            </div>
            <div class="pt-2.5">${filters}</div>
            <div class="flex-1 min-h-0 overflow-y-auto mobile-scroll px-3 py-1.5">${rows}</div>
            <div class="px-[18px] pt-2.5 border-t border-sky-100" style="padding-bottom: max(16px, env(safe-area-inset-bottom))">
                <button onclick="app.openTicket(${index}, ${pick.id})" class="w-full h-[50px] rounded-2xl ${PRIMARY} text-[15px] font-semibold flex items-center justify-center gap-2 px-3 shadow-[0_12px_24px_rgba(37,99,235,0.28)] active:scale-[0.98] transition">${icon('ticket', 'w-5 h-5 shrink-0')}<span class="truncate">${t('chooseTicket', { name: escapeHtml(venueName(pick, s.lang)) })}</span></button>
            </div>
        </div>`;
}

export function mountRewardChooser(): void {
    // Slides in when it opens, not again on every pick.
    let open = false;
    let drawn = '';
    view(
        (s, u) => [u.rewardChoose, u.rewardPick, u.rewardFilter, s.lang, s.gps, s.coords],
        (s, u) => {
            const html = chooserHtml(s, u, !open);
            open = html !== '';
            if (html === drawn) return;
            drawn = html;
            const list = document.querySelector('#rewardChooser .overflow-y-auto');
            const scrolled = list?.scrollTop ?? 0;
            setHidden('rewardChooser', !open);
            setHtml('rewardChooser', html);
            const next = document.querySelector('#rewardChooser .overflow-y-auto');
            if (next && list) next.scrollTop = scrolled;
        },
    );
}

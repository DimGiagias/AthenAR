// Every passport reward, whether it can be claimed yet or not. Each is a kind
// of municipal venue from the City's open data: locked ones show how many
// stamps are left, earned ones let you choose the venue, claimed ones say where
// and when.
import { venueName } from '../../data/culture';
import { CULTURE_SOURCE } from '../../data/cultureVenues';
import { exhibitsData } from '../../data/exhibits';
import { REWARDS, type Reward } from '../../data/rewards';
import { stampCount } from '../../features/exhibits';
import { unlockedAt, venueById, venuesFor } from '../../features/rewards';
import type { AppState } from '../../state/store';
import { $, setHidden, setHtml } from '../dom';
import { t } from '../i18n';
import { icon } from '../icons';
import { dayTime, PRIMARY } from '../shared';
import { view } from '../state';

function rewardCard(reward: Reward, index: number, s: Readonly<AppState>): string {
    const r = reward[s.lang];
    const have = stampCount(s);
    const earned = unlockedAt(reward, s) !== null;
    const claimed = s.rewardsClaimed[reward.stamps];
    const venues = venuesFor(reward, null);
    const claimedAt = claimed ? venueById(claimed.venue) : undefined;
    // where: the venue it was claimed for, the only venue, or how many there are to choose from
    const where = claimedAt ? venueName(claimedAt, s.lang) : venues.length === 1 ? `${venueName(venues[0], s.lang)} · ${venues[0].address}` : t('rewardVenues', { n: venues.length });
    const badge = claimed ? 'bg-emerald-50 text-emerald-600' : earned ? 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-[0_6px_14px_rgba(37,99,235,0.3)]' : 'bg-slate-100 text-slate-400';
    let footer: string;
    if (claimed) {
        footer = `<button onclick="app.openClaimed(${index})" class="h-11 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[13px] font-semibold flex items-center justify-center gap-2">${icon('check', 'w-4 h-4', 3)}${t('passUsed', { when: dayTime(claimed.at, s.lang) })}</button>`;
    } else if (earned) {
        const go = venues.length === 1 ? `app.openTicket(${index}, ${venues[0].id})` : `app.chooseVenue(${index})`;
        footer = `<button onclick="${go}" class="h-11 rounded-2xl ${PRIMARY} text-sm font-semibold flex items-center justify-center gap-2 shadow-[0_8px_18px_rgba(37,99,235,0.25)] active:scale-[0.98] transition">${icon('ticket', 'w-[18px] h-[18px]')}${t(venues.length === 1 ? 'rewardClaim' : 'rewardChooseVenue')}</button>`;
    } else {
        footer = `<div class="flex items-center gap-2.5">
            <div class="flex-1 h-1.5 rounded-full bg-sky-100 overflow-hidden"><div class="h-1.5 rounded-full bg-gradient-to-r from-sky-400 to-blue-600" style="width:${Math.round((have / reward.stamps) * 100)}%"></div></div>
            <span class="shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">${icon('lock', 'w-3 h-3')}${t('rewardToGo', { have, need: reward.stamps, n: reward.stamps - have })}</span>
        </div>`;
    }
    return `<div class="bg-white border ${earned && !claimed ? 'border-sky-300' : 'border-sky-200'} rounded-3xl p-3.5 flex flex-col gap-3 shadow-sm">
        <div class="flex gap-3">
            <span class="shrink-0 w-12 h-12 rounded-2xl ${badge} flex items-center justify-center">
                ${claimed ? icon('check', 'w-5 h-5', 3) : `<span class="text-lg font-bold">${reward.stamps}</span>`}
            </span>
            <span class="flex-1 min-w-0 flex flex-col gap-0.5">
                <span class="text-[15px] font-semibold leading-snug text-marble-ink">${r.title}</span>
                <span class="text-xs text-marble-muted">${where}</span>
                <span class="mt-1 text-[13px] font-semibold text-sky-700">${r.mine}</span>
                <span class="self-start mt-0.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 text-[11px] font-semibold">${icon('heart', 'w-3 h-3 shrink-0')}${r.gift}</span>
            </span>
        </div>
        ${footer}
    </div>`;
}

function listHtml(s: Readonly<AppState>): string {
    return `<div role="dialog" aria-modal="true" aria-labelledby="rewardsTitle" class="h-full overflow-y-auto mobile-scroll px-4 flex flex-col gap-3" style="padding-top: max(14px, env(safe-area-inset-top)); padding-bottom: max(20px, env(safe-area-inset-bottom))">
        <div class="flex items-center gap-2.5">
            <button onclick="app.closeRewards()" aria-label="${t('back')}" class="shrink-0 w-10 h-10 rounded-full bg-white text-marble-ink shadow-[0_4px_12px_rgba(15,23,42,0.10)] flex items-center justify-center">${icon('chevronLeft', 'w-5 h-5')}</button>
            <h1 id="rewardsTitle" class="flex-1 text-lg font-semibold text-marble-ink">${t('rewardsTitle')}</h1>
            <span class="shrink-0 px-3 py-1 rounded-full bg-white border border-sky-200 text-sky-700 text-[13px] font-semibold whitespace-nowrap">${t('rewardsCount', { n: stampCount(s), total: exhibitsData.length })}</span>
        </div>
        <div class="shrink-0 rounded-3xl bg-gradient-to-br from-white via-sky-50 to-rose-50 border border-sky-200 p-4 flex gap-3">
            <span class="shrink-0 w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">${icon('heart', 'w-[22px] h-[22px]')}</span>
            <span class="min-w-0">
                <span class="block text-base font-semibold leading-snug text-marble-ink">${t('rewardsHeadline')}</span>
                <span class="block mt-1 text-xs leading-[18px] text-slate-600">${t('rewardsIntro')}</span>
            </span>
        </div>
        ${REWARDS.map((r, i) => rewardCard(r, i, s)).join('')}
        <a href="${CULTURE_SOURCE.url}" target="_blank" rel="noopener" class="self-center px-4 inline-flex items-start justify-center gap-1 text-center text-[11px] leading-4 text-sky-700 underline decoration-sky-300 underline-offset-2">${t('rewardsSource')}${icon('externalLink', 'w-3 h-3 shrink-0 mt-px')}</a>
    </div>`;
}

export function mountRewardList(): void {
    let drawn = '';
    view(
        (s, u) => [u.rewardList, s.stamps, s.rewardsClaimed, s.lang],
        (s, u) => {
            const html = u.rewardList ? listHtml(s) : '';
            if (html === drawn) return;
            const opening = drawn === '';
            drawn = html;
            const host = $('rewardList');
            const scrolled = host?.firstElementChild?.scrollTop ?? 0; // e.g. a reward just claimed in its ticket
            setHidden('rewardList', html === '');
            setHtml('rewardList', html);
            if (!opening && host?.firstElementChild) host.firstElementChild.scrollTop = scrolled;
            if (opening && html && host) {
                host.classList.remove('fade-in');
                void host.offsetWidth; // restart the animation
                host.classList.add('fade-in');
            }
        },
    );
}

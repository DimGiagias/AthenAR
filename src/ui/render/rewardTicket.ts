// A reward's ticket for one venue: when it was earned, the passport it belongs
// to and that it doesn't expire, with the venue's map and website links from
// the City's data. A swipe claims it; it then shows a ticket number and a code
// to show at the ticket desk.
import { venueName } from '../../data/culture';
import { REWARDS } from '../../data/rewards';
import { claimReward, passportCode, ticketNumber, unlockedAt, venueById } from '../../features/rewards';
import type { AppState } from '../../state/store';
import { $, setHidden, setHtml } from '../dom';
import { escapeHtml } from '../escapeHtml';
import { t } from '../i18n';
import { icon } from '../icons';
import { dayTime } from '../shared';
import { view, type UiState } from '../state';

/** The swipe has to reach this share of the track to claim. */
const SWIPE_DONE = 0.85;
/** Modules per side of the ticket code. */
const CODE_SIZE = 25;

/**
 * A QR-style picture drawn from the ticket number: the three corner squares and
 * a pattern that differs per ticket. It is not a real QR code (the ticket is a
 * proof of concept), so there is nothing to scan yet.
 */
function ticketCodeSvg(seed: string): string {
    let h = 2166136261;
    for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
    h ||= 1;
    const random = (): number => {
        h ^= h << 13;
        h ^= h >>> 17;
        h ^= h << 5;
        return (h >>> 0) / 4294967296;
    };
    const n = CODE_SIZE;
    let path = '';
    for (let y = 0; y < n; y++) {
        for (let x = 0; x < n; x++) {
            const left = x < 8;
            const right = x >= n - 8;
            const top = y < 8;
            const bottom = y >= n - 8;
            let dark: boolean;
            if ((left && top) || (right && top) || (left && bottom)) {
                const lx = left ? x : x - (n - 7);
                const ly = top ? y : y - (n - 7);
                const inside = lx >= 0 && lx < 7 && ly >= 0 && ly < 7;
                dark = inside && Math.max(Math.abs(lx - 3), Math.abs(ly - 3)) !== 2;
            } else if (x === 6 || y === 6) {
                dark = (x + y) % 2 === 0;
            } else {
                dark = random() < 0.5;
            }
            if (dark) path += `M${x} ${y}h1v1h-1z`;
        }
    }
    return `<svg viewBox="-2 -2 ${n + 4} ${n + 4}" shape-rendering="crispEdges" class="w-44 h-44" aria-hidden="true"><rect x="-2" y="-2" width="${n + 4}" height="${n + 4}" fill="#fff"/><path d="${path}" fill="#0F172A"/></svg>`;
}

function row(label: string, value: string): string {
    return `<div class="flex items-center justify-between gap-3 py-2.5 border-b border-sky-100 last:border-b-0">
        <dt class="text-[13px] text-slate-500">${label}</dt>
        <dd class="text-sm font-semibold text-marble-ink text-right">${value}</dd>
    </div>`;
}

function ticketHtml(s: Readonly<AppState>, ticket: NonNullable<UiState['rewardTicket']>): string {
    const reward = REWARDS[ticket.reward];
    const earned = reward ? unlockedAt(reward, s) : null;
    if (!reward || earned === null) return '';
    const r = reward[s.lang];
    const claimed = s.rewardsClaimed[reward.stamps];
    // once claimed, the ticket is for the venue it was claimed at
    const venue = venueById(claimed?.venue ?? ticket.venue);
    if (!venue) return '';
    const name = escapeHtml(venueName(venue, s.lang));
    const link = (href: string): string =>
        /^https?:\/\//.test(href)
            ? `<a href="${escapeHtml(href)}" target="_blank" rel="noopener" class="flex-1 h-10 rounded-xl border border-sky-200 bg-sky-50 text-sky-700 text-[13px] font-semibold flex items-center justify-center gap-1.5">${icon('externalLink', 'w-4 h-4')}${t('passWebsite')}</a>`
            : '';
    const number = ticketNumber(reward, s);
    const bottom =
        claimed === undefined || number === null
            ? `<div id="passSwipe" class="relative h-[54px] rounded-[18px] bg-sky-50 border border-sky-200 overflow-hidden select-none touch-none">
                <span class="absolute inset-0 pl-14 pr-3 flex items-center justify-center text-center text-sm font-semibold text-sky-700">${t('passSwipe')}</span>
                <span id="passKnob" role="slider" tabindex="0" aria-label="${t('passSwipeAria')}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" class="absolute top-1 left-1 w-[46px] h-[46px] rounded-[14px] bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center cursor-grab shadow-[0_4px_10px_rgba(37,99,235,0.35)]">${icon('chevronRight', 'w-5 h-5', 2.5)}</span>
            </div>`
            : `<div class="pt-4 border-t-2 border-dashed border-sky-200 flex flex-col items-center gap-2 text-center">
                ${ticketCodeSvg(number)}
                <span class="text-[10px] font-semibold tracking-[0.12em] text-slate-500">${t('passTicketNo')}</span>
                <span class="text-2xl font-bold tracking-wider tabular-nums text-marble-ink">${number}</span>
                <span class="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">${icon('check', 'w-3.5 h-3.5', 3)}${t('passUsed', { when: dayTime(claimed.at, s.lang) })}</span>
                <span class="text-xs text-slate-500">${t('passShowCode')}</span>
            </div>`;
    return `<div role="dialog" aria-modal="true" aria-labelledby="passVenue" class="h-full overflow-y-auto mobile-scroll px-[18px] flex flex-col gap-3.5" style="padding-top: max(14px, env(safe-area-inset-top)); padding-bottom: max(18px, env(safe-area-inset-bottom))">
        <div class="flex items-center gap-2.5">
            <button onclick="app.closeTicket()" aria-label="${t('close')}" class="shrink-0 w-10 h-10 rounded-full bg-white text-marble-ink shadow-[0_4px_12px_rgba(15,23,42,0.10)] flex items-center justify-center">${icon('x', 'w-4 h-4')}</button>
            <span class="text-[15px] font-semibold text-marble-ink">${t('passTitle')}</span>
        </div>
        <div class="shrink-0 rounded-[26px] bg-white shadow-[0_20px_40px_rgba(15,23,42,0.14)] overflow-hidden">
            <div class="px-5 pt-[18px] pb-5 text-white bg-gradient-to-br from-sky-600 to-blue-600">
                <span class="block text-[10px] font-semibold tracking-[0.12em] text-sky-200">${t('passKicker', { n: reward.stamps })}</span>
                <h2 id="passVenue" class="mt-1.5 text-[21px] leading-[26px] font-semibold">${name}</h2>
                <p class="mt-1 text-xs text-white/90">${r.mine} · ${escapeHtml(venue.address)}</p>
            </div>
            <div class="px-5 pt-1.5 pb-5 flex flex-col gap-3">
                <dl>${row(t('passEarned'), dayTime(earned, s.lang))}${row(t('passHolder'), `#${passportCode(s)}`)}${row(t('passExpires'), t('passNoExpiry'))}</dl>
                <div class="flex gap-2">
                    <button onclick="app.venueOnMap(${venue.id})" class="flex-1 h-10 rounded-xl border border-sky-200 bg-sky-50 text-sky-700 text-[13px] font-semibold flex items-center justify-center gap-1.5">${icon('mapPin', 'w-4 h-4')}${t('passOnMap')}</button>
                    ${link(venue.link)}
                </div>
                ${bottom}
            </div>
        </div>
        <p class="flex gap-2 px-1 text-xs leading-[18px] text-slate-600">${icon('heart', 'w-4 h-4 shrink-0 mt-px text-rose-500')}${t('passGift')}</p>
    </div>`;
}

/** Swipe the knob to the end of the track to claim. */
function bindSwipe(index: number, venue: number): void {
    const track = $('passSwipe');
    const knob = $('passKnob');
    if (!track || !knob) return;
    let start: number | null = null;
    let max = 1;
    const place = (x: number): void => {
        knob.style.transform = `translateX(${x}px)`;
        knob.setAttribute('aria-valuenow', String(Math.round((x / max) * 100)));
    };
    const back = (): void => {
        start = null;
        knob.style.transition = 'transform 0.2s ease';
        place(0);
    };
    knob.addEventListener('pointerdown', (e) => {
        start = e.clientX;
        max = Math.max(1, track.clientWidth - knob.offsetWidth - 8);
        knob.style.transition = 'none';
        knob.setPointerCapture(e.pointerId);
    });
    knob.addEventListener('pointermove', (e) => {
        if (start !== null) place(Math.max(0, Math.min(max, e.clientX - start)));
    });
    knob.addEventListener('pointerup', (e) => {
        if (start === null) return;
        if (e.clientX - start >= max * SWIPE_DONE) {
            start = null;
            place(max);
            claimReward(index, venue);
        } else back();
    });
    knob.addEventListener('pointercancel', back);
    knob.addEventListener('keydown', (e) => {
        if (e.key === 'End') claimReward(index, venue);
    });
}

export function mountRewardTicket(): void {
    let drawn = '';
    view(
        (s, u) => [u.rewardTicket, s.stamps, s.rewardsClaimed, s.lang],
        (s, u) => {
            const html = u.rewardTicket === null ? '' : ticketHtml(s, u.rewardTicket);
            // Redraw only on a real change: a redraw mid-swipe would drop the knob.
            if (html === drawn) return;
            const opening = drawn === '';
            drawn = html;
            const host = $('rewardTicket');
            setHidden('rewardTicket', html === '');
            setHtml('rewardTicket', html);
            if (html === '' || u.rewardTicket === null) return;
            if (opening && host) {
                host.classList.remove('fade-in');
                void host.offsetWidth; // restart the animation
                host.classList.add('fade-in');
            }
            bindSwipe(u.rewardTicket.reward, u.rewardTicket.venue);
        },
    );
}

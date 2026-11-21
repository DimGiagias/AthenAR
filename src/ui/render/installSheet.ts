// "Get the app": a sheet offered once per phone, and on demand from the
// passport. Chrome gets an install button (its own prompt); an iPhone gets
// Safari's two steps, since websites there have no install button.
import { offerInstallOnce } from '../../features/install';
import type { AppState } from '../../state/store';
import { setHidden, setHtml } from '../dom';
import { t, type StringKey } from '../i18n';
import { icon, type IconName } from '../icons';
import { PRIMARY } from '../shared';
import { view } from '../state';

function sheetHtml(kind: NonNullable<AppState['installable']>): string {
    const perk = (glyph: IconName, key: StringKey): string =>
        `<li class="flex items-center gap-2.5 text-[13px] text-marble-ink"><span class="shrink-0 w-8 h-8 rounded-xl bg-marble-subtle border border-sky-200 text-sky-700 flex items-center justify-center">${icon(glyph, 'w-4 h-4')}</span>${t(key)}</li>`;
    const step = (n: number, glyph: IconName, key: StringKey): string =>
        `<li class="flex items-center gap-2.5 text-[13px] text-marble-ink"><span class="shrink-0 w-6 h-6 rounded-full bg-sky-600 text-white text-xs font-semibold flex items-center justify-center">${n}</span><span class="flex-1 min-w-0">${t(key)}</span><span class="shrink-0 text-sky-700">${icon(glyph, 'w-[18px] h-[18px]')}</span></li>`;
    const actions =
        kind === 'prompt'
            ? `<button onclick="app.install()" class="h-12 rounded-2xl ${PRIMARY} text-[15px] font-semibold flex items-center justify-center gap-2 shadow-[0_12px_24px_rgba(37,99,235,0.28)] active:scale-[0.98] transition">${icon('download', 'w-5 h-5')}${t('installBtn')}</button>
               <button onclick="app.closeInstall()" class="-mt-1 h-10 text-[13px] font-semibold text-marble-muted">${t('installLater')}</button>`
            : `<ol class="rounded-2xl bg-marble-subtle border border-sky-200 p-3 flex flex-col gap-2.5">${step(1, 'share', 'installIosStep1')}${step(2, 'squarePlus', 'installIosStep2')}</ol>
               <button onclick="app.closeInstall()" class="-mt-1 h-10 text-[13px] font-semibold text-sky-700">${t('installOk')}</button>`;
    return `<div class="absolute inset-0 bg-slate-950/50 fade-in" onclick="app.closeInstall()"></div>
        <div role="dialog" aria-modal="true" aria-labelledby="installTitle" class="sheet-in absolute inset-x-0 bottom-0 bg-white rounded-t-3xl border-t border-sky-200 px-5 flex flex-col gap-4" style="padding-bottom: max(16px, env(safe-area-inset-bottom))">
            <span class="self-center w-9 h-1 rounded-full bg-sky-200 mt-2"></span>
            <div class="flex items-center gap-3.5">
                <img src="icons/icon-192.png" alt="" class="shrink-0 w-14 h-14 rounded-2xl shadow-[0_10px_22px_rgba(37,99,235,0.3)]">
                <span class="min-w-0">
                    <h2 id="installTitle" class="text-lg leading-6 font-semibold text-marble-ink">${t('installTitle')}</h2>
                    <span class="block text-xs text-marble-muted mt-0.5">${t('installSub')}</span>
                </span>
            </div>
            <ul class="flex flex-col gap-2.5">${perk('smartphone', 'installPerkFast')}${perk('wifiOff', 'installPerkOffline')}${perk('award', 'installPerkKeep')}</ul>
            ${actions}
        </div>`;
}

export function mountInstallSheet(): void {
    // Offered once, when the visitor is looking around: not over the welcome
    // page, and not in AR (a poster's QR code opens straight into the scanner).
    view(
        (s, u) => [s.installable, u.welcome, u.screen],
        (s, u) => {
            if (s.installable !== null && !u.welcome && u.screen !== 'ar') offerInstallOnce();
        },
    );
    view(
        (s) => [s.installSheet, s.installable, s.lang],
        (s) => {
            const open = s.installSheet && s.installable !== null;
            setHidden('installSheet', !open);
            setHtml('installSheet', open && s.installable ? sheetHtml(s.installable) : '');
        },
    );
}

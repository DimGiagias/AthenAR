// Welcome screen, header, bottom bar, screen switching and the toast.
import { exhibitsData } from '../../data/exhibits';
import { stampCount } from '../../features/exhibits';
import { $, setClass, setHidden, setText } from '../dom';
import { t } from '../i18n';
import { view } from '../state';

const W_SEG_ON = 'h-8 px-3 rounded-[10px] text-xs font-extrabold bg-sky-600 text-white shadow-sm transition';
const W_SEG_OFF = 'h-8 px-3 rounded-[10px] text-xs font-bold text-marble-muted hover:text-marble-ink transition';
const NAV_ON = 'relative flex flex-col items-center justify-center gap-1 rounded-2xl bg-sky-100/90 text-sky-700 text-[11px] font-extrabold transition';
const NAV_OFF = 'relative flex flex-col items-center justify-center gap-1 rounded-2xl text-marble-muted hover:text-marble-ink text-[11px] font-bold transition';

export function mountShell(): void {
    // Screen switching runs first, so later watchers measure visible elements.
    view(
        (_s, u) => [u.screen],
        (_s, u) => {
            setHidden('scr-explore', u.screen !== 'explore');
            setHidden('scr-exhibit', u.screen !== 'exhibit');
            setHidden('scr-passport', u.screen !== 'passport');
            setHidden('scr-ar', u.screen !== 'ar');
            setHidden('appHeader', u.screen !== 'explore' && u.screen !== 'passport');
            setHidden('appNav', u.screen === 'ar');
        },
    );

    // --- welcome ---
    view(
        (s) => [s.lang],
        (s) => {
            setText('wSubtitle', t('wSubtitle'));
            setText('wLine1', t('wLine1'));
            setText('wLine2', t('wLine2'));
            setText('wEnter', t('wEnter'));
            setClass('wLang-el', s.lang === 'el' ? W_SEG_ON : W_SEG_OFF);
            setClass('wLang-en', s.lang === 'en' ? W_SEG_ON : W_SEG_OFF);
        },
    );
    let leaveTimer: ReturnType<typeof setTimeout> | undefined;
    view(
        (_s, u) => [u.welcome],
        (_s, u) => {
            const el = $('welcome');
            if (!el) return;
            clearTimeout(leaveTimer);
            if (u.welcome) {
                el.classList.remove('hidden', 'is-leaving', 'welcome-in');
                void el.offsetWidth; // restart the entrance animation
                el.classList.add('welcome-in');
            } else {
                el.classList.add('is-leaving');
                leaveTimer = setTimeout(() => el.classList.add('hidden'), 450);
            }
        },
    );

    // --- header ---
    view(
        (s) => [s.lang, s.stamps],
        (s) => {
            document.documentElement.lang = s.lang;
            setText('hdrSub', t('headerSubtitle'));
            // The language button shows the language it switches to.
            setText('hdrLang', s.lang === 'el' ? 'EN' : 'ΕΛ');
            $('hdrLang')?.setAttribute('aria-label', t('langSwitch'));            setText('navBadge', `${stampCount(s)}/${exhibitsData.length}`);
        },
    );

    // --- bottom bar ---
    view(
        (s, u) => [s.lang, u.screen],
        (_s, u) => {
            const active = u.screen === 'passport' ? 'passport' : 'explore';
            setClass('nav-explore', active === 'explore' ? NAV_ON : NAV_OFF);
            setClass('nav-ar', NAV_OFF);
            setClass('nav-passport', active === 'passport' ? NAV_ON : NAV_OFF);
            setText('navLbl-explore', t('navExplore'));
            setText('navLbl-ar', t('navAr'));
            setText('navLbl-passport', t('navPassport'));
        },
    );

    // --- toast ---
    view(
        (s) => [s.toast],
        (s) => {
            setHidden('appToast', !s.toast);
            if (s.toast) setText('appToastText', s.toast.text);
        },
    );
}

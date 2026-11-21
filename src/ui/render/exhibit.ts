// Exhibit page: the photo (or drawing) full width on top with the stamp status
// over it, then a sheet with title, "See it in AR" + "Listen", the story, AR
// stories and memories; a mini audio player docks above the bottom bar while it plays.
import { exhibitPhotos } from '../../data/photos';
import { seedMemories } from '../../data/seedMemories';
import { render2dArchitecturalSvg } from '../../features/ar/svg2d';
import { isOnSite } from '../../features/ar/verification';
import { currentAssessment, currentExhibit } from '../../features/exhibits';
import type { AppState } from '../../state/store';
import { $, setClass, setHidden, setHtml, setText } from '../dom';
import { escapeHtml } from '../escapeHtml';
import { t } from '../i18n';
import { icon } from '../icons';
import { dist, metresTo, PRIMARY, ROOM_BADGE, roomLabel } from '../shared';
import { view, type UiState } from '../state';

const SEG_ON = 'h-8 px-3 rounded-[9px] text-xs font-extrabold bg-white text-sky-700 shadow-sm transition';
const SEG_OFF = 'h-8 px-3 rounded-[9px] text-xs font-bold text-marble-muted hover:text-marble-ink transition';
const A_SEG_ON = 'h-7 px-1.5 rounded-lg text-[11px] font-extrabold bg-sky-600 text-white shadow-sm transition';
const A_SEG_OFF = 'h-7 px-1.5 rounded-lg text-[11px] font-bold text-marble-muted transition';
const EQ_HEIGHTS = [6, 12, 16, 9, 14, 7, 15, 10, 5, 11, 14, 8, 12, 6, 10, 5];

/** Stamp status, top right over the photo. */
function renderStamp(s: Readonly<AppState>): void {
    const ex = currentExhibit(s);
    const base = 'h-8 px-3 rounded-full border text-xs font-semibold flex items-center gap-1.5 shadow-[0_2px_8px_rgba(15,23,42,0.10)]';
    let pill: string;
    if (s.stamps[ex.id] !== undefined) {
        pill = `<span class="${base} bg-emerald-50 border-emerald-200 text-emerald-700">${icon('award', 'w-4 h-4')}${t('stamped')}</span>`;
    } else if (isOnSite(currentAssessment(s))) {
        pill = `<button onclick="app.openAr()" class="${base} bg-white border-emerald-300 text-emerald-700 hover:bg-emerald-50 transition">${icon('award', 'w-4 h-4')}${t('pillHere')}</button>`;
    } else {
        pill = `<span class="${base} bg-white/95 border-sky-200 text-marble-muted">${icon('lock', 'w-3.5 h-3.5')}${t('pillOnSite')}</span>`;
    }
    setHtml('xStamp', pill);
}

function renderBody(s: Readonly<AppState>): void {
    const ex = currentExhibit(s);
    const d = ex[s.lang];
    const m = metresTo(ex, s);
    const where = m !== null ? `<span class="text-emerald-700 font-semibold">${t(s.demoMode ? 'fromDemo' : 'fromYou', { dist: dist(m) })}</span>` : d.walk;
    $('xBack')?.setAttribute('aria-label', t('back'));
    setHtml(
        'xHead',
        `<div class="flex flex-wrap items-center gap-1.5">
            <span class="px-2 py-0.5 rounded-lg bg-sky-100 text-sky-700 text-xs font-semibold">${ex.num}</span>
            <span class="px-2 py-0.5 rounded-lg border text-xs font-semibold ${ROOM_BADGE[ex.eraRoom]}">${roomLabel(ex.eraRoom)}</span>
            <span class="text-[13px] text-marble-muted">${ex.year}</span>
        </div>
        <h1 class="text-[25px] leading-[31px] font-semibold text-marble-ink mt-2">${d.title}</h1>
        <p class="text-sm text-marble-muted mt-1">${d.street} · ${where}</p>`,
    );
    setHtml(
        'xActions',
        `<button onclick="app.openAr()" class="flex-1 min-w-0 h-[52px] px-3 rounded-2xl ${PRIMARY} text-[15px] font-semibold flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(2,132,199,0.22)] hover:opacity-95 transition">
            ${icon('scanEye', 'w-5 h-5 shrink-0')}<span class="truncate">${t('btnSeeAr')}</span>
        </button>
        <button onclick="app.audio()" aria-pressed="${s.audioPlaying}" class="shrink-0 w-[108px] h-[52px] rounded-2xl bg-white border-[1.5px] border-sky-300 text-sky-700 text-[15px] font-semibold flex items-center justify-center gap-2 hover:bg-sky-50 transition">
            ${icon(s.audioPlaying ? 'pause' : 'headphones', 'w-5 h-5')}${t(s.audioPlaying ? 'btnAudioStop' : 'btnListen')}
        </button>
        <button onclick="app.openArea()" aria-label="${t('areaTitle')}" class="shrink-0 w-[52px] h-[52px] rounded-2xl bg-white border-[1.5px] border-sky-300 text-sky-700 flex items-center justify-center hover:bg-sky-50 transition">
            ${icon('info', 'w-[22px] h-[22px]')}
        </button>`,
    );
    setHtml('xDesc', d.shortDesc); // the exhibit texts are our own and may hold markup
}

function renderStories(s: Readonly<AppState>, u: Readonly<UiState>): void {
    const ex = currentExhibit(s);
    const stories = ex[s.lang].hotspots;
    const own = s.memories.filter((mm) => mm.exhibitId === ex.id).sort((a, b) => b.createdAt - a.createdAt);
    const curated = seedMemories.filter((mm) => mm.exhibitId === ex.id);
    const memoryCount = own.length + curated.length;
    const onStories = u.exhibitTab === 'stories';

    let list: string;
    if (onStories) {
        list = stories
            .map(
                (h, i) => `
                <button onclick="app.readStory(${i})" class="w-full text-left flex items-start gap-3 py-3 ${i < stories.length - 1 ? 'border-b border-sky-100' : ''} ${u.storySheet === i ? 'bg-sky-50 rounded-xl -mx-2 px-2 w-[calc(100%+16px)]' : ''} group">
                    <span class="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 text-white text-[13px] font-semibold flex items-center justify-center shadow-sm">${i + 1}</span>
                    <span class="flex-1 min-w-0 flex flex-col gap-0.5">
                        <span class="text-[10px] font-semibold uppercase tracking-[0.08em] text-sky-700">${escapeHtml(h.type)}</span>
                        <span class="text-[15px] font-semibold text-marble-ink leading-snug group-hover:text-sky-700">${escapeHtml(h.title)}</span>
                    </span>
                    <span class="text-sky-300 shrink-0 self-center">${icon('chevronRight', 'w-4 h-4')}</span>
                </button>`,
            )
            .join('');
    } else if (memoryCount === 0) {
        list = `<p class="py-4 text-center text-[13px] text-marble-muted">${t('memoriesEmpty')}</p>`;
    } else {
        const card = (decade: string, text: string, author: string, ownId?: string): string => `
            <div class="p-3 rounded-2xl bg-marble-subtle border border-sky-200 space-y-1.5">
                <div class="flex items-center justify-between text-[11px] font-semibold">
                    <span class="text-sky-700">— ${escapeHtml(author)}${ownId ? ` · ${t('you')}` : ''}</span>
                    <span class="px-2 py-0.5 rounded-full bg-white border border-sky-200 text-sky-700">${escapeHtml(decade)}</span>
                </div>
                <p class="text-[13px] leading-[19px] italic text-marble-ink">${escapeHtml(text)}</p>
                ${
                    ownId
                        ? `<div class="flex items-center justify-end gap-3 text-[11px] font-semibold">
                            <button onclick="app.deleteMemory('${escapeHtml(ownId)}')" class="text-slate-500 hover:underline">${t('memoryDelete')}</button>
                            <button onclick="app.memoryAr('${escapeHtml(ownId)}')" class="text-sky-700 hover:underline">${t('viewOnBuildingBtn')}</button>
                        </div>`
                        : ''
                }
            </div>`;
        list = `<div class="space-y-2 pt-1">${[
            ...own.map((mm) => card(mm.decade, mm.text, mm.author, mm.id)),
            ...curated.map((mm) => card(mm.decade, s.lang === 'el' ? mm.elText : mm.enText, mm.author)),
        ].join('')}</div>`;
    }

    setHtml(
        'xStories',
        `<div class="flex items-center justify-between gap-2">
            <div role="tablist" class="flex p-0.5 rounded-xl bg-marble-subtle border border-sky-200">
                <button role="tab" aria-selected="${onStories}" onclick="app.exhibitTab('stories')" class="${onStories ? SEG_ON : SEG_OFF}">${t('tabStories', { n: stories.length })}</button>
                <button role="tab" aria-selected="${!onStories}" onclick="app.exhibitTab('memories')" class="${onStories ? SEG_OFF : SEG_ON}">${t('tabMemories', { n: memoryCount })}</button>
            </div>
            <button onclick="app.openMemory()" class="h-8 px-2.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold flex items-center gap-1 hover:bg-sky-100 transition">${icon('plus', 'w-3.5 h-3.5', 2.4)}${t('addMemory')}</button>
        </div>
        <div class="mt-1">${list}</div>`,
    );
}

/**
 * One AR story to read before going into AR: number, type, title, the text,
 * ‹ › through the exhibit's stories, and "See it in AR" on that story's pin.
 */
function storySheetHtml(s: Readonly<AppState>, index: number, animate: boolean): string {
    const stories = currentExhibit(s)[s.lang].hotspots;
    const h = stories[index];
    if (!h) return '';
    const n = stories.length;
    const nav = (glyph: 'chevronLeft' | 'chevronRight', delta: number, label: string): string =>
        `<button onclick="app.storyStep(${delta})" aria-label="${label}" class="w-[38px] h-[38px] rounded-xl border border-sky-200 bg-sky-50 text-sky-700 flex items-center justify-center hover:bg-sky-100 transition">${icon(glyph, 'w-4 h-4')}</button>`;
    const dots = stories.map((_, i) => `<span class="h-1.5 rounded-full transition-all ${i === index ? 'w-4 bg-sky-600' : 'w-1.5 bg-sky-200'}"></span>`).join('');
    // A resident's memory is a quote: it starts with a quotation mark.
    const quote = /^["«“]/.test(h.text.trimStart());
    return `<div class="absolute inset-0 bg-slate-950/45 ${animate ? 'fade-in' : ''}" onclick="app.closeStorySheet()"></div>
        <div role="dialog" aria-modal="true" aria-labelledby="storySheetTitle" class="${animate ? 'sheet-in' : ''} absolute inset-x-0 bottom-0 bg-white rounded-t-3xl border-t border-sky-200 px-[18px] flex flex-col gap-3.5" style="padding-bottom: max(18px, env(safe-area-inset-bottom))">
            <span class="self-center w-10 h-1 rounded-full bg-sky-200 mt-2.5"></span>
            <div class="flex items-start gap-3">
                <span class="shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 text-white text-[15px] font-semibold flex items-center justify-center shadow-sm">${index + 1}</span>
                <span class="flex-1 min-w-0">
                    <span class="block text-[10px] font-semibold uppercase tracking-[0.08em] text-sky-700">${escapeHtml(h.type)}</span>
                    <h2 id="storySheetTitle" class="mt-0.5 text-[19px] leading-6 font-semibold text-marble-ink">${escapeHtml(h.title)}</h2>
                </span>
                <button onclick="app.closeStorySheet()" aria-label="${t('close')}" class="shrink-0 w-[34px] h-[34px] rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">${icon('x', 'w-4 h-4')}</button>
            </div>
            <p class="text-[15px] leading-6 text-slate-700 ${quote ? 'italic' : ''}">${escapeHtml(h.text)}</p>
            ${
                n > 1
                    ? `<div class="flex flex-col gap-1.5">
                        <div class="flex items-center justify-between">
                            ${nav('chevronLeft', -1, t('storyPrev'))}
                            <span class="text-xs font-semibold text-slate-500">${t('storyOf', { i: index + 1, n })}</span>
                            ${nav('chevronRight', 1, t('storyNext'))}
                        </div>
                        <div class="flex justify-center gap-1.5">${dots}</div>
                    </div>`
                    : ''
            }
            <button onclick="app.storyAr(${index})" class="h-[52px] rounded-2xl ${PRIMARY} text-[15px] font-semibold flex items-center justify-center gap-2.5 shadow-[0_12px_24px_rgba(37,99,235,0.28)] active:scale-[0.98] transition">${icon('scanEye', 'w-[22px] h-[22px]')}${t('btnSeeAr')}</button>
            <span class="-mt-2 text-center text-[11px] text-slate-500">${t('storyArHint', { i: index + 1 })}</span>
        </div>`;
}

/** The hero photo, with its credit; the drawing shows when there is none or it fails to load. */
function mountPhoto(): void {
    const img = $('xPhoto') as HTMLImageElement | null;
    if (!img) return;
    const show = (on: boolean): void => {
        setHidden('xPhoto', !on);
        setHidden('xPhotoShade', !on);
        setHidden('xPhotoCredit', !on);
        setHidden('xDrawing', on);
    };
    img.addEventListener('load', () => show(true));
    img.addEventListener('error', () => show(false));

    view(
        (s) => [s.exhibitId, s.lang],
        (s) => {
            const ex = currentExhibit(s);
            const photo = exhibitPhotos[ex.id];
            img.alt = ex[s.lang].title;
            const credit = $('xPhotoCredit') as HTMLAnchorElement | null;
            if (credit && photo) {
                credit.textContent = `${t('photoBy')} ${photo.author} · ${photo.licence}`;
                credit.href = photo.source;
            }
            if (!photo) {
                img.removeAttribute('src');
                show(false);
                return;
            }
            const src = `exhibits/${photo.file}`;
            if (img.getAttribute('src') === src) return;
            show(false); // until it has loaded
            img.src = src;
        },
    );
}

export function mountExhibit(): void {
    // the 16 equaliser bars of the mini player
    setHtml('xEq', EQ_HEIGHTS.map((h) => `<span class="eq-bar w-[3px] rounded-full bg-sky-200" style="height:${h}px"></span>`).join(''));

    view((s) => [s.lang, s.exhibitId, s.stamps, s.gps, s.coords, s.accuracy, s.heading, s.demoMode], renderStamp);
    view((s) => [s.lang, s.exhibitId, s.gps, s.coords, s.demoMode, s.audioPlaying], renderBody);
    view((s, u) => [s.lang, s.exhibitId, s.memories, u.exhibitTab, u.storySheet], renderStories);
    // Reading an AR story: only over the exhibit page. It slides in when it
    // opens, not again on every ‹ ›.
    let sheetOpen = false;
    view(
        (s, u) => [s.lang, s.exhibitId, u.screen, u.storySheet],
        (s, u) => {
            const html = u.screen === 'exhibit' && u.storySheet !== null ? storySheetHtml(s, u.storySheet, !sheetOpen) : '';
            sheetOpen = html !== '';
            setHidden('storySheet', !sheetOpen);
            setHtml('storySheet', html);
        },
    );
    view(
        (s) => [s.exhibitId],
        (s) => {
            const host = $('xDrawing');
            if (host) render2dArchitecturalSvg(host, currentExhibit(s), 'today');
        },
    );
    mountPhoto();
    view(
        (s) => [s.lang, s.audioLang, s.exhibitId],
        (s) => {
            // in the narration language only
            setText('xTranscriptLabel', t('transcript'));
            setText('xTranscriptMain', currentExhibit(s)[s.audioLang].audioScript);
        },
    );

    // --- mini audio player ---
    view(
        (s) => [s.lang, s.audioPlaying],
        (s) => {
            setHidden('xPlayer', !s.audioPlaying);
            setHtml('xPlayBtn', icon(s.audioPlaying ? 'pause' : 'play', 'w-4 h-4'));
            $('xPlayBtn')?.setAttribute('aria-label', t(s.audioPlaying ? 'btnAudioStop' : 'btnListen'));
            setText('xPlayerTitle', t('playerTitle'));
            setText('xPlayerSub', t(s.audioPlaying ? 'playerPlaying' : 'playerIdle'));
            $('xEq')?.classList.toggle('playing', s.audioPlaying);
        },
    );
    view(
        (s) => [s.audioProgress],
        (s) => {
            const lit = Math.round(s.audioProgress * EQ_HEIGHTS.length);
            $('xEq')
                ?.querySelectorAll<HTMLElement>('.eq-bar')
                .forEach((bar, i) => {
                    bar.classList.toggle('bg-sky-500', i < lit);
                    bar.classList.toggle('bg-sky-200', i >= lit);
                });
        },
    );
    view(
        (s) => [s.audioSpeed],
        (s) => setText('xSpeed', s.audioSpeed.toFixed(2).replace('.00', '.0') + 'x'),
    );
    view(
        (s) => [s.audioLang],
        (s) => {
            setClass('xAud-el', s.audioLang === 'el' ? A_SEG_ON : A_SEG_OFF);
            setClass('xAud-en', s.audioLang === 'en' ? A_SEG_ON : A_SEG_OFF);
        },
    );
}

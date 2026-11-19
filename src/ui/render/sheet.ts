// Add a memory: a sheet over the exhibit page, with the building
// already filled in.
import { exhibitsData } from '../../data/exhibits';
import { getExhibit } from '../../features/exhibits';
import { MAX_AUTHOR_CHARS, MAX_STORY_CHARS } from '../../features/memories';
import { setHidden, setHtml } from '../dom';
import { t } from '../i18n';
import { icon } from '../icons';
import { PRIMARY } from '../shared';
import { view } from '../state';

const DECADES = ['1950s', '1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'];
const FIELD = 'w-full rounded-2xl border border-sky-200 bg-marble-subtle text-marble-ink focus:outline-none focus:border-sky-500 focus:bg-white transition';

export function mountMemorySheet(): void {
    // The form is drawn once per opening, so typed text survives other updates.
    view(
        (s, u) => [u.memorySheet, s.lang],
        (s, u) => {
            setHidden('memorySheet', !u.memorySheet);
            if (!u.memorySheet) {
                setHtml('memorySheet', '');
                return;
            }
            setHtml(
                'memorySheet',
                `<div class="absolute inset-0 bg-slate-950/60 fade-in" onclick="app.closeMemory()"></div>
                <form onsubmit="event.preventDefault(); app.saveMemory()" class="sheet-in absolute inset-x-0 bottom-0 max-h-[90%] overflow-y-auto mobile-scroll bg-white rounded-t-3xl border-t border-sky-200 px-4 pb-5 flex flex-col gap-3.5">
                    <span class="self-center w-9 h-1 rounded-full bg-sky-200 mt-2"></span>
                    <div class="flex items-start gap-2.5">
                        <span class="shrink-0 w-10 h-10 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center">${icon('feather', 'w-5 h-5')}</span>
                        <span class="flex-1 min-w-0 flex flex-col gap-0.5">
                            <h2 class="text-lg leading-[22px] text-marble-ink">${t('msTitle')}</h2>
                            <span class="text-xs text-marble-muted">${t('msSub')}</span>
                        </span>
                        <button type="button" onclick="app.closeMemory()" aria-label="${t('close')}" class="shrink-0 w-10 h-10 rounded-full bg-white border border-marble-border text-marble-muted flex items-center justify-center hover:text-marble-ink">${icon('x', 'w-4 h-4')}</button>
                    </div>
                    <label class="relative flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-marble-subtle border border-sky-200 cursor-pointer">
                        <span class="text-sky-600 shrink-0">${icon('mapPin', 'w-4 h-4')}</span>
                        <span id="msExhibitText" class="flex-1 min-w-0 text-[13px] truncate"></span>
                        <span class="shrink-0 h-[30px] px-2 rounded-[10px] border border-sky-200 bg-white text-sky-700 text-[11px] font-semibold flex items-center">${t('msChange')}</span>
                        <select id="msExhibit" onchange="app.memoryExhibit(this.value)" class="absolute inset-0 opacity-0 cursor-pointer" aria-label="${t('msChange')}">
                            ${exhibitsData.map((ex) => `<option value="${ex.id}" ${ex.id === u.memoryExhibitId ? 'selected' : ''}>${ex.num} — ${ex[s.lang].title}</option>`).join('')}
                        </select>
                    </label>
                    <div class="flex flex-col gap-1.5">
                        <label for="msStory" class="text-xs font-medium text-marble-muted">${t('msStory')}</label>
                        <textarea id="msStory" rows="5" maxlength="${MAX_STORY_CHARS}" placeholder="${t('msPlaceholder')}" class="${FIELD} h-32 p-3 text-sm leading-[21px] resize-none"></textarea>
                    </div>
                    <div class="grid grid-cols-3 gap-2">
                        <div class="col-span-2 flex flex-col gap-1.5">
                            <label for="msName" class="text-xs font-medium text-marble-muted">${t('msName')}</label>
                            <input id="msName" type="text" maxlength="${MAX_AUTHOR_CHARS}" placeholder="${t('msNamePlaceholder')}" class="${FIELD} h-11 px-3 text-sm font-medium">
                        </div>
                        <div class="flex flex-col gap-1.5">
                            <label for="msDecade" class="text-xs font-medium text-marble-muted">${t('msDecade')}</label>
                            <select id="msDecade" class="${FIELD} h-11 px-2.5 text-sm font-semibold">
                                ${DECADES.map((d) => `<option value="${d}" ${d === '1970s' ? 'selected' : ''}>${d}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <span class="flex items-center gap-2 px-3 py-2 rounded-xl bg-marble-bg text-xs text-marble-muted">${icon('smartphone', 'w-4 h-4 text-sky-500')}${t('msLocal')}</span>
                    <button type="submit" class="h-[50px] rounded-2xl ${PRIMARY} text-sm font-semibold flex items-center justify-center gap-2 shadow-sm hover:opacity-95 transition">${icon('mapPin', 'w-4 h-4')}${t('msSubmit')}</button>
                </form>`,
            );
        },
    );
    view(
        (s, u) => [u.memorySheet, u.memoryExhibitId, s.lang],
        (s, u) => {
            if (!u.memorySheet) return;
            const ex = getExhibit(u.memoryExhibitId);
            setHtml('msExhibitText', `<span class="font-semibold text-sky-700">${ex.num}</span> · <span class="font-semibold">${ex[s.lang].title}</span>`);
        },
    );
}

// Bilingual audio guide. Speaks the selected exhibit's script through the
// current speech engine and reports real play / stop / progress to the store.
import type { Lang } from '../data/types';
import { estimateSpeechSeconds, getSpeechEngine } from '../platform/tts';
import { getState, setState, watch } from '../state/store';
import { t } from '../ui/i18n';
import { currentExhibit } from './exhibits';
import { showToast } from './toast';

const TICK_MS = 250;
let ticker: ReturnType<typeof setInterval> | undefined;
/** Bumped on every start/stop so callbacks from an old utterance are ignored. */
let session = 0;

export function stopAudio(): void {
    session += 1;
    clearInterval(ticker);
    getSpeechEngine().stop();
    setState({ audioPlaying: false, audioProgress: 0 });
}

function play(): void {
    const engine = getSpeechEngine();
    if (!engine.isAvailable()) {
        showToast(t('toastNoVoice'));
        return;
    }
    stopAudio();
    const mine = ++session;
    const s = getState();
    const text = currentExhibit(s)[s.audioLang].audioScript;

    // Progress follows the engine's word-boundary events when it sends them.
    // Engines that do not (many Android voices) get a time-based estimate
    // that stops short of the end until the engine really finishes.
    const estimatedSeconds = estimateSpeechSeconds(text, s.audioSpeed);
    const startedAt = performance.now();
    let reported: number | null = null;

    setState({ audioPlaying: true, audioProgress: 0.02 });
    ticker = setInterval(() => {
        if (mine !== session) return;
        const estimate = Math.min(0.97, (performance.now() - startedAt) / 1000 / estimatedSeconds);
        setState({ audioProgress: Math.max(0.02, reported ?? estimate) });
    }, TICK_MS);

    engine.speak({
        text,
        lang: s.audioLang,
        rate: s.audioSpeed,
        onProgress: (fraction) => {
            if (mine === session) reported = fraction;
        },
        onEnd: () => {
            if (mine === session) stopAudio();
        },
        onError: () => {
            if (mine !== session) return;
            stopAudio();
            showToast(t('toastNoVoice'));
        },
    });
}

export function toggleAudio(): void {
    if (getState().audioPlaying) stopAudio();
    else play();
}

export function setAudioLang(lang: Lang): void {
    const wasPlaying = getState().audioPlaying;
    setState({ audioLang: lang });
    if (wasPlaying) play();
}

export function toggleAudioSpeed(): void {
    const wasPlaying = getState().audioPlaying;
    setState({ audioSpeed: getState().audioSpeed === 1.0 ? 1.25 : 1.0 });
    if (wasPlaying) play();
}

export function initAudio(): void {
    let lastExhibit = getState().exhibitId;
    watch(
        (s) => [s.exhibitId],
        (s) => {
            if (s.exhibitId !== lastExhibit) {
                lastExhibit = s.exhibitId;
                if (s.audioPlaying) stopAudio();
            }
        },
    );
}

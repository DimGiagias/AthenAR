// Text-to-speech behind one small interface so the audio guide does not care
// which engine speaks. The browser engine (Web Speech API) is built in; the
// native Android engine is registered from platform/native.ts,
// because Android WebViews have historically not exposed speechSynthesis.
import type { Lang } from '../data/types';

export interface SpeakOptions {
    text: string;
    lang: Lang;
    rate: number;
    /** Fraction 0..1 of the text spoken so far, when the engine can tell. */
    onProgress?: (fraction: number) => void;
    onEnd: () => void;
    onError: () => void;
}

export interface SpeechEngine {
    isAvailable(): boolean;
    speak(opts: SpeakOptions): void;
    stop(): void;
}

const LOCALE: Record<Lang, string> = { el: 'el-GR', en: 'en-US' };

const webSpeech: SpeechEngine = {
    isAvailable: () => typeof window !== 'undefined' && 'speechSynthesis' in window,
    speak(opts) {
        const synth = window.speechSynthesis;
        synth.cancel();
        const utter = new SpeechSynthesisUtterance(opts.text);
        utter.lang = LOCALE[opts.lang];
        utter.rate = opts.rate;
        // Prefer a voice that really matches the language, if the device has one.
        const voice = synth.getVoices().find((v) => v.lang.toLowerCase().startsWith(opts.lang));
        if (voice) utter.voice = voice;
        utter.onboundary = (e) => opts.onProgress?.(Math.min(1, e.charIndex / Math.max(1, opts.text.length)));
        utter.onend = () => opts.onEnd();
        utter.onerror = (e) => {
            // cancel() reports itself as an error; that is a normal stop.
            if (e.error === 'canceled' || e.error === 'interrupted') return;
            opts.onError();
        };
        synth.speak(utter);
    },
    stop() {
        if (this.isAvailable()) window.speechSynthesis.cancel();
    },
};

let engine: SpeechEngine = webSpeech;

/** Swap in another engine (e.g. the native Android one). */
export function setSpeechEngine(next: SpeechEngine): void {
    engine.stop();
    engine = next;
}

export function getSpeechEngine(): SpeechEngine {
    return engine;
}

/** Rough speaking time, used to animate progress on engines without events. */
export function estimateSpeechSeconds(text: string, rate: number): number {
    const CHARS_PER_SECOND = 14;
    return Math.max(2, text.length / (CHARS_PER_SECOND * rate));
}

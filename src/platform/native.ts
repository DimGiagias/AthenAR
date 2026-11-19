// Everything that differs between the browser/PWA and the Android app built
// with Capacitor lives here, so the rest of the code stays platform-neutral.
import { Capacitor } from '@capacitor/core';
import type { Lang } from '../data/types';
import { setSpeechEngine, type SpeechEngine } from './tts';

export function isNativeApp(): boolean {
    return Capacitor.isNativePlatform();
}

const LOCALE: Record<Lang, string> = { el: 'el-GR', en: 'en-US' };

/**
 * Android WebViews have historically not exposed the Web Speech API, so the
 * native app speaks through the phone's own text-to-speech engine instead.
 */
async function useNativeSpeech(): Promise<void> {
    const { TextToSpeech } = await import('@capacitor-community/text-to-speech');
    let utterance = 0;
    let current: { length: number; onProgress?: (fraction: number) => void } | null = null;

    // Word-boundary events drive the progress bar where the engine sends them.
    try {
        await TextToSpeech.addListener('onRangeStart', (info) => {
            current?.onProgress?.(Math.min(1, info.end / current.length));
        });
    } catch {
        // Not supported on this device: the audio guide falls back to a time estimate.
    }

    const engine: SpeechEngine = {
        isAvailable: () => true,
        speak(opts) {
            const mine = ++utterance;
            current = { length: Math.max(1, opts.text.length), onProgress: opts.onProgress };
            TextToSpeech.speak({ text: opts.text, lang: LOCALE[opts.lang], rate: opts.rate, pitch: 1.0, volume: 1.0 })
                .then(() => {
                    if (mine === utterance) opts.onEnd();
                })
                .catch(() => {
                    // stop() rejects the pending speak(); only a live utterance is an error.
                    if (mine === utterance) opts.onError();
                });
        },
        stop() {
            utterance += 1;
            current = null;
            void TextToSpeech.stop().catch(() => {});
        },
    };
    setSpeechEngine(engine);
}

/** Call once at start-up. */
export async function initPlatform(): Promise<void> {
    if (isNativeApp()) {
        await useNativeSpeech();
        return;
    }
    // Browser / PWA: cache the app for offline use and keep it up to date.
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
        const { registerSW } = await import('virtual:pwa-register');
        registerSW({ immediate: true });
    }
}

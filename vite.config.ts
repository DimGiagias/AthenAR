import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => ({
    base: './',
    build: {
        target: 'es2020',
        chunkSizeWarningLimit: 1200,
    },
    // The street map (MapLibre) decodes its tiles in a module worker.
    worker: { format: 'es' },
    plugins: [
        // `npm run phone`: HTTPS with a temporary self-signed certificate, so a
        // phone on the same Wi-Fi gets camera, GPS and compass access.
        mode === 'phone' && basicSsl(),
        VitePWA({
            injectRegister: null,
            registerType: 'autoUpdate',
            includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
            manifest: {
                name: 'AthenAR — Ανοιχτό Μουσείο Αθήνας',
                short_name: 'AthenAR',
                description: 'Το ανοιχτό μουσείο της Αθήνας: διαδρομές, AR και δίγλωσση ξενάγηση. / The open-air museum of Athens: routes, AR and a bilingual audio guide.',
                lang: 'el',
                start_url: '.',
                scope: '.',
                display: 'standalone',
                orientation: 'portrait',
                background_color: '#F8FAFC',
                theme_color: '#0284C7',
                icons: [
                    { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
                    { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
                    { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
                ],
            },
            workbox: {
                // Precache the whole app (and, later, the narration clips) so it
                // runs with no network at all.
                globPatterns: ['**/*.{js,mjs,css,html,svg,png,jpg,webmanifest,mp3,pbf,geojson,mind}'],
                maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
            },
        }),
    ],
}));

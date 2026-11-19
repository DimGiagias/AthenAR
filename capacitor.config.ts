import type { CapacitorConfig } from '@capacitor/cli';

// appId is the app's permanent identity on Android: changing it after people
// have installed the app makes Android treat it as a different app.
const config: CapacitorConfig = {
    appId: 'gr.athenar.app',
    appName: 'AthenAR',
    webDir: 'dist',
};

export default config;

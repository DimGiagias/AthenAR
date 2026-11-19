import './styles.css';

import { initArControls } from './features/ar/controls';
import { initImageAr } from './features/ar/imageAr';
import { detectRoomAr } from './features/ar/room';
import { initAudio } from './features/audio';
import { initLocation } from './features/location';
import { loadMemories } from './features/memories';
import { initPlatform } from './platform/native';
import { app } from './ui/actions';
import { mountAr } from './ui/render/ar';
import { mountExhibit } from './ui/render/exhibit';
import { mountExplore } from './ui/render/explore';
import { mountPassport } from './ui/render/passport';
import { mountShell } from './ui/render/shell';
import { mountMemorySheet } from './ui/render/sheet';

declare global {
    interface Window {
        app: typeof app;
    }
}
window.app = app;

function boot(): void {
    mountShell();
    mountExplore();
    mountExhibit();
    mountAr();
    mountPassport();
    mountMemorySheet();

    initLocation();
    initAudio();
    initArControls();
    initImageAr();
    void loadMemories();
    void detectRoomAr();
    void initPlatform();
}

if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', boot);
else boot();

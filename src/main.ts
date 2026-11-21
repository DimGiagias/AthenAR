import './styles.css';

import { exhibitsData } from './data/exhibits';
import { initArControls } from './features/ar/controls';
import { initImageAr } from './features/ar/imageAr';
import { detectRoomAr } from './features/ar/room';
import { initAudio } from './features/audio';
import { checkForUpdate, initInstall } from './features/install';
import { initLocation, startPosition } from './features/location';
import { loadMemories } from './features/memories';
import { initPlatform } from './platform/native';
import { setState } from './state/store';
import { app } from './ui/actions';
import { mountAr } from './ui/render/ar';
import { mountExhibit } from './ui/render/exhibit';
import { mountExplore } from './ui/render/explore';
import { mountPassport } from './ui/render/passport';
import { mountRewardList } from './ui/render/rewardList';
import { mountRewardChooser } from './ui/render/rewardChooser';
import { mountRewardTicket } from './ui/render/rewardTicket';
import { mountShell } from './ui/render/shell';
import { mountInstallSheet } from './ui/render/installSheet';
import { mountMemorySheet } from './ui/render/sheet';
import { setUi } from './ui/state';

declare global {
    interface Window {
        app: typeof app;
    }
}
window.app = app;

/**
 * A poster's QR code opens the site at ?ar=<exhibit id>: straight into the
 * Live AR scanner, on that exhibit. The parameter is removed so a reload or a
 * bookmark opens the app normally.
 */
function openFromLink(): void {
    const params = new URLSearchParams(location.search);
    const raw = params.get('ar');
    if (raw === null) return;
    params.delete('ar');
    const rest = params.toString();
    history.replaceState(null, '', `${location.pathname}${rest ? `?${rest}` : ''}${location.hash}`);
    const id = Number(raw);
    if (raw !== '' && Number.isInteger(id) && id >= 0 && id < exhibitsData.length) setState({ exhibitId: id, hotspotIndex: 0 });
    setUi({ welcome: false, screen: 'ar', arBack: 'explore' });
}

function boot(): void {
    mountShell();
    mountExplore();
    mountExhibit();
    mountAr();
    mountPassport();
    mountRewardList();
    mountRewardChooser();
    mountRewardTicket();
    mountMemorySheet();
    mountInstallSheet();

    initLocation();
    startPosition();
    initAudio();
    initArControls();
    initImageAr();
    void loadMemories();
    void detectRoomAr();
    void initPlatform();
    initInstall();
    void checkForUpdate();
    openFromLink();
}

if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', boot);
else boot();

import { formatDistance } from '../platform/geoMath';
import { getState, setState } from '../state/store';
import { t } from '../ui/i18n';
import { isOnSite } from './ar/verification';
import { currentAssessment } from './exhibits';
import { startGps, waitForFix } from './location';
import { showToast } from './toast';

const FIX_TIMEOUT_MS = 12000;

export async function collectStamp(): Promise<void> {
    const exhibitId = getState().exhibitId;
    if (getState().stamps[exhibitId] !== undefined) return;

    if (getState().gps !== 'active') {
        showToast(t('toastStampLocating'));
        startGps();
        const gotFix = await waitForFix(FIX_TIMEOUT_MS);
        if (!gotFix) {
            showToast(t('toastStampNoGps'));
            return;
        }
        // The visitor may have moved on to another exhibit while we waited.
        if (getState().exhibitId !== exhibitId) return;
    }

    const lock = currentAssessment();
    if (!isOnSite(lock)) {
        showToast(
            lock.distance === null
                ? t('toastStampNoGps')
                : t('toastStampTooFar', { dist: formatDistance(lock.distance), radius: lock.radius }),
        );
        return;
    }

    setState({ stamps: { ...getState().stamps, [exhibitId]: Date.now() } });
    showToast(t('toastStampAdded'));
}

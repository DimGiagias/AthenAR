// Device location. Wraps navigator.geolocation, which also works inside the
// Capacitor WebView once the Android manifest declares the location
// permissions.

export interface Fix {
    lat: number;
    lng: number;
    /** Reported accuracy radius in metres. */
    accuracy: number;
}

export type GeoFailure = 'unsupported' | 'denied' | 'unavailable';

export interface GeoCallbacks {
    onFix: (fix: Fix) => void;
    onFail: (reason: GeoFailure) => void;
}

let watchId: number | null = null;

export function isGeoSupported(): boolean {
    return typeof navigator !== 'undefined' && 'geolocation' in navigator;
}

/** Start continuous tracking. Calling it again replaces the previous watch. */
export function startWatching(cb: GeoCallbacks): void {
    if (!isGeoSupported()) {
        cb.onFail('unsupported');
        return;
    }
    stopWatching();
    watchId = navigator.geolocation.watchPosition(
        (pos) => {
            cb.onFix({
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
                accuracy: Math.round(pos.coords.accuracy || 0),
            });
        },
        (err) => {
            // A timeout while a watch is running is not fatal: the watch keeps
            // trying. Only report it if we never had a fix (the caller decides).
            cb.onFail(err.code === err.PERMISSION_DENIED ? 'denied' : 'unavailable');
        },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );
}

export function stopWatching(): void {
    if (watchId !== null && isGeoSupported()) {
        navigator.geolocation.clearWatch(watchId);
    }
    watchId = null;
}

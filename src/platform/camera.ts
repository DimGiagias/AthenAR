// Rear camera stream for the AR view. Works in browsers over HTTPS and in the
// Capacitor WebView once the Android manifest declares the CAMERA permission.

let stream: MediaStream | null = null;

/** Open the rear camera. Resolves null if unavailable or permission is refused. */
export async function startCamera(): Promise<MediaStream | null> {
    stopCamera();
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) return null;
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
            audio: false,
        });
        return stream;
    } catch {
        stream = null;
        return null;
    }
}

export function stopCamera(): void {
    stream?.getTracks().forEach((track) => track.stop());
    stream = null;
}

export function getCameraStream(): MediaStream | null {
    return stream;
}

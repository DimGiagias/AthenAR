// Images that switch on image-anchored AR: point the camera at one of them
// (a poster, a printed sign, a photo on a screen) and the exhibit's 3D model
// appears on it, with its numbered story pins. Live AR shows no model until
// it finds one of these (or locks on the real building by GPS + compass).
//
// The tracker does not read these images directly. It reads one compiled file,
// AR_TARGETS_FILE, made from this list IN THIS ORDER with the page
// tools/ar-targets.html (see README, "Image AR"). After changing the list or an
// image, compile again.

export interface ImageTarget {
    /** Exhibit shown when this image is found. */
    exhibitId: number;
    /**
     * What the image is for:
     *  - 'sign': at the exhibit itself; the model stands on it.
     *  - 'poster': at our stand, a museum or a tour; the model stands on it and
     *    the visitor can then place it full size in their space (room AR, where
     *    the phone can). Posters carry a QR code that opens the site at ?ar=<exhibitId>.
     */
    kind: 'sign' | 'poster';
    /** The image, under public/. Also what you print or show on a screen. */
    image: string;
    /**
     * How the model stands on the image:
     *  - 'upright': the image hangs on a wall, stand or screen; the building
     *    stands up in front of it.
     *  - 'flat': the image lies on a table; the building rises out of it.
     */
    placement: 'upright' | 'flat';
    /** Width of the model as a share of the image's width (1 = as wide as the image). */
    modelWidth: number;
}

export const AR_TARGETS_FILE = 'ar/targets.mind';

export const IMAGE_TARGETS: ImageTarget[] = [
    // TEMPORARY: a test poster made from the app's own drawing, until the team
    // picks the real image for the Serafeio demo.
    { exhibitId: 0, kind: 'poster', image: 'ar/serafeio-test-poster.jpg', placement: 'upright', modelWidth: 0.9 },
];

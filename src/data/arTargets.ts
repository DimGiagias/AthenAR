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
    /**
     * The part of the image the tracker looks for, as shares of the image's
     * width and height. Leave it out to track the whole image.
     */
    area?: ImageArea;
    /** Width of the model as a share of the tracked area's width (1 = as wide as the area). */
    modelWidth: number;
}

export interface ImageArea {
    x: number;
    y: number;
    width: number;
    height: number;
}

export const AR_TARGETS_FILE = 'ar/targets.mind';

/**
 * The photo panel of the A3 posters (layout px 56, 160, 1011 × 748 of 1123 × 1587).
 * All posters share the rest of their layout (header, era dial, QR card), and
 * the tracker takes the first target that matches, so a whole-poster target
 * finds the same poster for every one. The photos tell them apart.
 */
const POSTER_PHOTO: ImageArea = { x: 56 / 1123, y: 160 / 1587, width: 1011 / 1123, height: 748 / 1587 };

const poster = (exhibitId: number, image: string): ImageTarget => ({
    exhibitId,
    kind: 'poster',
    image,
    placement: 'upright',
    area: POSTER_PHOTO,
    modelWidth: 1,
});

// The A3 posters (print files in posters/). Their QR codes open ?ar=<exhibitId>.
export const IMAGE_TARGETS: ImageTarget[] = [
    poster(0, 'ar/poster-serafeio.jpg'),
    poster(1, 'ar/poster-gazi.jpg'),
    poster(2, 'ar/poster-kypseli.jpg'),
    poster(3, 'ar/poster-blue-building.jpg'),
    poster(4, 'ar/poster-varvakeios.jpg'),
    poster(5, 'ar/poster-city-hall.jpg'),
    poster(6, 'ar/poster-hephaestus.jpg'),
    poster(7, 'ar/poster-tower-of-winds.jpg'),
    poster(8, 'ar/poster-kapnikarea.jpg'),
    poster(9, 'ar/poster-agioi-asomatoi.jpg'),
    poster(10, 'ar/poster-acropolis.jpg'),
];

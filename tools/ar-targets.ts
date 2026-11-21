// Dev tool: compile the images in src/data/arTargets.ts into the file the
// image tracker reads (public/ar/targets.mind).
import { IMAGE_TARGETS, type ImageArea } from '../src/data/arTargets';
import { getExhibit } from '../src/features/exhibits';
import { Compiler } from '../src/vendor/mindar/mindar-image.prod.js';

const list = document.getElementById('list') as HTMLOListElement;
const button = document.getElementById('compile') as HTMLButtonElement;
const progress = document.getElementById('progress') as HTMLProgressElement;
const status = document.getElementById('status') as HTMLParagraphElement;

const MAX_SIDE = 1200;
const MIN_SIDE = 480;

function load(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Cannot load ${src}`));
        img.src = src;
    });
}

/** The tracked area of the image (the whole image if none), as a new image. */
async function crop(img: HTMLImageElement, area: ImageArea | undefined): Promise<HTMLImageElement> {
    if (!area) return img;
    const sx = area.x * img.naturalWidth;
    const sy = area.y * img.naturalHeight;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(area.width * img.naturalWidth);
    canvas.height = Math.round(area.height * img.naturalHeight);
    (canvas.getContext('2d') as CanvasRenderingContext2D).drawImage(img, sx, sy, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
    return load(canvas.toDataURL('image/png'));
}

const images = Promise.all(
    IMAGE_TARGETS.map(async (target, i) => {
        const src = `/${target.image}`;
        const li = document.createElement('li');
        const ex = getExhibit(target.exhibitId);
        li.innerHTML = `<img alt=""><div><b>${i + 1}. ${ex.num} ${ex.en.title}</b><br><code></code><br><span class="size"></span></div>`;
        (li.querySelector('img') as HTMLImageElement).src = src;
        (li.querySelector('code') as HTMLElement).textContent = `public/${target.image} · ${target.kind} · ${target.placement}`;
        list.append(li);
        const img = await crop(await load(src), target.area);
        const size = li.querySelector('.size') as HTMLElement;
        const side = Math.max(img.naturalWidth, img.naturalHeight);
        size.textContent = `${img.naturalWidth} × ${img.naturalHeight} px${target.area ? ' (tracked area)' : ''}`;
        if (side > MAX_SIDE || Math.min(img.naturalWidth, img.naturalHeight) < MIN_SIDE) {
            size.className = 'bad';
            size.textContent += ` — best between ${MIN_SIDE} and ${MAX_SIDE} px per side`;
        }
        return img;
    }),
);

button.addEventListener('click', async () => {
    button.disabled = true;
    progress.hidden = false;
    status.textContent = 'Compiling… (about 10–30 seconds per image)';
    try {
        const compiler = new Compiler();
        await compiler.compileImageTargets(await images, (percent) => {
            progress.value = percent;
        });
        const data = compiler.exportData();
        const url = URL.createObjectURL(new Blob([data as BlobPart], { type: 'application/octet-stream' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = 'targets.mind';
        a.click();
        status.textContent = `Done: targets.mind (${(data.byteLength / 1024).toFixed(0)} KB). Save it as public/ar/targets.mind.`;
    } catch (err) {
        status.textContent = `Failed: ${(err as Error).message}`;
    } finally {
        button.disabled = false;
    }
});

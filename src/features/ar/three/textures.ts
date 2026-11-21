// Procedural canvas textures for the 3D models.
import * as THREE from 'three';

const proceduralTexturesCache: Record<string, THREE.CanvasTexture> = {};

/** A 512×512 facade texture for a building style and era, drawn once and cached. */
export function createArchitecturalTexture(styleType: string, era: string): THREE.CanvasTexture {
    const cacheKey = `${styleType}_${era}`;
    if (proceduralTexturesCache[cacheKey]) return proceduralTexturesCache[cacheKey];

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    if (styleType === 'brick_gazi') {
        // Detailed 19th-Century Industrial Red Brick & Arched Factory Windows
        ctx.fillStyle = era === '1900' ? '#9A3412' : '#B45309';
        ctx.fillRect(0, 0, 512, 512);
        ctx.strokeStyle = 'rgba(254, 215, 170, 0.28)';
        ctx.lineWidth = 2;
        for (let y = 0; y < 512; y += 18) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke();
            const offset = (y / 18) % 2 === 0 ? 0 : 18;
            for (let x = offset; x < 512; x += 36) {
                ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 18); ctx.stroke();
            }
        }
        // Arched cast-iron factory windows with glowing amber/sky panes
        for (let col = 0; col < 3; col++) {
            const wx = 55 + col * 155;
            const wy = 130;
            ctx.fillStyle = era === 'today' ? '#38BDF8' : '#F59E0B';
            ctx.beginPath();
            ctx.arc(wx + 45, wy + 45, 45, Math.PI, 0, false);
            ctx.lineTo(wx + 90, wy + 220);
            ctx.lineTo(wx, wy + 220);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#1E293B';
            ctx.lineWidth = 6;
            ctx.stroke();
            // Window mullions
            ctx.beginPath();
            ctx.moveTo(wx + 45, wy); ctx.lineTo(wx + 45, wy + 220);
            ctx.moveTo(wx, wy + 110); ctx.lineTo(wx + 90, wy + 110);
            ctx.stroke();
        }
    } else if (styleType === 'cobalt_modernist') {
        // Spyros Papaloukas Deep Cobalt Blue + Bauhaus Ribbon Windows & Shutters
        ctx.fillStyle = era === '1900' ? '#1D4ED8' : '#0284C7';
        ctx.fillRect(0, 0, 512, 512);
        for (let floor = 0; floor < 5; floor++) {
            const fy = 40 + floor * 92;
            // White modernist balcony band
            ctx.fillStyle = '#F8FAFC';
            ctx.fillRect(0, fy + 52, 512, 22);
            // Dark navy Bauhaus ribbon window strip
            ctx.fillStyle = '#0F172A';
            ctx.fillRect(24, fy, 464, 48);
            // Glowing cyan window panes
            ctx.fillStyle = '#7DD3FC';
            for (let p = 0; p < 6; p++) {
                ctx.fillRect(34 + p * 75, fy + 6, 62, 36);
            }
        }
    } else if (styleType === 'neoclassical_palace') {
        // Athenian Neoclassical Plaster, Marble Quoins & Shuttered Windows
        ctx.fillStyle = era === '1900' ? '#FEF3C7' : '#FFFFFF';
        ctx.fillRect(0, 0, 512, 512);
        ctx.fillStyle = '#0284C7';
        ctx.fillRect(0, 0, 512, 22);
        ctx.fillRect(0, 240, 512, 12);
        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 4; col++) {
                const wx = 36 + col * 118;
                const wy = 52 + row * 220;
                // Window pediment
                ctx.fillStyle = '#93C5FD';
                ctx.beginPath();
                ctx.moveTo(wx - 8, wy);
                ctx.lineTo(wx + 42, wy - 22);
                ctx.lineTo(wx + 92, wy);
                ctx.closePath();
                ctx.fill();
                // Window frame & panes
                ctx.fillStyle = '#0369A1';
                ctx.fillRect(wx, wy, 84, 135);
                ctx.fillStyle = '#E0F2FE';
                ctx.fillRect(wx + 7, wy + 7, 32, 58);
                ctx.fillRect(wx + 45, wy + 7, 32, 58);
                ctx.fillRect(wx + 7, wy + 70, 32, 58);
                ctx.fillRect(wx + 45, wy + 70, 32, 58);
            }
        }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    proceduralTexturesCache[cacheKey] = tex;
    return tex;
}

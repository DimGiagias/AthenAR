// Memories contributed by the user. Today they are saved on this device only.
// Everything goes through the MemoryStore interface so a shared backend
// (e.g. Firestore on the free plan) can replace LocalMemoryStore later
// without touching the rest of the app.
import type { Memory } from '../data/types';
import { loadJson, saveJson } from '../platform/storage';
import { getState, setState } from '../state/store';
import { t } from '../ui/i18n';
import { hotspotsFor, getExhibit } from './exhibits';
import { showToast } from './toast';

export interface MemoryStore {
    list(): Promise<Memory[]>;
    add(memory: Memory): Promise<void>;
    remove(id: string): Promise<void>;
}

const STORAGE_KEY = 'athenar.memories.v1';
export const MAX_AUTHOR_CHARS = 60;
export const MAX_STORY_CHARS = 600;

function isMemory(v: unknown): v is Memory {
    const m = v as Memory;
    return (
        typeof m === 'object' &&
        m !== null &&
        typeof m.id === 'string' &&
        /^[a-z0-9-]{1,40}$/i.test(m.id) && // ids end up inside inline handlers
        Number.isInteger(m.exhibitId) &&
        typeof m.exhibitId === 'number' &&
        typeof m.author === 'string' &&
        typeof m.decade === 'string' &&
        typeof m.text === 'string' &&
        typeof m.createdAt === 'number'
    );
}

export class LocalMemoryStore implements MemoryStore {
    private read(): Memory[] {
        const raw = loadJson<unknown>(STORAGE_KEY, []);
        return Array.isArray(raw) ? raw.filter(isMemory) : [];
    }
    async list(): Promise<Memory[]> {
        return this.read();
    }
    async add(memory: Memory): Promise<void> {
        saveJson(STORAGE_KEY, [...this.read(), memory]);
    }
    async remove(id: string): Promise<void> {
        saveJson(
            STORAGE_KEY,
            this.read().filter((m) => m.id !== id),
        );
    }
}

let store: MemoryStore = new LocalMemoryStore();

/** Swap the persistence backend (e.g. a synced store). */
export function setMemoryStore(next: MemoryStore): void {
    store = next;
}

export async function loadMemories(): Promise<void> {
    setState({ memories: await store.list() });
}

export interface MemoryDraft {
    exhibitId: number;
    author: string;
    decade: string;
    text: string;
}

/** The translated labels a memory gets when shown as an AR pin. */
export const memoryPinLabels = {
    type: (decade: string): string => t('memoryType', { decade }),
    title: (author: string): string => t('memoryTitle', { author }),
};

/** Save a memory and open it as the newest pin on its building. */
export async function submitMemory(draft: MemoryDraft): Promise<void> {
    const memory: Memory = {
        id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
        exhibitId: draft.exhibitId,
        author: (draft.author.trim() || t('memoryDefaultAuthor')).slice(0, MAX_AUTHOR_CHARS),
        decade: draft.decade,
        text: (draft.text.trim() || t('memoryDefaultStory')).slice(0, MAX_STORY_CHARS),
        createdAt: Date.now(),
    };
    await store.add(memory);

    const memories = [...getState().memories, memory];
    const s = getState();
    const pins = hotspotsFor(getExhibit(memory.exhibitId), s.lang, memories, memoryPinLabels);
    setState({
        memories,
        exhibitId: memory.exhibitId,
        hotspotIndex: Math.max(
            0,
            pins.findIndex((p) => p.memoryId === memory.id),
        ),
        tab: 'ar',
    });
    showToast(t('toastMemoryPinned'));
}

export async function deleteMemory(id: string): Promise<void> {
    await store.remove(id);
    setState({ memories: getState().memories.filter((m) => m.id !== id), hotspotIndex: 0 });
    showToast(t('toastMemoryDeleted'));
}

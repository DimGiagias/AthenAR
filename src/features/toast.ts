import { getState, setState } from '../state/store';

const TOAST_MS = 3200;
let timer: ReturnType<typeof setTimeout> | undefined;
let seq = 0;

export function showToast(text: string): void {
    seq += 1;
    const mine = seq;
    setState({ toast: { text, seq: mine } });
    clearTimeout(timer);
    timer = setTimeout(() => {
        if (getState().toast?.seq === mine) setState({ toast: null });
    }, TOAST_MS);
}

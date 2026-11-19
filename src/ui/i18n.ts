import { uiStrings } from '../data/strings';
import { getState } from '../state/store';

export type StringKey = keyof typeof uiStrings.el;

/**
 * The string for `key` in the current UI language, with `{name}`
 * placeholders filled from `params`.
 */
export function t(key: StringKey, params?: Record<string, string | number>): string {
    const dict = uiStrings[getState().lang] as Record<StringKey, string>;
    let text = dict[key] ?? uiStrings.el[key];
    if (params) {
        for (const [name, value] of Object.entries(params)) {
            text = text.replaceAll(`{${name}}`, String(value));
        }
    }
    return text;
}

// JSONP: loads `url` as a script that calls back with the data. The City of
// Athens open data API sends no CORS header, so the browser blocks fetch() from
// the app, but it wraps its answer in a callback when asked (CKAN's `callback`).

let seq = 0;

export function jsonp<T>(url: string, timeoutMs = 15000): Promise<T> {
    return new Promise((resolve, reject) => {
        const name = `athenarJsonp${++seq}`;
        const callbacks = window as unknown as Record<string, ((data: T) => void) | undefined>;
        const script = document.createElement('script');
        const done = (): void => {
            window.clearTimeout(timer);
            delete callbacks[name];
            script.remove();
        };
        const timer = window.setTimeout(() => {
            done();
            reject(new Error(`timed out: ${url}`));
        }, timeoutMs);
        callbacks[name] = (data) => {
            done();
            resolve(data);
        };
        script.onerror = () => {
            done();
            reject(new Error(`failed: ${url}`));
        };
        script.src = `${url}${url.includes('?') ? '&' : '?'}callback=${name}`;
        document.head.append(script);
    });
}

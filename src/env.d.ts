interface ImportMetaEnv {
    readonly VITE_LATEST_RELEASE_API?: string;
    readonly VITE_APP_VERSION?: string;
    readonly VITE_TARGET?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

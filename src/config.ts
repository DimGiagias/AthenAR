// Build-time settings. The GitHub workflows fill these in from the repository
// they run in, so no address is hard-coded; a local build simply has none.

/** GitHub API address of the latest release, used by the app's update check. */
export const LATEST_RELEASE_API: string = import.meta.env.VITE_LATEST_RELEASE_API ?? '';

/** Version of this build, e.g. "v0.1.0" ('' for local builds). */
export const APP_VERSION: string = import.meta.env.VITE_APP_VERSION ?? '';

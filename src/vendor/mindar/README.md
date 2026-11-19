# MindAR image tracking (vendored)

Prebuilt files from [MindAR](https://github.com/hiukim/mind-ar-js) **1.2.5** (`mind-ar` on npm, `dist/`), MIT licence (see `LICENSE`):

- `mindar-image.prod.js`: entry point, exports `Controller` (tracking) and `Compiler` (makes `.mind` target files)
- `controller-mGt1s8dJ.js`: the tracker, with TensorFlow.js bundled in
- `ui-fBadYuor.js`: helpers it imports (we don't use MindAR's own UI)

They are copied here instead of installed from npm because the npm package pulls in native build dependencies (`canvas`) that the browser build never uses and that break `npm install` on some machines.

The app loads this code only when image AR is switched on (`src/platform/imageTracker.ts`), so it adds nothing to start-up.

We use only the tracker, not MindAR's three.js add-on: the app feeds the tracked pose into its own 3D engine (`src/features/ar/three/engine.ts`). That keeps it independent of the three.js version.

Local changes: two lines in `controller-mGt1s8dJ.js` marked `AthenAR patch` replace `require("node-fetch")` and `require("util")` in TensorFlow's Node-only code, which never runs in a browser but stops the production build from resolving. Re-apply them after an update.

To update: `npm pack mind-ar@<version>`, copy the same three files from `package/dist/` (the hashed chunk names change between versions; fix the imports in `mindar-image.prod.js` accordingly), and update the typings in `mindar-image.prod.d.ts`.

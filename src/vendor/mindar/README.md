# MindAR image tracking (vendored)

Prebuilt files from [MindAR](https://github.com/hiukim/mind-ar-js) **1.2.5** (`mind-ar` on npm, `dist/`), MIT licence (see `LICENSE`):

- `mindar-image.prod.js`: entry point, exports `Controller` (tracking) and `Compiler` (makes `.mind` target files)
- `controller-mGt1s8dJ.js`: the tracker, with TensorFlow.js bundled in
- `ui-fBadYuor.js`: helpers it imports (we don't use MindAR's own UI)

They are copied here instead of installed from npm because the npm package pulls in native build dependencies (`canvas`) that the browser build never uses and that break `npm install` on some machines.

The app loads this code only when image AR is switched on (`src/platform/imageTracker.ts`), so it adds nothing to start-up.

We use only the tracker, not MindAR's three.js add-on: the app feeds the tracked pose into its own 3D engine (`src/features/ar/three/engine.ts`). That keeps it independent of the three.js version.

Local changes in `controller-mGt1s8dJ.js`, each marked `AthenAR patch`. Re-apply them after an update.

- Two lines replace `require("node-fetch")` and `require("util")` in TensorFlow's Node-only code, which never runs in a browser but stops the production build from resolving.
- The tracker's worker (the base64 string `IC`) picks the target with the most matched points. Upstream takes the first target that matches, and our posters share most of their layout, so an earlier poster could win. To re-apply: decode `IC`, and in its `case"match"` loop keep the match with the largest `screenCoords.length` instead of `break`ing on the first.

To update: `npm pack mind-ar@<version>`, copy the same three files from `package/dist/` (the hashed chunk names change between versions; fix the imports in `mindar-image.prod.js` accordingly), and update the typings in `mindar-image.prod.d.ts`.

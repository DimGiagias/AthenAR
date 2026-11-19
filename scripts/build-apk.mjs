// Build a test APK with Docker, no Android Studio needed:   npm run apk
//
// 1. builds the web app and copies it into the Android project (on this PC);
// 2. compiles the Android app inside a container with Java + the Android SDK;
// 3. leaves the result at ./athenar-debug.apk.
//
// The APK is a debug build: fine to install on your own phone for testing,
// not for handing out (see README, "Signing key").
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const IMAGE = 'athenar-android-build:36';
const run = (cmd) => execSync(cmd, { cwd: root, stdio: 'inherit' });

try {
    execSync('docker info', { stdio: 'ignore' });
} catch {
    console.error('Docker is not running. Start Docker Desktop and try again.');
    process.exit(1);
}

console.log('\n▶ 1/3  Building the web app');
run('npm run build');
run('npx cap sync android');

console.log('\n▶ 2/3  Preparing the Android build image (slow the first time only)');
run(`docker build -t ${IMAGE} -f scripts/android-build.Dockerfile scripts`);

console.log('\n▶ 3/3  Compiling the APK');
// Gradle downloads are kept in a named volume so later builds are fast.
// `tr -d '\r'` guards against gradlew having been checked out with CRLF.
run(
    `docker run --rm -v "${root}:/project" -v athenar-gradle-cache:/root/.gradle ${IMAGE} ` +
        `bash -c "tr -d '\\r' < gradlew > /tmp/gradlew && cp /tmp/gradlew ./gradlew && bash ./gradlew assembleDebug --no-daemon"`,
);

const built = path.join(root, 'android/app/build/outputs/apk/debug/app-debug.apk');
const out = path.join(root, 'athenar-debug.apk');
fs.copyFileSync(built, out);
console.log(`\n✅ APK ready: ${out}  (${(fs.statSync(out).size / 1048576).toFixed(1)} MB)`);

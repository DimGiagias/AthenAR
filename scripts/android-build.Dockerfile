# Build environment for the Android APK: Java 21 + Android SDK, nothing else.
# Used by `npm run apk` (scripts/build-apk.mjs), so a test APK can be built
# without Android Studio installed.
FROM eclipse-temurin:21-jdk-jammy

ENV ANDROID_HOME=/opt/android-sdk \
    ANDROID_SDK_ROOT=/opt/android-sdk
ENV PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools

RUN apt-get update \
 && apt-get install -y --no-install-recommends unzip curl \
 && rm -rf /var/lib/apt/lists/*

# Android command-line tools (sdkmanager)
RUN mkdir -p $ANDROID_HOME/cmdline-tools \
 && curl -fsSL -o /tmp/tools.zip https://dl.google.com/android/repository/commandlinetools-linux-13114758_latest.zip \
 && unzip -q /tmp/tools.zip -d $ANDROID_HOME/cmdline-tools \
 && mv $ANDROID_HOME/cmdline-tools/cmdline-tools $ANDROID_HOME/cmdline-tools/latest \
 && rm /tmp/tools.zip

# SDK parts matching android/variables.gradle (compileSdk 36)
RUN yes | sdkmanager --licenses > /dev/null \
 && sdkmanager --install "platform-tools" "platforms;android-36" "build-tools;36.0.0" > /dev/null

WORKDIR /project/android

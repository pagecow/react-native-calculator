# Project memory

Durable lessons recorded by coding agents working in this project. The engine reads this file at the start of every session and shows it to the next agent — append anything the next session should know.


## 2026-10-26 11:12:02

## iOS / CocoaPods setup on this machine (React Native projects)

**Symptom:** `npx @react-native-community/cli init` ends with "Installing Cocoapods failed" / "ffi-1.13.1 extensions are not built".

**Root cause (two layers):**
1. `bundle install` (the RN CLI's "Installing Ruby Gems" step) runs on the **system Ruby 2.6.10 + Bundler 1.17.2**, where `ffi 1.13.1` has broken native extensions. The CLI's `runBundleInstall` **throws hard** — it does not fall back to system `pod`.
2. The pre-existing `pod` was **CocoaPods 1.11.3**, too old for RN 0.88 — its Podfile fails with `Invalid Podfile: undefined method 'visionos'`.

**What works (do this, not the Intel Homebrew):**
- `/usr/local` (Intel/x86_64 Homebrew) has **no bottles for this macOS** — `brew install cocoapods` there tries to build glib/cairo/rust/llvm from source and dies at pkgconf ("C compiler cannot create executables"). Dead end, don't retry.
- `/opt/homebrew` (arm64-native Homebrew, v7) **has bottles**. `HOMEBREW_NO_AUTO_UPDATE=1 /opt/homebrew/bin/brew install cocoapods` installs CocoaPods 1.17.0 + Ruby 4.0.9 in a couple of minutes.
- The user's `~/.zshrc` already prepends `/opt/homebrew/bin`, so in a real Terminal `pod` → 1.17.0 and `bundle` → Bundler 4.0.23 (Ruby 4.0.9). **No PATH edits were needed.**
- Note: `/usr/local/bin/pod` (the old 1.11.3 RubyGems wrapper) still shadows `pod` in non-interactive shells that don't source `.zshrc`. Use absolute paths in `run_command`.
- `bundle install` resolved **cocoapods 1.15.2** (the Gemfile excludes 1.15.0/1.15.1) into `vendor/bundle`, producing `Gemfile.lock` with `ruby 4.0.9`.
- `cd ios && bundle exec pod install` → 87 pods, workspace generated.
- `xcodebuild` with a real simulator UDID → `** BUILD SUCCEEDED **`.

**Gotchas hit along the way:**
- `xcodebuild ... -destination 'platform=iOS Simulator,name=iPhone 16'` fails ("Unable to find a destination"); there is no plain "iPhone 16" — use a UDID (`xcrun simctl list devices available`). iPhone 17 Pro = `0765DD2A-80E1-4921-9542-B797CA33B50C`.
- Piping `xcodebuild` to `tail` masks its exit code — use `set -o pipefail` or capture to a log.
- Created `ios/.xcode.env.local` pinning `NODE_BINARY` to the nvm node (gitignored by `**/.xcode.env.local`), since Xcode script phases don't inherit the nvm PATH.
- Added `/tmp/` to `.gitignore` for the scratchpad.

## 2026-10-27 13:16:32

## Black screen on the iOS simulator (RN 0.88) — port 8081 is squatted

**Symptom:** `npm run ios` builds, installs, then the app opens to a black screen.

**Root cause:** port 8081 is held by an **Expo dev server from a different project**
(`~/Documents/ExpoApps/way-chat`, `expo start --dev-client --port 8081`). RN's CLI sees the
port busy, starts Metro on **8082**, but the compiled app still asks `http://localhost:8081`
for `index.bundle` → the Expo server answers **404** → no JS → black screen.

**Diagnose in one shot:**
```
lsof -nP -iTCP:8081 -sTCP:LISTEN          # who owns 8081 (compare its cwd!)
curl -s -o /dev/null -w '%{http_code}\n' 'http://localhost:8081/index.bundle?platform=ios&dev=true'
lsof -nP -iTCP:8082 | grep -c ESTABLISHED # app is really talking to 8082 if > 0
```

**Fix without killing the other project:** point the installed app at the live Metro port.
`RCTBundleURLProvider` reads NSUserDefaults key **`RCT_jsLocation`** (`host:port`), which is the
same knob as Dev Menu → Dev Settings → Change Bundle Location. It is lost on reinstall.
```
xcrun simctl spawn <UDID> defaults write org.reactjs.native.example.ReactNativeCalculator \
  RCT_jsLocation -string "localhost:8082"
xcrun simctl launch <UDID> org.reactjs.native.example.ReactNativeCalculator
```
Cleaner long-term: stop the way-chat Expo server so 8081 is free, and RN uses it automatically.

**Also hit:** `simctl launch` failed with `NSPOSIXErrorDomain code=3 / No such process`, and
`simctl terminate`/`spawn` hung — the simulator's launchd was wedged. Fixed with
`xcrun simctl shutdown <UDID> && xcrun simctl boot <UDID>`. Nothing was wrong with the build.

**Verifying a simulator screen without eyes on it:** `xcrun simctl io <UDID> screenshot x.png`,
then OCR it with a tiny Swift + Vision script (`VNRecognizeTextRequest`). Reading the actual
on-screen text is far better evidence than a PNG byte count.

Note: `App.tsx` in this project is a real calculator (black `#000000` background by design),
with `src/CalculatorButton.tsx` and `src/calculator.ts`.

Simulator used: iPhone 17 Pro **485766BB-82A9-439A-B1DA-F0DA9E402D94** (iOS 26.3.1).

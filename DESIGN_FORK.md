# T3 Code Design Fork

A personal fork of [T3 Code](https://github.com/pingdotgg/t3code) for exploring a
redesign of the iOS app. It installs alongside official T3 Code as **T3 Code
Design**.

The point of this fork is fast, safe design iteration:

- Work on real screens with real data, not static mockups.
- Keep upstream code recognisable so changes stay easy to diff, review, and
  rebase.
- Ship each iteration to your own phone through TestFlight.

## What is different from upstream

Only build identity and build shape:

| Setting | Upstream | This fork |
| --- | --- | --- |
| App name | T3 Code | T3 Code Design |
| Bundle ID | `com.t3tools.t3code` | `com.russellsystems.t3design` |
| Apple team | T3 Tools | Russell Systems Limited |
| URL scheme | `t3code` | `t3design` |
| OTA updates | Expo project `pingdotgg/t3-code` | disabled (bundle is embedded) |
| Widgets / share extension / push / Apple sign-in | enabled | omitted for faster builds |

Screens, components, state, and networking are upstream code. Design work goes
in `apps/mobile/src`, mostly under `src/features` and `src/components`.

## Local setup

```bash
cp .env.design.example .env
pnpm install
```

`.env` is gitignored. It carries the fork's build identity and must exist on any
machine that builds this fork.

To sanity-check the resolved app config:

```bash
cd apps/mobile
pnpm config:prod
```

You should see `name: "T3 Code Design"`, the fork bundle ID, and
`updates.enabled: false`.

## Run on the simulator

```bash
cd apps/mobile
pnpm ios:prod
```

First run does an Expo prebuild and CocoaPods install. It takes a while on the
2012 Mac mini.

## Build and upload to TestFlight

Build a signed archive with Xcode's automatic signing, export an App Store IPA,
then upload with an app-specific password:

```bash
cd apps/mobile
APP_VARIANT=production EXPO_NO_GIT_STATUS=1 pnpm exec expo prebuild --clean --platform ios

xcodebuild \
  -workspace ios/T3Code.xcworkspace \
  -scheme T3Code \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  -archivePath "$PWD/build/T3CodeDesign.xcarchive" \
  -allowProvisioningUpdates \
  -authenticationKeyPath "$HOME/private_keys/AuthKey_66WZZP9YM6.p8" \
  -authenticationKeyID 66WZZP9YM6 \
  -authenticationKeyIssuerID 684ca00b-6308-4d13-abe8-d67b36f218d9 \
  archive
```

Export and upload:

```bash
xcodebuild -exportArchive \
  -archivePath "$PWD/build/T3CodeDesign.xcarchive" \
  -exportPath "$PWD/build/export" \
  -exportOptionsPlist scripts/testflight-export-options.plist \
  -allowProvisioningUpdates \
  -authenticationKeyPath "$HOME/private_keys/AuthKey_66WZZP9YM6.p8" \
  -authenticationKeyID 66WZZP9YM6 \
  -authenticationKeyIssuerID 684ca00b-6308-4d13-abe8-d67b36f218d9

xcrun altool --upload-app \
  -f "$PWD/build/export/T3CodeDesign.ipa" \
  -t ios \
  -u 8041lobo@gmail.com \
  -p "$(cat "$HOME/.secrets/asc-app-password")"
```

App Store Connect record: `T3 Code Design` (`com.russellsystems.t3design`).

## Design iteration loop

1. Change one screen or interaction.
2. Run it on the simulator or a device build.
3. Capture a before/after screenshot or short recording.
4. Commit with a note on the problem and the decision, not just the pixels.
5. Upload a TestFlight build when the change is worth holding in your hand.

Keep commits small and scoped. When a change is worth showing to the T3 team,
it should be readable as a design argument: the old behaviour, the new
behaviour, and why.

## Working with upstream

Add the upstream remote once:

```bash
git remote add upstream https://github.com/pingdotgg/t3code.git
git fetch upstream
git rebase upstream/main
```

Fork-specific changes live in `apps/mobile/app.config.ts` and the env example.
Everything else should stay rebase-friendly.

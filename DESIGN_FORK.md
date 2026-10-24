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

One command builds a signed archive, exports an App Store IPA, and uploads it:

```bash
cd apps/mobile
scripts/build-testflight.sh
```

Use `--clean` after changing native dependencies or config plugins, and
`--no-upload` to stop after the IPA is built.

The script reads its signing identity from the repo-root `.env`. It uses an
App Store Connect API key for Xcode's automatic signing and an app-specific
password for `altool` upload. Neither secret belongs in git.

App Store Connect record: `T3 Code Design` (`com.russellsystems.t3design`,
app ID `6826558609`, SKU `t3code-design`).

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

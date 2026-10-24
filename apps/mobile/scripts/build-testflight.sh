#!/usr/bin/env bash
# Build the design fork for TestFlight and upload it.
#
# Usage:
#   scripts/build-testflight.sh [--clean] [--no-upload]
#
# Reads build identity and credentials from the repo-root .env. See
# DESIGN_FORK.md. Everything stays local; no EAS project is used.

set -euo pipefail

cd "$(dirname "$0")/.."
REPO_ROOT="$(cd ../.. && pwd)"

if [[ ! -f "$REPO_ROOT/.env" ]]; then
  echo "Missing $REPO_ROOT/.env. Copy .env.design.example to .env first." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1091
source "$REPO_ROOT/.env"
set +a

CLEAN=0
UPLOAD=1
for arg in "$@"; do
  case "$arg" in
    --clean) CLEAN=1 ;;
    --no-upload) UPLOAD=0 ;;
    *) echo "Unknown argument: $arg" >&2; exit 1 ;;
  esac
done

BUILD_NUMBER="${BUILD_NUMBER:-$(date +%Y%m%d%H%M)}"
ARCHIVE_PATH="$PWD/build/T3CodeDesign.xcarchive"
EXPORT_PATH="$PWD/build/export"

if [[ $CLEAN -eq 1 || ! -d ios/T3CodeDesign.xcworkspace ]]; then
  echo "==> Generating the iOS project"
  APP_VARIANT=production EXPO_NO_GIT_STATUS=1 \
    pnpm exec expo prebuild --clean --platform ios
fi

echo "==> Archiving build $BUILD_NUMBER"
rm -rf "$ARCHIVE_PATH" "$EXPORT_PATH"

# Expo writes CFBundleVersion as a literal, so the xcodebuild override alone
# does not change it. Patch the generated Info.plist so every upload gets a
# unique build number.
if [[ -f ios/T3CodeDesign/Info.plist ]]; then
  /usr/libexec/PlistBuddy -c "Set :CFBundleVersion $BUILD_NUMBER" ios/T3CodeDesign/Info.plist
fi

xcodebuild \
  -workspace ios/T3CodeDesign.xcworkspace \
  -scheme T3CodeDesign \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  -archivePath "$ARCHIVE_PATH" \
  -allowProvisioningUpdates \
  -authenticationKeyPath "$T3CODE_ASC_KEY_PATH" \
  -authenticationKeyID "$T3CODE_ASC_KEY_ID" \
  -authenticationKeyIssuerID "$T3CODE_ASC_ISSUER_ID" \
  CURRENT_PROJECT_VERSION="$BUILD_NUMBER" \
  archive

echo "==> Exporting App Store IPA"
xcodebuild -exportArchive \
  -archivePath "$ARCHIVE_PATH" \
  -exportPath "$EXPORT_PATH" \
  -exportOptionsPlist scripts/testflight-export-options.plist \
  -allowProvisioningUpdates \
  -authenticationKeyPath "$T3CODE_ASC_KEY_PATH" \
  -authenticationKeyID "$T3CODE_ASC_KEY_ID" \
  -authenticationKeyIssuerID "$T3CODE_ASC_ISSUER_ID"

IPA="$EXPORT_PATH/T3CodeDesign.ipa"
if [[ ! -f "$IPA" ]]; then
  echo "Expected IPA at $IPA" >&2
  exit 1
fi

echo "==> Built $IPA"

if [[ $UPLOAD -eq 0 ]]; then
  exit 0
fi

echo "==> Uploading to TestFlight"
xcrun altool --upload-app \
  -f "$IPA" \
  -t ios \
  -u "$T3CODE_ASC_USERNAME" \
  -p "$(cat "$T3CODE_ASC_APP_PASSWORD_FILE")"

echo "==> Uploaded build $BUILD_NUMBER. App Store Connect will email when processing finishes."

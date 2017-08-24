#!/bin/bash -e

project_root=$(dirname "${BASH_SOURCE[0]}")/..
cd project_root

lerna bootstrap

set -o pipefail && xcodebuild -project detox/ios/Detox.xcodeproj -scheme Detox -configuration Debug -sdk iphonesimulator build-for-testing | xcpretty
set -o pipefail && xcodebuild -project detox/ios/Detox.xcodeproj -scheme Detox -configuration Debug -sdk iphonesimulator test-without-building -destination 'platform=iOS Simulator,name=iPhone 7 Plus' | xcpretty

./scripts/check-format.sh
npm test
#npm run release
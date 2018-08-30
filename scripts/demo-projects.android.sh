#!/bin/bash -e

source $(dirname "$0")/demo-projects.sh

pushd examples/demo-react-native
run_f "detox build -c ios.sim.release"
run_f "detox test -c ios.sim.release"
run_f "detox test -c ios.sim.release --specs e2eExplicitRequire --runner-config e2eExplicitRequire/mocha.opts"
popd

pushd examples/demo-react-native-jest
run_f "detox build -c ios.sim.release"
run_f "detox test -c ios.sim.release"
popd

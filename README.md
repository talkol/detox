# detox

[![Build Status](https://travis-ci.org/wix/detox.svg?branch=master)](https://travis-ci.org/wix/detox)

Graybox E2E tests and automation library for mobile

### Why?

High velocity native mobile development requires us to adopt continuous integration workflows, which means our reliance on manual QA has to drop significantly. The most difficult part of automated testing on mobile is the tip of the testing pyramid - E2E. The core problem with E2E tests is flakiness - tests are usually not deterministic. We believe the only way to tackle flakiness head on is by moving from blackbox testing to graybox testing and that's where detox comes into play.

## Development still in progress!

Please note that this library is still pre version 1.0.0 and under active development. The NPM version is higher because the name "detox" was transferred to us from a previous inactive package.

<img src="http://i.imgur.com/O2ZzrKG.gif">

## Wanna see it in action??

Open the [React Native demo project](demo-react-native) and follow the instructions

Not using React Native? you now have a [pure native demo project](demo-native) too

## Wanna try it with your own project?

See the [Installing](INSTALLING.md) instructions

## Wanna learn the API for writing tests?

See Detox's own [E2E test suite](detox/test/e2e) to learn the test API by example

## Dealing with flakiness

See the [Flakiness](FLAKINESS.md) handbook

## Faster test runs with app reuse
By default the app is removed, reinstalled and launched before each run.
Starting fresh is critical in CI but in dev you might be able to save time between test runs and reuse the app that was previously installed in the simulator. To do so use the `detoxReuse` flag and run your tests like this:`mocha e2e --opts ./e2e/mocha.opts --detoxReuse`.
This is especially useful with React Native DEV mode when making Javascript code changes that are getting picked up by the packager (and thus no reinstall is needed). This can save up to 7 seconds per run!
You should not use this option if you made native code changes or if your app relies on local ("disk") storage.

## Some implementation details

* We let you write your e2e tests in JS (they can even be cross-platform)
* We use websockets to communicate (so it should be super fast and bi-directional)
* Both the app and the tester are clients, so we need the server to proxy between them
* We are relying on EarlGrey as our gray-box native library for iOS (espresso for Android later on)
* The JS tester controls EarlGrey by remote using a strange JSON protocol
* Instead of wrapping the zillion API calls EarlGrey supports, we implemented a reflection mechanism
* So the JS tester in low level actually invokes the native methods.. freaky
* We've abstracted this away in favor of a protractor-like api, see [`demo-react-native/e2e/example.spec.js`](demo-react-native/e2e/example.spec.js)
* See everything EarlGrey supports [here](https://github.com/google/EarlGrey/blob/master/docs/api.md) and in this [cheatsheet](https://github.com/google/EarlGrey/blob/master/docs/cheatsheet/cheatsheet.pdf)
* We use [fbsimctl](https://github.com/facebook/FBSimulatorControl) to control the simulator from the test, restart the app, etc

## License

* detox by itself and all original source code in this repo is MIT
* detox relies on some important dependencies, their respective licenses are:
  * [EarlGrey](https://github.com/google/EarlGrey/blob/master/LICENSE)
  * [FBSimulatorControl](https://github.com/facebook/FBSimulatorControl/blob/master/LICENSE)

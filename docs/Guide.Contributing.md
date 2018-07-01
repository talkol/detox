---
id: Guide.Contributing
title: Contributing
---

## Prerequisites

### Install `node` v8.3.0 or higher

```
brew install node
```

### Install global node libraries `lerna` and `react-native-cli`

```sh
npm install -g lerna
npm install -g react-native-cli
```

For all the internal projects (detox, detox-server, detox-cli, demos, test) `lerna` will create symbolic links in `node_modules` instead of `npm` copying the content of the projects. This way, any change you do on any code is there immediately. There is no need to update node modules or copy files between projects.

### Install `xcpretty`

```sh
gem install xcpretty
```

Alternatively, run `scripts/install.ios.sh` / `scripts/install.android.sh` to install all prerequisites.

## Detox

### Clone Detox and submodules

```sh
git clone git@github.com:wix/detox.git
cd detox
git submodule update --init --recursive
```
(this makes sure all git submodule dependencies are properly checked out)

### Installing and linking internal projects

```sh
lerna bootstrap
```

### Building & Testing
##### Automatically
`scripts/ci.ios.sh` and `scripts/ci.android.sh` are the scripts Detox runs in CI, they will run `lerna bootstrap`, unit tests, and E2E tests. Make sure these scripts pass before submitting a PR, this is exactly what Detox is going to run in CI. 

##### Manually
Alternativley, you can run it manually

#### 0. Fixing compilation issues in RN sources
Detox Android test project uses React Native sources instead of the precompiled AAR. The test project uses RN51 and RN53, both have issues with compilation ([Fixed in RN55](https://github.com/facebook/react-native/commit/d8bb990abc226e778e2f32c2de3c6661c0aa64e5#diff-f44163238d434a443b56bd27b3ba0578)). In order to fix this issue, from inside `detox/test` run:
```sh
mv node_modules/react-native/ReactAndroid/release.gradle node_modules/react-native/ReactAndroid/release.gradle.bak
``` 

#### 1. Unit tests

```sh
lerna run test
```

Detox JS code is 100% test covered and is set to break the build if coverage gets below, so make sure you run unit tests (`lerna run test`) locally before pushing.

Alternatively, to run only the JS tests, run the following from the `detox/detox` directory:

```sh
npm run unit
-or-
npm run unit:watch
```

##### How to read the coverage report
After running the tests, jest will create a coverage report.

```sh
cd detox
open coverage/lcov-report/index.html
```

#### 2. Running Detox e2e coverage tests
Detox has a suite of e2e tests to test its own API while developing (and for regression). The way we do is is by maintaining a special application that is "tested" against Detox's API, but essentially, it's the API that is tested, not the app.
To run the e2e tests, go to `detox/detox/test`

```sh
cd detox/test
npm run build
```

To run the e2e tests, after the application was built.

##### iOS
```sh
npm run build:ios
npm run e2e:ios
```

##### Android
```sh
npm run build:android
npm run e2e:android
```

Android test project includes two flavors: 
`fromBin` - uses the precompiled aar from `node_moudles` just like a standard RN project.
`fromSource` - compiles the project with RN sources from `node_modules`, this is useful when developing and debugging Espresso idle resource. 
[Here](https://facebook.github.io/react-native/docs/building-from-source.html#android) are the prerequisites to compiling React Native from source.

Each build can be triggered separately by running its assemble task:
`./gradlew assembleFromSourceDebug` or `./gradlew assembleFromBinDebug`.

To run from Android Studio, React native `react.gradle` script requires `node` to be in path.
on macOS environment variables can be exported to desktop applications by adding the following to your `.bashrc`/`.zshrc`:

```sh
launchctl setenv PATH $PATH
```


#### 3. Android Native tests

0. Install Java and Android SDK 25
1. In `detox/android` run `./gradlew install` run

	```sh
	./gradlew test
	```

#### 4. Code Generation

We are using a code generator based on `babel` and `objective-c-parser` to generate a Javascript Interface for `EarlGrey` (the testing library we use on iOS).
This interface allows us to call Objective-C methods through the WebSocket connection directly on the testing device. 

This approach is currently limited to `GREYActions`, but we plan on extending it to cover more functionality of `EarlGrey`.
You may see the generated files under [`detox/src/ios/earlgreyapi/`](../detox/src/ios/earlgreyapi).

What happens under the hood can be seen in [`generation/`](../generation); it boils down to these steps for each input file:

1. Convert Objective-C header file in a JSON Representation
2. Build an Abstract Syntax Tree: Create Class & for each method
    1. Check if the type can be expressed simpler (`NSString *` => `NSString`)
    2. Get the type checks for the arguments
    2. Get the return value
    4. Assemble type checks and return value to complete function
3. Generate the code for the syntax tree & add helpers

If you would like to extend the code generation, please make sure to read the [`generation/README.md`](../generation#generation)

---
id: version-6.X-APIRef.DetoxObjectAPI
title: The `detox` Object
original_id: APIRef.DetoxObjectAPI
---

`detox` is globally available in every test file, though currently it is only used in the setup/init file.

> NOTE: detox is test runner independent, and we encourge you to choose your own test runner, but for the sake of demonstration we will use `mocha`'s syntax.

### Methods

* [`detox.init()`](#detox.init)
* [`detox.cleanup()`](#detox.cleanup)

### `detox.init()`

The setup phase happens inside `detox.init()`. This is the phase where detox reads its configuration, starts a server, loads its expection library and starts a simulator.

##### (if you're using mocha) In your `init.js` add:

```js
const config = require("../package.json").detox;

before(async () => {
  await detox.init(config);
});
```

#### controlling first app intialization

By default `await detox.init(config);` will launch the installed app. If you wish to control when your app is launched, add `{launchApp: false}` param to your init.

```js
const config = require("../package.json").detox;

before(async () => {
  await detox.init(config, { launchApp: false });
});
```

> NOTE: Detox 6.X.X will introduce a **breaking change** , setting `launchApp` to `false` by default. In order to prevent any breaking changes to your tests when you upgrade (and if you still would like `init` to launch the app for you) do the following:

```js
before(async () => {
  await detox.init(config, { launchApp: true });
});
```

### `detox.cleanup()`

The cleanup phase should happen after all the tests have finished. This is the phase where detox-server shuts down. The simulator will also shut itself down if `--cleanup` flag is added to `detox test`

##### (if you're using mocha) In your `init.js` add:

```js
after(async () => {
  await detox.cleanup();
});
```

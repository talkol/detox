# The `device` Object

`device` is globally available in every test file, it enables control over the current attached device (currently only simulators are supported).

### Public Properties

* [`device.id`](#deviceid)
* [`device.name`](#devicename)

### Methods

- [`device.launchApp()`](#devicelaunchappparams)
- [`device.terminateApp()`](#deviceterminateapp)
- [`device.sendToHome()`](#devicesendtohome)
- [`device.reloadReactNative()`](#devicereloadreactnative)
- [`device.installApp()`](#deviceinstallapp)
- [`device.uninstallApp()`](#deviceuninstallapp)
- [`device.openURL(url)`](#deviceopenurlurl-sourceappoptional)
- [`device.sendUserNotification(params)`](#devicesendusernotificationparams)
- [`device.sendUserActivity(params)`](#devicesenduseractivityparams)
- [`device.setOrientation(orientation)`](#devicesetorientationorientation)
- [`device.setLocation(lat, lon)`](#devicesetlocationlat-lon)
- [`device.setURLBlacklist([urls])`](#deviceseturlblacklisturls)
- [`device.enableSynchronization()`](#deviceenablesynchronization)
- [`device.disableSynchronization()`](#devicedisablesynchronization)
- [`device.resetContentAndSettings()` **iOS Only**](#deviceresetcontentandsettings-ios-only)
- [`device.getPlatform()`](#devicegetplatform)
- [`device.takeScreenshot(name)`](#devicetakescreenshotname)
- [`device.shake()` **iOS Only**](#deviceshake-ios-only)
- [`device.setBiometricEnrollment(bool)` **iOS Only**](#devicesetbiometricenrollmentbool-ios-only)
- [`device.matchFace()` **iOS Only**](#devicematchface-ios-only)
- [`device.unmatchFace()` **iOS Only**](#deviceunmatchface-ios-only)
- [`device.matchFinger()` **iOS Only**](#devicematchfinger-ios-only)
- [`device.unmatchFinger()` **iOS Only**](#deviceunmatchfinger-ios-only)
- [`device.clearKeychain()` **iOS Only**](#deviceclearkeychain-ios-only)
- [`device.setStatusBar()` **iOS Only**](#devicesetstatusbar-ios-only)
- [`device.resetStatusBar()` **iOS Only**](#deviceresetstatusbar-ios-only)
- [`device.reverseTcpPort()` **Android Only**](#devicereversetcpport-android-only)
- [`device.unreverseTcpPort()` **Android Only**](#deviceunreversetcpport-android-only)
- [`device.pressBack()` **Android Only**](#devicepressback-android-only)
- [`device.getUIDevice()` **Android Only**](#devicegetuidevice-android-only)

### `device.id`

Holds the environment-unique ID of the device - namely, the `adb` ID on Android (e.g. `emulator-5554`) and the Mac-global simulator UDID on iOS, as used by `simctl` (e.g. `AAAAAAAA-BBBB-CCCC-DDDD-EEEEEEEEEEEE`).

The value will be `undefined` until the device is properly _prepared_ (i.e. in `detox.init()`).

### `device.name`

Holds a descriptive name of the device. Example: `emulator-5554 (Pixel_API_26)`

The value will be `undefined` until the device is properly _prepared_ (i.e. in `detox.init()`).

### `device.launchApp(params)`

Launch the app defined in the current [`configuration`](APIRef.Configuration.md).

**Options:** 

##### 1. Restart the app
Terminate the app and launch it again. 
If set to `false`, the simulator will try to bring app from background, if the app isn't running, it will launch a new instance. default is `false`

```js
await device.launchApp({newInstance: true});
```

##### 2. Set runtime permissions
Grant or deny runtime permissions for your application. 

```js
await device.launchApp({permissions: {calendar: 'YES'}});
```
Detox uses [AppleSimUtils](https://github.com/wix/AppleSimulatorUtils) on iOS to support this functionality. Read about the different types of permissions and how to set them in AppleSimUtils' Readme.
Check out Detox's [own test suite](../detox/test/e2e/13.permissions.test.js)

##### 3. Launch from URL
Mock opening the app from URL to test your app's deep link handling mechanism.

```js
await device.launchApp({url: url});
```
###### Mock opening from a URL when app is not running
```js
await device.launchApp({url: url, newInstance: true});
```
This will launch a new instance of the app and handle the deep link.

######  Mock opening from a URL when app is in background

```js
await device.launchApp({url: url, newInstance: false});
```
This will launch the app from background and handle the deep link.

Read more in [Mocking Open From URL](APIRef.MockingOpenFromURL.md) section.

##### 4. Launch with user notifications

> Currently only supported on iOS!

```js
await device.launchApp({userNotification: notification});
```

###### Mock receiving a notifications when app is not running
```js
await device.launchApp({userNotification: notification, newInstance: true});
```
This will launch a new instance of the app and handle the notification.

######  Mock receiving a notifications when app is in background

```js
await device.launchApp({userNotification: notification, newInstance: false});
```
This will launch the app from background and handle the notification.

Read more in [Mocking User Notifications](APIRef.MockingUserNotifications.md) section.

##### 5. Launch with user activity

> Currently only supported on iOS!

```js
await device.launchApp({userActivity: activity});
```

###### Mock receiving an activity when app is not running
```js
await device.launchApp({userActivity: activity, newInstance: true});
```
This will launch a new instance of the app and handle the activity.

######  Mock receiving an activity when app is in background

```js
await device.launchApp({userActivity: activity, newInstance: false});
```
This will launch the app from background and handle the activity.

Read more in [Mocking User Activity](APIRef.MockingUserActivity.md) section.

##### 6. Launch into a fresh installation 
A flag that enables relaunching into a fresh installation of the app (it will uninstall and install the binary again), default is `false`.

```js
await device.launchApp({delete: true});
```

##### 7. Additional launch arguments
Detox can start the app with additional launch arguments

```js
await device.launchApp({launchArgs: {arg1: 1, arg2: "2"}});
```

* **On iOS**, the added `launchArgs` will be passed through the launch command to the device and be accessible via `[[NSProcessInfo processInfo] arguments]`
* **On Android**, the `launchArgs` will be set as a bundle-extra into the activity's intent. It will therefore be accessible on the native side via the current activity as: `currentActivity.getIntent().getBundleExtra("launchArgs")`.

Note that there are numerous ways to forward the arguments onto the javascript side of the app, but that is essentially out of Detox' scope. Nevertheless here are some references:

* Supported out of the box if you're using [React Native Navigation](https://github.com/wix/react-native-navigation/blob/2.18.5/docs/api/Navigation.md#getlaunchargs).
* On Android, you can use `ReactNativeDelegate.getLaunchOptions()` , as described [here](https://dev.to/ryohlan/how-to-pass-initial-props-from-android-native-2k2).
* For iOS, you may find this [this post](https://stackoverflow.com/a/31229533/453052) on stack overflow useful.

##### 8. Disable touch indicators (iOS only)
Disable touch indicators on iOS.

```js
await device.launchApp({disableTouchIndicators: true});
```

##### 9. Launch with a specific language (iOS only)
Launch the app with a specific system language

Information about accepted values can be found [here](https://developer.apple.com/library/archive/documentation/MacOSX/Conceptual/BPInternational/LanguageandLocaleIDs/LanguageandLocaleIDs.html).

```js
await device.launchApp({
  languageAndLocale: {
    language: "es-MX",
    locale: "es-MX"
  }
});
```

With this API, you can run sets of e2e tests per language. For example:
```js
['es-MX', 'fr-FR', 'pt-BR'].forEach(locale => {
  describe(`Test suite in ${locale}`, () => {

    beforeAll(async () => {
      await device.launchApp({
        newInstance: true,
        languageAndLocale: {
          language: locale,
          locale
        }
      });
    });


    it('Test A', () => {
      
    })

    it('Test B', () => {
      
    })

  });
});
```

##### 10. Initialize the URL blacklist at device launch
Launch the app with an URL blacklist to disable network synchronization on certain endpoints. Useful if the app makes frequent network calls to blacklisted endpoints upon startup. 

```js
await device.launchApp({
  newInstance: true,
  launchArgs: { detoxURLBlacklistRegex: ' \\("http://192.168.1.253:19001/onchange","https://e.crashlytics.com/spi/v2/events"\\)' },
}); 
```

### `device.relaunchApp(params)`
**Deprecated** Use `device.launchApp(params)` instead. This method is now calling `launchApp({newInstance: true})` for backwards compatibility.
Kill and relaunch the app defined in the current [`configuration`](APIRef.Configuration.md).

### `device.terminateApp()`
By default, `terminateApp()` with no params will terminate the app file defined in the current [`configuration`](APIRef.Configuration.md).

To terminate another app, specify its bundle id

```js
await device.terminateApp('other.bundle.id');
```

### `device.sendToHome()`
Send application to background by bringing `com.apple.springboard` to the foreground.
Combining `sendToHome()` with `launchApp({newInstance: false})` will simulate app coming back from background.
Check out Detox's [own test suite](../detox/test/e2e/06.device.test.js)

```js
await device.sendToHome();
await device.launchApp({newInstance: false});
// app returned from background, do stuff
```
Check out Detox's [own test suite](../detox/test/e2e/06.device.test.js)

### `device.reloadReactNative()`
If this is a React Native app, reload the React Native JS bundle. This action is much faster than `device.launchApp()`, and can be used if you just need to reset your React Native logic.

<i>**Note:** This functionality does not work without faults. Under certain conditions, the system may not behave as expected and/or even crash. In these cases, use `device.launchApp()` to launch the app cleanly instead of only reloading the JS bundle.</i>

### `device.installApp()`
By default, `installApp()` with no params will install the app file defined in the current [`configuration`](APIRef.Configuration.md).

To install another app, specify its path

```js
await device.installApp('path/to/other/app');
```

### `device.uninstallApp()`
By default, `uninstallApp()` with no params will uninstall the app defined in the current [`configuration`](APIRef.Configuration.md).

To uninstall another app, specify its bundle id

```js
await device.uninstallApp('other.bundle.id');
```

### `device.openURL({url, sourceApp[optional]})`
Mock opening the app from URL. `sourceApp` is an optional parameter to specify source application bundle id.
Read more in [Mocking Open From URL](APIRef.MockingOpenFromURL.md) section.
Check out Detox's [own test suite](../detox/test/e2e/15.urls.test.js)

### `device.sendUserNotification(params)`
Mock handling of received user notification when app is in foreground.
Read more in [Mocking User Notifications](APIRef.MockingUserNotifications.md) section.
Check out Detox's [own test suite](../detox/test/e2e/11.user-notifications.test.js)

### `device.sendUserActivity(params)`
Mock handling of received user activity when app is in foreground.
Read more in [Mocking User Activity](APIRef.MockingUserActivity.md) section.
Check out Detox's [own test suite](../detox/test/e2e/18.user-activities.test.js)

### `device.setOrientation(orientation)`
Takes `"portrait"` or `"landscape"` and rotates the device to the given orientation.
Currently only available in the iOS Simulator.
Check out Detox's [own test suite](../detox/test/e2e/06.device-orientation.test.js)

### `device.setLocation(lat, lon)`
>Note: `setLocation` is dependent on `fbsimctl`. if `fbsimctl` is not installed, the command will fail, asking for it to be installed.
Sets the simulator location to the given latitude and longitude.
```js
await device.setLocation(32.0853, 34.7818);
```

### `device.setURLBlacklist([urls])`

Disable [EarlGrey's network synchronization mechanism](https://github.com/google/EarlGrey/blob/master/docs/api.md#network) on preferred endpoints. Useful if you want to on skip over synchronizing on certain URLs. To disable endpoints at initialization, pass in the blacklist at [device launch](#10-initialize-the-url-blacklist-at-device-launch).

```js
await device.setURLBlacklist(['.*127.0.0.1.*']);
```

```js
await device.setURLBlacklist(['.*my.ignored.endpoint.*']);
```

### `device.enableSynchronization()`
Enable [EarlGrey's synchronization mechanism](https://github.com/google/EarlGrey/blob/master/docs/api.md#synchronization
) (enabled by default). **This is being reset on every new instance of the app.**
```js
await device.enableSynchronization();
```


### `device.disableSynchronization()`
Disable [EarlGrey's synchronization mechanism](https://github.com/google/EarlGrey/blob/master/docs/api.md#synchronization
) (enabled by default) **This is being reset on every new instance of the app.**

```js
await device.disableSynchronization();
```


### `device.resetContentAndSettings()` **iOS Only**
Resets the Simulator to clean state (like the Simulator > Reset Content and Settings... menu item), especially removing
previously set permissions.

```js
await device.resetContentAndSettings();
```

### `device.getPlatform()`
Returns the current device, `ios` or `android`.

```js
if (device.getPlatform() === 'ios') {
  await expect(loopSwitch).toHaveValue('1');
}
```

### `device.takeScreenshot(name)`

Takes a screenshot on the device and schedules putting it to
the [artifacts folder](APIRef.Artifacts.md#enabling-artifacts) upon
completion of the current test.

Returns a temporary path to the screenshot.

**NOTE:** The returned path is guaranteed to be valid only during the test execution.
Later on, the screenshot will be moved to the artifacts location.

Consider the example below:

```js
describe('Menu items', () => {
  it('should have Logout', async () => {
    // ...
    const screenshotPath = await device.takeScreenshot('tap on menu');
    // ...
  });
});
```

In this example:

* If `--take-screenshots none` is set, the screenshot will be taken, but it won't be saved to `<artifacts-location>` after the test ends.
* If `--take-screenshots failing` is set, and the test passes, the screenshot won't be saved to `<artifacts-location>` after the test ends.
* In the other modes (`manual` and `all`), if the test passes, the screenshot will be put to `<artifacts-location>/✓ Menu items should have Logout/tap on menu.png`.
* In the other modes (`manual` and `all`), if the test fails, the screenshot will be put to `<artifacts-location>/✗ Menu items should have Logout/tap on menu.png`.

### `device.shake()` **iOS Only**
Simulate shake

### `device.setBiometricEnrollment(bool)` **iOS Only**
Toggles device enrollment in biometric auth (TouchID or FaceID).

```js
await device.setBiometricEnrollment(true);
// or
await device.setBiometricEnrollment(false);
```

### `device.matchFace()` **iOS Only**
Simulates the success of a face match via FaceID

### `device.unmatchFace()` **iOS Only**
Simulates the failure of face match via FaceID

### `device.matchFinger()` **iOS Only**
Simulates the success of a finger match via TouchID

### `device.unmatchFinger()` **iOS Only**
Simulates the failure of a finger match via TouchID

### `device.clearKeychain()` **iOS Only**
Clears the device keychain

### `device.setStatusBar()` **iOS Only**
Override simulator's status bar. Available options:

```
{
  time: "12:34"
  // Set the date or time to a fixed value.
  // If the string is a valid ISO date string it will also set the date on relevant devices.
  dataNetwork: "wifi"
  // If specified must be one of 'wifi', '3g', '4g', 'lte', 'lte-a', or 'lte+'.
  wifiMode: "failed"
  // If specified must be one of 'searching', 'failed', or 'active'.
  wifiBars: "2"
  // If specified must be 0-3.
  cellularMode: "searching"
  // If specified must be one of 'notSupported', 'searching', 'failed', or 'active'.
  cellularBars: "3"
  // If specified must be 0-4.
  batteryState: "charging"
  // If specified must be one of 'charging', 'charged', or 'discharging'.
  batteryLevel: "50"
  // If specified must be 0-100.
}
```

### `device.resetStatusBar()` **iOS Only**
Resets any override in simulator's status bar.

### `device.reverseTcpPort()` **Android Only**

Reverse a TCP port from the device (guest) back to the host-computer, as typically done with the `adb reverse` command. The end result would be that all network requests going from the device to the specified port will be forwarded to the computer.

### `device.unreverseTcpPort()` **Android Only**

Clear a _reversed_ TCP-port (e.g. previously set using `device.reverseTcpPort()`).

### `device.pressBack()` **Android Only**
Simulate press back button.

```js
await device.pressBack();
```

### `device.getUiDevice()` **Android Only**
Exposes UiAutomator's UiDevice API (https://developer.android.com/reference/android/support/test/uiautomator/UiDevice)
**This is not a part of the official Detox API**, it may break and change whenever an update to UiDevice or UiAutomator gradle dependencies ('androidx.test.uiautomator:uiautomator') is introduced.

[UiDevice's autogenerated code](../detox/src/android/espressoapi/UIDevice.js)


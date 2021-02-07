// TypeScript definitions for Detox
//
// Original authors:
// * Jane Smith <jsmith@example.com>
// * Tareq El-Masri <https://github.com/TareqElMasri>
// * Steve Chun <https://github.com/stevechun>
// * Hammad Jutt <https://github.com/hammadj>
// * pera <https://github.com/santiagofm>
// * Max Komarychev <https://github.com/maxkomarychev>
// * Dor Ben Baruch <https://github.com/Dor256>

declare global {
    const device: Detox.DetoxExportWrapper['device'];
    const element: Detox.DetoxExportWrapper['element'];
    const waitFor: Detox.DetoxExportWrapper['waitFor'];
    const expect: Detox.DetoxExportWrapper['expect'];
    const by: Detox.DetoxExportWrapper['by'];
    const detoxCircus: Detox.DetoxCircus;

    namespace NodeJS {
      interface Global {
        device: Detox.DetoxExportWrapper['device'];
        element: Detox.DetoxExportWrapper['element'];
        waitFor: Detox.DetoxExportWrapper['waitFor'];
        expect: Detox.DetoxExportWrapper['expect'];
        by: Detox.DetoxExportWrapper['by'];
        detoxCircus: Detox.DetoxCircus;
      }
    }

    namespace Detox {
        // region DetoxConfig

        interface DetoxConfig {
            /**
             * @example testRunner: 'jest'
             * @example testRunner: 'mocha'
             */
            testRunner?: string;
            /**
             * @example runnerConfig: 'e2e/config.js'
             */
            runnerConfig?: string;
            /**
             * @example specs: 'detoxE2E'
             */
            specs?: string;
            artifacts?: DetoxArtifactsConfig;
            behavior?: DetoxBehaviorConfig;
            session?: DetoxSessionConfig;
            configurations: Record<string, DetoxConfiguration>;
        }

        interface DetoxArtifactsConfig {
            rootDir?: string;
            pathBuilder?: string;
            plugins?: {
                log?: 'none' | 'failing' | 'all' | DetoxLogArtifactsPluginConfig;
                screenshot?: 'none' | 'manual' | 'failing' | 'all' | DetoxScreenshotArtifactsPluginConfig;
                video?: 'none' | 'failing' | 'all' | DetoxVideoArtifactsPluginConfig;
                instruments?: 'none' | 'all' | DetoxInstrumentsArtifactsPluginConfig;
                timeline?: 'none' | 'all' | DetoxTimelineArtifactsPluginConfig;
                uiHierarchy?: 'disabled' | 'enabled' | DetoxUIHierarchyArtifactsPluginConfig;

                [pluginId: string]: unknown;
            };
        }

        interface DetoxBehaviorConfig {
            init?: {
                /**
                 * By default, Detox exports `device`, `expect`, `element`, `by` and `waitFor`
                 * as global variables. If you want to control their initialization manually,
                 * set this property to `false`.
                 *
                 * This is useful when during E2E tests you also need to run regular expectations
                 * in Node.js. Jest's `expect` for instance, will not be overridden by Detox when
                 * this option is used.
                 */
                exposeGlobals?: boolean;
                /**
                 * By default, `await detox.init()` will uninstall and install the app.
                 * If you wish to reuse the existing app for a faster run, set the property to
                 * `false`.
                 */
                reinstallApp?: boolean;
            };
            launchApp?: 'auto' | 'manual';
            cleanup?: {
                shutdownDevice?: boolean;
            };
        }

        interface DetoxSessionConfig {
            autoStart?: boolean;
            debugSynchronization?: number;
            server?: string;
            sessionId?: string;
        }

        type DetoxDeviceConfig = DetoxBuiltInDeviceConfig | DetoxCustomDriverConfig;

        type DetoxConfiguration = DetoxPlainConfiguration;

        interface DetoxLogArtifactsPluginConfig {
            enabled?: boolean;
            keepOnlyFailedTestsArtifacts?: boolean;
        }

        interface DetoxScreenshotArtifactsPluginConfig {
            enabled?: boolean;
            keepOnlyFailedTestsArtifacts?: boolean;
            shouldTakeAutomaticSnapshots?: boolean;
            takeWhen?: {
                testStart?: boolean;
                testFailure?: boolean;
                testDone?: boolean;
                appNotReady?: boolean;
            };
        }

        interface DetoxVideoArtifactsPluginConfig {
            enabled?: boolean;
            keepOnlyFailedTestsArtifacts?: boolean;
            android?: Partial<{
                size: [number, number];
                bitRate: number;
                timeLimit: number;
                verbose: boolean;
            }>;
            simulator?: Partial<{
                codec: string;
            }>;
        }

        interface DetoxInstrumentsArtifactsPluginConfig {
            enabled?: boolean;
        }

        interface DetoxUIHierarchyArtifactsPluginConfig {
            enabled?: boolean;
        }

        interface DetoxTimelineArtifactsPluginConfig {
            enabled?: boolean;
        }

        interface DetoxLooseIosAppConfig {
            binaryPath: string;
            build?: string;
        }

        interface DetoxLooseAndroidAppConfig {
            binaryPath: string;
            build?: string;
            testBinaryPath?: string;
            utilBinaryPaths?: string[];
        }

        type DetoxBuiltInDeviceConfig =
          | DetoxIosSimulatorDriverConfig
          | DetoxIosNoneDriverConfig
          | DetoxAttachedAndroidDriverConfig
          | DetoxAndroidEmulatorDriverConfig
          | DetoxGenymotionCloudDriverConfig;

        type DetoxPlainConfiguration = DetoxConfigurationOverrides & (
          | (DetoxIosSimulatorDriverConfig & DetoxLooseIosAppConfig)
          | (DetoxIosNoneDriverConfig & DetoxLooseIosAppConfig)
          | (DetoxAttachedAndroidDriverConfig & DetoxLooseAndroidAppConfig)
          | (DetoxAndroidEmulatorDriverConfig & DetoxLooseAndroidAppConfig)
          | (DetoxGenymotionCloudDriverConfig & DetoxLooseAndroidAppConfig)
          | (DetoxCustomDriverConfig)
          );

        interface DetoxIosSimulatorDriverConfig {
            type: 'ios.simulator';
            device: string | Partial<IosSimulatorQuery>;
        }

        interface DetoxIosNoneDriverConfig {
            type: 'ios.none';
            // TODO: check if we need it at all?
            device?: string | Partial<IosSimulatorQuery>;
        }

        interface DetoxAttachedAndroidDriverConfig {
            type: 'android.attached';
            device: string | { adbName: string };
        }

        interface DetoxAndroidEmulatorDriverConfig {
            type: 'android.emulator';
            device: string | { avdName: string };
        }

        interface DetoxGenymotionCloudDriverConfig {
            type: 'android.genycloud';
            device: { recipeUUID: string; } | { recipeName: string; };
        }

        interface DetoxCustomDriverConfig {
            type: string;
            [prop: string]: unknown;
        }

        interface IosSimulatorQuery {
            id: string;
            type: string;
            name: string;
            os: string;
        }

        type DetoxKnownDeviceType = DetoxBuiltInDeviceConfig['type'];

        type DetoxConfigurationOverrides = {
            artifacts?: false | DetoxArtifactsConfig;
            behavior?: DetoxBehaviorConfig;
            session?: DetoxSessionConfig;
        };

        // endregion DetoxConfig

        // Detox exports all methods from detox global and all of the global constants.
        interface DetoxInstance {
            device: Device;
            element: Element;
            waitFor: WaitFor;
            expect: Expect<Expect<Promise<void>>>;
            by: Matchers;
        }

        interface DetoxExportWrapper extends DetoxInstance {
            /**
             * The setup phase happens inside detox.init(). This is the phase where detox reads its configuration, starts a server, loads its expection library and starts a simulator
             *
             * @param configOverride - this object is deep-merged with the selected Detox configuration from .detoxrc
             * @example
             * beforeAll(async () => {
             *   await detox.init();
             * });
             */
            init(configOverride?: Partial<DetoxConfig>, options?: DetoxInitOptions): Promise<void>;
            beforeEach(...args: any[]): Promise<void>;
            afterEach(...args: any[]): Promise<void>;
            /**
             * The cleanup phase should happen after all the tests have finished.
             * This is the phase where the Detox server shuts down.
             *
             * @example
             * after(async () => {
             *  await detox.cleanup();
             * });
             */
            cleanup(): Promise<void>;
        }

        interface DetoxInitOptions {
            /**
             * By default, Detox exports `device`, `expect`, `element`, `by` and `waitFor`
             * as global variables. If you want to control their initialization manually,
             * set this property to `false`.
             *
             * This is useful when during E2E tests you also need to run regular expectations
             * in Node.js. Jest's `expect` for instance, will not be overridden by Detox when
             * this option is used.
             */
            initGlobals?: boolean;
            /**
             * By default, `await detox.init()` will uninstall and install the app.
             * If you wish to reuse the existing app for a faster run, set the property to
             * `false`.
             */
            reuse?: boolean;
        }

        /**
         * A construct allowing for the querying and modification of user arguments passed to an app upon launch by Detox.
         *
         * @see AppLaunchArgs#modify
         * @see AppLaunchArgs#reset
         * @see AppLaunchArgs#get
         */
        interface AppLaunchArgs {
            /**
             * Modify the launch-arguments via a modifier object, according to the following logic:
             *  - Concrete modifier properties would either set anew or override the value of existing properties with the same name, with
             *    the specific value.
             *  - Modifier properties set to either `undefined` or `null` would have the equivalent property cleared.
             *
             * @param modifier The modifier object.
             *
             * @example
             * // With current launch arguments set to:
             * // {
             * //   mockServerPort: 1234,
             * //   mockServerCredentials: 'user@test.com:12345678',
             * // }
             * device.modify({
             *   mockServerPort: 4321,
             *   mockServerCredentials: null,
             *   mockServerToken: 'abcdef',
             * };
             * await device.launchApp();
             * // => launch-arguments become:
             * // {
             * //   mockServerPort: 4321,
             * //   mockServerToken: 'abcdef',
             * // }
             */
            modify(modifier: object): void;

            /**
             * Complete reset all currently set launch-arguments (i.e. back to an empty JS object).
             */
            reset(): void;

            /**
             * Get all currently set launch-arguments.
             * @returns An object containing all launch-arguments. Note: Changes on the returned object will not be reflected on the
             * launch-arguments associated with the device.
             */
            get(): object;
        }

        interface Device {
            /**
             * Holds the environment-unique ID of the device - namely, the adb ID on Android (e.g. emulator-5554) and the Mac-global simulator UDID on iOS,
             * as used by simctl (e.g. AAAAAAAA-BBBB-CCCC-DDDD-EEEEEEEEEEEE).
             *
             * The value will be undefined until the device is properly prepared (i.e. in detox.init())
             */
            id: string;
            /**
             * Holds a descriptive name of the device. Example: emulator-5554 (Pixel_API_29)
             * The value will be undefined until the device is properly prepared (i.e. in detox.init()).
             */
            name: string;
            /**
             * Launch the app.
             *
             * <p>For info regarding launch arguments, refer to the [dedicated guide](https://github.com/wix/Detox/blob/master/docs/APIRef.LaunchArgs.md).
             *
             * @example
             * // Terminate the app and launch it again. If set to false, the simulator will try to bring app from background,
             * // if the app isn't running, it will launch a new instance. default is false
             * await device.launchApp({newInstance: true});
             * @example
             * // Grant or deny runtime permissions for your application.
             * await device.launchApp({permissions: {calendar: 'YES'}});
             * @example
             * // Mock opening the app from URL to test your app's deep link handling mechanism.
             * await device.launchApp({url: url});
             * @example
             * // Start the app with some custom arguments.
             * await device.launchApp({
             *   launchArgs: {arg1: 1, arg2: "2"},
             * });
             */
            launchApp(config?: DeviceLaunchAppConfig): Promise<void>;
            /**
             * Access the user-defined launch-arguments predefined through static scopes such as the Detox configuration file and
             * command-line arguments. This access allows - through dedicated methods, for both value-querying and
             * modification (see {@link AppLaunchArgs}).
             * Refer to the [dedicated guide](https://github.com/wix/Detox/blob/master/docs/APIRef.LaunchArgs.md) for complete details.
             *
             * @example
             * // With Detox being preconfigured statically to use these arguments in app launch:
             * // {
             * //   mockServerPort: 1234,
             * // }
             * // The following code would result in these arguments eventually passed into the launched app:
             * // {
             * //   mockServerPort: 4321,
             * //   mockServerToken: 'uvwxyz',
             * // }
             * device.appLaunchArgs().modify({
             *   mockServerPort: 4321,
             *   mockServerToken: 'abcdef',
             * });
             * await device.launchApp({ launchArgs: { mockServerToken: 'uvwxyz' } }};
             *
             * @see AppLaunchArgs
             */
            appLaunchArgs(): AppLaunchArgs;
            /**
             * Terminate the app.
             *
             * @example
             * // By default, terminateApp() with no params will terminate the app
             * await device.terminateApp();
             * @example
             * // To terminate another app, specify its bundle id
             * await device.terminateApp('other.bundle.id');
             */
            terminateApp(bundle?: string): Promise<void>;
            /**
             * Send application to background by bringing com.apple.springboard to the foreground.
             * Combining sendToHome() with launchApp({newInstance: false}) will simulate app coming back from background.
             * @example
             * await device.sendToHome();
             * await device.launchApp({newInstance: false});
             */
            sendToHome(): Promise<void>;
            /**
             * If this is a React Native app, reload the React Native JS bundle. This action is much faster than device.launchApp(), and can be used if you just need to reset your React Native logic.
             *
             * @example await device.reloadReactNative()
             */
            reloadReactNative(): Promise<void>;
            /**
             * By default, installApp() with no params will install the app file defined in the current configuration.
             * To install another app, specify its path
             * @example await device.installApp();
             * @example await device.installApp('path/to/other/app');
             */
            installApp(path?: any): Promise<void>;
            /**
             * By default, uninstallApp() with no params will uninstall the app defined in the current configuration.
             * To uninstall another app, specify its bundle id
             * @example await device.installApp('other.bundle.id');
             */
            uninstallApp(bundle?: string): Promise<void>;
            /**
             * Mock opening the app from URL. sourceApp is an optional parameter to specify source application bundle id.
             */
            openURL(url: { url: string; sourceApp?: string }): Promise<void>;
            /**
             * Mock handling of received user notification when app is in foreground.
             */
            sendUserNotification(...params: any[]): Promise<void>;
            /**
             * Mock handling of received user activity when app is in foreground.
             */
            sendUserActivity(...params: any[]): Promise<void>;
            /**
             * Takes "portrait" or "landscape" and rotates the device to the given orientation. Currently only available in the iOS Simulator.
             */
            setOrientation(orientation: Orientation): Promise<void>;
            /**
             * Note: setLocation is dependent on fbsimctl. if fbsimctl is not installed, the command will fail, it must be installed. Sets the simulator location to the given latitude and longitude.
             *
             * @example await device.setLocation(32.0853, 34.7818);
             */
            setLocation(lat: number, lon: number): Promise<void>;
            /**
             * Disable EarlGrey's network synchronization mechanism on preferred endpoints. Useful if you want to on skip over synchronizing on certain URLs.
             *
             * @example await device.setURLBlacklist(['.*127.0.0.1.*']);
             */
            setURLBlacklist(urls: string[]): Promise<void>;
            /**
             * Enable EarlGrey's synchronization mechanism (enabled by default). This is being reset on every new instance of the app.
             *
             * @example await device.enableSynchronization();
             */
            enableSynchronization(): Promise<void>;
            /**
             * Disable EarlGrey's synchronization mechanism (enabled by default) This is being reset on every new instance of the app.
             *
             * @example await device.disableSynchronization();
             */
            disableSynchronization(): Promise<void>;
            /**
             * Resets the Simulator to clean state (like the Simulator > Reset Content and Settings... menu item), especially removing previously set permissions.
             *
             * @example await device.resetContentAndSettings();
             */
            resetContentAndSettings(): Promise<void>;
            /**
             * Returns the current device, ios or android.
             *
             * @example
             * if (device.getPlatform() === 'ios') {
             *     await expect(loopSwitch).toHaveValue('1');
             * }
             */
            getPlatform(): 'ios' | 'android';
            /**
             * Takes a screenshot on the device and schedules putting it in the artifacts folder upon completion of the current test.
             * @param {string} name for the screenshot artifact
             * @returns {Promise<string>} a temporary path to the screenshot.
             * @example
             * test('Menu items should have logout', async () => {
             *   const tempPath = await device.takeScreenshot('tap on menu');
             *   // The temporary path will remain valid until the test completion.
             *   // Afterwards, the screenshot will be moved, e.g.:
             *   // * on success, to: <artifacts-location>/✓ Menu items should have Logout/tap on menu.png
             *   // * on failure, to: <artifacts-location>/✗ Menu items should have Logout/tap on menu.png
             * });
             */
            takeScreenshot(name: string): Promise<string>;
            /**
             * Simulate shake (iOS Only)
             */
            shake(): Promise<void>;
            /**
             * Toggles device enrollment in biometric auth (TouchID or FaceID) (iOS Only)
             * @example await device.setBiometricEnrollment(true);
             * @example await device.setBiometricEnrollment(false);
             */
            setBiometricEnrollment(enabled: boolean): Promise<void>;
            /**
             * Simulates the success of a face match via FaceID (iOS Only)
             */
            matchFace(): Promise<void>;
            /**
             * Simulates the failure of a face match via FaceID (iOS Only)
             */
            unmatchFace(): Promise<void>;
            /**
             * Simulates the success of a finger match via TouchID (iOS Only)
             */
            matchFinger(): Promise<void>;
            /**
             * Simulates the failure of a finger match via TouchID (iOS Only)
             */
            unmatchFinger(): Promise<void>;
            /**
             * Clears the simulator keychain (iOS Only)
             */
            clearKeychain(): Promise<void>;
            /**
             * Simulate press back button (Android Only)
             * @example await device.pressBack();
             */
            pressBack(): Promise<void>;
            /**
             * (Android Only)
             * Exposes UiAutomator's UiDevice API (https://developer.android.com/reference/android/support/test/uiautomator/UiDevice).
             * This is not a part of the official Detox API,
             * it may break and change whenever an update to UiDevice or UiAutomator gradle dependencies ('androidx.test.uiautomator:uiautomator') is introduced.
             * UIDevice's autogenerated code reference: https://github.com/wix/Detox/blob/master/detox/src/android/espressoapi/UIDevice.js
             */
            getUiDevice(): Promise<void>;
        }

        type DetoxAny = Element & Actions<any> & WaitFor;

        interface Element {
            (by: Matchers): DetoxAny;

            /**
             * Choose from multiple elements matching the same matcher using index
             * @example await element(by.text('Product')).atIndex(2);
             */
            atIndex(index: number): DetoxAny;
        }

        interface Matchers {
            (by: Matchers): Matchers;

            /**
             * by.id will match an id that is given to the view via testID prop.
             * @example
             * // In a React Native component add testID like so:
             * <TouchableOpacity testID={'tap_me'}>
             * // Then match with by.id:
             * await element(by.id('tap_me'));
             */
            id(id: string): Matchers;
            /**
             * Find an element by text, useful for text fields, buttons.
             * @example await element(by.text('Tap Me'));
             */
            text(text: string): Matchers;
            /**
             * Find an element by accessibilityLabel on iOS, or by contentDescription on Android.
             * @example await element(by.label('Welcome'));
             */
            label(label: string): Matchers;
            /**
             * Find an element by native view type.
             * @example await element(by.type('RCTImageView'));
             */
            type(nativeViewType: string): Matchers;
            /**
             * Find an element with an accessibility trait. (iOS only)
             * @example await element(by.traits(['button']));
             */
            traits(traits: string[]): Matchers;
            /**
             * Find an element by a matcher with a parent matcher
             * @example await element(by.id('Grandson883').withAncestor(by.id('Son883')));
             */
            withAncestor(parentBy: Matchers): Matchers;
            /**
             * Find an element by a matcher with a child matcher
             * @example await element(by.id('Son883').withDescendant(by.id('Grandson883')));
             */
            withDescendant(childBy: Matchers): Matchers;
            /**
             * Find an element by multiple matchers
             * @example await element(by.text('Product').and(by.id('product_name'));
             */
            and(by: Matchers): Matchers;
        }

        interface Expect<R> {
            (element: Element): Expect<Promise<void>>;
            /**
             * Expect the view to be at least 75% visible.
             * @example await expect(element(by.id('UniqueId204'))).toBeVisible();
             */
            toBeVisible(): R;
            /**
             * Negate the expectation.
             * @example await expect(element(by.id('UniqueId205'))).not.toBeVisible();
             */
            not: Expect<Promise<void>>;
            /**
             * Expect the view to not be visible.
             * @example await expect(element(by.id('UniqueId205'))).toBeNotVisible();
             */
            toBeNotVisible(): R;
            /**
             * Expect the view to exist in the UI hierarchy.
             * @example await expect(element(by.id('UniqueId205'))).toExist();
             */
            toExist(): R;
            /**
             * Expect the view to not exist in the UI hierarchy.
             * @example await expect(element(by.id('RandomJunk959'))).toNotExist();
             */
            toNotExist(): R;
            /**
             * In React Native apps, expect UI component of type <Text> to have text.
             * In native iOS apps, expect UI elements of type UIButton, UILabel, UITextField or UITextViewIn to have inputText with text.
             * @example await expect(element(by.id('UniqueId204'))).toHaveText('I contain some text');
             */
            toHaveText(text: string): R;
            /**
             * It searches by accessibilityLabel on iOS, or by contentDescription on Android.
             * In React Native it can be set for both platforms by defining an accessibilityLabel on the view.
             * @example await expect(element(by.id('UniqueId204'))).toHaveLabel('Done');
             */
            toHaveLabel(label: string): R;
            /**
             * In React Native apps, expect UI component to have testID with that id.
             * In native iOS apps, expect UI element to have accessibilityIdentifier with that id.
             * @example await expect(element(by.text('I contain some text'))).toHaveId('UniqueId204');
             */
            toHaveId(id: string): R;
            /**
             * Expects a toggle-able element (e.g. a Switch or a Check-Box) to be on/checked or off/unchecked. 
             * As a reference, in react-native, this is the equivalent switch component.
             * @example await expect(element(by.id('switch'))).toHaveToggleValue(true);
             */
            toHaveToggleValue(value: boolean): R;
            /**
             * Expect components like a Switch to have a value ('0' for off, '1' for on).
             * @example await expect(element(by.id('UniqueId533'))).toHaveValue('0');
             */
            toHaveValue(value: any): R;
        }

        interface WaitFor {
            /**
             * This API polls using the given expectation continuously until the expectation is met. Use manual synchronization with waitFor only as a last resort.
             * NOTE: Every waitFor call must set a timeout using withTimeout(). Calling waitFor without setting a timeout will do nothing.
             * @example await waitFor(element(by.id('UniqueId336'))).toExist().withTimeout(2000);
             */
            (element: Element): Expect<WaitFor>;
            /**
             * Waits for the condition to be met until the specified time (millis) have elapsed.
             * @example await waitFor(element(by.id('UniqueId336'))).toExist().withTimeout(2000);
             */
            withTimeout(millis: number): Promise<void>;
            /**
             * Performs the action repeatedly on the element until an expectation is met
             * @example await waitFor(element(by.text('Text5'))).toBeVisible().whileElement(by.id('ScrollView630')).scroll(50, 'down');
             */
            whileElement(by: Matchers): DetoxAny;
        }

        interface Actions<R> {
            /**
             * Simulate tap on an element
             * @example await element(by.id('tappable')).tap();
             */
            tap(): Promise<Actions<R>>;
            /**
             * Simulate long press on an element
             * @example await element(by.id('tappable')).longPress();
             */
            longPress(): Promise<Actions<R>>;
            /**
             * Simulate long press on an element and then drag it to the position of the target element
             * @example await element(by.id('draggable')).longPressAndDrag(2000, NaN, NaN, element(by.id('target')), NaN, NaN, 'fast', 0);
             */
            longPressAndDrag(duration: number, normalizedPositionX: number, normalizedPositionY: number, targetElement: Element,
                             normalizedTargetPositionX: number, normalizedTargetPositionY: number, speed: Speed, holdDuration: number): Promise<Actions<R>>;
            /**
             * Simulate multiple taps on an element.
             * @param times number of times to tap
             * @example await element(by.id('tappable')).multiTap(3);
             */
            multiTap(times: number): Promise<Actions<R>>;
            /**
             * Simulate tap at a specific point on an element.
             * Note: The point coordinates are relative to the matched element and the element size could changes on different devices or even when changing the device font size.
             * @example await element(by.id('tappable')).tapAtPoint({ x:5, y:10 });
             */
            tapAtPoint(point: { x: number; y: number }): Promise<Actions<R>>;
            /**
             * Use the builtin keyboard to type text into a text field.
             * @example await element(by.id('textField')).typeText('passcode');
             */
            typeText(text: string): Promise<Actions<R>>;
            /**
             * Paste text into a text field.
             * @example await element(by.id('textField')).replaceText('passcode again');
             */
            replaceText(text: string): Promise<Actions<R>>;
            /**
             * Clear text from a text field.
             * @example await element(by.id('textField')).clearText();
             */
            clearText(): Promise<Actions<R>>;
            /**
             * Taps the backspace key on the built-in keyboard.
             * @example await element(by.id('textField')).tapBackspaceKey();
             */
            tapBackspaceKey(): Promise<Actions<R>>;
            /**
             * Taps the return key on the built-in keyboard.
             * @example await element(by.id('textField')).tapReturnKey();
             */
            tapReturnKey(): Promise<Actions<R>>;
            /**
             * Scrolls a given amount of pixels in the provided direction, starting from the provided start positions.
             * @param pixels - independent device pixels
             * @param direction - left/right/up/down
             * @param startPositionX - the X starting scroll position, in percentage; valid input: `[0.0, 1.0]`, `NaN`; default: `NaN`—choose the best value automatically
             * @param startPositionY - the Y starting scroll position, in percentage; valid input: `[0.0, 1.0]`, `NaN`; default: `NaN`—choose the best value automatically
             * @example await element(by.id('scrollView')).scroll(100, 'down', NaN, 0.85);
             * @example await element(by.id('scrollView')).scroll(100, 'up');
             */
            scroll(
              pixels: number,
              direction: Direction,
              startPositionX?: number,
              startPositionY?: number,
            ): Promise<Actions<R>>;
            /**
             * Scroll to edge.
             * @example await element(by.id('scrollView')).scrollTo('bottom');
             * @example await element(by.id('scrollView')).scrollTo('top');
             */
            scrollTo(edge: Direction): Promise<Actions<R>>;
            /**
             * Swipes in the provided direction at the provided speed, started from percentage.
             * @param speed default: `fast`
             * @param percentage screen percentage to swipe; valid input: `[0.0, 1.0]`
             * @param optional normalizedStartingPointX X coordinate of swipe starting point, relative to the view width; valid input: `[0.0, 1.0]`
             * @param normalizedStartingPointY Y coordinate of swipe starting point, relative to the view height; valid input: `[0.0, 1.0]`
             * @example await element(by.id('scrollView')).swipe('down');
             * @example await element(by.id('scrollView')).swipe('down', 'fast');
             * @example await element(by.id('scrollView')).swipe('down', 'fast', 0.5);
             * @example await element(by.id('scrollView')).swipe('down', 'fast', 0.5, 0.2);
             * @example await element(by.id('scrollView')).swipe('down', 'fast', 0.5, 0.2, 0.5);
             */
            swipe(direction: Direction, speed?: Speed, percentage?: number, normalizedStartingPointX?: number, normalizedStartingPointY?: number): Promise<Actions<R>>;
            /**
             * Sets a picker view’s column to the given value. This function supports both date pickers and general picker views. (iOS Only)
             * Note: When working with date pickers, you should always set an explicit locale when launching your app in order to prevent flakiness from different date and time styles.
             * See [here](https://github.com/wix/Detox/blob/master/docs/APIRef.DeviceObjectAPI.md#9-launch-with-a-specific-language-ios-only) for more information.
             *
             * @param column number of datepicker column (starts from 0)
             * @param value string value in set column (must be correct)
             * @example
             * await expect(element(by.type('UIPickerView'))).toBeVisible();
             * await element(by.type('UIPickerView')).setColumnToValue(1,"6");
             * await element(by.type('UIPickerView')).setColumnToValue(2,"34");
             */
            setColumnToValue(column: number, value: string): Promise<Actions<R>>;
            /**
             * Sets the date of a date picker to a date generated from the provided string and date format. (iOS only)
             * @param dateString string representing a date in the supplied `dateFormat`
             * @param dateFormat format for the `dateString` supplied
             * @example
             * await expect(element(by.id('datePicker'))).toBeVisible();
             * await element(by.id('datePicker')).setDatePickerDate('2019-02-06T05:10:00-08:00', "yyyy-MM-dd'T'HH:mm:ssZZZZZ");
             */
            setDatePickerDate(dateString: string, dateFormat: string): Promise<Actions<R>>;
            /**
             * Pinches in the given direction with speed and angle. (iOS only)
             * @param angle value in radiant, default is `0`
             * @example
             * await expect(element(by.id('PinchableScrollView'))).toBeVisible();
             * await element(by.id('PinchableScrollView')).pinchWithAngle('outward', 'slow', 0);
             */
            pinchWithAngle(direction: Direction, speed: Speed, angle: number): Promise<Actions<R>>;
        }

        type Direction = 'left' | 'right' | 'top' | 'bottom' | 'up' | 'down';

        type Orientation = 'portrait' | 'landscape';

        type Speed = 'fast' | 'slow';

        interface LanguageAndLocale {
            language?: string;
            locale?: string;
        }

        /**
         *  Source for string definitions is https://github.com/wix/AppleSimulatorUtils
         */
        interface DevicePermissions {
            location?: LocationPermission;
            notifications?: NotificationsPermission;
            calendar?: CalendarPermission;
            camera?: CameraPermission;
            contacts?: ContactsPermission;
            health?: HealthPermission;
            homekit?: HomekitPermission;
            medialibrary?: MediaLibraryPermission;
            microphone?: MicrophonePermission;
            motion?: MotionPermission;
            photos?: PhotosPermission;
            reminders?: RemindersPermission;
            siri?: SiriPermission;
            speech?: SpeechPermission;
            faceid?: FaceIDPermission;
        }

        type LocationPermission = 'always' | 'inuse' | 'never' | 'unset';
        type PermissionState = 'YES' | 'NO' | 'unset';
        type CameraPermission = PermissionState;
        type ContactsPermission = PermissionState;
        type CalendarPermission = PermissionState;
        type HealthPermission = PermissionState;
        type HomekitPermission = PermissionState;
        type MediaLibraryPermission = PermissionState;
        type MicrophonePermission = PermissionState;
        type MotionPermission = PermissionState;
        type PhotosPermission = PermissionState;
        type RemindersPermission = PermissionState;
        type SiriPermission = PermissionState;
        type SpeechPermission = PermissionState;
        type NotificationsPermission = PermissionState;
        type FaceIDPermission = PermissionState;

        interface DeviceLaunchAppConfig {
            /**
             * Restart the app
             * Terminate the app and launch it again. If set to false, the simulator will try to bring app from background, if the app isn't running, it will launch a new instance. default is false
             */
            newInstance?: boolean;
            /**
             * Set runtime permissions
             * Grant or deny runtime permissions for your application.
             */
            permissions?: DevicePermissions;
            /**
             * Launch from URL
             * Mock opening the app from URL to test your app's deep link handling mechanism.
             */
            url?: any;
            /**
             * Launch with user notifications
             */
            userNotification?: any;
            /**
             * Launch with user activity
             */
            userActivity?: any;
            /**
             * Launch into a fresh installation
             * A flag that enables relaunching into a fresh installation of the app (it will uninstall and install the binary again), default is false.
             */
            delete?: boolean;
            /**
             * Arguments to pass-through into the app.
             * Refer to the [dedicated guide](https://github.com/wix/Detox/blob/master/docs/APIRef.LaunchArgs.md) for complete details.
             */
            launchArgs?: any;
            /**
             * Launch config for specifying the native language and locale
             */
            languageAndLocale?: LanguageAndLocale;
        }

        interface CircusTestEventListenerBase {
            handleTestEvent(event: any, state: any): Promise<void>;
        }

        interface DetoxCircus {
            /**
             * A get function that Enables access to this instance (single in each worker's scope)
             */
            getEnv(): {
                /**
                 * Registers a listener such as an adapter or reporter
                 * @example
                 * detoxCircus.getEnv().addEventsListener(adapter)
                 * detoxCircus.getEnv().addEventsListener(assignReporter)
                 */
                addEventsListener(listener: CircusTestEventListenerBase): void
            };
        }
    }
}

declare const detox: Detox.DetoxExportWrapper;
export = detox;

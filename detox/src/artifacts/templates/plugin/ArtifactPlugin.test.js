jest.mock('../../../utils/logger');
const logger = require('../../../utils/logger');
const ArtifactPlugin = require('./ArtifactPlugin');
const FileArtifact = require('../artifact/FileArtifact');
const testSummaries = require('../../__mocks__/testSummaries.mock');
const testSuite = require('./__mocks__/testSuite.mock');

class TestArtifactPlugin extends ArtifactPlugin {}

describe('ArtifactPlugin', () => {
  let api;
  let plugin;

  beforeEach(() => {
    api = {
      userConfig: {
        enabled: false,
        keepOnlyFailedTestsArtifacts: false,
      },
    };

    plugin = new TestArtifactPlugin({ api });
  });

  it('should have name', () =>
    expect(plugin.name).toBe(TestArtifactPlugin.name));

  it('should be disabled by default', () =>
    expect(plugin.enabled).toBe(false));

  describe('when enabled', () => {
    beforeEach(() => {
      plugin.enabled = true;
    });

    describe('when it is disabled with no reason', () => {
      beforeEach(() => plugin.disable());

      it('should gain state .enabled = false', () =>
        expect(plugin.enabled).toBe(false));

      it('should not write warnings to log', () =>
        expect(logger.warn.mock.calls.length).toBe(0));
    });

    describe('if it is disabled with a reason', () => {
      beforeEach(() => plugin.disable('a reason why it is disabled'));

      it('should gain state .enabled = false', () =>
        expect(plugin.enabled).toBe(false));

      it('should log warning to log with that reason', () => {
        expect(logger.warn.mock.calls).toHaveLength(1);
      });
    });
  });

  describe('when already disabled', () => {
    beforeEach(() => {
      plugin.enabled = false;
    });

    describe('when .disable() called with a reason', () => {
      beforeEach(() => {
        plugin.disable('a reason why it is disabled');
      });

      it('should not write any warnings to log', () => {
        expect(logger.warn.mock.calls.length).toBe(0);
      });
    });
  });

  describe('lifecycle hooks', () => {
    beforeEach(() => {
      plugin.context = {
        deviceId: 'someOriginalDeviceId',
        shouldNotBeDeletedFromContext: 'extraProperty'
      };
    });

    it('should not update context on .onBeforeLaunchApp', async () => {
      await expect(plugin.onBeforeLaunchApp({
        deviceId: 'testDeviceId',
        bundleId: 'testBundleId',
        launchArgs: {
          detoxSessionId: 'test',
        },
      }));

      expect(plugin.context).toEqual({
        deviceId: 'someOriginalDeviceId',
        shouldNotBeDeletedFromContext: 'extraProperty'
      });
    });

    it('should update context .onLaunchApp', async () => {
      await expect(plugin.onLaunchApp({
        deviceId: 'testDeviceId',
        bundleId: 'testBundleId',
        launchArgs: {
          detoxSessionId: 'test',
        },
        pid: 2018
      }));

      expect(plugin.context).toEqual({
        bundleId: 'testBundleId',
        deviceId: 'someOriginalDeviceId',
        launchArgs: {
          detoxSessionId: 'test',
        },
        pid: 2018,
        shouldNotBeDeletedFromContext: 'extraProperty',
      });
    });

    it('should not update context on .onBeforeUninstallApp', async () => {
      await expect(plugin.onBeforeUninstallApp({
        deviceId: 'testDeviceId',
        bundleId: 'testBundleId',
      }));

      expect(plugin.context).toEqual({
        deviceId: 'someOriginalDeviceId',
        shouldNotBeDeletedFromContext: 'extraProperty'
      });
    });

    it('should not update context on .onBeforeTerminateApp', async () => {
      await expect(plugin.onBeforeTerminateApp({
        deviceId: 'testDeviceId',
        bundleId: 'testBundleId',
      }));

      expect(plugin.context).toEqual({
        deviceId: 'someOriginalDeviceId',
        shouldNotBeDeletedFromContext: 'extraProperty'
      });
    });

    it('should update context on .onTerminateApp', async () => {
      await expect(plugin.onTerminateApp({
        deviceId: 'testDeviceId',
        bundleId: 'testBundleId',
      }));

      expect(plugin.context).toEqual({
        bundleId: '',
        launchArgs: null,
        pid: NaN,
        deviceId: 'someOriginalDeviceId',
        shouldNotBeDeletedFromContext: 'extraProperty',
      });
    });

    it('should update context on .onBootDevice', async () => {
      await expect(plugin.onBootDevice({
        deviceId: 'testDeviceId',
        coldBoot: true
      }));

      expect(plugin.context).toEqual({
        deviceId: 'testDeviceId',
        shouldNotBeDeletedFromContext: 'extraProperty',
      });
    });

    it('should not update context on .onBeforeShutdownDevice', async () => {
      await expect(plugin.onBeforeShutdownDevice({
        deviceId: 'testDeviceId'
      }));

      expect(plugin.context).toEqual({
        deviceId: 'someOriginalDeviceId',
        shouldNotBeDeletedFromContext: 'extraProperty',
      });
    });

    it('should have .onShutdownDevice', async () => {
      await expect(plugin.onShutdownDevice({
        deviceId: 'testDeviceId'
      }));

      expect(plugin.context).toEqual({
        deviceId: '',
        bundleId: '',
        launchArgs: null,
        pid: NaN,
        shouldNotBeDeletedFromContext: 'extraProperty',
      });
    });

    it('should have .onCreateExternalArtifact', async () => {
      await expect(plugin.onCreateExternalArtifact({
        name: 'The custom artifact',
        artifact: new FileArtifact({
          temporaryPath: '/tmp/path/to/artifact.file'
        }),
      })).resolves.toBe(void 0);
    });

    it('should have .onTestStart, which updates context.testSummary if called', async () => {
      const testSummary = testSummaries.running();
      await plugin.onTestStart(testSummary);
      expect(plugin.context.testSummary).toBe(testSummary);
    });

    it('should have .onTestDone, which updates context.testSummary if called', async () => {
      const testSummary = testSummaries.failed();
      await plugin.onTestDone(testSummary);
      expect(plugin.context.testSummary).toBe(testSummary);
    });

    it('should have .onSuiteStart, which updates context.suite if called', async () => {
      const suite = testSuite.mock();
      await plugin.onSuiteStart(suite);
      expect(plugin.context.suite).toBe(suite);
    });

    it('should have .onSuiteEnd, which updates context.suite if called', async () => {
      plugin.context.suite = testSuite.mock();
      await plugin.onSuiteEnd();
      expect(plugin.context.suite).toBe(null);
    });

    it('should have .onBeforeCleanup, which resets context.testSummary if called', async () => {
      plugin.context.testSummary = {};
      await plugin.onBeforeCleanup();
      expect(plugin.context.testSummary).toBe(null);
    });

    describe('.onTerminate', () => {
      it('should disable plugin with a reason', async () => {
        plugin.disable = jest.fn();
        await expect(plugin.onTerminate()).resolves.toBe(void 0);
        expect(plugin.disable.mock.calls).toEqual([["it was terminated by SIGINT or SIGTERM"]]);
      });

      it('should replace the other lifecycle hooks with the same noop function', async () => {
        await plugin.onTerminate();

        expect(plugin.onBootDevice).toBe(plugin.onTerminate);
        expect(plugin.onBeforeShutdownDevice).toBe(plugin.onTerminate);
        expect(plugin.onShutdownDevice).toBe(plugin.onTerminate);
        expect(plugin.onBeforeLaunchApp).toBe(plugin.onTerminate);
        expect(plugin.onLaunchApp).toBe(plugin.onTerminate);
        expect(plugin.onBeforeTerminateApp).toBe(plugin.onTerminate);
        expect(plugin.onTerminateApp).toBe(plugin.onTerminate);
        expect(plugin.onTestStart).toBe(plugin.onTerminate);
        expect(plugin.onTestDone).toBe(plugin.onTerminate);
        expect(plugin.onSuiteStart).toBe(plugin.onTerminate);
        expect(plugin.onSuiteEnd).toBe(plugin.onTerminate);
        expect(plugin.onBeforeCleanup).toBe(plugin.onTerminate);
        expect(plugin.onUserAction).toBe(plugin.onTerminate);
      });

      it('should not work after the first call', async () => {
        const realOnTerminate = plugin.onTerminate;
        await plugin.onTerminate();
        expect(plugin.onTerminate).not.toBe(realOnTerminate);

        plugin.disable = jest.fn();
        await plugin.onTerminate();
        expect(plugin.disable).not.toHaveBeenCalled();
      });
    });
  });

  describe('.shouldKeepArtifactOfTest', () => {
    it('should by default have a setting to keep all', () => {
      expect(plugin.keepOnlyFailedTestsArtifacts).toBe(false);
    });

    describe('if should not keep specifically failed test artifacts', () => {
      beforeEach(() => {
        plugin.keepOnlyFailedTestsArtifacts = false;
        plugin.enabled = true;
      });

      it('should return false if it is disabled', () => {
        plugin.enabled = false;
        expect(plugin.shouldKeepArtifactOfTest(testSummaries.running())).toBe(false);
        expect(plugin.shouldKeepArtifactOfTest(testSummaries.passed())).toBe(false);
        expect(plugin.shouldKeepArtifactOfTest(testSummaries.failed())).toBe(false);
      });

      it('should return true for testSummary.status === running', () =>
        expect(plugin.shouldKeepArtifactOfTest(testSummaries.running())).toBe(true));

      it('should return true for testSummary.status === passed', () =>
        expect(plugin.shouldKeepArtifactOfTest(testSummaries.passed())).toBe(true));

      it('should return true for testSummary.status === failed', () =>
        expect(plugin.shouldKeepArtifactOfTest(testSummaries.failed())).toBe(true));
    });

    describe('if should keep only failed test artifacts', () => {
      beforeEach(() => {
        plugin.keepOnlyFailedTestsArtifacts = true;
        plugin.enabled = true;
      });

      it('should return false if it is disabled', () => {
        plugin.enabled = false;
        expect(plugin.shouldKeepArtifactOfTest(testSummaries.running())).toBe(false);
        expect(plugin.shouldKeepArtifactOfTest(testSummaries.passed())).toBe(false);
        expect(plugin.shouldKeepArtifactOfTest(testSummaries.failed())).toBe(false);
      });

      it('should return false for testSummary.status === running', () =>
        expect(plugin.shouldKeepArtifactOfTest(testSummaries.running())).toBe(false));

      it('should return false for testSummary.status === passed', () =>
        expect(plugin.shouldKeepArtifactOfTest(testSummaries.passed())).toBe(false));

      it('should return true for testSummary.status === failed', () =>
        expect(plugin.shouldKeepArtifactOfTest(testSummaries.failed())).toBe(true));
    });
  });
});

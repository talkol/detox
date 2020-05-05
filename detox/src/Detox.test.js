const _ = require('lodash');
const configuration = require('./configuration');
const testSummaries = require('./artifacts/__mocks__/testSummaries.mock');

jest.mock('./utils/logger');
jest.mock('./devices/DriverRegistry');
jest.mock('./artifacts/ArtifactsManager');
jest.mock('./client/Client');
jest.mock('./devices/Device');

jest.mock('./server/DetoxServer', () => {
  const FakeServer = jest.genMockFromModule('./server/DetoxServer');
  return jest.fn().mockImplementation(() => new FakeServer());
});

describe('Detox', () => {
  let detoxConfig;

  let logger;
  let FakeDriverRegistry;
  let Device;
  let Client;
  let DetoxServer;
  let ArtifactsManager;
  let Detox;
  let detox;

  function client() {
    return Client.mock.instances[0];
  }

  function device() {
    return Device.mock.instances[0];
  }

  function artifactsManager() {
    return ArtifactsManager.mock.instances[0];
  }

  beforeEach(async () => {
    detoxConfig = await configuration.composeDetoxConfig({
      configurations: {
        test: {
          type: 'fake.device',
          binaryPath: '/tmp/fake/path',
          device: 'a device',
        },
      },
    });

    logger = require('./utils/logger');
    Device = require('./devices/Device');
    FakeDriverRegistry = require('./devices/DriverRegistry');
    ArtifactsManager = require('./artifacts/ArtifactsManager');
    Client = require('./client/Client');
    DetoxServer = require('./server/DetoxServer');
    Detox = require('./Detox');
  });

  describe('when detox.init() is called', () => {
    let globalMatcher;

    const init = async () => {
      detox = await new Detox(detoxConfig).init();
    };

    beforeEach(() => {
      FakeDriverRegistry.FakeDriver.matchers.globalMatcher = globalMatcher = jest.fn();
    });

    afterEach(() => {
      delete FakeDriverRegistry.FakeDriver.matchers.globalMatcher;

      // cleanup spilled globals after detox.init()
      delete global.device;
      delete global.globalMatcher;
    });

    describe('', () => {
      beforeEach(init);

      it('should create a DetoxServer automatically', () =>
        expect(DetoxServer).toHaveBeenCalledWith({
          port: expect.anything(),
        }));

      it('should create a new Client', () =>
        expect(Client).toHaveBeenCalledWith(expect.objectContaining({
          server: expect.any(String),
          sessionId: expect.any(String),
        })));

      it('should add a non-responsiveness listener to client ', () =>
        expect(client().setNonresponsivenessListener).toHaveBeenCalledWith(
          expect.any(Function)
        ));

      it('should connect a client to the server', () =>
        expect(client().connect).toHaveBeenCalled());

      it('should resolve a device driver from the registry', () =>
        expect(FakeDriverRegistry.default.resolve).toHaveBeenCalledWith(
          detoxConfig.deviceConfig.type,
          {
            client: expect.anything(),
            emitter: expect.anything(),
          }
        ));

      it('should take device driver matchers to Detox', () =>
        expect(detox.globalMatcher).toBe(globalMatcher));

      it('should take device to Detox', () =>
        expect(detox.device).toBe(device()));

      it('should instantiate Device', () =>
        expect(Device).toHaveBeenCalledWith({
          deviceConfig: detoxConfig.deviceConfig,
          emitter: expect.anything(),
          deviceDriver: expect.anything(),
          sessionConfig: expect.anything(),
        }));

      it('should expose device to global', () =>
        expect(global.device).toBe(device()));

      it('should expose device driver matchers to global', () =>
        expect(global.globalMatcher).toBe(globalMatcher));

      it('should create artifacts manager', () =>
        expect(ArtifactsManager).toHaveBeenCalledWith(detoxConfig.artifactsConfig));

      it('should subscribe artifacts manager to device events', () =>
        expect(artifactsManager().subscribeToDeviceEvents).toHaveBeenCalledWith(
          expect.objectContaining({ on: expect.any(Function) })
        ));

      it('should register plugins in the artifacts manager', () =>
        expect(artifactsManager().registerArtifactPlugins).toHaveBeenCalledWith(
          FakeDriverRegistry.FakeDriver.artifactsPlugins
        ));

      it('should prepare the device', () =>
        expect(device().prepare).toHaveBeenCalled());

      it('should reinstall the app', () => {
        expect(device().uninstallApp).toHaveBeenCalled();
        expect(device().installApp).toHaveBeenCalled();
      });

      it('should launch the app', () => {
        expect(device().launchApp).toHaveBeenCalledWith({
          newInstance: true,
        });
      });

      it('should return itself', async () =>
        expect(await detox.init()).toBeInstanceOf(Detox));
    });

    it('should return the same promise on consequent calls', () => {
      detox = new Detox(detoxConfig);

      const initPromise1 = detox.init();
      const initPromise2 = detox.init();

      expect(initPromise1).toBe(initPromise2);
    });

    describe('with sessionConfig.autoStart undefined', () => {
      beforeEach(() => { delete detoxConfig.sessionConfig.autoStart; });
      beforeEach(init);

      it('should not start DetoxServer', () =>
        expect(DetoxServer).not.toHaveBeenCalled());
    });

    describe('with behaviorConfig.init.exposeGlobals = false', () => {
      beforeEach(() => {
        detoxConfig.behaviorConfig.init.exposeGlobals = false;
      });

      beforeEach(init);

      it('should take device driver matchers to Detox', () =>
        expect(detox.globalMatcher).toBe(globalMatcher));

      it('should take device to Detox', () =>
        expect(detox.device).toBe(device()));

      it('should not expose device to globals', () =>
        expect(global.device).toBe(undefined));

      it('should not expose globalMatcher to globals', () =>
        expect(global.globalMatcher).toBe(undefined));
    });

    describe('with behaviorConfig.init.reinstallApp = false', () => {
      beforeEach(() => {
        detoxConfig.behaviorConfig.init.reinstallApp = false;
      });

      beforeEach(init);

      it('should prepare the device', () =>
        expect(device().prepare).toHaveBeenCalled());

      it('should not reinstall the app', () => {
        expect(device().uninstallApp).not.toHaveBeenCalled();
        expect(device().installApp).not.toHaveBeenCalled();
      });

      it('should launch the app', () =>
        expect(device().launchApp).toHaveBeenCalledWith({
          newInstance: true
        }));
    });

    describe('with behaviorConfig.init.launchApp = false', () => {
      beforeEach(() => {
        detoxConfig.behaviorConfig.init.launchApp = false;
      });

      beforeEach(init);

      it('should prepare the device', () =>
        expect(device().prepare).toHaveBeenCalled());

      it('should reinstall the app', () => {
        expect(device().uninstallApp).toHaveBeenCalled();
        expect(device().installApp).toHaveBeenCalled();
      });

      it('should not launch the app', () =>
        expect(device().launchApp).not.toHaveBeenCalled());
    });

    describe('and it gets unresponsiveness', () => {
      let THREAD_DUMP = 'Simulated non-responsiveness';

      beforeEach(init);

      beforeEach(() => {
        const listener = client().setNonresponsivenessListener.mock.calls[0][0];
        listener({ threadDump: THREAD_DUMP });
      });

      it('should log a warning', () =>
        expect(logger.warn).toHaveBeenCalledWith(
          { event: 'APP_NONRESPONSIVE' },
          expect.stringContaining(THREAD_DUMP)
        ));
    });

    describe('and it gets emitter error', () => {
      beforeEach(init);

      it(`should log EMIT_ERROR if the internal emitter throws an error`, async () => {
        const { emitter } = Device.mock.calls[0][0];

        const testError = new Error();
        emitter.on('bootDevice', async () => { throw testError; })
        await emitter.emit('bootDevice', {});

        expect(logger.error).toHaveBeenCalledWith(
          { event: 'EMIT_ERROR', fn: 'bootDevice' },
          expect.stringMatching(/^Caught an exception.*bootDevice/),
          testError
        );
      });
    });
  });

  describe('when detox.beforeEach() is called', () => {
    describe('before detox.init() is called', () => {
      beforeEach(() => {
        detox = new Detox(detoxConfig);
      });

      it('should throw an error', () =>
        expect(detox.beforeEach(testSummaries.running())).rejects.toThrowError(/of null/));
    });

    describe('before detox.init() is finished', () => {
      beforeEach(() => {
        detox = new Detox(detoxConfig);
      });

      it('should throw an error', async () => {
        const initPromise = detox.init();
        await expect(detox.beforeEach(testSummaries.running())).rejects.toThrowError(/Aborted detox.init/);
        await expect(initPromise).rejects.toThrowError(/Aborted detox.init/);
      })
    });

    describe('after detox.init() is finished', () => {
      beforeEach(async () => {
        detox = await new Detox(detoxConfig).init();
        device().launchApp.mockReset();
      });

      it('should validate test summary object', async () => {
        await expect(detox.beforeEach('Test')).rejects.toThrowError(
          /Invalid test summary was passed/
        );
      });

      it('should validate test summary status', async () => {
        await expect(detox.beforeEach({
          ...testSummaries.running(),
          status: undefined,
        })).rejects.toThrowError(/Invalid test summary status/);
      });

      it('should validate test summary status', async () => {
        await expect(detox.beforeEach({
          ...testSummaries.running(),
          status: undefined,
        })).rejects.toThrowError(/Invalid test summary status/);
      });

      describe('with a valid test summary', () => {
        beforeEach(() => detox.beforeEach(testSummaries.running()));

        it('should trace DETOX_BEFORE_EACH event', () =>
          expect(logger.trace).toHaveBeenCalledWith(
            expect.objectContaining({ event: 'DETOX_BEFORE_EACH' }),
            expect.any(String)
          ));

        it('should notify artifacts manager about "testStart', () =>
          expect(artifactsManager().onTestStart).toHaveBeenCalledWith(testSummaries.running()));

        it('should not relaunch app', async () => {
          await detox.beforeEach(testSummaries.running());
          expect(device().launchApp).not.toHaveBeenCalled();
        });

        it('should not dump pending network requests', async () => {
          await detox.beforeEach(testSummaries.running());
          expect(client().dumpPendingRequests).not.toHaveBeenCalled();
        });
      });

      describe('if app has crashed', () => {
        beforeEach(async () => {
          client().getPendingCrashAndReset.mockReturnValueOnce('Simulated crash');
          await detox.beforeEach(testSummaries.running());
        });

        it('should print log message', () =>
          expect(logger.error).toHaveBeenCalledWith(
            { event: 'APP_CRASH' }, expect.any(String)
          ));

        it('should also relaunch app', () =>
          expect(device().launchApp).toHaveBeenCalledWith({ newInstance: true }));
      });
    });
  });

  describe('when detox.afterEach() is called', () => {
    describe('before detox.init() is called', () => {
      beforeEach(() => {
        detox = new Detox(detoxConfig);
      });

      it('should throw an error', () =>
        expect(detox.afterEach(testSummaries.running())).rejects.toThrowError(/of null/));
    });

    describe('before detox.init() is finished', () => {
      beforeEach(() => {
        detox = new Detox(detoxConfig);
      });

      it('should throw an error', async () => {
        const initPromise = detox.init();
        await expect(detox.afterEach(testSummaries.running())).rejects.toThrowError(/Aborted detox.init/);
        await expect(initPromise).rejects.toThrowError(/Aborted detox.init/);
      })
    });

    describe('after detox.init() is finished', () => {
      beforeEach(async () => {
        detox = await new Detox(detoxConfig).init();
        await detox.beforeEach(testSummaries.running());
      });

      it('should validate non-object test summary', () =>
        expect(detox.afterEach()).rejects.toThrowError(/Invalid test summary was passed/));

      it('should validate against invalid test summary status', () =>
        expect(detox.afterEach({})).rejects.toThrowError(/Invalid test summary status/));

      describe('with a passing test summary', () => {
        beforeEach(() => detox.afterEach(testSummaries.passed()));

        it('should trace DETOX_AFTER_EACH event', () =>
          expect(logger.trace).toHaveBeenCalledWith(
            expect.objectContaining({ event: 'DETOX_AFTER_EACH' }),
            expect.any(String)
          ));

        it('should notify artifacts manager about "testDone"', () =>
          expect(artifactsManager().onTestDone).toHaveBeenCalledWith(testSummaries.passed()));
      });

      describe('with a failed test summary (due to failed asseration)', () => {
        beforeEach(() => detox.afterEach(testSummaries.failed()));

        it('should not dump pending network requests', () =>
          expect(client().dumpPendingRequests).not.toHaveBeenCalled());
      });

      describe('with a failed test summary (due to app crash)', () => {
        beforeEach(async () => {
          client().getPendingCrashAndReset.mockReturnValueOnce('Simulated crash');
          await detox.afterEach(testSummaries.failed());
        });

        it('should print log message', () =>
          expect(logger.error).toHaveBeenCalledWith(
            { event: 'APP_CRASH' }, expect.any(String)
          ));

        it('should also relaunch app', () =>
          expect(device().launchApp).toHaveBeenCalledWith({ newInstance: true }));
      });

      describe('with a failed test summary (due to a timeout)', () => {
        beforeEach(() => detox.afterEach(testSummaries.timedOut()));

        it('should dump pending network requests', () =>
          expect(client().dumpPendingRequests).toHaveBeenCalled());
      });
    });
  });

  describe('when detox.cleanup() is called', () => {
    let initPromise;

    const startInit = () => {
      detox = new Detox(detoxConfig);
      initPromise = detox.init();
    };

    describe('before detox.init() has been called', () => {
      it(`should not throw`, async () =>
        await expect(new Detox(detoxConfig).cleanup()).resolves.not.toThrowError());
    });

    describe('before client has connected', () => {
      beforeEach(() => Client.setInfiniteConnect());
      beforeEach(startInit);

      it(`should not throw, but should reject detox.init() promise`, async () => {
        await expect(detox.cleanup()).resolves.not.toThrowError();
        await expect(initPromise).rejects.toThrowError(/Aborted detox.init.*execution/);
      });
    })

    describe('before device has been prepared', () => {
      beforeEach(() => Device.setInfiniteMethod('prepare'));
      beforeEach(startInit);

      it(`should not throw, but should reject detox.init() promise`, async () => {
        await expect(detox.cleanup()).resolves.not.toThrowError();
        await expect(initPromise).rejects.toThrowError(/Aborted detox.init.*execution/);
      });
    });

    describe('before app has been uninstalled', () => {
      beforeEach(() => Device.setInfiniteMethod('uninstallApp'));
      beforeEach(startInit);

      it(`should not throw, but should reject detox.init() promise`, async () => {
        await expect(detox.cleanup()).resolves.not.toThrowError();
        await expect(initPromise).rejects.toThrowError(/Aborted detox.init.*execution/);
      });
    });

    describe('before app has been installed', () => {
      beforeEach(() => Device.setInfiniteMethod('installApp'));
      beforeEach(startInit);

      it(`should not throw, but should reject detox.init() promise`, async () => {
        await expect(detox.cleanup()).resolves.not.toThrowError();
        await expect(initPromise).rejects.toThrowError(/Aborted detox.init.*execution/);
      });
    });

    describe('before app has been launched', () => {
      beforeEach(() => Device.setInfiniteMethod('launchApp'));
      beforeEach(startInit);

      it(`should not throw, but should reject detox.init() promise`, async () => {
        await expect(detox.cleanup()).resolves.not.toThrowError();
        await expect(initPromise).rejects.toThrowError(/Aborted detox.init.*execution/);
      });
    });

    describe('after detox.init()', () => {
      beforeEach(async () => {
        detox = new Detox(detoxConfig);
        await detox.init();
        await detox.cleanup();
      });

      it(`should not shutdown the device`, () =>
        expect(device().shutdown).not.toHaveBeenCalled());

      it(`should trigger artifactsManager.onBeforeCleanup()`, () =>
        expect(artifactsManager().onBeforeCleanup).toHaveBeenCalled());

      it(`should dump pending network requests`, () =>
        expect(client().dumpPendingRequests).toHaveBeenCalled());
    });

    describe('when behaviorConfig.cleanup.shutdownDevice = true', () => {
      beforeEach(async () => {
        detoxConfig.behaviorConfig.cleanup.shutdownDevice = true;
        detox = await new Detox(detoxConfig).init();
      });

      it(`should shutdown the device on detox.cleanup()`, async () => {
        await detox.cleanup();
        expect(device().shutdown).toHaveBeenCalled();
      });
    });
  });

  describe('when detox.suiteStart() is called', () => {
    beforeEach(async () => {
      detox = await new Detox(detoxConfig).init();
    });

    it(`should pass suite info to artifactsManager.onSuiteStart`, async () => {
      const suite = { name: 'testSuiteName' };
      await detox.suiteStart(suite);
      expect(artifactsManager().onSuiteStart).toHaveBeenCalledWith(suite);
    });
  });

  describe('when detox.suiteEnd() is called', () => {
    beforeEach(async () => {
      detox = await new Detox(detoxConfig).init();
    });

    it(`should pass suite info to artifactsManager.onSuiteStart`, async () => {
      const suite = { name: 'testSuiteName' };
      await detox.suiteEnd(suite);
      expect(artifactsManager().onSuiteEnd).toHaveBeenCalledWith(suite);
    });
  });
});

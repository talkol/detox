const _ = require('lodash');
const schemes = require('./configurations.mock');

describe('configuration', () => {
  let configuration;
  beforeEach(() => {
    configuration = require('./configuration');
  });

  it(`generate a default config`, async () => {
    const config = await configuration.defaultSession();
    expect(() => config.session.server).toBeDefined();
    expect(() => config.session.sessionId).toBeDefined();
  });

  it(`providing a valid config`, () => {
    expect(() => configuration.validateSession(schemes.validOneDeviceAndSession.session)).not.toThrow();
  });

  it(`providing empty server config should throw`, () => {
    testFaultySession();
  });

  it(`providing server config with no session should throw`, () => {
    testFaultySession(schemes.validOneDeviceNoSession.session);
  });

  it(`providing server config with no session.server should throw`, () => {
    testFaultySession(schemes.invalidSessionNoServer.session);
  });

  it(`providing server config with no session.sessionId should throw`, () => {
    testFaultySession(schemes.invalidSessionNoSessionId.session);
  });

  describe("externally invoked errors", () => {
    it(`should throw appName missing error`, () => {
      try {
        configuration.throwOnEmptyName();
        fail("No error thrown");
      } catch (ex) {
        expect(ex).toBeDefined();
      }
    });

    it(`should throw empty build path error`, () => {
      try {
        configuration.throwOnEmptyBinaryPath();
        fail("No error thrown");
      } catch (ex) {
        expect(ex).toBeDefined();
      }
    });
  });

  function testFaultySession(config) {
    try {
      configuration.validateSession(config);
    } catch (ex) {
      expect(ex).toBeDefined();
    }
  }
});

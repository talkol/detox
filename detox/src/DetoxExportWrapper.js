const _ = require('lodash');
const funpermaproxy = require('funpermaproxy');
const Detox = require('./Detox');
const DetoxConstants = require('./DetoxConstants');
const log = require('./utils/logger').child({ __filename });
const configuration = require('./configuration');

const _detox = Symbol('detox');

class DetoxExportWrapper {
  constructor() {
    this[_detox] = Detox.none;

    this.init = this.init.bind(this);
    this.cleanup = this.cleanup.bind(this);

    this.DetoxConstants = DetoxConstants;

    this._definePassthroughMethod('beforeEach');
    this._definePassthroughMethod('afterEach');
    this._definePassthroughMethod('suiteStart');
    this._definePassthroughMethod('suiteEnd');

    this._definePassthroughMethod('element');
    this._definePassthroughMethod('expect');
    this._definePassthroughMethod('waitFor');

    this._defineProxy('by');
    this._defineProxy('device');
  }

  async init(config, params) {
    if (!params || params.initGlobals !== false) {
      Detox.none.initContext(global);
    }

    Detox.none.setError(null);

    try {
      const resolvedConfig = await configuration.composeDetoxConfig(config, params);
      this[_detox] = new Detox(resolvedConfig);
      await this[_detox].init(params);
    } catch (err) {
      Detox.none.setError(err);

      log.error({ event: 'DETOX_INIT_ERROR' }, '\n', err);
      throw err;
    }

    return this[_detox];
  }

  async cleanup() {
    Detox.none.cleanupContext(global);

    if (this[_detox] !== Detox.none) {
      await this[_detox].cleanup();
      this[_detox] = Detox.none;
    }
  }

  _definePassthroughMethod(name) {
    this[name] = (...args) => {
      return this[_detox][name](...args);
    };
  }

  _defineProxy(name) {
    this[name] = funpermaproxy(() => this[_detox][name]);
  }
}

module.exports = DetoxExportWrapper;

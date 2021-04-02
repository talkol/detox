const _ = require('lodash');
const util = require('util');
const { deserializeError } = require('serialize-error');
const AsyncWebSocket = require('./AsyncWebSocket');
const actions = require('./actions/actions');
const Deferred = require('../utils/Deferred');
const DetoxInvariantError = require('../errors/DetoxInvariantError');
const DetoxRuntimeError = require('../errors/DetoxRuntimeError');
const failedToReachTheApp = require('../errors/longreads/failedToReachTheApp');
const log = require('../utils/logger');
const { asError, createErrorWithUserStack, replaceErrorStack } = require('../utils/errorUtils');

class Client {
  /**
   * @param {number} debugSynchronization
   * @param {string} server
   * @param {string} sessionId
   */
  constructor({ debugSynchronization, server, sessionId  }) {
    this._onAppConnected = this._onAppConnected.bind(this);
    this._onAppReady = this._onAppReady.bind(this);
    this._onAppUnresponsive = this._onAppUnresponsive.bind(this);
    this._onBeforeAppCrash = this._onBeforeAppCrash.bind(this);
    this._onAppDisconnected = this._onAppDisconnected.bind(this);
    this._onUnhandledServerError = this._onUnhandledServerError.bind(this);

    this._sessionId = sessionId;
    this._slowInvocationTimeout = debugSynchronization;
    this._slowInvocationStatusHandle = null;
    this._whenAppIsConnected = new Deferred();
    this._whenAppIsReady = new Deferred();
    this._isCleaningUp = false;
    this._isWaitingForAppConnect = false;
    this._pendingAppCrash = null;
    this._appTerminationHandle = null;

    this._successfulTestRun = true; // flag for cleanup
    this._asyncWebSocket = new AsyncWebSocket(server);
    this._serverUrl = server;

    this.setEventCallback('appConnected', this._onAppConnected);
    this.setEventCallback('ready', this._onAppReady);
    this.setEventCallback('AppNonresponsiveDetected', this._onAppUnresponsive);
    this.setEventCallback('AppWillTerminateWithError', this._onBeforeAppCrash);
    this.setEventCallback('appDisconnected', this._onAppDisconnected);
    this.setEventCallback('serverError', this._onUnhandledServerError);
  }

  /**
   * Tells whether the DetoxManager (from native side) is connected to Detox server.
   * In other words, if we can communicate with the app and send actions to it.
   *
   * @returns {boolean}
   */
  get isConnected() {
    return this._asyncWebSocket.isOpen && this._whenAppIsConnected.isResolved();
  }

  get serverUrl() {
    return this._serverUrl;
  }

  async connect() {
    await this._asyncWebSocket.open();
    const sessionStatus = await this.sendAction(new actions.Login(this._sessionId));
    if (sessionStatus.appConnected) {
      this._whenAppIsConnected.resolve();
    }
  }

  async cleanup() {
    this._isCleaningUp = true;
    this._unscheduleSlowInvocationQuery();

    try {
      if (this.isConnected) {
        await this.sendAction(new actions.Cleanup(this._successfulTestRun));

        this._whenAppIsConnected = new Deferred();
        this._whenAppIsReady = new Deferred();
      }
    } finally {
      await this._asyncWebSocket.close();
    }

    delete this.terminateApp; // property injection
  }

  setEventCallback(event, callback) {
    this._asyncWebSocket.setEventCallback(event, callback);
  }

  dumpPendingRequests({testName} = {}) {
    if (this._isWaitingForAppConnect) {
      const unreachableError = failedToReachTheApp.evenThoughAppWasLaunched();
      log.error({ event: 'APP_UNREACHABLE' }, DetoxRuntimeError.format(unreachableError) + '\n\n');
    }

    const messages = _.values(this._asyncWebSocket.inFlightPromises)
      .map(p => p.message)
      .filter(m => m && m.type !== 'currentStatus');

    if (_.isEmpty(messages)) {
      return;
    }

    let dump = 'The app has not responded to the network requests below:';
    for (const msg of messages) {
      dump += `\n  (id = ${msg.messageId}) ${msg.type}: ${JSON.stringify(msg.params)}`;
    }

    const notice = testName
      ? `That might be the reason why the test "${testName}" has timed out.`
      : `Unresponded network requests might result in timeout errors in Detox tests.`;

    dump += `\n\n${notice}\n`;

    log.warn({ event: 'PENDING_REQUESTS'}, dump);
    this._asyncWebSocket.resetInFlightPromises();
  }

  async execute(invocation) {
    if (typeof invocation === 'function') {
      invocation = invocation();
    }

    try {
      return await this.sendAction(new actions.Invoke(invocation));
    } catch (err) {
      this._successfulTestRun = false;
      throw err;
    }
  }

  async sendAction(action) {
    const options = this._inferSendOptions(action);

    return await ((options.queryStatus)
      ? this._sendMonitoredAction(action)
      : this._doSendAction(action))
  }

  _inferSendOptions(action) {
    if (action instanceof actions.CurrentStatus) {
      return { queryStatus: false };
    }

    if (action instanceof actions.Login) {
      return { queryStatus: false };
    }

    return { queryStatus: true };
  }

  async _sendMonitoredAction(action) {
    try {
      this._scheduleSlowInvocationQuery();
      return await this._doSendAction(action);
    } finally {
      this._unscheduleSlowInvocationQuery();
    }
  }

  async _doSendAction(action) {
    const errorWithUserStack = createErrorWithUserStack();

    try {
      const parsedResponse = await this._asyncWebSocket.send(action);
      if (parsedResponse && parsedResponse.type === 'serverError') {
        throw deserializeError(parsedResponse.params.error);
      }

      return await action.handle(parsedResponse);
    } catch (err) {
      throw replaceErrorStack(errorWithUserStack, asError(err));
    }
  }

  async reloadReactNative() {
    this._whenAppIsReady = new Deferred();
    await this.sendAction(new actions.ReloadReactNative());
    this._whenAppIsReady.resolve();
  }

  async waitUntilReady() {
    this._isWaitingForAppConnect = true;

    try {
      await this._whenAppIsConnected.promise;
    } finally {
      this._isWaitingForAppConnect = false;
    }

    // TODO: optimize traffic (!) - we can just listen for 'ready' event
    // if app always sends it upon load completion. Then this will suffice:
    // await this._whenAppIsReady.promise;

    if (!this._whenAppIsReady.isResolved()) {
      await this.sendAction(new actions.Ready());
      this._whenAppIsReady.resolve();
    }
  }

  async waitForBackground() {
    await this.sendAction(new actions.WaitForBackground());
  }

  async waitForActive() {
    await this.sendAction(new actions.WaitForActive());
  }

  async captureViewHierarchy({ viewHierarchyURL }) {
    return await this.sendAction(new actions.CaptureViewHierarchy({
      viewHierarchyURL
    }));
  }

  async currentStatus() {
    return await this.sendAction(new actions.CurrentStatus());
  }

  async setSyncSettings(params) {
    await this.sendAction(new actions.SetSyncSettings(params));
  }

  async shake() {
    await this.sendAction(new actions.Shake());
  }

  async setOrientation(orientation) {
    await this.sendAction(new actions.SetOrientation(orientation));
  }

  async startInstrumentsRecording({ recordingPath, samplingInterval }) {
    await this.sendAction(new actions.SetInstrumentsRecordingState({
      recordingPath, samplingInterval
    }));
  }

  async stopInstrumentsRecording() {
    await this.sendAction(new actions.SetInstrumentsRecordingState());
  }

  async deliverPayload(params) {
    await this.sendAction(new actions.DeliverPayload(params));
  }

  async terminateApp() {
    /* see the property injection from Detox.js */
  }

  _scheduleSlowInvocationQuery() {
    if (this._slowInvocationTimeout > 0 && !this._isCleaningUp) {
      this._slowInvocationStatusHandle = setTimeout(async () => {
        let status;

        try {
          status = await this.sendAction(new actions.CurrentStatus());
          log.info({ event: 'APP_STATUS' }, status);
        } catch (_e) {
          log.debug({ event: 'APP_STATUS' }, 'Failed to execute the current status query.');
          this._slowInvocationStatusHandle = null;
        }

        if (status) {
          this._scheduleSlowInvocationQuery();
        }
      }, this._slowInvocationTimeout);
    } else {
      this._slowInvocationStatusHandle = null;
    }
  }

  _unscheduleSlowInvocationQuery() {
    if (this._slowInvocationStatusHandle) {
      clearTimeout(this._slowInvocationStatusHandle);
      this._slowInvocationStatusHandle = null;
    }
  }

  _scheduleAppTermination() {
    this._appTerminationHandle = setTimeout(async () => {
      try {
        await this.terminateApp();
      } catch (e) {
        log.error({ __filename, event: 'ERROR' }, DetoxRuntimeError.format(e));
      }
    }, 5000);
  }

  _unscheduleAppTermination() {
    if (this._appTerminationHandle) {
      clearTimeout(this._appTerminationHandle);
      this._appTerminationHandle = null;
    }
  }

  _onAppConnected() {
    this._whenAppIsConnected.resolve();
  }

  _onAppReady() {
    this._whenAppIsReady.resolve();
  }

  _onAppUnresponsive({ params }) {
    const message = [
      'Application nonresponsiveness detected!',
      'On Android, this could imply an ANR alert, which evidently causes tests to fail.',
      'Here\'s the native main-thread stacktrace from the device, to help you out (refer to device logs for the complete thread dump):',
      params.threadDump,
      'Refer to https://developer.android.com/training/articles/perf-anr for further details.'
    ].join('\n');

    log.warn({ event: 'APP_NONRESPONSIVE' }, message);
  }

  _onBeforeAppCrash({ params }) {
    this._pendingAppCrash = new DetoxRuntimeError({
      message: 'The app has crashed, see the details below:',
      debugInfo: params.errorDetails,
    });

    this._unscheduleSlowInvocationQuery();
    this._whenAppIsConnected = new Deferred();
    this._whenAppIsReady = new Deferred();
    this._scheduleAppTermination();
  }

  _onAppDisconnected() {
    this._unscheduleSlowInvocationQuery();
    this._unscheduleAppTermination();
    this._whenAppIsConnected = new Deferred();
    this._whenAppIsReady = new Deferred();

    if (this._pendingAppCrash) {
      this._asyncWebSocket.rejectAll(this._pendingAppCrash);
      this._pendingAppCrash = null;
    } else {
      this._asyncWebSocket.rejectAll(new DetoxRuntimeError('The app has unexpectedly disconnected from Detox server.'));
    }
  }

  _onUnhandledServerError(message) {
    const { params } = message;
    if (!params || !params.error) {
      const err = new DetoxInvariantError('Received an empty error message from Detox Server:\n' + util.inspect(message));
      log.error({ __filename, event: 'ERROR' }, err.toString());
    } else {
      log.error({ __filename, event: 'ERROR' }, deserializeError(params.error).message);
    }
  }
}

module.exports = Client;

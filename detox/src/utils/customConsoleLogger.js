const util = require('util');
const path = require('path');
const callsites = require('./callsites');

const USER_STACK_FRAME_INDEX = 2;

function getStackDump() {
  return callsites.stackdump(USER_STACK_FRAME_INDEX);
}

function getOrigin() {
  const userCallsite = callsites()[USER_STACK_FRAME_INDEX];
  const callsiteFilename = userCallsite && userCallsite.getFileName();
  const callsiteLine = userCallsite && userCallsite.getLineNumber();
  const callsiteCol = userCallsite && userCallsite.getColumnNumber();
  const filename = callsiteFilename ? path.relative(process.cwd(), callsiteFilename) : '<unknown>';
  return `at ${filename}:${callsiteLine || '?'}:${callsiteCol || '?'}`;
}

function override(console, method, bunyanLoggerFn) {
  if (method === 'trace') {
    console.trace = proxyTracing(bunyanLoggerFn);
  } else if (method === 'assert') {
    console.assert = proxyAssert(bunyanLoggerFn);
  } else {
    console[method] = proxyLog(bunyanLoggerFn);
  }
}

function proxyLog(bunyanLoggerFn) {
  return (...args) => {
    bunyanLoggerFn({ event: 'USER_LOG' }, getOrigin(), '\n', util.format(...args));
  };
}

function proxyTracing(bunyanLoggerFn) {
  return (...args) => {
    bunyanLoggerFn({ event: 'USER_LOG' }, getOrigin(), '\n  Trace:', util.format(...args), '\n\r' + getStackDump());
  };
}

function proxyAssert(bunyanLoggerFn) {
  return (condition, ...args) => {
    condition || bunyanLoggerFn({ event: 'USER_LOG' }, getOrigin(), '\n  AssertionError:', util.format(...args));
  };
}

function overrideConsoleMethods(console, bunyanLogger) {
  if (!console.__detox_log__) {
    const log = bunyanLogger;

    override(console, 'log', log.info.bind(log));
    override(console, 'warn', log.warn.bind(log));
    override(console, 'trace', log.info.bind(log));
    override(console, 'error', log.error.bind(log));
    override(console, 'debug', log.debug.bind(log));
    override(console, 'assert', log.error.bind(log));

    console.__detox_log__ = log;
  }

  return console;
}

module.exports = {
  overrideConsoleMethods,
};

const log = require('npmlog');
const retry = require('../utils/retry');
const exec = require('child-process-promise').exec;

let _operationCounter = 0;

/**

 */
async function execWithRetriesAndLogs(bin, options, statusLogs, retries = 10, interval = 1000) {
  _operationCounter++;

  let cmd;
  if (options) {
    cmd = `${options.prefix ? options.prefix + ' && ' : ''}${bin} ${options.args}`;
  } else {
    cmd = bin;
  }

  log.verbose(`${_operationCounter}: ${cmd}`);

  let result;

  try {
    await retry({retries, interval}, async () => {
      if (statusLogs && statusLogs.trying) {
        log.info(`${_operationCounter}: ${statusLogs.trying}`);
      }
      result = await exec(cmd);
    });
  } catch (ex) {
    log.error(`${_operationCounter}: ${ex.stderr.trim()}, exited with code ${ex.code}`);
  }

  if (result === undefined) {
    throw new Error(`${_operationCounter}: running "${cmd}" returned undefined`);
  }

  if (result.stdout) {
    log.verbose(`${_operationCounter}: stdout: ${result.stdout}`);
  }

  if (statusLogs && statusLogs.successful) {
    log.info(`${_operationCounter}: ${statusLogs.successful}`);
  }

  //if (result.childProcess.exitCode !== 0) {
  //  log.error(`${_operationCounter}: stdout:`, result.stdout);
  //  log.error(`${_operationCounter}: stderr:`, result.stderr);
  //}

  /* istanbul ignore next */
  if (process.platform === 'win32') {
    if (result.stdout) {
      result.stdout = result.stdout.replace(/\r\n/g, '\n');
    }
    if (result.stderr) {
      result.stderr = result.stderr.replace(/\r\n/g, '\n');
    }
  }

  return result;
}

module.exports = {
  execWithRetriesAndLogs
};


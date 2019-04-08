const _ = require('lodash');
const fs = require('fs-extra');
const log = require('../../../utils/logger').child({ __filename });
const sleep = require('../../../utils/sleep');
const { Tail } = require('tail');
const Artifact = require('../../templates/artifact/Artifact');

class SimulatorLogRecording extends Artifact {
  constructor({
    logStderr,
    logStdout,
    readFromBeginning,
    temporaryLogPath,
  }) {
    super();

    this._readFromBeginning = readFromBeginning;
    this._logPath = temporaryLogPath;
    this._stdoutPath = logStdout;
    this._stderrPath = logStderr;

    this._logStream = null;
    this._stdoutTail = null;
    this._stderrTail = null;

    this._beforeUnwatch = null;
    this._beforeClose = null;
  }

  async doStart({ readFromBeginning } = {}) {
    if (readFromBeginning !== void 0) {
      this._readFromBeginning = readFromBeginning;
    }

    this._logStream = this._logStream || this._openWriteableStream();
    this._stdoutTail = await this._createTail(this._stdoutPath, 'stdout');
    this._stderrTail = await this._createTail(this._stderrPath, 'stderr');
    this._beforeUnwatch = sleep(200); // HACK: experimental value that ensures saving all lines from tail
  }

  async doStop() {
    await this._unwatch();
    this._beforeClose = sleep(100); // HACK: works around the Tail bug - it emits lines even after unwatch
  }

  async doSave(artifactPath) {
    await this._closeWriteableStream();
    await Artifact.moveTemporaryFile(log, this._logPath, artifactPath);
  }

  async doDiscard() {
    await this._closeWriteableStream();
    await fs.remove(this._logPath);
  }

  _openWriteableStream() {
    log.trace({ event: 'CREATE_STREAM '}, `creating append-only stream to: ${this._logPath}`);
    return fs.createWriteStream(this._logPath, { flags: 'a' });
  }

  async _unwatch() {
    await this._beforeUnwatch;
    await Promise.all([this._unwatchTail('stdout'), this._unwatchTail('stderr')]);
  }

  async _unwatchTail(stdxxx) {
    const stdTail = `_${stdxxx}Tail`;
    const logPath = this[`_${stdxxx}Path`];
    const tail = this[stdTail];

    if (tail) {
      log.trace({ event: 'TAIL_UNWATCH' }, `unwatching ${stdxxx} log: ${logPath}`);

      await new Promise((resolve, reject) => {
        try {
          tail.watcher.on('close', resolve);
          tail.watcher.on('error', reject);
          tail.unwatch();
        } catch (e) {
          reject(e);
        }
      });
    }

    this[stdTail] = null;
  }

  async _closeWriteableStream() {
    log.trace({ event: 'CLOSING_STREAM '}, `closing stream to: ${this._logPath}`);

    const stream = this._logStream;
    this._logStream = null;
    await this._beforeClose;
    await new Promise(resolve => stream.end(resolve));
  }

  async _createTail(file, prefix) {
    if (!fs.existsSync(file)) {
      log.warn({ event: 'LOG_MISSING' }, `simulator ${prefix} log is missing at path: ${file}`);
      return null;
    }

    log.trace({ event: 'TAIL_CREATE' }, `starting to watch ${prefix} log: ${file}`);

    const tail = new Tail(file, {
      fromBeginning: this._readFromBeginning,
      logger: {
        info: _.noop,
        error: (...args) => {
          debugger;
          !fs.existsSync(file);
          return log.error({ event: 'TAIL_ERROR' }, ...args);
        },
      },
    }).on('line', (line) => {
      this._appendLine(prefix, line);
    });

    return tail;
  }

  _appendLine(prefix, line) {
    if (this._logStream) {
      this._logStream.write(prefix);
      this._logStream.write(': ');
      this._logStream.write(line);
      this._logStream.write('\n');
    } else {
      log.warn({ event: 'LOG_WRITE_ERROR' }, 'failed to add line to log:\n' + line);
    }
  }
}

module.exports = SimulatorLogRecording;


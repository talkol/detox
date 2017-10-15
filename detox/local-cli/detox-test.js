#!/usr/bin/env node

const program = require('commander');
const path = require('path');
const cp = require('child_process');
program
  .option('-r, --runner [runner]', 'Test runner (currently supports mocha)')
  .option('-o, --runner-config [config]', 'Test runner config file', 'mocha.opts')
  .option('-l, --loglevel [value]', 'info, debug, verbose, silly, wss')
  .option('-c, --configuration [device configuration]', 'Select a device configuration from your defined configurations,'
                                                        + 'if not supplied, and there\'s only one configuration, detox will default to it')
  .option('-r, --reuse', 'Reuse existing installed app (do not delete and re-install) for a faster run.', false)
  .option('-u, --cleanup', 'shutdown simulator when test is over, useful for CI scripts, to make sure detox exists cleanly with no residue', false)
  .option('-d, --debug-synchronization [value]',
    'When an action/expectation takes a significant amount of time use this option to print device synchronization status. '
    + 'The status will be printed if the action takes more than [value]ms to complete')
  .option('-a, --artifacts-location [path]', 'Artifacts destination path (currently will contain only logs). '
                                             + 'If the destination already exists, it will be removed first')
  .parse(process.argv);

const config = require(path.join(process.cwd(), 'package.json')).detox;
const testFolder = config.specs || 'e2e';

let runner = config.runner || 'mocha';

if (program.runner) {
  runner = program.runner;
}

let command;
const {
  configuration,
  loglevel,
  cleanup,
  reuse,
  debugSynchronization,
  artifactsLocation,
} = program;

switch (runner) {
  case 'mocha':
    command = `node_modules/.bin/${runner} ${testFolder} --opts ${testFolder}/${program.runnerConfig}`;
    break;
  case 'jest':
    command = `node_modules/.bin/${runner} ${testFolder} --runInBand`;
    break;
  default:
    throw new Error(`${runner} is not supported in detox cli tools. You can still run your tests with the runner's own cli tool`);
}

console.log(command);
cp.execSync(command, {
  stdio: 'inherit',
  env: {
    ...process.env,
    configuration,
    loglevel,
    cleanup,
    reuse,
    debugSynchronization,
    artifactsLocation,
  },
});

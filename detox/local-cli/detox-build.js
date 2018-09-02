#!/usr/bin/env node

const _ = require('lodash');
const program = require('commander');
const getConfigurationFile = require('../src/utils/getConfigurationFile');
const path = require('path');
const cp = require('child_process');
program.description(`[convenience method] run the command defined in 'configuration.build'`)
  .option('--config-path [configPath]',
    'Select a device config-file path, if not supplied, detox will default to the package.json, and if not found there, detox will fallback to .detoxrc.json')
  .option('-c, --configuration [device configuration]', 'Select a device configuration from your defined configurations,' +
    'if not supplied, and there\'s only one configuration, detox will default to it')
  .parse(process.argv);

const config = getConfigurationFile(program.configPath);  

let buildScript;
if (program.configuration) {
  buildScript = _.result(config, `configurations["${program.configuration}"].build`);
} else if (_.size(config.configurations) === 1) {
  buildScript = _.values(config.configurations)[0].build;
} else {
  throw new Error(`Cannot determine which configuration to use. use --configuration to choose one of the following: 
                      ${Object.keys(config.configurations)}`);
}

if (buildScript) {
  console.log(buildScript);
  cp.execSync(buildScript, {stdio: 'inherit'});
} else {
  throw new Error(`Could not find build script in detox.configurations["${program.configuration}"]`);
}
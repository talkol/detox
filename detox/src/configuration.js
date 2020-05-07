const _ = require('lodash');
const DetoxConfigError = require('./errors/DetoxConfigError');
const uuid = require('./utils/uuid');
const resolveModuleFromPath = require('./utils/resolveModuleFromPath');
const argparse = require('./utils/argparse');
const getPort = require('get-port');
const buildDefaultArtifactsRootDirpath = require('./artifacts/utils/buildDefaultArtifactsRootDirpath');

const TimelineArtifactPlugin = require('./artifacts/timeline/TimelineArtifactPlugin');
const InstrumentsArtifactPlugin = require('./artifacts/instruments/InstrumentsArtifactPlugin');
const LogArtifactPlugin = require('./artifacts/log/LogArtifactPlugin');
const ScreenshotArtifactPlugin = require('./artifacts/screenshot/ScreenshotArtifactPlugin');
const VideoArtifactPlugin = require('./artifacts/video/VideoArtifactPlugin');
const ArtifactPathBuilder = require('./artifacts/utils/ArtifactPathBuilder');

function throwOnEmptyDevice() {
  throw new DetoxConfigError(`'device' property is empty, should hold the device query to run on (e.g. { "type": "iPhone 11 Pro" }, { "avdName": "Nexus_5X_API_29" })`);
}

function throwOnEmptyType() {
  throw new DetoxConfigError(`'type' property is missing, should hold the device type to test on (e.g. "ios.simulator" or "android.emulator")`);
}

function throwOnEmptyBinaryPath() {
  throw new DetoxConfigError(`'binaryPath' property is missing, should hold the app binary path`);
}

function composeBehaviorConfig({ detoxConfig, deviceConfig, userParams }) {
  return _.defaultsDeep(
    {
      init: {
        reinstallApp: argparse.getArgValue('reuse') ? false : undefined,
      },
      cleanup: {
        shutdownDevice: argparse.getArgValue('cleanup') ? true : undefined,
      },
    },
    userParams && {
      init: {
        exposeGlobals: userParams.initGlobals,
        launchApp: userParams.launchApp,
        reinstallApp: !userParams.reuse,
      },
    },
    deviceConfig.behavior,
    detoxConfig.behavior,
    {
      init: {
        exposeGlobals: true,
        reinstallApp: true,
        launchApp: true,
      },
      cleanup: {
        shutdownDevice: false,
      },
    }
  );
}

async function composeSessionConfig({ detoxConfig, deviceConfig }) {
  const session = deviceConfig.session || detoxConfig.session || {
    autoStart: true,
    server: `ws://localhost:${await getPort()}`,
    sessionId: uuid.UUID(),
  };

  if (!session.server) {
    throw new Error(`session.server property is missing, should hold the server address`);
  }

  if (!session.sessionId) {
    throw new Error(`session.sessionId property is missing, should hold the server session id`);
  }

  return session;
}

async function composeDetoxConfig(detoxConfig, userParams, cliConfig = getArtifactsCliConfig()) {
  if (!detoxConfig) {
    throw new Error(`No configuration was passed to detox, make sure you pass a detoxConfig when calling 'detox.init(detoxConfig)'`);
  }

  const deviceConfig = composeDeviceConfig(detoxConfig);
  const configurationName = _.findKey(detoxConfig.configurations, (config) => {
    return config === deviceConfig;
  });

  const artifactsConfig = composeArtifactsConfig({
    configurationName,
    detoxConfig,
    deviceConfig,
    cliConfig,
  });

  const behaviorConfig = composeBehaviorConfig({
    detoxConfig,
    deviceConfig,
    userParams,
  });

  const sessionConfig = await composeSessionConfig({
    detoxConfig,
    deviceConfig,
  });

  return {
    artifactsConfig,
    behaviorConfig,
    deviceConfig,
    sessionConfig,
  };
}

function composeDeviceConfig(options) {
  const { configurations, selectedConfiguration } = options;

  if (_.isEmpty(configurations)) {
    throw new Error(`There are no device configurations in the detox config`);
  }

  const configurationName = selectedConfiguration || argparse.getArgValue('configuration');
  const deviceOverride = argparse.getArgValue('device-name');

  const deviceConfig = (!configurationName && _.size(configurations) === 1)
    ? _.values(configurations)[0]
    : configurations[configurationName];

  if (!deviceConfig) {
    throw new Error(`Cannot determine which configuration to use. use --configuration to choose one of the following:
                        ${Object.keys(configurations)}`);
  }

  if (!deviceConfig.type) {
    throwOnEmptyType();
  }

  deviceConfig.device = deviceOverride || deviceConfig.device || deviceConfig.name;
  delete deviceConfig.name;

  if (_.isEmpty(deviceConfig.device)) {
    throwOnEmptyDevice();
  }

  return deviceConfig;
}

function getArtifactsCliConfig() {
  return {
    artifactsLocation: argparse.getArgValue('artifacts-location'),
    recordLogs: argparse.getArgValue('record-logs'),
    takeScreenshots: argparse.getArgValue('take-screenshots'),
    recordVideos: argparse.getArgValue('record-videos'),
    recordPerformance: argparse.getArgValue('record-performance'),
    recordTimeline: argparse.getArgValue('record-timeline'),
  };
}

function composeArtifactsConfig({
  configurationName,
  deviceConfig,
  detoxConfig,
  cliConfig,
}) {
  const artifactsConfig = _.defaultsDeep(
      extendArtifactsConfig({
        rootDir: cliConfig.artifactsLocation,
        plugins: {
          log: cliConfig.recordLogs,
          screenshot: cliConfig.takeScreenshots,
          video: cliConfig.recordVideos,
          instruments: cliConfig.recordPerformance,
          timeline: cliConfig.recordTimeline,
        },
      }),
      extendArtifactsConfig(deviceConfig.artifacts),
      extendArtifactsConfig(detoxConfig.artifacts),
      extendArtifactsConfig({
        rootDir: 'artifacts',
        pathBuilder: null,
        plugins: {
          log: 'none',
          screenshot: 'manual',
          video: 'none',
          instruments: 'none',
          timeline: 'none',
        },
      }),
  );

  artifactsConfig.rootDir = buildDefaultArtifactsRootDirpath(
    configurationName,
    artifactsConfig.rootDir
  );

  artifactsConfig.pathBuilder = resolveArtifactsPathBuilder(artifactsConfig);

  return artifactsConfig;
}

function extendArtifactsConfig(config) {
  const p = config && config.plugins;
  if (!p) {
    return config;
  }

  return {
    ...config,
    plugins: {
      ...config.plugins,
      log: ifString(p.log, LogArtifactPlugin.parseConfig),
      screenshot: ifString(p.screenshot, ScreenshotArtifactPlugin.parseConfig),
      video: ifString(p.video, VideoArtifactPlugin.parseConfig),
      instruments: ifString(p.instruments, InstrumentsArtifactPlugin.parseConfig),
      timeline: ifString(p.timeline, TimelineArtifactPlugin.parseConfig),
    },
  };
}

function ifString(value, mapper) {
  return typeof value === 'string' ? mapper(value) : value;
}

function resolveArtifactsPathBuilder(artifactsConfig) {
  let { rootDir, pathBuilder } = artifactsConfig;

  if (typeof pathBuilder === 'string') {
    pathBuilder = resolveModuleFromPath(pathBuilder);
  }

  if (typeof pathBuilder === 'function') {
    try {
      pathBuilder = pathBuilder({ rootDir });
    } catch (e) {
      pathBuilder = new pathBuilder({ rootDir });
    }
  }

  if (!pathBuilder) {
    pathBuilder = new ArtifactPathBuilder({ rootDir });
  }

  return pathBuilder;
}

module.exports = {
  throwOnEmptyBinaryPath,
  composeArtifactsConfig,
  composeBehaviorConfig,
  composeDeviceConfig,
  composeSessionConfig,
  composeDetoxConfig,
};

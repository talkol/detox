module.exports = {
  "rootDir": "../..",
  "testEnvironment": "./test/e2e/environment.js",
  "testRunner": "./test/node_modules/jest-circus/runner",
  "setupFilesAfterEnv": ['./test/e2e/init-coverage.js'],
  "testTimeout": 120000,
  "reporters": process.env.DISABLE_JUNIT_REPORTER === '1'
    ? ["<rootDir>/runners/jest/streamlineReporter"]
    : ["<rootDir>/runners/jest/streamlineReporter", "<rootDir>/test/node_modules/jest-junit"],
  "verbose": true,
  "bail": false,
  "collectCoverageFrom": [
    "src/**/*.js",
    "!**/__test/**",
    "!**/__mocks__/**",
    "!**/*.mock.js",
    "!**/*.test.js"
  ],
  "coverageProvider": "v8",
  "coverageDirectory": "test/coverage",
  "coverageReporters": [["lcov", {"projectRoot": "../.." }], "html"]
};

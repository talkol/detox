#!/usr/bin/env node

// Javascript for windows support.
if (process.platform === 'darwin') {
    require('child_process').execSync(`${__dirname}/build_framework.ios.sh`, {
        stdio: 'inherit',
    });
}

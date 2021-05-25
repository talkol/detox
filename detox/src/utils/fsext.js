const path = require('path');

const fs = require('fs-extra');

async function getDirectories (rootPath) {
  let files = await fs.readdir(rootPath);
  let dirs = [];
  for (let file of files) {
    let pathString = path.resolve(rootPath, file);
    if ((await fs.stat(pathString)).isDirectory()) {
      dirs.push(file);
    }
  }
  return dirs.sort();
}

module.exports = {
  getDirectories
};

const fs = require('node:fs');
const path = require('node:path');

function getJavaScriptFiles(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...getJavaScriptFiles(absolutePath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(absolutePath);
    }
  }

  return files;
}

module.exports = {
  getJavaScriptFiles
};

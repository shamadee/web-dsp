const path = require('path');
const fs = require('fs-extra');

const projectDir = process.cwd();
const libDir = path.join(projectDir, 'node_modules/web-dsp', './lib');

fs.copy(libDir, `${projectDir}/lib`, (err) => {
  if (err) process.stdout.write(err);
});

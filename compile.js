const exec = require('child_process').exec;
const fs = require('fs');  

const compileCommand = getCompileCommand();
exec(compileCommand, (err, stdout, stderr) => {

  if (isWin()) {
    const data = fs.readFileSync('lib/webdsp_c.js', 'utf8');
    const newData = data.replace(/else\{doRun\(\)\}/g, '$&script.dispatchEvent(doneEvent);');
    fs.writeFileSync('lib/webdsp_c.js', newData);
  }
   
  console.log(stdout);
  console.log(stderr);
});

function getCompileCommand() {
  if (isWin()) {
    return 'call cpp/compileWASM.bat';
  } else {
    return '. ./cpp/compileWASM.sh';
  }
}

function isWin() {
  return /^win/.test(process.platform);
}
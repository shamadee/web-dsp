const gulp = require('gulp');
const bs = require('browser-sync').create();
const child = require('child_process');
const exec = require('child_process').exec;

gulp.task('default', ['server', 'recompile', 'browser-sync']);

gulp.task('server', () => {
  let server = child.spawn('node', ['server.js']);
});

gulp.task('recompile', (cb) => {
  exec('. ./compileWASM.sh', (err, stdout, stderr) => {
    // console.log(stdout);
    console.log(stderr);
    cb(err);
    bs.reload();
  });
});

gulp.task('browser-sync', ['recompile'], () => {
  bs.init({
    proxy: 'localhost:3000',
  });
});

gulp.watch('cpp/webdsp.cpp', ['recompile']);

gulp.watch(['demo.js', 'webdsp.js', 'index.html', 'style.css', 'compileWASM.sh'], () => {
  bs.reload();
});

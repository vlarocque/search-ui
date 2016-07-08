'use strict';
const gulp = require('gulp');
const fs = require('fs');
const path = require('path');
const exec = require('./buildUtilities').exec;

gulp.task('install', function (done) {
  if (fs.existsSync(path.resolve('./bin'))) {
    console.log('Sources already compiled : Exiting task');
    done();
  } else {
    exec('npm', ['run', 'build'], undefined, function () {
      exec('npm', ['run', 'minimize'], undefined, function () {
        done();
      })
    })
  }
})

/* eslint-env node */

const { log } = require('@bb-cli/base');
const UglifyJS = require('uglify-js');
const { writeFile, readFile } = require('fs-extra');
const { sizeBeforeAndAfter } = require('./util');

const uglifyJsOptions = {
  warnings: true,
  compress: {
    typeofs: false,
    keep_fnames: true,
    keep_infinity: true,
  },
  mangle: {
    keep_fnames: true,
    reserved: ['exports', 'require'],
  },
  output: {
    max_line_len: false,
  },
};

const uglify = unminified =>
  new Promise((resolve, reject) => {
    const result = UglifyJS.minify(unminified, uglifyJsOptions);
    if (result.error) {
      reject(result.error);
    } else {
      resolve(result.code);
    }
  });

const runUglifyAndSave = filePath =>
  readFile(filePath, 'utf8')
    .then(uglify)
    .then(minified => writeFile(filePath, minified, 'utf8'))
    .catch(error => {
      // just log and swallow errors for now
      log.warn(`Error uglifying ${filePath}: ${error}`);
      return Promise.resolve();
    })
    .then(() => Promise.resolve());

const minifyJs = filePath => sizeBeforeAndAfter(filePath, () => runUglifyAndSave(filePath));

module.exports = {
  minifyJs,
};

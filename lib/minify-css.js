/* eslint-env node */

const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const { log } = require('@bb-cli/base');
const { readFile, writeFile } = require('fs-extra');
const { sizeBeforeAndAfter } = require('./util');

// TODO ensure this is using our browserslist
// TODO can safely skip files that have already been minified?
// TODO sourcemap support?
const postCssProcessor = postcss([autoprefixer, cssnano]);

const runPostcssAndSave = filePath =>
  readFile(filePath, 'utf8')
    .then(unminified => postCssProcessor.process(unminified, { from: filePath, to: filePath }))
    .then(minified => writeFile(filePath, minified, 'utf8'))
    .catch(error => {
      // just log and swallow errors for now
      log.warn(`Error minifying ${filePath}: ${error}`);
      return Promise.resolve();
    })
    .then(() => Promise.resolve());

const minifyCss = filePath => sizeBeforeAndAfter(filePath, () => runPostcssAndSave(filePath));

module.exports = {
  minifyCss,
};

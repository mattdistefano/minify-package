/* eslint-env node */

const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const { readFile, writeFile } = require('fs-extra');
const { sizeBeforeAndAfter } = require('./util');

// TODO ensure this is using our browserslist
// TODO can safely skip files that have already been minified?
// TODO sourcemap support?
const postCssProcessor = postcss([autoprefixer, cssnano]);

const runPostcssAndSave = filePath =>
  readFile(filePath)
    .then(contents => postCssProcessor.process(contents, { from: filePath, to: filePath }))
    .then(minified => writeFile(filePath, minified))
    .then(() => Promise.resolve());

const minifyCss = filePath => sizeBeforeAndAfter(filePath, () => runPostcssAndSave(filePath));

module.exports = {
  minifyCss,
};

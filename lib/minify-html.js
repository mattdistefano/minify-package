/* eslint-env node */

const { log } = require('@bb-cli/base');
const minify = require('html-minifier').minify;
const { writeFile, readFile } = require('fs-extra');
const { sizeBeforeAndAfter } = require('./util');

const htmlMinifierOptions = {
  caseSensitive: true,
  keepClosingSlash: true,
  removeComments: true,
  removeCommentsFromCDATA: true,
  collapseWhitespace: true,
  conservativeCollapse: true,
  collapseInlineTagWhitespace: false,
  quoteCharacter: '"',
  processScripts: ['text/ng-template'],
  ignoreCustomFragments: [/\{\{.*?}}/],
  // maybe handles mustache?
  customAttrSurround: [[/\{\{[#^]\s+\w+\}\}/, /\{\{\/\s+\w+\}\}/]],
  customEventAttributes: [/ng-/],
  removeEmptyAttributes: false,
};

const runHtmlMinifierAndSave = filePath =>
  readFile(filePath, 'utf8')
    .then(unminified => minify(unminified, htmlMinifierOptions))
    .then(minified => writeFile(filePath, minified, 'utf8'))
    .catch(error => {
      // just log and swallow errors for now
      log.warn(`Error minifying ${filePath}: ${error}`);
      return Promise.resolve();
    })
    .then(() => Promise.resolve());

const minifyHtml = filePath => sizeBeforeAndAfter(filePath, () => runHtmlMinifierAndSave(filePath));

module.exports = {
  minifyHtml,
};

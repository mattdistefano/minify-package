/* eslint-env node */

const path = require('path');
const filesize = require('filesize');
const { log } = require('@bb-cli/base');
const globby = require('globby');
const { minifyJs } = require('./minify-js');
const { minifyCss } = require('./minify-css');
const { minifyHtml } = require('./minify-html');
const { minifyJson } = require('./minify-json');

const minifierByExtension = {
  js: minifyJs,
  css: minifyCss,
  html: minifyHtml,
  json: minifyJson,
};

const minifyFile = filePath => {
  log.verbose(`minifying ${filePath}`);

  const extname = path.extname(filePath);

  const minifier = minifierByExtension[extname.slice(1)];

  if (!minifier) {
    throw new Error(`No minifier found for type ${extname}.`);
  }

  return minifier(filePath)
    .then(minificationResult => minificationResult.sizeBefore - minificationResult.sizeAfter)
    .then(byteSavings => {
      log.verbose(`minified ${filePath} saving ${filesize(byteSavings)}`);

      return { type: extname, byteSavings };
    });
};

const minifiableExtensions = Object.keys(minifierByExtension).join('|');

const globDir = dirPath => globby([path.join(dirPath, `**/*.+(${minifiableExtensions})`)]);

const byteSavingsByTypeAccumulator = (prev, curr) => {
  // eslint-disable-next-line no-param-reassign
  prev[curr.type] = (prev[curr.type] || 0) + curr.byteSavings;

  return prev;
};

const minifyDir = dirPath =>
  globDir(dirPath)
    .then(files => Promise.all(files.map(minifyFile)))
    .then(byteSavingsByType => byteSavingsByType.reduce(byteSavingsByTypeAccumulator, {}));

module.exports = {
  minifyDir,
};

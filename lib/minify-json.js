/* eslint-env node */

const { log } = require('@bb-cli/base');
const { writeFile, readFile } = require('fs-extra');
const { sizeBeforeAndAfter } = require('./util');

const runJsonMinifierAndSave = filePath =>
  readFile(filePath, 'utf8')
    .then(unminified => JSON.stringify(JSON.parse(unminified)))
    .then(minified => writeFile(filePath, minified, 'utf8'))
    .catch(error => {
      // just log and swallow errors for now
      log.warn(`Error minifying ${filePath}: ${error}`);
      return Promise.resolve();
    })
    .then(() => Promise.resolve());

const minifyJson = filePath => sizeBeforeAndAfter(filePath, () => runJsonMinifierAndSave(filePath));

module.exports = {
  minifyJson,
};

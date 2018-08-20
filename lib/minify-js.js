/* eslint-env node */

const path = require('path');
const { log } = require('@bb-cli/base');
const UglifyJS = require('uglify-js');
const { writeFile, pathExists } = require('fs-extra');
const { sizeBeforeAndAfter } = require('./util');

const uglifyJsOptions = {
  compress: {
    warnings: false,
  },
  mangle: {
    keepFnames: true,
    except: ['exports', 'require'],
  },
  output: {
    max_line_len: false,
  },
};

const writeOutput = (filePath, uglifyResult) => {
  if (!uglifyResult || !uglifyResult.code) {
    return Promise.resolve();
  }

  const codeWrite = writeFile(filePath, uglifyResult.code, 'utf8');

  const mapWrite = uglifyResult.map
    ? writeFile(`${filePath}.map`, uglifyResult.map, 'utf8')
    : Promise.resolve();

  return Promise.all([codeWrite, mapWrite]);
};

const runUglifyAndSave = filePath =>
  pathExists(`${filePath}.map`)
    .then(hasSourceMap =>
      UglifyJS.minify(filePath, {
        ...uglifyJsOptions,
        // TODO arguably we should just prune the sourcemaps as accuracy is poor anyway when minified
        inSourceMap: hasSourceMap ? `${filePath}.map` : null,
        outSourceMap: `${path.basename(filePath)}.map`,
      })
    )
    .catch(error => {
      // just log and swallow errors for now
      log.warn(`Error uglifying ${filePath}: ${error}`);
      return Promise.resolve();
    })
    .then(result => writeOutput(filePath, result))
    .then(() => Promise.resolve());

const minifyJs = filePath => sizeBeforeAndAfter(filePath, () => runUglifyAndSave(filePath));

module.exports = {
  minifyJs,
};

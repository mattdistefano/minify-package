/* eslint-env node */

const path = require('path');
const filesize = require('filesize');
const { tmp, log } = require('@bb-cli/base');

const { minifyDir } = require('./minify');
const { unZipPackage, reZipPackage } = require('./zip');

// TODO set up proper CLI
const packageZipLocation = process.argv.pop();

const absPackageZipLocation = path.join(process.cwd(), packageZipLocation);

const stringifySavings = totalSavingsByType =>
  Object.keys(totalSavingsByType)
    .map(key => `${key}: ${filesize(totalSavingsByType[key])}`)
    .join(', ');

log.info(`Optimizing ${absPackageZipLocation}`);

tmp
  .dir()
  .then(({ dir }) =>
    unZipPackage(absPackageZipLocation, dir)
      .then(zipDirPaths =>
        minifyDir(dir).then(totalSavingsByType => {
          log.info(`Optimization saved: ${stringifySavings(totalSavingsByType)}`);

          return zipDirPaths;
        })
      )
      .then(zipDirPaths => reZipPackage(zipDirPaths, dir, absPackageZipLocation))
  )
  .then(() => log.info(`${absPackageZipLocation} optimized and ready for import`));

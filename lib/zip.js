/* eslint-env node */

const path = require('path');
const fs = require('fs');
const { log } = require('@bb-cli/base');
const globby = require('globby');
const archiver = require('archiver');
const DecompressZip = require('decompress-zip');
const { batch } = require('./batch');

const dirNameForZip = (zipPath, dirBase) => path.join(dirBase, path.basename(zipPath, '.zip'));

const zipNameForDir = dirPath => `${dirPath.split(path.sep).pop()}.zip`;

const zipDir = (dir, saveAs) =>
  new Promise((resolve, reject) => {
    log.verbose(`Zipping ${dir} to ${saveAs}`);

    const output = fs.createWriteStream(saveAs);
    const archive = archiver('zip');
    output.on('close', () => resolve(saveAs));

    archive.on('error', err => {
      reject(err);
    });

    archive.pipe(output);

    archive.glob('**', {
      dot: true,
      cwd: dir,
    });

    archive.finalize();
  });

const zipFiles = (files, saveAs) =>
  new Promise((resolve, reject) => {
    log.verbose(`Zipping ${files.length} file(s) to ${saveAs}`);

    const output = fs.createWriteStream(saveAs);
    const archive = archiver('zip');
    output.on('close', () => resolve(saveAs));

    archive.on('error', err => {
      reject(err);
    });

    archive.pipe(output);

    files.forEach(filename => {
      archive.file(filename, { name: path.basename(filename) });
    });

    archive.finalize();
  });

const unzipFile = (zipPath, dirPath) => {
  log.verbose(`Unzipping ${zipPath} to ${dirPath}`);

  const unzipper = new DecompressZip(zipPath);
  return new Promise((resolve, reject) => {
    unzipper.on('error', reject);
    unzipper.on('extract', resolve);
    unzipper.extract({ path: dirPath });
  });
};

const unzipFiles = (files, to) =>
  Promise.all(
    files.map(file => {
      const dirName = dirNameForZip(file, to);

      return unzipFile(file, dirName).then(() => dirName);
    })
  );

const unZipPackage = (packagePath, tmpPath) =>
  unzipFile(packagePath, tmpPath)
    .then(() => globby([path.join(tmpPath, '*.zip')]))
    .then(files => unzipFiles(files, tmpPath));

const reZipPackage = (dirPaths, dirBase, saveAs) =>
  batch(dirPaths, dirPath => zipDir(dirPath, path.join(dirBase, zipNameForDir(dirPath))))
    .then(zippedFiles => zipFiles([...zippedFiles, path.join(dirBase, 'manifest.json')], saveAs));

module.exports = {
  unZipPackage,
  reZipPackage,
};

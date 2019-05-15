const { log } = require('@bb-cli/base');

/**
 *
 * @param {string[][]} batches
 * @param {Function} cb
 */
const processBatches = (batches, cb) =>
  batches.reduce(
    (prev, curr, idx) =>
      prev.then(aggregated => {
        log.silly(`Processing batch ${idx}: ${curr[0]} - ${curr[curr.length - 1]}`);

        return Promise.all(curr.map(cb)).then(batchResult => aggregated.concat(batchResult));
      }),
    Promise.resolve([])
  );

/**
 *
 * @param {string[]} files
 * @param {number} batchSize
 * @returns {string[][]}
 */
const batchFiles = (files, batchSize) =>
  files.reduce((prev, curr) => {
    const last = prev[prev.length - 1];

    if (!last || last.length === batchSize) {
      prev.push([curr]);
    } else {
      last.push(curr);
    }
    return prev;
  }, []);

const batch = (files, cb, batchSize = 20) => processBatches(batchFiles(files, batchSize), cb);

module.exports = { batch };

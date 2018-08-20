const { statSync } = require('fs');

const sizeBeforeAndAfter = (filePath, fn) => {
  const sizeBefore = statSync(filePath).size;

  return Promise.resolve(fn()).then(fnResult => {
    const sizeAfter = statSync(filePath).size;

    return {
      sizeBefore,
      sizeAfter,
      file: filePath,
      result: fnResult,
    };
  });
};

module.exports = {
  sizeBeforeAndAfter,
};

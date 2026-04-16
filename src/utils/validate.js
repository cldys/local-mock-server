const REQUIRED_SOURCES = ['body', 'query', 'params'];

function isMissing(value) {
  if (Array.isArray(value)) {
    return value.length === 0 || value.every(isMissing);
  }

  return value === undefined || value === null || value === '';
}

function hasOwnValue(source, field) {
  return Object.prototype.hasOwnProperty.call(source, field) && !isMissing(source[field]);
}

function validateRequired(required = {}, params = {}) {
  const missingFields = [];

  for (const sourceName of REQUIRED_SOURCES) {
    const fields = required[sourceName] || [];
    const source = params[sourceName] || {};

    for (const field of fields) {
      if (!hasOwnValue(source, field)) {
        missingFields.push(field);
      }
    }
  }

  return missingFields;
}

module.exports = {
  isMissing,
  validateRequired
};

function isUnifiedResponse(payload) {
  return Boolean(
    payload &&
      typeof payload === 'object' &&
      Object.prototype.hasOwnProperty.call(payload, 'code') &&
      Object.prototype.hasOwnProperty.call(payload, 'message') &&
      Object.prototype.hasOwnProperty.call(payload, 'data')
  );
}

function buildSuccess(payload) {
  if (isUnifiedResponse(payload)) {
    return payload;
  }

  return {
    code: 0,
    message: 'success',
    data: payload === undefined ? {} : payload
  };
}

function buildError(code, message, data = null) {
  return {
    code,
    message,
    data
  };
}

function sendSuccess(res, payload, statusCode = 200) {
  res.status(statusCode).json(buildSuccess(payload));
}

function sendError(res, code, message, data = null) {
  res.status(code).json(buildError(code, message, data));
}

module.exports = {
  buildError,
  buildSuccess,
  sendError,
  sendSuccess
};

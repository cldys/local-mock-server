function getRequestParams(req) {
  return {
    body: req.body || {},
    query: req.query || {},
    params: req.params || {}
  };
}

module.exports = {
  getRequestParams
};

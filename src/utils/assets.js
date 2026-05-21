const MOCK_ASSETS_PREFIX = '/mock-assets';

function trimSlashes(value) {
  return String(value || '').replace(/^\/+|\/+$/g, '');
}

function getRequestBaseUrl(req) {
  return `${req.protocol}://${req.get('host')}`;
}

function getMockAssetUrl(req, assetPath) {
  return `${getRequestBaseUrl(req)}${MOCK_ASSETS_PREFIX}/${trimSlashes(assetPath)}`;
}

module.exports = {
  MOCK_ASSETS_PREFIX,
  getMockAssetUrl,
  getRequestBaseUrl,
};

const { getRequestParams } = require('../utils/getParams');
const { sendError, sendSuccess } = require('../utils/response');
const { validateRequired } = require('../utils/validate');

const SUPPORTED_METHODS = new Set(['get', 'post', 'put', 'delete', 'patch']);
const REQUIRED_SOURCES = ['body', 'query', 'params'];

function assertRouteConfig(route, index) {
  if (!route || typeof route !== 'object') {
    throw new Error(`Invalid route config at index ${index}`);
  }

  const method = String(route.method || '').toLowerCase();

  if (!SUPPORTED_METHODS.has(method)) {
    throw new Error(`Unsupported mock method "${route.method}" at index ${index}`);
  }

  if (!route.path || typeof route.path !== 'string') {
    throw new Error(`Mock route path is required at index ${index}`);
  }

  if (!Object.prototype.hasOwnProperty.call(route, 'response')) {
    throw new Error(`Mock route response is required for ${method.toUpperCase()} ${route.path}`);
  }

  if (route.required && typeof route.required !== 'object') {
    throw new Error(`Mock route required must be an object for ${method.toUpperCase()} ${route.path}`);
  }

  for (const source of REQUIRED_SOURCES) {
    const fields = route.required && route.required[source];

    if (fields !== undefined && !Array.isArray(fields)) {
      throw new Error(`Mock route required.${source} must be an array for ${method.toUpperCase()} ${route.path}`);
    }
  }
}

function registerRoutes(app, routes) {
  if (!Array.isArray(routes)) {
    throw new Error('Mock routes must be an array');
  }

  const registeredKeys = new Set();

  routes.forEach((route, index) => {
    assertRouteConfig(route, index);

    const method = route.method.toLowerCase();
    const routeKey = `${method.toUpperCase()} ${route.path}`;

    if (registeredKeys.has(routeKey)) {
      throw new Error(`Duplicate mock route: ${routeKey}`);
    }

    registeredKeys.add(routeKey);

    app[method](route.path, (req, res) => {
      const params = getRequestParams(req);
      const missingFields = validateRequired(route.required, params);

      if (missingFields.length > 0) {
        sendError(res, 400, `缺少必填参数: ${missingFields.join(', ')}`);
        return;
      }

      sendSuccess(res, route.response);
    });
  });
}

module.exports = registerRoutes;

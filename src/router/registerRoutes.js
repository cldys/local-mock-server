const { getRequestParams } = require('../utils/getParams');
const { sendError, sendSuccess } = require('../utils/response');
const { validateRequired } = require('../utils/validate');

const SUPPORTED_METHODS = new Set(['get', 'post', 'put', 'delete', 'patch']);
const REQUIRED_SOURCES = ['body', 'query', 'params'];
const MOCK_CONFIG_KEYS = new Set(['default', 'response', 'resolve', 'scenarios']);

function hasOwn(object, field) {
  return Object.prototype.hasOwnProperty.call(object, field);
}

function isPlainObject(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function isMockConfig(value) {
  return isPlainObject(value) && Object.keys(value).some((key) => MOCK_CONFIG_KEYS.has(key));
}

function getScenarioName(req) {
  return req.query.mockScenario || req.query.scenario || req.get('X-Mock-Scenario');
}

function getDefaultResponse(mockConfig) {
  if (hasOwn(mockConfig, 'default')) {
    return mockConfig.default;
  }

  return mockConfig.response;
}

function getRouteRequired(route) {
  if (route.required) {
    return route.required;
  }

  if (isMockConfig(route.mock)) {
    return route.mock.required;
  }

  return undefined;
}

function validateRequiredConfig(required, method, routePath) {
  if (required && typeof required !== 'object') {
    throw new Error(`Mock route required must be an object for ${method.toUpperCase()} ${routePath}`);
  }

  for (const source of REQUIRED_SOURCES) {
    const fields = required && required[source];

    if (fields !== undefined && !Array.isArray(fields)) {
      throw new Error(`Mock route required.${source} must be an array for ${method.toUpperCase()} ${routePath}`);
    }
  }
}

function createScenarioError(route, scenarioName) {
  const error = new Error(`mock场景不存在: ${scenarioName}`);

  error.statusCode = 400;
  error.routePath = route.path;
  return error;
}

async function resolveMaybeFunction(value, req, context) {
  if (typeof value === 'function') {
    return value(req, context);
  }

  return value;
}

async function resolveMockResponse(route, req) {
  const mock = hasOwn(route, 'mock') ? route.mock : route.response;

  if (!isMockConfig(mock)) {
    return resolveMaybeFunction(mock, req, {
      scenarioName: getScenarioName(req),
      route
    });
  }

  const scenarioName = getScenarioName(req);
  const scenarios = mock.scenarios || {};
  const defaultResponse = getDefaultResponse(mock);
  const context = {
    defaultResponse,
    scenarioName,
    scenarios,
    route
  };

  if (typeof mock.resolve === 'function') {
    return mock.resolve.call(mock, req, context);
  }

  if (scenarioName) {
    if (!hasOwn(scenarios, scenarioName)) {
      throw createScenarioError(route, scenarioName);
    }

    return resolveMaybeFunction(scenarios[scenarioName], req, context);
  }

  return resolveMaybeFunction(defaultResponse, req, context);
}

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

  if (!hasOwn(route, 'response') && !hasOwn(route, 'mock')) {
    throw new Error(`Mock route response is required for ${method.toUpperCase()} ${route.path}`);
  }

  validateRequiredConfig(getRouteRequired(route), method, route.path);
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

    app[method](route.path, async (req, res, next) => {
      const params = getRequestParams(req);
      const missingFields = validateRequired(getRouteRequired(route), params);

      if (missingFields.length > 0) {
        sendError(res, 400, `缺少必填参数: ${missingFields.join(', ')}`);
        return;
      }

      try {
        const response = await resolveMockResponse(route, req);

        sendSuccess(res, response);
      } catch (error) {
        if (error.statusCode) {
          sendError(res, error.statusCode, error.message);
          return;
        }

        next(error);
      }
    });
  });
}

module.exports = registerRoutes;

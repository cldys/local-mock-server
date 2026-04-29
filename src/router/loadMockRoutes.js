const fs = require('fs');
const path = require('path');

const MOCK_FILE_SUFFIX = '.mock.js';
const DEFAULT_MOCKS_DIR = path.join(__dirname, '..', 'mocks');
const SUPPORTED_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

function listMockFiles(directory) {
  if (!fs.existsSync(directory)) {
    return [];
  }

  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...listMockFiles(entryPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(MOCK_FILE_SUFFIX)) {
      files.push(entryPath);
    }
  }

  return files.sort();
}

function toRouteSegment(segment) {
  if (segment.startsWith('[') && segment.endsWith(']')) {
    return `:${segment.slice(1, -1)}`;
  }

  if (segment.startsWith('$')) {
    return `:${segment.slice(1)}`;
  }

  return segment;
}

function toRoutePath(methodDirectory, filePath) {
  const relativeParts = path.relative(methodDirectory, filePath).split(path.sep);
  const fileName = relativeParts.pop();
  const routeName = fileName.slice(0, -MOCK_FILE_SUFFIX.length);
  const routeSegments = relativeParts
    .concat(routeName.split('.'))
    .filter(Boolean)
    .map(toRouteSegment)
    .filter((segment) => segment !== 'index');

  return `/${routeSegments.join('/')}`;
}

function getRouteRank(routePath) {
  const segments = routePath.split('/').filter(Boolean);
  const dynamicCount = segments.filter((segment) => segment.startsWith(':')).length;

  return {
    dynamicCount,
    segmentCount: segments.length
  };
}

function sortRoutes(routes) {
  return routes.sort((left, right) => {
    const leftRank = getRouteRank(left.path);
    const rightRank = getRouteRank(right.path);

    return (
      leftRank.dynamicCount - rightRank.dynamicCount ||
      rightRank.segmentCount - leftRank.segmentCount ||
      left.path.localeCompare(right.path)
    );
  });
}

function loadMockRoutes(mocksDirectory = DEFAULT_MOCKS_DIR) {
  const routes = [];

  for (const method of SUPPORTED_METHODS) {
    const methodDirectory = path.join(mocksDirectory, method);
    const mockFiles = listMockFiles(methodDirectory);

    for (const filePath of mockFiles) {
      routes.push({
        method: method.toLowerCase(),
        path: toRoutePath(methodDirectory, filePath),
        mock: require(filePath),
        filePath
      });
    }
  }

  return sortRoutes(routes);
}

module.exports = loadMockRoutes;

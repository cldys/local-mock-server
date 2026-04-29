const express = require('express');
const routes = require('./router');
const registerRoutes = require('./router/registerRoutes');
const { delayEnabled, delayMs, logRequests } = require('./config');
const { sendError, sendSuccess } = require('./utils/response');

const app = express();

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  next();
});

if (logRequests) {
  app.use((req, res, next) => {
    const startedAt = Date.now();

    res.on('finish', () => {
      const cost = Date.now() - startedAt;
      console.log(`[mock] ${req.method} ${req.originalUrl} -> ${res.statusCode} ${cost}ms`);
    });

    next();
  });
}

if (delayEnabled) {
  app.use((req, res, next) => {
    setTimeout(next, delayMs);
  });
}

app.get('/', (req, res) => {
  sendSuccess(res, {
    service: 'local-mock-server',
    status: 'ok',
    apiPrefix: '/api'
  });
});

registerRoutes(app, routes);

app.use((req, res) => {
  sendError(res, 404, 'mock接口不存在');
});

app.use((err, req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    sendError(res, 400, '请求体 JSON 格式错误');
    return;
  }

  console.error('[mock] unexpected error', err);
  sendError(res, 500, 'mock服务异常');
});

module.exports = app;

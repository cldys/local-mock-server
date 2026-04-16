const app = require('./src/app');
const { host, port } = require('./src/config');

const server = app.listen(port, host, () => {
  console.log(`[mock] server running at http://localhost:${port}`);
  console.log(`[mock] listening on ${host}:${port}`);
});

function closeServer(signal) {
  console.log(`[mock] received ${signal}, shutting down`);
  server.close(() => {
    process.exit(0);
  });
}

process.on('SIGINT', () => closeServer('SIGINT'));
process.on('SIGTERM', () => closeServer('SIGTERM'));

module.exports = server;

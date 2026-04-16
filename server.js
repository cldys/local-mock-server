const app = require('./src/app');
const { host, port } = require('./src/config');

const server = app.listen(port, host, () => {
  console.log(`[mock] server running at http://localhost:${port}`);
  console.log(`[mock] listening on ${host}:${port}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`[mock] port ${port} is already in use.`);
    console.error(`[mock] stop the existing mock server or start this one with another port: MOCK_PORT=3100 npm run dev`);
    process.exit(1);
  }

  throw error;
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

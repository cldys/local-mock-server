const DEFAULT_PORT = 3039;
const DEFAULT_HOST = "127.0.0.1";

function toPort(value) {
  const port = Number(value);
  return Number.isInteger(port) && port > 0 ? port : DEFAULT_PORT;
}

module.exports = {
  host: process.env.MOCK_HOST || DEFAULT_HOST,
  port: toPort(process.env.MOCK_PORT || process.env.PORT),
  logRequests: process.env.MOCK_LOG !== "false",
};

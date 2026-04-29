const DEFAULT_PORT = 3039;
const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_DELAY_MS = 1000;

function toPort(value) {
  const port = Number(value);
  return Number.isInteger(port) && port > 0 ? port : DEFAULT_PORT;
}

function toDelayMs(value) {
  const delayMs = Number(value);
  return Number.isInteger(delayMs) && delayMs >= 0 ? delayMs : DEFAULT_DELAY_MS;
}

function isEnabled(value) {
  return value === "true" || value === "1";
}

module.exports = {
  host: process.env.MOCK_HOST || DEFAULT_HOST,
  port: toPort(process.env.MOCK_PORT || process.env.PORT),
  logRequests: process.env.MOCK_LOG !== "false",
  delayEnabled: isEnabled(process.env.MOCK_DELAY),
  delayMs: toDelayMs(process.env.MOCK_DELAY_MS),
};

const pingSuccessData = require('../responses/common/ping.success.json');

module.exports = [
  {
    method: 'get',
    path: '/',
    response: {
      message: 'mock server is running',
      docs: 'use /api/common/ping or other mock endpoints'
    }
  },
  {
    method: 'get',
    path: '/api/common/ping',
    response: pingSuccessData
  }
];

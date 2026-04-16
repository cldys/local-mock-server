const detailSuccessData = require('../responses/order/detail.success.json');
const listSuccessData = require('../responses/order/list.success.json');
const updateSuccessData = require('../responses/order/update.success.json');

module.exports = [
  {
    method: 'get',
    path: '/api/order/list',
    required: {
      query: ['pageNum', 'pageSize']
    },
    response: listSuccessData
  },
  {
    method: 'get',
    path: '/api/order/:id',
    required: {
      params: ['id']
    },
    response: detailSuccessData
  },
  {
    method: 'put',
    path: '/api/order/:id',
    required: {
      params: ['id'],
      body: ['status']
    },
    response: updateSuccessData
  }
];

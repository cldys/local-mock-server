const deleteSuccessData = require('../responses/user/delete.success.json');
const detailSuccessData = require('../responses/user/detail.success.json');
const loginSuccessData = require('../responses/user/login.success.json');
const profileSuccessData = require('../responses/user/profile.success.json');
const updateSuccessData = require('../responses/user/update.success.json');

module.exports = [
  {
    method: 'post',
    path: '/api/user/login',
    required: {
      body: ['username', 'password']
    },
    response: loginSuccessData
  },
  {
    method: 'get',
    path: '/api/user/profile',
    required: {
      query: ['userId']
    },
    response: profileSuccessData
  },
  {
    method: 'get',
    path: '/api/user/:id',
    required: {
      params: ['id']
    },
    response: detailSuccessData
  },
  {
    method: 'patch',
    path: '/api/user/:id',
    required: {
      params: ['id'],
      body: ['name']
    },
    response: updateSuccessData
  },
  {
    method: 'delete',
    path: '/api/user/:id',
    required: {
      params: ['id']
    },
    response: deleteSuccessData
  }
];

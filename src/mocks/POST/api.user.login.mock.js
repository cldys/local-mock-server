module.exports = {
  // Default response for POST /api/user/login.
  default: {
    code: 0,
    message: 'success',
    data: {
      token: 'mock-token-20260416',
      expiresIn: 7200,
      userInfo: {
        id: 1001,
        username: 'demo_user',
        nickname: 'Mock User',
        roles: ['admin']
      }
    }
  },

  // Use ?mockScenario=passwordError or header X-Mock-Scenario: passwordError.
  scenarios: {
    passwordError: {
      code: 401,
      message: '用户名或密码错误',
      data: null
    },
    locked: {
      code: 403,
      message: '账号已冻结',
      data: null
    }
  }
};

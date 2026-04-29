# local-mock-server

一个独立运行的 Node + Express Mock 服务，用于前端本地开发阶段模拟后端接口。

这个项目现在采用约定式 `.mock.js` 文件：目录决定请求方法，文件名决定接口路径，返回值直接写在 mock 文件里。项目不再使用 `.json` 文件保存响应数据。

- 支持 `GET` / `POST` / `PUT` / `DELETE` / `PATCH`
- 新增接口只需要新增一个 `.mock.js` 文件
- `.mock.js` 可以写注释、默认返回、多场景返回和简单动态逻辑
- 默认不校验参数，需要时可在 mock 文件里声明 `required`
- 成功返回自动使用统一格式，已包含 `code/message/data` 的响应会原样返回
- 缺参、未知场景、未匹配接口使用统一错误格式

```text
local-mock-server/
├─ package.json
├─ server.js
├─ src/
│  ├─ app.js
│  ├─ mocks/
│  │  ├─ GET/
│  │  ├─ POST/
│  │  ├─ PUT/
│  │  ├─ DELETE/
│  │  └─ PATCH/
│  ├─ router/
│  │  ├─ index.js
│  │  ├─ loadMockRoutes.js
│  │  └─ registerRoutes.js
│  ├─ utils/
│  │  ├─ getParams.js
│  │  ├─ response.js
│  │  └─ validate.js
│  └─ config/
│     └─ index.js
└─ README.md
```

## 最简单场景

如果后端已经给了完整返回值，可以直接粘到 `.mock.js` 里：

```js
// src/mocks/GET/api.user.profile.mock.js
module.exports = {
  code: 0,
  message: 'success',
  data: {
    id: 1001,
    username: 'demo_user',
    nickname: 'Mock User'
  }
};
```

## 多场景返回

同一个接口需要验证多种情况时，使用 `default` 和 `scenarios`：

```js
// src/mocks/POST/api.user.login.mock.js
module.exports = {
  default: {
    code: 0,
    message: 'success',
    data: {
      token: 'mock-token'
    }
  },

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
```

默认返回：

```bash
curl -X POST http://localhost:3039/api/user/login
```

切换场景：

```bash
curl -X POST "http://localhost:3039/api/user/login?mockScenario=passwordError"
curl -X POST "http://localhost:3039/api/user/login?scenario=locked"
curl -X POST http://localhost:3039/api/user/login -H "X-Mock-Scenario: locked"
```

## 动态返回

需要按请求参数返回不同数据时，可以使用 `resolve(req, context)`：

```js
module.exports = {
  default: {
    code: 0,
    message: 'success',
    data: {
      list: [{ id: 1, name: 'Demo' }]
    }
  },

  scenarios: {
    empty: {
      code: 0,
      message: 'success',
      data: {
        list: []
      }
    }
  },

  resolve(req, { defaultResponse, scenarios }) {
    if (req.query.keyword === 'empty') {
      return scenarios.empty;
    }

    return defaultResponse;
  }
};
```

## 可选参数校验

默认不校验参数。如果某个接口需要模拟缺参错误，可以在 `.mock.js` 里加 `required`：

```js
module.exports = {
  required: {
    body: ['username', 'password'],
    query: ['tenantId'],
    params: ['id']
  },

  default: {
    code: 0,
    message: 'success',
    data: {}
  }
};
```

以下值会被视为缺失：

- `undefined`
- `null`
- 空字符串 `''`
- 空数组 `[]`

## 统一返回格式

如果 mock 返回值已经是：

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

服务会原样返回。

如果 mock 返回值不是统一格式，例如：

```js
module.exports = {
  token: 'mock-token'
};
```

服务会自动包装成：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "token": "mock-token"
  }
}
```

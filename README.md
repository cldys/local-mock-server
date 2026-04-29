# local-mock-server

一个独立运行的 Node + Express Mock 服务，用于前端本地开发阶段模拟后端接口。

这个项目现在采用约定式 `.mock.js` 文件：目录决定请求方法，文件名决定接口路径，返回值直接写在 mock 文件里。项目不再使用 `.json` 文件保存响应数据。

## 特性

- 支持 `GET` / `POST` / `PUT` / `DELETE` / `PATCH`
- 新增接口只需要新增一个 `.mock.js` 文件
- `.mock.js` 可以写注释、默认返回、多场景返回和简单动态逻辑
- 默认不校验参数，需要时可在 mock 文件里声明 `required`
- 成功返回自动使用统一格式，已包含 `code/message/data` 的响应会原样返回
- 缺参、未知场景、未匹配接口使用统一错误格式

## 安装

```bash
npm install
```

## 启动

```bash
npm run dev
```

`dev` 使用普通 Node 启动，不开启文件监听。修改 mock 文件后按 `Ctrl + C` 停止服务，再重新执行 `npm run dev` 即可。

默认启动地址：

```text
http://localhost:3039
```

也可以指定端口：

```bash
MOCK_PORT=3100 npm run dev
```

默认只监听本机 `127.0.0.1`。如果需要让局域网内其他设备访问，可以改成：

```bash
MOCK_HOST=0.0.0.0 npm run dev
```

浏览器里请使用 `localhost`、`127.0.0.1`，或者你的本机局域网 IP 访问服务。

## 项目结构

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

## 文件名规则

每个 mock 文件必须放在 `src/mocks/<METHOD>/` 下，并以 `.mock.js` 结尾。

```text
src/mocks/GET/api.common.ping.mock.js   -> GET /api/common/ping
src/mocks/POST/api.user.login.mock.js   -> POST /api/user/login
src/mocks/GET/api.user.[id].mock.js     -> GET /api/user/:id
src/mocks/PUT/api/order/[id].mock.js    -> PUT /api/order/:id
```

路径参数推荐使用 `[id]` 这种写法，服务启动时会自动转换成 Express 的 `:id`。

## 最简单写法

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

请求：

```bash
curl http://localhost:3039/api/user/profile
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

## 内置示例接口

```text
GET    /api/common/ping
POST   /api/user/login
GET    /api/user/profile
GET    /api/user/:id
PATCH  /api/user/:id
DELETE /api/user/:id
GET    /api/order/list
GET    /api/order/:id
PUT    /api/order/:id
```

## 前端 Vite 代理示例

在前端项目的 `vite.config.js` 中配置：

```js
export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3039',
        changeOrigin: true
      }
    }
  }
};
```

这样前端仍然请求 `/api/user/login`，本地开发阶段会转发到 mock 服务。

## 新增一个接口

新增：

```text
src/mocks/POST/api.order.create.mock.js
```

写入：

```js
module.exports = {
  code: 0,
  message: 'success',
  data: {
    id: 'ORDER-1003',
    created: true
  }
};
```

重启服务后即可请求：

```bash
curl -X POST http://localhost:3039/api/order/create
```

## 调试示例

```bash
curl http://localhost:3039/api/common/ping
curl "http://localhost:3039/api/order/list?mockScenario=empty"
curl -X POST "http://localhost:3039/api/user/login?mockScenario=passwordError"
```

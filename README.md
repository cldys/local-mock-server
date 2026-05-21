# local-mock-server

一个独立运行的 Node + Express Mock 服务，用于前端本地开发阶段模拟后端接口。

这个项目现在采用约定式 `.mock.js` 文件：目录决定请求方法，文件名决定接口路径，返回值直接写在 mock 文件里。项目不再使用 `.json` 文件保存响应数据。

- 支持 `GET` / `POST` / `PUT` / `DELETE` / `PATCH`
- 新增接口只需要新增一个 `.mock.js` 文件
- `.mock.js` 可以写注释、默认返回、多场景返回和简单动态逻辑
- 支持把图片、视频等 mock 资源放到项目内并通过 `/mock-assets` 访问
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
│  │  ├─ assets.js
│  │  ├─ getParams.js
│  │  ├─ response.js
│  │  └─ validate.js
│  └─ config/
│     └─ index.js
├─ public/
│  └─ mock-assets/
│     ├─ images/
│     └─ videos/
└─ README.md
```

## 启动和延迟

默认启动后请求不加延迟：

```bash
npm run dev
```

打开统一 1 秒延迟：

```bash
MOCK_DELAY=true npm run dev
```

如果需要临时改成其他延迟时间，可以设置毫秒数：

```bash
MOCK_DELAY=true MOCK_DELAY_MS=1500 npm run dev
```

`OPTIONS` 预检请求不会被延迟。

## 静态资源

图片、视频等 mock 资源放在 `public/mock-assets/` 下，启动服务后通过 `/mock-assets` 访问。

当前内置了两张图片占位资源和一个视频占位资源：

```text
public/mock-assets/
├─ images/
│  ├─ generation-1.svg
│  └─ generation-2.svg
└─ videos/
   └─ generation-demo.mp4
```

访问地址会跟随当前请求 host 自动生成，例如：

```text
http://localhost:3039/mock-assets/images/generation-1.svg
http://localhost:3039/mock-assets/images/generation-2.svg
http://localhost:3039/mock-assets/videos/generation-demo.mp4
```

如果本地服务使用其他端口或局域网 IP，mock 返回里的资源地址也会自动同步变化。内置视频是 [MDN 的 CC0 示例素材](https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4)，仅用于本地 mock 占位。

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

如果接口需要直接返回原始业务数据，不使用统一响应包装，可以在 mock 配置中声明 `raw: true`：

```js
module.exports = {
  raw: true,
  default: {
    total: 20,
    data: []
  }
};
```

声明后服务会直接返回 `default`、`scenarios` 或 `resolve` 生成的响应内容，不再自动补充 `code`、`message`、`data`。

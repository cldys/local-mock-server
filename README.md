# local-mock-server

一个独立运行的 Node + Express Mock 服务，用于前端本地开发阶段模拟后端接口。

## 特性

- 支持 `GET` / `POST` / `PUT` / `DELETE` / `PATCH`
- 根据请求方法和请求路径匹配接口
- 接口配置按模块拆分
- 响应数据放在独立 JSON 文件中
- 成功时返回固定 demo 数据
- 只校验必填参数是否缺失
- 缺参、未匹配接口使用统一错误格式

## 安装

```bash
npm install
```

## 启动

```bash
npm run dev
```

`dev` 使用稳定的普通 Node 启动，不开启文件监听，避免 macOS 上出现 `EMFILE: too many open files`。修改 mock 配置后按 `Ctrl + C` 停止服务，再重新执行 `npm run dev` 即可。

默认启动地址：

```text
http://localhost:3001
```

根路径也会返回服务状态：

```bash
curl http://localhost:3001/
```

也可以指定端口：

```bash
MOCK_PORT=3100 npm run dev
```

默认只监听本机 `127.0.0.1`。如果需要让局域网内其他设备访问，可以改成：

```bash
MOCK_HOST=0.0.0.0 npm run dev
```

注意：`0.0.0.0` 只适合作为服务监听地址，不建议直接在浏览器中访问。浏览器里请使用 `localhost`、`127.0.0.1`，或者你的本机局域网 IP。

## 端口占用处理

如果启动时报：

```text
Error: listen EADDRINUSE: address already in use 127.0.0.1:3001
```

说明 `3001` 端口已经有服务在运行。可以先查看占用进程：

```bash
lsof -nP -iTCP:3001 -sTCP:LISTEN
```

确认是旧的 mock 服务后停止它：

```bash
kill <PID>
```

或者直接换一个端口启动：

```bash
MOCK_PORT=3100 npm run dev
```

## 项目结构

```text
local-mock-server/
├─ package.json
├─ server.js
├─ src/
│  ├─ app.js
│  ├─ router/
│  │  ├─ index.js
│  │  └─ registerRoutes.js
│  ├─ modules/
│  │  ├─ common.js
│  │  ├─ user.js
│  │  └─ order.js
│  ├─ responses/
│  ├─ utils/
│  │  ├─ getParams.js
│  │  ├─ response.js
│  │  └─ validate.js
│  └─ config/
│     └─ index.js
└─ README.md
```

## 接口配置示例

`src/modules/user.js`

```js
const loginSuccessData = require('../responses/user/login.success.json');

module.exports = [
  {
    method: 'post',
    path: '/api/user/login',
    required: {
      body: ['username', 'password']
    },
    response: loginSuccessData
  }
];
```

配置字段说明：

- `method`：请求方式，支持 `get` / `post` / `put` / `delete` / `patch`
- `path`：接口路径，支持 Express 路径参数，例如 `/api/user/:id`
- `required.body`：请求体必填字段
- `required.query`：查询参数必填字段
- `required.params`：路径参数必填字段
- `response`：成功时返回的固定 demo 数据

## 缺参规则

以下值会被视为缺失：

- `undefined`
- `null`
- 空字符串 `''`
- 空数组 `[]`

缺少多个字段时会一次性返回全部缺失字段。

## 统一返回格式

成功：

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

缺少必填参数：

```json
{
  "code": 400,
  "message": "缺少必填参数: username, password",
  "data": null
}
```

未匹配到接口：

```json
{
  "code": 404,
  "message": "mock接口不存在",
  "data": null
}
```

## 内置示例接口

```text
GET    /api/common/ping
POST   /api/user/login
GET    /api/user/profile?userId=1001
GET    /api/user/:id
PATCH  /api/user/:id
DELETE /api/user/:id
GET    /api/order/list?pageNum=1&pageSize=10
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
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
};
```

这样前端仍然请求 `/api/user/login`，本地开发阶段会转发到 mock 服务，业务请求代码不用写死 mock 数据。

## 新增一个接口

1. 在 `src/responses/<module>/` 下新增一个 `.json` 响应文件。
2. 在 `src/modules/<module>.js` 中引入这个响应文件。
3. 在模块数组中新增一条接口配置。
4. 如果新增了模块文件，在 `src/router/index.js` 中汇总导出。

示例：

```js
const createSuccessData = require('../responses/order/create.success.json');

module.exports = [
  {
    method: 'post',
    path: '/api/order/create',
    required: {
      body: ['productId', 'quantity']
    },
    response: createSuccessData
  }
];
```

## 调试示例

```bash
curl http://localhost:3001/api/common/ping
curl "http://localhost:3001/api/order/list?pageNum=1&pageSize=10"
curl -X POST http://localhost:3001/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"username":"demo_user","password":"123456"}'
```

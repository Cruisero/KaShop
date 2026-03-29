---
description: 部署前安全检查清单
---

// turbo-all

在部署之前，执行以下安全检查：

## 1. 检查是否有 mock/测试端点暴露在生产环境
在 backend/src/routes/ 目录下搜索所有包含 "mock"、"test"、"debug"、"dev" 关键词的路由，确认它们都被 `NODE_ENV !== 'production'` 包裹。

## 2. 检查所有 POST 接口是否有后端校验
特别检查 payment、order 相关的 controller，确认：
- 支付方式是否校验了 enabled 状态（不能只靠前端隐藏）
- 支付回调是否验证了签名（不能直接信任请求）
- 订单状态变更是否有权限检查

## 3. 检查是否有不需要认证的敏感接口
在 routes/ 目录下，找到所有 POST/PUT/DELETE 路由，确认敏感操作（如修改订单状态、发放卡密）都需要 admin token。

## 4. 检查 console.log 是否泄露敏感信息
搜索代码中的 console.log，确认没有打印密码、token、密钥等敏感信息。

## 5. 检查环境变量
确认 .env 文件中的密钥不是默认值（如 "your_api_key"、"change-this" 等）。

# Kashop - 虚拟物品发卡平台

一个基于 React + Vite 前端和 Node.js + Express 后端的虚拟物品自动发卡交易平台。

## 🚀 快速开始

### 环境要求

- Docker >= 20.0
- Docker Compose >= 2.0

### 启动项目

```bash
# 克隆项目
cd Kashop

# 复制环境变量配置
cp .env.example .env

# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f
```

### 访问地址

| 服务 | 地址 |
|------|------|
| 前端 | http://localhost:3000 |
| 后端 API | http://localhost:8080 |
| phpMyAdmin | http://localhost:8081 |

## 📁 项目结构

```
Kashop/
├── frontend/               # React + Vite 前端
│   ├── src/
│   │   ├── components/     # 通用组件
│   │   ├── pages/          # 页面组件
│   │   ├── store/          # Zustand 状态管理
│   │   ├── services/       # API 服务
│   │   └── assets/         # 静态资源
│   ├── Dockerfile
│   └── package.json
│
├── backend/                # Node.js + Express 后端
│   ├── src/
│   │   ├── controllers/    # 控制器
│   │   ├── routes/         # 路由
│   │   ├── middleware/     # 中间件
│   │   ├── validators/     # 请求验证
│   │   └── utils/          # 工具函数
│   ├── Dockerfile
│   └── package.json
│
├── docker/
│   └── mysql/
│       └── init.sql        # 数据库初始化脚本
│
├── docker-compose.yml      # Docker 编排配置
└── .env.example            # 环境变量示例
```

## 🛠 技术栈

### 前端
- React 18
- Vite 5
- React Router v6
- Zustand (状态管理)
- Axios

### 后端
- Node.js 20
- Express.js
- MySQL 8
- Redis 7
- JWT 认证

## 📖 API 接口

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/auth/register | 用户注册 |
| POST | /api/auth/login | 用户登录 |
| GET | /api/products | 商品列表 |
| GET | /api/products/:id | 商品详情 |
| POST | /api/orders | 创建订单 |
| GET | /api/orders/:orderNo | 订单详情 |
| POST | /api/payment/create | 创建支付 |

## 🔧 开发命令

```bash
# 启动开发环境
docker-compose up -d

# 重新构建
docker-compose up -d --build

# 停止服务
docker-compose down

# 查看日志
docker-compose logs -f backend
docker-compose logs -f frontend

# 进入容器
docker exec -it kashop-backend sh
docker exec -it kashop-frontend sh
```

## 📝 默认账号

| 类型 | 邮箱 | 密码 |
|------|------|------|
| 管理员 | admin@kashop.com | admin123 |

## 📄 License

MIT License

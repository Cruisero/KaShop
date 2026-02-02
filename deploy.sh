#!/bin/bash

# HaoDongXi 部署脚本
set -e

echo "🚀 开始部署 HaoDongXi..."

# 进入项目目录
cd /var/www/haodongxi

# 停止现有容器
echo "⏹️  停止现有容器..."
docker compose -f docker-compose.prod.yml down 2>/dev/null || true

# 拉取最新代码（如果是 git 仓库）
# git pull origin main

# 构建镜像
echo "🔨 构建 Docker 镜像..."
docker compose -f docker-compose.prod.yml build --no-cache

# 启动容器
echo "▶️  启动容器..."
docker compose -f docker-compose.prod.yml up -d

# 等待 MySQL 就绪
echo "⏳ 等待 MySQL 就绪..."
sleep 15

# 运行数据库迁移
echo "📦 运行数据库迁移..."
docker compose -f docker-compose.prod.yml exec -T backend npx prisma migrate deploy

# 检查服务状态
echo "✅ 部署完成！服务状态："
docker compose -f docker-compose.prod.yml ps

echo ""
echo "🌐 网站地址: https://haodongxi.shop"
echo "📊 查看日志: docker compose -f docker-compose.prod.yml logs -f"

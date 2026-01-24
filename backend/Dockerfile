# 开发环境 Dockerfile
FROM node:20-alpine

# 安装 OpenSSL 用于 Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# 复制 package 文件
COPY package*.json ./
COPY prisma ./prisma/

# 安装依赖
RUN npm install

# 生成 Prisma 客户端
RUN npx prisma generate

# 复制源代码
COPY . .

# 暴露后端端口
EXPOSE 8080

# 启动开发服务器 (使用 nodemon 热重载)
CMD ["npm", "run", "dev"]

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const routes = require('./routes')
const errorHandler = require('./middleware/errorHandler')
const logger = require('./utils/logger')
const { initScheduledTasks } = require('./tasks/scheduler')

const app = express()

// 安全中间件 (配置允许跨域图片)
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false
}))

// CORS 配置
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}))

// 请求日志
app.use(morgan('combined', {
    stream: { write: (message) => logger.http(message.trim()) }
}))

// 请求体解析
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 请求限流
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100, // 限制每IP 100次请求
    message: { error: '请求过于频繁，请稍后再试' }
})
app.use('/api', limiter)

// 静态文件
app.use('/uploads', express.static('uploads'))

// API 路由
app.use('/api', routes)

// 健康检查
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 初始化定时任务
initScheduledTasks()

// 404 处理
app.use((req, res) => {
    res.status(404).json({ error: '接口不存在' })
})

// 全局错误处理
app.use(errorHandler)

module.exports = app

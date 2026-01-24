const jwt = require('jsonwebtoken')

// 验证 Token
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: '请先登录' })
        }

        const token = authHeader.substring(7)
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        req.user = decoded
        next()
    } catch (error) {
        next(error)
    }
}

// 可选认证 (有Token则解析,无Token也放行)
const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7)
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            req.user = decoded
        }

        next()
    } catch (error) {
        // Token无效也放行
        next()
    }
}

// 管理员权限验证
const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: '需要管理员权限' })
    }
    next()
}

module.exports = { authenticate, optionalAuth, isAdmin }

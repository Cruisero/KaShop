// 认证控制器
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const prisma = require('../config/database')

// 生成 JWT Token
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )
}

// 用户注册
exports.register = async (req, res, next) => {
    try {
        const { email, password, username } = req.body

        // 检查邮箱是否已存在
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return res.status(409).json({ error: '该邮箱已被注册' })
        }

        // 加密密码
        const hashedPassword = await bcrypt.hash(password, 10)

        // 创建用户
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                username: username || email.split('@')[0],
                role: 'USER'
            }
        })

        // 生成 Token
        const token = generateToken(user)

        res.status(201).json({
            message: '注册成功',
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role
            },
            token
        })
    } catch (error) {
        next(error)
    }
}

// 用户登录
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body

        // 查找用户
        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) {
            return res.status(401).json({ error: '邮箱或密码错误' })
        }

        // 验证密码
        const isValidPassword = await bcrypt.compare(password, user.password)

        if (!isValidPassword) {
            return res.status(401).json({ error: '邮箱或密码错误' })
        }

        // 生成 Token
        const token = generateToken(user)

        res.json({
            message: '登录成功',
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role
            },
            token
        })
    } catch (error) {
        next(error)
    }
}

// 获取当前用户信息
exports.getCurrentUser = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: '请先登录' })
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                username: true,
                role: true,
                avatar: true,
                createdAt: true
            }
        })

        if (!user) {
            return res.status(404).json({ error: '用户不存在' })
        }

        res.json({ user })
    } catch (error) {
        next(error)
    }
}

// 刷新 Token
exports.refreshToken = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: '请先登录' })
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        })

        if (!user) {
            return res.status(404).json({ error: '用户不存在' })
        }

        const token = generateToken(user)

        res.json({ token })
    } catch (error) {
        next(error)
    }
}

// 退出登录
exports.logout = async (req, res, next) => {
    try {
        // 可以在这里将 Token 加入黑名单 (使用 Redis)
        res.json({ message: '已退出登录' })
    } catch (error) {
        next(error)
    }
}

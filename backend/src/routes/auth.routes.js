const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const { validateBody } = require('../middleware/validation')
const { loginSchema, registerSchema } = require('../validators/auth')

// 用户注册
router.post('/register', validateBody(registerSchema), authController.register)

// 用户登录
router.post('/login', validateBody(loginSchema), authController.login)

// 获取当前用户信息
router.get('/me', authController.getCurrentUser)

// 刷新 Token
router.post('/refresh', authController.refreshToken)

// 退出登录
router.post('/logout', authController.logout)

module.exports = router

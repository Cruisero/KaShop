const express = require('express')
const router = express.Router()
const paymentController = require('../controllers/paymentController')

// 获取支付方式列表
router.get('/methods', paymentController.getPaymentMethods)

// 创建支付订单
router.post('/create', paymentController.createPayment)

// 支付回调 - 支付宝
router.post('/callback/alipay', paymentController.alipayCallback)

// 支付回调 - 微信
router.post('/callback/wechat', paymentController.wechatCallback)

// 查询支付状态
router.get('/status/:orderNo', paymentController.getPaymentStatus)

// 模拟支付页面 (开发测试)
router.get('/mock', paymentController.mockPayment)

// 确认模拟支付
router.post('/mock/confirm', paymentController.confirmMockPayment)

module.exports = router

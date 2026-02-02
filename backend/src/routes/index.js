const express = require('express')
const router = express.Router()

const authRoutes = require('./auth.routes')
const productRoutes = require('./product.routes')
const categoryRoutes = require('./category.routes')
const orderRoutes = require('./order.routes')
const cardRoutes = require('./card.routes')
const paymentRoutes = require('./payment.routes')
const adminRoutes = require('./admin.routes')
const uploadRoutes = require('./upload.routes')

// API 版本信息
router.get('/', (req, res) => {
    res.json({
        name: 'HaoDongXi API',
        version: '1.0.0',
        description: '虚拟物品发卡平台接口'
    })
})

// 认证路由
router.use('/auth', authRoutes)

// 商品路由
router.use('/products', productRoutes)

// 分类路由
router.use('/categories', categoryRoutes)

// 订单路由
router.use('/orders', orderRoutes)

// 卡密路由 (需要管理员权限)
router.use('/cards', cardRoutes)

// 支付路由
router.use('/payment', paymentRoutes)

// 管理员路由
router.use('/admin', adminRoutes)

// 上传路由
router.use('/upload', uploadRoutes)

module.exports = router

const express = require('express')
const router = express.Router()
const adminController = require('../controllers/adminController')
const { authenticate, isAdmin } = require('../middleware/auth')

// 所有管理员路由需要认证
router.use(authenticate, isAdmin)

// 仪表盘统计
router.get('/dashboard', adminController.getDashboard)

// 商品管理
router.get('/products', adminController.getProducts)
router.post('/products', adminController.createProduct)
router.put('/products/:id', adminController.updateProduct)
router.delete('/products/:id', adminController.deleteProduct)

// 分类管理
router.get('/categories', adminController.getCategories)
router.post('/categories', adminController.createCategory)
router.put('/categories/:id', adminController.updateCategory)
router.delete('/categories/:id', adminController.deleteCategory)

// 订单管理
router.get('/orders', adminController.getOrders)
router.put('/orders/:id/status', adminController.updateOrderStatus)

// 用户管理
router.get('/users', adminController.getUsers)
router.post('/users/cleanup-unverified', adminController.cleanupUnverifiedAccounts)

// 系统设置
router.get('/settings', adminController.getSettings)
router.put('/settings', adminController.updateSettings)
router.post('/settings/test-email', adminController.testEmail)

// 卡密管理
router.get('/cards', adminController.getCards)
router.post('/cards/import', adminController.importCards)
router.put('/cards/:id', adminController.updateCard)
router.delete('/cards/:id', adminController.deleteCard)
router.post('/cards/batch-delete', adminController.deleteCards)

module.exports = router

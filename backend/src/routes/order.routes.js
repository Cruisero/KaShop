const express = require('express')
const router = express.Router()
const orderController = require('../controllers/orderController')
const { validateBody } = require('../middleware/validation')
const { createOrderSchema, queryOrderSchema } = require('../validators/order')

// 创建订单
router.post('/', validateBody(createOrderSchema), orderController.createOrder)

// 通过订单号查询订单
router.get('/query', validateBody(queryOrderSchema), orderController.queryOrder)

// 获取订单详情
router.get('/:orderNo', orderController.getOrderByNo)

// 获取订单卡密 (支付成功后)
router.get('/:orderNo/cards', orderController.getOrderCards)

module.exports = router

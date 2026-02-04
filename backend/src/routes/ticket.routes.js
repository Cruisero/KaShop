const express = require('express')
const router = express.Router()
const ticketController = require('../controllers/ticketController')
const { requireAuth, requireAdmin } = require('../middleware/auth')

// ==================== 用户端路由 ====================

// 获取用户的订单列表（用于选择关联订单）
router.get('/orders', requireAuth, ticketController.getMyOrders)

// 创建工单
router.post('/', requireAuth, ticketController.createTicket)

// 获取我的工单列表
router.get('/', requireAuth, ticketController.getMyTickets)

// 获取工单详情
router.get('/:id', requireAuth, ticketController.getTicketDetail)

// 发送消息
router.post('/:id/messages', requireAuth, ticketController.addMessage)

// ==================== 管理端路由 ====================

// 获取所有工单
router.get('/admin/all', requireAuth, requireAdmin, ticketController.getAllTickets)

// 获取工单详情（管理员）
router.get('/admin/:id', requireAuth, requireAdmin, ticketController.getTicketDetail)

// 管理员回复
router.post('/admin/:id/reply', requireAuth, requireAdmin, ticketController.adminReply)

// 更新工单状态
router.patch('/admin/:id/status', requireAuth, requireAdmin, ticketController.updateTicketStatus)

module.exports = router

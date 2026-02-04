const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const emailService = require('../services/emailService')

// 生成工单号
function generateTicketNo() {
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `TK${dateStr}${random}`
}

// 工单类型映射
const ticketTypeLabel = {
    ORDER_ISSUE: '订单问题',
    CARD_ISSUE: '卡密问题',
    REFUND: '退款申请',
    OTHER: '其他'
}

// ==================== 用户端 API ====================

// 创建工单
exports.createTicket = async (req, res, next) => {
    try {
        const userId = req.user.id
        const { type, subject, content, orderId, images } = req.body

        if (!type || !subject || !content) {
            return res.status(400).json({ error: '请填写完整信息' })
        }

        // 如果关联订单，验证订单属于该用户
        let orderNo = null
        if (orderId) {
            const order = await prisma.order.findUnique({
                where: { id: orderId }
            })
            if (!order || order.userId !== userId) {
                return res.status(400).json({ error: '订单不存在或无权限' })
            }
            orderNo = order.orderNo
        }

        // 创建工单和第一条消息
        const ticket = await prisma.ticket.create({
            data: {
                ticketNo: generateTicketNo(),
                userId,
                orderId: orderId || null,
                orderNo,
                type,
                subject,
                status: 'OPEN',
                messages: {
                    create: {
                        senderId: userId,
                        isAdmin: false,
                        content,
                        images: images || null
                    }
                }
            },
            include: {
                messages: true
            }
        })

        res.status(201).json({
            message: '工单创建成功',
            ticket
        })
    } catch (error) {
        next(error)
    }
}

// 获取我的工单列表
exports.getMyTickets = async (req, res, next) => {
    try {
        const userId = req.user.id
        const { status } = req.query

        const where = { userId }
        if (status && status !== 'all') {
            where.status = status
        }

        const tickets = await prisma.ticket.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                },
                _count: {
                    select: { messages: true }
                }
            }
        })

        res.json({ tickets })
    } catch (error) {
        next(error)
    }
}

// 获取工单详情
exports.getTicketDetail = async (req, res, next) => {
    try {
        const userId = req.user.id
        const { id } = req.params

        const ticket = await prisma.ticket.findUnique({
            where: { id },
            include: {
                user: {
                    select: { id: true, email: true, username: true }
                },
                messages: {
                    orderBy: { createdAt: 'asc' },
                    include: {
                        sender: {
                            select: { id: true, username: true, email: true, role: true }
                        }
                    }
                },
                order: {
                    select: { orderNo: true, productName: true, totalAmount: true, status: true }
                }
            }
        })

        if (!ticket) {
            return res.status(404).json({ error: '工单不存在' })
        }

        // 验证权限
        if (ticket.userId !== userId && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: '无权限查看此工单' })
        }

        res.json({ ticket })
    } catch (error) {
        next(error)
    }
}

// 用户发送消息
exports.addMessage = async (req, res, next) => {
    try {
        const userId = req.user.id
        const { id } = req.params
        const { content, images } = req.body

        if (!content) {
            return res.status(400).json({ error: '消息内容不能为空' })
        }

        // 验证工单存在且属于用户
        const ticket = await prisma.ticket.findUnique({
            where: { id }
        })

        if (!ticket) {
            return res.status(404).json({ error: '工单不存在' })
        }

        if (ticket.userId !== userId) {
            return res.status(403).json({ error: '无权限操作此工单' })
        }

        if (ticket.status === 'CLOSED') {
            return res.status(400).json({ error: '工单已关闭，无法发送消息' })
        }

        // 添加消息
        const message = await prisma.ticketMessage.create({
            data: {
                ticketId: id,
                senderId: userId,
                isAdmin: false,
                content,
                images: images || null
            }
        })

        // 更新工单时间
        await prisma.ticket.update({
            where: { id },
            data: { updatedAt: new Date() }
        })

        res.status(201).json({
            message: '消息发送成功',
            data: message
        })
    } catch (error) {
        next(error)
    }
}

// 获取用户订单列表（用于选择关联订单）
exports.getMyOrders = async (req, res, next) => {
    try {
        const userId = req.user.id

        const orders = await prisma.order.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                orderNo: true,
                productName: true,
                totalAmount: true,
                status: true,
                createdAt: true
            },
            take: 50
        })

        res.json({ orders })
    } catch (error) {
        next(error)
    }
}

// ==================== 管理端 API ====================

// 获取所有工单
exports.getAllTickets = async (req, res, next) => {
    try {
        const { status, type, page = 1, limit = 20 } = req.query

        const where = {}
        if (status && status !== 'all') {
            where.status = status
        }
        if (type && type !== 'all') {
            where.type = type
        }

        const [tickets, total] = await Promise.all([
            prisma.ticket.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: parseInt(limit),
                include: {
                    user: {
                        select: { id: true, email: true, username: true }
                    },
                    messages: {
                        orderBy: { createdAt: 'desc' },
                        take: 1
                    },
                    _count: {
                        select: { messages: true }
                    }
                }
            }),
            prisma.ticket.count({ where })
        ])

        res.json({
            tickets,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        next(error)
    }
}

// 管理员回复工单
exports.adminReply = async (req, res, next) => {
    try {
        const { id } = req.params
        const { content, images, updateStatus } = req.body
        const adminId = req.user.id

        if (!content) {
            return res.status(400).json({ error: '回复内容不能为空' })
        }

        const ticket = await prisma.ticket.findUnique({
            where: { id },
            include: {
                user: { select: { email: true, username: true } }
            }
        })

        if (!ticket) {
            return res.status(404).json({ error: '工单不存在' })
        }

        // 创建回复消息
        const message = await prisma.ticketMessage.create({
            data: {
                ticketId: id,
                senderId: adminId,
                isAdmin: true,
                content,
                images: images || null
            }
        })

        // 更新工单状态
        const newStatus = updateStatus || (ticket.status === 'OPEN' ? 'IN_PROGRESS' : ticket.status)
        await prisma.ticket.update({
            where: { id },
            data: {
                status: newStatus,
                updatedAt: new Date()
            }
        })

        // 发送邮件通知用户
        try {
            await emailService.sendTicketReplyNotification(
                ticket.user.email,
                ticket.user.username || '用户',
                ticket.ticketNo,
                ticket.subject,
                content
            )
        } catch (emailError) {
            console.error('发送工单回复邮件失败:', emailError)
            // 不影响主流程
        }

        res.json({
            message: '回复成功',
            data: message
        })
    } catch (error) {
        next(error)
    }
}

// 更新工单状态
exports.updateTicketStatus = async (req, res, next) => {
    try {
        const { id } = req.params
        const { status } = req.body

        if (!['OPEN', 'IN_PROGRESS', 'CLOSED'].includes(status)) {
            return res.status(400).json({ error: '无效的状态' })
        }

        const ticket = await prisma.ticket.update({
            where: { id },
            data: {
                status,
                closedAt: status === 'CLOSED' ? new Date() : null
            }
        })

        res.json({
            message: '状态更新成功',
            ticket
        })
    } catch (error) {
        next(error)
    }
}

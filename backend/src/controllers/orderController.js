// 订单控制器
const prisma = require('../config/database')
const { nanoid } = require('nanoid')

// 生成订单号
const generateOrderNo = () => {
    const date = new Date()
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
    return `KA${dateStr}${nanoid(6).toUpperCase()}`
}

// 创建订单
exports.createOrder = async (req, res, next) => {
    try {
        const { productId, quantity = 1, email, paymentMethod } = req.body
        const userId = req.user?.id || null

        // 查询商品
        const product = await prisma.product.findUnique({
            where: { id: productId }
        })

        if (!product) {
            return res.status(404).json({ error: '商品不存在' })
        }

        if (product.status !== 'ACTIVE') {
            return res.status(400).json({ error: '商品已下架' })
        }

        if (product.stock < quantity) {
            return res.status(400).json({ error: '库存不足' })
        }

        // 计算金额
        const unitPrice = parseFloat(product.price)
        const totalAmount = unitPrice * quantity

        // 创建订单
        const order = await prisma.order.create({
            data: {
                orderNo: generateOrderNo(),
                userId,
                email,
                productId,
                productName: product.name,
                quantity,
                unitPrice,
                totalAmount,
                status: 'PENDING',
                paymentMethod,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent')
            }
        })

        res.status(201).json({
            message: '订单创建成功',
            order: {
                orderNo: order.orderNo,
                productName: order.productName,
                quantity: order.quantity,
                totalAmount: parseFloat(order.totalAmount),
                status: order.status,
                paymentMethod: order.paymentMethod,
                createdAt: order.createdAt
            }
        })
    } catch (error) {
        next(error)
    }
}

// 查询订单
exports.queryOrder = async (req, res, next) => {
    try {
        const { orderNo, email } = req.query

        const where = { orderNo }
        if (email) {
            where.email = email
        }

        const order = await prisma.order.findFirst({
            where,
            include: {
                product: {
                    select: { id: true, name: true, image: true }
                },
                cards: order?.status === 'COMPLETED' ? {
                    select: { id: true, content: true }
                } : false
            }
        })

        if (!order) {
            return res.status(404).json({ error: '订单不存在' })
        }

        res.json({ order: formatOrder(order) })
    } catch (error) {
        next(error)
    }
}

// 获取订单详情
exports.getOrderByNo = async (req, res, next) => {
    try {
        const { orderNo } = req.params

        const order = await prisma.order.findUnique({
            where: { orderNo },
            include: {
                product: {
                    select: { id: true, name: true, image: true }
                }
            }
        })

        if (!order) {
            return res.status(404).json({ error: '订单不存在' })
        }

        res.json({ order: formatOrder(order) })
    } catch (error) {
        next(error)
    }
}

// 获取订单卡密 (支付成功后)
exports.getOrderCards = async (req, res, next) => {
    try {
        const { orderNo } = req.params

        const order = await prisma.order.findUnique({
            where: { orderNo },
            include: {
                cards: {
                    select: { id: true, content: true }
                }
            }
        })

        if (!order) {
            return res.status(404).json({ error: '订单不存在' })
        }

        if (order.status !== 'COMPLETED') {
            return res.status(400).json({ error: '订单未完成，无法查看卡密' })
        }

        res.json({
            orderNo: order.orderNo,
            cards: order.cards
        })
    } catch (error) {
        next(error)
    }
}

// 格式化订单数据
function formatOrder(order) {
    return {
        orderNo: order.orderNo,
        email: order.email,
        product: order.product,
        productName: order.productName,
        quantity: order.quantity,
        unitPrice: parseFloat(order.unitPrice),
        totalAmount: parseFloat(order.totalAmount),
        status: order.status.toLowerCase(),
        paymentMethod: order.paymentMethod,
        paidAt: order.paidAt,
        completedAt: order.completedAt,
        createdAt: order.createdAt,
        cards: order.cards || []
    }
}

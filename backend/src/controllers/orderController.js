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
        const { productId, variantId, quantity = 1, email, paymentMethod, remark } = req.body
        const userId = req.user?.id || null

        // 查询商品
        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: { variants: true }
        })

        if (!product) {
            return res.status(404).json({ error: '商品不存在' })
        }

        if (product.status !== 'ACTIVE') {
            return res.status(400).json({ error: '商品已下架' })
        }

        // 如果有规格，查找对应规格
        let variant = null
        let unitPrice = parseFloat(product.price)

        if (variantId) {
            variant = product.variants.find(v => v.id === variantId)
            if (variant) {
                unitPrice = parseFloat(variant.price)
            }
        }

        // 查询库存计算模式设置
        const stockModeSetting = await prisma.setting.findUnique({
            where: { key: 'stockMode' }
        })
        const stockMode = stockModeSetting?.value || 'auto'

        let availableStock
        if (stockMode === 'manual') {
            // 手动模式：使用商品/规格的 stock 字段
            availableStock = variant ? (variant.stock || 0) : (product.stock || 0)
        } else {
            // 自动模式：使用可用卡密数量
            availableStock = await prisma.card.count({
                where: {
                    productId,
                    variantId: variantId || null,
                    status: 'AVAILABLE'
                }
            })
        }

        if (availableStock < quantity) {
            return res.status(400).json({
                error: availableStock === 0 ? '该商品暂无库存' : `库存不足，仅剩 ${availableStock} 件`
            })
        }

        // 计算金额
        const totalAmount = unitPrice * quantity

        // 构建商品名称（包含规格）
        const productName = variant ? `${product.name} (${variant.name})` : product.name

        // 创建订单
        const order = await prisma.order.create({
            data: {
                orderNo: generateOrderNo(),
                userId,
                email,
                productId,
                productName,
                variantId: variant?.id || null,      // 保存规格ID
                variantName: variant?.name || null,  // 保存规格名称
                quantity,
                unitPrice,
                totalAmount,
                status: 'PENDING',
                paymentMethod,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                remark: remark || null
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

        let order = await prisma.order.findUnique({
            where: { orderNo },
            include: {
                product: {
                    select: { id: true, name: true, image: true }
                },
                cards: {
                    select: { id: true, content: true }
                }
            }
        })

        if (!order) {
            return res.status(404).json({ error: '订单不存在' })
        }

        // 检查是否为超时的待支付订单（15分钟）
        if (order.status === 'PENDING') {
            const orderAge = Date.now() - new Date(order.createdAt).getTime()
            const timeoutMs = 15 * 60 * 1000 // 15分钟

            if (orderAge > timeoutMs) {
                // 自动取消超时订单
                order = await prisma.order.update({
                    where: { orderNo },
                    data: {
                        status: 'CANCELLED',
                        cancelledAt: new Date()
                    },
                    include: {
                        product: {
                            select: { id: true, name: true, image: true }
                        },
                        cards: {
                            select: { id: true, content: true }
                        }
                    }
                })
                console.log(`订单 ${orderNo} 因超时自动取消`)
            }
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

// 获取当前用户订单列表
exports.getUserOrders = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: '请先登录' })
        }

        const { status } = req.query

        const where = { userId: req.user.id }
        if (status && status !== 'all') {
            where.status = status.toUpperCase()
        }

        const orders = await prisma.order.findMany({
            where,
            include: {
                product: {
                    select: { id: true, name: true, image: true }
                },
                cards: {
                    where: { status: 'SOLD' },
                    select: { content: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        res.json({
            orders: orders.map(order => ({
                orderNo: order.orderNo,
                productName: order.productName,
                productImage: order.product?.image || '',
                quantity: order.quantity,
                totalAmount: parseFloat(order.totalAmount),
                status: order.status.toLowerCase(),
                createdAt: order.createdAt,
                cards: order.cards.map(c => c.content)
            }))
        })
    } catch (error) {
        next(error)
    }
}

// 取消订单
exports.cancelOrder = async (req, res, next) => {
    try {
        const { orderNo } = req.params

        const order = await prisma.order.findUnique({
            where: { orderNo }
        })

        if (!order) {
            return res.status(404).json({ error: '订单不存在' })
        }

        if (order.status !== 'PENDING') {
            return res.status(400).json({ error: '只能取消待支付订单' })
        }

        // 更新订单状态为已取消
        await prisma.order.update({
            where: { orderNo },
            data: {
                status: 'CANCELLED',
                cancelledAt: new Date()
            }
        })

        res.json({ message: '订单已取消', orderNo })
    } catch (error) {
        next(error)
    }
}

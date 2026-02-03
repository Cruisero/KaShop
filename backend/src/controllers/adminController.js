// 管理员控制器
const prisma = require('../config/database')
const bcrypt = require('bcryptjs')

// 仪表盘统计
exports.getDashboard = async (req, res, next) => {
    try {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const [
            totalOrders,
            totalRevenue,
            totalProducts,
            totalUsers,
            todayOrders,
            recentOrders
        ] = await Promise.all([
            prisma.order.count({ where: { status: 'COMPLETED' } }),
            prisma.order.aggregate({
                where: { status: 'COMPLETED' },
                _sum: { totalAmount: true }
            }),
            prisma.product.count(),
            prisma.user.count(),
            prisma.order.count({
                where: {
                    status: 'COMPLETED',
                    createdAt: { gte: today }
                }
            }),
            prisma.order.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: {
                    product: { select: { name: true } }
                }
            })
        ])

        const todayRevenue = await prisma.order.aggregate({
            where: {
                status: 'COMPLETED',
                createdAt: { gte: today }
            },
            _sum: { totalAmount: true }
        })

        res.json({
            totalOrders,
            totalRevenue: parseFloat(totalRevenue._sum.totalAmount || 0),
            totalProducts,
            totalUsers,
            todayOrders,
            todayRevenue: parseFloat(todayRevenue._sum.totalAmount || 0),
            recentOrders: recentOrders.map(o => ({
                id: o.id,
                orderNo: o.orderNo,
                product: o.product?.name || o.productName,
                amount: parseFloat(o.totalAmount),
                status: o.status.toLowerCase(),
                createdAt: o.createdAt
            }))
        })
    } catch (error) {
        next(error)
    }
}

// 商品管理 - 列表
exports.getProducts = async (req, res, next) => {
    try {
        const { page = 1, pageSize = 20, status } = req.query

        const where = {}
        if (status) where.status = status.toUpperCase()

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    category: { select: { name: true } },
                    _count: { select: { cards: { where: { status: 'AVAILABLE' } } } },
                    variants: {
                        orderBy: { sortOrder: 'asc' }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: parseInt(pageSize)
            }),
            prisma.product.count({ where })
        ])

        res.json({
            products: products.map(p => ({
                ...p,
                price: parseFloat(p.price),
                originalPrice: p.originalPrice ? parseFloat(p.originalPrice) : null,
                availableCards: p._count.cards,
                variants: (p.variants || []).map(v => ({
                    ...v,
                    price: parseFloat(v.price),
                    originalPrice: v.originalPrice ? parseFloat(v.originalPrice) : null
                }))
            })),
            total,
            page: parseInt(page),
            pageSize: parseInt(pageSize)
        })
    } catch (error) {
        next(error)
    }
}

// 商品管理 - 创建
exports.createProduct = async (req, res, next) => {
    try {
        const { name, description, fullDescription, price, originalPrice, categoryId, image, images, tags, stock, variants } = req.body

        // 构建数据对象，只包含有值的字段
        const productData = {
            name,
            description,
            fullDescription,
            price,
            originalPrice,
            image,
            images: images || [],
            stock: stock || 0,
            tags: tags || [],
            status: 'ACTIVE'
        }

        // 只有当 categoryId 有效时才添加
        if (categoryId && categoryId !== '' && categoryId !== 'null') {
            productData.categoryId = categoryId
        }

        // 如果有规格数据，使用嵌套创建，并自动设置商品价格为最低规格价格
        if (variants && variants.length > 0) {
            const validVariants = variants.filter(v => v.name && v.price)
            if (validVariants.length > 0) {
                // 商品价格自动取最低规格价格
                const prices = validVariants.map(v => parseFloat(v.price) || 0)
                const minPrice = Math.min(...prices)
                productData.price = minPrice

                // 原价取最高规格原价（如果有）
                const originalPrices = validVariants
                    .map(v => v.originalPrice ? parseFloat(v.originalPrice) : 0)
                    .filter(p => p > 0)
                if (originalPrices.length > 0) {
                    productData.originalPrice = Math.max(...originalPrices)
                }

                // 库存为各规格库存之和
                const totalStock = validVariants.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0)
                productData.stock = totalStock

                productData.variants = {
                    create: validVariants.map((v, index) => ({
                        name: v.name,
                        price: parseFloat(v.price) || 0,
                        originalPrice: v.originalPrice ? parseFloat(v.originalPrice) : null,
                        stock: parseInt(v.stock) || 0,
                        sortOrder: index,
                        status: 'ACTIVE'
                    }))
                }
            }
        }

        const product = await prisma.product.create({
            data: productData,
            include: {
                variants: true
            }
        })

        res.status(201).json({ message: '商品创建成功', product })
    } catch (error) {
        next(error)
    }
}

// 商品管理 - 更新
exports.updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params
        const { name, description, fullDescription, price, originalPrice, categoryId, image, images, tags, status, stock, variants } = req.body

        // 构建更新数据对象
        const updateData = {
            name,
            description,
            fullDescription,
            price,
            originalPrice,
            image,
            images: images || [],
            stock,
            tags,
            status: status?.toUpperCase()
        }

        // 只有当 categoryId 有效时才更新，否则设置为 null
        if (categoryId && categoryId !== '' && categoryId !== 'null') {
            updateData.categoryId = categoryId
        } else {
            updateData.categoryId = null
        }

        // 使用事务处理规格更新
        const product = await prisma.$transaction(async (tx) => {
            // 更新商品基本信息
            const updatedProduct = await tx.product.update({
                where: { id },
                data: updateData
            })

            // 如果传入了 variants 数组，先删除旧规格再创建新规格
            if (variants !== undefined) {
                // 删除旧规格
                await tx.productVariant.deleteMany({
                    where: { productId: id }
                })

                // 创建新规格，并自动设置商品价格
                if (variants && variants.length > 0) {
                    const validVariants = variants.filter(v => v.name && v.price)
                    if (validVariants.length > 0) {
                        // 商品价格自动取最低规格价格
                        const prices = validVariants.map(v => parseFloat(v.price) || 0)
                        const minPrice = Math.min(...prices)

                        // 原价取最高规格原价（如果有）
                        const originalPrices = validVariants
                            .map(v => v.originalPrice ? parseFloat(v.originalPrice) : 0)
                            .filter(p => p > 0)
                        const maxOriginalPrice = originalPrices.length > 0 ? Math.max(...originalPrices) : null

                        // 库存为各规格库存之和
                        const totalStock = validVariants.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0)

                        // 更新商品价格和库存
                        await tx.product.update({
                            where: { id },
                            data: {
                                price: minPrice,
                                originalPrice: maxOriginalPrice,
                                stock: totalStock
                            }
                        })

                        await tx.productVariant.createMany({
                            data: validVariants.map((v, index) => ({
                                productId: id,
                                name: v.name,
                                price: parseFloat(v.price) || 0,
                                originalPrice: v.originalPrice ? parseFloat(v.originalPrice) : null,
                                stock: parseInt(v.stock) || 0,
                                sortOrder: index,
                                status: 'ACTIVE'
                            }))
                        })
                    }
                }
            }

            // 返回包含规格的商品数据
            return tx.product.findUnique({
                where: { id },
                include: { variants: true }
            })
        })

        res.json({ message: '商品更新成功', product })
    } catch (error) {
        next(error)
    }
}

// 商品管理 - 删除
exports.deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params

        await prisma.product.delete({ where: { id } })

        res.json({ message: '商品删除成功' })
    } catch (error) {
        next(error)
    }
}

// 分类管理
exports.getCategories = async (req, res, next) => {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { sortOrder: 'asc' },
            include: { _count: { select: { products: true } } }
        })

        // 转换格式，添加 productCount 字段
        const formattedCategories = categories.map(cat => ({
            id: cat.id,
            name: cat.name,
            description: cat.description,
            icon: cat.icon,
            status: cat.status,
            sortOrder: cat.sortOrder,
            productCount: cat._count?.products || 0
        }))

        res.json({ categories: formattedCategories })
    } catch (error) {
        next(error)
    }
}

exports.createCategory = async (req, res, next) => {
    try {
        const { name, description, icon, sortOrder } = req.body

        const category = await prisma.category.create({
            data: { name, description, icon, sortOrder: sortOrder || 0 }
        })

        res.status(201).json({ message: '分类创建成功', category })
    } catch (error) {
        next(error)
    }
}

exports.updateCategory = async (req, res, next) => {
    try {
        const { id } = req.params
        const { name, description, icon, sortOrder, status } = req.body

        const category = await prisma.category.update({
            where: { id },
            data: { name, description, icon, sortOrder, status: status?.toUpperCase() }
        })

        res.json({ message: '分类更新成功', category })
    } catch (error) {
        next(error)
    }
}

exports.deleteCategory = async (req, res, next) => {
    try {
        const { id } = req.params

        await prisma.category.delete({ where: { id } })

        res.json({ message: '分类删除成功' })
    } catch (error) {
        next(error)
    }
}

// 订单管理 - 列表
exports.getOrders = async (req, res, next) => {
    try {
        const { page = 1, pageSize = 20, status } = req.query

        const where = {}
        if (status) where.status = status.toUpperCase()

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                include: {
                    product: { select: { name: true, image: true } }
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: parseInt(pageSize)
            }),
            prisma.order.count({ where })
        ])

        res.json({
            orders: orders.map(o => ({
                ...o,
                unitPrice: parseFloat(o.unitPrice),
                totalAmount: parseFloat(o.totalAmount),
                status: o.status.toLowerCase()
            })),
            total,
            page: parseInt(page),
            pageSize: parseInt(pageSize)
        })
    } catch (error) {
        next(error)
    }
}

// 订单管理 - 更新状态
exports.updateOrderStatus = async (req, res, next) => {
    try {
        const { id } = req.params
        const { status } = req.body

        const order = await prisma.order.update({
            where: { id },
            data: { status: status.toUpperCase() }
        })

        res.json({ message: '订单状态更新成功', order })
    } catch (error) {
        next(error)
    }
}

// 订单管理 - 手动发货（完成订单并发送邮件）
exports.shipOrder = async (req, res, next) => {
    try {
        const { id } = req.params
        const { cardContent } = req.body  // 支持手动输入卡密内容
        const emailService = require('../services/emailService')

        // 获取订单和卡密信息
        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                product: true,
                cards: true
            }
        })

        if (!order) {
            return res.status(404).json({ error: '订单不存在' })
        }

        if (order.status !== 'PAID') {
            return res.status(400).json({ error: '只有已支付订单才能发货' })
        }

        // 检查是否需要手动输入卡密
        const hasExistingCards = order.cards && order.cards.length > 0
        const hasManualInput = cardContent && cardContent.trim()

        if (!hasExistingCards && !hasManualInput) {
            return res.status(400).json({
                error: '该订单没有卡密，请输入卡密内容后再发货',
                needCardContent: true,
                orderNo: order.orderNo
            })
        }

        // 如果手动输入了卡密，创建卡密记录并关联到订单
        let newCards = []
        if (hasManualInput) {
            // 按行分割卡密（支持多个卡密）
            const cardLines = cardContent.split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0)
                .slice(0, order.quantity)  // 最多创建订单数量的卡密

            if (cardLines.length > 0) {
                // 创建卡密记录
                for (const content of cardLines) {
                    const card = await prisma.card.create({
                        data: {
                            productId: order.productId,
                            variantId: order.variantId || null,
                            content: content,
                            status: 'SOLD',
                            orderId: order.id,
                            soldAt: new Date()
                        }
                    })
                    newCards.push(card)
                }
            }
        }

        // 更新订单状态为已完成
        const updatedOrder = await prisma.order.update({
            where: { id },
            data: {
                status: 'COMPLETED',
                completedAt: new Date()
            },
            include: {
                product: true,
                cards: true  // 包含刚创建的卡密
            }
        })

        // 发送邮件通知
        let emailSent = false
        try {
            await emailService.sendOrderCompletedEmail(updatedOrder, updatedOrder.cards)
            emailSent = true
        } catch (emailError) {
            console.error('发货邮件发送失败:', emailError)
        }

        res.json({
            message: emailSent ? '发货成功，邮件已发送' : '发货成功，但邮件发送失败',
            order: {
                orderNo: updatedOrder.orderNo,
                status: updatedOrder.status,
                completedAt: updatedOrder.completedAt
            },
            cardsAdded: newCards.length,
            emailSent
        })
    } catch (error) {
        next(error)
    }
}

// 用户管理
exports.getUsers = async (req, res, next) => {
    try {
        const { page = 1, pageSize = 20 } = req.query

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                select: {
                    id: true,
                    email: true,
                    username: true,
                    role: true,
                    createdAt: true,
                    _count: { select: { orders: true } }
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: parseInt(pageSize)
            }),
            prisma.user.count()
        ])

        res.json({ users, total, page: parseInt(page), pageSize: parseInt(pageSize) })
    } catch (error) {
        next(error)
    }
}

// 系统设置
exports.getSettings = async (req, res, next) => {
    try {
        const settings = await prisma.setting.findMany()

        const settingsObj = {}
        settings.forEach(s => {
            settingsObj[s.key] = s.value
        })

        res.json({ settings: settingsObj })
    } catch (error) {
        next(error)
    }
}

exports.updateSettings = async (req, res, next) => {
    try {
        const settings = req.body

        for (const [key, value] of Object.entries(settings)) {
            await prisma.setting.upsert({
                where: { key },
                create: { key, value },
                update: { value }
            })
        }

        res.json({ message: '设置更新成功' })
    } catch (error) {
        next(error)
    }
}

// 测试邮件配置
exports.testEmail = async (req, res, next) => {
    try {
        const emailService = require('../services/emailService')
        const result = await emailService.testEmailConnection()

        if (result.success) {
            res.json({ success: true, message: '邮件配置测试成功，连接正常' })
        } else {
            res.status(400).json({ success: false, error: result.error })
        }
    } catch (error) {
        next(error)
    }
}

// ==================== 卡密管理 ====================

// 获取卡密列表
exports.getCards = async (req, res, next) => {
    try {
        const { productId, variantId, status, page = 1, pageSize = 20 } = req.query

        const where = {}
        if (productId) where.productId = productId
        if (variantId) where.variantId = variantId
        if (status) where.status = status.toUpperCase()

        const [cards, total] = await Promise.all([
            prisma.card.findMany({
                where,
                include: {
                    product: { select: { id: true, name: true } },
                    variant: { select: { id: true, name: true } },
                    order: { select: { orderNo: true } }
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: parseInt(pageSize)
            }),
            prisma.card.count({ where })
        ])

        res.json({
            cards,
            total,
            page: parseInt(page),
            pageSize: parseInt(pageSize),
            totalPages: Math.ceil(total / pageSize)
        })
    } catch (error) {
        next(error)
    }
}

// 批量导入卡密
exports.importCards = async (req, res, next) => {
    try {
        const { productId, variantId, cards } = req.body

        if (!productId) {
            return res.status(400).json({ error: '请选择商品' })
        }

        if (!cards || !Array.isArray(cards) || cards.length === 0) {
            return res.status(400).json({ error: '请提供卡密数据' })
        }

        // 过滤空行并去重
        const uniqueCards = [...new Set(cards.filter(c => c && c.trim()))]

        if (uniqueCards.length === 0) {
            return res.status(400).json({ error: '没有有效的卡密数据' })
        }

        // 批量创建
        const result = await prisma.card.createMany({
            data: uniqueCards.map(content => ({
                productId,
                variantId: variantId || null,
                content: content.trim(),
                status: 'AVAILABLE'
            })),
            skipDuplicates: false
        })

        // 更新库存（商品或规格）
        if (variantId) {
            await prisma.productVariant.update({
                where: { id: variantId },
                data: { stock: { increment: result.count } }
            })
        } else {
            await prisma.product.update({
                where: { id: productId },
                data: { stock: { increment: result.count } }
            })
        }

        res.json({
            message: `成功导入 ${result.count} 个卡密`,
            count: result.count
        })
    } catch (error) {
        next(error)
    }
}

// 删除单个卡密
exports.deleteCard = async (req, res, next) => {
    try {
        const { id } = req.params

        const card = await prisma.card.findUnique({ where: { id } })
        if (!card) {
            return res.status(404).json({ error: '卡密不存在' })
        }

        if (card.status === 'SOLD') {
            return res.status(400).json({ error: '已售出的卡密不能删除' })
        }

        await prisma.card.delete({ where: { id } })

        // 减少商品库存
        await prisma.product.update({
            where: { id: card.productId },
            data: { stock: { decrement: 1 } }
        })

        res.json({ message: '卡密删除成功' })
    } catch (error) {
        next(error)
    }
}

// 批量删除卡密
exports.deleteCards = async (req, res, next) => {
    try {
        const { ids, productId } = req.body

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: '请选择要删除的卡密' })
        }

        // 只能删除可用状态的卡密
        const result = await prisma.card.deleteMany({
            where: {
                id: { in: ids },
                status: 'AVAILABLE'
            }
        })

        // 更新商品库存
        if (productId && result.count > 0) {
            await prisma.product.update({
                where: { id: productId },
                data: { stock: { decrement: result.count } }
            })
        }

        res.json({
            message: `成功删除 ${result.count} 个卡密`,
            count: result.count
        })
    } catch (error) {
        next(error)
    }
}

// 更新单个卡密
exports.updateCard = async (req, res, next) => {
    try {
        const { id } = req.params
        const { content } = req.body

        if (!content || !content.trim()) {
            return res.status(400).json({ error: '卡密内容不能为空' })
        }

        const card = await prisma.card.findUnique({ where: { id } })
        if (!card) {
            return res.status(404).json({ error: '卡密不存在' })
        }

        if (card.status === 'SOLD') {
            return res.status(400).json({ error: '已售出的卡密不能编辑' })
        }

        const updatedCard = await prisma.card.update({
            where: { id },
            data: { content: content.trim() }
        })

        res.json({ message: '卡密更新成功', card: updatedCard })
    } catch (error) {
        next(error)
    }
}

// 手动清理未验证账户
exports.cleanupUnverifiedAccounts = async (req, res, next) => {
    try {
        const days = parseInt(req.query.days) || 14
        const { cleanupUnverifiedAccounts } = require('../utils/accountCleanup')

        const result = await cleanupUnverifiedAccounts(days)

        res.json({
            message: `已清理 ${result.deleted} 个未验证账户`,
            deleted: result.deleted,
            users: result.users || []
        })
    } catch (error) {
        next(error)
    }
}

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
                    _count: { select: { cards: { where: { status: 'AVAILABLE' } } } }
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
                availableCards: p._count.cards
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
        const { name, description, fullDescription, price, originalPrice, categoryId, image, tags } = req.body

        const product = await prisma.product.create({
            data: {
                name,
                description,
                fullDescription,
                price,
                originalPrice,
                categoryId,
                image,
                tags: tags || [],
                status: 'ACTIVE'
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
        const { name, description, fullDescription, price, originalPrice, categoryId, image, tags, status } = req.body

        const product = await prisma.product.update({
            where: { id },
            data: {
                name,
                description,
                fullDescription,
                price,
                originalPrice,
                categoryId,
                image,
                tags,
                status: status?.toUpperCase()
            }
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

        res.json({ categories })
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

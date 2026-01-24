// 商品控制器
const prisma = require('../config/database')

// 获取商品列表
exports.getProducts = async (req, res, next) => {
    try {
        const {
            category,
            status = 'ACTIVE',
            sort = 'createdAt',
            order = 'desc',
            page = 1,
            pageSize = 20
        } = req.query

        const where = {
            status: status.toUpperCase()
        }

        if (category && category !== 'all') {
            where.categoryId = category
        }

        // 排序配置
        const orderBy = {}
        if (sort === 'price') {
            orderBy.price = order
        } else if (sort === 'sales') {
            orderBy.soldCount = order
        } else {
            orderBy.createdAt = order
        }

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    category: {
                        select: { id: true, name: true, icon: true }
                    }
                },
                orderBy,
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
                tags: p.tags || []
            })),
            total,
            page: parseInt(page),
            pageSize: parseInt(pageSize),
            totalPages: Math.ceil(total / pageSize)
        })
    } catch (error) {
        next(error)
    }
}

// 获取热门商品
exports.getHotProducts = async (req, res, next) => {
    try {
        const { limit = 8 } = req.query

        const products = await prisma.product.findMany({
            where: { status: 'ACTIVE' },
            orderBy: { soldCount: 'desc' },
            take: parseInt(limit),
            include: {
                category: {
                    select: { id: true, name: true }
                }
            }
        })

        res.json({
            products: products.map(p => ({
                ...p,
                price: parseFloat(p.price),
                originalPrice: p.originalPrice ? parseFloat(p.originalPrice) : null,
                tags: p.tags || []
            }))
        })
    } catch (error) {
        next(error)
    }
}

// 获取商品详情
exports.getProductById = async (req, res, next) => {
    try {
        const { id } = req.params

        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                category: {
                    select: { id: true, name: true, icon: true }
                }
            }
        })

        if (!product) {
            return res.status(404).json({ error: '商品不存在' })
        }

        res.json({
            product: {
                ...product,
                price: parseFloat(product.price),
                originalPrice: product.originalPrice ? parseFloat(product.originalPrice) : null,
                tags: product.tags || []
            }
        })
    } catch (error) {
        next(error)
    }
}

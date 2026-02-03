// 商品控制器
const prisma = require('../config/database')

// 获取商品列表
exports.getProducts = async (req, res, next) => {
    try {
        const {
            category,
            categoryId,
            search,
            status = 'ACTIVE',
            sort = 'createdAt',
            order = 'desc',
            page = 1,
            pageSize = 20
        } = req.query

        const where = {
            status: status.toUpperCase()
        }

        // 支持 category 和 categoryId 两种参数名
        const catId = categoryId || category
        if (catId && catId !== 'all') {
            where.categoryId = catId
        }

        // 搜索功能 - 支持商品名称、描述、分类名、标签
        if (search && search.trim()) {
            const searchTerm = search.trim()
            where.OR = [
                { name: { contains: searchTerm } },
                { description: { contains: searchTerm } },
                // 搜索分类名称
                { category: { name: { contains: searchTerm } } },
                // 搜索标签 (tags 存储为 JSON 字符串)
                { tags: { string_contains: searchTerm } }
            ]
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
                    },
                    variants: {
                        where: { status: 'ACTIVE' },
                        orderBy: { sortOrder: 'asc' }
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
                },
                variants: {
                    where: { status: 'ACTIVE' },
                    orderBy: { sortOrder: 'asc' }
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
                },
                variants: {
                    where: { status: 'ACTIVE' },
                    orderBy: { sortOrder: 'asc' }
                }
            }
        })

        if (!product) {
            return res.status(404).json({ error: '商品不存在' })
        }

        // 查询库存计算模式设置
        const stockModeSetting = await prisma.setting.findUnique({
            where: { key: 'stockMode' }
        })
        const stockMode = stockModeSetting?.value || 'auto'

        let baseStock, variantsWithStock

        if (stockMode === 'manual') {
            // 手动模式：使用商品表的 stock 字段
            baseStock = product.stock || 0
            variantsWithStock = (product.variants || []).map(v => ({
                ...v,
                price: parseFloat(v.price),
                originalPrice: v.originalPrice ? parseFloat(v.originalPrice) : null,
                stock: v.stock || 0
            }))
        } else {
            // 自动模式：使用可用卡密数量
            baseStock = await prisma.card.count({
                where: {
                    productId: id,
                    variantId: null,
                    status: 'AVAILABLE'
                }
            })

            variantsWithStock = await Promise.all(
                (product.variants || []).map(async (v) => {
                    const variantStock = await prisma.card.count({
                        where: {
                            productId: id,
                            variantId: v.id,
                            status: 'AVAILABLE'
                        }
                    })
                    return {
                        ...v,
                        price: parseFloat(v.price),
                        originalPrice: v.originalPrice ? parseFloat(v.originalPrice) : null,
                        stock: variantStock
                    }
                })
            )
        }

        res.json({
            ...product,
            price: parseFloat(product.price),
            originalPrice: product.originalPrice ? parseFloat(product.originalPrice) : null,
            tags: product.tags || [],
            stock: baseStock,
            variants: variantsWithStock
        })
    } catch (error) {
        next(error)
    }
}

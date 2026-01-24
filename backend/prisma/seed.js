// 数据库种子数据
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 开始填充种子数据...')

    // 创建管理员账号
    const adminPassword = await bcrypt.hash('admin123', 10)
    const admin = await prisma.user.upsert({
        where: { email: 'admin@kashop.com' },
        update: {},
        create: {
            email: 'admin@kashop.com',
            password: adminPassword,
            username: 'Admin',
            role: 'ADMIN'
        }
    })
    console.log('✅ 管理员账号创建成功:', admin.email)

    // 创建分类
    const categories = [
        { name: '游戏账号', description: '各类游戏账号', icon: '🎮', sortOrder: 1 },
        { name: '视频会员', description: '视频、音乐等会员', icon: '📺', sortOrder: 2 },
        { name: '音乐会员', description: '音乐平台会员', icon: '🎵', sortOrder: 3 },
        { name: '软件激活', description: '正版软件激活码', icon: '💿', sortOrder: 4 },
        { name: '社交账号', description: '社交平台账号', icon: '💬', sortOrder: 5 },
        { name: '网盘会员', description: '网盘存储服务', icon: '☁️', sortOrder: 6 }
    ]

    for (const cat of categories) {
        await prisma.category.upsert({
            where: { id: cat.name },
            update: cat,
            create: { ...cat, id: cat.name.toLowerCase().replace(/\s+/g, '-') }
        })
    }
    console.log('✅ 分类创建成功')

    // 获取分类
    const catList = await prisma.category.findMany()
    const catMap = {}
    catList.forEach(c => catMap[c.name] = c.id)

    // 创建商品
    const products = [
        {
            name: 'Netflix 高级会员月卡',
            description: '美区 Netflix Premium 一个月会员，支持 4K 超高清画质，可同时 4 台设备观看',
            fullDescription: `【商品说明】
• 美区 Netflix Premium 会员一个月
• 支持 4K 超高清画质
• 可同时 4 台设备观看

【使用方法】
1. 收到卡密后，访问 Netflix 官网
2. 使用提供的账号密码登录
3. 即可享受 Premium 会员服务`,
            price: 49.90,
            originalPrice: 89.00,
            categoryId: catMap['视频会员'],
            image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400&h=300&fit=crop',
            tags: ['热销', '4K']
        },
        {
            name: 'Spotify Premium 月卡',
            description: 'Spotify 高级会员一个月，无广告畅听，支持离线下载',
            fullDescription: '【商品说明】\n• Spotify Premium 会员一个月\n• 无广告音乐播放\n• 支持离线下载',
            price: 19.90,
            originalPrice: 35.00,
            categoryId: catMap['音乐会员'],
            image: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=400&h=300&fit=crop',
            tags: ['热销']
        },
        {
            name: 'Steam 游戏账号 - GTA5',
            description: '正版 GTA5 Steam 账号，可改密绑定，终身使用',
            fullDescription: '【商品说明】\n• 正版 GTA5 Steam 账号\n• 可修改密码和绑定信息\n• 终身使用',
            price: 68.00,
            originalPrice: 129.00,
            categoryId: catMap['游戏账号'],
            image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=300&fit=crop',
            tags: ['正版']
        },
        {
            name: 'ChatGPT Plus 月卡',
            description: 'OpenAI ChatGPT Plus 会员一个月，GPT-4 无限制使用',
            fullDescription: '【商品说明】\n• ChatGPT Plus 会员一个月\n• GPT-4 无限制使用\n• 优先响应速度',
            price: 149.00,
            originalPrice: 199.00,
            categoryId: catMap['软件激活'],
            image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
            tags: ['热销', 'AI']
        },
        {
            name: 'YouTube Premium 年卡',
            description: 'YouTube Premium 会员一年，无广告观看，支持后台播放和离线下载',
            fullDescription: '【商品说明】\n• YouTube Premium 一年会员\n• 无广告观看视频\n• 支持后台播放',
            price: 168.00,
            originalPrice: 299.00,
            categoryId: catMap['视频会员'],
            image: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=400&h=300&fit=crop',
            tags: ['年卡', '超值']
        },
        {
            name: '百度网盘超级会员月卡',
            description: '百度网盘超级会员一个月，极速下载，5T 空间',
            fullDescription: '【商品说明】\n• 百度网盘超级会员一个月\n• 极速下载通道\n• 5TB 存储空间',
            price: 25.00,
            originalPrice: 30.00,
            categoryId: catMap['网盘会员'],
            image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=300&fit=crop',
            tags: ['热销']
        }
    ]

    for (const prod of products) {
        const created = await prisma.product.create({
            data: {
                ...prod,
                status: 'ACTIVE',
                stock: 0,
                soldCount: Math.floor(Math.random() * 2000) + 500
            }
        })

        // 为每个商品创建一些测试卡密
        const cards = []
        for (let i = 0; i < 10; i++) {
            cards.push({
                productId: created.id,
                content: `账号: test_user_${i}@example.com\n密码: TestPass${i}2024!`,
                status: 'AVAILABLE'
            })
        }
        await prisma.card.createMany({ data: cards })

        // 更新库存
        await prisma.product.update({
            where: { id: created.id },
            data: { stock: 10 }
        })
    }
    console.log('✅ 商品和卡密创建成功')

    console.log('🎉 种子数据填充完成!')
}

main()
    .catch((e) => {
        console.error('❌ 种子数据填充失败:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

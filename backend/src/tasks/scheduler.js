// 定时任务调度器
const cron = require('node-cron')
const prisma = require('../config/database')
const { cleanupUnverifiedAccounts } = require('../utils/accountCleanup')
const logger = require('../utils/logger')

// 自动取消超时未支付订单
const cancelExpiredOrders = async () => {
    try {
        // 获取设置中的超时时间（默认15分钟）
        const setting = await prisma.setting.findUnique({
            where: { key: 'orderTimeout' }
        })
        const timeoutMinutes = parseInt(setting?.value) || 15

        const expireTime = new Date(Date.now() - timeoutMinutes * 60 * 1000)

        // 查找并取消超时订单
        const result = await prisma.order.updateMany({
            where: {
                status: 'PENDING',
                createdAt: { lt: expireTime }
            },
            data: {
                status: 'CANCELLED',
                cancelledAt: new Date()
            }
        })

        if (result.count > 0) {
            logger.info(`自动取消了 ${result.count} 个超时订单`)
        }
    } catch (error) {
        logger.error('自动取消订单任务失败:', error)
    }
}

const initScheduledTasks = () => {
    // 每天凌晨 3 点执行清理任务
    cron.schedule('0 3 * * *', async () => {
        logger.info('开始执行定时清理未验证账户...')
        try {
            const result = await cleanupUnverifiedAccounts(14) // 14天未验证
            logger.info(`定时清理完成: 删除了 ${result.deleted} 个账户`)
        } catch (error) {
            logger.error('定时清理任务失败:', error)
        }
    }, {
        timezone: 'Asia/Shanghai'
    })

    // 每分钟检查并取消超时订单
    cron.schedule('* * * * *', cancelExpiredOrders)

    logger.info('✅ 定时任务已启动: 每天 3:00 清理未验证账户, 每分钟检查超时订单')
}

module.exports = { initScheduledTasks, cancelExpiredOrders }

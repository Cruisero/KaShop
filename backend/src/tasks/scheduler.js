// 定时任务调度器
const cron = require('node-cron')
const { cleanupUnverifiedAccounts } = require('../utils/accountCleanup')
const logger = require('../utils/logger')

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

    logger.info('✅ 定时任务已启动: 每天 3:00 清理未验证账户')
}

module.exports = { initScheduledTasks }

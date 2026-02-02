const nodemailer = require('nodemailer')
const prisma = require('../config/database')

// 获取邮件配置
const getEmailConfig = async () => {
    const settings = await prisma.setting.findMany({
        where: {
            key: {
                in: ['smtpHost', 'smtpPort', 'smtpUser', 'smtpPass', 'emailNotify', 'senderName']
            }
        }
    })

    const config = {}
    settings.forEach(s => {
        if (s.key === 'smtpPort') {
            config[s.key] = parseInt(s.value) || 465
        } else if (s.key === 'emailNotify') {
            config[s.key] = s.value === 'true'
        } else {
            config[s.key] = s.value
        }
    })

    return config
}

// 创建邮件传输器
const createTransporter = async () => {
    const config = await getEmailConfig()

    if (!config.smtpHost || !config.smtpUser || !config.smtpPass) {
        return null
    }

    return nodemailer.createTransport({
        host: config.smtpHost,
        port: config.smtpPort || 465,
        secure: (config.smtpPort || 465) === 465,
        auth: {
            user: config.smtpUser,
            pass: config.smtpPass
        }
    })
}

// 发送订单完成邮件（包含卡密）
const sendOrderCompletedEmail = async (order, cards) => {
    try {
        const config = await getEmailConfig()

        // 检查是否启用邮件通知
        if (!config.emailNotify) {
            console.log('邮件通知已禁用')
            return { success: false, reason: 'disabled' }
        }

        const transporter = await createTransporter()
        if (!transporter) {
            console.log('邮件配置不完整')
            return { success: false, reason: 'config_missing' }
        }

        // 构建卡密列表 HTML
        const cardsHtml = cards && cards.length > 0
            ? cards.map((card, index) => `
                <div style="background: #f8f9fa; padding: 12px 16px; margin: 8px 0; border-radius: 8px; font-family: monospace; border-left: 4px solid #ef4444;">
                    <strong>卡密 ${index + 1}:</strong> ${card.content}
                </div>
            `).join('')
            : '<p style="color: #666;">此商品无卡密信息，请等待商家处理。</p>'

        // 邮件内容
        const mailOptions = {
            from: `"${config.senderName || 'HaoDongXi'}" <${config.smtpUser}>`,
            to: order.email,
            subject: `【订单完成】您的订单 ${order.orderNo} 已完成`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
                        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
                        .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center; }
                        .header h1 { color: white; margin: 0; font-size: 24px; }
                        .content { padding: 30px; }
                        .order-info { background: #f8f9fa; padding: 20px; border-radius: 12px; margin-bottom: 24px; }
                        .order-info p { margin: 8px 0; color: #333; }
                        .cards-section { margin-top: 24px; }
                        .cards-section h3 { color: #333; margin-bottom: 16px; }
                        .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; border-top: 1px solid #eee; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎉 订单完成通知</h1>
                        </div>
                        <div class="content">
                            <p>您好！</p>
                            <p>您的订单已完成，以下是订单详情：</p>
                            
                            <div class="order-info">
                                <p><strong>订单号：</strong>${order.orderNo}</p>
                                <p><strong>商品：</strong>${order.product?.name || '商品'}</p>
                                <p><strong>数量：</strong>${order.quantity}</p>
                                <p><strong>金额：</strong>¥${order.totalAmount}</p>
                                <p><strong>下单时间：</strong>${new Date(order.createdAt).toLocaleString('zh-CN')}</p>
                            </div>
                            
                            <div class="cards-section">
                                <h3>📦 您购买的卡密</h3>
                                ${cardsHtml}
                            </div>
                            
                            <p style="margin-top: 24px; color: #666;">
                                请妥善保管以上信息，如有问题请联系客服。
                            </p>
                        </div>
                        <div class="footer">
                            <p>此邮件由系统自动发送，请勿回复。</p>
                            <p>© ${new Date().getFullYear()} HaoDongXi</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        }

        const result = await transporter.sendMail(mailOptions)
        console.log('邮件发送成功:', result.messageId)
        return { success: true, messageId: result.messageId }
    } catch (error) {
        console.error('邮件发送失败:', error)
        return { success: false, error: error.message }
    }
}

// 发送邮箱验证邮件
const sendVerificationEmail = async (user, token, baseUrl = 'http://localhost:3000') => {
    try {
        const config = await getEmailConfig()

        const transporter = await createTransporter()
        if (!transporter) {
            console.log('邮件配置不完整，无法发送验证邮件')
            return { success: false, reason: 'config_missing' }
        }

        const verifyUrl = `${baseUrl}/verify-email?token=${token}`

        const mailOptions = {
            from: `"${config.senderName || 'HaoDongXi'}" <${config.smtpUser}>`,
            to: user.email,
            subject: '【HaoDongXi】请验证您的邮箱',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
                        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
                        .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center; }
                        .header h1 { color: white; margin: 0; font-size: 24px; }
                        .content { padding: 30px; text-align: center; }
                        .verify-btn { display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
                        .link-text { word-break: break-all; background: #f8f9fa; padding: 15px; border-radius: 8px; font-size: 12px; color: #666; }
                        .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; border-top: 1px solid #eee; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>📧 邮箱验证</h1>
                        </div>
                        <div class="content">
                            <p>您好，${user.username || user.email}！</p>
                            <p>感谢您注册 HaoDongXi。请点击下方按钮验证您的邮箱：</p>
                            
                            <a href="${verifyUrl}" class="verify-btn">验证邮箱</a>
                            
                            <p style="color: #666; font-size: 14px;">如果按钮无法点击，请复制以下链接到浏览器打开：</p>
                            <div class="link-text">${verifyUrl}</div>
                            
                            <p style="color: #999; font-size: 12px; margin-top: 20px;">
                                此链接24小时内有效。如非本人操作，请忽略此邮件。
                            </p>
                        </div>
                        <div class="footer">
                            <p>此邮件由系统自动发送，请勿回复。</p>
                            <p>© ${new Date().getFullYear()} HaoDongXi</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        }

        const result = await transporter.sendMail(mailOptions)
        console.log('验证邮件发送成功:', result.messageId)
        return { success: true, messageId: result.messageId }
    } catch (error) {
        console.error('验证邮件发送失败:', error)
        return { success: false, error: error.message }
    }
}

// 测试邮件连接
const testEmailConnection = async () => {
    try {
        const transporter = await createTransporter()
        if (!transporter) {
            return { success: false, error: '邮件配置不完整' }
        }

        await transporter.verify()
        return { success: true }
    } catch (error) {
        return { success: false, error: error.message }
    }
}

module.exports = {
    getEmailConfig,
    sendOrderCompletedEmail,
    sendVerificationEmail,
    testEmailConnection
}

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
                <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 14px 18px; margin: 10px 0; border-radius: 10px; font-family: 'Monaco', 'Menlo', monospace; border-left: 4px solid #0ea5e9; font-size: 14px;">
                    <span style="color: #0369a1; font-weight: 600;">卡密 ${index + 1}:</span>
                    <span style="color: #1e293b; margin-left: 8px;">${card.content}</span>
                </div>
            `).join('')
            : '<p style="color: #64748b; text-align: center; padding: 20px;">此商品无卡密信息，请等待商家处理。</p>'

        // 邮件内容
        const mailOptions = {
            from: `"${config.senderName || 'HaoDongXi'}" <${config.smtpUser}>`,
            to: order.email,
            subject: `【订单完成】您的订单 ${order.orderNo} 已完成 - HaoDongXi`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif; background: #f1f5f9; margin: 0; padding: 30px 15px;">
                    <div style="max-width: 580px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.08);">
                        
                        <!-- Header -->
                        <div style="background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #14b8a6 100%); padding: 40px 30px; text-align: center;">
                            <div style="font-size: 48px; margin-bottom: 12px;">✨</div>
                            <h1 style="color: white; margin: 0; font-size: 26px; font-weight: 600; letter-spacing: 1px;">订单完成通知</h1>
                            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 14px;">感谢您的购买！</p>
                        </div>
                        
                        <!-- Content -->
                        <div style="padding: 35px 30px;">
                            <p style="color: #334155; font-size: 16px; margin: 0 0 20px; line-height: 1.6;">您好！</p>
                            <p style="color: #475569; font-size: 15px; margin: 0 0 25px; line-height: 1.6;">您的订单已成功完成，以下是详细信息：</p>
                            
                            <!-- Order Info Card -->
                            <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); padding: 24px; border-radius: 14px; margin-bottom: 28px; border: 1px solid #e2e8f0;">
                                <table style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                        <td style="padding: 10px 0; color: #64748b; font-size: 14px; border-bottom: 1px solid #e2e8f0;">订单号</td>
                                        <td style="padding: 10px 0; color: #1e293b; font-size: 14px; text-align: right; font-weight: 600; border-bottom: 1px solid #e2e8f0;">${order.orderNo}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 10px 0; color: #64748b; font-size: 14px; border-bottom: 1px solid #e2e8f0;">商品名称</td>
                                        <td style="padding: 10px 0; color: #1e293b; font-size: 14px; text-align: right; font-weight: 500; border-bottom: 1px solid #e2e8f0;">${order.product?.name || order.productName || '商品'}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 10px 0; color: #64748b; font-size: 14px; border-bottom: 1px solid #e2e8f0;">购买数量</td>
                                        <td style="padding: 10px 0; color: #1e293b; font-size: 14px; text-align: right; font-weight: 500; border-bottom: 1px solid #e2e8f0;">${order.quantity} 件</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 10px 0; color: #64748b; font-size: 14px; border-bottom: 1px solid #e2e8f0;">支付金额</td>
                                        <td style="padding: 10px 0; color: #0ea5e9; font-size: 18px; text-align: right; font-weight: 700; border-bottom: 1px solid #e2e8f0;">¥${order.totalAmount}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 10px 0; color: #64748b; font-size: 14px;">下单时间</td>
                                        <td style="padding: 10px 0; color: #64748b; font-size: 13px; text-align: right;">${new Date(order.createdAt).toLocaleString('zh-CN')}</td>
                                    </tr>
                                </table>
                            </div>
                            
                            <!-- Cards Section -->
                            <div style="margin-top: 28px;">
                                <h3 style="color: #1e293b; font-size: 17px; margin: 0 0 16px; display: flex; align-items: center;">
                                    <span style="display: inline-block; width: 4px; height: 20px; background: linear-gradient(180deg, #0ea5e9, #14b8a6); border-radius: 2px; margin-right: 10px;"></span>
                                    您购买的卡密
                                </h3>
                                ${cardsHtml}
                            </div>
                            
                            <!-- Notice -->
                            <div style="margin-top: 28px; padding: 16px 20px; background: #fffbeb; border-radius: 10px; border: 1px solid #fef3c7;">
                                <p style="color: #92400e; font-size: 13px; margin: 0; line-height: 1.6;">
                                    ⚠️ 请妥善保管以上卡密信息，避免泄露。如有问题请联系客服。
                                </p>
                            </div>
                        </div>
                        
                        <!-- Footer -->
                        <div style="text-align: center; padding: 25px 30px; background: #f8fafc; border-top: 1px solid #e2e8f0;">
                            <p style="color: #94a3b8; font-size: 12px; margin: 0 0 8px;">此邮件由系统自动发送，请勿直接回复</p>
                            <p style="color: #64748b; font-size: 13px; margin: 0; font-weight: 500;">© ${new Date().getFullYear()} HaoDongXi · 好东西购物平台</p>
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
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif; background: #f1f5f9; margin: 0; padding: 30px 15px;">
                    <div style="max-width: 580px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.08);">
                        
                        <!-- Header -->
                        <div style="background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #14b8a6 100%); padding: 40px 30px; text-align: center;">
                            <div style="font-size: 48px; margin-bottom: 12px;">📧</div>
                            <h1 style="color: white; margin: 0; font-size: 26px; font-weight: 600; letter-spacing: 1px;">邮箱验证</h1>
                            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 14px;">验证您的账号邮箱</p>
                        </div>
                        
                        <!-- Content -->
                        <div style="padding: 35px 30px; text-align: center;">
                            <p style="color: #334155; font-size: 16px; margin: 0 0 20px; line-height: 1.6;">您好，${user.username || user.email}！</p>
                            <p style="color: #475569; font-size: 15px; margin: 0 0 25px; line-height: 1.6;">感谢您注册 HaoDongXi。请点击下方按钮验证您的邮箱：</p>
                            
                            <!-- Verify Button -->
                            <div style="margin: 32px 0;">
                                <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%); color: white; padding: 16px 48px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(14, 165, 233, 0.3);">验证邮箱</a>
                            </div>
                            
                            <!-- Fallback Link -->
                            <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); padding: 20px; border-radius: 12px; margin: 24px 0; border: 1px solid #e2e8f0; text-align: left;">
                                <p style="color: #64748b; font-size: 13px; margin: 0 0 10px;">如果按钮无法点击，请复制以下链接到浏览器打开：</p>
                                <p style="word-break: break-all; color: #0ea5e9; font-size: 12px; margin: 0; line-height: 1.6;">${verifyUrl}</p>
                            </div>
                            
                            <!-- Notice -->
                            <p style="color: #94a3b8; font-size: 13px; margin-top: 20px; line-height: 1.6;">
                                此链接24小时内有效。如非本人操作，请忽略此邮件。
                            </p>
                        </div>
                        
                        <!-- Footer -->
                        <div style="text-align: center; padding: 25px 30px; background: #f8fafc; border-top: 1px solid #e2e8f0;">
                            <p style="color: #94a3b8; font-size: 12px; margin: 0 0 8px;">此邮件由系统自动发送，请勿直接回复</p>
                            <p style="color: #64748b; font-size: 13px; margin: 0; font-weight: 500;">© ${new Date().getFullYear()} HaoDongXi · 好东西购物平台</p>
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

// 测试邮件连接（带超时）
const testEmailConnection = async () => {
    try {
        const transporter = await createTransporter()
        if (!transporter) {
            return { success: false, error: '邮件配置不完整，请填写 SMTP 服务器、用户名和密码' }
        }

        // 添加超时机制
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('连接超时，请检查 SMTP 服务器地址和端口是否正确，或者服务器是否阻止了 SMTP 端口')), 10000)
        )

        await Promise.race([transporter.verify(), timeoutPromise])
        return { success: true }
    } catch (error) {
        return { success: false, error: error.message }
    }
}

// 发送密码重置邮件
const sendPasswordResetEmail = async (user, resetToken, baseUrl) => {
    try {
        const config = await getEmailConfig()
        const transporter = await createTransporter()

        if (!transporter) {
            return { success: false, reason: 'config_missing' }
        }

        const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`

        const mailOptions = {
            from: `"${config.senderName || 'HaoDongXi'}" <${config.smtpUser}>`,
            to: user.email,
            subject: '【密码重置】重置您的 HaoDongXi 账号密码',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif; background: #f1f5f9; margin: 0; padding: 30px 15px;">
                    <div style="max-width: 580px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.08);">
                        
                        <!-- Header -->
                        <div style="background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #14b8a6 100%); padding: 40px 30px; text-align: center;">
                            <div style="font-size: 48px; margin-bottom: 12px;">🔐</div>
                            <h1 style="color: white; margin: 0; font-size: 26px; font-weight: 600; letter-spacing: 1px;">密码重置</h1>
                            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 14px;">安全重置您的账号密码</p>
                        </div>
                        
                        <!-- Content -->
                        <div style="padding: 35px 30px;">
                            <p style="color: #334155; font-size: 16px; margin: 0 0 20px; line-height: 1.6;">您好，${user.username || user.email.split('@')[0]}！</p>
                            <p style="color: #475569; font-size: 15px; margin: 0 0 25px; line-height: 1.6;">我们收到了您重置密码的请求。请点击下面的按钮设置新密码：</p>
                            
                            <!-- Reset Button -->
                            <div style="text-align: center; margin: 32px 0;">
                                <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%); color: white; padding: 16px 48px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(14, 165, 233, 0.3);">重置密码</a>
                            </div>
                            
                            <!-- Fallback Link -->
                            <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); padding: 20px; border-radius: 12px; margin: 24px 0; border: 1px solid #e2e8f0;">
                                <p style="color: #64748b; font-size: 13px; margin: 0 0 10px;">如果按钮无法点击，请复制以下链接到浏览器：</p>
                                <p style="word-break: break-all; color: #0ea5e9; font-size: 12px; margin: 0; line-height: 1.6;">${resetUrl}</p>
                            </div>
                            
                            <!-- Warning -->
                            <div style="margin-top: 24px; padding: 16px 20px; background: #fffbeb; border-radius: 10px; border: 1px solid #fef3c7;">
                                <p style="color: #92400e; font-size: 13px; margin: 0; line-height: 1.6;">
                                    ⚠️ 此链接将在 30 分钟后失效。如果您没有请求重置密码，请忽略此邮件。
                                </p>
                            </div>
                        </div>
                        
                        <!-- Footer -->
                        <div style="text-align: center; padding: 25px 30px; background: #f8fafc; border-top: 1px solid #e2e8f0;">
                            <p style="color: #94a3b8; font-size: 12px; margin: 0 0 8px;">此邮件由系统自动发送，请勿直接回复</p>
                            <p style="color: #64748b; font-size: 13px; margin: 0; font-weight: 500;">© ${new Date().getFullYear()} HaoDongXi · 好东西购物平台</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        }

        const result = await transporter.sendMail(mailOptions)
        console.log('密码重置邮件发送成功:', result.messageId)
        return { success: true, messageId: result.messageId }
    } catch (error) {
        console.error('密码重置邮件发送失败:', error)
        return { success: false, error: error.message }
    }
}

// 发送工单回复通知邮件
const sendTicketReplyNotification = async (email, username, ticketNo, subject, replyContent) => {
    try {
        const config = await getEmailConfig()

        if (!config.emailNotify) {
            console.log('邮件通知已禁用')
            return { success: false, reason: 'disabled' }
        }

        const transporter = await createTransporter()
        if (!transporter) {
            console.log('邮件配置不完整')
            return { success: false, reason: 'config_missing' }
        }

        const mailOptions = {
            from: `"${config.senderName || 'HaoDongXi'}" <${config.smtpUser}>`,
            to: email,
            subject: `【工单回复】您的工单 ${ticketNo} 有新回复 - HaoDongXi`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif; background: #f1f5f9; margin: 0; padding: 30px 15px;">
                    <div style="max-width: 580px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.08);">
                        
                        <!-- Header -->
                        <div style="background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #d946ef 100%); padding: 40px 30px; text-align: center;">
                            <div style="font-size: 48px; margin-bottom: 12px;">💬</div>
                            <h1 style="color: white; margin: 0; font-size: 26px; font-weight: 600; letter-spacing: 1px;">工单回复通知</h1>
                            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 14px;">您的工单有新的回复</p>
                        </div>
                        
                        <!-- Content -->
                        <div style="padding: 35px 30px;">
                            <p style="color: #334155; font-size: 16px; margin: 0 0 20px; line-height: 1.6;">您好，${username}！</p>
                            <p style="color: #475569; font-size: 15px; margin: 0 0 25px; line-height: 1.6;">您的工单有了新的回复，以下是详细信息：</p>
                            
                            <!-- Ticket Info Card -->
                            <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); padding: 24px; border-radius: 14px; margin-bottom: 28px; border: 1px solid #e2e8f0;">
                                <table style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                        <td style="padding: 10px 0; color: #64748b; font-size: 14px; border-bottom: 1px solid #e2e8f0;">工单号</td>
                                        <td style="padding: 10px 0; color: #1e293b; font-size: 14px; text-align: right; font-weight: 600; border-bottom: 1px solid #e2e8f0;">${ticketNo}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 10px 0; color: #64748b; font-size: 14px;">主题</td>
                                        <td style="padding: 10px 0; color: #1e293b; font-size: 14px; text-align: right; font-weight: 500;">${subject}</td>
                                    </tr>
                                </table>
                            </div>
                            
                            <!-- Reply Content -->
                            <div style="margin-top: 28px;">
                                <h3 style="color: #1e293b; font-size: 17px; margin: 0 0 16px; display: flex; align-items: center;">
                                    <span style="display: inline-block; width: 4px; height: 20px; background: linear-gradient(180deg, #8b5cf6, #d946ef); border-radius: 2px; margin-right: 10px;"></span>
                                    客服回复
                                </h3>
                                <div style="background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%); padding: 18px 20px; border-radius: 12px; border-left: 4px solid #a855f7;">
                                    <p style="color: #475569; font-size: 14px; margin: 0; line-height: 1.8; white-space: pre-wrap;">${replyContent}</p>
                                </div>
                            </div>
                            
                            <!-- Action Button -->
                            <div style="text-align: center; margin: 32px 0;">
                                <a href="${process.env.FRONTEND_URL || 'https://haodongxi.shop'}/tickets" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);">查看工单详情</a>
                            </div>
                        </div>
                        
                        <!-- Footer -->
                        <div style="text-align: center; padding: 25px 30px; background: #f8fafc; border-top: 1px solid #e2e8f0;">
                            <p style="color: #94a3b8; font-size: 12px; margin: 0 0 8px;">此邮件由系统自动发送，请勿直接回复</p>
                            <p style="color: #64748b; font-size: 13px; margin: 0; font-weight: 500;">© ${new Date().getFullYear()} HaoDongXi · 好东西购物平台</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        }

        const result = await transporter.sendMail(mailOptions)
        console.log('工单回复通知邮件发送成功:', result.messageId)
        return { success: true, messageId: result.messageId }
    } catch (error) {
        console.error('工单回复通知邮件发送失败:', error)
        return { success: false, error: error.message }
    }
}

module.exports = {
    getEmailConfig,
    sendOrderCompletedEmail,
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendTicketReplyNotification,
    testEmailConnection
}


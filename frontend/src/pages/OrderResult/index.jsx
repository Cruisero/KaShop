import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FiCheck, FiClock, FiCopy, FiPackage, FiAlertCircle } from 'react-icons/fi'
import toast from 'react-hot-toast'
import './OrderResult.css'

const statusConfig = {
    pending: { label: '待支付', icon: FiClock, color: 'warning' },
    paid: { label: '已支付', icon: FiCheck, color: 'info' },
    completed: { label: '已完成', icon: FiCheck, color: 'success' },
    cancelled: { label: '已取消', icon: FiAlertCircle, color: 'error' },
}

function OrderResult() {
    const { orderNo } = useParams()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [showCards, setShowCards] = useState(false)
    const [paying, setPaying] = useState(false)

    useEffect(() => {
        const fetchOrder = async () => {
            setLoading(true)
            try {
                const res = await fetch(`/api/orders/${orderNo}`)
                const data = await res.json()

                if (data.error || !data.order) {
                    setOrder(null)
                } else {
                    const orderData = data.order
                    // 格式化订单数据以匹配现有结构
                    setOrder({
                        orderNo: orderData.orderNo,
                        status: orderData.status?.toLowerCase() || 'pending',
                        email: orderData.email,
                        product: {
                            name: orderData.productName || orderData.product?.name,
                            image: orderData.product?.image || 'https://via.placeholder.com/200x150',
                        },
                        quantity: orderData.quantity,
                        totalAmount: parseFloat(orderData.totalAmount) || 0,
                        paymentMethod: orderData.paymentMethod === 'alipay' ? '支付宝' :
                            orderData.paymentMethod === 'wechat' ? '微信支付' : orderData.paymentMethod,
                        createdAt: orderData.createdAt ? new Date(orderData.createdAt).toLocaleString() : '',
                        paidAt: orderData.paidAt ? new Date(orderData.paidAt).toLocaleString() : null,
                        cards: (orderData.cards || []).map((c, idx) => ({
                            id: idx + 1,
                            content: c.content || c
                        }))
                    })
                }
            } catch (error) {
                console.error('获取订单失败:', error)
                setOrder(null)
            } finally {
                setLoading(false)
            }
        }

        if (orderNo) fetchOrder()
    }, [orderNo])

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success('已复制到剪贴板')
        }).catch(() => {
            toast.error('复制失败')
        })
    }

    const [qrCodeUrl, setQrCodeUrl] = useState(null)
    const [usdtPayment, setUsdtPayment] = useState(null)
    const [countdown, setCountdown] = useState(null) // 倒计时秒数
    const ORDER_TIMEOUT_MINUTES = 15 // 订单超时时间（分钟）

    // 订单倒计时
    useEffect(() => {
        if (!order || order.status !== 'pending') {
            setCountdown(null)
            return
        }

        const calculateRemaining = () => {
            const createdAt = new Date(order.createdAt).getTime()
            const expireAt = createdAt + ORDER_TIMEOUT_MINUTES * 60 * 1000
            const remaining = Math.max(0, Math.floor((expireAt - Date.now()) / 1000))
            return remaining
        }

        setCountdown(calculateRemaining())

        const timer = setInterval(() => {
            const remaining = calculateRemaining()
            setCountdown(remaining)

            if (remaining <= 0) {
                clearInterval(timer)
                // 订单已过期，刷新页面获取最新状态
                fetchOrder()
            }
        }, 1000)

        return () => clearInterval(timer)
    }, [order])

    // 格式化倒计时显示
    const formatCountdown = (seconds) => {
        if (seconds === null || seconds <= 0) return '已过期'
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    // 轮询支付状态 - 当显示二维码或USDT支付时启动
    useEffect(() => {
        // 只有显示支付信息并且订单状态为待支付时才轮询
        if ((!qrCodeUrl && !usdtPayment) || order?.status !== 'pending') {
            return
        }

        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/payment/status/${order.orderNo}`)
                const data = await res.json()
                if (data.orderStatus === 'paid' || data.orderStatus === 'completed') {
                    setQrCodeUrl(null)
                    toast.success('支付成功！')
                    // 刷新订单信息
                    window.location.reload()
                }
            } catch (error) {
                console.error('轮询支付状态失败:', error)
            }
        }, 3000) // 每3秒检查一次

        return () => clearInterval(interval)
    }, [qrCodeUrl, order?.orderNo, order?.status])

    // 订单待支付时自动生成二维码
    useEffect(() => {
        if (order?.status === 'pending' && !qrCodeUrl && !paying) {
            handlePayment()
        }
    }, [order?.status])

    const handlePayment = async () => {
        if (!order || paying) return
        setPaying(true)
        try {
            // 确定支付方式
            let paymentMethod = 'alipay'
            if (order.paymentMethod === '微信支付') {
                paymentMethod = 'wechat'
            } else if (order.paymentMethod === 'USDT-TRC20' || order.paymentMethod === 'usdt') {
                paymentMethod = 'usdt'
            }

            const res = await fetch('/api/payment/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderNo: order.orderNo,
                    paymentMethod: paymentMethod
                })
            })
            const data = await res.json()

            if (data.paymentType === 'usdt') {
                // USDT支付
                setUsdtPayment({
                    walletAddress: data.walletAddress,
                    usdtAmount: data.usdtAmount,
                    qrContent: data.qrContent,
                    exchangeRate: data.exchangeRate
                })
                toast.success('请向指定地址转账 USDT')
            } else if (data.paymentType === 'qrcode' && data.qrCode) {
                // 支付宝二维码
                setQrCodeUrl(data.qrCode)
                toast.success('请使用支付宝扫描二维码支付')
            } else if (data.payUrl) {
                window.location.href = data.payUrl
            } else {
                toast.error(data.error || '获取支付信息失败')
            }
        } catch (error) {
            console.error('支付请求失败:', error)
            toast.error('支付请求失败')
        } finally {
            setPaying(false)
        }
    }

    // 取消支付并更新订单状态
    const cancelPayment = async () => {
        try {
            const res = await fetch(`/api/orders/${order.orderNo}/cancel`, {
                method: 'POST'
            })
            const data = await res.json()
            if (res.ok) {
                toast.success('订单已取消')
                setQrCodeUrl(null)
                setUsdtPayment(null)
                // 刷新订单状态
                fetchOrder()
            } else {
                toast.error(data.error || '取消失败')
            }
        } catch (error) {
            console.error('取消订单失败:', error)
            toast.error('取消订单失败')
        }
    }

    const cancelQrPayment = () => {
        cancelPayment()
    }

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
            </div>
        )
    }

    if (!order) {
        return (
            <div className="order-not-found">
                <FiPackage className="not-found-icon" />
                <h2>订单不存在</h2>
                <p>未找到订单号为 {orderNo} 的订单</p>
                <Link to="/order/query" className="btn btn-primary">
                    重新查询
                </Link>
            </div>
        )
    }

    const status = statusConfig[order.status]
    const StatusIcon = status.icon

    return (
        <div className="order-result-page">
            {/* 订单状态 */}
            <div className={`order-status-card status-${status.color}`}>
                <div className="status-icon">
                    <StatusIcon />
                </div>
                <div className="status-info">
                    <h2>{status.label}</h2>
                    <p>订单号：{order.orderNo}</p>
                </div>
            </div>

            <div className="order-content">
                {/* 商品信息 */}
                <div className="order-section">
                    <h3 className="section-subtitle">商品信息</h3>
                    <div className="order-product">
                        <img src={order.product.image} alt={order.product.name} />
                        <div className="product-info">
                            <h4>{order.product.name}</h4>
                            <p>数量：{order.quantity}</p>
                        </div>
                        <div className="product-amount">
                            ¥{order.totalAmount.toFixed(2)}
                        </div>
                    </div>
                </div>

                {/* 卡密信息 */}
                {(order.status === 'completed' || order.status === 'paid') && order.cards.length > 0 && (
                    <div className="order-section cards-section">
                        <div className="section-header">
                            <h3 className="section-subtitle">🎁 卡密信息</h3>
                            <button
                                className="copy-all-btn"
                                onClick={() => {
                                    const allCards = order.cards.map(c => c.content).join('\n')
                                    copyToClipboard(allCards)
                                }}
                            >
                                <FiCopy /> 复制全部
                            </button>
                        </div>

                        <div className="cards-container">
                            {order.cards.map((card, index) => (
                                <div key={card.id} className="card-item">
                                    <div className="card-index">#{index + 1}</div>
                                    <div className="card-content-wrapper">
                                        <code className="card-content">{card.content}</code>
                                    </div>
                                    <button
                                        className="card-copy-btn"
                                        onClick={() => copyToClipboard(card.content)}
                                        title="复制"
                                    >
                                        <FiCopy />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="cards-footer">
                            <div className="cards-count">
                                共 <strong>{order.cards.length}</strong> 个卡密
                            </div>
                            <div className="cards-warning">
                                ⚠️ 请妥善保管，避免泄露
                            </div>
                        </div>
                    </div>
                )}

                {/* 已完成但没有卡密（卡密发放中） */}
                {(order.status === 'completed' || order.status === 'paid') && order.cards.length === 0 && (
                    <div className="order-section cards-pending-section">
                        <div className="cards-pending-notice">
                            <FiClock />
                            <div>
                                <h4>卡密发放中</h4>
                                <p>请在订单详情或邮箱中查看卡密信息</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* 待支付提示 */}
                {order.status === 'pending' && (
                    <div className="order-section pending-section">
                        {usdtPayment ? (
                            /* USDT支付区域 */
                            <div className="usdt-payment-section">
                                <h4>💎 USDT-TRC20 支付</h4>

                                <div className="usdt-amount-display">
                                    <span className="amount-label">请转账</span>
                                    <span className="usdt-amount">{usdtPayment.usdtAmount} USDT</span>
                                    <button
                                        className="copy-amount-btn"
                                        onClick={() => copyToClipboard(usdtPayment.usdtAmount.toString())}
                                    >
                                        <FiCopy /> 复制
                                    </button>
                                </div>

                                <div className="usdt-address-section">
                                    <label>收款地址 (TRC20)</label>
                                    <div className="address-box">
                                        <code>{usdtPayment.walletAddress}</code>
                                        <button
                                            className="copy-btn"
                                            onClick={() => copyToClipboard(usdtPayment.walletAddress)}
                                        >
                                            <FiCopy />
                                        </button>
                                    </div>
                                </div>

                                <div className="usdt-qr-container">
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(usdtPayment.walletAddress)}`}
                                        alt="USDT收款地址"
                                        className="usdt-qr-image"
                                    />
                                </div>

                                <div className="usdt-info">
                                    <p>汇率：1 USDT = ¥{usdtPayment.exchangeRate}</p>
                                    <p>原价：¥{order.totalAmount.toFixed(2)}</p>
                                </div>

                                <div className="usdt-warning">
                                    ⚠️ 请务必转账 <strong>{usdtPayment.usdtAmount} USDT</strong>，金额不符将无法自动确认
                                </div>

                                <div className={`payment-countdown ${countdown !== null && countdown <= 60 ? 'urgent' : ''}`}>
                                    <span className="countdown-icon">⏱️</span>
                                    <span>支付剩余时间：</span>
                                    <span className="countdown-time">{formatCountdown(countdown)}</span>
                                </div>

                                <button
                                    className="btn btn-secondary"
                                    onClick={cancelPayment}
                                >
                                    取消支付
                                </button>
                            </div>
                        ) : qrCodeUrl ? (
                            /* 二维码支付区域 */
                            <div className="qr-payment-section">
                                <h4>请使用支付宝扫码支付</h4>
                                <div className="qr-code-container">
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeUrl)}`}
                                        alt="支付二维码"
                                        className="qr-code-image"
                                    />
                                </div>
                                <p className="qr-amount">支付金额：<strong>¥{order.totalAmount.toFixed(2)}</strong></p>
                                <p className="qr-hint">扫码后支付状态将自动更新</p>
                                <div className={`payment-countdown ${countdown !== null && countdown <= 60 ? 'urgent' : ''}`}>
                                    <span className="countdown-icon">⏱️</span>
                                    <span>支付剩余时间：</span>
                                    <span className="countdown-time">{formatCountdown(countdown)}</span>
                                </div>
                                <button
                                    className="btn btn-secondary"
                                    onClick={cancelQrPayment}
                                >
                                    取消支付
                                </button>
                            </div>
                        ) : (
                            /* 默认待支付区域 */
                            <>
                                <div className="pending-notice">
                                    <FiClock />
                                    <div>
                                        <h4>订单待支付</h4>
                                        <p>请尽快完成支付，超时订单将自动取消</p>
                                    </div>
                                </div>
                                <button
                                    className="btn btn-primary btn-lg pay-now-btn"
                                    onClick={handlePayment}
                                    disabled={paying}
                                >
                                    {paying ? '生成中...' : `立即支付 ¥${order.totalAmount.toFixed(2)}`}
                                </button>
                            </>
                        )}
                    </div>
                )}

                {/* 已取消提示 */}
                {order.status === 'cancelled' && (
                    <div className="order-section cancelled-section">
                        <div className="cancelled-notice">
                            <FiAlertCircle />
                            <div>
                                <h4>订单已取消</h4>
                                <p>该订单已被取消，如需购买请重新下单</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* 订单详情 */}
                <div className="order-section">
                    <h3 className="section-subtitle">订单详情</h3>
                    <div className="order-details">
                        <div className="detail-row">
                            <span>订单号</span>
                            <span>{order.orderNo}</span>
                        </div>
                        <div className="detail-row">
                            <span>接收邮箱</span>
                            <span>{order.email}</span>
                        </div>
                        <div className="detail-row">
                            <span>支付方式</span>
                            <span>{order.paymentMethod}</span>
                        </div>
                        <div className="detail-row">
                            <span>创建时间</span>
                            <span>{order.createdAt}</span>
                        </div>
                        {order.paidAt && (
                            <div className="detail-row">
                                <span>支付时间</span>
                                <span>{order.paidAt}</span>
                            </div>
                        )}
                        <div className="detail-row total">
                            <span>订单金额</span>
                            <span>¥{order.totalAmount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 底部操作 */}
            <div className="order-actions">
                <Link to="/user/orders" className="btn btn-secondary">
                    查询其他订单
                </Link>
                <Link to="/products" className="btn btn-primary">
                    继续购物
                </Link>
            </div>
        </div>
    )
}

export default OrderResult

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

    useEffect(() => {
        const fetchOrder = async () => {
            setLoading(true)
            try {
                const res = await fetch(`/api/orders/${orderNo}`)
                const data = await res.json()

                if (data.error) {
                    setOrder(null)
                } else {
                    // 格式化订单数据以匹配现有结构
                    setOrder({
                        orderNo: data.orderNo,
                        status: data.status?.toLowerCase() || 'pending',
                        email: data.email,
                        product: {
                            name: data.productName || data.product?.name,
                            image: data.product?.image || 'https://via.placeholder.com/200x150',
                        },
                        quantity: data.quantity,
                        totalAmount: parseFloat(data.totalAmount),
                        paymentMethod: data.paymentMethod === 'alipay' ? '支付宝' :
                            data.paymentMethod === 'wechat' ? '微信支付' : data.paymentMethod,
                        createdAt: new Date(data.createdAt).toLocaleString(),
                        paidAt: data.paidAt ? new Date(data.paidAt).toLocaleString() : null,
                        cards: (data.cards || []).map((c, idx) => ({
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
                {order.status === 'completed' && order.cards.length > 0 && (
                    <div className="order-section cards-section">
                        <div className="section-header">
                            <h3 className="section-subtitle">卡密信息</h3>
                            <button
                                className="toggle-cards-btn"
                                onClick={() => setShowCards(!showCards)}
                            >
                                {showCards ? '隐藏卡密' : '显示卡密'}
                            </button>
                        </div>

                        {showCards && (
                            <div className="cards-list">
                                {order.cards.map((card, index) => (
                                    <div key={card.id} className="card-item">
                                        <div className="card-header">
                                            <span>卡密 #{index + 1}</span>
                                            <button
                                                className="copy-btn"
                                                onClick={() => copyToClipboard(card.content)}
                                            >
                                                <FiCopy />
                                                复制
                                            </button>
                                        </div>
                                        <pre className="card-content">{card.content}</pre>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="cards-warning">
                            ⚠️ 请妥善保管您的卡密信息，避免泄露
                        </div>
                    </div>
                )}

                {/* 待支付提示 */}
                {order.status === 'pending' && (
                    <div className="order-section pending-section">
                        <div className="pending-notice">
                            <FiClock />
                            <div>
                                <h4>订单待支付</h4>
                                <p>请尽快完成支付，超时订单将自动取消</p>
                            </div>
                        </div>
                        <button className="btn btn-primary btn-lg pay-now-btn">
                            立即支付 ¥{order.totalAmount.toFixed(2)}
                        </button>
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
                <Link to="/order/query" className="btn btn-secondary">
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

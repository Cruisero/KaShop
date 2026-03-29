import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiCreditCard, FiMail, FiArrowLeft, FiCheck, FiEdit3 } from 'react-icons/fi'
import { useCartStore } from '../../store/cartStore'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'
import './Checkout.css'

// 支付方式图标映射
const paymentIcons = {
    alipay: '💳',
    wechat: '💚',
    usdt: '💰',
    bsc_usdt: '🟡'
}

const paymentColors = {
    alipay: '#1677ff',
    wechat: '#07c160',
    usdt: '#26a17b',
    bsc_usdt: '#f3ba2f'
}

function Checkout() {
    const navigate = useNavigate()
    const { items, getTotalPrice, clearCart } = useCartStore()
    const { user, isAuthenticated } = useAuthStore()

    const [email, setEmail] = useState(user?.email || '')
    const [paymentMethod, setPaymentMethod] = useState('alipay')
    const [loading, setLoading] = useState(false)
    const [agreed, setAgreed] = useState(false)
    const [paymentMethods, setPaymentMethods] = useState([])
    const [remark, setRemark] = useState('')

    const totalPrice = getTotalPrice()
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

    // 从API获取支付方式
    useEffect(() => {
        const fetchPaymentMethods = async () => {
            try {
                const res = await fetch('/api/payment/methods')
                const data = await res.json()
                if (data.methods) {
                    // 映射图标和颜色
                    const methods = data.methods.map(m => ({
                        ...m,
                        icon: paymentIcons[m.id] || '💳',
                        color: paymentColors[m.id] || '#666',
                        disabled: !m.enabled
                    }))
                    setPaymentMethods(methods)

                    // 自动选择第一个启用的支付方式
                    const firstEnabled = methods.find(m => !m.disabled)
                    if (firstEnabled) {
                        setPaymentMethod(firstEnabled.id)
                    }
                }
            } catch (error) {
                console.error('获取支付方式失败:', error)
                // 使用默认支付方式
                setPaymentMethods([
                    { id: 'alipay', name: '支付宝', icon: '💳', color: '#1677ff', disabled: false }
                ])
            }
        }
        fetchPaymentMethods()
    }, [])

    if (items.length === 0) {
        return (
            <div className="checkout-page">
                <div className="checkout-empty">
                    <h2>购物车为空</h2>
                    <p>请先添加商品到购物车</p>
                    <Link to="/products" className="btn btn-primary">
                        去购物
                    </Link>
                </div>
            </div>
        )
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!email || !email.trim()) {
            toast.error('请输入接收卡密的邮箱')
            return
        }

        // 邮箱格式验证
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email.trim())) {
            toast.error('请输入正确的邮箱格式')
            return
        }

        if (!agreed) {
            toast.error('请同意用户协议')
            return
        }

        setLoading(true)

        try {
            // 为每个商品创建订单
            const orderPromises = items.map(item =>
                fetch('/api/orders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(isAuthenticated && { 'Authorization': `Bearer ${useAuthStore.getState().token}` })
                    },
                    body: JSON.stringify({
                        productId: item.id,
                        variantId: item.variant?.id || null,
                        quantity: item.quantity,
                        email: email,
                        paymentMethod: paymentMethod,
                        remark: remark.trim() || null
                    })
                }).then(res => res.json())
            )

            const results = await Promise.all(orderPromises)

            // 检查是否有错误
            const errors = results.filter(r => r.error)
            if (errors.length > 0) {
                toast.error(errors[0].error || '订单创建失败')
                setLoading(false)
                return
            }

            // 获取第一个订单号（如果多个商品，可以显示第一个）
            const firstOrder = results[0]
            clearCart()
            toast.success('订单创建成功')
            navigate(`/order/${firstOrder.order.orderNo}`)
        } catch (error) {
            console.error('创建订单失败:', error)
            toast.error('创建订单失败，请稍后重试')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="checkout-page">
            <button className="back-btn" onClick={() => navigate(-1)}>
                <FiArrowLeft />
                返回购物车
            </button>

            <h1 className="section-title">确认订单</h1>

            <form className="checkout-container" onSubmit={handleSubmit}>
                {/* 左侧 - 订单信息 */}
                <div className="checkout-main">
                    {/* 商品列表 */}
                    <div className="checkout-section">
                        <h3>商品信息</h3>
                        <div className="checkout-items">
                            {items.map((item) => (
                                <div key={item.id} className="checkout-item">
                                    <img src={item.image} alt={item.name} />
                                    <div className="item-details">
                                        <h4>{item.name}</h4>
                                        <p>数量: {item.quantity}</p>
                                    </div>
                                    <div className="item-price">
                                        ¥{(item.price * item.quantity).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 接收邮箱 */}
                    <div className="checkout-section">
                        <h3>
                            <FiMail />
                            接收邮箱
                        </h3>
                        <p className="section-desc">卡密将发送到此邮箱，请确保填写正确</p>
                        <input
                            type="email"
                            className="input"
                            placeholder="请输入邮箱地址"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        {email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
                            <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px' }}>请输入正确的邮箱格式</p>
                        )}
                    </div>

                    {/* 支付方式 */}
                    <div className="checkout-section">
                        <h3>
                            <FiCreditCard />
                            支付方式
                        </h3>
                        <div className="payment-methods">
                            {paymentMethods.filter(m => !m.disabled).map((method) => (
                                <label
                                    key={method.id}
                                    className={`payment-option ${paymentMethod === method.id ? 'active' : ''}`}
                                >
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value={method.id}
                                        checked={paymentMethod === method.id}
                                        onChange={() => setPaymentMethod(method.id)}
                                    />
                                    <span className="payment-icon">{method.icon}</span>
                                    <span className="payment-name">{method.name}</span>
                                    {paymentMethod === method.id && <FiCheck className="check-icon" />}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* 订单备注 */}
                    <div className="checkout-section">
                        <h3>
                            <FiEdit3 />
                            订单备注
                        </h3>
                        <p className="section-desc">如有特殊要求，请在此备注（选填）</p>
                        <textarea
                            className="input remark-input"
                            placeholder="例如：请发送到备用邮箱 xxx@example.com"
                            value={remark}
                            onChange={(e) => setRemark(e.target.value)}
                            maxLength={500}
                            rows={3}
                        />
                        <div className="remark-count">{remark.length}/500</div>
                    </div>
                </div>

                {/* 右侧 - 订单摘要 */}
                <div className="checkout-sidebar">
                    <div className="order-summary">
                        <h3>订单摘要</h3>

                        <div className="summary-rows">
                            <div className="summary-row">
                                <span>商品数量</span>
                                <span>{itemCount} 件</span>
                            </div>
                            <div className="summary-row">
                                <span>商品金额</span>
                                <span>¥{totalPrice.toFixed(2)}</span>
                            </div>
                            <div className="summary-row">
                                <span>优惠</span>
                                <span className="discount">-¥0.00</span>
                            </div>
                        </div>

                        <div className="summary-total">
                            <span>应付金额</span>
                            <span className="total-price">¥{totalPrice.toFixed(2)}</span>
                        </div>

                        <label className="agree-terms">
                            <input
                                type="checkbox"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                            />
                            <span>我已阅读并同意 <a href="/terms" target="_blank" rel="noopener noreferrer">购买协议</a> 和 <a href="/refund-policy" target="_blank" rel="noopener noreferrer">退款政策</a></span>
                        </label>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg submit-order-btn"
                            disabled={loading || !agreed}
                        >
                            {loading ? '提交中...' : `立即支付 ¥${totalPrice.toFixed(2)}`}
                        </button>

                        <div className="security-tips">
                            <p>🔒 安全支付，隐私保护</p>
                            <p>⚡ 支付成功后自动发放卡密</p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default Checkout

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiCreditCard, FiMail, FiArrowLeft, FiCheck } from 'react-icons/fi'
import { useCartStore } from '../../store/cartStore'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'
import './Checkout.css'

// 支付方式
const paymentMethods = [
    { id: 'alipay', name: '支付宝', icon: '💳', color: '#1677ff' },
    { id: 'wechat', name: '微信支付', icon: '💚', color: '#07c160' },
    { id: 'usdt', name: 'USDT', icon: '💰', color: '#26a17b', disabled: true },
]

function Checkout() {
    const navigate = useNavigate()
    const { items, getTotalPrice, clearCart } = useCartStore()
    const { user, isAuthenticated } = useAuthStore()

    const [email, setEmail] = useState(user?.email || '')
    const [paymentMethod, setPaymentMethod] = useState('alipay')
    const [loading, setLoading] = useState(false)
    const [agreed, setAgreed] = useState(false)

    const totalPrice = getTotalPrice()
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

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

        if (!email) {
            toast.error('请输入接收卡密的邮箱')
            return
        }

        if (!agreed) {
            toast.error('请同意用户协议')
            return
        }

        setLoading(true)

        // 模拟创建订单
        setTimeout(() => {
            setLoading(false)
            const orderNo = 'KA' + Date.now()
            clearCart()
            toast.success('订单创建成功')
            navigate(`/order/${orderNo}`)
        }, 1500)
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
                    </div>

                    {/* 支付方式 */}
                    <div className="checkout-section">
                        <h3>
                            <FiCreditCard />
                            支付方式
                        </h3>
                        <div className="payment-methods">
                            {paymentMethods.map((method) => (
                                <label
                                    key={method.id}
                                    className={`payment-option ${paymentMethod === method.id ? 'active' : ''} ${method.disabled ? 'disabled' : ''}`}
                                >
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value={method.id}
                                        checked={paymentMethod === method.id}
                                        onChange={() => !method.disabled && setPaymentMethod(method.id)}
                                        disabled={method.disabled}
                                    />
                                    <span className="payment-icon">{method.icon}</span>
                                    <span className="payment-name">{method.name}</span>
                                    {paymentMethod === method.id && <FiCheck className="check-icon" />}
                                    {method.disabled && <span className="coming-soon">即将上线</span>}
                                </label>
                            ))}
                        </div>
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
                            <span>我已阅读并同意 <a href="#">购买协议</a> 和 <a href="#">退款政策</a></span>
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

import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FiArrowLeft, FiSend, FiPackage } from 'react-icons/fi'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'
import './TicketNew.css'

const ticketTypes = [
    { value: 'ORDER_ISSUE', label: '订单问题', desc: '订单状态、支付问题等' },
    { value: 'CARD_ISSUE', label: '卡密问题', desc: '卡密无效、已使用等' },
    { value: 'REFUND', label: '退款申请', desc: '申请订单退款' },
    { value: 'OTHER', label: '其他', desc: '其他问题咨询' }
]

function TicketNew() {
    const navigate = useNavigate()
    const { isAuthenticated, token } = useAuthStore()

    const [type, setType] = useState('')
    const [subject, setSubject] = useState('')
    const [content, setContent] = useState('')
    const [orderId, setOrderId] = useState('')
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login?redirect=/tickets/new')
            return
        }
        fetchOrders()
    }, [isAuthenticated])

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/tickets/orders', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            setOrders(data.orders || [])
        } catch (error) {
            console.error('获取订单失败:', error)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!type) {
            toast.error('请选择问题类型')
            return
        }
        if (!subject.trim()) {
            toast.error('请输入工单标题')
            return
        }
        if (!content.trim()) {
            toast.error('请描述您的问题')
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/tickets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    type,
                    subject: subject.trim(),
                    content: content.trim(),
                    orderId: orderId || null
                })
            })

            const data = await res.json()

            if (res.ok) {
                toast.success('工单提交成功')
                navigate(`/tickets/${data.ticket.id}`)
            } else {
                toast.error(data.error || '提交失败')
            }
        } catch (error) {
            console.error('提交工单失败:', error)
            toast.error('提交失败，请稍后重试')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="ticket-new-page">
            <button className="back-btn" onClick={() => navigate('/tickets')}>
                <FiArrowLeft />
                返回工单列表
            </button>

            <div className="ticket-new-container">
                <div className="ticket-new-header">
                    <h1>提交新工单</h1>
                    <p>请详细描述您的问题，我们会尽快回复</p>
                </div>

                <form onSubmit={handleSubmit} className="ticket-form">
                    {/* 问题类型 */}
                    <div className="form-group">
                        <label>问题类型 *</label>
                        <div className="type-options">
                            {ticketTypes.map(t => (
                                <label
                                    key={t.value}
                                    className={`type-option ${type === t.value ? 'active' : ''}`}
                                >
                                    <input
                                        type="radio"
                                        name="type"
                                        value={t.value}
                                        checked={type === t.value}
                                        onChange={(e) => setType(e.target.value)}
                                    />
                                    <span className="type-label">{t.label}</span>
                                    <span className="type-desc">{t.desc}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* 关联订单 */}
                    {orders.length > 0 && (
                        <div className="form-group">
                            <label>
                                <FiPackage />
                                关联订单（可选）
                            </label>
                            <div className="custom-select-wrapper">
                                <select
                                    className="custom-select"
                                    value={orderId}
                                    onChange={(e) => setOrderId(e.target.value)}
                                >
                                    <option value="">不关联订单</option>
                                    {orders.map(order => (
                                        <option key={order.id} value={order.id}>
                                            {order.productName} · {order.orderNo} · ¥{parseFloat(order.totalAmount).toFixed(2)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* 标题 */}
                    <div className="form-group">
                        <label>工单标题 *</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="简要描述您的问题"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            maxLength={100}
                        />
                    </div>

                    {/* 问题描述 */}
                    <div className="form-group">
                        <label>问题描述 *</label>
                        <textarea
                            className="input textarea"
                            placeholder="请详细描述您遇到的问题，包括相关的订单号、卡密信息等..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={6}
                            maxLength={2000}
                        />
                        <div className="char-count">{content.length}/2000</div>
                    </div>

                    {/* 提交按钮 */}
                    <div className="form-actions">
                        <button
                            type="submit"
                            className="btn btn-primary btn-lg"
                            disabled={loading}
                        >
                            <FiSend />
                            {loading ? '提交中...' : '提交工单'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default TicketNew

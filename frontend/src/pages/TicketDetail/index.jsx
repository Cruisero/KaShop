import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { FiArrowLeft, FiSend, FiClock, FiCheck, FiAlertCircle, FiPackage } from 'react-icons/fi'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'
import './TicketDetail.css'

const statusMap = {
    OPEN: { label: '待处理', class: 'open', icon: <FiAlertCircle /> },
    IN_PROGRESS: { label: '处理中', class: 'in-progress', icon: <FiClock /> },
    CLOSED: { label: '已关闭', class: 'closed', icon: <FiCheck /> }
}

const typeMap = {
    ORDER_ISSUE: '订单问题',
    CARD_ISSUE: '卡密问题',
    REFUND: '退款申请',
    OTHER: '其他'
}

function TicketDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { isAuthenticated, token, user } = useAuthStore()
    const messagesEndRef = useRef(null)

    const [ticket, setTicket] = useState(null)
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState('')
    const [sending, setSending] = useState(false)

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login?redirect=/tickets/' + id)
            return
        }
        fetchTicket()
    }, [isAuthenticated, id])

    useEffect(() => {
        scrollToBottom()
    }, [ticket?.messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const fetchTicket = async () => {
        try {
            const res = await fetch(`/api/tickets/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()

            if (res.ok) {
                setTicket(data.ticket)
            } else {
                toast.error(data.error || '获取工单失败')
                navigate('/tickets')
            }
        } catch (error) {
            console.error('获取工单失败:', error)
            toast.error('获取工单失败')
        } finally {
            setLoading(false)
        }
    }

    const handleSend = async (e) => {
        e.preventDefault()

        if (!message.trim()) return
        if (ticket.status === 'CLOSED') {
            toast.error('工单已关闭，无法发送消息')
            return
        }

        setSending(true)
        try {
            const res = await fetch(`/api/tickets/${id}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content: message.trim() })
            })

            if (res.ok) {
                setMessage('')
                fetchTicket()
            } else {
                const data = await res.json()
                toast.error(data.error || '发送失败')
            }
        } catch (error) {
            toast.error('发送失败')
        } finally {
            setSending(false)
        }
    }

    const formatTime = (dateStr) => {
        const date = new Date(dateStr)
        return date.toLocaleString('zh-CN', {
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (loading) {
        return (
            <div className="ticket-detail-page">
                <div className="loading-state">加载中...</div>
            </div>
        )
    }

    if (!ticket) {
        return (
            <div className="ticket-detail-page">
                <div className="error-state">工单不存在</div>
            </div>
        )
    }

    return (
        <div className="ticket-detail-page">
            <button className="back-btn" onClick={() => navigate('/tickets')}>
                <FiArrowLeft />
                返回工单列表
            </button>

            <div className="ticket-detail-container">
                {/* 工单信息 */}
                <div className="ticket-info-card">
                    <div className="ticket-info-header">
                        <span className="ticket-no">{ticket.ticketNo}</span>
                        <span className={`ticket-status ${statusMap[ticket.status]?.class}`}>
                            {statusMap[ticket.status]?.icon}
                            {statusMap[ticket.status]?.label}
                        </span>
                    </div>
                    <h2 className="ticket-subject">{ticket.subject}</h2>
                    <div className="ticket-meta">
                        <span className="meta-item">
                            类型：{typeMap[ticket.type]}
                        </span>
                        {ticket.order && (
                            <span className="meta-item order-info">
                                <FiPackage />
                                关联订单：{ticket.order.orderNo}
                                <span className="order-product">{ticket.order.productName}</span>
                            </span>
                        )}
                        <span className="meta-item time">
                            <FiClock />
                            创建于 {new Date(ticket.createdAt).toLocaleString('zh-CN')}
                        </span>
                    </div>
                </div>

                {/* 消息列表 */}
                <div className="messages-container">
                    <div className="messages-list">
                        {ticket.messages?.map((msg) => (
                            <div
                                key={msg.id}
                                className={`message-item ${msg.isAdmin ? 'admin' : 'user'}`}
                            >
                                <div className="message-avatar">
                                    {msg.isAdmin ? '👨‍💼' : '👤'}
                                </div>
                                <div className="message-content">
                                    <div className="message-header">
                                        <span className="message-sender">
                                            {msg.isAdmin ? '客服' : (msg.sender?.username || '我')}
                                        </span>
                                        <span className="message-time">{formatTime(msg.createdAt)}</span>
                                    </div>
                                    <div className="message-text">{msg.content}</div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* 发送消息 */}
                    {ticket.status !== 'CLOSED' ? (
                        <form className="message-input-form" onSubmit={handleSend}>
                            <textarea
                                className="message-input"
                                placeholder="输入消息..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={3}
                                disabled={sending}
                            />
                            <button
                                type="submit"
                                className="btn btn-primary send-btn"
                                disabled={sending || !message.trim()}
                            >
                                <FiSend />
                                {sending ? '发送中...' : '发送'}
                            </button>
                        </form>
                    ) : (
                        <div className="ticket-closed-notice">
                            此工单已关闭，如有新问题请提交新工单
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default TicketDetail

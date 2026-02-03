import { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { FiUser, FiPackage, FiLock, FiLogOut, FiMail, FiCalendar, FiCopy, FiEye, FiEyeOff } from 'react-icons/fi'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'
import './User.css'

// 侧边菜单
const menuItems = [
    { path: '/user', icon: FiUser, label: '个人信息', exact: true },
    { path: '/user/orders', icon: FiPackage, label: '我的订单' },
    { path: '/user/password', icon: FiLock, label: '修改密码' }
]

// 个人信息页
function ProfilePage() {
    const { user, token } = useAuthStore()
    const [resending, setResending] = useState(false)
    const [stats, setStats] = useState({ total: 0, spent: 0, completed: 0 })

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/orders/my-orders', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                const data = await res.json()
                const orders = data.orders || []
                setStats({
                    total: orders.length,
                    spent: orders.reduce((sum, o) => sum + o.totalAmount, 0),
                    completed: orders.filter(o => o.status === 'completed').length
                })
            } catch (error) {
                console.error('获取统计失败:', error)
            }
        }
        if (token) fetchStats()
    }, [token])

    const handleResendVerification = async () => {
        setResending(true)
        try {
            const res = await fetch('/api/auth/resend-verification', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            if (res.ok) {
                toast.success(data.message)
            } else {
                toast.error(data.error)
            }
        } catch (error) {
            toast.error('发送失败，请稍后重试')
        } finally {
            setResending(false)
        }
    }

    return (
        <div className="profile-page">
            <h2>个人信息</h2>

            {/* 邮箱未验证提示 */}
            {user && !user.emailVerified && user.role !== 'ADMIN' && (
                <div className="email-verify-alert">
                    <div className="alert-content">
                        <span>⚠️ 您的邮箱尚未验证</span>
                        <p>请查收验证邮件并点击链接完成验证，以确保账户安全</p>
                    </div>
                    <button
                        className="btn btn-warning"
                        onClick={handleResendVerification}
                        disabled={resending}
                    >
                        {resending ? '发送中...' : '重新发送验证邮件'}
                    </button>
                </div>
            )}

            <div className="profile-card">
                <div className="profile-avatar">
                    {user?.avatar ? (
                        <img src={user.avatar} alt={user.username} />
                    ) : (
                        <div className="avatar-placeholder">
                            {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                    )}
                </div>

                <div className="profile-info">
                    <div className="info-row">
                        <FiUser />
                        <span className="info-label">用户名</span>
                        <span className="info-value">{user?.username || '未设置'}</span>
                    </div>
                    <div className="info-row">
                        <FiMail />
                        <span className="info-label">邮箱</span>
                        <span className="info-value">
                            {user?.email || '未绑定'}
                            {user?.role !== 'ADMIN' && (
                                user?.emailVerified ? (
                                    <span className="verified-badge">✓ 已验证</span>
                                ) : (
                                    <span className="unverified-badge">未验证</span>
                                )
                            )}
                        </span>
                    </div>
                    <div className="info-row">
                        <FiCalendar />
                        <span className="info-label">注册时间</span>
                        <span className="info-value">{user?.createdAt || '2024-01-01'}</span>
                    </div>
                </div>
            </div>

            <div className="stats-cards">
                <div className="stat-card">
                    <span className="stat-value">{stats.total}</span>
                    <span className="stat-label">总订单</span>
                </div>
                <div className="stat-card">
                    <span className="stat-value">
                        ¥{stats.spent.toFixed(2)}
                    </span>
                    <span className="stat-label">总消费</span>
                </div>
                <div className="stat-card">
                    <span className="stat-value">
                        {stats.completed}
                    </span>
                    <span className="stat-label">已完成</span>
                </div>
            </div>
        </div>
    )
}

// 我的订单页
function OrdersPage() {
    const { token } = useAuthStore()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [expandedOrder, setExpandedOrder] = useState(null)
    const [filter, setFilter] = useState('all')

    useEffect(() => {
        fetchOrders()
    }, [filter])

    const fetchOrders = async () => {
        setLoading(true)
        try {
            const url = filter === 'all'
                ? '/api/orders/my-orders'
                : `/api/orders/my-orders?status=${filter}`
            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            setOrders(data.orders || [])
        } catch (error) {
            console.error('获取订单失败:', error)
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success('已复制到剪贴板')
        })
    }

    const statusMap = {
        pending: { label: '待支付', class: 'warning' },
        paid: { label: '已支付', class: 'info' },
        completed: { label: '已完成', class: 'success' },
        cancelled: { label: '已取消', class: 'error' }
    }

    return (
        <div className="orders-page">
            <div className="orders-header">
                <h2>我的订单</h2>
                <div className="order-filters">
                    <button
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        全部
                    </button>
                    <button
                        className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                        onClick={() => setFilter('pending')}
                    >
                        待支付
                    </button>
                    <button
                        className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
                        onClick={() => setFilter('completed')}
                    >
                        已完成
                    </button>
                </div>
            </div>

            <div className="orders-list">
                {loading ? (
                    <div className="empty-orders">
                        <p>加载中...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="empty-orders">
                        <FiPackage />
                        <p>暂无订单</p>
                    </div>
                ) : orders.map(order => (
                    <div key={order.orderNo} className="order-item">
                        <div className="order-main">
                            <img src={order.productImage || 'https://via.placeholder.com/100x80'} alt={order.productName} />
                            <div className="order-info">
                                <h4>{order.productName}</h4>
                                <p className="order-no">订单号: {order.orderNo}</p>
                                <p className="order-time">{new Date(order.createdAt).toLocaleString()}</p>
                            </div>
                            <div className="order-right">
                                <span className={`status-badge ${statusMap[order.status]?.class || ''}`}>
                                    {statusMap[order.status]?.label || order.status}
                                </span>
                                <span className="order-amount">¥{order.totalAmount.toFixed(2)}</span>
                                {order.status === 'pending' && (() => {
                                    const createdAt = new Date(order.createdAt).getTime()
                                    const expireAt = createdAt + 15 * 60 * 1000 // 15 minutes
                                    const isExpired = Date.now() > expireAt

                                    return isExpired ? (
                                        <span className="expired-badge">已过期</span>
                                    ) : (
                                        <Link
                                            to={`/order/${order.orderNo}`}
                                            className="pay-btn"
                                        >
                                            去支付
                                        </Link>
                                    )
                                })()}
                                {order.status === 'completed' && order.cards?.length > 0 && (
                                    <button
                                        className="view-cards-btn"
                                        onClick={() => setExpandedOrder(
                                            expandedOrder === order.orderNo ? null : order.orderNo
                                        )}
                                    >
                                        {expandedOrder === order.orderNo ? '收起卡密' : '查看卡密'}
                                    </button>
                                )}
                            </div>
                        </div>

                        {expandedOrder === order.orderNo && (
                            <div className="order-cards">
                                {order.cards.map((card, idx) => (
                                    <div key={idx} className="card-item">
                                        <pre>{card}</pre>
                                        <button
                                            className="copy-btn"
                                            onClick={() => copyToClipboard(card)}
                                        >
                                            <FiCopy /> 复制
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

// 修改密码页
function PasswordPage() {
    const { token } = useAuthStore()
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    const [showPasswords, setShowPasswords] = useState({
        old: false,
        new: false,
        confirm: false
    })
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('两次密码输入不一致')
            return
        }

        if (formData.newPassword.length < 6) {
            toast.error('新密码至少6位')
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    oldPassword: formData.oldPassword,
                    newPassword: formData.newPassword
                })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || '修改失败')
            }

            toast.success(data.message)
            setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' })
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="password-page">
            <h2>修改密码</h2>

            <form className="password-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>当前密码</label>
                    <div className="input-wrapper">
                        <input
                            type={showPasswords.old ? 'text' : 'password'}
                            name="oldPassword"
                            value={formData.oldPassword}
                            onChange={handleChange}
                            placeholder="请输入当前密码"
                            required
                        />
                        <button
                            type="button"
                            className="toggle-password"
                            onClick={() => setShowPasswords({ ...showPasswords, old: !showPasswords.old })}
                        >
                            {showPasswords.old ? <FiEyeOff /> : <FiEye />}
                        </button>
                    </div>
                </div>

                <div className="form-group">
                    <label>新密码</label>
                    <div className="input-wrapper">
                        <input
                            type={showPasswords.new ? 'text' : 'password'}
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            placeholder="请输入新密码 (至少6位)"
                            required
                        />
                        <button
                            type="button"
                            className="toggle-password"
                            onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                        >
                            {showPasswords.new ? <FiEyeOff /> : <FiEye />}
                        </button>
                    </div>
                </div>

                <div className="form-group">
                    <label>确认新密码</label>
                    <div className="input-wrapper">
                        <input
                            type={showPasswords.confirm ? 'text' : 'password'}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="请再次输入新密码"
                            required
                        />
                        <button
                            type="button"
                            className="toggle-password"
                            onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                        >
                            {showPasswords.confirm ? <FiEyeOff /> : <FiEye />}
                        </button>
                    </div>
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? '提交中...' : '确认修改'}
                </button>
            </form>
        </div>
    )
}

// 用户中心主组件
function UserCenter() {
    const location = useLocation()
    const navigate = useNavigate()
    const { user, isAuthenticated, logout } = useAuthStore()

    // 未登录跳转
    if (!isAuthenticated) {
        return (
            <div className="user-not-logged">
                <FiUser className="icon" />
                <h2>请先登录</h2>
                <p>登录后可查看个人信息和订单</p>
                <Link to="/login" className="btn btn-primary">去登录</Link>
            </div>
        )
    }

    const handleLogout = () => {
        logout()
        toast.success('已退出登录')
        navigate('/')
    }

    return (
        <div className="user-center">
            {/* 侧边栏 */}
            <aside className="user-sidebar">
                <div className="user-brief">
                    <div className="brief-avatar">
                        {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="brief-info">
                        <span className="brief-name">{user?.username || '用户'}</span>
                        <span className="brief-email">{user?.email}</span>
                    </div>
                </div>

                <nav className="user-nav">
                    {menuItems.map(item => {
                        const isActive = item.exact
                            ? location.pathname === item.path
                            : location.pathname.startsWith(item.path) && item.path !== '/user'
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`nav-item ${isActive || (item.exact && location.pathname === item.path) ? 'active' : ''}`}
                            >
                                <item.icon />
                                <span>{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>

                <button className="logout-btn" onClick={handleLogout}>
                    <FiLogOut />
                    <span>退出登录</span>
                </button>
            </aside>

            {/* 主内容 */}
            <main className="user-main">
                <Routes>
                    <Route index element={<ProfilePage />} />
                    <Route path="orders" element={<OrdersPage />} />
                    <Route path="password" element={<PasswordPage />} />
                </Routes>
            </main>
        </div>
    )
}

export default UserCenter

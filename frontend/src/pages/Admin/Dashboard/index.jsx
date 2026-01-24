import { useState, useEffect, createContext, useContext, useRef } from 'react'
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import {
    FiHome, FiPackage, FiShoppingBag, FiCreditCard,
    FiUsers, FiSettings, FiLogOut, FiMenu, FiX,
    FiTrendingUp, FiDollarSign, FiBox, FiActivity,
    FiCheckCircle, FiAlertCircle, FiInfo, FiAlertTriangle,
    FiChevronDown, FiCheck
} from 'react-icons/fi'
import { useAuthStore } from '../../../store/authStore'
import './Dashboard.css'

// ==================== Toast & Dialog Context ====================
const ToastContext = createContext(null)

function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])
    const [confirmDialog, setConfirmDialog] = useState(null)

    const showToast = (message, type = 'success', duration = 3000) => {
        const id = Date.now()
        setToasts(prev => [...prev, { id, message, type }])
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id))
        }, duration)
    }

    const showConfirm = (title, message, onConfirm) => {
        setConfirmDialog({ title, message, onConfirm })
    }

    const closeConfirm = () => setConfirmDialog(null)

    const handleConfirm = () => {
        if (confirmDialog?.onConfirm) {
            confirmDialog.onConfirm()
        }
        closeConfirm()
    }

    return (
        <ToastContext.Provider value={{ showToast, showConfirm }}>
            {children}

            {/* Toast 容器 */}
            <div className="toast-container">
                {toasts.map(toast => (
                    <div key={toast.id} className={`toast toast-${toast.type}`}>
                        <span className="toast-icon">
                            {toast.type === 'success' && <FiCheckCircle />}
                            {toast.type === 'error' && <FiAlertCircle />}
                            {toast.type === 'warning' && <FiAlertTriangle />}
                            {toast.type === 'info' && <FiInfo />}
                        </span>
                        <span className="toast-message">{toast.message}</span>
                    </div>
                ))}
            </div>

            {/* 确认弹窗 */}
            {confirmDialog && (
                <div className="confirm-overlay" onClick={closeConfirm}>
                    <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
                        <div className="confirm-icon">
                            <FiAlertTriangle />
                        </div>
                        <h3 className="confirm-title">{confirmDialog.title}</h3>
                        <p className="confirm-message">{confirmDialog.message}</p>
                        <div className="confirm-actions">
                            <button className="btn btn-cancel" onClick={closeConfirm}>
                                取消
                            </button>
                            <button className="btn btn-danger" onClick={handleConfirm}>
                                确认删除
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ToastContext.Provider>
    )
}

function useToast() {
    return useContext(ToastContext)
}

// ==================== 自定义 Select 组件 ====================
function CustomSelect({ value, onChange, options, placeholder, name, required }) {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedLabel, setSelectedLabel] = useState('')
    const selectRef = useRef(null)

    // 获取选中项的标签
    useEffect(() => {
        const option = options.find(opt => opt.value === value)
        setSelectedLabel(option ? option.label : '')
    }, [value, options])

    // 点击外部关闭
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (selectRef.current && !selectRef.current.contains(e.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSelect = (optionValue) => {
        onChange({ target: { name, value: optionValue } })
        setIsOpen(false)
    }

    return (
        <div className={`custom-select ${isOpen ? 'open' : ''}`} ref={selectRef}>
            <div
                className="custom-select-trigger"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={`custom-select-value ${!value ? 'placeholder' : ''}`}>
                    {selectedLabel || placeholder}
                </span>
                <FiChevronDown className="custom-select-arrow" />
            </div>
            {isOpen && (
                <div className="custom-select-dropdown">
                    {placeholder && (
                        <div
                            className={`custom-select-option ${!value ? 'selected' : ''}`}
                            onClick={() => handleSelect('')}
                        >
                            <span>{placeholder}</span>
                        </div>
                    )}
                    {options.map(option => (
                        <div
                            key={option.value}
                            className={`custom-select-option ${value === option.value ? 'selected' : ''}`}
                            onClick={() => handleSelect(option.value)}
                        >
                            <span>{option.label}</span>
                            {value === option.value && <FiCheck className="option-check" />}
                        </div>
                    ))}
                </div>
            )}
            {/* 隐藏的原生 select 用于表单验证 */}
            {required && (
                <select
                    name={name}
                    value={value}
                    onChange={() => { }}
                    required
                    style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', height: 0 }}
                >
                    <option value=""></option>
                    {options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            )}
        </div>
    )
}


// 模拟数据
const mockStats = {
    totalOrders: 1234,
    totalRevenue: 58960.50,
    totalProducts: 48,
    totalUsers: 892,
    todayOrders: 28,
    todayRevenue: 1680.00,
}

const mockRecentOrders = [
    { id: 1, orderNo: 'KA202401230015', product: 'Netflix会员月卡', amount: 49.90, status: 'completed', time: '10分钟前' },
    { id: 2, orderNo: 'KA202401230014', product: 'ChatGPT Plus月卡', amount: 149.00, status: 'completed', time: '25分钟前' },
    { id: 3, orderNo: 'KA202401230013', product: 'Spotify月卡', amount: 19.90, status: 'pending', time: '32分钟前' },
    { id: 4, orderNo: 'KA202401230012', product: 'Steam账号-GTA5', amount: 68.00, status: 'completed', time: '1小时前' },
    { id: 5, orderNo: 'KA202401230011', product: 'YouTube Premium年卡', amount: 168.00, status: 'completed', time: '2小时前' },
]

const mockCategories = [
    { id: '1', name: '流媒体会员' },
    { id: '2', name: '游戏账号' },
    { id: '3', name: 'AI工具' },
    { id: '4', name: '云存储服务' },
    { id: '5', name: '其他服务' },
]

const mockProducts = [
    { id: '1', name: 'Netflix 高级会员月卡', price: 49.90, stock: 128, sold: 2341, status: 'active', categoryId: '1' },
    { id: '2', name: 'Spotify Premium 月卡', price: 19.90, stock: 256, sold: 1876, status: 'active', categoryId: '1' },
    { id: '3', name: 'Steam 游戏账号 - GTA5', price: 68.00, stock: 45, sold: 892, status: 'active', categoryId: '2' },
    { id: '4', name: 'ChatGPT Plus 月卡', price: 149.00, stock: 89, sold: 3421, status: 'active', categoryId: '3' },
    { id: '5', name: 'YouTube Premium 年卡', price: 168.00, stock: 67, sold: 1234, status: 'active', categoryId: '1' },
    { id: '6', name: '百度网盘超级会员月卡', price: 25.00, stock: 512, sold: 4521, status: 'active', categoryId: '4' },
]

// 侧边栏菜单
const menuItems = [
    { path: '/admin', icon: FiHome, label: '仪表盘', exact: true },
    { path: '/admin/products', icon: FiPackage, label: '商品管理' },
    { path: '/admin/orders', icon: FiShoppingBag, label: '订单管理' },
    { path: '/admin/cards', icon: FiCreditCard, label: '卡密管理' },
    { path: '/admin/users', icon: FiUsers, label: '用户管理' },
    { path: '/admin/settings', icon: FiSettings, label: '系统设置' },
]

// 仪表盘首页
function DashboardHome() {
    return (
        <div className="dashboard-home">
            {/* 统计卡片 */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon orders">
                        <FiShoppingBag />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{mockStats.totalOrders}</span>
                        <span className="stat-label">总订单</span>
                    </div>
                    <div className="stat-trend up">
                        <FiTrendingUp /> +12%
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon revenue">
                        <FiDollarSign />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">¥{mockStats.totalRevenue.toFixed(2)}</span>
                        <span className="stat-label">总收入</span>
                    </div>
                    <div className="stat-trend up">
                        <FiTrendingUp /> +8%
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon products">
                        <FiBox />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{mockStats.totalProducts}</span>
                        <span className="stat-label">商品数</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon users">
                        <FiUsers />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{mockStats.totalUsers}</span>
                        <span className="stat-label">用户数</span>
                    </div>
                    <div className="stat-trend up">
                        <FiTrendingUp /> +5%
                    </div>
                </div>
            </div>

            {/* 今日数据 */}
            <div className="today-stats">
                <div className="today-card">
                    <FiActivity />
                    <div>
                        <span className="today-value">{mockStats.todayOrders}</span>
                        <span className="today-label">今日订单</span>
                    </div>
                </div>
                <div className="today-card">
                    <FiDollarSign />
                    <div>
                        <span className="today-value">¥{mockStats.todayRevenue.toFixed(2)}</span>
                        <span className="today-label">今日收入</span>
                    </div>
                </div>
            </div>

            {/* 最近订单 */}
            <div className="recent-orders">
                <h3>最近订单</h3>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>订单号</th>
                            <th>商品</th>
                            <th>金额</th>
                            <th>状态</th>
                            <th>时间</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockRecentOrders.map(order => (
                            <tr key={order.id}>
                                <td className="order-no">{order.orderNo}</td>
                                <td>{order.product}</td>
                                <td>¥{order.amount.toFixed(2)}</td>
                                <td>
                                    <span className={`status-badge ${order.status}`}>
                                        {order.status === 'completed' ? '已完成' : '待支付'}
                                    </span>
                                </td>
                                <td className="time">{order.time}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

// 商品管理
function ProductsManage() {
    const { showToast, showConfirm } = useToast()
    const [showModal, setShowModal] = useState(false)
    const [editingProduct, setEditingProduct] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        originalPrice: '',
        categoryId: '',
        image: '',
        status: 'active'
    })

    const handleAdd = () => {
        setEditingProduct(null)
        setFormData({
            name: '',
            description: '',
            price: '',
            originalPrice: '',
            categoryId: '',
            image: '',
            status: 'active'
        })
        setShowModal(true)
    }

    const handleEdit = (product) => {
        setEditingProduct(product)
        setFormData({
            name: product.name,
            description: product.description || '',
            price: product.price.toString(),
            originalPrice: product.originalPrice?.toString() || '',
            categoryId: product.categoryId || '',
            image: product.image || '',
            status: product.status
        })
        setShowModal(true)
    }

    const handleDelete = (product) => {
        showConfirm(
            '删除商品',
            `确定要删除商品「${product.name}」吗？此操作不可撤销。`,
            () => {
                showToast('商品已成功删除', 'success')
            }
        )
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (editingProduct) {
            showToast('商品更新成功', 'success')
        } else {
            showToast('商品添加成功', 'success')
        }
        setShowModal(false)
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    return (
        <div className="manage-page">
            <div className="page-header">
                <h2>商品管理</h2>
                <button className="btn btn-primary" onClick={handleAdd}>+ 添加商品</button>
            </div>
            <div className="products-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>商品名称</th>
                            <th>价格</th>
                            <th>库存</th>
                            <th>已售</th>
                            <th>状态</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockProducts.map(product => (
                            <tr key={product.id}>
                                <td>{product.name}</td>
                                <td>¥{product.price.toFixed(2)}</td>
                                <td>{product.stock}</td>
                                <td>{product.sold}</td>
                                <td>
                                    <span className={`status-badge ${product.status}`}>
                                        {product.status === 'active' ? '上架' : '下架'}
                                    </span>
                                </td>
                                <td className="actions">
                                    <button className="action-btn edit" onClick={() => handleEdit(product)}>编辑</button>
                                    <button className="action-btn cards">卡密</button>
                                    <button className="action-btn delete" onClick={() => handleDelete(product)}>删除</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 添加/编辑商品弹窗 */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingProduct ? '编辑商品' : '添加商品'}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-group">
                                <label>商品名称 *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="请输入商品名称"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>商品描述</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="请输入商品描述"
                                    rows={3}
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>售价 *</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        step="0.01"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>原价</label>
                                    <input
                                        type="number"
                                        name="originalPrice"
                                        value={formData.originalPrice}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        step="0.01"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>商品类别 *</label>
                                <CustomSelect
                                    name="categoryId"
                                    value={formData.categoryId}
                                    onChange={handleChange}
                                    placeholder="请选择类别"
                                    required
                                    options={mockCategories.map(cat => ({
                                        value: cat.id,
                                        label: cat.name
                                    }))}
                                />
                            </div>
                            <div className="form-group">
                                <label>商品图片URL</label>
                                <input
                                    type="text"
                                    name="image"
                                    value={formData.image}
                                    onChange={handleChange}
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>
                            <div className="form-group">
                                <label>状态</label>
                                <select name="status" value={formData.status} onChange={handleChange}>
                                    <option value="active">上架</option>
                                    <option value="inactive">下架</option>
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    取消
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingProduct ? '保存修改' : '添加商品'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

// 订单管理
function OrdersManage() {
    return (
        <div className="manage-page">
            <div className="page-header">
                <h2>订单管理</h2>
                <div className="filters">
                    <select className="filter-select">
                        <option>全部状态</option>
                        <option>待支付</option>
                        <option>已完成</option>
                        <option>已取消</option>
                    </select>
                </div>
            </div>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>订单号</th>
                        <th>商品</th>
                        <th>金额</th>
                        <th>邮箱</th>
                        <th>状态</th>
                        <th>时间</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    {mockRecentOrders.map(order => (
                        <tr key={order.id}>
                            <td className="order-no">{order.orderNo}</td>
                            <td>{order.product}</td>
                            <td>¥{order.amount.toFixed(2)}</td>
                            <td>user@example.com</td>
                            <td>
                                <span className={`status-badge ${order.status}`}>
                                    {order.status === 'completed' ? '已完成' : '待支付'}
                                </span>
                            </td>
                            <td className="time">{order.time}</td>
                            <td className="actions">
                                <button className="action-btn view">查看</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

// 卡密管理
function CardsManage() {
    return (
        <div className="manage-page">
            <div className="page-header">
                <h2>卡密管理</h2>
                <button className="btn btn-primary">+ 批量导入</button>
            </div>
            <div className="placeholder-content">
                <FiCreditCard />
                <p>选择商品后可管理对应卡密</p>
            </div>
        </div>
    )
}

// 用户管理
function UsersManage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [roleFilter, setRoleFilter] = useState('all')

    // 模拟用户数据
    const mockUsers = [
        { id: '1', email: 'admin@kashop.com', username: 'Admin', role: 'ADMIN', status: 'active', orderCount: 0, totalSpent: 0, createdAt: '2024-01-01' },
        { id: '2', email: 'user1@example.com', username: '张三', role: 'USER', status: 'active', orderCount: 15, totalSpent: 1280.50, createdAt: '2024-01-10' },
        { id: '3', email: 'user2@example.com', username: '李四', role: 'USER', status: 'active', orderCount: 8, totalSpent: 560.00, createdAt: '2024-01-12' },
        { id: '4', email: 'user3@example.com', username: 'Wang Wu', role: 'USER', status: 'inactive', orderCount: 3, totalSpent: 149.00, createdAt: '2024-01-15' },
        { id: '5', email: 'vip@example.com', username: 'VIP用户', role: 'USER', status: 'active', orderCount: 45, totalSpent: 5680.00, createdAt: '2024-01-08' },
    ]

    const filteredUsers = mockUsers.filter(user => {
        const matchSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.username.toLowerCase().includes(searchTerm.toLowerCase())
        const matchRole = roleFilter === 'all' || user.role === roleFilter
        return matchSearch && matchRole
    })

    const handleToggleStatus = (userId) => {
        alert(`切换用户 ${userId} 状态`)
    }

    const handleChangeRole = (userId, newRole) => {
        alert(`将用户 ${userId} 角色改为 ${newRole}`)
    }

    return (
        <div className="manage-page">
            <div className="page-header">
                <h2>用户管理</h2>
                <div className="header-stats">
                    <span className="stat-item">总用户: {mockUsers.length}</span>
                    <span className="stat-item">管理员: {mockUsers.filter(u => u.role === 'ADMIN').length}</span>
                </div>
            </div>

            {/* 搜索和筛选 */}
            <div className="users-toolbar">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="搜索邮箱或用户名..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filters">
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">全部角色</option>
                        <option value="USER">普通用户</option>
                        <option value="ADMIN">管理员</option>
                    </select>
                </div>
            </div>

            {/* 用户表格 */}
            <div className="users-table-wrapper">
                <table className="admin-table users-table">
                    <thead>
                        <tr>
                            <th>用户</th>
                            <th>角色</th>
                            <th>订单数</th>
                            <th>消费总额</th>
                            <th>状态</th>
                            <th>注册时间</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id}>
                                <td>
                                    <div className="user-cell">
                                        <div className="user-avatar-sm">
                                            {user.username.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="user-info-cell">
                                            <span className="user-name-cell">{user.username}</span>
                                            <span className="user-email-cell">{user.email}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <select
                                        className={`role-select ${user.role.toLowerCase()}`}
                                        value={user.role}
                                        onChange={(e) => handleChangeRole(user.id, e.target.value)}
                                    >
                                        <option value="USER">普通用户</option>
                                        <option value="ADMIN">管理员</option>
                                    </select>
                                </td>
                                <td>{user.orderCount}</td>
                                <td className="amount">¥{user.totalSpent.toFixed(2)}</td>
                                <td>
                                    <span className={`status-badge ${user.status}`}>
                                        {user.status === 'active' ? '正常' : '禁用'}
                                    </span>
                                </td>
                                <td className="time">{user.createdAt}</td>
                                <td className="actions">
                                    <button
                                        className={`action-btn ${user.status === 'active' ? 'delete' : 'view'}`}
                                        onClick={() => handleToggleStatus(user.id)}
                                    >
                                        {user.status === 'active' ? '禁用' : '启用'}
                                    </button>
                                    <button className="action-btn edit">订单</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredUsers.length === 0 && (
                <div className="placeholder-content">
                    <FiUsers />
                    <p>未找到匹配的用户</p>
                </div>
            )}
        </div>
    )
}

// 系统设置
function SettingsPage() {
    const [settings, setSettings] = useState({
        // 基本设置
        siteName: 'Kashop',
        siteDescription: '虚拟物品自动发卡平台',
        contactEmail: 'support@kashop.com',
        // 支付设置
        alipayEnabled: true,
        wechatEnabled: true,
        usdtEnabled: false,
        // 订单设置
        orderTimeout: 30,
        autoCancel: true,
        // 邮件设置
        smtpHost: 'smtp.example.com',
        smtpPort: 465,
        smtpUser: '',
        smtpPass: '',
        emailNotify: true
    })
    const [activeTab, setActiveTab] = useState('basic')
    const [saving, setSaving] = useState(false)

    const handleChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }))
    }

    const handleSave = () => {
        setSaving(true)
        setTimeout(() => {
            setSaving(false)
            alert('设置保存成功！')
        }, 800)
    }

    const tabs = [
        { id: 'basic', label: '基本设置' },
        { id: 'payment', label: '支付设置' },
        { id: 'order', label: '订单设置' },
        { id: 'email', label: '邮件设置' }
    ]

    return (
        <div className="settings-page">
            <div className="page-header">
                <h2>系统设置</h2>
                <button
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? '保存中...' : '保存设置'}
                </button>
            </div>

            {/* 标签页 */}
            <div className="settings-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="settings-content">
                {/* 基本设置 */}
                {activeTab === 'basic' && (
                    <div className="settings-section">
                        <div className="setting-item">
                            <label>网站名称</label>
                            <input
                                type="text"
                                value={settings.siteName}
                                onChange={(e) => handleChange('siteName', e.target.value)}
                                placeholder="网站名称"
                            />
                        </div>
                        <div className="setting-item">
                            <label>网站描述</label>
                            <textarea
                                value={settings.siteDescription}
                                onChange={(e) => handleChange('siteDescription', e.target.value)}
                                placeholder="网站描述"
                                rows={3}
                            />
                        </div>
                        <div className="setting-item">
                            <label>联系邮箱</label>
                            <input
                                type="email"
                                value={settings.contactEmail}
                                onChange={(e) => handleChange('contactEmail', e.target.value)}
                                placeholder="客服邮箱"
                            />
                        </div>
                    </div>
                )}

                {/* 支付设置 */}
                {activeTab === 'payment' && (
                    <div className="settings-section">
                        <div className="setting-item toggle-item">
                            <div className="toggle-info">
                                <label>支付宝</label>
                                <span className="toggle-desc">启用支付宝支付</span>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={settings.alipayEnabled}
                                    onChange={(e) => handleChange('alipayEnabled', e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                        <div className="setting-item toggle-item">
                            <div className="toggle-info">
                                <label>微信支付</label>
                                <span className="toggle-desc">启用微信支付</span>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={settings.wechatEnabled}
                                    onChange={(e) => handleChange('wechatEnabled', e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                        <div className="setting-item toggle-item">
                            <div className="toggle-info">
                                <label>USDT</label>
                                <span className="toggle-desc">启用USDT支付 (需配置)</span>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={settings.usdtEnabled}
                                    onChange={(e) => handleChange('usdtEnabled', e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                        <div className="setting-notice">
                            💡 支付密钥配置请在服务器环境变量中设置，避免泄露
                        </div>
                    </div>
                )}

                {/* 订单设置 */}
                {activeTab === 'order' && (
                    <div className="settings-section">
                        <div className="setting-item">
                            <label>订单超时时间 (分钟)</label>
                            <input
                                type="number"
                                value={settings.orderTimeout}
                                onChange={(e) => handleChange('orderTimeout', parseInt(e.target.value))}
                                min={5}
                                max={120}
                            />
                            <span className="setting-hint">未支付订单超时后自动取消</span>
                        </div>
                        <div className="setting-item toggle-item">
                            <div className="toggle-info">
                                <label>自动取消</label>
                                <span className="toggle-desc">超时订单自动取消</span>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={settings.autoCancel}
                                    onChange={(e) => handleChange('autoCancel', e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                )}

                {/* 邮件设置 */}
                {activeTab === 'email' && (
                    <div className="settings-section">
                        <div className="setting-item toggle-item">
                            <div className="toggle-info">
                                <label>邮件通知</label>
                                <span className="toggle-desc">订单完成后发送卡密到邮箱</span>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={settings.emailNotify}
                                    onChange={(e) => handleChange('emailNotify', e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                        <div className="setting-item">
                            <label>SMTP 服务器</label>
                            <input
                                type="text"
                                value={settings.smtpHost}
                                onChange={(e) => handleChange('smtpHost', e.target.value)}
                                placeholder="smtp.example.com"
                            />
                        </div>
                        <div className="setting-item">
                            <label>SMTP 端口</label>
                            <input
                                type="number"
                                value={settings.smtpPort}
                                onChange={(e) => handleChange('smtpPort', parseInt(e.target.value))}
                                placeholder="465"
                            />
                        </div>
                        <div className="setting-item">
                            <label>发件邮箱</label>
                            <input
                                type="email"
                                value={settings.smtpUser}
                                onChange={(e) => handleChange('smtpUser', e.target.value)}
                                placeholder="noreply@example.com"
                            />
                        </div>
                        <div className="setting-item">
                            <label>邮箱密码/授权码</label>
                            <input
                                type="password"
                                value={settings.smtpPass}
                                onChange={(e) => handleChange('smtpPass', e.target.value)}
                                placeholder="邮箱密码或授权码"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

// 管理后台主组件
function AdminDashboard() {
    const location = useLocation()
    const navigate = useNavigate()
    const { logout, user } = useAuthStore()
    const [sidebarOpen, setSidebarOpen] = useState(true)

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    return (
        <div className={`admin-layout ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
            {/* 侧边栏 */}
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <span className="sidebar-logo">💎 Kashop</span>
                    <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        {sidebarOpen ? <FiX /> : <FiMenu />}
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map(item => {
                        const isActive = item.exact
                            ? location.pathname === item.path
                            : location.pathname.startsWith(item.path)
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`nav-item ${isActive ? 'active' : ''}`}
                            >
                                <item.icon />
                                <span>{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="user-avatar">👤</div>
                        <div className="user-details">
                            <span className="user-name">{user?.username || 'Admin'}</span>
                            <span className="user-role">管理员</span>
                        </div>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>
                        <FiLogOut />
                        <span>退出</span>
                    </button>
                </div>
            </aside>

            {/* 主内容区 */}
            <main className="admin-main">
                <Routes>
                    <Route index element={<DashboardHome />} />
                    <Route path="products" element={<ProductsManage />} />
                    <Route path="orders" element={<OrdersManage />} />
                    <Route path="cards" element={<CardsManage />} />
                    <Route path="users" element={<UsersManage />} />
                    <Route path="settings" element={<SettingsPage />} />
                </Routes>
            </main>
        </div>
    )
}

// 包装导出
function AdminDashboardWithProvider() {
    return (
        <ToastProvider>
            <AdminDashboard />
        </ToastProvider>
    )
}

export default AdminDashboardWithProvider

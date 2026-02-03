import { useState, useEffect, createContext, useContext, useRef } from 'react'
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import {
    FiHome, FiPackage, FiShoppingBag, FiCreditCard,
    FiUsers, FiSettings, FiLogOut, FiMenu, FiX,
    FiTrendingUp, FiDollarSign, FiBox, FiActivity,
    FiCheckCircle, FiAlertCircle, FiInfo, FiAlertTriangle,
    FiChevronDown, FiCheck, FiImage
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

    const showConfirm = (title, message, onConfirm, confirmText = '确认') => {
        setConfirmDialog({ title, message, onConfirm, confirmText })
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
                            <button className="btn btn-primary" onClick={handleConfirm}>
                                {confirmDialog.confirmText || '确认'}
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
    const token = useAuthStore(state => state.token)
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalRevenue: 0,
        totalProducts: 0,
        totalUsers: 0,
        todayOrders: 0,
        todayRevenue: 0,
    })
    const [recentOrders, setRecentOrders] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await fetch('/api/admin/dashboard', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                const data = await res.json()
                setStats({
                    totalOrders: data.totalOrders || 0,
                    totalRevenue: data.totalRevenue || 0,
                    totalProducts: data.totalProducts || 0,
                    totalUsers: data.totalUsers || 0,
                    todayOrders: data.todayOrders || 0,
                    todayRevenue: data.todayRevenue || 0,
                })
                setRecentOrders(data.recentOrders || [])
            } catch (error) {
                console.error('获取仪表盘数据失败:', error)
            } finally {
                setLoading(false)
            }
        }
        if (token) fetchDashboard()
    }, [token])

    const formatTime = (dateStr) => {
        if (!dateStr) return '-'
        const date = new Date(dateStr)
        const now = new Date()
        const diffMs = now - date
        const diffMins = Math.floor(diffMs / 60000)
        if (diffMins < 60) return `${diffMins}分钟前`
        const diffHours = Math.floor(diffMins / 60)
        if (diffHours < 24) return `${diffHours}小时前`
        return date.toLocaleDateString()
    }

    if (loading) {
        return <div className="dashboard-home"><p>加载中...</p></div>
    }

    return (
        <div className="dashboard-home">
            {/* 统计卡片 */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon orders">
                        <FiShoppingBag />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.totalOrders}</span>
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
                        <span className="stat-value">¥{stats.totalRevenue.toFixed(2)}</span>
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
                        <span className="stat-value">{stats.totalProducts}</span>
                        <span className="stat-label">商品数</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon users">
                        <FiUsers />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.totalUsers}</span>
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
                        <span className="today-value">{stats.todayOrders}</span>
                        <span className="today-label">今日订单</span>
                    </div>
                </div>
                <div className="today-card">
                    <FiDollarSign />
                    <div>
                        <span className="today-value">¥{stats.todayRevenue.toFixed(2)}</span>
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
                        {recentOrders.map(order => (
                            <tr key={order.orderNo}>
                                <td className="order-no">{order.orderNo}</td>
                                <td>{order.productName}</td>
                                <td>¥{parseFloat(order.amount || order.totalAmount || 0).toFixed(2)}</td>
                                <td>
                                    <span className={`status-badge ${order.status?.toLowerCase()}`}>
                                        {order.status === 'COMPLETED' ? '已完成' : order.status === 'PENDING' ? '待支付' : order.status}
                                    </span>
                                </td>
                                <td className="time">{formatTime(order.createdAt)}</td>
                            </tr>
                        ))}
                        {recentOrders.length === 0 && (
                            <tr><td colSpan="5" style={{ textAlign: 'center' }}>暂无订单</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

// 商品管理
function ProductsManage() {
    const { showToast, showConfirm } = useToast()
    const token = useAuthStore(state => state.token)
    const navigate = useNavigate()
    const [showModal, setShowModal] = useState(false)
    const [showCategoryModal, setShowCategoryModal] = useState(false)
    const [editingProduct, setEditingProduct] = useState(null)
    const [pendingImages, setPendingImages] = useState([]) // 待上传的图片
    const [uploadProgress, setUploadProgress] = useState(0)
    const [isUploading, setIsUploading] = useState(false)
    const [products, setProducts] = useState([]) // 从 API 获取的商品
    const [categories, setCategories] = useState([]) // 分类列表
    const [loading, setLoading] = useState(true)
    const [stockMode, setStockMode] = useState('auto') // 'auto' = 库存=卡密数量, 'manual' = 手动设置
    const [newCategory, setNewCategory] = useState({ name: '', icon: '📦', description: '' })
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        fullDescription: '',
        price: '',
        originalPrice: '',
        stock: '',
        categoryId: '',
        images: [],
        tags: '',
        variants: [], // 商品规格
        status: 'active'
    })

    // 从 API 获取商品列表和设置
    useEffect(() => {
        fetchProducts()
        fetchStockMode()
    }, [])

    const fetchStockMode = async () => {
        try {
            const res = await fetch('/api/admin/settings', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.settings?.stockMode) {
                setStockMode(data.settings.stockMode)
            }
        } catch (error) {
            console.error('获取设置失败:', error)
        }
    }

    const fetchProducts = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/admin/products', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const data = await response.json()
            setProducts(data.products || [])
        } catch (error) {
            console.error('获取商品列表失败:', error)
        } finally {
            setLoading(false)
        }
    }

    // 获取分类列表
    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/admin/categories', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const data = await response.json()
            setCategories(data.categories || [])
        } catch (error) {
            console.error('获取分类失败:', error)
        }
    }

    // 添加分类
    const handleAddCategory = async () => {
        if (!newCategory.name.trim()) {
            showToast('请输入分类名称', 'error')
            return
        }
        try {
            const response = await fetch('/api/admin/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newCategory)
            })
            if (!response.ok) throw new Error('添加失败')
            showToast('分类添加成功', 'success')
            setNewCategory({ name: '', icon: '📦', description: '' })
            fetchCategories()
        } catch (error) {
            showToast('添加分类失败', 'error')
        }
    }

    // 删除分类
    const handleDeleteCategory = async (categoryId, categoryName) => {
        showConfirm('删除分类', `确定要删除分类「${categoryName}」吗？`, async () => {
            try {
                const response = await fetch(`/api/admin/categories/${categoryId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                if (!response.ok) throw new Error('删除失败')
                showToast('分类已删除', 'success')
                fetchCategories()
            } catch (error) {
                showToast('删除分类失败', 'error')
            }
        })
    }

    // 打开分类管理弹窗
    const openCategoryModal = () => {
        fetchCategories()
        setShowCategoryModal(true)
    }

    const handleAdd = () => {
        setEditingProduct(null)
        setPendingImages([])
        setUploadProgress(0)
        setFormData({
            name: '',
            description: '',
            fullDescription: '',
            price: '',
            originalPrice: '',
            stock: '',
            categoryId: '',
            images: [],
            tags: '',
            variants: [],
            status: 'active'
        })
        fetchCategories()
        setShowModal(true)
    }

    const handleEdit = (product) => {
        setEditingProduct(product)
        setPendingImages([])
        setUploadProgress(0)
        setFormData({
            name: product.name,
            description: product.description || '',
            fullDescription: product.fullDescription || '',
            price: product.price.toString(),
            originalPrice: product.originalPrice?.toString() || '',
            stock: product.stock?.toString() || '',
            categoryId: product.categoryId || '',
            images: product.images || [],
            tags: (product.tags || []).join(', '),
            variants: (product.variants || []).map(v => ({
                type: v.type || '',
                name: v.name,
                price: v.price.toString(),
                originalPrice: v.originalPrice?.toString() || '',
                stock: v.stock?.toString() || '0'
            })),
            // 自动检测是否启用规格类型分组（如果有任何规格带 type 则启用）
            enableVariantTypes: (product.variants || []).some(v => v.type && v.type.trim() !== ''),
            status: product.status
        })
        fetchCategories()
        setShowModal(true)
    }

    const handleDelete = (product) => {
        showConfirm(
            '删除商品',
            `确定要删除商品「${product.name}」吗？此操作不可撤销。`,
            async () => {
                try {
                    const response = await fetch(`/api/admin/products/${product.id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    })
                    if (!response.ok) {
                        throw new Error('删除失败')
                    }
                    showToast('商品已成功删除', 'success')
                    fetchProducts()
                } catch (error) {
                    showToast('删除失败: ' + error.message, 'error')
                }
            }
        )
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // 准备商品数据
        // 提取图片路径数组
        const imagePaths = formData.images.map(img => {
            if (typeof img === 'string') return img
            return img.urls?.medium || img.urls?.original || img
        })

        const productData = {
            name: formData.name,
            description: formData.description,
            fullDescription: formData.fullDescription,
            price: parseFloat(formData.price),
            originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
            stock: formData.stock ? parseInt(formData.stock) : 0,
            image: imagePaths[0] || null,
            images: imagePaths,
            tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : [],
            variants: formData.variants.filter(v => v.name && v.price),
            status: formData.status?.toUpperCase() || 'ACTIVE'
        }

        // 只有选择了分类才包含 categoryId
        if (formData.categoryId && formData.categoryId !== '') {
            productData.categoryId = formData.categoryId
        }

        try {
            const url = editingProduct
                ? `/api/admin/products/${editingProduct.id}`
                : '/api/admin/products'

            const response = await fetch(url, {
                method: editingProduct ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(productData)
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || '操作失败')
            }

            if (editingProduct) {
                showToast('商品更新成功', 'success')
            } else {
                showToast('商品添加成功', 'success')
            }
            setShowModal(false)
            // 刷新页面以显示新商品（临时方案）
            fetchProducts()
        } catch (error) {
            showToast('操作失败: ' + error.message, 'error')
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    // 处理图片选择
    const handleImageSelect = async (e) => {
        const files = Array.from(e.target.files)
        if (files.length === 0) return

        // 验证并生成预览
        const newPending = []
        for (const file of files) {
            if (!file.type.startsWith('image/')) {
                showToast(`${file.name} 不是图片文件`, 'warning')
                continue
            }
            if (file.size > 5 * 1024 * 1024) {
                showToast(`${file.name} 超过 5MB`, 'warning')
                continue
            }
            // 生成预览
            const preview = await new Promise((resolve) => {
                const reader = new FileReader()
                reader.onload = (ev) => resolve(ev.target.result)
                reader.readAsDataURL(file)
            })
            newPending.push({ file, preview, name: file.name })
        }
        setPendingImages(prev => [...prev, ...newPending])
        e.target.value = '' // 重置 input
    }

    // 上传待上传图片
    const handleUploadImages = async () => {
        if (pendingImages.length === 0) {
            showToast('请先选择图片', 'warning')
            return
        }

        setIsUploading(true)
        setUploadProgress(0)

        try {
            const formDataUpload = new FormData()
            pendingImages.forEach(item => {
                formDataUpload.append('images', item.file)
            })

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formDataUpload
            })

            if (!response.ok) {
                throw new Error('上传失败')
            }

            const result = await response.json()

            // 添加到已上传列表
            const newImages = result.images.map(img => ({
                fileName: img.fileName,
                urls: img.urls
            }))

            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...newImages]
            }))

            setPendingImages([])
            setUploadProgress(100)
            showToast(`成功上传 ${result.images.length} 张图片`, 'success')
        } catch (error) {
            showToast('图片上传失败: ' + error.message, 'error')
        } finally {
            setIsUploading(false)
        }
    }

    // 删除待上传图片
    const removePendingImage = (index) => {
        setPendingImages(prev => prev.filter((_, i) => i !== index))
    }

    // 删除已上传图片
    const removeUploadedImage = async (index) => {
        const image = formData.images[index]
        try {
            await fetch(`/api/upload/${image.fileName}`, {
                method: 'DELETE'
            })
            setFormData(prev => ({
                ...prev,
                images: prev.images.filter((_, i) => i !== index)
            }))
            showToast('图片已删除', 'success')
        } catch (error) {
            showToast('删除失败', 'error')
        }
    }

    return (
        <div className="manage-page">
            <div className="page-header">
                <h2>商品管理</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-secondary" onClick={openCategoryModal}>📁 分类管理</button>
                    <button className="btn btn-primary" onClick={handleAdd}>+ 添加商品</button>
                </div>
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
                        {loading ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>加载中...</td></tr>
                        ) : products.length === 0 ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>暂无商品</td></tr>
                        ) : products.map(product => (
                            <tr key={product.id}>
                                <td>{product.name}</td>
                                <td>¥{parseFloat(product.price).toFixed(2)}</td>
                                <td>{product.stock}</td>
                                <td>{product.soldCount || 0}</td>
                                <td>
                                    <span className={`status-badge ${product.status?.toLowerCase()}`}>
                                        {product.status === 'ACTIVE' ? '上架' : '下架'}
                                    </span>
                                </td>
                                <td className="actions">
                                    <button className="action-btn edit" onClick={() => handleEdit(product)}>编辑</button>
                                    <button className="action-btn cards" onClick={() => navigate(`/admin/cards?productId=${product.id}`)}>卡密</button>
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
                                <label>简短描述 <span style={{ color: '#999', fontWeight: 'normal' }}>(显示在商品卡片和标题下方)</span></label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="一句话描述商品特点"
                                    rows={2}
                                />
                            </div>
                            <div className="form-group">
                                <label>详细描述 <span style={{ color: '#999', fontWeight: 'normal' }}>(显示在商品详情页底部)</span></label>
                                <textarea
                                    name="fullDescription"
                                    value={formData.fullDescription}
                                    onChange={handleChange}
                                    placeholder="【商品说明】&#10;• 商品内容1&#10;• 商品内容2&#10;&#10;【使用方法】&#10;1. 步骤一&#10;2. 步骤二"
                                    rows={6}
                                />
                            </div>

                            {/* 商品规格 - 放在价格上方 */}
                            <div className="form-group variants-section">
                                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span>
                                        商品规格
                                        <span style={{ color: '#999', fontWeight: 'normal', marginLeft: 8 }}>
                                            (可选，如：月卡、季卡、年卡)
                                        </span>
                                    </span>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 'normal', fontSize: '0.9rem', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.enableVariantTypes || false}
                                            onChange={(e) => {
                                                setFormData({ ...formData, enableVariantTypes: e.target.checked })
                                            }}
                                            style={{ width: 16, height: 16 }}
                                        />
                                        启用规格类型分组
                                    </label>
                                </label>

                                {formData.enableVariantTypes ? (
                                    /* 带类型分组的规格 */
                                    <>
                                        {(() => {
                                            // 按类型分组规格
                                            const types = [...new Set(formData.variants.map(v => v.type || '默认').filter(Boolean))]
                                            if (types.length === 0) types.push('默认')

                                            return types.map((typeName, typeIndex) => (
                                                <div key={typeIndex} className="variant-type-group" style={{
                                                    border: '1px solid var(--border-color)',
                                                    borderRadius: 8,
                                                    padding: 16,
                                                    marginBottom: 12,
                                                    background: 'var(--card-bg)'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                                        <span style={{ fontWeight: 500 }}>类型:</span>
                                                        <input
                                                            type="text"
                                                            value={typeName === '默认' ? '' : typeName}
                                                            placeholder="输入类型名称，如：共享、独享"
                                                            onChange={(e) => {
                                                                const oldType = typeName
                                                                const newType = e.target.value || '默认'
                                                                const newVariants = formData.variants.map(v =>
                                                                    (v.type || '默认') === oldType ? { ...v, type: newType === '默认' ? '' : newType } : v
                                                                )
                                                                setFormData({ ...formData, variants: newVariants })
                                                            }}
                                                            style={{ flex: 1 }}
                                                        />
                                                        {types.length > 1 && (
                                                            <button
                                                                type="button"
                                                                className="remove-variant-btn"
                                                                onClick={() => {
                                                                    const newVariants = formData.variants.filter(v => (v.type || '默认') !== typeName)
                                                                    setFormData({ ...formData, variants: newVariants })
                                                                }}
                                                                title="删除此类型"
                                                            >
                                                                ✕
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* 该类型下的规格列表 */}
                                                    {formData.variants
                                                        .map((v, i) => ({ ...v, originalIndex: i }))
                                                        .filter(v => (v.type || '默认') === typeName)
                                                        .map((variant) => (
                                                            <div key={variant.originalIndex} className="variant-row">
                                                                <input
                                                                    type="text"
                                                                    placeholder="规格名称"
                                                                    value={variant.name}
                                                                    onChange={(e) => {
                                                                        const newVariants = [...formData.variants]
                                                                        newVariants[variant.originalIndex].name = e.target.value
                                                                        setFormData({ ...formData, variants: newVariants })
                                                                    }}
                                                                    style={{ flex: 2 }}
                                                                />
                                                                <input
                                                                    type="number"
                                                                    placeholder="价格"
                                                                    value={variant.price}
                                                                    onChange={(e) => {
                                                                        const newVariants = [...formData.variants]
                                                                        newVariants[variant.originalIndex].price = e.target.value
                                                                        setFormData({ ...formData, variants: newVariants })
                                                                    }}
                                                                    step="0.01"
                                                                    style={{ flex: 1 }}
                                                                />
                                                                <input
                                                                    type="number"
                                                                    placeholder="原价"
                                                                    value={variant.originalPrice}
                                                                    onChange={(e) => {
                                                                        const newVariants = [...formData.variants]
                                                                        newVariants[variant.originalIndex].originalPrice = e.target.value
                                                                        setFormData({ ...formData, variants: newVariants })
                                                                    }}
                                                                    step="0.01"
                                                                    style={{ flex: 1 }}
                                                                />
                                                                <input
                                                                    type="number"
                                                                    placeholder="库存"
                                                                    value={variant.stock}
                                                                    onChange={(e) => {
                                                                        const newVariants = [...formData.variants]
                                                                        newVariants[variant.originalIndex].stock = e.target.value
                                                                        setFormData({ ...formData, variants: newVariants })
                                                                    }}
                                                                    style={{ flex: 1 }}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    className="remove-variant-btn"
                                                                    onClick={() => {
                                                                        const newVariants = formData.variants.filter((_, i) => i !== variant.originalIndex)
                                                                        setFormData({ ...formData, variants: newVariants })
                                                                    }}
                                                                >
                                                                    ✕
                                                                </button>
                                                            </div>
                                                        ))}

                                                    <button
                                                        type="button"
                                                        className="add-variant-btn"
                                                        style={{ marginTop: 8 }}
                                                        onClick={() => {
                                                            setFormData({
                                                                ...formData,
                                                                variants: [...formData.variants, {
                                                                    type: typeName === '默认' ? '' : typeName,
                                                                    name: '',
                                                                    price: '',
                                                                    originalPrice: '',
                                                                    stock: '0'
                                                                }]
                                                            })
                                                        }}
                                                    >
                                                        + 添加规格
                                                    </button>
                                                </div>
                                            ))
                                        })()}

                                        <button
                                            type="button"
                                            className="add-variant-btn"
                                            style={{ background: 'transparent', border: '2px dashed var(--border-color)', color: 'var(--primary-color)' }}
                                            onClick={() => {
                                                const existingTypes = [...new Set(formData.variants.map(v => v.type || '默认'))]
                                                const newTypeName = `类型${existingTypes.length + 1}`
                                                setFormData({
                                                    ...formData,
                                                    variants: [...formData.variants, {
                                                        type: newTypeName,
                                                        name: '',
                                                        price: '',
                                                        originalPrice: '',
                                                        stock: '0'
                                                    }]
                                                })
                                            }}
                                        >
                                            + 添加类型
                                        </button>
                                    </>
                                ) : (
                                    /* 无类型分组的简单规格 */
                                    <>
                                        {formData.variants.map((variant, index) => (
                                            <div key={index} className="variant-row">
                                                <input
                                                    type="text"
                                                    placeholder="规格名称"
                                                    value={variant.name}
                                                    onChange={(e) => {
                                                        const newVariants = [...formData.variants]
                                                        newVariants[index].name = e.target.value
                                                        setFormData({ ...formData, variants: newVariants })
                                                    }}
                                                    style={{ flex: 2 }}
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="价格"
                                                    value={variant.price}
                                                    onChange={(e) => {
                                                        const newVariants = [...formData.variants]
                                                        newVariants[index].price = e.target.value
                                                        setFormData({ ...formData, variants: newVariants })
                                                    }}
                                                    step="0.01"
                                                    style={{ flex: 1 }}
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="原价"
                                                    value={variant.originalPrice}
                                                    onChange={(e) => {
                                                        const newVariants = [...formData.variants]
                                                        newVariants[index].originalPrice = e.target.value
                                                        setFormData({ ...formData, variants: newVariants })
                                                    }}
                                                    step="0.01"
                                                    style={{ flex: 1 }}
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="库存"
                                                    value={variant.stock}
                                                    onChange={(e) => {
                                                        const newVariants = [...formData.variants]
                                                        newVariants[index].stock = e.target.value
                                                        setFormData({ ...formData, variants: newVariants })
                                                    }}
                                                    style={{ flex: 1 }}
                                                />
                                                <button
                                                    type="button"
                                                    className="remove-variant-btn"
                                                    onClick={() => {
                                                        const newVariants = formData.variants.filter((_, i) => i !== index)
                                                        setFormData({ ...formData, variants: newVariants })
                                                    }}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}

                                        <button
                                            type="button"
                                            className="add-variant-btn"
                                            onClick={() => {
                                                setFormData({
                                                    ...formData,
                                                    variants: [...formData.variants, { name: '', price: '', originalPrice: '', stock: '0' }]
                                                })
                                            }}
                                        >
                                            + 添加规格
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* 无规格时显示价格和库存输入 */}
                            {!(formData.variants.length > 0 && formData.variants.some(v => v.name)) && (
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
                                    {stockMode === 'manual' && (
                                        <div className="form-group">
                                            <label>库存 *</label>
                                            <input
                                                type="number"
                                                name="stock"
                                                value={formData.stock}
                                                onChange={handleChange}
                                                placeholder="0"
                                                min="0"
                                                required
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="form-group">
                                <label>商品类别 *</label>
                                <CustomSelect
                                    name="categoryId"
                                    value={formData.categoryId}
                                    onChange={handleChange}
                                    placeholder="请选择类别"
                                    options={categories.map(cat => ({
                                        value: cat.id,
                                        label: `${cat.icon} ${cat.name}`
                                    }))}
                                />
                            </div>
                            <div className="form-group">
                                <label>商品标签 <span style={{ color: '#999', fontWeight: 'normal' }}>(多个标签用逗号分隔，如：热销, 推荐, 限时)</span></label>
                                <input
                                    type="text"
                                    name="tags"
                                    value={formData.tags}
                                    onChange={handleChange}
                                    placeholder="热销, 推荐, 限时优惠"
                                />
                            </div>
                            <div className="form-group">
                                <label>商品图片 <span className="upload-count">({formData.images.length} 已上传, {pendingImages.length} 待上传)</span></label>
                                <div className="image-upload-area multi">
                                    {/* 已上传的图片 */}
                                    {formData.images.map((img, index) => {
                                        // 处理不同格式的图片数据
                                        const imgUrl = typeof img === 'string'
                                            ? `${img}`
                                            : img.urls?.medium
                                                ? `${img.urls.medium}`
                                                : `${img.urls?.original || img}`
                                        return (
                                            <div key={`uploaded-${index}`} className="image-preview uploaded">
                                                <img src={imgUrl} alt={`已上传 ${index + 1}`} />
                                                <button
                                                    type="button"
                                                    className="remove-image-btn"
                                                    onClick={() => removeUploadedImage(index)}
                                                >
                                                    ×
                                                </button>
                                                <span className="image-status done">✓</span>
                                            </div>
                                        )
                                    })}

                                    {/* 待上传的图片 */}
                                    {pendingImages.map((img, index) => (
                                        <div key={`pending-${index}`} className="image-preview pending">
                                            <img src={img.preview} alt={img.name} />
                                            <button
                                                type="button"
                                                className="remove-image-btn"
                                                onClick={() => removePendingImage(index)}
                                            >
                                                ×
                                            </button>
                                            <span className="image-status pending">待传</span>
                                        </div>
                                    ))}

                                    {/* 添加图片按钮 */}
                                    <label className="upload-add-btn">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageSelect}
                                            style={{ display: 'none' }}
                                        />
                                        <div className="upload-add-content">
                                            <FiImage className="upload-icon" />
                                            <span>添加图片</span>
                                        </div>
                                    </label>
                                </div>

                                {/* 上传按钮和进度 */}
                                {pendingImages.length > 0 && (
                                    <div className="upload-actions">
                                        <button
                                            type="button"
                                            className="btn btn-primary upload-btn"
                                            onClick={handleUploadImages}
                                            disabled={isUploading}
                                        >
                                            {isUploading ? `上传中...` : `上传 ${pendingImages.length} 张图片`}
                                        </button>
                                        {isUploading && (
                                            <div className="upload-progress-bar">
                                                <div className="upload-progress-fill" style={{ width: `${uploadProgress}%` }} />
                                            </div>
                                        )}
                                    </div>
                                )}
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

            {/* 分类管理弹窗 */}
            {showCategoryModal && (
                <div className="modal-overlay" onClick={() => setShowCategoryModal(false)}>
                    <div className="modal-content" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>📁 分类管理</h3>
                            <button className="modal-close" onClick={() => setShowCategoryModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            {/* 添加新分类 */}
                            <div style={{ marginBottom: '20px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                                <h4 style={{ marginBottom: '12px', fontSize: '14px', color: 'var(--text-secondary)' }}>添加新分类</h4>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                    <input
                                        type="text"
                                        placeholder="图标 (emoji)"
                                        value={newCategory.icon}
                                        onChange={e => setNewCategory(prev => ({ ...prev, icon: e.target.value }))}
                                        className="input"
                                        style={{ width: '80px', textAlign: 'center', fontSize: '20px' }}
                                    />
                                    <input
                                        type="text"
                                        placeholder="分类名称"
                                        value={newCategory.name}
                                        onChange={e => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                                        className="input"
                                        style={{ flex: 1 }}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input
                                        type="text"
                                        placeholder="分类描述 (可选)"
                                        value={newCategory.description}
                                        onChange={e => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                                        className="input"
                                        style={{ flex: 1 }}
                                    />
                                    <button className="btn btn-primary" onClick={handleAddCategory}>添加</button>
                                </div>
                            </div>

                            {/* 分类列表 */}
                            <div>
                                <h4 style={{ marginBottom: '12px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                                    现有分类 ({categories.length})
                                </h4>
                                {categories.length === 0 ? (
                                    <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '20px' }}>暂无分类</p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {categories.map(cat => (
                                            <div key={cat.id} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '12px 16px',
                                                background: 'var(--bg-secondary)',
                                                borderRadius: '8px',
                                                border: '1px solid var(--border-color)'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <span style={{ fontSize: '24px' }}>{cat.icon}</span>
                                                    <div>
                                                        <div style={{ fontWeight: '500' }}>{cat.name}</div>
                                                        <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                                                            {cat.productCount || 0} 个商品
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    className="action-btn delete"
                                                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                                                    style={{ padding: '6px 12px' }}
                                                >
                                                    删除
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// 订单管理
function OrdersManage() {
    const token = useAuthStore(state => state.token)
    const { showToast, showConfirm } = useToast()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState('all')
    const [shipping, setShipping] = useState(null) // 正在发货的订单ID

    // 卡密输入弹窗状态
    const [showCardInputModal, setShowCardInputModal] = useState(false)
    const [cardInputOrder, setCardInputOrder] = useState(null)
    const [cardInputContent, setCardInputContent] = useState('')

    useEffect(() => {
        fetchOrders()
    }, [statusFilter])

    const fetchOrders = async () => {
        setLoading(true)
        try {
            const url = statusFilter === 'all'
                ? '/api/admin/orders'
                : `/api/admin/orders?status=${statusFilter}`
            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            setOrders(data.orders || data || [])
        } catch (error) {
            console.error('获取订单失败:', error)
        } finally {
            setLoading(false)
        }
    }

    // 执行发货请求
    const doShip = async (orderId, cardContent = null) => {
        setShipping(orderId)
        try {
            const body = cardContent ? { cardContent } : {}
            const res = await fetch(`/api/admin/orders/${orderId}/ship`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            })
            const data = await res.json()

            if (res.ok) {
                showToast(data.emailSent ? '发货成功，邮件已发送' : '发货成功，邮件发送失败', data.emailSent ? 'success' : 'warning')
                setShowCardInputModal(false)
                setCardInputOrder(null)
                setCardInputContent('')
                fetchOrders()
            } else if (data.needCardContent) {
                // 需要输入卡密，显示弹窗
                const order = orders.find(o => o.id === orderId)
                setCardInputOrder(order)
                setShowCardInputModal(true)
            } else {
                showToast(data.error || '发货失败', 'error')
            }
        } catch (error) {
            showToast('发货失败', 'error')
        } finally {
            setShipping(null)
        }
    }

    // 点击发货按钮，直接弹出发货弹窗
    const handleShip = (order) => {
        setCardInputOrder(order)
        setCardInputContent('')
        setShowCardInputModal(true)
    }

    // 提交发货
    const handleSubmitShip = async () => {
        await doShip(cardInputOrder.id, cardInputContent || null)
    }

    const formatTime = (dateStr) => {
        if (!dateStr) return '-'
        return new Date(dateStr).toLocaleString()
    }

    const statusMap = {
        PENDING: { label: '待支付', class: 'pending' },
        PAID: { label: '已支付', class: 'paid' },
        COMPLETED: { label: '已完成', class: 'completed' },
        CANCELLED: { label: '已取消', class: 'cancelled' }
    }

    if (loading) {
        return <div className="manage-page"><p>加载中...</p></div>
    }

    return (
        <div className="manage-page">
            <div className="page-header">
                <h2>订单管理</h2>
                <div className="header-stats">
                    <span className="stat-item">共 {orders.length} 条订单</span>
                </div>
                <div className="filters">
                    <select
                        className="filter-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">全部状态</option>
                        <option value="PENDING">待支付</option>
                        <option value="PAID">待发货</option>
                        <option value="COMPLETED">已完成</option>
                        <option value="CANCELLED">已取消</option>
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
                    {orders.map(order => (
                        <tr key={order.id || order.orderNo}>
                            <td className="order-no">{order.orderNo}</td>
                            <td>{order.productName}</td>
                            <td>¥{parseFloat(order.totalAmount).toFixed(2)}</td>
                            <td>{order.email}</td>
                            <td>
                                <span className={`status-badge ${statusMap[order.status?.toUpperCase()]?.class || order.status?.toLowerCase()}`}>
                                    {statusMap[order.status?.toUpperCase()]?.label || order.status}
                                </span>
                            </td>
                            <td className="time">{formatTime(order.createdAt)}</td>
                            <td className="actions">
                                {order.status?.toUpperCase() === 'PAID' && (
                                    <button
                                        className="action-btn ship"
                                        onClick={() => handleShip(order)}
                                        disabled={shipping === order.id}
                                    >
                                        {shipping === order.id ? '发货中...' : '发货'}
                                    </button>
                                )}
                                <button className="action-btn view">查看</button>
                            </td>
                        </tr>
                    ))}
                    {orders.length === 0 && (
                        <tr><td colSpan="7" style={{ textAlign: 'center' }}>暂无订单</td></tr>
                    )}
                </tbody>
            </table>

            {/* 发货弹窗 - 优化UI */}
            {showCardInputModal && cardInputOrder && (
                <div className="ship-modal-overlay" onClick={() => setShowCardInputModal(false)}>
                    <div className="ship-modal" onClick={e => e.stopPropagation()}>
                        <div className="ship-modal-header">
                            <div className="ship-modal-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20 12v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6M12 3v12M8 7l4-4 4 4" />
                                </svg>
                            </div>
                            <h3>手动发货</h3>
                            <p className="ship-modal-subtitle">订单 {cardInputOrder.orderNo}</p>
                            <button className="ship-modal-close" onClick={() => setShowCardInputModal(false)}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="ship-modal-body">
                            <div className="order-info-card">
                                <div className="order-info-row">
                                    <span className="order-info-label">商品名称</span>
                                    <span className="order-info-value">{cardInputOrder.productName}</span>
                                </div>
                                <div className="order-info-row">
                                    <span className="order-info-label">购买数量</span>
                                    <span className="order-info-value highlight">{cardInputOrder.quantity} 件</span>
                                </div>
                                <div className="order-info-row">
                                    <span className="order-info-label">客户邮箱</span>
                                    <span className="order-info-value">{cardInputOrder.email}</span>
                                </div>
                            </div>

                            <div className="card-input-section">
                                <label className="card-input-label">
                                    <span className="card-icon">🎫</span>
                                    卡密内容
                                    <span className="card-hint">每行一个，最多 {cardInputOrder.quantity} 个</span>
                                </label>
                                <textarea
                                    className="card-input-textarea"
                                    value={cardInputContent}
                                    onChange={(e) => setCardInputContent(e.target.value)}
                                    placeholder={`请输入卡密内容...\n每行一个卡密`}
                                    rows={6}
                                    autoFocus
                                />
                            </div>

                            <div className="ship-notice">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 16v-4M12 8h.01" />
                                </svg>
                                <span>发货后将自动发送邮件通知客户，邮件中包含卡密信息</span>
                            </div>
                        </div>

                        <div className="ship-modal-footer">
                            <button
                                className="ship-btn ship-btn-cancel"
                                onClick={() => setShowCardInputModal(false)}
                            >
                                取消
                            </button>
                            <button
                                className="ship-btn ship-btn-confirm"
                                onClick={handleSubmitShip}
                                disabled={shipping === cardInputOrder.id || !cardInputContent.trim()}
                            >
                                {shipping === cardInputOrder.id ? (
                                    <>
                                        <span className="loading-spinner"></span>
                                        发货中...
                                    </>
                                ) : (
                                    <>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                                        </svg>
                                        确认发货
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// 卡密管理
function CardsManage() {
    const { showToast } = useToast()
    const { token } = useAuthStore()
    const location = useLocation()

    // 从URL获取初始productId
    const params = new URLSearchParams(location.search)
    const initialProductId = params.get('productId') || ''

    const [cards, setCards] = useState([])
    const [products, setProducts] = useState([])
    const [selectedProductId, setSelectedProductId] = useState(initialProductId)
    const [statusFilter, setStatusFilter] = useState('')
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)
    const [showImportModal, setShowImportModal] = useState(false)
    const [importText, setImportText] = useState('')
    const [selectedVariantId, setSelectedVariantId] = useState('')
    const [selectedCards, setSelectedCards] = useState([])
    const [editingCard, setEditingCard] = useState(null)
    const [editContent, setEditContent] = useState('')

    // 获取商品列表
    useEffect(() => {
        if (!token) return
        const fetchProducts = async () => {
            try {
                const response = await fetch('/api/admin/products?pageSize=100', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                const data = await response.json()
                if (response.ok && data.products) {
                    setProducts(data.products)
                }
            } catch (error) {
                console.error('获取商品列表失败:', error)
            }
        }
        fetchProducts()
    }, [token])

    // 获取卡密列表
    const fetchCards = async () => {
        if (!token) return
        setLoading(true)
        try {
            const params = new URLSearchParams({ page, pageSize: 20 })
            if (selectedProductId) params.append('productId', selectedProductId)
            if (statusFilter) params.append('status', statusFilter)

            const response = await fetch(`/api/admin/cards?${params}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await response.json()
            if (data.cards) {
                setCards(data.cards)
                setTotalPages(data.totalPages)
                setTotal(data.total)
            }
        } catch (error) {
            showToast('获取卡密列表失败', 'error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCards()
    }, [selectedProductId, statusFilter, page])

    // 批量导入卡密
    const handleImport = async () => {
        if (!selectedProductId) {
            showToast('请先选择商品', 'error')
            return
        }
        // 检查商品是否有规格，有则必须选择
        const selectedProduct = products.find(p => p.id === selectedProductId)
        if (selectedProduct?.variants?.length > 0 && !selectedVariantId) {
            showToast('请选择规格', 'error')
            return
        }
        if (!importText.trim()) {
            showToast('请输入卡密内容', 'error')
            return
        }

        const cardsArray = importText.split('\n').map(c => c.trim()).filter(c => c)
        if (cardsArray.length === 0) {
            showToast('没有有效的卡密', 'error')
            return
        }

        try {

            const response = await fetch('/api/admin/cards/import', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    productId: selectedProductId,
                    variantId: selectedVariantId === 'default' ? null : selectedVariantId,
                    cards: cardsArray
                })
            })
            const data = await response.json()
            if (response.ok) {
                showToast(data.message, 'success')
                setShowImportModal(false)
                setImportText('')
                fetchCards()
            } else {
                showToast(data.error, 'error')
            }
        } catch (error) {
            showToast('导入失败', 'error')
        }
    }

    // 删除单个卡密
    const handleDelete = async (id) => {
        if (!confirm('确定删除此卡密？')) return

        try {

            const response = await fetch(`/api/admin/cards/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await response.json()
            if (response.ok) {
                showToast(data.message, 'success')
                fetchCards()
            } else {
                showToast(data.error, 'error')
            }
        } catch (error) {
            showToast('删除失败', 'error')
        }
    }

    // 编辑卡密
    const handleEdit = (card) => {
        setEditingCard(card)
        setEditContent(card.content)
    }

    // 保存编辑
    const handleSaveEdit = async () => {
        if (!editContent.trim()) {
            showToast('卡密内容不能为空', 'error')
            return
        }

        try {
            const response = await fetch(`/api/admin/cards/${editingCard.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content: editContent.trim() })
            })
            const data = await response.json()
            if (response.ok) {
                showToast(data.message, 'success')
                setEditingCard(null)
                setEditContent('')
                fetchCards()
            } else {
                showToast(data.error, 'error')
            }
        } catch (error) {
            showToast('保存失败', 'error')
        }
    }

    // 批量删除
    const handleBatchDelete = async () => {
        if (selectedCards.length === 0) {
            showToast('请选择要删除的卡密', 'error')
            return
        }
        if (!confirm(`确定删除选中的 ${selectedCards.length} 个卡密？`)) return

        try {

            const response = await fetch('/api/admin/cards/batch-delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ids: selectedCards, productId: selectedProductId })
            })
            const data = await response.json()
            if (response.ok) {
                showToast(data.message, 'success')
                setSelectedCards([])
                fetchCards()
            } else {
                showToast(data.error, 'error')
            }
        } catch (error) {
            showToast('删除失败', 'error')
        }
    }

    // 选择/取消选择卡密
    const toggleCardSelection = (id) => {
        setSelectedCards(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        )
    }

    // 全选/取消全选
    const toggleSelectAll = () => {
        const availableCards = cards.filter(c => c.status === 'AVAILABLE')
        if (selectedCards.length === availableCards.length) {
            setSelectedCards([])
        } else {
            setSelectedCards(availableCards.map(c => c.id))
        }
    }

    const getStatusBadge = (status) => {
        switch (status) {
            case 'AVAILABLE': return <span className="badge badge-success">可用</span>
            case 'SOLD': return <span className="badge badge-warning">已售</span>
            case 'EXPIRED': return <span className="badge badge-danger">过期</span>
            default: return <span className="badge">{status}</span>
        }
    }

    return (
        <div className="manage-page">
            <div className="page-header">
                <h2>卡密管理</h2>
                <div className="header-actions">
                    {selectedCards.length > 0 && (
                        <button className="btn btn-danger" onClick={handleBatchDelete}>
                            删除选中 ({selectedCards.length})
                        </button>
                    )}
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowImportModal(true)}
                    >
                        + 批量导入
                    </button>
                </div>
            </div>

            {/* 筛选栏 */}
            <div className="filter-bar">
                <div className="filter-group">
                    <label>选择商品</label>
                    <select
                        value={selectedProductId}
                        onChange={(e) => { setSelectedProductId(e.target.value); setPage(1); }}
                    >
                        <option value="">全部商品</option>
                        {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
                <div className="filter-group">
                    <label>状态</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    >
                        <option value="">全部状态</option>
                        <option value="AVAILABLE">可用</option>
                        <option value="SOLD">已售</option>
                        <option value="EXPIRED">过期</option>
                    </select>
                </div>
                <div className="filter-info">
                    共 {total} 条记录
                </div>
            </div>

            {/* 卡密列表 */}
            {loading ? (
                <div className="loading-state">加载中...</div>
            ) : cards.length === 0 ? (
                <div className="placeholder-content">
                    <FiCreditCard />
                    <p>{selectedProductId ? '该商品暂无卡密' : '选择商品后可管理对应卡密'}</p>
                </div>
            ) : (
                <>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ width: '40px' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedCards.length > 0 && selectedCards.length === cards.filter(c => c.status === 'AVAILABLE').length}
                                            onChange={toggleSelectAll}
                                        />
                                    </th>
                                    <th>卡密内容</th>
                                    <th>商品</th>
                                    <th>规格</th>
                                    <th>状态</th>
                                    <th>订单号</th>
                                    <th>创建时间</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cards.map(card => (
                                    <tr key={card.id}>
                                        <td>
                                            {card.status === 'AVAILABLE' && (
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCards.includes(card.id)}
                                                    onChange={() => toggleCardSelection(card.id)}
                                                />
                                            )}
                                        </td>
                                        <td>
                                            <code className="card-content">{card.content.length > 50 ? card.content.substring(0, 50) + '...' : card.content}</code>
                                        </td>
                                        <td>{card.product?.name || '-'}</td>
                                        <td>{card.variant?.name || '-'}</td>
                                        <td>{getStatusBadge(card.status)}</td>
                                        <td>{card.order?.orderNo || '-'}</td>
                                        <td>{new Date(card.createdAt).toLocaleString('zh-CN')}</td>
                                        <td>
                                            {card.status === 'AVAILABLE' && (
                                                <div className="actions">
                                                    <button
                                                        className="btn btn-sm btn-secondary"
                                                        onClick={() => handleEdit(card)}
                                                    >
                                                        编辑
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => handleDelete(card.id)}
                                                    >
                                                        删除
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* 分页 */}
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                            >
                                上一页
                            </button>
                            <span>第 {page} / {totalPages} 页</span>
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage(p => p + 1)}
                            >
                                下一页
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* 导入弹窗 */}
            {showImportModal && (
                <div className="modal-overlay" onClick={() => setShowImportModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>批量导入卡密</h3>
                            <button className="modal-close" onClick={() => setShowImportModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>目标商品</label>
                                <select
                                    value={selectedProductId}
                                    onChange={(e) => {
                                        setSelectedProductId(e.target.value)
                                        setSelectedVariantId('')
                                    }}
                                >
                                    <option value="">请选择商品</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            {/* 规格选择 - 当商品有规格时必须选择 */}
                            {selectedProductId && products.find(p => p.id === selectedProductId)?.variants?.length > 0 && (
                                <div className="form-group">
                                    <label>目标规格 <span className="required">*</span></label>
                                    <select
                                        value={selectedVariantId}
                                        onChange={(e) => setSelectedVariantId(e.target.value)}
                                    >
                                        <option value="">请选择规格</option>
                                        <option value="default">默认 (¥{products.find(p => p.id === selectedProductId)?.price})</option>
                                        {products.find(p => p.id === selectedProductId)?.variants?.map(v => (
                                            <option key={v.id} value={v.id}>{v.name} (¥{v.price})</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div className="form-group">
                                <label>卡密内容 <span className="hint">(每行一个卡密)</span></label>
                                <textarea
                                    value={importText}
                                    onChange={(e) => setImportText(e.target.value)}
                                    placeholder="请输入卡密，每行一个&#10;例如：&#10;ABC123-DEF456&#10;XYZ789-GHI012"
                                    rows={10}
                                />
                            </div>
                            <div className="import-preview">
                                预计导入：{importText.split('\n').filter(c => c.trim()).length} 个卡密
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowImportModal(false)}>取消</button>
                            <button className="btn btn-primary" onClick={handleImport}>确认导入</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 编辑弹窗 */}
            {editingCard && (
                <div className="modal-overlay" onClick={() => setEditingCard(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>编辑卡密</h3>
                            <button className="modal-close" onClick={() => setEditingCard(null)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>卡密内容</label>
                                <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    rows={5}
                                    placeholder="请输入卡密内容"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setEditingCard(null)}>取消</button>
                            <button className="btn btn-primary" onClick={handleSaveEdit}>保存</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// 用户管理
function UsersManage() {
    const { showToast } = useToast()
    const token = useAuthStore(state => state.token)
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [roleFilter, setRoleFilter] = useState('all')

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            setUsers(data.users || data || [])
        } catch (error) {
            console.error('获取用户列表失败:', error)
            showToast('获取用户列表失败', 'error')
        } finally {
            setLoading(false)
        }
    }

    const filteredUsers = users.filter(user => {
        const matchSearch = (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (user.username?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        const matchRole = roleFilter === 'all' || user.role === roleFilter
        return matchSearch && matchRole
    })

    const handleToggleStatus = async (userId, currentStatus) => {
        try {
            const res = await fetch(`/api/admin/users/${userId}/toggle-status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            if (res.ok) {
                showToast('状态更新成功', 'success')
                fetchUsers()
            } else {
                showToast('状态更新失败', 'error')
            }
        } catch (error) {
            showToast('操作失败', 'error')
        }
    }

    const handleChangeRole = async (userId, newRole) => {
        try {
            const res = await fetch(`/api/admin/users/${userId}/role`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ role: newRole })
            })
            if (res.ok) {
                showToast('角色更新成功', 'success')
                fetchUsers()
            } else {
                showToast('角色更新失败', 'error')
            }
        } catch (error) {
            showToast('操作失败', 'error')
        }
    }

    const adminCount = users.filter(u => u.role === 'ADMIN').length

    if (loading) {
        return <div className="manage-page"><p>加载中...</p></div>
    }

    return (
        <div className="manage-page">
            <div className="page-header">
                <h2>用户管理</h2>
                <div className="header-stats">
                    <span className="stat-item">总用户: {users.length}</span>
                    <span className="stat-item">管理员: {adminCount}</span>
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
                                            {(user.username || 'U').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="user-info-cell">
                                            <span className="user-name-cell">{user.username || '未设置'}</span>
                                            <span className="user-email-cell">{user.email}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <select
                                        className={`role-select ${(user.role || '').toLowerCase()}`}
                                        value={user.role}
                                        onChange={(e) => handleChangeRole(user.id, e.target.value)}
                                    >
                                        <option value="USER">普通用户</option>
                                        <option value="ADMIN">管理员</option>
                                    </select>
                                </td>
                                <td>{user._count?.orders || 0}</td>
                                <td className="time">{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td className="actions">
                                    <button className="action-btn edit">查看订单</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {
                filteredUsers.length === 0 && (
                    <div className="placeholder-content">
                        <FiUsers />
                        <p>未找到匹配的用户</p>
                    </div>
                )
            }
        </div >
    )
}

// 系统设置
// 系统设置
function SettingsPage() {
    const { token } = useAuthStore()
    const { showToast } = useToast()

    // 默认设置
    const [settings, setSettings] = useState({
        // 基本设置
        siteName: 'HaoDongXi',
        siteDescription: '虚拟物品自动发卡平台',
        contactEmail: 'support@kashop.com',
        // 支付设置
        alipayEnabled: true,
        wechatEnabled: true,
        usdtEnabled: false,
        // USDT配置
        usdtWalletAddress: '',
        usdtExchangeRate: 7,
        // 订单设置
        orderTimeout: 30,
        autoCancel: true,
        stockMode: 'auto', // 'auto' = 库存=卡密数量, 'manual' = 手动设置库存
        // 邮件设置
        smtpHost: '',
        smtpPort: 465,
        smtpUser: '',
        smtpPass: '',
        emailNotify: true
    })

    const [activeTab, setActiveTab] = useState('basic')
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(true)

    // 从后端加载设置
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const res = await fetch('/api/admin/settings', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (res.ok) {
                    const data = await res.json()
                    if (data.settings) {
                        setSettings(prev => ({
                            ...prev,
                            ...Object.fromEntries(
                                Object.entries(data.settings).map(([key, value]) => {
                                    // 转换布尔值
                                    if (value === 'true') return [key, true]
                                    if (value === 'false') return [key, false]
                                    // 转换数字
                                    if (!isNaN(value) && value !== '') return [key, Number(value)]
                                    return [key, value]
                                })
                            )
                        }))
                    }
                }
            } catch (error) {
                console.error('加载设置失败:', error)
            } finally {
                setLoading(false)
            }
        }
        if (token) loadSettings()
    }, [token])

    const handleChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }))
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            // 将设置值转换为字符串
            const settingsToSave = Object.fromEntries(
                Object.entries(settings).map(([key, value]) => [key, String(value)])
            )

            // 保存设置到后端
            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(settingsToSave)
            })

            if (!res.ok) {
                throw new Error('保存失败')
            }

            showToast('设置保存成功！', 'success')

        } catch (err) {
            console.error(err)
            showToast('保存设置失败', 'error')
        } finally {
            setSaving(false)
        }
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
                                <label>USDT-TRC20</label>
                                <span className="toggle-desc">启用USDT支付</span>
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

                        {settings.usdtEnabled && (
                            <>
                                <div className="setting-item">
                                    <label>USDT 收款地址 (TRC20)</label>
                                    <input
                                        type="text"
                                        value={settings.usdtWalletAddress}
                                        onChange={(e) => handleChange('usdtWalletAddress', e.target.value)}
                                        placeholder="T开头的TRC20地址"
                                    />
                                    <span className="setting-hint">请确保地址正确，否则无法收款</span>
                                </div>
                                <div className="setting-item">
                                    <label>USDT 汇率 (1 USDT = ? CNY)</label>
                                    <input
                                        type="number"
                                        value={settings.usdtExchangeRate}
                                        onChange={(e) => handleChange('usdtExchangeRate', parseFloat(e.target.value))}
                                        min={1}
                                        max={20}
                                        step={0.1}
                                    />
                                    <span className="setting-hint">当前汇率：1 USDT = ¥{settings.usdtExchangeRate}</span>
                                </div>
                            </>
                        )}

                        <div className="setting-notice">
                            💡 USDT支付每30秒自动检测钱包转入，到账后自动发货
                        </div>
                    </div>
                )}

                {/* 订单设置 */}
                {activeTab === 'order' && (
                    <div className="settings-section">
                        {/* 库存计算方式 - 现代卡片选择 */}
                        <div className="setting-item stock-mode-section">
                            <label className="stock-mode-label">库存计算方式</label>
                            <div className="stock-mode-selector">
                                <div
                                    className={`stock-mode-option ${settings.stockMode === 'auto' ? 'selected' : ''}`}
                                    onClick={() => handleChange('stockMode', 'auto')}
                                    role="button"
                                    tabIndex={0}
                                >
                                    <div className="stock-mode-radio">
                                        <div className="radio-outer">
                                            <div className="radio-inner"></div>
                                        </div>
                                    </div>
                                    <div className="stock-mode-info">
                                        <div className="stock-mode-header">
                                            <span className="stock-mode-emoji">🤖</span>
                                            <span className="stock-mode-name">自动计算库存</span>
                                            <span className="stock-mode-tag recommended">推荐</span>
                                        </div>
                                        <div className="stock-mode-description">
                                            系统自动统计可用卡密数量作为库存，确保库存实时准确
                                        </div>
                                    </div>
                                </div>
                                <div
                                    className={`stock-mode-option ${settings.stockMode === 'manual' ? 'selected' : ''}`}
                                    onClick={() => handleChange('stockMode', 'manual')}
                                    role="button"
                                    tabIndex={0}
                                >
                                    <div className="stock-mode-radio">
                                        <div className="radio-outer">
                                            <div className="radio-inner"></div>
                                        </div>
                                    </div>
                                    <div className="stock-mode-info">
                                        <div className="stock-mode-header">
                                            <span className="stock-mode-emoji">✏️</span>
                                            <span className="stock-mode-name">手动设置库存</span>
                                        </div>
                                        <div className="stock-mode-description">
                                            可在商品管理中手动设置库存，适用于库存充足但卡密未导入的情况
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 订单超时 */}
                        <div className="setting-item">
                            <label>订单超时时间</label>
                            <div className="input-with-suffix">
                                <input
                                    type="number"
                                    value={settings.orderTimeout}
                                    onChange={(e) => handleChange('orderTimeout', parseInt(e.target.value))}
                                    min={5}
                                    max={120}
                                    style={{ width: '120px' }}
                                />
                                <span className="input-suffix">分钟</span>
                            </div>
                            <span className="setting-hint">未支付订单超时后自动取消</span>
                        </div>

                        {/* 自动取消 */}
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
                        <div className="setting-item">
                            <button
                                className="btn btn-secondary"
                                onClick={async () => {
                                    try {
                                        const res = await fetch('/api/admin/settings/test-email', {
                                            method: 'POST',
                                            headers: { 'Authorization': `Bearer ${token}` }
                                        })
                                        const data = await res.json()
                                        if (res.ok) {
                                            alert('✅ ' + data.message)
                                        } else {
                                            alert('❌ 测试失败: ' + data.error)
                                        }
                                    } catch (error) {
                                        alert('❌ 测试失败: ' + error.message)
                                    }
                                }}
                            >
                                测试邮件连接
                            </button>
                            <span className="setting-hint">先保存设置，再测试连接</span>
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
                    <span className="sidebar-title">管理后台</span>
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

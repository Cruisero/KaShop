import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import toast from 'react-hot-toast'
import Navbar from './components/common/Navbar'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderResult from './pages/OrderResult'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import UserCenter from './pages/User'
import AdminDashboard from './pages/Admin/Dashboard'
import Search from './pages/Search'
import VerifyEmail from './pages/VerifyEmail'
import ForgotPassword from './pages/Auth/ForgotPassword'
import ResetPassword from './pages/Auth/ResetPassword'
import NotFound from './pages/NotFound'
import { useThemeStore } from './store/themeStore'
import { useAuthStore } from './store/authStore'

// 邮箱验证提示组件
function EmailVerificationBanner() {
    const { user, isAuthenticated, token } = useAuthStore()
    const [dismissed, setDismissed] = useState(false)
    const [resending, setResending] = useState(false)

    if (!isAuthenticated || user?.emailVerified || dismissed || user?.role === 'ADMIN') {
        return null
    }

    const handleResend = async () => {
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
        <div style={{
            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
            color: '#1e293b',
            padding: '12px 20px',
            textAlign: 'center',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap'
        }}>
            <span>⚠️ 您的邮箱尚未验证，请查收验证邮件完成验证</span>
            <button
                onClick={handleResend}
                disabled={resending}
                style={{
                    background: 'rgba(255,255,255,0.9)',
                    border: 'none',
                    padding: '6px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '13px'
                }}
            >
                {resending ? '发送中...' : '重新发送'}
            </button>
            <button
                onClick={() => setDismissed(true)}
                style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '18px',
                    opacity: 0.7
                }}
            >
                ✕
            </button>
        </div>
    )
}

function App() {
    const initTheme = useThemeStore((state) => state.initTheme)
    const { isAuthenticated, token, updateUser, logout } = useAuthStore()

    // 初始化主题
    useEffect(() => {
        initTheme()
    }, [initTheme])

    // 刷新用户信息（确保 emailVerified 等状态是最新的）
    useEffect(() => {
        if (isAuthenticated && token) {
            fetch('/api/auth/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.user) {
                        updateUser(data.user)
                    } else if (data.error) {
                        // Token 过期或无效，退出登录
                        logout()
                    }
                })
                .catch(() => {
                    // 网络错误，不做处理
                })
        }
    }, [isAuthenticated, token])

    return (
        <Router>
            <div className="app">
                <EmailVerificationBanner />
                <Navbar />
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<Products />} />
                        <Route path="/products" element={<Navigate to="/" replace />} />
                        <Route path="/about" element={<Home />} />
                        <Route path="/products/:id" element={<ProductDetail />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/order/:orderNo" element={<OrderResult />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/verify-email" element={<VerifyEmail />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/user/*" element={<UserCenter />} />
                        <Route path="/admin/*" element={
                            useAuthStore.getState().user?.role === 'ADMIN'
                                ? <AdminDashboard />
                                : <NotFound />
                        } />
                        <Route path="/search" element={<Search />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </main>
                <Toaster position="top-center" />
            </div>
        </Router>
    )
}

export default App

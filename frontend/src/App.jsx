import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/common/Navbar'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderQuery from './pages/OrderQuery'
import OrderResult from './pages/OrderResult'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import UserCenter from './pages/User'
import AdminDashboard from './pages/Admin/Dashboard'
import NotFound from './pages/NotFound'
import { useThemeStore } from './store/themeStore'

function App() {
    const initTheme = useThemeStore((state) => state.initTheme)

    // 初始化主题
    useEffect(() => {
        initTheme()
    }, [initTheme])

    return (
        <Router>
            <div className="app">
                <Navbar />
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/products" element={<Products />} />
                        <Route path="/products/:id" element={<ProductDetail />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/order/query" element={<OrderQuery />} />
                        <Route path="/order/:orderNo" element={<OrderResult />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/user/*" element={<UserCenter />} />
                        <Route path="/admin/*" element={<AdminDashboard />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </main>
                <Toaster position="top-center" />
            </div>
        </Router>
    )
}

export default App

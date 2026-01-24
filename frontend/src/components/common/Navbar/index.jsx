import { Link, useLocation } from 'react-router-dom'
import { FiShoppingCart, FiSearch, FiUser } from 'react-icons/fi'
import { useCartStore } from '../../../store/cartStore'
import { useAuthStore } from '../../../store/authStore'
import './Navbar.css'

function Navbar() {
    const location = useLocation()
    const cartItems = useCartStore((state) => state.items)
    const { user, isAuthenticated } = useAuthStore()

    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Logo */}
                <Link to="/" className="navbar-logo">
                    <span className="logo-icon">💎</span>
                    <span className="logo-text">Kashop</span>
                </Link>

                {/* 导航链接 */}
                <div className="navbar-links">
                    <Link
                        to="/"
                        className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                    >
                        首页
                    </Link>
                    <Link
                        to="/products"
                        className={`nav-link ${location.pathname.startsWith('/products') ? 'active' : ''}`}
                    >
                        商品
                    </Link>
                    <Link
                        to="/order/query"
                        className={`nav-link ${location.pathname.startsWith('/order') ? 'active' : ''}`}
                    >
                        订单查询
                    </Link>
                </div>

                {/* 右侧操作 */}
                <div className="navbar-actions">
                    {/* 搜索 */}
                    <button className="nav-icon-btn" title="搜索">
                        <FiSearch />
                    </button>

                    {/* 购物车 */}
                    <Link to="/cart" className="nav-icon-btn cart-btn" title="购物车">
                        <FiShoppingCart />
                        {cartCount > 0 && (
                            <span className="cart-badge">{cartCount}</span>
                        )}
                    </Link>

                    {/* 用户 */}
                    {isAuthenticated ? (
                        <Link to="/user" className="nav-user">
                            <div className="user-avatar">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt={user.username} />
                                ) : (
                                    <FiUser />
                                )}
                            </div>
                            <span className="user-name">{user?.username || '用户'}</span>
                        </Link>
                    ) : (
                        <Link to="/login" className="btn btn-primary nav-login-btn">
                            登录
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    )
}

export default Navbar

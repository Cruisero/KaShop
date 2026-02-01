import { useState, useEffect, useRef, useMemo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FiShoppingCart, FiSearch, FiUser, FiSun, FiMoon, FiTrendingUp } from 'react-icons/fi'
import { useCartStore } from '../../../store/cartStore'
import { useAuthStore } from '../../../store/authStore'
import { useThemeStore } from '../../../store/themeStore'
import logoImg from '../../../assets/logo.png'
import logoDarkImg from '../../../assets/logo-dark.png'
import './Navbar.css'

// 热门搜索关键词
const hotSearches = ['Netflix', 'ChatGPT', 'Spotify', '游戏账号', 'Adobe', '网盘会员', 'YouTube', 'Office']

// 模拟商品数据用于搜索建议
const mockProducts = [
    { id: '1', name: 'Netflix 高级会员月卡' },
    { id: '2', name: 'Spotify Premium 月卡' },
    { id: '3', name: 'Steam 游戏账号 - GTA5' },
    { id: '4', name: 'ChatGPT Plus 月卡' },
    { id: '5', name: 'YouTube Premium 年卡' },
    { id: '6', name: '百度网盘超级会员月卡' },
    { id: '7', name: 'Discord Nitro 月卡' },
    { id: '8', name: 'Adobe Creative Cloud 月卡' },
    { id: '9', name: 'Steam 游戏账号 - 艾尔登法环' },
    { id: '10', name: 'Apple Music 月卡' },
    { id: '11', name: 'Disney+ 月卡' },
    { id: '12', name: 'Office 365 年卡' },
]

function Navbar() {
    const location = useLocation()
    const navigate = useNavigate()
    const cartItems = useCartStore((state) => state.items)
    const { user, isAuthenticated } = useAuthStore()
    const { theme, toggleTheme } = useThemeStore()

    const [searchQuery, setSearchQuery] = useState('')
    const [showDropdown, setShowDropdown] = useState(false)
    const searchRef = useRef(null)

    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

    // 点击外部关闭下拉框
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowDropdown(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // 实时搜索建议
    const suggestions = useMemo(() => {
        if (!searchQuery.trim()) return []
        const query = searchQuery.toLowerCase()
        return mockProducts
            .filter(p => p.name.toLowerCase().includes(query))
            .slice(0, 6)
    }, [searchQuery])

    // 执行搜索
    const handleSearch = (query) => {
        const searchTerm = query || searchQuery
        if (searchTerm.trim()) {
            setShowDropdown(false)
            setSearchQuery('')
            navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`)
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        handleSearch()
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch()
        } else if (e.key === 'Escape') {
            setShowDropdown(false)
        }
    }

    // 点击建议项
    const handleSuggestionClick = (name) => {
        handleSearch(name)
    }

    // 点击热门关键词
    const handleKeywordClick = (keyword) => {
        handleSearch(keyword)
    }

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Logo */}
                <Link to="/" className="navbar-logo">
                    <img
                        src={theme === 'dark' ? logoDarkImg : logoImg}
                        alt="Kashop Logo"
                        className="logo-image"
                    />
                </Link>

                {/* 搜索栏 */}
                <div className="navbar-search" ref={searchRef}>
                    <div className={`search-input-wrapper ${showDropdown ? 'focused' : ''}`}>
                        <FiSearch className="search-icon" />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="搜索商品..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setShowDropdown(true)}
                            onKeyDown={handleKeyDown}
                        />
                        <button
                            className="search-btn"
                            onClick={handleSubmit}
                        >
                            搜索
                        </button>
                    </div>

                    {/* 搜索下拉框 */}
                    {showDropdown && (
                        <div className="search-dropdown">
                            {/* 实时搜索建议 */}
                            {searchQuery.trim() && suggestions.length > 0 && (
                                <div className="dropdown-section">
                                    <div className="dropdown-header">
                                        <FiSearch className="dropdown-icon" />
                                        <span>搜索建议</span>
                                    </div>
                                    <div className="suggestion-list">
                                        {suggestions.map((item) => (
                                            <div
                                                key={item.id}
                                                className="suggestion-item"
                                                onClick={() => handleSuggestionClick(item.name)}
                                            >
                                                <FiSearch className="suggestion-icon" />
                                                <span dangerouslySetInnerHTML={{
                                                    __html: item.name.replace(
                                                        new RegExp(`(${searchQuery})`, 'gi'),
                                                        '<mark>$1</mark>'
                                                    )
                                                }} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 无输入时显示热门搜索 */}
                            {!searchQuery.trim() && (
                                <div className="dropdown-section">
                                    <div className="dropdown-header">
                                        <FiTrendingUp className="dropdown-icon hot" />
                                        <span>热门搜索</span>
                                    </div>
                                    <div className="keyword-tags">
                                        {hotSearches.map((item, index) => (
                                            <div
                                                key={index}
                                                className="keyword-tag hot-tag"
                                                onClick={() => handleKeywordClick(item)}
                                            >
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 无搜索结果提示 */}
                            {searchQuery.trim() && suggestions.length === 0 && (
                                <div className="no-suggestions">
                                    <FiSearch />
                                    <span>未找到相关商品，按回车搜索</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* 导航链接 */}
                <div className="navbar-links">
                    <Link
                        to="/"
                        className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                    >
                        商品
                    </Link>
                    <Link
                        to="/about"
                        className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}
                    >
                        关于
                    </Link>
                </div>

                {/* 右侧操作 */}
                <div className="navbar-actions">
                    {/* 主题切换 */}
                    <button
                        className="nav-icon-btn theme-toggle-btn"
                        onClick={toggleTheme}
                        title={theme === 'dark' ? '切换到浅色模式' : '切换到暗黑模式'}
                    >
                        {theme === 'dark' ? <FiSun /> : <FiMoon />}
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

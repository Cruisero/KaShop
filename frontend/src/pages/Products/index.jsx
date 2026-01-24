import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { FiShoppingCart, FiTag, FiBox } from 'react-icons/fi'
import { useCartStore } from '../../store/cartStore'
import toast from 'react-hot-toast'
import './Products.css'

// 模拟分类数据
const categories = [
    { id: 'all', name: '全部商品', icon: '🏠' },
    { id: 'game', name: '游戏账号', icon: '🎮' },
    { id: 'video', name: '视频会员', icon: '📺' },
    { id: 'music', name: '音乐会员', icon: '🎵' },
    { id: 'software', name: '软件激活', icon: '💿' },
    { id: 'social', name: '社交账号', icon: '💬' },
    { id: 'cloud', name: '网盘会员', icon: '☁️' },
]

// 模拟商品数据
const mockProducts = [
    {
        id: '1',
        name: 'Netflix 高级会员月卡',
        description: '美区 Netflix Premium 一个月会员，支持 4K 超高清画质，可同时 4 台设备观看',
        price: 49.90,
        originalPrice: 89.00,
        category: 'video',
        stock: 128,
        sold: 2341,
        image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400&h=300&fit=crop',
        tags: ['热销', '4K'],
    },
    {
        id: '2',
        name: 'Spotify Premium 月卡',
        description: 'Spotify 高级会员一个月，无广告畅听，支持离线下载',
        price: 19.90,
        originalPrice: 35.00,
        category: 'music',
        stock: 256,
        sold: 1876,
        image: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=400&h=300&fit=crop',
        tags: ['热销'],
    },
    {
        id: '3',
        name: 'Steam 游戏账号 - GTA5',
        description: '正版 GTA5 Steam 账号，可改密绑定，终身使用',
        price: 68.00,
        originalPrice: 129.00,
        category: 'game',
        stock: 45,
        sold: 892,
        image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=300&fit=crop',
        tags: ['正版'],
    },
    {
        id: '4',
        name: 'ChatGPT Plus 月卡',
        description: 'OpenAI ChatGPT Plus 会员一个月，GPT-4 无限制使用',
        price: 149.00,
        originalPrice: 199.00,
        category: 'software',
        stock: 89,
        sold: 3421,
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
        tags: ['热销', 'AI'],
    },
    {
        id: '5',
        name: 'YouTube Premium 年卡',
        description: 'YouTube Premium 会员一年，无广告观看，支持后台播放和离线下载',
        price: 168.00,
        originalPrice: 299.00,
        category: 'video',
        stock: 67,
        sold: 1234,
        image: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=400&h=300&fit=crop',
        tags: ['年卡', '超值'],
    },
    {
        id: '6',
        name: '百度网盘超级会员月卡',
        description: '百度网盘超级会员一个月，极速下载，5T 空间',
        price: 25.00,
        originalPrice: 30.00,
        category: 'cloud',
        stock: 512,
        sold: 4521,
        image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=300&fit=crop',
        tags: ['热销'],
    },
    {
        id: '7',
        name: 'Discord Nitro 月卡',
        description: 'Discord Nitro 高级会员一个月，高清直播，自定义表情',
        price: 35.00,
        originalPrice: 50.00,
        category: 'social',
        stock: 198,
        sold: 876,
        image: 'https://images.unsplash.com/photo-1614680376408-81e91ffe3db7?w=400&h=300&fit=crop',
        tags: [],
    },
    {
        id: '8',
        name: 'Adobe Creative Cloud 月卡',
        description: 'Adobe 全家桶一个月，包含 PS、PR、AI 等全套软件',
        price: 89.00,
        originalPrice: 168.00,
        category: 'software',
        stock: 34,
        sold: 567,
        image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&h=300&fit=crop',
        tags: ['全家桶'],
    },
    {
        id: '9',
        name: 'Steam 游戏账号 - 艾尔登法环',
        description: '正版艾尔登法环 Steam 账号，可改密绑定',
        price: 128.00,
        originalPrice: 298.00,
        category: 'game',
        stock: 23,
        sold: 432,
        image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop',
        tags: ['热门游戏'],
    },
    {
        id: '10',
        name: 'Apple Music 月卡',
        description: 'Apple Music 会员一个月，千万曲库无损音质',
        price: 15.00,
        originalPrice: 25.00,
        category: 'music',
        stock: 321,
        sold: 1543,
        image: 'https://images.unsplash.com/photo-1611339555312-e607c8352fd7?w=400&h=300&fit=crop',
        tags: ['无损'],
    },
    {
        id: '11',
        name: 'Disney+ 月卡',
        description: 'Disney+ 会员一个月，漫威、星球大战等独家内容',
        price: 35.00,
        originalPrice: 68.00,
        category: 'video',
        stock: 87,
        sold: 654,
        image: 'https://images.unsplash.com/photo-1640499900704-b00dd6a1103a?w=400&h=300&fit=crop',
        tags: ['独家'],
    },
    {
        id: '12',
        name: 'Office 365 年卡',
        description: 'Microsoft 365 个人版一年，包含 Word、Excel、PPT 等',
        price: 199.00,
        originalPrice: 398.00,
        category: 'software',
        stock: 156,
        sold: 2341,
        image: 'https://images.unsplash.com/photo-1633419461186-7d40a38105ec?w=400&h=300&fit=crop',
        tags: ['正版', '年卡'],
    },
]

function Products() {
    const [activeCategory, setActiveCategory] = useState('all')
    const [sortBy, setSortBy] = useState('default')
    const addItem = useCartStore((state) => state.addItem)

    // 过滤和排序商品
    const filteredProducts = useMemo(() => {
        let products = activeCategory === 'all'
            ? mockProducts
            : mockProducts.filter(p => p.category === activeCategory)

        switch (sortBy) {
            case 'price-asc':
                return [...products].sort((a, b) => a.price - b.price)
            case 'price-desc':
                return [...products].sort((a, b) => b.price - a.price)
            case 'sales':
                return [...products].sort((a, b) => b.sold - a.sold)
            default:
                return products
        }
    }, [activeCategory, sortBy])

    const handleAddToCart = (product, e) => {
        e.preventDefault()
        e.stopPropagation()
        addItem(product, 1)
        toast.success(`已添加 ${product.name} 到购物车`)
    }

    return (
        <div className="products-page">
            {/* 分类导航 */}
            <div className="category-nav">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`}
                        onClick={() => setActiveCategory(cat.id)}
                    >
                        <span className="category-icon">{cat.icon}</span>
                        <span className="category-name">{cat.name}</span>
                    </button>
                ))}
            </div>

            {/* 筛选栏 */}
            <div className="products-toolbar">
                <div className="products-count">
                    <FiBox />
                    <span>共 {filteredProducts.length} 件商品</span>
                </div>
                <div className="sort-options">
                    <span className="sort-label">排序：</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="sort-select"
                    >
                        <option value="default">默认排序</option>
                        <option value="sales">销量优先</option>
                        <option value="price-asc">价格从低到高</option>
                        <option value="price-desc">价格从高到低</option>
                    </select>
                </div>
            </div>

            {/* 商品网格 */}
            <div className="products-grid">
                {filteredProducts.map((product) => (
                    <Link
                        to={`/products/${product.id}`}
                        key={product.id}
                        className="product-card"
                    >
                        {/* 商品图片 */}
                        <div className="product-image">
                            <img src={product.image} alt={product.name} />
                            {product.tags.length > 0 && (
                                <div className="product-tags">
                                    {product.tags.map((tag, index) => (
                                        <span key={index} className="product-tag">{tag}</span>
                                    ))}
                                </div>
                            )}
                            {product.stock < 50 && (
                                <div className="stock-warning">库存紧张</div>
                            )}
                        </div>

                        {/* 商品信息 */}
                        <div className="product-info">
                            <h3 className="product-name">{product.name}</h3>
                            <p className="product-desc">{product.description}</p>

                            <div className="product-meta">
                                <span className="product-sold">已售 {product.sold}</span>
                                <span className="product-stock">库存 {product.stock}</span>
                            </div>

                            <div className="product-footer">
                                <div className="product-price">
                                    <span className="price-current">¥{product.price.toFixed(2)}</span>
                                    {product.originalPrice > product.price && (
                                        <span className="price-original">¥{product.originalPrice.toFixed(2)}</span>
                                    )}
                                </div>
                                <button
                                    className="add-cart-btn"
                                    onClick={(e) => handleAddToCart(product, e)}
                                >
                                    <FiShoppingCart />
                                </button>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* 空状态 */}
            {filteredProducts.length === 0 && (
                <div className="empty-state">
                    <FiTag style={{ width: 60, height: 60 }} />
                    <p>该分类暂无商品</p>
                </div>
            )}
        </div>
    )
}

export default Products

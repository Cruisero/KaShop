import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { FiShoppingCart, FiMinus, FiPlus, FiCheck, FiShield, FiZap, FiArrowLeft } from 'react-icons/fi'
import { useCartStore } from '../../store/cartStore'
import toast from 'react-hot-toast'
import './ProductDetail.css'

// 模拟商品数据 (与 Products 页面共享)
const mockProducts = [
    {
        id: '1',
        name: 'Netflix 高级会员月卡',
        description: '美区 Netflix Premium 一个月会员，支持 4K 超高清画质，可同时 4 台设备观看',
        fullDescription: `【商品说明】
• 美区 Netflix Premium 会员一个月
• 支持 4K 超高清画质
• 可同时 4 台设备观看
• 支持创建 5 个独立档案

【使用方法】
1. 收到卡密后，访问 Netflix 官网
2. 使用提供的账号密码登录
3. 即可享受 Premium 会员服务

【注意事项】
• 请勿修改账号密码
• 请勿分享给他人使用
• 有效期为一个月，到期自动失效`,
        price: 49.90,
        originalPrice: 89.00,
        category: 'video',
        stock: 128,
        sold: 2341,
        image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800&h=600&fit=crop',
        tags: ['热销', '4K'],
    },
    {
        id: '2',
        name: 'Spotify Premium 月卡',
        description: 'Spotify 高级会员一个月，无广告畅听，支持离线下载',
        fullDescription: `【商品说明】
• Spotify Premium 会员一个月
• 无广告音乐播放
• 支持离线下载
• 高品质音频

【使用方法】
1. 收到卡密后，访问 Spotify 官网
2. 使用提供的账号登录
3. 开始畅听音乐

【注意事项】
• 有效期一个月
• 请勿修改账号密码`,
        price: 19.90,
        originalPrice: 35.00,
        category: 'music',
        stock: 256,
        sold: 1876,
        image: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=800&h=600&fit=crop',
        tags: ['热销'],
    },
    {
        id: '3',
        name: 'Steam 游戏账号 - GTA5',
        description: '正版 GTA5 Steam 账号，可改密绑定，终身使用',
        fullDescription: `【商品说明】
• 正版 GTA5 Steam 账号
• 可修改密码和绑定信息
• 终身使用

【使用方法】
1. 下载 Steam 客户端
2. 使用提供的账号密码登录
3. 下载游戏开始游玩

【注意事项】
• 建议收到后立即修改密码
• 可绑定自己的邮箱和手机`,
        price: 68.00,
        originalPrice: 129.00,
        category: 'game',
        stock: 45,
        sold: 892,
        image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&h=600&fit=crop',
        tags: ['正版'],
    },
    {
        id: '4',
        name: 'ChatGPT Plus 月卡',
        description: 'OpenAI ChatGPT Plus 会员一个月，GPT-4 无限制使用',
        fullDescription: `【商品说明】
• ChatGPT Plus 会员一个月
• GPT-4 无限制使用
• 优先响应速度
• 优先体验新功能

【使用方法】
1. 收到账号后登录 chat.openai.com
2. 即可使用 GPT-4 模型

【注意事项】
• 请勿修改密码
• 有效期为一个月`,
        price: 149.00,
        originalPrice: 199.00,
        category: 'software',
        stock: 89,
        sold: 3421,
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop',
        tags: ['热销', 'AI'],
    },
    {
        id: '5',
        name: 'YouTube Premium 年卡',
        description: 'YouTube Premium 会员一年，无广告观看，支持后台播放和离线下载',
        fullDescription: `【商品说明】
• YouTube Premium 一年会员
• 无广告观看视频
• 支持后台播放
• 支持离线下载
• 包含 YouTube Music

【使用方法】
1. 收到邀请链接后点击加入
2. 使用自己的 Google 账号加入家庭组
3. 即可享受 Premium 服务

【注意事项】
• 有效期一年
• 需要 Google 账号`,
        price: 168.00,
        originalPrice: 299.00,
        category: 'video',
        stock: 67,
        sold: 1234,
        image: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800&h=600&fit=crop',
        tags: ['年卡', '超值'],
    },
    {
        id: '6',
        name: '百度网盘超级会员月卡',
        description: '百度网盘超级会员一个月，极速下载，5T 空间',
        fullDescription: `【商品说明】
• 百度网盘超级会员一个月
• 极速下载通道
• 5TB 存储空间
• 在线解压等高级功能

【使用方法】
1. 登录百度网盘
2. 使用提供的兑换码进行兑换
3. 即可享受超级会员特权

【注意事项】
• 每个账号只能兑换一次
• 有效期一个月`,
        price: 25.00,
        originalPrice: 30.00,
        category: 'cloud',
        stock: 512,
        sold: 4521,
        image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&h=600&fit=crop',
        tags: ['热销'],
    },
]

function ProductDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [quantity, setQuantity] = useState(1)
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const addItem = useCartStore((state) => state.addItem)

    useEffect(() => {
        // 模拟加载商品
        setLoading(true)
        setTimeout(() => {
            const found = mockProducts.find(p => p.id === id)
            setProduct(found || null)
            setLoading(false)
        }, 300)
    }, [id])

    const handleQuantityChange = (delta) => {
        const newQty = quantity + delta
        if (newQty >= 1 && newQty <= (product?.stock || 99)) {
            setQuantity(newQty)
        }
    }

    const handleAddToCart = () => {
        if (product) {
            addItem(product, quantity)
            toast.success(`已添加 ${quantity} 件商品到购物车`)
        }
    }

    const handleBuyNow = () => {
        if (product) {
            addItem(product, quantity)
            navigate('/cart')
        }
    }

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
            </div>
        )
    }

    if (!product) {
        return (
            <div className="product-not-found">
                <h2>商品不存在</h2>
                <p>您访问的商品可能已下架或不存在</p>
                <Link to="/products" className="btn btn-primary">
                    返回商品列表
                </Link>
            </div>
        )
    }

    const discount = Math.round((1 - product.price / product.originalPrice) * 100)

    return (
        <div className="product-detail-page">
            {/* 返回按钮 */}
            <button className="back-btn" onClick={() => navigate(-1)}>
                <FiArrowLeft />
                返回
            </button>

            <div className="product-detail-container">
                {/* 左侧图片 */}
                <div className="product-gallery">
                    <div className="main-image">
                        <img src={product.image} alt={product.name} />
                        {product.tags.length > 0 && (
                            <div className="detail-tags">
                                {product.tags.map((tag, index) => (
                                    <span key={index} className="detail-tag">{tag}</span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* 右侧信息 */}
                <div className="product-main-info">
                    <h1 className="detail-title">{product.name}</h1>
                    <p className="detail-desc">{product.description}</p>

                    {/* 价格区域 */}
                    <div className="price-section">
                        <div className="price-row">
                            <span className="price-label">价格</span>
                            <span className="price-value">¥{product.price.toFixed(2)}</span>
                            {product.originalPrice > product.price && (
                                <>
                                    <span className="price-original">¥{product.originalPrice.toFixed(2)}</span>
                                    <span className="discount-badge">-{discount}%</span>
                                </>
                            )}
                        </div>
                        <div className="sales-row">
                            <span>已售 {product.sold}</span>
                            <span>库存 {product.stock}</span>
                        </div>
                    </div>

                    {/* 数量选择 */}
                    <div className="quantity-section">
                        <span className="quantity-label">数量</span>
                        <div className="quantity-control">
                            <button
                                className="qty-btn"
                                onClick={() => handleQuantityChange(-1)}
                                disabled={quantity <= 1}
                            >
                                <FiMinus />
                            </button>
                            <span className="qty-value">{quantity}</span>
                            <button
                                className="qty-btn"
                                onClick={() => handleQuantityChange(1)}
                                disabled={quantity >= product.stock}
                            >
                                <FiPlus />
                            </button>
                        </div>
                        <span className="qty-total">
                            小计: <strong>¥{(product.price * quantity).toFixed(2)}</strong>
                        </span>
                    </div>

                    {/* 购买按钮 */}
                    <div className="action-buttons">
                        <button className="btn btn-secondary btn-lg" onClick={handleAddToCart}>
                            <FiShoppingCart />
                            加入购物车
                        </button>
                        <button className="btn btn-primary btn-lg" onClick={handleBuyNow}>
                            立即购买
                        </button>
                    </div>

                    {/* 服务保障 */}
                    <div className="service-guarantee">
                        <div className="guarantee-item">
                            <FiZap />
                            <span>即时发货</span>
                        </div>
                        <div className="guarantee-item">
                            <FiShield />
                            <span>安全保障</span>
                        </div>
                        <div className="guarantee-item">
                            <FiCheck />
                            <span>正品保证</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 商品详情 */}
            <div className="product-description-section">
                <h2 className="section-subtitle">商品详情</h2>
                <div className="description-content">
                    <pre>{product.fullDescription}</pre>
                </div>
            </div>
        </div>
    )
}

export default ProductDetail

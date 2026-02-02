import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiSearch, FiPackage } from 'react-icons/fi'
import toast from 'react-hot-toast'
import './OrderQuery.css'

function OrderQuery() {
    const navigate = useNavigate()
    const [orderNo, setOrderNo] = useState('')
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!orderNo.trim()) {
            toast.error('请输入订单号')
            return
        }

        setLoading(true)

        try {
            // 先验证订单是否存在
            const res = await fetch(`/api/orders/${orderNo.trim()}`)
            const data = await res.json()

            if (data.error) {
                toast.error('订单不存在，请检查订单号')
                setLoading(false)
                return
            }

            // 如果填写了邮箱，验证邮箱是否匹配
            if (email.trim() && data.email !== email.trim()) {
                toast.error('邮箱与订单不匹配')
                setLoading(false)
                return
            }

            // 跳转到订单结果页
            navigate(`/order/${orderNo.trim()}`)
        } catch (error) {
            toast.error('查询失败，请稍后重试')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="order-query-page">
            <div className="query-container">
                <div className="query-icon">
                    <FiPackage />
                </div>

                <h1>订单查询</h1>
                <p className="query-desc">
                    输入您的订单号查询订单状态和卡密信息
                </p>

                <form className="query-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>订单号 <span className="required">*</span></label>
                        <input
                            type="text"
                            className="input"
                            placeholder="请输入订单号，如：KA202401230001"
                            value={orderNo}
                            onChange={(e) => setOrderNo(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>邮箱 <span className="optional">(可选)</span></label>
                        <input
                            type="email"
                            className="input"
                            placeholder="请输入下单时填写的邮箱"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <span className="form-tip">填写邮箱可增加查询安全性</span>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg query-btn"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="loading-text">
                                <span className="spinner-small"></span>
                                查询中...
                            </span>
                        ) : (
                            <>
                                <FiSearch />
                                查询订单
                            </>
                        )}
                    </button>
                </form>

                <div className="query-tips">
                    <h3>📌 温馨提示</h3>
                    <ul>
                        <li>订单号可在支付成功页面或邮件中找到</li>
                        <li>卡密信息将在支付成功后立即发放</li>
                        <li>如有问题请联系客服</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default OrderQuery

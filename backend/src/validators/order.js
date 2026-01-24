const Joi = require('joi')

// 创建订单验证
const createOrderSchema = Joi.object({
    productId: Joi.string().uuid().required().messages({
        'any.required': '商品ID不能为空'
    }),
    quantity: Joi.number().integer().min(1).max(100).default(1).messages({
        'number.min': '数量至少为1',
        'number.max': '单次最多购买100个'
    }),
    email: Joi.string().email().required().messages({
        'string.email': '请输入有效的邮箱地址',
        'any.required': '邮箱不能为空'
    }),
    paymentMethod: Joi.string().valid('alipay', 'wechat', 'usdt').required().messages({
        'any.only': '不支持的支付方式',
        'any.required': '请选择支付方式'
    })
})

// 订单查询验证
const queryOrderSchema = Joi.object({
    orderNo: Joi.string().required().messages({
        'any.required': '订单号不能为空'
    }),
    email: Joi.string().email().optional()
})

module.exports = { createOrderSchema, queryOrderSchema }

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create(
    persist(
        (set, get) => ({
            items: [],

            // 添加商品到购物车
            addItem: (product, quantity = 1) => {
                const items = get().items
                const existingItem = items.find(item => item.id === product.id)

                if (existingItem) {
                    set({
                        items: items.map(item =>
                            item.id === product.id
                                ? { ...item, quantity: item.quantity + quantity }
                                : item
                        )
                    })
                } else {
                    set({
                        items: [...items, { ...product, quantity }]
                    })
                }
            },

            // 更新商品数量
            updateQuantity: (productId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(productId)
                    return
                }
                set({
                    items: get().items.map(item =>
                        item.id === productId ? { ...item, quantity } : item
                    )
                })
            },

            // 移除商品
            removeItem: (productId) => {
                set({
                    items: get().items.filter(item => item.id !== productId)
                })
            },

            // 清空购物车
            clearCart: () => set({ items: [] }),

            // 获取购物车总价
            getTotalPrice: () => {
                return get().items.reduce(
                    (total, item) => total + item.price * item.quantity,
                    0
                )
            },

            // 获取商品总数
            getTotalCount: () => {
                return get().items.reduce(
                    (count, item) => count + item.quantity,
                    0
                )
            }
        }),
        {
            name: 'kashop-cart'
        }
    )
)

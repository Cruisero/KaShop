import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            // 登录
            login: (user, token) => {
                set({
                    user,
                    token,
                    isAuthenticated: true
                })
            },

            // 登出
            logout: () => {
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false
                })
            },

            // 更新用户信息
            updateUser: (userData) => {
                set({
                    user: { ...get().user, ...userData }
                })
            },

            // 检查是否是管理员
            isAdmin: () => {
                return get().user?.role === 'admin'
            }
        }),
        {
            name: 'kashop-auth'
        }
    )
)

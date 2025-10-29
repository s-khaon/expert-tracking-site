import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Token, User } from '../types'

interface AuthState {
  user: User | null
  token: Token | null
  isAuthenticated: boolean
  login: (user: User, token: Token) => void
  logout: () => void
  updateUser: (user: User) => void
  updateToken: (token: Token) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user: User, token: Token) =>
        set({
          user,
          token,
          isAuthenticated: true,
        }),
      logout: () => {
        // 清空认证状态
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })

        // 清空localStorage中的持久化数据
        localStorage.removeItem('auth-storage')

        // 清空sessionStorage
        sessionStorage.clear()
      },
      updateUser: (user: User) =>
        set(state => ({
          ...state,
          user,
        })),
      updateToken: (token: Token) =>
        set(state => ({
          ...state,
          token,
        })),
    }),
    {
      name: 'auth-storage',
      partialize: state => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

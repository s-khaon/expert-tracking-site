import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Token } from '../types'

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
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user: User, token: Token) =>
        set({
          user,
          token,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),
      updateUser: (user: User) =>
        set((state) => ({
          ...state,
          user,
        })),
      updateToken: (token: Token) =>
        set((state) => ({
          ...state,
          token,
        })),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
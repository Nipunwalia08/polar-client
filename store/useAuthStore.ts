import type { User } from '@firebase/auth'
import { create } from 'zustand'

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  setIsAuthenticated: (isAuthenticated: boolean) => void
  setUser: (user: User | null) => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  setIsAuthenticated: (isAuthenticated: boolean) => set({ isAuthenticated }),
  setUser: (user: User | null) => set({ user }),
}))

export default useAuthStore

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  username: string
  email: string
  name?: string
  image?: string
  createdAt: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (username: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  updateUser: (updates: Partial<User>) => void
}

// Mock user database - in production, this would be a real database
const USERS_STORAGE_KEY = 'healthbot_users'

interface UserData {
  id: string
  username: string
  email: string
  password: string
  name?: string
  createdAt: string
}

function getUsers(): Record<string, UserData> {
  if (typeof window === 'undefined') return {}
  const stored = localStorage.getItem(USERS_STORAGE_KEY)
  return stored ? JSON.parse(stored) : {}
}

function saveUsers(users: Record<string, UserData>) {
  if (typeof window === 'undefined') return
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500))
          
          const users = getUsers()
          const user = Object.values(users).find(u => u.email === email)
          
          if (!user) {
            throw new Error('User not found')
          }
          
          // In production, use bcrypt to compare hashed passwords
          // For now, we're storing passwords in plain text (NOT RECOMMENDED FOR PRODUCTION)
          if (user.password !== password) {
            throw new Error('Invalid password')
          }
          
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { password: _, ...userWithoutPassword } = user
          set({
            user: userWithoutPassword,
            isAuthenticated: true,
            isLoading: false,
          })
          
          return true
        } catch {
          set({ isLoading: false })
          return false
        }
      },

      signup: async (username: string, email: string, password: string) => {
        set({ isLoading: true })
        try {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500))
          
          const users = getUsers()
          
          // Check if user already exists
          if (Object.values(users).some(u => u.email === email)) {
            throw new Error('Email already registered')
          }
          
          if (Object.values(users).some(u => u.username === username)) {
            throw new Error('Username already taken')
          }
          
          // Create new user
          const newUser = {
            id: `user_${Date.now()}`,
            username,
            email,
            password, // In production, hash this with bcrypt
            createdAt: new Date().toISOString(),
          }
          
          users[newUser.id] = newUser
          saveUsers(users)
          
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { password: _, ...userWithoutPassword } = newUser
          set({
            user: userWithoutPassword,
            isAuthenticated: true,
            isLoading: false,
          })
          
          return true
        } catch {
          set({ isLoading: false })
          return false
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
        })
      },

      updateUser: (updates: Partial<User>) => {
        const { user } = get()
        if (user) {
          const updatedUser = { ...user, ...updates }
          set({ user: updatedUser })
          
          // Update in mock database
          const users = getUsers()
          if (users[user.id]) {
            users[user.id] = { ...users[user.id], ...updates }
            saveUsers(users)
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Loader } from 'lucide-react'

interface User {
  id: number
  username: string
  role: 'admin' | 'user'
  email: string
}

interface AuthContextType {
  user: User | null
  isLoggedIn: boolean
  login: (username: string, password: string, isAdmin: boolean) => Promise<boolean>
  register: (username: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const storedUser = localStorage.getItem('user')

    if (storedUser) {
      const userData = JSON.parse(storedUser)
      setUser(userData)
      setIsLoggedIn(true)
    } else {
      setIsLoggedIn(false)
      if (pathname !== '/' && pathname !== '/user/login' && pathname !== '/admin/login' && pathname !== '/register') {
        router.push('/user/login')
      }
    }

    setLoading(false)
  }, [pathname, router])

  const login = async (username: string, password: string, isAdmin: boolean) => {
    try {
      const response = await fetch(isAdmin ? '/api/auth' : '/api/user/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (response.ok) {
        const userData = await response.json()
        const user: User = {
          id: userData.id || 0,
          username: userData.username,
          role: isAdmin ? 'admin' : 'user',
          email: userData.email || ''
        }
        setUser(user)
        setIsLoggedIn(true)
        localStorage.setItem('user', JSON.stringify(user))
        return true
      } else {
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      })

      if (response.ok) {
        return true
      } else {
        return false
      }
    } catch (error) {
      console.error('Registration error:', error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    setIsLoggedIn(false)
    localStorage.removeItem('user')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin" size={40} />
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
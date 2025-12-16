"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { ForumAPI } from "./api"

interface User {
  id: string
  username: string
  email: string
  displayName: string
  image?: string
  roles?: string[]
  bio?: string
  signature?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (login: string, password: string) => Promise<void>
  register: (data: {
    username: string
    email: string
    password: string
    displayName?: string
  }) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem("forum_token")
    if (storedToken) {
      ForumAPI.getMe(storedToken)
        .then(setUser)
        .catch(() => {
          localStorage.removeItem("forum_token")
        })
        .finally(() => setIsLoading(false))
      setToken(storedToken)
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (login: string, password: string) => {
    const data = await ForumAPI.login(login, password)
    setToken(data.token)
    localStorage.setItem("forum_token", data.token)
    const userData = await ForumAPI.getMe(data.token)
    setUser(userData)
  }

  const register = async (data: {
    username: string
    email: string
    password: string
    displayName?: string
  }) => {
    await ForumAPI.register(data)
    await login(data.username, data.password)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("forum_token")
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

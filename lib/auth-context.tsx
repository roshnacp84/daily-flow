"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  provider: "email" | "github" | "google" | "guest"
  isGuest: boolean
  createdAt: number
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signInWithEmail: (email: string, password?: string) => Promise<void>
  signUpWithEmail: (name: string, email: string, password?: string) => Promise<void>
  signInWithProvider: (provider: "github" | "google") => Promise<void>
  continueAsGuest: () => void
  signOut: () => void
}

const AUTH_STORAGE_KEY = "daily_flow_auth_user_v1"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY)
      if (stored) {
        setUser(JSON.parse(stored))
      } else {
        // Default to a guest account so the user is immediately active
        const defaultGuest: User = {
          id: "guest-user",
          name: "Guest Explorer",
          email: "guest@dailyflow.app",
          provider: "guest",
          isGuest: true,
          createdAt: Date.now(),
        }
        setUser(defaultGuest)
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(defaultGuest))
      }
    } catch (e) {
      console.error("Failed to load auth user:", e)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const persistUser = (newUser: User | null) => {
    setUser(newUser)
    if (newUser) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser))
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY)
    }
  }

  const signInWithEmail = async (email: string, _password?: string) => {
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 400)) // smooth realistic transition
    const namePart = email.split("@")[0] || "User"
    const capitalizedName = namePart.charAt(0).toUpperCase() + namePart.slice(1)
    const loggedInUser: User = {
      id: "usr-" + Math.random().toString(36).substring(2, 9),
      name: capitalizedName,
      email,
      provider: "email",
      isGuest: false,
      createdAt: Date.now(),
    }
    persistUser(loggedInUser)
    setIsLoading(false)
  }

  const signUpWithEmail = async (name: string, email: string, _password?: string) => {
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 400))
    const newUser: User = {
      id: "usr-" + Math.random().toString(36).substring(2, 9),
      name: name.trim() || "User",
      email: email.trim(),
      provider: "email",
      isGuest: false,
      createdAt: Date.now(),
    }
    persistUser(newUser)
    setIsLoading(false)
  }

  const signInWithProvider = async (provider: "github" | "google") => {
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 500))
    const isGithub = provider === "github"
    const socialUser: User = {
      id: `${provider}-usr-` + Math.random().toString(36).substring(2, 8),
      name: isGithub ? "GitHub Planner" : "Google User",
      email: isGithub ? "user@github.com" : "user@gmail.com",
      avatar: isGithub
        ? "https://avatars.githubusercontent.com/u/9919?s=200&v=4"
        : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      provider,
      isGuest: false,
      createdAt: Date.now(),
    }
    persistUser(socialUser)
    setIsLoading(false)
  }

  const continueAsGuest = () => {
    const guestUser: User = {
      id: "guest-user",
      name: "Guest Explorer",
      email: "guest@dailyflow.app",
      provider: "guest",
      isGuest: true,
      createdAt: Date.now(),
    }
    persistUser(guestUser)
  }

  const signOut = () => {
    continueAsGuest()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signInWithEmail,
        signUpWithEmail,
        signInWithProvider,
        continueAsGuest,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

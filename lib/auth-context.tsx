"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInAnonymously,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
  User as FirebaseUser,
} from "firebase/auth"
import { auth, isFirebaseConfigured } from "./firebase"

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
  continueAsGuest: () => Promise<void>
  signOut: () => Promise<void>
}

const AUTH_STORAGE_KEY = "daily_flow_auth_user_v1"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function formatFirebaseError(error: any): string {
  const code = error?.code || ""
  switch (code) {
    case "auth/email-already-in-use":
      return "This email is already registered. Please sign in instead."
    case "auth/invalid-email":
      return "Please enter a valid email address."
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password."
    case "auth/user-not-found":
      return "No account found with this email."
    case "auth/weak-password":
      return "Password should be at least 6 characters."
    case "auth/popup-closed-by-user":
      return "Sign in cancelled (popup was closed)."
    case "auth/unauthorized-domain":
      return "This domain is not authorized in Firebase Console > Authentication > Settings."
    case "auth/operation-not-allowed":
      return "This sign-in provider is not enabled in Firebase Console > Authentication."
    default:
      return error?.message || "Authentication failed. Please check your credentials."
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const mapFirebaseUser = (fbUser: FirebaseUser): User => {
    let provider: User["provider"] = "email"
    const providerId = fbUser.providerData[0]?.providerId

    if (fbUser.isAnonymous) {
      provider = "guest"
    } else if (providerId === "google.com") {
      provider = "google"
    } else if (providerId === "github.com") {
      provider = "github"
    }

    const name =
      fbUser.displayName ||
      (fbUser.email ? fbUser.email.split("@")[0] : "Guest Explorer")

    return {
      id: fbUser.uid,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      email: fbUser.email || "guest@dailyflow.app",
      avatar: fbUser.photoURL || undefined,
      provider,
      isGuest: fbUser.isAnonymous,
      createdAt: fbUser.metadata.creationTime
        ? new Date(fbUser.metadata.creationTime).getTime()
        : Date.now(),
    }
  }

  // Observe Firebase Auth state
  useEffect(() => {
    if (typeof window === "undefined") return

    if (isFirebaseConfigured() && auth) {
      const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
        if (fbUser) {
          const appUser = mapFirebaseUser(fbUser)
          setUser(appUser)
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(appUser))
        } else {
          // If signed out from Firebase, check local storage or set default guest
          const stored = localStorage.getItem(AUTH_STORAGE_KEY)
          if (stored) {
            try {
              setUser(JSON.parse(stored))
            } catch {
              setDefaultGuest()
            }
          } else {
            setDefaultGuest()
          }
        }
        setIsLoading(false)
      })

      return () => unsubscribe()
    } else {
      // Offline / Local fallback mode
      try {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY)
        if (stored) {
          setUser(JSON.parse(stored))
        } else {
          setDefaultGuest()
        }
      } catch (e) {
        console.error("Failed to load local auth user:", e)
        setDefaultGuest()
      } finally {
        setIsLoading(false)
      }
    }
  }, [])

  const setDefaultGuest = () => {
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

  const persistLocalUser = (newUser: User) => {
    setUser(newUser)
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser))
  }

  const signInWithEmail = async (email: string, password = "") => {
    setIsLoading(true)
    try {
      if (isFirebaseConfigured() && auth) {
        const cred = await signInWithEmailAndPassword(auth, email, password)
        const appUser = mapFirebaseUser(cred.user)
        persistLocalUser(appUser)
      } else {
        // Fallback local simulation
        await new Promise((r) => setTimeout(r, 400))
        const namePart = email.split("@")[0] || "User"
        const loggedInUser: User = {
          id: "usr-" + Math.random().toString(36).substring(2, 9),
          name: namePart.charAt(0).toUpperCase() + namePart.slice(1),
          email,
          provider: "email",
          isGuest: false,
          createdAt: Date.now(),
        }
        persistLocalUser(loggedInUser)
      }
    } catch (err: any) {
      throw new Error(formatFirebaseError(err))
    } finally {
      setIsLoading(false)
    }
  }

  const signUpWithEmail = async (name: string, email: string, password = "") => {
    setIsLoading(true)
    try {
      if (isFirebaseConfigured() && auth) {
        const cred = await createUserWithEmailAndPassword(auth, email, password)
        if (name.trim()) {
          await firebaseUpdateProfile(cred.user, { displayName: name.trim() })
        }
        const appUser = mapFirebaseUser(cred.user)
        persistLocalUser(appUser)
      } else {
        // Fallback local simulation
        await new Promise((r) => setTimeout(r, 400))
        const newUser: User = {
          id: "usr-" + Math.random().toString(36).substring(2, 9),
          name: name.trim() || "User",
          email: email.trim(),
          provider: "email",
          isGuest: false,
          createdAt: Date.now(),
        }
        persistLocalUser(newUser)
      }
    } catch (err: any) {
      throw new Error(formatFirebaseError(err))
    } finally {
      setIsLoading(false)
    }
  }

  const signInWithProvider = async (provider: "github" | "google") => {
    setIsLoading(true)
    try {
      if (isFirebaseConfigured() && auth) {
        const authProvider =
          provider === "google"
            ? new GoogleAuthProvider()
            : new GithubAuthProvider()

        const cred = await signInWithPopup(auth, authProvider)
        const appUser = mapFirebaseUser(cred.user)
        persistLocalUser(appUser)
      } else {
        // Fallback local simulation
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
        persistLocalUser(socialUser)
      }
    } catch (err: any) {
      throw new Error(formatFirebaseError(err))
    } finally {
      setIsLoading(false)
    }
  }

  const continueAsGuest = async () => {
    setIsLoading(true)
    try {
      if (isFirebaseConfigured() && auth) {
        const cred = await signInAnonymously(auth)
        const appUser = mapFirebaseUser(cred.user)
        persistLocalUser(appUser)
      } else {
        setDefaultGuest()
      }
    } catch (err: any) {
      console.warn("Firebase anonymous sign-in error:", err)
      setDefaultGuest()
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    setIsLoading(true)
    try {
      if (isFirebaseConfigured() && auth) {
        await firebaseSignOut(auth)
      }
      setDefaultGuest()
    } catch (err) {
      console.error("Sign out error:", err)
      setDefaultGuest()
    } finally {
      setIsLoading(false)
    }
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

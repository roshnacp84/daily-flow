"use client"

import { useState } from "react"
import { CalendarCheck, Lock, Mail, User as UserIcon, ArrowRight, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const { signInWithEmail, signUpWithEmail, signInWithProvider, continueAsGuest } = useAuth()
  const [mode, setMode] = useState<"signin" | "signup">("signin")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.")
      return
    }

    if (mode === "signup" && !name.trim()) {
      setError("Please enter your name.")
      return
    }

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }

    try {
      setSubmitting(true)
      if (mode === "signin") {
        await signInWithEmail(email, password)
      } else {
        await signUpWithEmail(name, email, password)
      }
      onOpenChange(false)
    } catch (err: any) {
      setError(err?.message || "Authentication failed. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleSocialLogin = async (provider: "github" | "google") => {
    try {
      setSubmitting(true)
      await signInWithProvider(provider)
      onOpenChange(false)
    } catch (err: any) {
      setError(err?.message || "Social login failed. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleGuest = () => {
    continueAsGuest()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[92vw] rounded-3xl p-6 sm:p-7 overflow-hidden">
        <DialogHeader className="text-center space-y-1.5 items-center">
          <div className="size-11 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-md shadow-primary/20 mb-1">
            <CalendarCheck className="size-6" />
          </div>
          <DialogTitle className="text-xl font-extrabold tracking-tight">
            {mode === "signin" ? "Welcome Back" : "Create Account"}
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            {mode === "signin"
              ? "Sign in to sync your tasks across mobile and web"
              : "Start organizing your days with smart priorities"}
          </p>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-2.5">
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={() => handleSocialLogin("github")}
              className="h-10 rounded-xl text-xs font-semibold gap-2 border-border/80 hover:bg-muted/60"
            >
              <svg className="size-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>GitHub</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={() => handleSocialLogin("google")}
              className="h-10 rounded-xl text-xs font-semibold gap-2 border-border/80 hover:bg-muted/60"
            >
              <svg className="size-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Google</span>
            </Button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-border/60 w-full" />
            <span className="bg-popover px-2 text-[10px] uppercase font-bold text-muted-foreground shrink-0">
              or continue with email
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="rounded-xl bg-destructive/10 p-2.5 text-xs text-destructive border border-destructive/20 font-medium text-center">
                {error}
              </div>
            )}

            {mode === "signup" && (
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Nikku"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-9 h-10 rounded-xl text-xs"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 h-10 rounded-xl text-xs"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 h-10 rounded-xl text-xs"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-11 rounded-xl text-xs font-bold gap-2 mt-2 shadow-md shadow-primary/20"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>{mode === "signin" ? "Sign In" : "Create Account"}</span>
                  <ArrowRight className="size-3.5" />
                </>
              )}
            </Button>
          </form>

          {/* Toggle mode & Guest option */}
          <div className="pt-2 text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setError("")
                  setMode(mode === "signin" ? "signup" : "signin")
                }}
                className="font-bold text-primary underline underline-offset-2 hover:opacity-80"
              >
                {mode === "signin" ? "Sign Up" : "Sign In"}
              </button>
            </p>

            <div>
              <button
                type="button"
                onClick={handleGuest}
                className="text-[11px] text-muted-foreground/80 hover:text-foreground font-medium underline decoration-dotted"
              >
                Continue as Guest Explorer
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

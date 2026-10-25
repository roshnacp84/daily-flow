"use client"

import { useState } from "react"
import { LogIn, LogOut, User as UserIcon, CheckCircle2, ShieldCheck } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AuthDialog } from "@/components/auth/auth-dialog"

export function UserMenu() {
  const { user, signOut } = useAuth()
  const [authDialogOpen, setAuthDialogOpen] = useState(false)

  if (!user || user.isGuest) {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAuthDialogOpen(true)}
          className="h-8 gap-1.5 rounded-full px-3 text-xs font-semibold border-primary/30 text-primary hover:bg-primary/10 shadow-xs"
        >
          <LogIn className="size-3.5" />
          <span>Sign In</span>
        </Button>

        <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
      </>
    )
  }

  // Get initials
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-full ring-2 ring-primary/20 hover:ring-primary/40 transition-all"
            />
          }
        >
          <Avatar size="sm" className="size-8 cursor-pointer">
            {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
              {initials || "U"}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-xl">
          <DropdownMenuLabel className="p-2 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-foreground leading-none">{user.name}</p>
              <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 text-emerald-500 px-1.5 py-0.2 text-[9px] font-bold">
                <CheckCircle2 className="size-2.5" />
                Synced
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuGroup className="p-1">
            <div className="flex items-center gap-2 rounded-lg bg-muted/40 p-2 text-[11px] text-muted-foreground">
              <ShieldCheck className="size-3.5 text-primary" />
              <span>Signed in with {user.provider.toUpperCase()}</span>
            </div>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setAuthDialogOpen(true)}
            className="rounded-xl text-xs font-medium cursor-pointer"
          >
            <UserIcon className="size-3.5 mr-2" />
            <span>Switch Account</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={signOut}
            className="rounded-xl text-xs font-medium text-destructive focus:text-destructive cursor-pointer"
          >
            <LogOut className="size-3.5 mr-2" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </>
  )
}

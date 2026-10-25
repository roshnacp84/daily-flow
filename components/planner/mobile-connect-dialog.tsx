"use client"

import { useState } from "react"
import { Smartphone, Copy, Check, QrCode, ExternalLink } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function MobileConnectDialog({ localIp = "192.168.178.65" }: { localIp?: string }) {
  const [copied, setCopied] = useState(false)
  const mobileUrl = `http://${localIp}:3000`

  const handleCopy = () => {
    navigator.clipboard.writeText(mobileUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 rounded-full px-2.5 text-xs font-medium border-border/80 shadow-xs"
          />
        }
      >
        <Smartphone className="size-3.5 text-primary" />
        <span className="hidden sm:inline">Use on Mobile</span>
        <span className="sm:hidden">Phone</span>
      </DialogTrigger>
      <DialogContent className="max-w-md w-[92vw] rounded-2xl p-6">
        <DialogHeader className="text-left">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <Smartphone className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">Open on Your Phone</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Same Wi-Fi network required
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Link box */}
          <div className="flex items-center justify-between rounded-xl bg-muted/60 p-3 border border-border/60">
            <div className="min-w-0 pr-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Phone Browser URL
              </p>
              <p className="font-mono text-sm font-semibold truncate text-foreground select-all">
                {mobileUrl}
              </p>
            </div>
            <Button
              size="sm"
              variant={copied ? "default" : "secondary"}
              className="shrink-0 h-8 gap-1 px-3 text-xs rounded-lg"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check className="size-3.5 text-primary-foreground" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  <span>Copy</span>
                </>
              )}
            </Button>
          </div>

          {/* Steps */}
          <div className="space-y-2.5 text-xs">
            <div className="flex items-start gap-2.5 rounded-lg border p-2.5 bg-card/50">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                1
              </span>
              <p className="leading-snug text-muted-foreground">
                Ensure your phone is connected to the <strong className="text-foreground">same Wi-Fi</strong>.
              </p>
            </div>

            <div className="flex items-start gap-2.5 rounded-lg border p-2.5 bg-card/50">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                2
              </span>
              <p className="leading-snug text-muted-foreground">
                Open <strong className="text-foreground">Safari (iOS)</strong> or <strong className="text-foreground">Chrome (Android)</strong> and go to{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px] text-foreground font-medium">
                  {mobileUrl}
                </code>
              </p>
            </div>

            <div className="flex items-start gap-2.5 rounded-lg border p-2.5 bg-card/50">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                3
              </span>
              <p className="leading-snug text-muted-foreground">
                <strong className="text-foreground">Install as Full App:</strong> In Safari tap the Share button <strong className="text-foreground">[↑]</strong> &gt; <strong className="text-foreground">&quot;Add to Home Screen&quot;</strong>. On Chrome tap <strong className="text-foreground">⋮</strong> &gt; <strong className="text-foreground">&quot;Add to Home Screen&quot;</strong>.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

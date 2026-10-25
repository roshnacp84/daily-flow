"use client"

import { useState } from "react"
import { Flame, Check, Copy, ExternalLink, ShieldAlert, Sparkles, Database } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { isFirebaseConfigured } from "@/lib/firebase"

export function FirebaseDialog() {
  const [copied, setCopied] = useState(false)
  const isConfigured = isFirebaseConfigured()

  const envTemplate = `NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id`

  const handleCopy = () => {
    navigator.clipboard.writeText(envTemplate)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-[11px] font-semibold rounded-full border border-border/50 hover:bg-muted/60"
          />
        }
      >
        <span
          className={`size-2 rounded-full ${
            isConfigured ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
          }`}
        />
        <span className="hidden xs:inline">
          {isConfigured ? "Firebase Active" : "Firebase Setup"}
        </span>
      </DialogTrigger>
      <DialogContent className="max-w-md w-[92vw] rounded-2xl p-6">
        <DialogHeader className="text-left space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="size-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Database className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                Cloud Firestore Database
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                Real-time multi-device cloud synchronization
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Status badge */}
          <div
            className={`flex items-center gap-2 rounded-xl p-3 border text-xs font-medium ${
              isConfigured
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                : "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
            }`}
          >
            <span
              className={`size-2.5 rounded-full shrink-0 ${
                isConfigured ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
            <p className="leading-snug">
              {isConfigured
                ? "Firebase Firestore is active! Tasks sync automatically in real-time."
                : "Running in Offline / LocalStorage mode. Add your Firebase keys below for cloud sync."}
            </p>
          </div>

          {/* Quick steps */}
          <div className="space-y-2 text-xs">
            <p className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground">
              How to Connect Your Firebase Project:
            </p>

            <div className="space-y-1.5 text-muted-foreground">
              <div className="flex items-start gap-2">
                <span className="font-bold text-foreground">1.</span>
                <span>
                  Go to{" "}
                  <a
                    href="https://console.firebase.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary font-bold underline inline-flex items-center gap-0.5"
                  >
                    console.firebase.google.com <ExternalLink className="size-2.5" />
                  </a>{" "}
                  and click <strong>Add Project</strong>.
                </span>
              </div>

              <div className="flex items-start gap-2">
                <span className="font-bold text-foreground">2.</span>
                <span>
                  Click <strong>Build &gt; Firestore Database</strong> &gt;{" "}
                  <strong>Create database</strong> (choose <em>Test mode</em>).
                </span>
              </div>

              <div className="flex items-start gap-2">
                <span className="font-bold text-foreground">3.</span>
                <span>
                  Click the <strong>Web (&lt;/&gt;)</strong> icon in Project Settings to get your config keys.
                </span>
              </div>

              <div className="flex items-start gap-2">
                <span className="font-bold text-foreground">4.</span>
                <span>
                  Paste them into your local <code>.env.local</code> file or into your Vercel Project Environment Variables.
                </span>
              </div>
            </div>
          </div>

          {/* Code snippet */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Environment Variables Format (.env.local)
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-6 px-2 text-[10px] gap-1 rounded-md"
              >
                {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                <span>{copied ? "Copied" : "Copy Template"}</span>
              </Button>
            </div>
            <pre className="rounded-xl bg-muted/60 p-3 font-mono text-[10px] leading-relaxed text-muted-foreground overflow-x-auto border border-border/50">
              {envTemplate}
            </pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

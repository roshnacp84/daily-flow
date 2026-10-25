"use client"

import { useState, useEffect } from "react"
import { Flame, Clock, Tag } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Task, Priority } from "@/lib/types"
import { cn } from "@/lib/utils"

interface TaskFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialTask?: Task | null
  currentDate: string
  onSave: (taskData: Omit<Task, "id" | "createdAt"> & { id?: string }) => void
}

const CATEGORIES: { id: Task["category"]; label: string; color: string }[] = [
  { id: "urgent", label: "Urgent", color: "bg-rose-500" },
  { id: "work", label: "Work", color: "bg-indigo-500" },
  { id: "personal", label: "Personal", color: "bg-emerald-500" },
  { id: "health", label: "Health", color: "bg-teal-500" },
  { id: "errand", label: "Errand", color: "bg-amber-500" },
]

const PRIORITIES: { id: Priority; label: string; color: string; icon?: boolean }[] = [
  { id: "urgent", label: "Urgent", color: "text-rose-500 border-rose-500/40 bg-rose-500/10", icon: true },
  { id: "high", label: "High", color: "text-amber-500 border-amber-500/40 bg-amber-500/10" },
  { id: "medium", label: "Medium", color: "text-blue-500 border-blue-500/40 bg-blue-500/10" },
  { id: "low", label: "Low", color: "text-muted-foreground border-border bg-muted/60" },
]

export function TaskFormDialog({
  open,
  onOpenChange,
  initialTask,
  currentDate,
  onSave,
}: TaskFormDialogProps) {
  const [title, setTitle] = useState("")
  const [notes, setNotes] = useState("")
  const [priority, setPriority] = useState<Priority>("medium")
  const [category, setCategory] = useState<Task["category"]>("work")
  const [time, setTime] = useState("")
  const [date, setDate] = useState(currentDate)

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title)
      setNotes(initialTask.notes || "")
      setPriority(initialTask.priority)
      setCategory(initialTask.category)
      setTime(initialTask.time || "")
      setDate(initialTask.date)
    } else {
      setTitle("")
      setNotes("")
      setPriority("medium")
      setCategory("work")
      setTime("")
      setDate(currentDate)
    }
  }, [initialTask, currentDate, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    onSave({
      id: initialTask?.id,
      title: title.trim(),
      notes: notes.trim() || undefined,
      priority,
      category,
      time: time || undefined,
      date,
      completed: initialTask ? initialTask.completed : false,
      completedAt: initialTask?.completedAt,
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[92vw] rounded-2xl p-5 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {initialTask ? "Edit Task" : "New Daily Task"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Task Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Task Title *
            </label>
            <Input
              placeholder="What needs to get done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              className="h-11 rounded-xl text-sm"
              required
            />
          </div>

          {/* Priority Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Priority
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {PRIORITIES.map((p) => {
                const isSelected = priority === p.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setPriority(p.id)
                      if (p.id === "urgent") setCategory("urgent")
                    }}
                    className={cn(
                      "flex items-center justify-center gap-1 rounded-xl py-2 px-1 text-xs font-semibold border transition-all active:scale-95 touch-manipulation",
                      isSelected
                        ? `${p.color} ring-2 ring-primary/40 font-bold`
                        : "border-border/60 text-muted-foreground hover:bg-muted bg-card/60"
                    )}
                  >
                    {p.icon && <Flame className="size-3" />}
                    <span>{p.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Category Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.id
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold border transition-all active:scale-95 touch-manipulation",
                      isSelected
                        ? "bg-foreground text-background border-foreground font-bold"
                        : "border-border/60 text-muted-foreground hover:bg-muted bg-card/60"
                    )}
                  >
                    <span className={cn("size-2 rounded-full", cat.color)} />
                    <span>{cat.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Time & Date Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Clock className="size-3" />
                <span>Time (Optional)</span>
              </label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="h-10 rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Date
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-10 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Notes (Optional)
            </label>
            <Textarea
              placeholder="Add extra context, links, or sub-steps..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[70px] rounded-xl text-xs resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl h-10 px-4 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim()}
              className="rounded-xl h-10 px-5 text-xs font-semibold"
            >
              {initialTask ? "Save Changes" : "Add Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

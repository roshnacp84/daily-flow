"use client"

import { useState } from "react"
import {
  Check,
  Clock,
  Trash2,
  Edit2,
  ArrowRight,
  Flame,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Task, Priority } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface TaskItemProps {
  task: Task
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (task: Task) => void
  onMoveToTomorrow: (id: string) => void
}

const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; badgeClass: string; borderClass: string; icon?: boolean }
> = {
  urgent: {
    label: "Urgent",
    badgeClass: "bg-rose-500/10 text-rose-500 border-rose-500/30",
    borderClass: "border-l-rose-500",
    icon: true,
  },
  high: {
    label: "High",
    badgeClass: "bg-amber-500/10 text-amber-500 border-amber-500/30",
    borderClass: "border-l-amber-500",
  },
  medium: {
    label: "Medium",
    badgeClass: "bg-blue-500/10 text-blue-500 border-blue-500/30",
    borderClass: "border-l-blue-500",
  },
  low: {
    label: "Low",
    badgeClass: "bg-muted text-muted-foreground border-border/40",
    borderClass: "border-l-slate-400 dark:border-l-slate-600",
  },
}

const CATEGORY_COLORS: Record<string, string> = {
  urgent: "text-rose-500 bg-rose-500/10",
  work: "text-indigo-500 bg-indigo-500/10",
  personal: "text-emerald-500 bg-emerald-500/10",
  health: "text-teal-500 bg-teal-500/10",
  errand: "text-amber-500 bg-amber-500/10",
}

export function TaskItem({
  task,
  onToggle,
  onDelete,
  onEdit,
  onMoveToTomorrow,
}: TaskItemProps) {
  const [showNotes, setShowNotes] = useState(false)
  const priorityInfo = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-2xl border bg-card/90 transition-all duration-200 border-l-[3.5px] shadow-2xs hover:shadow-xs",
        priorityInfo.borderClass,
        task.completed
          ? "border-border/40 bg-muted/30 opacity-70"
          : "border-border/80"
      )}
    >
      <div className="flex items-start gap-3 p-3.5">
        {/* Custom Touch Checkbox */}
        <button
          type="button"
          onClick={() => onToggle(task.id)}
          className={cn(
            "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg border-2 transition-all duration-150 active:scale-90 touch-manipulation",
            task.completed
              ? "bg-primary border-primary text-primary-foreground shadow-xs"
              : "border-muted-foreground/40 hover:border-primary bg-background"
          )}
          aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
        >
          {task.completed && <Check className="size-3.5 stroke-[3]" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <span
              onClick={() => onToggle(task.id)}
              className={cn(
                "text-sm font-semibold leading-snug cursor-pointer select-none transition-colors",
                task.completed
                  ? "line-through text-muted-foreground decoration-muted-foreground/60"
                  : "text-foreground"
              )}
            >
              {task.title}
            </span>
          </div>

          {/* Badges / metadata */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {/* Priority */}
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border",
                priorityInfo.badgeClass
              )}
            >
              {priorityInfo.icon && <Flame className="size-2.5" />}
              {priorityInfo.label}
            </span>

            {/* Category */}
            <span
              className={cn(
                "rounded-md px-1.5 py-0.5 text-[10px] font-semibold capitalize",
                CATEGORY_COLORS[task.category] || "text-muted-foreground bg-muted"
              )}
            >
              {task.category}
            </span>

            {/* Time */}
            {task.time && (
              <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                <Clock className="size-2.5" />
                {task.time}
              </span>
            )}

            {/* Notes toggle pill */}
            {task.notes && (
              <button
                type="button"
                onClick={() => setShowNotes(!showNotes)}
                className="text-[10px] font-medium text-muted-foreground hover:text-foreground underline decoration-dotted flex items-center gap-0.5"
              >
                <span>{showNotes ? "Hide note" : "Note"}</span>
                {showNotes ? (
                  <ChevronUp className="size-2.5" />
                ) : (
                  <ChevronDown className="size-2.5" />
                )}
              </button>
            )}
          </div>

          {/* Expandable Notes */}
          {showNotes && task.notes && (
            <div className="mt-2 rounded-xl bg-muted/60 p-2.5 text-xs text-muted-foreground leading-relaxed border border-border/50">
              {task.notes}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0.5 shrink-0 -mr-1">
          {!task.completed && (
            <Button
              variant="ghost"
              size="icon"
              className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
              onClick={() => onMoveToTomorrow(task.id)}
              title="Move to tomorrow"
            >
              <ArrowRight className="size-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
            onClick={() => onEdit(task)}
            title="Edit task"
          >
            <Edit2 className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 rounded-lg text-muted-foreground hover:text-rose-500"
            onClick={() => onDelete(task.id)}
            title="Delete task"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

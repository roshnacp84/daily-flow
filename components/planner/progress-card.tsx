"use client"

import { useMemo } from "react"
import { CheckCircle2, ArrowRight, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Task, DayStats } from "@/lib/types"

interface ProgressCardProps {
  tasksForDay: Task[]
  onMoveUnfinishedToTomorrow: () => void
}

export function ProgressCard({ tasksForDay, onMoveUnfinishedToTomorrow }: ProgressCardProps) {
  const stats: DayStats = useMemo(() => {
    const total = tasksForDay.length
    const completed = tasksForDay.filter((t) => t.completed).length
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100)
    const urgentCount = tasksForDay.filter((t) => !t.completed && (t.priority === "urgent" || t.category === "urgent")).length

    return { total, completed, percentage, urgentCount }
  }, [tasksForDay])

  const unfinishedCount = stats.total - stats.completed

  const motivationalMessage = useMemo(() => {
    if (stats.total === 0) return "No tasks scheduled yet. Tap + to add one."
    if (stats.percentage === 100) return "All done! Amazing focus today! 🎉"
    if (stats.percentage >= 60) return "Great momentum! Over halfway through."
    if (stats.percentage > 0) return "Off to a strong start. Keep going!"
    return "Ready to conquer today's priorities."
  }, [stats.total, stats.percentage])

  if (stats.total === 0) {
    return null
  }

  return (
    <div className="rounded-2xl border border-border/80 bg-card/80 p-4 shadow-xs backdrop-blur-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Daily Progress
            </span>
            {stats.urgentCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.2 text-[10px] font-semibold text-rose-500">
                <Flame className="size-3" />
                {stats.urgentCount} urgent
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground font-medium">{motivationalMessage}</p>
        </div>

        <div className="text-right">
          <span className="text-xl font-extrabold text-foreground tracking-tight">
            {stats.percentage}%
          </span>
          <p className="text-[11px] font-medium text-muted-foreground">
            {stats.completed}/{stats.total} done
          </p>
        </div>
      </div>

      <Progress value={stats.percentage} className="h-2 rounded-full" />

      {unfinishedCount > 0 && (
        <div className="pt-1 flex items-center justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMoveUnfinishedToTomorrow}
            className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1 px-2 rounded-lg"
          >
            <span>Move {unfinishedCount} pending to tomorrow</span>
            <ArrowRight className="size-3" />
          </Button>
        </div>
      )}
    </div>
  )
}

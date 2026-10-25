"use client"

import { useMemo } from "react"
import { format, addDays, subDays, isToday, isSameDay, parseISO } from "date-fns"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Task } from "@/lib/types"

interface DayScrollerProps {
  selectedDate: string // YYYY-MM-DD
  onSelectDate: (date: string) => void
  tasks: Task[]
}

export function DayScroller({ selectedDate, onSelectDate, tasks }: DayScrollerProps) {
  const parsedSelected = useMemo(() => {
    try {
      return parseISO(selectedDate)
    } catch {
      return new Date()
    }
  }, [selectedDate])

  // Generate 7 days centered or spanning around today / selected
  const days = useMemo(() => {
    const list: Date[] = []
    for (let i = -3; i <= 3; i++) {
      list.push(addDays(parsedSelected, i))
    }
    return list
  }, [parsedSelected])

  // Count tasks per date string
  const taskCountMap = useMemo(() => {
    const map: Record<string, number> = {}
    tasks.forEach((t) => {
      map[t.date] = (map[t.date] || 0) + 1
    })
    return map
  }, [tasks])

  const handlePrevDay = () => {
    const prev = subDays(parsedSelected, 1)
    onSelectDate(format(prev, "yyyy-MM-dd"))
  }

  const handleNextDay = () => {
    const next = addDays(parsedSelected, 1)
    onSelectDate(format(next, "yyyy-MM-dd"))
  }

  const handleGoToday = () => {
    onSelectDate(format(new Date(), "yyyy-MM-dd"))
  }

  const isCurrentDayToday = isToday(parsedSelected)

  return (
    <div className="space-y-2">
      {/* Date Header Title & Nav */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-1.5">
            {format(parsedSelected, "EEEE")}
            {isCurrentDayToday && (
              <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[11px] font-semibold">
                Today
              </span>
            )}
          </h2>
          <p className="text-xs font-medium text-muted-foreground">
            {format(parsedSelected, "MMMM d, yyyy")}
          </p>
        </div>

        <div className="flex items-center gap-1">
          {!isCurrentDayToday && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleGoToday}
              className="h-7 px-2 text-xs font-medium rounded-full"
            >
              Today
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevDay}
            className="size-8 rounded-full"
            aria-label="Previous Day"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextDay}
            className="size-8 rounded-full"
            aria-label="Next Day"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* Mini Horizontal Day Scroller */}
      <div className="flex items-center justify-between gap-1.5 overflow-x-auto py-1 no-scrollbar">
        {days.map((date) => {
          const dateStr = format(date, "yyyy-MM-dd")
          const isSelected = dateStr === selectedDate
          const isTodayDate = isToday(date)
          const count = taskCountMap[dateStr] || 0

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onSelectDate(dateStr)}
              className={cn(
                "group relative flex flex-1 min-w-[44px] flex-col items-center justify-center rounded-2xl py-2 px-1 text-center transition-all duration-150 active:scale-95 touch-manipulation",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 font-semibold ring-2 ring-primary/40 ring-offset-2 ring-offset-background"
                  : "bg-card/70 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/60"
              )}
            >
              <span className="text-[10px] uppercase font-bold tracking-wide opacity-80">
                {format(date, "EEE")}
              </span>
              <span
                className={cn(
                  "text-sm font-bold mt-0.5",
                  isSelected ? "text-primary-foreground" : isTodayDate ? "text-primary font-black" : "text-foreground"
                )}
              >
                {format(date, "d")}
              </span>

              {/* Task dot */}
              <div className="h-1.5 mt-1 flex items-center justify-center">
                {count > 0 && (
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      isSelected ? "bg-primary-foreground" : "bg-primary/70"
                    )}
                  />
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

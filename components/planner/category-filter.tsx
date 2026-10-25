"use client"

import { Category, Task } from "@/lib/types"
import { cn } from "@/lib/utils"

interface CategoryFilterProps {
  selectedCategory: Category
  onSelectCategory: (cat: Category) => void
  tasksForDay: Task[]
}

const CATEGORIES: { id: Category; label: string; color: string }[] = [
  { id: "all", label: "All", color: "bg-primary" },
  { id: "urgent", label: "Urgent", color: "bg-rose-500" },
  { id: "work", label: "Work", color: "bg-indigo-500" },
  { id: "personal", label: "Personal", color: "bg-emerald-500" },
  { id: "health", label: "Health", color: "bg-teal-500" },
  { id: "errand", label: "Errand", color: "bg-amber-500" },
]

export function CategoryFilter({
  selectedCategory,
  onSelectCategory,
  tasksForDay,
}: CategoryFilterProps) {
  // Compute counts per category
  const countMap: Record<string, number> = {
    all: tasksForDay.length,
    urgent: tasksForDay.filter((t) => t.priority === "urgent" || t.category === "urgent").length,
    work: tasksForDay.filter((t) => t.category === "work").length,
    personal: tasksForDay.filter((t) => t.category === "personal").length,
    health: tasksForDay.filter((t) => t.category === "health").length,
    errand: tasksForDay.filter((t) => t.category === "errand").length,
  }

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar -mx-1 px-1">
      {CATEGORIES.map((cat) => {
        const isSelected = selectedCategory === cat.id
        const count = countMap[cat.id] || 0

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.id)}
            className={cn(
              "flex items-center gap-1.5 shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-150 active:scale-95 touch-manipulation border",
              isSelected
                ? "bg-foreground text-background border-foreground shadow-xs"
                : "bg-card/60 text-muted-foreground hover:text-foreground border-border/60 hover:bg-muted"
            )}
          >
            {cat.id !== "all" && (
              <span className={cn("size-2 rounded-full", cat.color)} />
            )}
            <span>{cat.label}</span>
            <span
              className={cn(
                "rounded-full px-1.5 py-0.2 text-[10px] font-bold leading-none",
                isSelected
                  ? "bg-background/20 text-background"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}

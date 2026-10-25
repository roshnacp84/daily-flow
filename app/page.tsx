"use client"

import { useState, useEffect, useMemo } from "react"
import { format, addDays, parseISO } from "date-fns"
import {
  Plus,
  Search,
  Sparkles,
  CalendarCheck,
  CheckCircle2,
  SlidersHorizontal,
  Flame,
} from "lucide-react"
import { Task, Category, Priority } from "@/lib/types"
import {
  getTodayDateString,
  loadTasksFromStorage,
  saveTasksToStorage,
} from "@/lib/storage"
import { DayScroller } from "@/components/planner/day-scroller"
import { ProgressCard } from "@/components/planner/progress-card"
import { CategoryFilter } from "@/components/planner/category-filter"
import { TaskItem } from "@/components/planner/task-item"
import { TaskFormDialog } from "@/components/planner/task-form-dialog"
import { MobileConnectDialog } from "@/components/planner/mobile-connect-dialog"
import { ThemeToggle } from "@/components/planner/theme-toggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function PlannerPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString())
  const [selectedCategory, setSelectedCategory] = useState<Category>("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)

  // Dialog state
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  // Quick inline add state
  const [quickTitle, setQuickTitle] = useState("")

  // Load tasks on mount
  useEffect(() => {
    const loaded = loadTasksFromStorage()
    setTasks(loaded)
  }, [])

  // Sync to localStorage on change
  const updateTasks = (newTasks: Task[]) => {
    setTasks(newTasks)
    saveTasksToStorage(newTasks)
  }

  // Toggle completed
  const handleToggleTask = (id: string) => {
    const next = tasks.map((t) => {
      if (t.id === id) {
        const completed = !t.completed
        return {
          ...t,
          completed,
          completedAt: completed ? Date.now() : undefined,
        }
      }
      return t
    })
    updateTasks(next)
  }

  // Delete task
  const handleDeleteTask = (id: string) => {
    updateTasks(tasks.filter((t) => t.id !== id))
  }

  // Move a single task to tomorrow
  const handleMoveToTomorrow = (id: string) => {
    const next = tasks.map((t) => {
      if (t.id === id) {
        const currentDateObj = parseISO(t.date)
        const tomorrowStr = format(addDays(currentDateObj, 1), "yyyy-MM-dd")
        return { ...t, date: tomorrowStr }
      }
      return t
    })
    updateTasks(next)
  }

  // Move all unfinished tasks on selected date to tomorrow
  const handleMoveAllUnfinishedToTomorrow = () => {
    const currentDateObj = parseISO(selectedDate)
    const tomorrowStr = format(addDays(currentDateObj, 1), "yyyy-MM-dd")

    const next = tasks.map((t) => {
      if (t.date === selectedDate && !t.completed) {
        return { ...t, date: tomorrowStr }
      }
      return t
    })
    updateTasks(next)
  }

  // Save (add or edit) from dialog
  const handleSaveTask = (taskData: Omit<Task, "id" | "createdAt"> & { id?: string }) => {
    if (taskData.id) {
      // Edit
      const next = tasks.map((t) =>
        t.id === taskData.id
          ? {
              ...t,
              title: taskData.title,
              notes: taskData.notes,
              priority: taskData.priority,
              category: taskData.category,
              time: taskData.time,
              date: taskData.date,
            }
          : t
      )
      updateTasks(next)
    } else {
      // Create
      const newTask: Task = {
        id: "task-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
        title: taskData.title,
        notes: taskData.notes,
        priority: taskData.priority,
        category: taskData.category,
        time: taskData.time,
        date: taskData.date,
        completed: false,
        createdAt: Date.now(),
      }
      updateTasks([newTask, ...tasks])
    }
  }

  // Quick inline add
  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickTitle.trim()) return

    const priority: Priority = selectedCategory === "urgent" ? "urgent" : "medium"
    const category: Task["category"] =
      selectedCategory === "all" ? "work" : (selectedCategory as Task["category"])

    const newTask: Task = {
      id: "task-" + Date.now(),
      title: quickTitle.trim(),
      completed: false,
      priority,
      category,
      date: selectedDate,
      createdAt: Date.now(),
    }

    updateTasks([newTask, ...tasks])
    setQuickTitle("")
  }

  // Open edit modal
  const handleStartEdit = (task: Task) => {
    setEditingTask(task)
    setFormDialogOpen(true)
  }

  // Open create modal
  const handleOpenCreate = () => {
    setEditingTask(null)
    setFormDialogOpen(true)
  }

  // Filter tasks for the selected date
  const tasksForDay = useMemo(() => {
    return tasks.filter((t) => t.date === selectedDate)
  }, [tasks, selectedDate])

  // Filter and sort tasks based on category, status, and search
  const visibleTasks = useMemo(() => {
    let result = tasksForDay

    // Category filter
    if (selectedCategory !== "all") {
      if (selectedCategory === "urgent") {
        result = result.filter((t) => t.priority === "urgent" || t.category === "urgent")
      } else {
        result = result.filter((t) => t.category === selectedCategory)
      }
    }

    // Status filter
    if (statusFilter === "pending") {
      result = result.filter((t) => !t.completed)
    } else if (statusFilter === "completed") {
      result = result.filter((t) => t.completed)
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.notes && t.notes.toLowerCase().includes(q))
      )
    }

    // Sort: Incomplete first, then by priority (urgent > high > medium > low), then time
    const priorityWeight: Record<Priority, number> = {
      urgent: 4,
      high: 3,
      medium: 2,
      low: 1,
    }

    return [...result].sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1
      }
      const pDiff = priorityWeight[b.priority] - priorityWeight[a.priority]
      if (pDiff !== 0) return pDiff
      if (a.time && b.time) return a.time.localeCompare(b.time)
      if (a.time) return -1
      if (b.time) return 1
      return b.createdAt - a.createdAt
    })
  }, [tasksForDay, selectedCategory, statusFilter, searchQuery])

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center">
      {/* Mobile container centered on larger screens */}
      <div className="w-full max-w-md min-h-screen flex flex-col bg-background/95 pb-24 shadow-2xl sm:border-x sm:border-border/60">
        {/* App Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-background/80 backdrop-blur-md border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-xs">
              <CalendarCheck className="size-4.5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight">Daily Flow</h1>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                Mobile Planner
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-full text-muted-foreground hover:text-foreground"
              onClick={() => setShowSearch(!showSearch)}
              aria-label="Search tasks"
            >
              <Search className="size-4" />
            </Button>
            <MobileConnectDialog localIp="192.168.178.65" />
            <ThemeToggle />
          </div>
        </header>

        {/* Search input (collapsible) */}
        {showSearch && (
          <div className="p-3 bg-muted/30 border-b border-border/40 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs rounded-xl"
                autoFocus
              />
            </div>
          </div>
        )}

        <div className="p-4 space-y-4 flex-1">
          {/* Day / Week Scroller */}
          <DayScroller
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            tasks={tasks}
          />

          {/* Daily Progress Card */}
          <ProgressCard
            tasksForDay={tasksForDay}
            onMoveUnfinishedToTomorrow={handleMoveAllUnfinishedToTomorrow}
          />

          {/* Category Filter Chips */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Categories
              </span>
              <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                <button
                  type="button"
                  onClick={() => setStatusFilter("all")}
                  className={statusFilter === "all" ? "text-foreground font-bold" : "hover:text-foreground"}
                >
                  All
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setStatusFilter("pending")}
                  className={statusFilter === "pending" ? "text-foreground font-bold" : "hover:text-foreground"}
                >
                  Pending
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setStatusFilter("completed")}
                  className={statusFilter === "completed" ? "text-foreground font-bold" : "hover:text-foreground"}
                >
                  Done
                </button>
              </div>
            </div>

            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              tasksForDay={tasksForDay}
            />
          </div>

          {/* Quick inline task input */}
          <form onSubmit={handleQuickAdd} className="relative flex items-center pt-1">
            <Input
              placeholder={`+ Quick add to ${selectedCategory === "all" ? "today" : selectedCategory}...`}
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              className="pr-12 h-11 rounded-2xl bg-card border-border/80 shadow-2xs text-xs font-medium placeholder:text-muted-foreground/70"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!quickTitle.trim()}
              className="absolute right-1.5 h-8 px-3 rounded-xl text-xs font-semibold"
            >
              Add
            </Button>
          </form>

          {/* Tasks List */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Tasks ({visibleTasks.length})
              </span>
            </div>

            {visibleTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 p-8 text-center bg-card/40 my-4 space-y-2">
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Sparkles className="size-5" />
                </div>
                <h3 className="text-sm font-bold text-foreground">No tasks here yet</h3>
                <p className="text-xs text-muted-foreground max-w-[220px]">
                  {searchQuery
                    ? "No tasks match your search."
                    : "Add your first task for this day to keep yourself organized."}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleOpenCreate}
                  className="rounded-xl text-xs mt-2"
                >
                  <Plus className="size-3.5 mr-1" />
                  Add Task
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {visibleTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={handleToggleTask}
                    onDelete={handleDeleteTask}
                    onEdit={handleStartEdit}
                    onMoveToTomorrow={handleMoveToTomorrow}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Floating Action Bar at Bottom */}
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-md px-4 pointer-events-none z-30">
          <Button
            onClick={handleOpenCreate}
            size="lg"
            className="w-full h-12 rounded-2xl shadow-lg shadow-primary/25 font-bold text-sm pointer-events-auto flex items-center justify-center gap-2 active:scale-98 transition-transform"
          >
            <Plus className="size-4.5 stroke-[2.5]" />
            <span>Add New Task</span>
          </Button>
        </div>
      </div>

      {/* Task Form Dialog */}
      <TaskFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        initialTask={editingTask}
        currentDate={selectedDate}
        onSave={handleSaveTask}
      />
    </main>
  )
}

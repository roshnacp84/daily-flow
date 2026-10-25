export type Priority = "urgent" | "high" | "medium" | "low"

export type Category = "work" | "personal" | "urgent" | "health" | "errand" | "all"

export interface Task {
  id: string
  title: string
  notes?: string
  completed: boolean
  priority: Priority
  category: "work" | "personal" | "urgent" | "health" | "errand"
  date: string // YYYY-MM-DD
  time?: string // HH:mm format (optional)
  createdAt: number
  completedAt?: number
}

export interface DayStats {
  total: number
  completed: number
  percentage: number
  urgentCount: number
}

import { format } from "date-fns"
import { Task } from "./types"

const STORAGE_KEY = "daily_flow_planner_tasks_v1"

export function getTodayDateString(): string {
  return format(new Date(), "yyyy-MM-dd")
}

export function getInitialSampleTasks(): Task[] {
  const today = getTodayDateString()
  return [
    {
      id: "task-1",
      title: "Review daily priority list & goals",
      notes: "Pick top 3 non-negotiables for today",
      completed: true,
      priority: "high",
      category: "personal",
      date: today,
      time: "08:00",
      createdAt: Date.now() - 1000 * 60 * 120,
      completedAt: Date.now() - 1000 * 60 * 60,
    },
    {
      id: "task-2",
      title: "Finalize client proposal draft",
      notes: "Include pricing table and project milestones",
      completed: false,
      priority: "urgent",
      category: "urgent",
      date: today,
      time: "10:30",
      createdAt: Date.now() - 1000 * 60 * 90,
    },
    {
      id: "task-3",
      title: "Team sync & design walkthrough",
      notes: "Demo new mobile planner layout",
      completed: false,
      priority: "medium",
      category: "work",
      date: today,
      time: "14:00",
      createdAt: Date.now() - 1000 * 60 * 45,
    },
    {
      id: "task-4",
      title: "30-minute afternoon walk / cardio",
      notes: "Aim for 5,000 steps minimum",
      completed: false,
      priority: "medium",
      category: "health",
      date: today,
      time: "17:30",
      createdAt: Date.now() - 1000 * 60 * 30,
    },
    {
      id: "task-5",
      title: "Pick up groceries & fresh fruits",
      completed: false,
      priority: "low",
      category: "errand",
      date: today,
      createdAt: Date.now() - 1000 * 60 * 15,
    },
  ]
}

export function loadTasksFromStorage(): Task[] {
  if (typeof window === "undefined") {
    return []
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const initial = getInitialSampleTasks()
      saveTasksToStorage(initial)
      return initial
    }
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed
    }
    return []
  } catch (err) {
    console.error("Failed to load tasks from localStorage:", err)
    return []
  }
}

export function saveTasksToStorage(tasks: Task[]): void {
  if (typeof window === "undefined") {
    return
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  } catch (err) {
    console.error("Failed to save tasks to localStorage:", err)
  }
}

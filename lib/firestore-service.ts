import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
} from "firebase/firestore"
import { db, isFirebaseConfigured } from "./firebase"
import { Task } from "./types"

export function subscribeToUserTasks(
  userId: string,
  onUpdate: (tasks: Task[]) => void,
  onError?: (error: Error) => void
): () => void {
  if (!db || !isFirebaseConfigured() || !userId) {
    return () => {}
  }

  try {
    const tasksRef = collection(db, "users", userId, "tasks")
    const q = query(tasksRef, orderBy("createdAt", "desc"))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const tasks: Task[] = []
        snapshot.forEach((docSnap) => {
          tasks.push(docSnap.data() as Task)
        })
        onUpdate(tasks)
      },
      (error) => {
        console.warn("Firestore onSnapshot error:", error)
        if (onError) onError(error)
      }
    )

    return unsubscribe
  } catch (err) {
    console.error("Failed to subscribe to tasks:", err)
    return () => {}
  }
}

export async function saveTaskToFirestore(userId: string, task: Task): Promise<void> {
  if (!db || !isFirebaseConfigured() || !userId) return

  try {
    const taskDoc = doc(db, "users", userId, "tasks", task.id)
    await setDoc(taskDoc, task, { merge: true })
  } catch (err) {
    console.error("Failed to save task to Firestore:", err)
  }
}

export async function deleteTaskFromFirestore(userId: string, taskId: string): Promise<void> {
  if (!db || !isFirebaseConfigured() || !userId) return

  try {
    const taskDoc = doc(db, "users", userId, "tasks", taskId)
    await deleteDoc(taskDoc)
  } catch (err) {
    console.error("Failed to delete task from Firestore:", err)
  }
}

export async function bulkUploadTasksToFirestore(
  userId: string,
  tasks: Task[]
): Promise<void> {
  const firestore = db
  if (!firestore || !isFirebaseConfigured() || !userId || tasks.length === 0) return

  try {
    const batch = writeBatch(firestore)
    tasks.forEach((t) => {
      const taskDoc = doc(firestore, "users", userId, "tasks", t.id)
      batch.set(taskDoc, t, { merge: true })
    })
    await batch.commit()
  } catch (err) {
    console.error("Failed to batch upload tasks to Firestore:", err)
  }
}

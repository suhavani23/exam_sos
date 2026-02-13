import type { User, Roadmap, UserStats } from "./types"
import { supabase } from "./supabase"

const KEYS = {
  USER: "exam-sos-user",
  ROADMAPS: "exam-sos-roadmaps",
  STATS: "exam-sos-stats",
} as const

// Helper to get current user ID
async function getUserId() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user?.id
}

function getLocalItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : fallback
  } catch {
    return fallback
  }
}

function setLocalItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(value))
}

// User
export function getUser(): User | null {
  return getLocalItem<User | null>(KEYS.USER, null)
}

export function setUser(user: User): void {
  setLocalItem(KEYS.USER, user)
}

export function removeUser(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(KEYS.USER)
}

// Roadmaps
export async function getRoadmaps(): Promise<Roadmap[]> {
  const userId = await getUserId()

  if (userId) {
    const { data, error } = await supabase
      .from('roadmaps')
      .select('data')
      .eq('user_id', userId)

    if (!error && data) {
      const roadmaps = data.map(d => d.data as Roadmap)
      setLocalItem(KEYS.ROADMAPS, roadmaps)
      return roadmaps
    }
  }

  return getLocalItem<Roadmap[]>(KEYS.ROADMAPS, [])
}

export async function getRoadmap(id: string): Promise<Roadmap | undefined> {
  const roadmaps = await getRoadmaps()
  return roadmaps.find((r) => r.id === id)
}

export async function saveRoadmap(roadmap: Roadmap): Promise<void> {
  const userId = await getUserId()

  if (userId) {
    const { error } = await supabase
      .from('roadmaps')
      .upsert({
        id: roadmap.id,
        user_id: userId,
        syllabus_id: roadmap.syllabusId,
        name: roadmap.syllabus.name,
        data: roadmap
      })

    if (error) console.error("Error saving roadmap to Supabase:", error)
  }

  const roadmaps = getLocalItem<Roadmap[]>(KEYS.ROADMAPS, [])
  const index = roadmaps.findIndex((r) => r.id === roadmap.id)
  if (index >= 0) {
    roadmaps[index] = roadmap
  } else {
    roadmaps.push(roadmap)
  }
  setLocalItem(KEYS.ROADMAPS, roadmaps)
}

export async function deleteRoadmap(id: string): Promise<void> {
  const userId = await getUserId()

  if (userId) {
    const { error } = await supabase
      .from('roadmaps')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) console.error("Error deleting roadmap from Supabase:", error)
  }

  const roadmaps = getLocalItem<Roadmap[]>(KEYS.ROADMAPS, []).filter((r) => r.id !== id)
  setLocalItem(KEYS.ROADMAPS, roadmaps)
}

// Stats
export async function getStats(): Promise<UserStats> {
  const userId = await getUserId()
  const fallbackStats = {
    currentStreak: 0,
    longestStreak: 0,
    totalStudyHours: 0,
    topicsCompleted: 0,
    totalTopics: 0,
    lastStudyDate: null,
  }

  if (userId) {
    const { data, error } = await supabase
      .from('stats')
      .select('data')
      .eq('user_id', userId)
      .single()

    if (!error && data) {
      const stats = data.data as UserStats
      setLocalItem(KEYS.STATS, stats)
      return stats
    }
  }

  return getLocalItem<UserStats>(KEYS.STATS, fallbackStats)
}

export async function updateStats(updates: Partial<UserStats>): Promise<void> {
  const userId = await getUserId()
  const stats = await getStats()
  const newStats = { ...stats, ...updates }

  if (userId) {
    const { error } = await supabase
      .from('stats')
      .upsert({
        user_id: userId,
        data: newStats
      })

    if (error) console.error("Error updating stats in Supabase:", error)
  }

  setLocalItem(KEYS.STATS, newStats)
}

export async function updateStreak(): Promise<void> {
  const stats = await getStats()
  const today = new Date().toISOString().split("T")[0]

  if (stats.lastStudyDate === today) return

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split("T")[0]

  if (stats.lastStudyDate === yesterdayStr) {
    stats.currentStreak += 1
  } else {
    stats.currentStreak = 1
  }

  if (stats.currentStreak > stats.longestStreak) {
    stats.longestStreak = stats.currentStreak
  }

  stats.lastStudyDate = today
  await updateStats(stats)
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

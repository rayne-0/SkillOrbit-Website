import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useAuthStore } from './auth'

const API_BASE = 'http://localhost:8000'

export const LEVEL_XP_THRESHOLDS = [
  0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700,
  3250, 3850, 4500, 5200, 5950, 6750, 7600, 8500, 9450, 10450,
]

export function getLevelForXP(xp: number): number {
  let level = 1
  for (let i = 0; i < LEVEL_XP_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_XP_THRESHOLDS[i]) level = i + 1
    else break
  }
  return Math.min(level, 20)
}

export function getNextLevelXP(xp: number): number {
  const level = getLevelForXP(xp)
  if (level >= 20) return LEVEL_XP_THRESHOLDS[19]
  return LEVEL_XP_THRESHOLDS[level]
}

export function getCurrentLevelXP(xp: number): number {
  const level = getLevelForXP(xp)
  return LEVEL_XP_THRESHOLDS[level - 1]
}

const DEFAULT_PROFILE = {
  xp: 0, level: 1, badges: [] as string[], badges_full: [] as any[],
  streak: 0, total_lessons_completed: 0, ai_questions_asked: 0,
  notes_created: 0, next_level_xp: 100, current_level_xp: 0,
}

function getTokens() {
  try {
    const s = localStorage.getItem('skillorbit_tokens')
    return s ? JSON.parse(s) : null
  } catch { return null }
}

function loadCachedProfile() {
  try {
    const s = localStorage.getItem('skillorbit_gamification')
    return s ? JSON.parse(s) : { ...DEFAULT_PROFILE }
  } catch { return { ...DEFAULT_PROFILE } }
}

export const useGamificationStore = defineStore('gamification', () => {
  const profile = ref(loadCachedProfile())
  const loading = ref(false)
  const newBadges = ref<any[]>([])

  async function fetchProfile() {
    const tokens = getTokens()
    if (!tokens?.access) return
    try {
      loading.value = true
      const res = await fetch(`${API_BASE}/api/gamification/profile/`, {
        headers: { Authorization: `Bearer ${tokens.access}` },
      })
      const data = await res.json()
      if (data.success) {
        profile.value = data.profile
        localStorage.setItem('skillorbit_gamification', JSON.stringify(data.profile))
      }
    } catch { /* use cache */ }
    finally { loading.value = false }
  }

  async function awardXP(xpAmount = 50, action = 'lesson') {
    const tokens = getTokens()
    if (!tokens?.access) return null

    // Optimistic update
    profile.value = {
      ...profile.value,
      xp: profile.value.xp + xpAmount,
      level: getLevelForXP(profile.value.xp + xpAmount),
      next_level_xp: getNextLevelXP(profile.value.xp + xpAmount),
      current_level_xp: getCurrentLevelXP(profile.value.xp + xpAmount),
    }
    localStorage.setItem('skillorbit_gamification', JSON.stringify(profile.value))

    try {
      const res = await fetch(`${API_BASE}/api/gamification/award/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.access}` },
        body: JSON.stringify({ xp: xpAmount, action }),
      })
      const data = await res.json()
      if (data.success) {
        const r = data.result
        await fetchProfile()
        if (r.new_badges_full?.length > 0) newBadges.value = r.new_badges_full
        return r
      }
    } catch { /* optimistic applied */ }
    return null
  }

  function clearNewBadges() { newBadges.value = [] }

  // Watch auth state
  const authStore = useAuthStore()
  watch(() => authStore.isAuthenticated, (authenticated) => {
    if (authenticated) fetchProfile()
    else {
      profile.value = { ...DEFAULT_PROFILE }
      localStorage.removeItem('skillorbit_gamification')
    }
  }, { immediate: true })

  return {
    profile, loading, newBadges,
    fetchProfile, awardXP, clearNewBadges,
    LEVEL_XP_THRESHOLDS, getLevelForXP, getNextLevelXP, getCurrentLevelXP,
  }
})

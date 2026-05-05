import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiFetch } from './api'
import { useAuthStore } from './auth'

export interface Mentor {
  id: string
  name: string
  email: string
  bio: string
  expertise: string[]
  avatar?: string
  schedule: string
  assignedStudents?: string[]
}

export const useMentorStore = defineStore('mentor', () => {
  const mentors = ref<Mentor[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const authStore = useAuthStore()

  /** Assigned mentor for the currently logged-in user */
  const assignedMentor = computed<Mentor | null>(() => {
    const userId = String(authStore.user?.id)
    return (
      mentors.value.find(m => m.assignedStudents?.includes(userId)) ??
      mentors.value[0] ?? // Fallback to first mentor if none specifically assigned
      null
    )
  })

  /** Fetch all mentors from backend */
  async function fetchMentors() {
    loading.value = true
    error.value = null
    try {
      const data = await apiFetch('/api/mentors/')
      if (data.success) {
        mentors.value = data.mentors.map((m: any) => ({
          id: m.id || m._id,
          name: m.name,
          email: m.email,
          bio: m.bio,
          expertise: m.expertise || [],
          avatar: m.avatar,
          schedule: m.schedule,
          assignedStudents: m.assignedStudents || [],
        }))
      } else {
        error.value = data.error || 'Failed to load mentors'
      }
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  /** Admin: add a new mentor */
  async function addMentor(mentor: Omit<Mentor, 'id'>) {
    const data = await apiFetch('/api/mentors/', {
      method: 'POST',
      body: JSON.stringify(mentor),
    })
    if (data.success) {
      mentors.value.push({ id: data.mentor.id, ...mentor })
    } else {
      throw new Error(data.error || 'Failed to add mentor')
    }
  }

  function updateMentor(id: string, updates: Partial<Mentor>) {
    const idx = mentors.value.findIndex(m => m.id === id)
    if (idx !== -1) mentors.value[idx] = { ...mentors.value[idx], ...updates }
  }

  function deleteMentor(id: string) {
    mentors.value = mentors.value.filter(m => m.id !== id)
  }

  // Init
  fetchMentors()

  return {
    mentors,
    assignedMentor,
    loading,
    error,
    fetchMentors,
    addMentor,
    updateMentor,
    deleteMentor,
  }
})

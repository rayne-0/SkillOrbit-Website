import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiFetch } from './api'

export interface Announcement {
  id: string
  title: string
  message: string
  type: 'system' | 'live_class' | 'assignment'
  date: string
  link?: string
  read: boolean
}

export const useAnnouncementStore = defineStore('announcement', () => {
  const announcements = ref<Announcement[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /** Fetch all announcements from backend */
  async function fetchAnnouncements() {
    loading.value = true
    error.value = null
    try {
      const data = await apiFetch('/api/announcements/')
      if (data.success) {
        announcements.value = data.announcements.map((a: any) => ({
          id: a.id || a._id,
          title: a.title,
          message: a.message,
          type: a.type || 'system',
          date: a.date,
          link: a.link || undefined,
          read: a.read ?? false,
        }))
      } else {
        error.value = data.error || 'Failed to load announcements'
      }
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  /** Admin: broadcast a new announcement */
  async function addAnnouncement(ann: Omit<Announcement, 'id'>) {
    const data = await apiFetch('/api/announcements/', {
      method: 'POST',
      body: JSON.stringify(ann),
    })
    if (data.success) {
      announcements.value.unshift({
        id: data.announcement.id || data.announcement._id,
        ...ann,
      })
    } else {
      throw new Error(data.error || 'Failed to create announcement')
    }
  }

  /** Admin: delete an announcement */
  async function deleteAnnouncement(id: string) {
    const data = await apiFetch(`/api/announcements/${id}/`, {
      method: 'DELETE',
    })
    if (data.success) {
      announcements.value = announcements.value.filter(a => a.id !== id)
    } else {
      throw new Error(data.error || 'Failed to delete announcement')
    }
  }

  /** Mark a single announcement as read */
  async function markAsRead(id: string) {
    const ann = announcements.value.find(a => a.id === id)
    if (ann) ann.read = true
    try {
      await apiFetch(`/api/announcements/${id}/read/`, { method: 'PUT' })
    } catch { /* silently fail, optimistic applied */ }
  }

  /** Mark all announcements as read */
  async function markAllAsRead() {
    announcements.value.forEach(a => (a.read = true))
    try {
      await apiFetch(`/api/announcements/all/read/`, { method: 'PUT' })
    } catch { /* silently fail, optimistic applied */ }
  }

  // Init
  fetchAnnouncements()

  return {
    announcements,
    loading,
    error,
    fetchAnnouncements,
    addAnnouncement,
    deleteAnnouncement,
    markAsRead,
    markAllAsRead,
  }
})

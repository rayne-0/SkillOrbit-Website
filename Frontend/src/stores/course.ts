import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useAuthStore } from './auth'

const API   = 'http://localhost:8000/api/courses'
const PAY   = 'http://localhost:8000/api/payments'

function getTokens() {
  try { const s = localStorage.getItem('skillorbit_tokens'); return s ? JSON.parse(s) : null }
  catch { return null }
}
function authHeaders(extra: Record<string,string> = {}) {
  const t = getTokens()
  return t ? { Authorization: `Bearer ${t.access}`, ...extra } : extra
}
function loadRazorpay(): Promise<boolean> {
  if ((window as any).Razorpay) return Promise.resolve(true)
  return new Promise(resolve => {
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = () => resolve(true); s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })
}

// ─── Types ────────────────────────────────────────────────────
export interface QuizQuestion {
  id: string
  type: 'mcq' | 'multi' | 'truefalse' | 'short'
  text: string
  options?: string[]
  correct_answer?: string | string[]
  explanation?: string
  points: number
}
export interface Lesson {
  lesson_id: string
  title: string
  type: 'video' | 'article' | 'quiz' | 'assignment'
  duration?: string
  video_url?: string
  content?: string
  quiz_questions?: QuizQuestion[]
  resources?: { name: string; url: string; type: string; size: string }[]
  order: number
}
export interface Module {
  module_id: string
  title: string
  order: number
  lessons: Lesson[]
}
export interface Course {
  id: number | string
  title: string
  description?: string
  instructor?: string
  level?: string
  duration?: string
  price: string | number
  thumbnail?: string
  category?: string
  rating?: number
  reviews?: number
  students?: string
  bestseller?: boolean
  modules?: Module[]
}
export interface Enrollment {
  course_id: string | number
  progress: number
  completed_lessons: string[]
  last_accessed_lesson_id?: string
}

// ─── Store ────────────────────────────────────────────────────
export const useCourseStore = defineStore('course', () => {
  const courses     = ref<Course[]>([])
  const enrollments = ref<Enrollment[]>([])
  const courseCache = ref<Record<string, Course>>({})
  const loading     = ref(true)
  const error       = ref<string | null>(null)

  const isEnrolled = computed(() => (id: string | number) =>
    enrollments.value.some(e => String(e.course_id) === String(id))
  )
  const getEnrollment = computed(() => (id: string | number) =>
    enrollments.value.find(e => String(e.course_id) === String(id))
  )

  // ── Fetch all courses ──────────────────────────────────────
  async function fetchCourses() {
    try {
      loading.value = true
      const res  = await fetch(`${API}/`)
      const data = await res.json()
      if (data.success) courses.value = data.courses
      else error.value = data.error
    } catch (e: any) { error.value = e.message }
    finally { loading.value = false }
  }

  // ── Fetch single course with full module/lesson data ───────
  async function fetchCourseById(id: string | number): Promise<Course | null> {
    const key = String(id)
    if (courseCache.value[key]?.modules?.length) return courseCache.value[key]
    try {
      const res  = await fetch(`${API}/${id}/`)
      const data = await res.json()
      if (data.success) {
        courseCache.value[key] = data.course
        // also update the list entry
        const idx = courses.value.findIndex(c => String(c.id) === key)
        if (idx >= 0) courses.value[idx] = data.course
        else courses.value.push(data.course)
        return data.course
      }
    } catch { /* silent */ }
    return null
  }

  // ── Fetch single lesson (for lecture page) ─────────────────
  async function fetchLesson(courseId: string, lessonId: string): Promise<Lesson | null> {
    try {
      const res  = await fetch(`${API}/${courseId}/lessons/${lessonId}/`, { headers: authHeaders() })
      const data = await res.json()
      return data.success ? data.lesson : null
    } catch { return null }
  }

  // ── Enrollments ────────────────────────────────────────────
  async function fetchEnrollments() {
    if (!getTokens()?.access) return
    try {
      const res  = await fetch(`${API}/user/enrolled/`, { headers: authHeaders() })
      const data = await res.json()
      if (data.success) enrollments.value = data.enrollments
    } catch { /* silent */ }
  }

  async function enrollUser(courseId: string | number) {
    const t = getTokens()
    if (!t) throw new Error('Please log in to enroll.')
    const res  = await fetch(`${API}/${courseId}/enroll/`, { method: 'POST', headers: authHeaders() })
    const data = await res.json()
    if (!data.success) throw new Error(data.error)
    await fetchEnrollments()
    return data
  }

  // ── Progress ───────────────────────────────────────────────
  async function markLessonComplete(courseId: string | number, lessonId: string) {
    if (!getTokens()) return null
    try {
      const res  = await fetch(`${API}/${courseId}/progress/`, {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ lesson_id: lessonId }),
      })
      const data = await res.json()
      if (data.success) await fetchEnrollments()
      return data
    } catch { return null }
  }

  // ── Quiz submission ────────────────────────────────────────
  async function submitQuiz(courseId: string, lessonId: string, answers: Record<string, any>) {
    if (!getTokens()) throw new Error('Login required.')
    const res  = await fetch(`${API}/${courseId}/lessons/${lessonId}/quiz/submit/`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ answers }),
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.error || 'Submission failed')
    return data // { score, max_score, passed, results, xp_gained }
  }

  // ── Notes ──────────────────────────────────────────────────
  async function fetchNotes(courseId: string, lessonId?: string) {
    if (!getTokens()) return []
    try {
      const url  = lessonId
        ? `${API}/${courseId}/notes/?lesson_id=${lessonId}`
        : `${API}/${courseId}/notes/`
      const res  = await fetch(url, { headers: authHeaders() })
      const data = await res.json()
      return data.success ? data.notes : []
    } catch { return [] }
  }

  async function saveNote(courseId: string, lessonId: string, text: string, timestamp?: string) {
    if (!getTokens()) return null
    const res  = await fetch(`${API}/${courseId}/notes/`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ lesson_id: lessonId, text, timestamp }),
    })
    const data = await res.json()
    return data.success ? data.note : null
  }

  async function deleteNote(courseId: string, noteId: string) {
    if (!getTokens()) return
    await fetch(`${API}/${courseId}/notes/${noteId}/`, { method: 'DELETE', headers: authHeaders() })
  }

  // ── Q&A ────────────────────────────────────────────────────
  async function fetchQA(courseId: string, lessonId: string) {
    try {
      const res  = await fetch(`${API}/${courseId}/lessons/${lessonId}/qa/`)
      const data = await res.json()
      return data.success ? data.questions : []
    } catch { return [] }
  }

  async function postQuestion(courseId: string, lessonId: string, text: string) {
    if (!getTokens()) throw new Error('Login required.')
    const res  = await fetch(`${API}/${courseId}/lessons/${lessonId}/qa/`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ text }),
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.error)
    return data.question
  }

  // ── Payment ────────────────────────────────────────────────
  async function purchaseCourse(courseId: string | number) {
    const t = getTokens()
    if (!t) throw new Error('Please log in to purchase.')
    const authStore = useAuthStore()
    const ordRes  = await fetch(`${PAY}/create-order/`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ course_id: courseId }),
    })
    const ordData = await ordRes.json()
    if (!ordData.success) {
      if (ordData.error?.includes('free')) return enrollUser(courseId)
      throw new Error(ordData.error || 'Failed to create order')
    }
    const sdkLoaded = await loadRazorpay()
    if (!sdkLoaded) throw new Error('Razorpay SDK failed to load. Check your connection.')
    return new Promise((resolve, reject) => {
      const rzp = new (window as any).Razorpay({
        key: ordData.key_id,
        amount: ordData.amount,
        currency: ordData.currency,
        name: 'SkillOrbit',
        description: 'Course Purchase',
        order_id: ordData.razorpay_order_id,
        prefill: { name: authStore.user?.name || '', email: authStore.user?.email || '' },
        theme: { color: '#0056D2' },
        handler: async (response: any) => {
          try {
            const verRes  = await fetch(`${PAY}/verify/`, {
              method: 'POST',
              headers: authHeaders({ 'Content-Type': 'application/json' }),
              body: JSON.stringify({ ...response, course_id: courseId }),
            })
            const verData = await verRes.json()
            if (verData.success) { await fetchEnrollments(); resolve(verData) }
            else reject(new Error(verData.error || 'Verification failed'))
          } catch (e) { reject(e) }
        },
      })
      rzp.on('payment.failed', (r: any) => reject(new Error(r.error?.description || 'Payment failed')))
      rzp.open()
    })
  }

  // ── Admin: save course ─────────────────────────────────────
  async function adminSaveCourse(course: Partial<Course> & { id?: any }) {
    const isUpdate = !!course.id
    const res = await fetch(`${API}/${isUpdate ? course.id + '/' : ''}`, {
      method: isUpdate ? 'PUT' : 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(course),
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.error || 'Save failed')
    await fetchCourses()
    return data.course
  }

  async function adminDeleteCourse(id: string | number) {
    const res = await fetch(`${API}/${id}/`, { method: 'DELETE', headers: authHeaders() })
    if (!res.ok) throw new Error('Delete failed')
    await fetchCourses()
  }

  // Init
  fetchCourses()
  fetchEnrollments()
  const authStore = useAuthStore()
  watch(() => authStore.user, () => { fetchCourses(); fetchEnrollments() })

  return {
    courses, enrollments, courseCache, loading, error,
    isEnrolled, getEnrollment,
    fetchCourses, fetchCourseById, fetchLesson, fetchEnrollments,
    enrollUser, markLessonComplete, purchaseCourse,
    submitQuiz, fetchNotes, saveNote, deleteNote,
    fetchQA, postQuestion,
    adminSaveCourse, adminDeleteCourse,
  }
})

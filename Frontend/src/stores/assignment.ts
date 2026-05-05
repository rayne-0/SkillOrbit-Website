import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiFetch } from './api'

export interface AssignmentSubmission {
  id: string
  assignmentId: string
  studentId: string
  studentName: string
  courseName: string
  title: string
  submittedAt: string
  status: 'pending' | 'reviewed'
  fileUrl?: string
  textContent?: string
  grade?: number
  feedback?: string
}

export const useAssignmentStore = defineStore('assignment', () => {
  const submissions = ref<AssignmentSubmission[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /** Fetch all submissions (admin sees all; student filtered by their ID in backend) */
  async function fetchSubmissions() {
    loading.value = true
    error.value = null
    try {
      const data = await apiFetch('/api/assignments/')
      if (data.success) {
        submissions.value = data.assignments.map((a: any) => ({
          id: a._id || a.id,
          assignmentId: a.assignmentId,
          studentId: a.studentId,
          studentName: a.studentName,
          courseName: a.courseName,
          title: a.title,
          submittedAt: a.submittedAt,
          status: a.status,
          fileUrl: a.fileUrl,
          textContent: a.textContent,
          grade: a.grade,
          feedback: a.feedback,
        }))
      } else {
        error.value = data.error || 'Failed to load assignments'
      }
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  /** Submit a new assignment */
  async function submitAssignment(
    submission: Omit<AssignmentSubmission, 'id' | 'status' | 'submittedAt'>
  ) {
    const data = await apiFetch('/api/assignments/', {
      method: 'POST',
      body: JSON.stringify(submission),
    })
    if (data.success) {
      const newSub: AssignmentSubmission = {
        id: data.assignment._id || data.assignment.id,
        ...submission,
        status: 'pending',
        submittedAt: data.assignment.submittedAt || new Date().toISOString(),
      }
      submissions.value.unshift(newSub)
      return newSub
    }
    throw new Error(data.error || 'Submission failed')
  }

  /** Admin: grade an assignment */
  async function reviewSubmission(id: string, grade: number, feedback: string) {
    const data = await apiFetch(`/api/assignments/${id}/grade/`, {
      method: 'PUT',
      body: JSON.stringify({ grade, feedback }),
    })
    if (data.success) {
      const sub = submissions.value.find(s => s.id === id)
      if (sub) {
        sub.status = 'reviewed'
        sub.grade = grade
        sub.feedback = feedback
      }
    } else {
      throw new Error(data.error || 'Review failed')
    }
  }

  // Init
  fetchSubmissions()

  return {
    submissions,
    loading,
    error,
    fetchSubmissions,
    submitAssignment,
    reviewSubmission,
  }
})

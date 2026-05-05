<template>
  <div class="assignment-uploader space-y-6">
    <!-- Status Banner if already submitted -->
    <div v-if="existingSubmission" class="rounded-2xl p-6 border"
         :class="existingSubmission.status === 'reviewed'
           ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800/40'
           : 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/40'">
      <div class="flex items-start gap-4">
        <div class="text-2xl shrink-0">{{ existingSubmission.status === 'reviewed' ? '✅' : '⏳' }}</div>
        <div class="flex-1 min-w-0">
          <p class="font-bold text-gray-900 dark:text-white">
            {{ existingSubmission.status === 'reviewed' ? 'Assignment Reviewed' : 'Submission Pending Review' }}
          </p>
          <p class="text-sm text-gray-500 mt-1">
            Submitted {{ formatDate(existingSubmission.submittedAt) }}
          </p>

          <!-- Grade + Feedback -->
          <div v-if="existingSubmission.status === 'reviewed'" class="mt-4 space-y-3">
            <div class="flex items-center gap-3">
              <span class="text-sm font-bold text-gray-500 uppercase tracking-widest">Grade</span>
              <span class="text-2xl font-black"
                    :class="(existingSubmission.grade ?? 0) >= 70 ? 'text-green-600 dark:text-green-400' : 'text-red-500'">
                {{ existingSubmission.grade }}<span class="text-base font-bold text-gray-400">/100</span>
              </span>
            </div>
            <div v-if="existingSubmission.feedback" class="bg-white dark:bg-surface-900 rounded-xl p-4 border border-gray-100 dark:border-white/5">
              <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Instructor Feedback</p>
              <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{{ existingSubmission.feedback }}</p>
            </div>
          </div>
        </div>
        <button v-if="existingSubmission.status === 'pending'" @click="resubmit = true"
                class="btn-outline text-xs py-2 px-4 shrink-0">Resubmit</button>
      </div>
    </div>

    <!-- Submission Form -->
    <div v-if="!existingSubmission || resubmit">
      <!-- Mode Toggle -->
      <div class="flex gap-2 mb-6">
        <button @click="mode = 'file'"
                :class="['px-4 py-2 rounded-xl text-sm font-bold transition-all', mode === 'file'
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-gray-900 dark:hover:text-white']">
          📎 File Upload
        </button>
        <button @click="mode = 'text'"
                :class="['px-4 py-2 rounded-xl text-sm font-bold transition-all', mode === 'text'
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-gray-900 dark:hover:text-white']">
          ✏️ Text Response
        </button>
      </div>

      <!-- File Upload Area -->
      <div v-if="mode === 'file'">
        <div
          class="relative border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer"
          :class="isDragging
            ? 'border-primary bg-primary/5 scale-[1.01]'
            : selectedFile
              ? 'border-green-400 bg-green-50 dark:bg-green-900/10'
              : 'border-gray-200 dark:border-white/10 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-white/5'"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="handleDrop"
          @click="fileInput?.click()">

          <input ref="fileInput" type="file" class="hidden"
                 accept=".pdf,.doc,.docx,.zip,.rar,.py,.js,.ts,.txt,.png,.jpg"
                 @change="handleFileChange" />

          <div v-if="!selectedFile" class="space-y-3">
            <div class="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center text-3xl mx-auto">
              {{ isDragging ? '📂' : '📤' }}
            </div>
            <div>
              <p class="font-bold text-gray-900 dark:text-white">Drop files here or click to browse</p>
              <p class="text-sm text-gray-500 mt-1">PDF, DOC, ZIP, images, or source files · Max 50MB</p>
            </div>
          </div>

          <div v-else class="space-y-2">
            <div class="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center text-3xl mx-auto">
              {{ fileIcon(selectedFile.name) }}
            </div>
            <p class="font-bold text-gray-900 dark:text-white">{{ selectedFile.name }}</p>
            <p class="text-sm text-gray-500">{{ formatBytes(selectedFile.size) }}</p>
            <button @click.stop="selectedFile = null" class="text-xs text-red-500 hover:underline font-bold mt-2">Remove</button>
          </div>
        </div>

        <!-- Upload progress bar -->
        <div v-if="uploading" class="mt-4">
          <div class="flex justify-between text-xs font-bold text-gray-500 mb-2">
            <span>Uploading…</span><span>{{ uploadProgress }}%</span>
          </div>
          <div class="h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
            <div class="h-full bg-primary rounded-full transition-all duration-300" :style="{ width: `${uploadProgress}%` }" />
          </div>
        </div>
      </div>

      <!-- Text Response Area -->
      <div v-else>
        <textarea
          v-model="textContent"
          rows="10"
          placeholder="Write your response here. You can include code snippets, explanations, and references…"
          class="w-full px-5 py-4 border border-gray-200 dark:border-white/10 rounded-2xl bg-white dark:bg-surface-900 text-gray-900 dark:text-white text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
        />
        <p class="text-xs text-gray-400 mt-2 text-right">{{ textContent.length }} characters</p>
      </div>

      <!-- Notes field (always shown) -->
      <div class="mt-4">
        <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Additional Notes (optional)</label>
        <input v-model="notes" type="text" placeholder="Any comments for your instructor…"
               class="w-full px-4 py-3 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-surface-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all" />
      </div>

      <!-- Submit button -->
      <div class="mt-6 flex items-center gap-4">
        <button
          @click="handleSubmit"
          :disabled="submitting || (mode === 'file' && !selectedFile) || (mode === 'text' && !textContent.trim())"
          class="btn-primary py-3 px-10 font-black text-sm shadow-lg shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed">
          <span v-if="submitting" class="flex items-center gap-2">
            <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Submitting…
          </span>
          <span v-else>Submit Assignment</span>
        </button>
        <p v-if="error" class="text-sm text-red-500 font-medium">{{ error }}</p>
        <p v-if="success" class="text-sm text-green-600 font-bold">✓ Submitted successfully!</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAssignmentStore } from '../stores/assignment'
import { useAuthStore } from '../stores/auth'

const props = defineProps<{
  assignmentId: string
  assignmentTitle: string
  courseName?: string
  deadline?: string
}>()

const emit = defineEmits<{ submitted: [] }>()

const assignmentStore = useAssignmentStore()
const auth = useAuthStore()

const mode = ref<'file' | 'text'>('file')
const selectedFile = ref<File | null>(null)
const textContent = ref('')
const notes = ref('')
const isDragging = ref(false)
const submitting = ref(false)
const uploading = ref(false)
const uploadProgress = ref(0)
const error = ref('')
const success = ref(false)
const resubmit = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const existingSubmission = computed(() =>
  assignmentStore.submissions.find(
    s => s.assignmentId === props.assignmentId && s.studentId === String(auth.user?.id)
  )
)

function handleDrop(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) selectedFile.value = file
}

function handleFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) selectedFile.value = file
}

function fileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase()
  const map: Record<string, string> = {
    pdf: '📄', doc: '📝', docx: '📝', zip: '🗜️', rar: '🗜️',
    py: '🐍', js: '📜', ts: '📜', png: '🖼️', jpg: '🖼️', txt: '📃',
  }
  return map[ext ?? ''] ?? '📁'
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

async function handleSubmit() {
  error.value = ''
  success.value = false
  submitting.value = true

  try {
    let fileUrl: string | undefined

    if (mode.value === 'file' && selectedFile.value) {
      // Simulate upload progress (replace with real upload logic)
      uploading.value = true
      uploadProgress.value = 0
      await new Promise<void>(resolve => {
        const iv = setInterval(() => {
          uploadProgress.value = Math.min(uploadProgress.value + 15, 95)
          if (uploadProgress.value >= 95) { clearInterval(iv); resolve() }
        }, 150)
      })
      // In production: upload to S3/Django and get back a URL
      fileUrl = `uploads/${selectedFile.value.name}`
      uploadProgress.value = 100
      uploading.value = false
    }

    await assignmentStore.submitAssignment({
      assignmentId: props.assignmentId,
      studentId: String(auth.user?.id ?? ''),
      studentName: auth.user?.name ?? 'Unknown',
      courseName: props.courseName ?? '',
      title: props.assignmentTitle,
      fileUrl,
      textContent: mode.value === 'text' ? textContent.value : undefined,
    })

    success.value = true
    resubmit.value = false
    emit('submitted')
  } catch (e: any) {
    error.value = e.message || 'Submission failed. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>

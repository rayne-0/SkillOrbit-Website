<template>
  <div class="min-h-screen bg-[#F8F9FA] dark:bg-surface-950">
    <!-- Professional Header -->
    <div class="bg-white dark:bg-surface-900 border-b border-gray-200 dark:border-white/5 py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <nav class="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
              <RouterLink to="/dashboard" class="hover:text-primary transition-colors">Learning Hub</RouterLink>
              <span class="opacity-30">/</span>
              <RouterLink :to="`/learn/${courseId}`" class="hover:text-primary transition-colors truncate max-w-[150px]">{{ courseData.title }}</RouterLink>
              <span class="opacity-30">/</span>
              <span class="text-gray-900 dark:text-white">Project Notes</span>
            </nav>
            <h1 class="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Technical Annotations</h1>
            <p class="text-sm text-gray-500 font-medium mt-2">{{ notes.length }} Captured insights across {{ moduleCount }} modules</p>
          </div>
          <div class="flex gap-3">
            <RouterLink :to="`/learn/${courseId}`" class="btn-outline px-6 py-3 text-[10px] uppercase tracking-widest font-bold">Curriculum Home</RouterLink>
            <button @click="resumeLearning" class="btn-primary px-6 py-3 text-[10px] uppercase tracking-widest font-bold shadow-lg shadow-primary/20">▶ Resume Curriculum</button>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-12 flex flex-col lg:flex-row gap-12">
      <!-- Filter Sidebar -->
      <aside class="lg:w-64 shrink-0 space-y-6">
        <div class="card p-6 bg-white">
          <h3 class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Module Categorization</h3>
          <div class="space-y-1">
            <button @click="activeFilter = 'all'"
              :class="['w-full flex justify-between items-center py-2.5 px-3 rounded-lg text-xs font-bold transition-all text-left',
                activeFilter === 'all' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-gray-50']">
              <span>Universal Access</span><span class="opacity-60">{{ notes.length }}</span>
            </button>
            <button v-for="(mod, i) in courseData.modules" :key="mod.id"
              @click="activeFilter = mod.id"
              :class="['w-full flex justify-between items-center py-2.5 px-3 rounded-lg text-xs font-bold transition-all text-left',
                activeFilter === mod.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-gray-50']">
              <span class="truncate pr-2">Section {{ i + 1 }}: {{ mod.title }}</span>
              <span class="opacity-60">{{ countPerModule(mod.id) }}</span>
            </button>
          </div>
        </div>
        
        <div class="card p-6 bg-white">
          <h3 class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Retention Strategy</h3>
          <p class="text-[10px] text-gray-500 leading-relaxed font-medium">Timestamped annotations facilitate rapid temporal navigation. Click any entry to synchronize the instructional module with your notes.</p>
        </div>
      </aside>

      <!-- Main Annotation Feed -->
      <div class="flex-1 min-w-0">
        <!-- Search and Filter Hub -->
        <div class="relative group mb-10">
          <input v-model="search" type="text" placeholder="Search annotations by keyword or module title…"
            class="w-full bg-white dark:bg-surface-900 border border-gray-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all outline-none font-medium shadow-sm" />
          <svg class="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </div>

        <!-- Empty State -->
        <div v-if="!grouped.length" class="card py-32 text-center flex flex-col items-center bg-white border-dashed">
          <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-3xl mb-6">📝</div>
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">{{ search ? 'No Matching Annotations' : 'No Captured Insight' }}</h3>
          <p class="text-gray-500 font-medium mb-10 max-w-sm">{{ search ? 'Try broadening your search parameters.' : 'Initialize your learning journey and start capturing key technical insights.' }}</p>
          <button @click="resumeLearning" class="btn-primary px-10 py-4 text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20">Initialize Note Capture</button>
        </div>

        <!-- Grouped Annotation Stack -->
        <div v-for="({ mod, notes: mNotes }) in grouped" :key="mod.id" class="mb-12 animate-fade-up">
          <div class="flex items-center gap-4 mb-6">
            <div class="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center text-xs font-black text-gray-500">{{ courseData.modules.indexOf(mod) + 1 }}</div>
            <h2 class="text-lg font-bold text-gray-900 dark:text-white tracking-tight">{{ mod.title }}</h2>
            <span class="text-[10px] font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-widest">{{ mNotes.length }} Entries</span>
          </div>

          <div class="space-y-4">
            <div v-for="note in mNotes" :key="note.id" class="card bg-white overflow-hidden hover:border-primary/20 transition-all border-gray-100 shadow-sm">
              <button @click="resumeLesson(note.lessonId)" 
                      class="w-full flex items-center justify-between px-8 py-4 bg-gray-50/50 hover:bg-primary/5 transition-colors group">
                <div class="text-xs font-bold text-gray-900 group-hover:text-primary transition-colors flex items-center gap-3">
                  <span class="opacity-40 group-hover:opacity-100 transition-opacity">▶</span>
                  {{ note.lessonTitle }}
                </div>
                <div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">TS: {{ note.ts }}</div>
              </button>
              
              <div class="p-8">
                <div v-if="editingId === note.id" class="animate-fade-up">
                  <textarea v-model="editText" rows="4" autofocus
                    class="w-full bg-gray-50 border border-primary/30 rounded-xl px-5 py-4 text-sm outline-none resize-none font-medium focus:bg-white transition-all shadow-inner" />
                  <div class="flex justify-end gap-3 mt-4">
                    <button @click="editingId = null" class="btn-outline px-5 py-2 text-[10px] uppercase tracking-widest font-bold">Discard</button>
                    <button @click="saveEdit(note.id)" class="btn-primary px-5 py-2 text-[10px] uppercase tracking-widest font-bold">Apply Changes</button>
                  </div>
                </div>
                <p v-else class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium">{{ note.text }}</p>
              </div>
              
              <div v-if="editingId !== note.id" class="flex gap-6 px-8 pb-6">
                <button @click="startEdit(note)" class="text-[10px] font-bold text-gray-400 hover:text-primary transition-colors uppercase tracking-[0.2em]">Modify</button>
                <button @click="deleteNote(note.id)" class="text-[10px] font-bold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-[0.2em]">Delete</button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="grouped.length" class="text-center py-10 border-t border-gray-100 mt-10">
          <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Visualizing {{ filtered.length }} of {{ notes.length }} Global Annotations
          </p>
          <button v-if="search" @click="search = ''" class="mt-4 text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">Reset Parameters</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useCourseStore } from '../stores/course'

const route = useRoute()
const router = useRouter()
const courseStore = useCourseStore()
const courseId = route.params.courseId as string

const courseData = ref<any>({ title: 'Loading...', modules: [] })
const notes = ref<any[]>([])
const activeFilter = ref('all')
const search = ref('')
const editingId = ref<number | null>(null)
const editText = ref('')

const moduleCount = computed(() => courseData.value.modules.filter((m: any) => notes.value.some(n => n.moduleId === m.module_id)).length)
function countPerModule(id: string) { return notes.value.filter(n => n.moduleId === id).length }

const filtered = computed(() =>
  notes.value
    .filter(n => activeFilter.value === 'all' || n.moduleId === activeFilter.value)
    .filter(n => !search.value || n.text.toLowerCase().includes(search.value.toLowerCase()) || n.lessonTitle.toLowerCase().includes(search.value.toLowerCase()))
)

const grouped = computed(() =>
  courseData.value.modules
    .map((mod: any) => ({ mod, notes: filtered.value.filter(n => n.moduleId === mod.module_id) }))
    .filter((g: any) => g.notes.length > 0)
)

function deleteNote(id: number) { notes.value = notes.value.filter(n => n.id !== id) }
function startEdit(note: any) { editingId.value = note.id; editText.value = note.text }
function saveEdit(id: number) {
  notes.value = notes.value.map(n => n.id === id ? { ...n, text: editText.value } : n)
  editingId.value = null
}

function resumeLearning() {
  const enrollment = courseStore.getEnrollment.value(courseId)
  const allLessons = courseData.value.modules.flatMap((m: any) => m.lessons)
  const last = enrollment?.last_accessed_lesson_id
  const target = last ? allLessons.find((l: any) => l.lesson_id === last) : allLessons.find((l: any) => !enrollment?.completed_lessons?.includes(l.lesson_id))
  const dest = target || allLessons[0]
  if (dest) router.push(`/learn/${courseId}/lecture/${dest.lesson_id}`)
}

function resumeLesson(lessonId: string) { router.push(`/learn/${courseId}/lecture/${lessonId}`) }

onMounted(async () => {
  const data = await courseStore.fetchCourseById(courseId)
  if (data) {
    courseData.value = data
    // Sample notes based on course modules
    if (data.modules?.length) {
      notes.value = [
        { id: 1, moduleId: data.modules[0].module_id, lessonId: data.modules[0].lessons[0]?.lesson_id, lessonTitle: data.modules[0].lessons[0]?.title, ts: '01:45', text: 'Critical concept initialized here. Essential for understanding subsequent technical modules.' },
        { id: 2, moduleId: data.modules[0].module_id, lessonId: data.modules[0].lessons[0]?.lesson_id, lessonTitle: data.modules[0].lessons[0]?.title, ts: '05:12', text: 'Note the architectural pattern established in this unit. Follows industry standard protocols.' }
      ]
    }
  }
})
</script>

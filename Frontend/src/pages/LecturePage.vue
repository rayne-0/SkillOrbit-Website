<template>
  <div class="min-h-screen bg-white dark:bg-surface-950 flex flex-col text-gray-900 dark:text-white overflow-hidden">
    <!-- XP Notification -->
    <div v-if="xpFlash" class="xp-flash fixed top-20 right-8 z-50 bg-primary text-white font-bold px-6 py-3 rounded-xl shadow-2xl text-xs pointer-events-none uppercase tracking-widest">{{ xpFlash }}</div>

    <LessonCompleteModal v-if="showModal && modalData"
      :lesson-title="lesson?.title || ''"
      :xp-earned="modalData.xpEarned" :new-level="modalData.newLevel"
      :old-level="modalData.oldLevel" :total-x-p="modalData.totalXP"
      :streak="modalData.streak" :new-badges="modalData.newBadges"
      @next="handleNext" @stay="showModal = false" />

    <!-- Technical Topbar -->
    <header class="flex items-center gap-4 h-16 px-6 border-b border-gray-100 dark:border-white/10 bg-white dark:bg-surface-900 shrink-0 z-30 shadow-sm">
      <RouterLink to="/" class="flex items-center gap-2 mr-4 shrink-0 group">
        <div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-black text-sm group-hover:scale-110 transition-transform shadow-md shadow-primary/20">◎</div>
        <span class="font-black text-sm tracking-tighter text-gray-900 dark:text-white uppercase hidden sm:block">SkillOrbit</span>
      </RouterLink>
      
      <div class="w-px h-6 bg-gray-200 dark:bg-white/10 hidden sm:block shrink-0" />
      
      <p class="text-xs font-bold text-gray-500 uppercase tracking-widest flex-1 truncate hidden sm:block">
        {{ course?.title || 'Instructional Module' }}
      </p>
      
      <div class="flex items-center gap-3 ml-auto">
        <XPBar v-if="auth.isAuthenticated" />
        
        <div class="flex items-center gap-1 bg-gray-50 dark:bg-white/5 p-1 rounded-lg border border-gray-100 dark:border-white/5">
          <button @click="sidebarOpen = !sidebarOpen" class="text-[10px] font-bold text-gray-400 hover:text-primary uppercase tracking-widest px-3 py-1.5 transition-all hidden md:block">
            {{ sidebarOpen ? 'Collapse Index' : 'Expand Index' }}
          </button>
          <RouterLink :to="`/learn/${courseId}/notes`" class="text-[10px] font-bold text-gray-400 hover:text-primary uppercase tracking-widest px-3 py-1.5 transition-all">Notes</RouterLink>
          <RouterLink :to="`/learn/${courseId}`" class="text-[10px] font-bold text-gray-400 hover:text-primary uppercase tracking-widest px-3 py-1.5 transition-all">Exit</RouterLink>
        </div>
        
        <button v-if="nextLesson" @click="router.push(`/learn/${courseId}/lecture/${nextLesson.lesson_id}`)" 
                class="btn-primary text-[10px] py-2 px-4 uppercase tracking-widest font-black shadow-lg shadow-primary/20">
          Next Unit →
        </button>
      </div>
    </header>

    <div class="flex flex-1 min-h-0 overflow-hidden">
      <!-- Curriculum Sidebar -->
      <aside :class="['bg-gray-50 dark:bg-surface-900 border-r border-gray-100 dark:border-white/10 shrink-0 transition-all duration-500 overflow-hidden z-20', sidebarOpen ? 'w-80' : 'w-0']">
        <div class="w-80 h-full flex flex-col">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/10 bg-white dark:bg-surface-900/50">
            <span class="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Curriculum Index</span>
            <span class="text-[10px] font-black text-primary uppercase">{{ completedCount }}/{{ totalCount }} Verified</span>
          </div>
          
          <div class="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            <div v-if="courseLoading" class="p-6 space-y-4">
              <div class="h-4 bg-gray-200 dark:bg-white/5 animate-pulse rounded w-3/4" />
              <div class="h-4 bg-gray-200 dark:bg-white/5 animate-pulse rounded w-1/2" />
            </div>
            
            <template v-for="mod in course?.modules || []" :key="mod.module_id">
              <div class="mb-1">
                <button @click="toggleMod(mod.module_id)" 
                        class="w-full px-4 py-3 text-left hover:bg-white dark:hover:bg-white/5 transition-all rounded-lg flex flex-col gap-2">
                  <div class="text-[11px] font-bold text-gray-900 dark:text-white truncate uppercase tracking-wide">{{ mod.title }}</div>
                  <div class="flex items-center gap-3">
                    <div class="flex-1 h-1 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                      <div class="h-full bg-primary rounded-full transition-all duration-500" :style="{ width: `${modPct(mod)}%` }" />
                    </div>
                    <span class="text-[10px] font-bold text-gray-400 shrink-0">{{ modDone(mod) }}/{{ mod.lessons.length }}</span>
                  </div>
                </button>
                
                <div v-if="openMods.includes(mod.module_id)" class="mt-1 space-y-0.5">
                  <button v-for="ls in mod.lessons" :key="ls.lesson_id"
                    @click="router.push(`/learn/${courseId}/lecture/${ls.lesson_id}`)"
                    :class="['w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all group', 
                      ls.lesson_id === lessonId ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-white dark:hover:bg-white/5']">
                    
                    <div :class="['w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all',
                      isDone(ls.lesson_id) ? 'bg-green-500 border-green-500 text-white' : ls.lesson_id === lessonId ? 'bg-white/20 border-white/40' : 'border-gray-300 dark:border-white/10 group-hover:border-primary/50']">
                      <svg v-if="isDone(ls.lesson_id)" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M5 13l4 4L19 7"/></svg>
                    </div>
                    
                    <span :class="['flex-1 text-[11px] font-medium truncate tracking-tight', 
                      ls.lesson_id === lessonId ? 'text-white font-bold' : isDone(ls.lesson_id) ? 'text-gray-400' : 'text-gray-600 dark:text-gray-400 group-hover:text-primary']">
                      {{ ls.title }}
                    </span>
                    
                    <span :class="['text-[9px] font-bold uppercase tracking-widest', ls.lesson_id === lessonId ? 'text-white/60' : 'text-gray-400 opacity-60']">
                      {{ ls.duration }}
                    </span>
                  </button>
                </div>
              </div>
            </template>
          </div>
        </div>
      </aside>

      <!-- Main Learning Area -->
      <main class="flex-1 overflow-y-auto flex flex-col min-w-0 bg-[#F8F9FA] dark:bg-surface-950 relative">
        <!-- Content View -->
        <div v-if="lessonLoading" class="flex-1 flex items-center justify-center">
          <div class="text-center">
            <div class="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-6" />
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Synchronizing Content Node…</p>
          </div>
        </div>

        <template v-else-if="lesson">
          <!-- VIDEO ENGINE -->
          <div v-if="lesson.type === 'video'" class="bg-black shrink-0 relative group shadow-2xl" style="max-height:65vh;aspect-ratio:16/9">
            <video v-if="lesson.video_url" :src="lesson.video_url" controls class="w-full h-full object-contain" @ended="handleVideoEnd">
              Incompatible visual engine.
            </video>
            <div v-else class="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-gray-500">
              <div class="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-4xl mb-6">📽️</div>
              <p class="text-xs font-bold uppercase tracking-[0.2em]">Video Source Not Initialized</p>
            </div>
          </div>

          <!-- DOCUMENTATION VIEW -->
          <div v-else-if="lesson.type === 'article'" class="max-w-4xl mx-auto w-full px-10 py-16 animate-fade-up">
            <div class="bg-white dark:bg-surface-900 p-12 rounded-2xl shadow-xl border border-gray-100 dark:border-white/5">
              <div class="mb-10 pb-10 border-b border-gray-50 dark:border-white/5">
                <div class="text-[10px] font-bold text-primary uppercase tracking-[0.3em] mb-4">Technical Documentation</div>
                <h1 class="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{{ lesson.title }}</h1>
              </div>
              <div class="prose prose-blue dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 font-medium leading-relaxed" v-html="lesson.content" />
              
              <div class="mt-16 pt-10 border-t border-gray-50 dark:border-white/5 flex justify-between items-center">
                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">End of Documentation</p>
                <button @click="markComplete" class="btn-primary px-8 py-3 text-[10px] uppercase tracking-widest font-black shadow-lg shadow-primary/20">Mark as Verified</button>
              </div>
            </div>
          </div>

          <!-- EVALUATION ENGINE (QUIZ) -->
          <div v-else-if="lesson.type === 'quiz'" class="max-w-3xl mx-auto w-full px-10 py-16 animate-fade-up">
             <div class="bg-white dark:bg-surface-900 p-12 rounded-2xl shadow-xl border border-gray-100 dark:border-white/5">
                <div class="text-center mb-12">
                  <div class="w-16 h-16 bg-primary/10 text-primary flex items-center justify-center text-3xl rounded-2xl mx-auto mb-6">📝</div>
                  <h1 class="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-2">Technical Evaluation</h1>
                  <p class="text-sm font-bold text-gray-400 uppercase tracking-widest">Demonstrate mastery of current objectives</p>
                </div>
                
                <QuizPlayer :quiz-data="lesson.quiz_data" @complete="handleQuizComplete" />
             </div>
          </div>
          
          <!-- PROJECT SUBMISSION (ASSIGNMENT) -->
          <div v-else-if="lesson.type === 'assignment'" class="max-w-4xl mx-auto w-full px-10 py-16 animate-fade-up">
            <div class="bg-white dark:bg-surface-900 p-12 rounded-2xl shadow-xl border border-gray-100 dark:border-white/5">
               <div class="flex items-center gap-6 mb-12">
                 <div class="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 flex items-center justify-center text-2xl rounded-xl">📎</div>
                 <div>
                   <div class="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.3em] mb-1">Project Milestone</div>
                   <h1 class="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{{ lesson.title }}</h1>
                 </div>
               </div>
               
               <div class="prose prose-blue dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 mb-12 font-medium" v-html="lesson.content" />
               
               <div class="p-6 bg-gray-50 dark:bg-white/5 border border-dashed border-gray-300 dark:border-white/20 rounded-xl text-center">
                 <p class="text-sm font-medium text-gray-500 mb-4">Please submit your project files below.</p>
                 <button @click="markComplete" class="btn-primary py-2 px-6 shadow-md shadow-primary/20">Submit Assignment</button>
               </div>
            </div>
          </div>

          <!-- Metadata Context Panel (For Videos) -->
          <div v-if="lesson.type === 'video'" class="max-w-5xl mx-auto w-full px-10 py-12 animate-fade-up">
            <div class="flex flex-col md:flex-row gap-12 items-start">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-6">
                  <span class="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Currently Streaming</span>
                  <span class="w-1 h-1 bg-gray-200 rounded-full"></span>
                  <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{{ lesson.duration }} Technical Video</span>
                </div>
                <h2 class="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-6">{{ lesson.title }}</h2>
                <div class="text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed mb-10" v-html="lesson.description" />
                
                <div class="pt-8 border-t border-gray-100 dark:border-white/5 flex gap-4">
                  <button @click="markComplete" class="btn-primary px-10 py-4 text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20">Verify Module Progression</button>
                  <button @click="shareLesson" class="btn-outline px-10 py-4 text-xs font-black uppercase tracking-widest">Share Protocol</button>
                </div>
              </div>
              
              <div class="w-full md:w-72 space-y-6">
                <div class="card p-6 bg-white border-none shadow-lg">
                  <h4 class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Resources</h4>
                  <div class="space-y-3">
                    <a v-for="r in lesson.resources" :key="r.name" :href="r.url" target="_blank"
                       class="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-primary/5 transition-all group">
                      <span class="text-lg opacity-40 group-hover:opacity-100 transition-opacity">📄</span>
                      <span class="text-xs font-bold text-gray-600 group-hover:text-primary truncate">{{ r.name }}</span>
                    </a>
                    <div v-if="!lesson.resources?.length" class="text-[10px] font-bold text-gray-300 italic text-center py-4">No additional resources identified</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </main>

      <!-- AI Assistant Orb (Global Overlay) -->
      <div class="fixed bottom-8 right-8 z-50">
        <button @click="aiOpen = !aiOpen" 
                class="w-14 h-14 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 flex items-center justify-center shadow-2xl hover:scale-110 transition-transform group relative overflow-hidden">
          <div class="absolute inset-0 bg-primary/20 animate-pulse" />
          <span class="text-2xl relative z-10 group-hover:rotate-12 transition-transform">🤖</span>
        </button>
        <div v-if="aiOpen" class="absolute bottom-20 right-0 w-[400px] max-w-[90vw] animate-scale-in">
          <AIMentor :context="{ course, lesson }" @close="aiOpen = false" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useCourseStore } from '../stores/course'
import LessonCompleteModal from '../components/LessonCompleteModal.vue'
import XPBar from '../components/XPBar.vue'
import QuizPlayer from '../components/QuizPlayer.vue'
import AIMentor from '../components/AIMentor.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const courseStore = useCourseStore()

const courseId = computed(() => route.params.courseId as string)
const lessonId = computed(() => route.params.lessonId as string)

const course = ref<any>(null)
const lesson = ref<any>(null)
const courseLoading = ref(true)
const lessonLoading = ref(true)
const sidebarOpen = ref(true)
const openMods = ref<string[]>([])
const aiOpen = ref(false)

// Modals / Gamification
const showModal = ref(false)
const modalData = ref<any>(null)
const xpFlash = ref('')

const enrollment = computed(() => courseStore.getEnrollment.value(courseId.value))
const completedLessons = computed(() => enrollment.value?.completed_lessons || [])
const totalCount = computed(() => (course.value?.modules || []).reduce((acc: number, m: any) => acc + (m.lessons || []).length, 0))
const completedCount = computed(() => completedLessons.value.length)

const isDone = (id: string) => completedLessons.value.includes(id)
const modDone = (mod: any) => (mod.lessons || []).filter((l: any) => isDone(l.lesson_id)).length
const modPct = (mod: any) => mod.lessons.length ? Math.round(modDone(mod) / mod.lessons.length * 100) : 0

const allLessons = computed(() => (course.value?.modules || []).flatMap((m: any) => m.lessons || []))
const nextLesson = computed(() => {
  const idx = allLessons.value.findIndex((l: any) => l.lesson_id === lessonId.value)
  return idx >= 0 && idx < allLessons.value.length - 1 ? allLessons.value[idx + 1] : null
})

async function markComplete() {
  if (isDone(lessonId.value)) {
    if (nextLesson.value) router.push(`/learn/${courseId.value}/lecture/${nextLesson.value.lesson_id}`)
    return
  }
  
  try {
    const data = await courseStore.completeLesson(courseId.value, lessonId.value)
    if (data.xpEarned) {
      xpFlash.value = `+${data.xpEarned} XP Verified`
      setTimeout(() => xpFlash.value = '', 3000)
    }
    
    if (data.courseCompleted || (allLessons.value.length > 0 && completedCount.value + 1 === allLessons.value.length)) {
      modalData.value = data
      showModal.value = true
    } else if (nextLesson.value) {
      router.push(`/learn/${courseId.value}/lecture/${nextLesson.value.lesson_id}`)
    }
  } catch (e: any) { console.error(e) }
}

function handleVideoEnd() { markComplete() }
function handleQuizComplete() { markComplete() }
function handleNext() { 
  showModal.value = false
  if (nextLesson.value) router.push(`/learn/${courseId.value}/lecture/${nextLesson.value.lesson_id}`)
  else router.push(`/learn/${courseId.value}`)
}

function toggleMod(id: string) {
  const idx = openMods.value.indexOf(id)
  if (idx >= 0) openMods.value.splice(idx, 1); else openMods.value.push(id)
}

function shareLesson() {
  navigator.clipboard.writeText(window.location.href)
  xpFlash.value = 'Link Copied to Clipboard'
  setTimeout(() => xpFlash.value = '', 2000)
}

async function loadData() {
  courseLoading.value = true
  course.value = await courseStore.fetchCourseById(courseId.value)
  if (course.value?.modules) {
    const activeMod = course.value.modules.find((m: any) => m.lessons.some((l: any) => l.lesson_id === lessonId.value))
    if (activeMod && !openMods.value.includes(activeMod.module_id)) openMods.value.push(activeMod.module_id)
    else if (!openMods.value.length && course.value.modules.length) openMods.value.push(course.value.modules[0].module_id)
  }
  courseLoading.value = false
  
  lessonLoading.value = true
  lesson.value = await courseStore.fetchLessonById(courseId.value, lessonId.value)
  lessonLoading.value = false
}

watch([courseId, lessonId], loadData)
onMounted(loadData)
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
.dark .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); }

.prose :deep(pre) { @apply bg-gray-900 text-white p-6 rounded-xl overflow-x-auto my-6; }
.prose :deep(code) { @apply bg-gray-100 dark:bg-white/5 px-1.5 py-0.5 rounded font-mono text-primary; }
.prose :deep(h2) { @apply text-xl font-bold text-gray-900 dark:text-white mt-12 mb-6; }
.prose :deep(p) { @apply mb-6; }
</style>

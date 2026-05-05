<template>
  <div class="min-h-screen bg-[#F8F9FA] dark:bg-surface-950">
    <div v-if="loading" class="flex items-center justify-center py-40">
      <div class="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
    
    <template v-else-if="course">
      <!-- Professional Module Header -->
      <div class="bg-white dark:bg-surface-900 border-b border-gray-200 dark:border-white/5 py-16 relative overflow-hidden">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <nav class="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-8">
            <RouterLink to="/dashboard" class="hover:text-primary transition-colors">Learning Hub</RouterLink>
            <span class="opacity-30">/</span>
            <span class="text-gray-900 dark:text-white">{{ course.title }}</span>
          </nav>
          
          <div class="flex flex-col lg:flex-row gap-16 items-start">
            <div class="flex-1 animate-fade-left">
              <div class="flex items-center gap-3 mb-6">
                <span class="badge-primary px-3 py-1">{{ course.level }}</span>
                <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{{ course.category || 'Professional Track' }}</span>
              </div>
              
              <h1 class="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white tracking-tight mb-6 leading-tight">
                {{ course.title }}
              </h1>
              
              <p class="text-lg text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-8 max-w-2xl line-clamp-2">
                {{ course.description }}
              </p>
              
              <div class="flex flex-wrap items-center gap-8 text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-10">
                <span class="flex items-center gap-2"><span class="text-primary">👨‍🏫</span> {{ course.instructor || 'Technical Staff' }}</span>
                <span class="flex items-center gap-2"><span class="text-primary">📚</span> {{ totalLessons }} Lessons</span>
                <span class="flex items-center gap-2"><span class="text-primary">⏱</span> {{ course.duration }}</span>
              </div>
              
              <div class="flex gap-4">
                <button @click="resumeLearning" class="btn-primary px-10 py-4 text-sm uppercase tracking-widest font-bold shadow-lg shadow-primary/20">
                  {{ completedLessons.length > 0 ? 'Resume Curriculum' : 'Initialize Learning' }}
                </button>
                <RouterLink :to="`/learn/${courseId}/notes`" class="btn-outline px-10 py-4 text-sm uppercase tracking-widest font-bold">Project Notes</RouterLink>
              </div>
            </div>

            <!-- Progress Module -->
            <div class="lg:w-72 shrink-0 animate-fade-right w-full lg:w-auto">
              <div class="card p-8 bg-white shadow-2xl border-none">
                <div class="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-6">Current Progression</div>
                <div class="flex items-end justify-between mb-2">
                  <div class="text-5xl font-black text-gray-900 dark:text-white tracking-tighter">{{ progress }}%</div>
                  <div class="text-[10px] font-bold text-primary uppercase tracking-widest mb-1.5">Completed</div>
                </div>
                <div class="progress-bar h-2 mb-6"><div class="progress-fill" :style="{ width: `${progress}%` }" /></div>
                <div class="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-8">
                  <span>{{ completedLessons.length }} Units Done</span>
                  <span>{{ totalLessons }} Total</span>
                </div>
                
                <button v-if="progress >= 80" @click="router.push(`/certificate/${courseId}`)" 
                        class="w-full btn-primary bg-green-600 hover:bg-green-700 text-xs py-4 shadow-lg shadow-green-600/20">
                  🏆 Claim Certification
                </button>
                <div v-else class="text-[10px] font-bold text-gray-400 text-center uppercase tracking-widest leading-relaxed">
                  Certificate unlocks at <span class="text-primary">80% mastery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Content Navigation -->
      <div class="sticky top-0 z-10 bg-white/80 dark:bg-surface-950/80 backdrop-blur-md border-b border-gray-100 dark:border-white/10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 flex gap-8">
          <button v-for="t in TABS" :key="t.key" @click="tab = t.key"
            :class="['px-2 py-5 text-xs font-bold uppercase tracking-[0.2em] transition-all border-b-2',
              tab === t.key ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-900 dark:hover:text-white']">
            {{ t.label }}
          </button>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-16 flex flex-col lg:flex-row gap-16">
        <!-- Main Curriculum View -->
        <div class="flex-1 min-w-0">
          <div v-if="tab === 'content'" class="space-y-4">
            <div v-for="(mod, mi) in course.modules || []" :key="mod.module_id"
              class="card overflow-hidden bg-white hover:border-primary/20 transition-all">
              <button @click="toggleMod(mod.module_id)"
                class="w-full flex items-center gap-6 p-6 hover:bg-gray-50 transition-colors text-left">
                <div :class="['w-10 h-10 rounded-lg flex items-center justify-center text-sm font-black shrink-0 transition-all',
                  modAllDone(mod) ? 'bg-green-100 text-green-600' : 'bg-gray-50 dark:bg-white/5 text-gray-400']">
                  <svg v-if="modAllDone(mod)" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                  <span v-else>{{ mi + 1 }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-bold text-gray-900 dark:text-white tracking-tight">{{ mod.title }}</div>
                  <div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                    {{ mod.lessons.length }} Instructional Units · {{ modDoneCt(mod) }} Verified
                  </div>
                </div>
                <svg :class="['w-5 h-5 text-gray-300 transition-transform duration-300', openMods.includes(mod.module_id) ? 'rotate-180' : '']" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
              </button>
              
              <div v-if="openMods.includes(mod.module_id)" class="divide-y divide-gray-50 border-t border-gray-50 animate-fade-up">
                <RouterLink v-for="ls in mod.lessons" :key="ls.lesson_id"
                  :to="`/learn/${courseId}/lecture/${ls.lesson_id}`"
                  class="flex items-center gap-6 px-8 py-5 hover:bg-primary/5 transition-colors group">
                  <div :class="['w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-all',
                    isDone(ls.lesson_id) ? 'border-green-500 bg-green-500 text-white' : 'border-gray-200 dark:border-white/10 group-hover:border-primary/50']">
                    <svg v-if="isDone(ls.lesson_id)" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M5 13l4 4L19 7"/></svg>
                  </div>
                  <span class="text-xl opacity-40 group-hover:opacity-100 transition-opacity">
                    {{ ls.type === 'quiz' ? '📝' : ls.type === 'article' ? '📄' : ls.type === 'assignment' ? '📋' : '▶' }}
                  </span>
                  <div class="flex-1 min-w-0">
                    <div :class="['text-sm font-bold truncate transition-colors', isDone(ls.lesson_id) ? 'text-gray-400 line-through' : 'text-gray-900 group-hover:text-primary']">{{ ls.title }}</div>
                    <div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{{ ls.type }} Module · {{ ls.duration }}</div>
                  </div>
                </RouterLink>
              </div>
            </div>
          </div>

          <!-- Documentation Overview -->
          <div v-if="tab === 'overview'" class="card p-10 bg-white">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">Technical Overview</h2>
            <p class="text-gray-600 dark:text-gray-400 font-medium leading-relaxed mb-10">{{ course.description }}</p>
            <div class="grid sm:grid-cols-2 gap-6">
              <div v-for="stat in courseStats" :key="stat.label" class="flex items-center gap-6 p-6 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100">
                <div class="text-3xl">{{ stat.icon }}</div>
                <div>
                  <div class="text-base font-bold text-gray-900 dark:text-white">{{ stat.value }}</div>
                  <div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{{ stat.label }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Instructional Sidebar -->
        <aside class="hidden lg:block w-72 shrink-0 space-y-8 animate-fade-right">
          <div class="card p-8 bg-white">
            <h3 class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Quick Navigation</h3>
            <button @click="resumeLearning" class="btn-primary w-full text-xs py-4 mb-4 uppercase tracking-widest font-bold">Resume Flow</button>
            <RouterLink :to="`/learn/${courseId}/notes`" class="block w-full text-center btn-outline text-xs py-4 uppercase tracking-widest font-bold">Project Notes</RouterLink>
          </div>
          
          <div class="card p-8 bg-white">
            <h3 class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Course Meta</h3>
            <div class="space-y-6">
              <div v-for="stat in courseStats.slice(0, 3)" :key="stat.label">
                <div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{{ stat.label }}</div>
                <div class="text-sm font-bold text-gray-900 dark:text-white">{{ stat.value }}</div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </template>
    
    <div v-else class="text-center py-40">
      <div class="text-5xl mb-6 opacity-20">🛸</div>
      <p class="text-sm font-bold text-gray-400 uppercase tracking-widest">Curriculum Node Not Found</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useCourseStore } from '../stores/course'
import type { Module, Lesson } from '../stores/course'

const route = useRoute()
const router = useRouter()
const courseStore = useCourseStore()
const courseId = route.params.courseId as string

const TABS = [{ key: 'content', label: 'Curriculum' }, { key: 'overview', label: 'Documentation' }]
const tab = ref('content')
const course = ref<any>(null)
const loading = ref(true)
const openMods = ref<string[]>([])

const enrollment = computed(() => courseStore.getEnrollment.value(courseId))
const completedLessons = computed(() => enrollment.value?.completed_lessons || [])
const allLessons = computed((): Lesson[] => (course.value?.modules || []).flatMap((m: Module) => m.lessons || []))
const totalLessons = computed(() => allLessons.value.length)
const progress = computed(() => totalLessons.value ? Math.round(completedLessons.value.length / totalLessons.value * 100) : 0)

const isDone = (id: string) => completedLessons.value.includes(id)
const modDoneCt = (mod: Module) => (mod.lessons || []).filter(l => isDone(l.lesson_id)).length
const modAllDone = (mod: Module) => mod.lessons.length > 0 && modDoneCt(mod) === mod.lessons.length

const courseStats = computed(() => [
  { icon: '📚', label: 'Instructional Units', value: totalLessons.value },
  { icon: '⏱', label: 'Temporal Duration', value: course.value?.duration || 'N/A' },
  { icon: '📊', label: 'Expertise Level', value: course.value?.level || 'Professional' },
  { icon: '🌐', label: 'Instructional Language', value: 'English' },
])

function toggleMod(id: string) {
  const i = openMods.value.indexOf(id)
  if (i >= 0) openMods.value.splice(i, 1); else openMods.value.push(id)
}

function resumeLearning() {
  const last = enrollment.value?.last_accessed_lesson_id
  const target = last ? allLessons.value.find(l => l.lesson_id === last) : allLessons.value.find(l => !isDone(l.lesson_id))
  const first = allLessons.value[0]
  const dest = target || first
  if (dest) router.push(`/learn/${courseId}/lecture/${dest.lesson_id}`)
}

onMounted(async () => {
  loading.value = true
  course.value = await courseStore.fetchCourseById(courseId)
  if (course.value?.modules?.length) {
    openMods.value = [course.value.modules[0].module_id]
  }
  loading.value = false
})
</script>

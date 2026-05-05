<template>
  <div class="min-h-screen bg-[#F8F9FA] dark:bg-surface-950">
    <!-- Clean Professional Hero -->
    <div class="bg-white dark:bg-surface-900 border-b border-gray-200 dark:border-white/5 py-20 relative overflow-hidden">
      <!-- Subtle Background Accents -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -mr-48 -mt-48" />
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col lg:flex-row items-start gap-12 relative z-10">
        <div class="lg:w-2/3 animate-fade-left">
          <div class="flex items-center gap-3 mb-6">
            <span class="badge-primary px-3 py-1">{{ course?.level }}</span>
            <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">{{ course?.category }}</span>
          </div>
          
          <h1 class="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white tracking-tight mb-6 leading-tight">
            {{ course?.title || 'Loading Curriculum...' }}
          </h1>
          
          <p class="text-lg text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-8 max-w-3xl">
            {{ course?.description }}
          </p>
          
          <div class="flex flex-wrap items-center gap-6 text-sm text-gray-500 font-bold uppercase tracking-wider mb-10">
            <span class="flex items-center gap-2"><span class="text-amber-500">★</span> {{ course?.rating || 4.8 }}</span>
            <span class="w-1.5 h-1.5 bg-gray-200 rounded-full"></span>
            <span>{{ Number(course?.reviews || 0).toLocaleString() }} Students</span>
            <span class="w-1.5 h-1.5 bg-gray-200 rounded-full"></span>
            <span>Duration: {{ course?.duration }}</span>
          </div>
          
          <div class="flex gap-4">
            <button @click="handleEnroll" :disabled="enrolling" 
                    class="btn-primary px-12 py-4 text-sm uppercase tracking-widest font-bold shadow-lg shadow-primary/20">
              {{ enrolling ? 'Processing...' : isEnrolled ? 'Resume Curriculum' : String(course?.price).toLowerCase() === 'free' ? 'Initialize Free Enrollment' : `Purchase — ₹${course?.price}` }}
            </button>
          </div>
        </div>

        <!-- Featured Media / Card -->
        <div class="lg:w-1/3 shrink-0 w-full animate-fade-right">
          <div class="card overflow-hidden bg-white shadow-2xl border-none">
            <div class="h-56 bg-gray-100 flex items-center justify-center relative group">
              <img v-if="course?.thumbnail" :src="course.thumbnail" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div v-else class="text-6xl opacity-20">📚</div>
              <div class="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            
            <div class="p-8">
              <div class="text-center mb-8">
                <div class="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Money-Back Guarantee</div>
                <div class="h-0.5 w-8 bg-gray-100 mx-auto" />
              </div>
              
              <h4 class="text-[11px] font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-4">Module Content Includes:</h4>
              <ul class="space-y-4">
                <li v-for="inc in includes" :key="inc" class="flex items-start gap-3 text-sm text-gray-500 font-medium">
                  <svg class="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                  {{ inc }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Syllabus Architecture -->
    <div class="max-w-4xl mx-auto px-4 sm:px-6 py-24">
      <div class="flex items-center justify-between mb-12">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Technical Syllabus</h2>
        <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">{{ course?.modules?.length || 0 }} Sections</span>
      </div>

      <div v-if="loading" class="space-y-4">
        <div class="card h-16 animate-pulse bg-white border-none" v-for="i in 5" :key="i" />
      </div>
      
      <div v-else class="space-y-4">
        <div v-for="(mod, i) in course?.modules || []" :key="mod.module_id" class="card overflow-hidden bg-white">
          <button @click="openMod = openMod === mod.module_id ? null : mod.module_id"
            class="w-full flex items-center justify-between px-8 py-6 hover:bg-gray-50 text-left transition-colors">
            <div>
              <div class="text-sm font-bold text-gray-900 dark:text-white tracking-tight">{{ mod.title }}</div>
              <div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{{ mod.lessons.length }} Instructional Units</div>
            </div>
            <svg :class="['w-5 h-5 text-gray-300 transition-transform duration-300', openMod === mod.module_id ? 'rotate-180' : '']" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </button>
          
          <div v-if="openMod === mod.module_id" class="divide-y divide-gray-50 animate-fade-up">
            <div v-for="ls in mod.lessons" :key="ls.lesson_id" 
                 class="flex items-center gap-4 px-8 py-4 text-sm text-gray-600 dark:text-gray-400 font-medium group hover:bg-primary/5 transition-colors">
              <span class="text-lg opacity-40 group-hover:opacity-100 transition-opacity">
                {{ ls.type === 'quiz' ? '📝' : ls.type === 'article' ? '📄' : '▶' }}
              </span>
              <span class="flex-1 group-hover:text-primary transition-colors">{{ ls.title }}</span>
              <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{{ ls.duration }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCourseStore } from '../stores/course'

const route = useRoute()
const router = useRouter()
const courseStore = useCourseStore()
const id = route.params.id as string

const course = ref<any>(null)
const loading = ref(true)
const openMod = ref<string | null>(null)
const enrolling = ref(false)

const isEnrolled = computed(() => courseStore.isEnrolled.value(id))
const includes = ['Full lifetime access to documentation', 'Verifiable certificate of completion', 'Advanced downloadable resources', 'Cross-platform mobile & desktop access', 'Direct Q&A support channel']

async function handleEnroll() {
  if (isEnrolled.value) { router.push(`/learn/${id}`); return }
  enrolling.value = true
  try {
    if (String(course.value?.price).toLowerCase() === 'free') await courseStore.enrollUser(id)
    else await courseStore.purchaseCourse(id)
    router.push(`/learn/${id}`)
  } catch (e: any) { alert(e.message) }
  finally { enrolling.value = false }
}

onMounted(async () => {
  loading.value = true
  course.value = await courseStore.fetchCourseById(id)
  if (!course.value) {
    course.value = courseStore.courses.find((c: any) => String(c.id) === id) || null
  }
  if (course.value?.modules?.length) openMod.value = course.value.modules[0].module_id
  loading.value = false
})
</script>

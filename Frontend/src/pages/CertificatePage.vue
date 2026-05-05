<template>
  <div>
    <div class="bg-mesh-dark py-10">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        <div>
          <h1 class="font-heading text-2xl font-bold text-white mb-1">Certificate of Completion</h1>
          <p class="text-gray-400 text-sm">{{ course?.title }}</p>
        </div>
        <div class="flex gap-3">
          <button @click="print" class="btn-outline border-white/20 text-white hover:bg-white/10 text-sm">🖨 Print</button>
          <button @click="share" class="btn-primary text-sm">🔗 Share</button>
        </div>
      </div>
    </div>

    <div class="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div v-if="loading" class="flex justify-center py-20">
        <div class="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>

      <!-- Certificate design -->
      <div v-else id="certificate" class="relative bg-white rounded-3xl shadow-2xl overflow-hidden mx-auto" style="max-width:720px;aspect-ratio:1.414/1;padding:3rem">
        <!-- Background decorations -->
        <div class="absolute inset-0 bg-gradient-to-br from-primary-50 to-accent-50 opacity-30" />
        <div class="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-primary to-accent" />
        <div class="absolute top-6 right-6 w-16 h-16 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20" />
        <div class="absolute bottom-6 left-12 w-10 h-10 rounded-full bg-accent/10 border border-accent/20" />

        <div class="relative h-full flex flex-col items-center justify-center text-center">
          <!-- Logo -->
          <div class="flex items-center gap-2 mb-6">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-black">◎</div>
            <span class="font-heading text-2xl font-black text-gray-900">Skill<span class="text-primary">Orbit</span></span>
          </div>

          <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Certificate of Completion</p>
          <h2 class="font-heading text-4xl font-extrabold text-gray-900 mb-1">{{ auth.user?.name || 'Learner' }}</h2>
          <p class="text-gray-500 text-sm mb-6">has successfully completed</p>

          <div class="bg-gradient-to-r from-primary to-accent text-white font-heading font-bold text-xl px-8 py-3 rounded-2xl mb-6 shadow-glow-primary">
            {{ course?.title || 'Course' }}
          </div>

          <div class="flex items-center gap-8 text-center mb-6">
            <div>
              <div class="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Completed</div>
              <div class="font-semibold text-gray-900 text-sm">{{ completedDate }}</div>
            </div>
            <div class="w-px h-8 bg-gray-200" />
            <div>
              <div class="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Instructor</div>
              <div class="font-semibold text-gray-900 text-sm">{{ course?.instructor || 'SkillOrbit Team' }}</div>
            </div>
            <div class="w-px h-8 bg-gray-200" />
            <div>
              <div class="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Certificate ID</div>
              <div class="font-mono text-xs text-primary font-bold">{{ certId }}</div>
            </div>
          </div>

          <!-- Signature line -->
          <div class="flex gap-12">
            <div class="text-center">
              <div class="h-px w-32 bg-gray-300 mb-1" />
              <div class="text-xs text-gray-400">SkillOrbit Platform</div>
            </div>
            <div class="text-center">
              <div class="h-px w-32 bg-gray-300 mb-1" />
              <div class="text-xs text-gray-400">{{ course?.instructor || 'Course Instructor' }}</div>
            </div>
          </div>
        </div>
      </div>

      <p class="text-center text-xs text-gray-400 mt-4">
        Verify this certificate at
        <a :href="`https://skillorbit.com/verify/${certId}`" class="text-primary hover:underline">skillorbit.com/verify/{{ certId }}</a>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useCourseStore } from '../stores/course'

const route = useRoute()
const auth = useAuthStore()
const courseStore = useCourseStore()
const courseId = route.params.courseId as string

const course = ref<any>(null)
const loading = ref(true)
const certId = computed(() => {
  const base = `${auth.user?.email || 'user'}-${courseId}`
  return btoa(base).replace(/[^A-Z0-9]/gi, '').slice(0, 12).toUpperCase()
})
const completedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

function print() { window.print() }
function share() {
  const url = `${window.location.origin}/verify/${certId.value}`
  navigator.clipboard?.writeText(url)
  alert('Certificate link copied to clipboard!')
}

onMounted(async () => {
  course.value = await courseStore.fetchCourseById(courseId)
  if (!course.value) course.value = courseStore.courses.find((c: any) => String(c.id) === courseId)
  loading.value = false
})
</script>

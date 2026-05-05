<template>
  <div>
    <div class="bg-mesh-dark py-14">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h1 class="font-heading text-4xl font-bold text-white mb-2">Search Results</h1>
        <p class="text-gray-400">{{ filtered.length }} result{{ filtered.length !== 1 ? 's' : '' }} for "<span class="text-white font-semibold">{{ q }}</span>"</p>
      </div>
    </div>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex gap-6">
      <!-- Filters -->
      <aside class="hidden lg:block w-52 shrink-0">
        <div class="card p-5 mb-4">
          <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Level</h3>
          <label v-for="l in LEVELS" :key="l" class="flex items-center gap-2 py-1.5 cursor-pointer">
            <input type="checkbox" :checked="levels.includes(l)" @change="toggle(l)" class="accent-primary w-4 h-4 rounded" />
            <span class="text-sm text-gray-700 dark:text-gray-300">{{ l }}</span>
          </label>
        </div>
        <div class="card p-5">
          <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Price</h3>
          <label class="flex items-center gap-2 py-1.5 cursor-pointer">
            <input type="checkbox" v-model="freeOnly" class="accent-primary w-4 h-4 rounded" />
            <span class="text-sm text-gray-700 dark:text-gray-300">Free only</span>
          </label>
        </div>
      </aside>

      <!-- Results -->
      <div class="flex-1 min-w-0">
        <div v-if="loading" class="space-y-4">
          <div class="skeleton h-28 rounded-2xl" v-for="i in 4" :key="i" />
        </div>
        <div v-else-if="!filtered.length" class="text-center py-20 text-gray-400">
          <div class="text-5xl mb-3">🔭</div>
          <p class="font-heading font-semibold text-gray-900 dark:text-white mb-1">No results found</p>
          <p class="text-sm">Try different keywords or browse all courses.</p>
          <RouterLink to="/courses" class="btn-primary mt-4 inline-block">Browse All Courses</RouterLink>
        </div>
        <div v-else class="space-y-4">
          <RouterLink v-for="c in filtered" :key="c.id" :to="`/courses/${c.id}`"
            class="card flex gap-5 p-4 hover:shadow-card-hover group">
            <div class="w-28 h-20 shrink-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center font-bold text-white text-sm overflow-hidden">
              <img v-if="c.thumbnail?.startsWith('http')" :src="c.thumbnail" class="w-full h-full object-cover" />
              <span v-else class="text-3xl">🎓</span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="badge-primary mb-1">{{ c.level }}</div>
              <div class="font-heading font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 mb-1">{{ c.title }}</div>
              <div class="text-xs text-gray-500 mb-2">by {{ c.instructor }}</div>
              <div class="flex items-center gap-3 text-xs text-gray-500">
                <span class="font-bold text-amber-500">★ {{ c.rating || 4.5 }}</span>
                <span>({{ Number(c.reviews || 0).toLocaleString() }})</span>
                <span v-if="c.duration">⏱ {{ c.duration }}</span>
              </div>
            </div>
            <div class="shrink-0 font-extrabold" :class="String(c.price).toLowerCase() === 'free' ? 'text-green-500' : 'text-gray-900 dark:text-white'">
              {{ String(c.price).toLowerCase() === 'free' ? 'Free' : `₹${c.price}` }}
            </div>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useCourseStore } from '../stores/course'

const route = useRoute()
const courseStore = useCourseStore()
const q = computed(() => (route.query.q as string) || '')
const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All Levels']
const levels = ref<string[]>([])
const freeOnly = ref(false)
const loading = computed(() => courseStore.loading)

function toggle(l: string) {
  const i = levels.value.indexOf(l)
  if (i >= 0) levels.value.splice(i, 1); else levels.value.push(l)
}

const filtered = computed(() =>
  courseStore.courses.filter((c: any) => {
    const qLower = q.value.toLowerCase()
    const matchesQ = !qLower || c.title?.toLowerCase().includes(qLower) || c.instructor?.toLowerCase().includes(qLower) || c.description?.toLowerCase().includes(qLower)
    const matchesLevel = !levels.value.length || levels.value.includes(c.level)
    const matchesFree = !freeOnly.value || String(c.price).toLowerCase() === 'free'
    return matchesQ && matchesLevel && matchesFree
  })
)
</script>

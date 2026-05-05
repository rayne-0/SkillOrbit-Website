<template>
  <div class="min-h-screen bg-[#F8F9FA] dark:bg-surface-950">
    <!-- Clean Professional Header -->
    <div class="bg-white dark:bg-surface-900 border-b border-gray-200 dark:border-white/5 py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <h1 class="text-5xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">Course Library</h1>
        <p class="text-lg text-gray-500 font-medium max-w-2xl">High-fidelity training modules designed for modern professional development.</p>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-12 flex flex-col lg:flex-row gap-12">
      <!-- Sidebar Filters -->
      <aside class="lg:w-64 shrink-0 space-y-8">
        <div class="relative group">
          <input v-model="searchQuery" type="text" placeholder="Search catalog…" 
                 class="w-full bg-white dark:bg-surface-900 border border-gray-200 dark:border-white/10 rounded-lg pl-11 pr-4 py-3 text-sm focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all outline-none" />
          <svg class="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>

        <div class="space-y-6">
          <div v-for="col in FILTER_SECTIONS" :key="col.title">
            <h3 class="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">{{ col.title }}</h3>
            <div class="space-y-3">
              <label v-for="opt in col.options" :key="opt" class="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" :value="opt" v-model="filters[col.key]" class="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20" />
                <span class="text-sm text-gray-600 dark:text-gray-400 group-hover:text-primary transition-colors font-medium">{{ opt }}</span>
              </label>
            </div>
          </div>
          
          <div class="pt-6 border-t border-gray-100 dark:border-white/5">
            <button @click="clearFilters" class="text-xs font-bold text-gray-400 hover:text-primary uppercase tracking-widest transition-colors">Reset All Filters</button>
          </div>
        </div>
      </aside>

      <!-- Main Results -->
      <main class="flex-1 min-w-0">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 pb-6 border-b border-gray-50 dark:border-white/5">
          <div class="text-sm text-gray-500 font-bold uppercase tracking-wider">
            Displaying <span class="text-gray-900 dark:text-white">{{ filteredCourses.length }}</span> Results
          </div>
          <div class="flex items-center gap-3">
            <span class="text-[11px] text-gray-400 font-bold uppercase tracking-widest">Sort By</span>
            <select v-model="sortBy" class="bg-transparent text-sm font-bold text-gray-900 dark:text-white border-none focus:ring-0 cursor-pointer hover:text-primary transition-colors">
              <option value="popular">Engagement</option>
              <option value="newest">Release Date</option>
              <option value="rating">Student Rating</option>
            </select>
          </div>
        </div>

        <!-- Course Grid -->
        <div v-if="courseStore.loading" class="grid sm:grid-cols-2 xl:grid-cols-3 gap-8">
          <div v-for="i in 6" :key="i" class="card h-[400px] animate-pulse bg-gray-100 dark:bg-white/5 border-none" />
        </div>
        
        <div v-else-if="!filteredCourses.length" class="card py-32 text-center flex flex-col items-center">
          <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-3xl mb-6">🔭</div>
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">No matching curriculum</h3>
          <p class="text-gray-500 max-w-sm mb-8">Try broadening your search or adjusting the filters to discover more opportunities.</p>
          <button @click="clearFilters" class="btn-primary px-10 py-3">Reset Search</button>
        </div>

        <div v-else class="grid sm:grid-cols-2 xl:grid-cols-3 gap-8">
          <RouterLink v-for="c in filteredCourses" :key="c.id" :to="`/courses/${c.id}`"
            class="card group flex flex-col bg-white overflow-hidden hover:border-primary/40 transition-all h-full">
            <div class="h-48 relative overflow-hidden bg-gray-100 shrink-0">
              <img v-if="c.thumbnail" :src="c.thumbnail" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
              <div v-else class="w-full h-full flex items-center justify-center text-5xl opacity-10">📚</div>
              <div v-if="c.bestseller" class="absolute top-4 left-4">
                <span class="bg-gray-900 text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest rounded-full">Top Seller</span>
              </div>
            </div>
            
            <div class="p-6 flex flex-col flex-1">
              <div class="flex items-center gap-2 mb-4">
                <span class="text-[10px] font-bold text-primary uppercase tracking-[0.15em]">{{ c.category || 'Professional' }}</span>
                <span class="w-1 h-1 bg-gray-200 rounded-full"></span>
                <span class="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">{{ c.level }}</span>
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 leading-tight group-hover:text-primary transition-colors">{{ c.title }}</h3>
              <p class="text-sm text-gray-500 font-medium mb-6">Instructor: {{ c.instructor || 'Staff' }}</p>
              
              <div class="mt-auto flex items-center justify-between pt-6 border-t border-gray-50 dark:border-white/5">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-bold text-amber-500">★ {{ c.rating || '4.8' }}</span>
                </div>
                <div class="text-xl font-black text-gray-900 dark:text-white">
                  {{ String(c.price).toLowerCase() === 'free' ? 'FREE' : `₹${c.price}` }}
                </div>
              </div>
            </div>
          </RouterLink>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { RouterLink } from 'vue-router'
import { useCourseStore } from '../stores/course'

const courseStore = useCourseStore()

const searchQuery = ref('')
const sortBy = ref('popular')
const filters = reactive({
  categories: [] as string[],
  levels: [] as string[],
})

const categories = computed(() => {
  const set = new Set(courseStore.courses.map(c => c.category || 'Professional').filter(Boolean))
  return Array.from(set).sort()
})

const levels = ['Beginner', 'Intermediate', 'Advanced', 'All Levels']

const FILTER_SECTIONS = computed(() => [
  { title: 'Specializations', key: 'categories', options: categories.value },
  { title: 'Expertise Level', key: 'levels', options: levels },
])

function clearFilters() {
  searchQuery.value = ''
  filters.categories = []
  filters.levels = []
}

const filteredCourses = computed(() => {
  let res = [...courseStore.courses]

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    res = res.filter(c => c.title?.toLowerCase().includes(q) || c.instructor?.toLowerCase().includes(q))
  }
  if (filters.categories.length) {
    res = res.filter(c => filters.categories.includes(c.category || 'Professional'))
  }
  if (filters.levels.length) {
    res = res.filter(c => filters.levels.includes(c.level || ''))
  }

  if (sortBy.value === 'rating') {
    res.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0))
  } else if (sortBy.value === 'newest') {
    res.sort((a, b) => Number(b.id) - Number(a.id))
  } else {
    res.sort((a, b) => (Number(b.students) || 0) - (Number(a.students) || 0))
  }

  return res
})
</script>

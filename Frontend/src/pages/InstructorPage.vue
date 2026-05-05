<template>
  <div>
    <div class="bg-mesh-dark py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center gap-8">
        <div class="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-extrabold text-4xl shadow-glow-primary">
          {{ name[0]?.toUpperCase() }}
        </div>
        <div>
          <h1 class="font-heading text-3xl font-bold text-white">{{ name }}</h1>
          <p class="text-gray-400 mt-1">Instructor at SkillOrbit</p>
          <div class="flex flex-wrap gap-5 mt-3 text-sm text-gray-400">
            <span>⭐ {{ avgRating.toFixed(1) }} avg rating</span>
            <span>· 👥 {{ totalStudents.toLocaleString() }} students</span>
            <span>· 📚 {{ instructorCourses.length }} courses</span>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <h2 class="font-heading text-xl font-bold text-gray-900 dark:text-white mb-6">Courses by {{ name }}</h2>
      <div v-if="courseStore.loading" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 3" :key="i" class="skeleton h-48 rounded-2xl" />
      </div>
      <div v-else-if="!instructorCourses.length" class="text-center py-20 text-gray-400">
        <p>No courses found for this instructor.</p>
      </div>
      <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <RouterLink v-for="c in instructorCourses" :key="c.id" :to="`/courses/${c.id}`"
          class="card overflow-hidden hover:shadow-card-hover group">
          <div class="h-36 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden">
            <img v-if="c.thumbnail?.startsWith('http')" :src="c.thumbnail" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            <span v-else class="text-5xl">🎓</span>
          </div>
          <div class="p-5">
            <span class="badge-primary mb-2 inline-block">{{ c.level }}</span>
            <h3 class="font-heading font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 mb-2">{{ c.title }}</h3>
            <div class="flex items-center justify-between text-xs text-gray-500">
              <span>⭐ {{ c.rating || 4.5 }}</span>
              <span :class="String(c.price).toLowerCase()==='free'?'text-green-500 font-bold':'font-bold text-gray-900 dark:text-white'">
                {{ String(c.price).toLowerCase()==='free'?'Free':`₹${c.price}` }}
              </span>
            </div>
          </div>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useCourseStore } from '../stores/course'

const route = useRoute()
const courseStore = useCourseStore()
const name = computed(() => decodeURIComponent(route.params.name as string))
const instructorCourses = computed(() => courseStore.courses.filter((c: any) => c.instructor?.toLowerCase() === name.value.toLowerCase()))
const avgRating = computed(() => {
  const rated = instructorCourses.value.filter((c: any) => c.rating)
  return rated.length ? rated.reduce((s: number, c: any) => s + (c.rating || 0), 0) / rated.length : 4.5
})
const totalStudents = computed(() => instructorCourses.value.reduce((s: number, c: any) => s + (parseInt(c.students) || 0), 0))
</script>

<template>
  <div class="max-w-7xl mx-auto py-6">
    <div class="flex items-end justify-between pb-6 border-b border-gray-100 dark:border-white/5 mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Mentor Management</h1>
        <p class="mt-1 text-sm text-gray-500">Manage your educational staff and their student assignments.</p>
      </div>
      <button class="btn-primary flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
        Add Mentor
      </button>
    </div>

    <div class="grid lg:grid-cols-2 gap-6">
      <div v-for="m in mentorStore.mentors" :key="m.id" 
           class="card flex gap-6 p-6 items-start group">
        <div class="relative shrink-0">
          <img :src="m.avatar" class="w-20 h-20 rounded-lg object-cover bg-gray-50 border border-gray-100 dark:border-white/10" />
          <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-surface-900 rounded-full"></div>
        </div>
        
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between mb-1">
            <h3 class="font-bold text-xl text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors">{{ m.name }}</h3>
            <button class="text-xs font-semibold text-gray-400 hover:text-primary tracking-wide uppercase">Edit</button>
          </div>
          <div class="flex items-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-400 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            {{ m.email }}
          </div>
          
          <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4 line-clamp-2">
            {{ m.bio }}
          </p>
          
          <div class="flex flex-wrap gap-2 mb-5">
            <span v-for="exp in m.expertise" :key="exp" class="badge-gray">
              {{ exp }}
            </span>
          </div>
          
          <div class="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-white/5">
            <div class="flex items-center gap-2 text-xs text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {{ m.schedule }}
            </div>
            <button class="text-xs font-bold text-primary hover:underline">View Students →</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMentorStore } from '../../stores/mentor'
const mentorStore = useMentorStore()
</script>

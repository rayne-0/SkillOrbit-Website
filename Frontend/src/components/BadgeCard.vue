<template>
  <div :class="['relative rounded-xl p-4 text-center border transition-all', badge.earned
    ? 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30'
    : 'bg-gray-100 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-60']"
    :title="badge.description">
    <div v-if="badge.earned" class="absolute top-2 right-2 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">✓</div>
    <div v-else class="absolute top-2 right-2 text-base">🔒</div>
    <div class="text-3xl mb-2">{{ badge.icon }}</div>
    <div class="text-xs font-bold text-gray-800 dark:text-gray-200 mb-1">{{ badge.name }}</div>
    <div class="text-xs text-gray-500 leading-tight">{{ badge.description }}</div>
  </div>
</template>

<script setup lang="ts">
interface Badge {
  id: string | number
  icon: string
  name: string
  description: string
  earned: boolean
}
defineProps<{ badge: Badge }>()
</script>

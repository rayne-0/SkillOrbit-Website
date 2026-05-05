<template>
  <div class="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1.5" :title="`${profile.xp} XP total — Level ${profile.level}`">
    <div class="text-xs font-bold text-primary bg-primary/10 rounded px-1.5 py-0.5 whitespace-nowrap">Lv {{ profile.level }}</div>
    <div class="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden xp-glow">
      <div class="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500" :style="{ width: `${pct}%` }" />
    </div>
    <div class="text-xs text-gray-400 whitespace-nowrap">{{ profile.xp }} XP</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGamificationStore, LEVEL_XP_THRESHOLDS } from '../stores/gamification'

const gamification = useGamificationStore()
const profile = computed(() => gamification.profile)

const pct = computed(() => {
  const { xp = 0, level = 1, next_level_xp, current_level_xp } = profile.value
  const levelXP = current_level_xp ?? LEVEL_XP_THRESHOLDS[level - 1] ?? 0
  const nextXP  = next_level_xp  ?? LEVEL_XP_THRESHOLDS[level]       ?? 100
  const range   = Math.max(nextXP - levelXP, 1)
  return Math.min(((xp - levelXP) / range) * 100, 100)
})
</script>

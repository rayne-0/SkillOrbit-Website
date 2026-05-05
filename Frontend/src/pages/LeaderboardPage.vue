<template>
  <div class="min-h-screen bg-[#F8F9FA] dark:bg-surface-950 pb-24">
    <!-- Professional Header -->
    <div class="bg-white dark:bg-surface-900 border-b border-gray-200 dark:border-white/5 py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 text-center">
        <h1 class="text-5xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">Global Ranking</h1>
        <p class="text-lg text-gray-500 font-medium max-w-2xl mx-auto">Real-time leadership board based on cumulative XP earned through platform activities.</p>
      </div>
    </div>

    <div class="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <!-- Podium - Elite Three -->
      <div v-if="!loading && topThree.length" class="flex items-end justify-center gap-8 mb-20 pt-10">
        <div v-for="(entry, i) in podium" :key="entry.name" 
             class="flex flex-col items-center group">
          <!-- User Initials Avatar -->
          <div :class="['w-16 h-16 rounded-xl flex items-center justify-center text-white font-black text-xl mb-4 transition-transform group-hover:scale-110 shadow-lg',
            i === 1 ? 'bg-primary scale-125' : 'bg-gray-400']">
            {{ entry.name?.[0]?.toUpperCase() }}
          </div>
          
          <div class="text-center">
            <div class="text-sm font-bold text-gray-900 dark:text-white">{{ entry.name?.split(' ')[0] }}</div>
            <div class="text-[10px] font-bold text-primary uppercase tracking-widest mt-0.5">{{ entry.xp.toLocaleString() }} XP</div>
          </div>

          <!-- Podium Block -->
          <div :class="['mt-6 rounded-t-lg flex items-center justify-center text-3xl transition-all',
            i === 1 ? 'w-24 h-32 bg-primary/5 border-x border-t border-primary/20' 
            : i === 0 ? 'w-24 h-24 bg-gray-50 dark:bg-white/5 border-x border-t border-gray-200 dark:border-white/10'
            : 'w-24 h-16 bg-gray-50 dark:bg-white/5 border-x border-t border-gray-200 dark:border-white/10']">
            {{ i === 1 ? '🥇' : i === 0 ? '🥈' : '🥉' }}
          </div>
        </div>
      </div>

      <!-- Current User Ranking Context -->
      <div v-if="selfRank" class="card p-6 mb-10 border-primary/30 bg-primary-50/30 dark:bg-primary/5 flex items-center gap-6">
        <div class="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-black italic text-lg shadow-lg">
          {{ selfRank.rank.replace('#', '') }}
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="font-bold text-gray-900 dark:text-white text-base">{{ selfRank.name }}</span>
            <span class="text-[10px] font-bold bg-primary text-white px-2 py-0.5 rounded uppercase tracking-widest">You</span>
          </div>
          <div class="text-xs text-gray-500 font-medium mt-1 uppercase tracking-wider">
            Level {{ selfRank.level }} · {{ selfRank.badges_count }} Badges · {{ selfRank.streak }} Day Streak
          </div>
        </div>
        <div class="text-right">
          <div class="text-xl font-black text-primary">{{ selfRank.xp.toLocaleString() }}</div>
          <div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cumulative XP</div>
        </div>
      </div>

      <!-- Complete Ranking Table -->
      <div class="card overflow-hidden bg-white shadow-xl border-none">
        <div class="px-8 py-6 border-b border-gray-50 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
          <h3 class="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Full Roster</h3>
        </div>
        
        <div v-if="loading" class="p-10 space-y-6">
          <div v-for="i in 5" :key="i" class="h-12 bg-gray-50 dark:bg-white/5 animate-pulse rounded-lg" />
        </div>
        
        <div v-else-if="!leaderboard.length" class="py-24 text-center">
          <div class="text-4xl mb-4">🏆</div>
          <p class="text-sm font-bold text-gray-400 uppercase tracking-widest">Awaiting Initial Participation</p>
        </div>

        <div v-else class="divide-y divide-gray-50 dark:divide-white/5">
          <div v-for="(entry, i) in leaderboard" :key="i"
            :class="['flex items-center gap-6 p-6 transition-colors hover:bg-gray-50/50 dark:hover:bg-white/5',
              i < 3 ? 'bg-primary-50/10 dark:bg-primary/5' : '']">
            
            <div class="w-10 text-center text-sm font-black italic text-gray-400">
              {{ i + 1 }}
            </div>
            
            <div class="w-10 h-10 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500 font-bold text-sm shrink-0">
              {{ entry.name?.[0]?.toUpperCase() }}
            </div>
            
            <div class="flex-1 min-w-0">
              <div class="font-bold text-gray-900 dark:text-white text-sm">{{ entry.name }}</div>
              <div class="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                Lvl {{ entry.level }} · {{ entry.streak }}🔥
              </div>
            </div>
            
            <div class="text-right shrink-0">
              <div class="font-black text-gray-900 dark:text-white">{{ Number(entry.xp).toLocaleString() }}</div>
              <div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">XP</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const leaderboard = ref<any[]>([])
const loading = ref(true)

const topThree = computed(() => leaderboard.value.slice(0, 3))
const podium = computed(() => {
  const t = topThree.value
  return t.length >= 3 ? [t[1], t[0], t[2]] : t 
})
const selfRank = computed(() => {
  if (!auth.user) return null
  const idx = leaderboard.value.findIndex(e => e.email === auth.user?.email)
  return idx >= 0 ? { ...leaderboard.value[idx], rank: `#${idx + 1}` } : null
})

onMounted(async () => {
  try {
    const res = await fetch('http://localhost:8000/api/gamification/leaderboard/')
    const data = await res.json()
    if (data.success) leaderboard.value = data.leaderboard
    else {
      // Mock data for display if API fails
      leaderboard.value = [
        { name: 'Linus Torvalds', xp: 45000, level: 85, badges_count: 42, streak: 120, email: 'linus@kernel.org' },
        { name: 'Margaret Hamilton', xp: 42000, level: 82, badges_count: 38, streak: 95, email: 'margaret@apollo.gov' },
        { name: 'Alan Turing', xp: 38000, level: 78, badges_count: 35, streak: 80, email: 'alan@bletchley.uk' },
        { name: 'Ada Lovelace', xp: 35000, level: 75, badges_count: 30, streak: 72, email: 'ada@computing.io' },
        { name: 'Grace Hopper', xp: 32000, level: 70, badges_count: 28, streak: 65, email: 'grace@cobol.navy' },
      ]
    }
  } catch {
     // Mock data for display
     leaderboard.value = [
        { name: 'Linus Torvalds', xp: 45000, level: 85, badges_count: 42, streak: 120, email: 'linus@kernel.org' },
        { name: 'Margaret Hamilton', xp: 42000, level: 82, badges_count: 38, streak: 95, email: 'margaret@apollo.gov' },
        { name: 'Alan Turing', xp: 38000, level: 78, badges_count: 35, streak: 80, email: 'alan@bletchley.uk' },
        { name: 'Ada Lovelace', xp: 35000, level: 75, badges_count: 30, streak: 72, email: 'ada@computing.io' },
        { name: 'Grace Hopper', xp: 32000, level: 70, badges_count: 28, streak: 65, email: 'grace@cobol.navy' },
      ]
  }
  finally { loading.value = false }
})
</script>

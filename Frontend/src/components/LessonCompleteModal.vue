<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Lesson complete">
    <!-- Confetti -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div v-for="p in confettiPieces" :key="p.id" class="confetti-piece absolute"
        :style="{ left: p.left, width: p.width, height: p.height, background: p.color,
          borderRadius: p.borderRadius, animationDelay: p.delay, animationDuration: p.duration }" />
    </div>

    <div class="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
      <div class="text-6xl mb-3">🏆</div>
      <h2 class="text-2xl font-extrabold text-gray-900 dark:text-white mb-1">Lesson Complete!</h2>
      <p class="text-gray-500 dark:text-gray-400 mb-6">"{{ lessonTitle }}" — well done! 🎉</p>

      <!-- Stats -->
      <div class="flex justify-center gap-4 mb-6">
        <div class="flex-1 bg-orange-50 dark:bg-orange-900/20 rounded-xl p-3">
          <div class="text-xl font-extrabold text-orange-500">+{{ xpEarned }} XP</div>
          <div class="text-xs text-gray-500 dark:text-gray-400">Earned</div>
        </div>
        <div class="flex-1 bg-green-50 dark:bg-green-900/20 rounded-xl p-3">
          <div class="text-xl font-extrabold text-green-500">{{ totalXP }} XP</div>
          <div class="text-xs text-gray-500 dark:text-gray-400">Total XP</div>
        </div>
        <div class="flex-1 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
          <div class="text-xl font-extrabold text-blue-500">{{ streak }}🔥</div>
          <div class="text-xs text-gray-500 dark:text-gray-400">Day Streak</div>
        </div>
      </div>

      <!-- Level up banner -->
      <div v-if="leveledUp" class="bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-xl px-4 py-3 mb-4 font-bold text-sm">
        🌟 Level Up! You reached <strong>Level {{ newLevel }}</strong>!
      </div>

      <!-- New badges -->
      <div v-if="newBadges.length > 0" class="flex flex-wrap gap-2 justify-center mb-4">
        <div v-for="(b, i) in newBadges" :key="i"
          class="flex items-center gap-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-full px-3 py-1 text-sm text-purple-700 dark:text-purple-300 font-semibold">
          <span>{{ b.icon }}</span><span>{{ b.name }}</span>
        </div>
      </div>

      <!-- Countdown -->
      <div v-if="onNext && !cancelled" class="mb-4">
        <div class="text-sm text-gray-500 mb-1">Next lesson in {{ secondsLeft }}s…</div>
        <div class="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div class="h-full bg-primary rounded-full transition-all" :style="{ width: `${pct}%` }" />
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-3 justify-center">
        <button v-if="!cancelled" @click="handleStay"
          class="flex-1 px-5 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          Stay Here
        </button>
        <button v-else @click="$emit('stay')"
          class="flex-1 px-5 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          Continue Studying
        </button>
        <button v-if="onNext" @click="$emit('next')"
          class="flex-1 px-5 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors">
          Next Lesson →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Badge { icon: string; name: string }

const props = withDefaults(defineProps<{
  lessonTitle?: string
  xpEarned?: number
  newLevel?: number | null
  oldLevel?: number | null
  newBadges?: Badge[]
  totalXP?: number
  streak?: number
  onNext?: (() => void) | null
  onStay?: (() => void) | null
}>(), {
  lessonTitle: 'Lesson',
  xpEarned: 50,
  newLevel: null,
  oldLevel: null,
  newBadges: () => [],
  totalXP: 0,
  streak: 0,
  onNext: null,
  onStay: null,
})

defineEmits<{ next: []; stay: [] }>()

const COUNTDOWN_SECS = 5
const secondsLeft = ref(COUNTDOWN_SECS)
const cancelled = ref(!props.onNext)
let timer: ReturnType<typeof setInterval> | null = null

const leveledUp = computed(() => props.newLevel && props.oldLevel && props.newLevel > props.oldLevel)
const pct = computed(() => ((COUNTDOWN_SECS - secondsLeft.value) / COUNTDOWN_SECS) * 100)

function handleStay() {
  if (timer) clearInterval(timer)
  cancelled.value = true
  props.onStay?.()
}

onMounted(() => {
  if (cancelled.value || !props.onNext) return
  timer = setInterval(() => {
    secondsLeft.value--
    if (secondsLeft.value <= 0) {
      clearInterval(timer!)
      props.onNext?.()
    }
  }, 1000)
})

onUnmounted(() => { if (timer) clearInterval(timer) })

const CONFETTI_COLORS = ['#FFD700','#FF6B6B','#4ECDC4','#A78BFA','#34D399','#F472B6','#60A5FA','#FB923C','#FBBF24']
const confettiPieces = Array.from({ length: 45 }, (_, i) => ({
  id: i,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  left: `${(i / 45) * 100 + Math.random() * 2}%`,
  width: `${6 + Math.random() * 8}px`,
  height: `${8 + Math.random() * 10}px`,
  delay: `${Math.random() * 2}s`,
  duration: `${2 + Math.random() * 2}s`,
  borderRadius: Math.random() > 0.5 ? '50%' : '2px',
}))
</script>

<template>
  <!-- Quiz Completed -->
  <div v-if="state === 'results'" class="animate-slide-up">
    <div class="text-center mb-8">
      <div :class="['w-24 h-24 rounded-full flex items-center justify-center text-5xl mx-auto mb-4',
        passed ? 'bg-green-500/15 ring-4 ring-green-500/30' : 'bg-red-500/15 ring-4 ring-red-500/30']">
        {{ passed ? '🏆' : '📚' }}
      </div>
      <h2 class="font-heading text-2xl font-bold text-white mb-1">
        {{ passed ? 'Excellent Work!' : 'Keep Learning!' }}
      </h2>
      <p class="text-gray-400 text-sm mb-6">
        {{ passed ? 'You passed the quiz.' : `You need ${props.passingScore}% to pass. Try again!` }}
      </p>
      <!-- Score circle -->
      <div class="relative w-32 h-32 mx-auto mb-6">
        <svg class="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="10"/>
          <circle cx="60" cy="60" r="52" fill="none"
            :stroke="passed ? '#10b981' : '#ef4444'" stroke-width="10"
            stroke-linecap="round"
            :stroke-dasharray="`${scorePct * 3.267} 326.7`"
            style="transition: stroke-dasharray 1s ease" />
        </svg>
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <span class="text-3xl font-extrabold text-white">{{ scoreDisplay }}%</span>
          <span class="text-xs text-gray-400">{{ score }}/{{ maxScore }} pts</span>
        </div>
      </div>
      <!-- XP earned -->
      <div v-if="xpEarned" class="inline-flex items-center gap-2 bg-accent/15 border border-accent/30 text-accent rounded-full px-5 py-2 text-sm font-semibold mb-6">
        <span class="text-lg">⚡</span> +{{ xpEarned }} XP earned!
      </div>
    </div>

    <!-- Question breakdown -->
    <div class="space-y-3 mb-6">
      <div v-for="(result, i) in results" :key="i"
        :class="['rounded-xl border-2 p-4', result.correct ? 'border-green-500/40 bg-green-500/5' : 'border-red-400/40 bg-red-500/5']">
        <div class="flex items-start gap-3 mb-2">
          <span :class="['text-lg flex-shrink-0 mt-0.5', result.correct ? 'text-green-400' : 'text-red-400']">
            {{ result.correct ? '✓' : '✗' }}
          </span>
          <div class="flex-1">
            <p class="text-sm font-semibold text-white">{{ result.question }}</p>
            <p class="text-xs text-gray-400 mt-1">
              Your answer: <span :class="result.correct ? 'text-green-400' : 'text-red-400'">{{ result.your_answer }}</span>
              <template v-if="!result.correct"> · Correct: <span class="text-green-400">{{ result.correct_answer }}</span></template>
            </p>
            <p v-if="result.explanation" class="text-xs text-gray-500 mt-1.5 italic">{{ result.explanation }}</p>
          </div>
          <span class="text-xs text-gray-500 flex-shrink-0">{{ result.points_earned }}/{{ result.points }}</span>
        </div>
      </div>
    </div>

    <div class="flex gap-3">
      <button v-if="!passed" @click="retake" class="flex-1 btn-outline py-3">
        ↺ Retake Quiz
      </button>
      <button @click="emit('complete', { passed, score, maxScore })" class="flex-1 btn-primary py-3">
        {{ passed ? 'Continue →' : 'Review & Continue' }}
      </button>
    </div>
  </div>

  <!-- Quiz in progress -->
  <div v-else>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="font-heading text-lg font-bold text-white">{{ props.title }}</h2>
        <p class="text-xs text-gray-400 mt-0.5">
          Question {{ currentIdx + 1 }} of {{ questions.length }}
          · {{ totalPoints }} points total
          · Passing: {{ props.passingScore }}%
        </p>
      </div>
      <div v-if="timeLeft !== null" :class="['text-sm font-mono font-bold px-3 py-1.5 rounded-lg',
        timeLeft < 60 ? 'bg-red-500/15 text-red-400' : 'bg-white/5 text-gray-300']">
        {{ formatTime(timeLeft) }}
      </div>
    </div>

    <!-- Progress bar -->
    <div class="progress-bar mb-6">
      <div class="progress-fill" :style="{ width: `${((currentIdx) / questions.length) * 100}%` }" />
    </div>

    <!-- Question -->
    <div v-if="currentQ" class="slide-up-fade">
      <div class="bg-white/5 border border-white/10 rounded-2xl p-6 mb-5">
        <div class="flex items-start gap-3">
          <span class="w-7 h-7 rounded-full bg-primary/20 text-primary text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
            {{ currentIdx + 1 }}
          </span>
          <div class="flex-1">
            <p class="text-white font-medium leading-relaxed">{{ currentQ.text }}</p>
            <div class="flex items-center gap-3 mt-2">
              <span class="badge-primary capitalize">{{ currentQ.type === 'mcq' ? 'Single Choice' : currentQ.type === 'multi' ? 'Multi Select' : currentQ.type === 'truefalse' ? 'True / False' : 'Short Answer' }}</span>
              <span class="text-xs text-gray-500">{{ currentQ.points }} {{ currentQ.points === 1 ? 'point' : 'points' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- MCQ options -->
      <div v-if="currentQ.type === 'mcq' || currentQ.type === 'truefalse'" class="space-y-3">
        <button v-for="(opt, oi) in (currentQ.type === 'truefalse' ? ['True', 'False'] : currentQ.options || [])"
          :key="oi" @click="selectAnswer(opt)"
          :class="['quiz-option', answers[currentQ.id] === opt ? 'selected' : '']">
          <div class="flex items-center gap-3">
            <div :class="['w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
              answers[currentQ.id] === opt ? 'border-primary bg-primary' : 'border-gray-500']">
              <div v-if="answers[currentQ.id] === opt" class="w-2.5 h-2.5 rounded-full bg-white" />
            </div>
            <span class="text-sm text-gray-200">{{ opt }}</span>
          </div>
        </button>
      </div>

      <!-- Multi-select -->
      <div v-else-if="currentQ.type === 'multi'" class="space-y-3">
        <p class="text-xs text-gray-500 mb-3">Select all that apply.</p>
        <button v-for="(opt, oi) in (currentQ.options || [])"
          :key="oi" @click="toggleMulti(opt)"
          :class="['quiz-option', multiAnswers.includes(opt) ? 'selected' : '']">
          <div class="flex items-center gap-3">
            <div :class="['w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0',
              multiAnswers.includes(opt) ? 'border-primary bg-primary' : 'border-gray-500']">
              <svg v-if="multiAnswers.includes(opt)" class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <span class="text-sm text-gray-200">{{ opt }}</span>
          </div>
        </button>
      </div>

      <!-- Short answer -->
      <div v-else-if="currentQ.type === 'short'">
        <textarea v-model="shortAnswer" rows="4" placeholder="Type your answer here…"
          class="input text-sm resize-none dark:bg-white/5 dark:text-white dark:border-white/10" />
      </div>

      <!-- Nav -->
      <div class="flex items-center justify-between mt-6">
        <button v-if="currentIdx > 0" @click="currentIdx--" class="btn-ghost text-sm">
          ← Previous
        </button>
        <span v-else />
        <button @click="handleNext" :disabled="!canProceed"
          class="btn-primary text-sm disabled:opacity-40 disabled:cursor-not-allowed">
          {{ currentIdx < questions.length - 1 ? 'Next →' : 'Submit Quiz' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { QuizQuestion } from '../stores/course'

const props = withDefaults(defineProps<{
  title: string
  questions: QuizQuestion[]
  passingScore?: number
  timeLimitSeconds?: number
  courseId: string
  lessonId: string
}>(), { passingScore: 70 })
const emit = defineEmits<{ complete: [result: any] }>()

type State = 'quiz' | 'results'
const state      = ref<State>('quiz')
const currentIdx = ref(0)
const answers    = ref<Record<string, any>>({})
const multiAnswers = ref<string[]>([])
const shortAnswer  = ref('')
const results      = ref<any[]>([])
const score        = ref(0)
const maxScore     = ref(0)
const xpEarned     = ref(0)
const timeLeft     = ref<number | null>(props.timeLimitSeconds ?? null)
let timer: ReturnType<typeof setInterval> | null = null

const questions   = computed(() => props.questions || [])
const currentQ    = computed(() => questions.value[currentIdx.value])
const totalPoints = computed(() => questions.value.reduce((s, q) => s + (q.points || 1), 0))
const scorePct    = computed(() => maxScore.value ? Math.round((score.value / maxScore.value) * 100) : 0)
const scoreDisplay = computed(() => scorePct.value)
const passed      = computed(() => scorePct.value >= (props.passingScore ?? 70))

const canProceed = computed(() => {
  if (!currentQ.value) return false
  const q = currentQ.value
  if (q.type === 'multi') return multiAnswers.value.length > 0
  if (q.type === 'short') return shortAnswer.value.trim().length > 0
  return !!answers.value[q.id]
})

function formatTime(s: number) {
  const m = Math.floor(s / 60); const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
}

function selectAnswer(opt: string) { if (currentQ.value) answers.value[currentQ.value.id] = opt }
function toggleMulti(opt: string) {
  const idx = multiAnswers.value.indexOf(opt)
  if (idx >= 0) multiAnswers.value.splice(idx, 1)
  else multiAnswers.value.push(opt)
}

function handleNext() {
  if (!currentQ.value) return
  // Save current answer
  const q = currentQ.value
  if (q.type === 'multi') answers.value[q.id] = [...multiAnswers.value]
  else if (q.type === 'short') answers.value[q.id] = shortAnswer.value.trim()
  // Reset multi/short for next
  multiAnswers.value = []
  shortAnswer.value = ''

  if (currentIdx.value < questions.value.length - 1) {
    currentIdx.value++
    // Restore multi answers if going back
    const nextQ = questions.value[currentIdx.value]
    if (nextQ.type === 'multi' && Array.isArray(answers.value[nextQ.id]))
      multiAnswers.value = [...answers.value[nextQ.id]]
    if (nextQ.type === 'short') shortAnswer.value = answers.value[nextQ.id] || ''
  } else {
    gradeQuiz()
  }
}

function gradeQuiz() {
  if (timer) clearInterval(timer)
  // Local grading (server grading will override if available)
  let s = 0; let mx = 0
  const res: any[] = []
  for (const q of questions.value) {
    const userAns = answers.value[q.id]
    mx += q.points
    let correct = false
    let correct_answer = ''
    if (q.type === 'multi') {
      const ca = Array.isArray(q.correct_answer) ? q.correct_answer : []
      const ua = Array.isArray(userAns) ? userAns : []
      correct = ca.length === ua.length && ca.every(a => ua.includes(a))
      correct_answer = ca.join(', ')
    } else {
      correct_answer = Array.isArray(q.correct_answer) ? q.correct_answer[0] : (q.correct_answer || '')
      correct = (userAns || '').toString().toLowerCase().trim() === correct_answer.toLowerCase().trim()
    }
    if (correct) s += q.points
    res.push({
      question: q.text,
      your_answer: Array.isArray(userAns) ? userAns.join(', ') : userAns,
      correct_answer,
      correct,
      points: q.points,
      points_earned: correct ? q.points : 0,
      explanation: q.explanation,
    })
  }
  score.value = s; maxScore.value = mx; results.value = res
  xpEarned.value = Math.round((s / Math.max(mx, 1)) * 50)
  state.value = 'results'
}

function retake() {
  answers.value = {}; multiAnswers.value = []; shortAnswer.value = ''
  currentIdx.value = 0; state.value = 'quiz'
  if (props.timeLimitSeconds) {
    timeLeft.value = props.timeLimitSeconds
    startTimer()
  }
}

function startTimer() {
  if (!props.timeLimitSeconds) return
  timer = setInterval(() => {
    if (timeLeft.value === null || timeLeft.value <= 0) { clearInterval(timer!); gradeQuiz(); return }
    timeLeft.value--
  }, 1000)
}

onMounted(startTimer)
onUnmounted(() => { if (timer) clearInterval(timer) })
</script>

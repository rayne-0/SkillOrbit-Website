<template>
  <div>
    <!-- Floating toggle button -->
    <button @click="open = !open"
      :class="['fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-2xl transition-all',
        open ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gradient-to-br from-primary to-accent hover:scale-110']"
      :title="open ? 'Close AI Mentor' : 'Open AI Mentor'" aria-label="Toggle AI Mentor">
      {{ open ? '✕' : '🤖' }}
    </button>

    <!-- Chat panel -->
    <div :class="['fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-gray-900 rounded-2xl shadow-2xl border border-white/10 flex flex-col transition-all overflow-hidden',
      open ? 'max-h-[520px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none']"
      style="transition: max-height 0.3s ease, opacity 0.2s ease"
      role="dialog" aria-label="AI Mentor Chat">

      <!-- Header -->
      <div class="flex items-center gap-3 p-4 border-b border-white/10 bg-gradient-to-r from-primary/20 to-accent/20">
        <div class="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-lg">🤖</div>
        <div class="flex-1 min-w-0">
          <div class="text-sm font-bold text-white">SkillOrbit AI Mentor</div>
          <div class="text-xs text-green-400">Online — Ready to help</div>
        </div>
        <div class="text-xs bg-white/10 text-gray-300 rounded-full px-2 py-0.5 truncate max-w-24" :title="lessonTitle">{{ lessonTitle }}</div>
      </div>

      <!-- Quick actions -->
      <div class="flex gap-1.5 p-3 border-b border-white/5 flex-wrap">
        <button v-for="a in QUICK_ACTIONS" :key="a.label"
          @click="sendMessage(a.message)" :disabled="loading"
          class="text-xs px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors disabled:opacity-50">
          {{ a.label }}
        </button>
      </div>

      <!-- Messages -->
      <div class="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        <div v-for="msg in messages" :key="msg.id"
          :class="['flex gap-2.5', msg.role === 'user' ? 'flex-row-reverse' : '']">
          <div class="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 bg-white/10">
            {{ msg.role === 'assistant' ? '🤖' : '👤' }}
          </div>
          <div :class="['max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed',
            msg.role === 'assistant'
              ? 'bg-white/5 text-gray-200 rounded-tl-sm'
              : 'bg-primary text-white rounded-tr-sm']">
            <span v-html="renderMarkdown(msg.content)" />
          </div>
        </div>

        <!-- Typing indicator -->
        <div v-if="loading" class="flex gap-2.5">
          <div class="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-sm">🤖</div>
          <div class="bg-white/5 rounded-2xl rounded-tl-sm px-3 py-2.5 flex gap-1">
            <span v-for="i in 3" :key="i"
              :class="['w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce']"
              :style="{ animationDelay: `${(i - 1) * 0.15}s` }" />
          </div>
        </div>
        <div ref="messagesEnd" />
      </div>

      <!-- Input -->
      <div class="p-3 border-t border-white/5 flex gap-2">
        <textarea ref="inputRef" v-model="input" rows="1"
          @keydown.enter.exact.prevent="sendMessage(input)"
          placeholder="Ask your AI mentor anything…" :disabled="loading"
          class="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-200 placeholder-gray-600 outline-none resize-none focus:border-primary/50 transition-colors disabled:opacity-50" />
        <button @click="sendMessage(input)" :disabled="loading || !input.trim()"
          class="w-9 h-9 rounded-xl bg-primary hover:bg-primary/90 flex items-center justify-center text-white transition-colors disabled:opacity-50 flex-shrink-0">
          ➤
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

const props = defineProps<{
  lessonTitle?: string
  lessonOverview?: string
}>()

const API_BASE = 'http://localhost:8000'

const QUICK_ACTIONS = [
  { label: '📝 Quiz Me', message: 'Quiz me on this lesson topic' },
  { label: '💡 Explain This', message: 'Explain this lesson in simple terms' },
  { label: '🔍 Give a Hint', message: 'Give me a hint to understand this better' },
  { label: '🔗 Real-World Example', message: 'Give me a real-world example of this concept' },
]

const WELCOME_MSG = {
  id: 'welcome',
  role: 'assistant' as const,
  content: "👋 Hi! I'm your **AI Mentor** for this lesson. I can explain concepts, quiz you, or give hints. What would you like to explore?",
}

const open = ref(false)
const messages = ref([WELCOME_MSG])
const input = ref('')
const loading = ref(false)
const messagesEnd = ref<HTMLElement>()
const inputRef = ref<HTMLTextAreaElement>()

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>')
}

function getTokens() {
  try { const s = localStorage.getItem('skillorbit_tokens'); return s ? JSON.parse(s) : null }
  catch { return null }
}

async function sendMessage(text: string) {
  const trimmed = text.trim()
  if (!trimmed || loading.value) return

  messages.value.push({ id: String(Date.now()), role: 'user', content: trimmed })
  input.value = ''
  loading.value = true
  await nextTick(); messagesEnd.value?.scrollIntoView({ behavior: 'smooth' })

  const history = messages.value
    .filter(m => m.id !== 'welcome')
    .map(m => ({ role: m.role, content: m.content }))

  try {
    const tokens = getTokens()
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (tokens?.access) headers['Authorization'] = `Bearer ${tokens.access}`

    const res = await fetch(`${API_BASE}/api/chatbot/chat/`, {
      method: 'POST', headers,
      body: JSON.stringify({
        message: trimmed,
        lesson_title: props.lessonTitle || 'this lesson',
        lesson_overview: props.lessonOverview || '',
        history,
      }),
    })
    const data = await res.json()
    if (data.success) {
      messages.value.push({ id: String(Date.now() + 1), role: 'assistant', content: data.reply })
    } else throw new Error(data.error)
  } catch {
    messages.value.push({
      id: String(Date.now() + 1), role: 'assistant',
      content: "Sorry, I'm having trouble connecting right now. Please try again! 🔄",
    })
  } finally {
    loading.value = false
    await nextTick(); messagesEnd.value?.scrollIntoView({ behavior: 'smooth' })
  }
}

watch(open, (val) => {
  if (val) nextTick(() => inputRef.value?.focus())
})
</script>

<template>
  <div class="mentor-chat-panel fixed inset-0 z-50 flex" @click.self="emit('close')">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="emit('close')" />

    <!-- Chat Drawer -->
    <div class="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-surface-900 shadow-2xl flex flex-col">
      <!-- Header -->
      <div class="flex items-center gap-4 p-5 border-b border-gray-100 dark:border-white/5 shrink-0">
        <div class="relative">
          <img v-if="mentor?.avatar" :src="mentor.avatar" class="w-11 h-11 rounded-full object-cover border-2 border-primary/20" />
          <div v-else class="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
            {{ mentor?.name?.[0] ?? 'M' }}
          </div>
          <span class="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-surface-900" />
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="font-bold text-gray-900 dark:text-white truncate">{{ mentor?.name ?? 'Your Mentor' }}</h3>
          <p class="text-xs text-green-500 font-semibold">● Online</p>
        </div>
        <button @click="emit('close')" class="w-9 h-9 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
          ✕
        </button>
      </div>

      <!-- Messages -->
      <div ref="chatBody" class="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50 dark:bg-surface-950">
        <!-- Date separator -->
        <div class="flex items-center gap-3 my-2">
          <div class="flex-1 h-px bg-gray-200 dark:bg-white/5" />
          <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Today</span>
          <div class="flex-1 h-px bg-gray-200 dark:bg-white/5" />
        </div>

        <!-- Mentor's intro message -->
        <div class="flex items-end gap-3 group">
          <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0 mb-1">
            {{ mentor?.name?.[0] ?? 'M' }}
          </div>
          <div class="max-w-[80%]">
            <div class="bg-white dark:bg-surface-900 rounded-2xl rounded-bl-none px-4 py-3 text-sm text-gray-700 dark:text-gray-200 shadow-sm border border-gray-100 dark:border-white/5 leading-relaxed">
              Hi! I'm {{ mentor?.name ?? 'your mentor' }}. Feel free to ask me anything about your courses, assignments, or career goals. I'm here to help! 🎓
            </div>
            <p class="text-[10px] text-gray-400 mt-1 ml-1">{{ mentor?.name?.split(' ')[0] }} · just now</p>
          </div>
        </div>

        <!-- Dynamic messages -->
        <div v-for="(msg, i) in messages" :key="i"
             :class="['flex items-end gap-3', msg.from === 'user' ? 'flex-row-reverse' : '']">
          <div :class="['w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 mb-1',
                         msg.from === 'user' ? 'bg-primary text-white' : 'bg-primary/10 text-primary']">
            {{ msg.from === 'user' ? auth.user?.name?.[0]?.toUpperCase() : mentor?.name?.[0] }}
          </div>
          <div :class="['max-w-[80%]', msg.from === 'user' ? 'items-end' : '']">
            <div :class="['rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm',
                           msg.from === 'user'
                             ? 'bg-primary text-white rounded-br-none shadow-primary/20'
                             : 'bg-white dark:bg-surface-900 text-gray-700 dark:text-gray-200 rounded-bl-none border border-gray-100 dark:border-white/5']">
              {{ msg.text }}
            </div>
            <p :class="['text-[10px] text-gray-400 mt-1', msg.from === 'user' ? 'text-right mr-1' : 'ml-1']">
              {{ msg.from === 'user' ? 'You' : mentor?.name?.split(' ')[0] }} · {{ msg.time }}
            </p>
          </div>
        </div>

        <!-- Typing indicator -->
        <div v-if="mentorTyping" class="flex items-end gap-3">
          <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
            {{ mentor?.name?.[0] ?? 'M' }}
          </div>
          <div class="bg-white dark:bg-surface-900 rounded-2xl rounded-bl-none px-5 py-4 shadow-sm border border-gray-100 dark:border-white/5">
            <div class="flex gap-1.5 items-center h-4">
              <span v-for="n in 3" :key="n" class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    :style="{ animationDelay: `${(n-1) * 0.15}s` }" />
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Replies -->
      <div class="px-5 pt-3 pb-2 shrink-0">
        <div class="flex flex-wrap gap-2">
          <button v-for="q in quickReplies" :key="q" @click="sendQuickReply(q)"
                  class="text-xs font-medium px-3 py-1.5 rounded-full border border-primary/30 text-primary hover:bg-primary hover:text-white transition-all">
            {{ q }}
          </button>
        </div>
      </div>

      <!-- Input Area -->
      <div class="p-4 border-t border-gray-100 dark:border-white/5 shrink-0 bg-white dark:bg-surface-900">
        <div class="flex items-end gap-3">
          <div class="flex-1 relative">
            <textarea
              v-model="newMessage"
              @keydown.enter.exact.prevent="sendMessage"
              placeholder="Type a message… (Enter to send)"
              rows="1"
              class="w-full px-4 py-3 bg-gray-50 dark:bg-surface-950 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              style="min-height: 44px; max-height: 120px;"
              @input="autoResize"
            />
          </div>
          <button @click="sendMessage" :disabled="!newMessage.trim()"
                  class="w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center shadow-md shadow-primary/25 hover:bg-primary-600 transition-all disabled:opacity-40 shrink-0">
            <svg class="w-5 h-5 rotate-45" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
            </svg>
          </button>
        </div>
        <p class="text-[10px] text-gray-400 mt-2 text-center">Messages are delivered to your mentor. Response times may vary.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'

const props = defineProps<{
  mentor: { name: string; avatar?: string; expertise?: string[] } | null
}>()

const emit = defineEmits<{ close: [] }>()

const auth = useAuthStore()
const chatBody = ref<HTMLElement | null>(null)
const newMessage = ref('')
const mentorTyping = ref(false)

interface Message {
  from: 'user' | 'mentor'
  text: string
  time: string
}

const messages = ref<Message[]>([])

const quickReplies = [
  'When is the next session?',
  'I need help with my assignment',
  'Can we schedule a call?',
  'Thank you! 🙏',
]

const mentorReplies = [
  "Great question! Let me check my schedule and get back to you shortly.",
  "I'll review your assignment and provide feedback by tomorrow.",
  "Sure! I'm available Monday–Friday, 10 AM to 6 PM. Does that work?",
  "You're doing great! Keep up the momentum. 💪",
  "For that topic, I'd recommend revisiting module 3. The concepts are closely related.",
  "Feel free to ask anytime. I'm here to help you succeed!",
]

function now() {
  return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

async function sendMessage() {
  const text = newMessage.value.trim()
  if (!text) return

  messages.value.push({ from: 'user', text, time: now() })
  newMessage.value = ''
  scrollBottom()

  // Simulate mentor typing
  mentorTyping.value = true
  await new Promise(r => setTimeout(r, 1200 + Math.random() * 1000))
  mentorTyping.value = false

  const reply = mentorReplies[Math.floor(Math.random() * mentorReplies.length)]
  messages.value.push({ from: 'mentor', text: reply, time: now() })
  scrollBottom()
}

function sendQuickReply(text: string) {
  newMessage.value = text
  sendMessage()
}

function autoResize(e: Event) {
  const el = e.target as HTMLTextAreaElement
  el.style.height = 'auto'
  el.style.height = `${Math.min(el.scrollHeight, 120)}px`
}

async function scrollBottom() {
  await nextTick()
  if (chatBody.value) {
    chatBody.value.scrollTop = chatBody.value.scrollHeight
  }
}

onMounted(scrollBottom)
</script>

<template>
  <div class="min-h-screen relative flex items-center justify-center p-6 bg-[#F8F9FA] dark:bg-surface-950 overflow-hidden">
    <!-- Professional Abstract Background -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -mr-48 -mt-48" />
      <div class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] -ml-24 -mb-24" />
    </div>

    <!-- Minimal Back Navigation -->
    <RouterLink to="/" class="absolute top-8 left-8 flex items-center gap-3 text-[10px] font-bold text-gray-400 hover:text-primary transition-all z-20 uppercase tracking-[0.2em] group">
      <span class="group-hover:-translate-x-1 transition-transform">←</span> Return to Platform
    </RouterLink>

    <div class="w-full max-w-md z-10 animate-fade-up">
      <div class="card p-10 sm:p-12 bg-white shadow-2xl border-none relative overflow-hidden">
        <!-- Technical Accent -->
        <div class="absolute top-0 left-0 w-full h-1.5 bg-primary/10" />

        <div class="text-center mb-10">
          <div class="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white font-black text-2xl mx-auto mb-8 shadow-xl shadow-primary/20">◎</div>
          <h1 class="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-3">
            {{ isLogin ? 'Authenticate Account' : 'Initialize Registration' }}
          </h1>
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed px-4">
            {{ isLogin ? 'Access your personalized learning environment and technical tracks.' : 'Join an elite network of global learners and industry professionals.' }}
          </p>
        </div>

        <div v-if="error" class="bg-red-50 border border-red-100 text-red-600 px-5 py-4 rounded-xl text-xs mb-8 flex items-start gap-3 font-bold animate-fade-up">
          <span class="shrink-0 mt-0.5">⚠️</span>
          <span>SYSTEM_ERR: {{ error }}</span>
        </div>

        <!-- External Authentication Hub (Google) -->
        <div class="mb-8 relative flex justify-center">
          <div id="g_id_onload"
             data-client_id="845233069176-s3oij4uon9l53bof16m4en41j1okc6j5.apps.googleusercontent.com"
             data-context="use"
             data-ux_mode="popup"
             data-callback="handleGoogleCredentialResponse"
             data-auto_prompt="false">
          </div>
          <div class="g_id_signin"
             data-type="standard"
             data-shape="rectangular"
             data-theme="outline"
             data-text="continue_with"
             data-size="large"
             data-logo_alignment="left"
             style="width: 100%;">
          </div>
        </div>

        <div class="flex items-center gap-4 mb-8">
          <div class="h-px bg-gray-100 dark:bg-white/10 flex-1" />
          <span class="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Email Protocol</span>
          <div class="h-px bg-gray-100 dark:bg-white/10 flex-1" />
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div v-if="!isLogin" class="animate-fade-up">
            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Identity Name</label>
            <input v-model="name" type="text" required placeholder="Full Legal Name"
              class="input py-3.5 px-5 bg-gray-50/50 focus:bg-white transition-all font-medium" />
          </div>
          
          <div class="animate-fade-up" style="transition-delay: 50ms">
            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Mail Identifier</label>
            <input v-model="email" type="email" required placeholder="address@protocol.com"
              class="input py-3.5 px-5 bg-gray-50/50 focus:bg-white transition-all font-medium" />
          </div>
          
          <div class="animate-fade-up" style="transition-delay: 100ms">
            <div class="flex items-center justify-between mb-2 ml-1">
              <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Secret Protocol</label>
              <button v-if="isLogin" type="button" @click="forgotPassword" class="text-[9px] text-primary hover:underline font-black uppercase tracking-widest">Reset</button>
            </div>
            <input v-model="password" type="password" required placeholder="••••••••" minlength="6"
              class="input py-3.5 px-5 bg-gray-50/50 focus:bg-white transition-all font-medium" />
          </div>

          <button type="submit" :disabled="loading"
            class="w-full btn-primary py-4 mt-4 uppercase tracking-[0.2em] font-black text-xs shadow-xl shadow-primary/20 flex justify-center items-center">
            <span v-if="loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
            {{ loading ? 'Synchronizing...' : isLogin ? 'Finalize Access' : 'Initialize Registration' }}
          </button>
        </form>

        <div class="text-center mt-10 animate-fade-up" style="transition-delay: 150ms">
          <p class="text-xs text-gray-500 font-medium">
            {{ isLogin ? "Insufficient credentials?" : "Existing credential node?" }}
            <button @click="toggleMode" class="text-primary font-black uppercase tracking-widest ml-2 hover:underline">
              {{ isLogin ? 'Register' : 'Authenticate' }}
            </button>
          </p>
        </div>
      </div>
      
      <!-- Regulatory Documentation -->
      <div class="flex justify-center gap-10 mt-10 text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">
        <a href="#" class="hover:text-primary transition-colors">Privacy Policy</a>
        <a href="#" class="hover:text-primary transition-colors">Usage Terms</a>
        <a href="#" class="hover:text-primary transition-colors">Support Hub</a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const isLogin = ref(true)
const name = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

function toggleMode() {
  isLogin.value = !isLogin.value
  error.value = ''
  password.value = ''
}

async function handleSubmit() {
  loading.value = true; error.value = ''
  try {
    if (isLogin.value) {
      await auth.login(email.value, password.value)
      router.push('/dashboard')
    } else {
      await auth.register(name.value, email.value, password.value)
      router.push('/dashboard')
    }
  } catch (e: any) { error.value = e.message || 'Authentication sequence failed' }
  finally { loading.value = false }
}

function forgotPassword() {
  if (!email.value) { error.value = 'Email identifier required for reset protocol.'; return }
  error.value = ''
  alert(`Reset link transmitted to ${email.value} (Simulation)`)
}

onMounted(() => {
  ;(window as any).handleGoogleCredentialResponse = async (response: any) => {
    try {
      loading.value = true; error.value = ''
      await auth.googleAuth(response.credential)
      router.push('/dashboard')
    } catch (e: any) { error.value = e.message || 'Google Authentication Failure' }
    finally { loading.value = false }
  }
})
</script>

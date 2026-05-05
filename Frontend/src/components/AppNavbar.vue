<template>
  <div>
    <nav class="fixed top-0 left-0 right-0 z-50 h-16 bg-white/90 dark:bg-surface-900/95 backdrop-blur-md border-b border-gray-100 dark:border-white/5 transition-colors">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center gap-6">
        <!-- Professional Logo -->
        <RouterLink to="/" class="flex items-center gap-2.5 shrink-0 group">
          <div class="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-white font-black text-xs tracking-tighter">SO</div>
          <span class="font-bold text-gray-900 dark:text-white text-xl tracking-tight">Skill<span class="text-primary font-black">Orbit</span></span>
        </RouterLink>

        <!-- Structured Nav -->
        <nav class="hidden md:flex items-center gap-1">
          <RouterLink v-for="l in NAV_LINKS" :key="l.to" :to="l.to" :end="l.end"
            class="px-4 py-1.5 rounded-md text-[13px] font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-all uppercase tracking-wider"
            active-class="!text-primary !bg-primary-50 dark:!bg-primary/10">{{ l.label }}</RouterLink>
        </nav>

        <!-- Clean Search Bar -->
        <div class="hidden lg:flex flex-1 max-w-sm ml-4">
          <div class="relative w-full group">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
            </svg>
            <input v-model="searchQuery" type="text" placeholder="Search for anything…"
              class="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 outline-none focus:bg-white dark:focus:bg-surface-950 focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all"
              @keydown.enter="goSearch" />
          </div>
        </div>

        <!-- Right Utility Nav -->
        <div class="flex items-center gap-3 ml-auto">
          <!-- Theme Switcher -->
          <button @click="theme.toggle()" :title="theme.isDark ? 'Light mode' : 'Dark mode'"
            class="w-9 h-9 rounded-lg border border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center justify-center transition-colors">
            <svg v-if="theme.isDark" class="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm0-14a6 6 0 1 0 0 12A6 6 0 0 0 12 6zm0 10a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"/>
            </svg>
            <svg v-else class="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 0 1 8.646 3.646 9.003 9.003 0 0 0 12 21a9.003 9.003 0 0 0 8.354-5.646z"/>
            </svg>
          </button>

          <!-- Notification Center -->
          <template v-if="auth.isAuthenticated">
            <div class="relative" ref="notifRef">
              <button @click="notifOpen = !notifOpen"
                class="relative w-9 h-9 rounded-lg border border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center justify-center transition-colors">
                <svg class="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                <span v-if="unreadCount > 0" class="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-white dark:ring-surface-900"></span>
              </button>
              
              <!-- Popover -->
              <div v-if="notifOpen" class="absolute right-0 top-11 w-80 bg-white dark:bg-surface-900 border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden animate-scale-in z-50">
                <div class="px-5 py-4 border-b border-gray-50 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                  <span class="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-[0.15em]">Updates</span>
                  <button @click="announcementStore.markAllAsRead" class="text-[10px] font-bold text-primary hover:underline uppercase">Clear all</button>
                </div>
                <div v-if="announcementStore.announcements.length === 0" class="p-10 text-center text-gray-400 text-xs font-medium">No recent updates</div>
                <div v-else class="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-white/5">
                  <RouterLink v-for="ann in announcementStore.announcements" :key="ann.id" to="/dashboard" @click="notifOpen=false"
                    class="block p-5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <div class="flex items-start gap-3">
                      <div v-if="!ann.read" class="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></div>
                      <div>
                        <div class="text-xs font-bold text-gray-900 dark:text-white mb-1 leading-snug">{{ ann.title }}</div>
                        <div class="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">{{ ann.message }}</div>
                      </div>
                    </div>
                  </RouterLink>
                </div>
              </div>
            </div>
          </template>

          <!-- User Navigation -->
          <div v-if="auth.isAuthenticated" class="flex items-center gap-3">
            <RouterLink :to="auth.user?.is_admin ? '/admin' : '/dashboard'"
              class="hidden sm:inline-flex text-[11px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 transition-all">
              {{ auth.user?.is_admin ? 'Admin Panel' : 'Dashboard' }}
            </RouterLink>
            
            <div class="relative" ref="avatarRef">
              <button @click="avatarOpen = !avatarOpen"
                class="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-700 dark:text-primary-300 font-black text-xs border border-primary-100 dark:border-primary-800 transition-all hover:ring-4 hover:ring-primary/5">
                {{ auth.user?.name?.[0]?.toUpperCase() }}
              </button>
              
              <div v-if="avatarOpen" class="absolute right-0 top-11 w-56 bg-white dark:bg-surface-900 border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden animate-scale-in">
                <div class="px-5 py-4 border-b border-gray-50 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                  <div class="text-xs font-bold text-gray-900 dark:text-white truncate">{{ auth.user?.name }}</div>
                  <div class="text-[10px] font-medium text-gray-400 truncate mt-0.5">{{ auth.user?.email }}</div>
                </div>
                <div class="p-2">
                  <RouterLink to="/dashboard" @click="avatarOpen=false" class="flex items-center gap-3 px-3 py-2 text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-primary hover:bg-primary-50 dark:hover:bg-primary/10 rounded-lg transition-all">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg> Dashboard
                  </RouterLink>
                  <RouterLink to="/leaderboard" @click="avatarOpen=false" class="flex items-center gap-3 px-3 py-2 text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-primary hover:bg-primary-50 dark:hover:bg-primary/10 rounded-lg transition-all">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Global Ranking
                  </RouterLink>
                </div>
                <div class="p-2 border-t border-gray-50 dark:border-white/5">
                  <button @click="auth.logout(); avatarOpen=false" class="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg> Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>

          <template v-else>
            <RouterLink to="/login" class="text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white uppercase tracking-widest">Sign In</RouterLink>
            <RouterLink to="/signup" class="btn-primary text-[11px] uppercase tracking-widest">Get Started</RouterLink>
          </template>
        </div>

        <!-- Mobile menu toggle -->
        <button @click="menuOpen = !menuOpen" class="md:hidden w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path v-if="!menuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /><path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l18 18" /></svg>
        </button>
      </div>
    </nav>

    <!-- Spacer -->
    <div class="h-16"></div>

    <!-- Mobile Menu -->
    <div v-if="menuOpen" class="fixed inset-0 z-40 bg-white dark:bg-surface-950 pt-16 animate-fade-in md:hidden">
      <div class="p-6 space-y-6">
        <RouterLink v-for="l in NAV_LINKS" :key="l.to" :to="l.to" @click="menuOpen=false" class="block text-2xl font-bold text-gray-900 dark:text-white">{{ l.label }}</RouterLink>
        <div class="pt-6 border-t border-gray-100 dark:border-white/5">
          <div v-if="auth.isAuthenticated" class="space-y-4">
             <RouterLink to="/dashboard" @click="menuOpen=false" class="block text-lg font-bold text-primary">My Dashboard</RouterLink>
             <button @click="auth.logout(); menuOpen=false" class="text-lg font-bold text-red-500">Sign Out</button>
          </div>
          <div v-else class="flex flex-col gap-4">
            <RouterLink to="/login" @click="menuOpen=false" class="btn-outline w-full text-center py-3">Sign In</RouterLink>
            <RouterLink to="/signup" @click="menuOpen=false" class="btn-primary w-full text-center py-3">Get Started</RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useThemeStore } from '../stores/theme'
import { useAnnouncementStore } from '../stores/announcement'

const auth = useAuthStore()
const theme = useThemeStore()
const announcementStore = useAnnouncementStore()
const router = useRouter()
const route = useRoute()

const menuOpen = ref(false)
const searchQuery = ref('')
const avatarOpen = ref(false)
const notifOpen = ref(false)

const avatarRef = ref<HTMLElement | null>(null)
const notifRef = ref<HTMLElement | null>(null)

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/courses', label: 'Courses' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

const unreadCount = computed(() => announcementStore.announcements.filter(a => !a.read).length)

const goSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ name: 'search', query: { q: searchQuery.value } })
    searchQuery.value = ''
    menuOpen.value = false
  }
}

const handleClickOutside = (e: MouseEvent) => {
  if (avatarRef.value && !avatarRef.value.contains(e.target as Node)) avatarOpen.value = false
  if (notifRef.value && !notifRef.value.contains(e.target as Node)) notifOpen.value = false
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  announcementStore.fetchAnnouncements()
})
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

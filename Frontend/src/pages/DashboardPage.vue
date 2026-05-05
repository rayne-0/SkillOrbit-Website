<template>
  <div class="min-h-screen bg-[#F8F9FA] dark:bg-surface-950 pb-20">
    <!-- Clean Professional Header -->
    <div class="bg-white dark:bg-surface-900 border-b border-gray-200 dark:border-white/5 py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center gap-8">
        <!-- Avatar with Level Badge -->
        <div class="relative shrink-0">
          <div class="w-24 h-24 rounded-full bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-100 dark:border-primary-800 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-3xl">
            {{ auth.user?.name?.[0]?.toUpperCase() }}
          </div>
          <div class="absolute -bottom-1 -right-1 bg-white dark:bg-surface-900 border border-gray-200 dark:border-white/10 rounded-full px-2 py-0.5 text-[10px] font-bold text-gray-900 dark:text-white shadow-sm">
            LVL {{ gamify.profile.level }}
          </div>
        </div>

        <div class="flex-1 text-center md:text-left min-w-0">
          <h1 class="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Welcome back, {{ auth.user?.name?.split(' ')[0] }}</h1>
          <div class="flex items-center justify-center md:justify-start gap-4 mt-3 text-sm text-gray-500 font-medium">
            <span class="flex items-center gap-1.5"><svg class="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1.323l.395.072 4.105 4.105V13a1 1 0 01-1 1h-2v2a1 1 0 01-2 0v-2H7a1 1 0 01-1-1V8.5l4.105-4.105.395-.072V3a1 1 0 011-1z" /></svg> {{ gamify.profile.streak }} day streak</span>
            <span class="w-1 h-1 bg-gray-300 rounded-full"></span>
            <span>{{ gamify.profile.xp.toLocaleString() }} XP</span>
            <span class="w-1 h-1 bg-gray-300 rounded-full"></span>
            <span>{{ enrolledCourses.length }} courses active</span>
          </div>
        </div>

        <!-- Progress Overview -->
        <div class="w-full md:w-72 bg-gray-50 dark:bg-white/5 rounded-xl p-5 border border-gray-100 dark:border-white/5">
          <div class="flex justify-between text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">
            <span>Next Level</span>
            <span class="text-primary">{{ (gamify.nextLevelXP - gamify.profile.xp).toLocaleString() }} XP remaining</span>
          </div>
          <div class="progress-bar h-1.5"><div class="progress-fill" :style="{ width: `${gamify.progressPct}%` }" /></div>
        </div>
      </div>
    </div>

    <!-- Main Navigation Tabs -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 -mt-px">
      <div class="flex border-b border-gray-200 dark:border-white/5 overflow-x-auto no-scrollbar bg-white dark:bg-surface-900 rounded-b-xl shadow-sm">
        <button v-for="t in TABS" :key="t.key" @click="tab = t.key"
          :class="['px-8 py-5 text-sm font-bold tracking-tight transition-all relative',
            tab === t.key ? 'text-primary' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white']">
          {{ t.label }}
          <div v-if="tab === t.key" class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
        </button>
      </div>

      <!-- Tab Content -->
      <div class="py-10">
        <div v-if="tab === 'overview'" class="space-y-12">
          <!-- Continue Learning Section -->
          <section>
            <div class="flex items-center justify-between mb-8">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">My Courses</h2>
              <RouterLink to="/courses" class="text-sm font-bold text-primary hover:underline uppercase tracking-wider">Explore All →</RouterLink>
            </div>
            
            <div v-if="courseStore.loading" class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div v-for="i in 3" :key="i" class="card h-64 animate-pulse bg-gray-100 dark:bg-white/5 border-none" />
            </div>
            
            <div v-else-if="!enrolledCourses.length" class="card py-20 text-center flex flex-col items-center">
              <div class="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center text-3xl mb-6">🚀</div>
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Ready to expand your orbit?</h3>
              <p class="text-gray-500 mb-8 max-w-sm">Enroll in your first course to start earning XP and mastering new skills.</p>
              <RouterLink to="/courses" class="btn-primary py-3 px-10">Browse Catalog</RouterLink>
            </div>

            <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <RouterLink v-for="c in enrolledCourses" :key="c.id" :to="`/learn/${c.id}`"
                class="card group overflow-hidden bg-white hover:border-primary/40 transition-all flex flex-col h-full">
                <div class="h-40 relative overflow-hidden bg-gray-100">
                  <img v-if="c.thumbnail" :src="c.thumbnail" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div v-else class="w-full h-full flex items-center justify-center text-4xl opacity-20">📚</div>
                  <div class="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div class="p-6 flex-1 flex flex-col">
                  <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-6 line-clamp-2 leading-snug group-hover:text-primary transition-colors">{{ c.title }}</h3>
                  <div class="mt-auto pt-6 border-t border-gray-50 dark:border-white/5">
                    <div class="flex justify-between text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                      <span>Course Progress</span>
                      <span class="text-gray-900 dark:text-white">{{ getProgress(c.id) }}%</span>
                    </div>
                    <div class="progress-bar"><div class="progress-fill" :style="{ width: `${getProgress(c.id)}%` }" /></div>
                  </div>
                </div>
              </RouterLink>
            </div>
          </section>

          <!-- Achievement Highlights -->
          <section v-if="gamify.profile.badges.length">
            <div class="flex items-center justify-between mb-8">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Recent Achievements</h2>
              <button @click="tab = 'achievements'" class="text-sm font-bold text-primary hover:underline uppercase tracking-wider">View All</button>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
              <div v-for="b in gamify.profile.badges.slice(0, 6)" :key="b.id" class="card p-6 flex flex-col items-center text-center hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                <div class="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{{ b.icon }}</div>
                <h4 class="text-xs font-bold text-gray-900 dark:text-white tracking-tight">{{ b.name }}</h4>
              </div>
            </div>
          </section>
        </div>

        <!-- Profile Tab -->
        <div v-if="tab === 'profile'" class="animate-fade-up">
           <div class="card p-10 max-w-2xl mx-auto">
             <div class="flex items-center gap-6 mb-10 pb-10 border-b border-gray-100 dark:border-white/5">
               <div class="w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center text-3xl font-bold text-primary">
                 {{ auth.user?.name?.[0] }}
               </div>
               <div>
                 <h3 class="text-2xl font-bold text-gray-900 dark:text-white">{{ auth.user?.name }}</h3>
                 <p class="text-gray-500 font-medium">{{ auth.user?.email }}</p>
               </div>
             </div>
             <div class="space-y-6">
               <div class="flex justify-between items-center py-4 border-b border-gray-50 dark:border-white/5">
                 <span class="text-sm font-bold text-gray-400 uppercase tracking-widest">Account Type</span>
                 <span class="text-sm font-bold text-gray-900 dark:text-white">{{ auth.user?.is_admin ? 'Administrator' : 'Learner' }}</span>
               </div>
               <div class="flex justify-between items-center py-4 border-b border-gray-50 dark:border-white/5">
                 <span class="text-sm font-bold text-gray-400 uppercase tracking-widest">Member Since</span>
                 <span class="text-sm font-bold text-gray-900 dark:text-white">January 2024</span>
               </div>
               <div class="pt-6">
                 <button class="btn-outline w-full py-3">Edit Profile Settings</button>
               </div>
             </div>
           </div>
        </div>

        <!-- Placeholder for other tabs -->
        <div v-if="['assignments', 'achievements', 'announcements', 'billing'].includes(tab)" class="card p-20 text-center border-dashed">
          <div class="text-4xl mb-4 opacity-30">🚧</div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">{{ TABS.find(t => t.key === tab)?.label }} Detail</h3>
          <p class="text-gray-500 text-sm">Full view for this section is currently under refinement.</p>
        </div>

        <!-- My Mentor Tab -->
        <div v-if="tab === 'mentors'" class="animate-fade-up">
          <div v-if="mentorStore.assignedMentor" class="card max-w-4xl mx-auto overflow-hidden flex flex-col md:flex-row border-none shadow-xl">
             <div class="md:w-1/3 bg-primary-50 dark:bg-primary-900/20 p-10 flex flex-col items-center text-center">
               <img :src="mentorStore.assignedMentor.avatar" class="w-32 h-32 rounded-full border-4 border-white dark:border-surface-900 shadow-lg mb-6" />
               <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-1">{{ mentorStore.assignedMentor.name }}</h3>
               <p class="text-primary-600 dark:text-primary-400 font-bold text-xs uppercase tracking-widest mb-6">Your Personal Mentor</p>
               <button class="btn-primary w-full py-3 text-sm">Message Mentor</button>
             </div>
             <div class="flex-1 p-10 bg-white dark:bg-surface-900">
               <h4 class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Biography</h4>
               <p class="text-gray-600 dark:text-gray-300 leading-relaxed mb-8">{{ mentorStore.assignedMentor.bio }}</p>
               
               <h4 class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Expertise</h4>
               <div class="flex flex-wrap gap-2 mb-8">
                 <span v-for="exp in mentorStore.assignedMentor.expertise" :key="exp" class="badge-gray">{{ exp }}</span>
               </div>

               <h4 class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Availability</h4>
               <p class="text-gray-900 dark:text-white font-medium">{{ mentorStore.assignedMentor.schedule }}</p>
             </div>
          </div>
          <div v-else class="card p-20 text-center">
            <p class="text-gray-500">Loading your mentor profile...</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useCourseStore } from '../stores/course'
import { useGamificationStore } from '../stores/gamification'
import { useMentorStore } from '../stores/mentor'

const auth = useAuthStore()
const courseStore = useCourseStore()
const gamify = useGamificationStore()
const mentorStore = useMentorStore()

const tab = ref('overview')

const TABS = [
  { key: 'overview', label: 'Dashboard' },
  { key: 'profile', label: 'My Profile' },
  { key: 'assignments', label: 'Assignments' },
  { key: 'mentors', label: 'My Mentor' },
  { key: 'achievements', label: 'Achievements' },
  { key: 'announcements', label: 'Updates' },
  { key: 'billing', label: 'Billing' },
]

const enrolledCourses = computed(() => {
  return courseStore.courses.filter(c => auth.user?.enrolledCourses?.includes(c.id))
})

const getProgress = (id: string) => {
  return auth.user?.courseProgress?.[id] || 0
}

onMounted(async () => {
  if (courseStore.courses.length === 0) await courseStore.fetchCourses()
  if (mentorStore.mentors.length === 0) await mentorStore.fetchMentors()
})
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>

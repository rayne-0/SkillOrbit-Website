<template>
  <div class="min-h-screen bg-[#F8F9FA] dark:bg-surface-950 pb-20">
    <!-- MentorChat overlay -->
    <MentorChat v-if="chatOpen" :mentor="mentorStore.assignedMentor" @close="chatOpen = false" />

    <!-- Header -->
    <div class="bg-white dark:bg-surface-900 border-b border-gray-200 dark:border-white/5 py-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center gap-8">
        <!-- Avatar with upload -->
        <div class="relative shrink-0 group cursor-pointer" @click="avatarInput?.click()">
          <div class="w-24 h-24 rounded-full overflow-hidden border-2 border-primary/20 bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
            <img v-if="auth.user?.avatar" :src="auth.user.avatar" class="w-full h-full object-cover" />
            <span v-else class="text-primary-600 dark:text-primary-400 font-bold text-3xl">
              {{ auth.user?.name?.[0]?.toUpperCase() }}
            </span>
          </div>
          <div class="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span class="text-white text-xs font-bold">Change</span>
          </div>
          <input ref="avatarInput" type="file" accept="image/*" class="hidden" @change="handleAvatarUpload" />
        </div>

        <div class="flex-1 text-center md:text-left min-w-0">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Welcome back, {{ auth.user?.name?.split(' ')[0] }}
          </h1>
          <div class="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3 text-sm text-gray-500 font-medium">
            <span class="flex items-center gap-1.5">🔥 {{ gamify.profile.streak }} day streak</span>
            <span class="w-1 h-1 bg-gray-300 rounded-full" />
            <span>{{ gamify.profile.xp.toLocaleString() }} XP</span>
            <span class="w-1 h-1 bg-gray-300 rounded-full" />
            <span>{{ enrolledCourses.length }} courses active</span>
          </div>
        </div>

        <!-- XP progress -->
        <div class="w-full md:w-64 bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-white/5">
          <div class="flex justify-between text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">
            <span>Level {{ gamify.profile.level }}</span>
            <span class="text-primary">{{ (gamify.nextLevelXP - gamify.profile.xp).toLocaleString() }} XP to next</span>
          </div>
          <div class="h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
            <div class="h-full bg-primary rounded-full transition-all duration-700" :style="{ width: `${gamify.progressPct}%` }" />
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="flex border-b border-gray-200 dark:border-white/5 overflow-x-auto no-scrollbar bg-white dark:bg-surface-900 shadow-sm">
        <button v-for="t in TABS" :key="t.key" @click="tab = t.key"
          :class="['px-6 py-4 text-sm font-bold whitespace-nowrap transition-all relative',
            tab === t.key ? 'text-primary' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white']">
          {{ t.label }}
          <div v-if="tab === t.key" class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
        </button>
      </div>

      <div class="py-10">

        <!-- OVERVIEW TAB -->
        <div v-if="tab === 'overview'" class="space-y-10">
          <section>
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">My Courses</h2>
              <RouterLink to="/courses" class="text-sm font-bold text-primary hover:underline uppercase tracking-wider">Explore All →</RouterLink>
            </div>
            <div v-if="courseStore.loading" class="grid md:grid-cols-3 gap-6">
              <div v-for="i in 3" :key="i" class="card h-56 animate-pulse bg-gray-100 dark:bg-white/5 border-none" />
            </div>
            <div v-else-if="!enrolledCourses.length" class="card py-16 text-center">
              <div class="text-4xl mb-4">🚀</div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Start your learning journey</h3>
              <p class="text-gray-500 mb-6 max-w-sm mx-auto">Enroll in your first course to start earning XP and mastering new skills.</p>
              <RouterLink to="/courses" class="btn-primary py-3 px-8">Browse Catalog</RouterLink>
            </div>
            <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <RouterLink v-for="c in enrolledCourses" :key="c.id" :to="`/learn/${c.id}`"
                class="card group overflow-hidden bg-white hover:border-primary/40 transition-all flex flex-col">
                <div class="h-36 bg-gray-100 dark:bg-white/5 relative overflow-hidden">
                  <img v-if="c.thumbnail" :src="c.thumbnail" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div v-else class="w-full h-full flex items-center justify-center text-4xl opacity-20">📚</div>
                </div>
                <div class="p-5 flex-1 flex flex-col">
                  <h3 class="font-bold text-gray-900 dark:text-white mb-4 line-clamp-2">{{ c.title }}</h3>
                  <div class="mt-auto">
                    <div class="flex justify-between text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                      <span>Progress</span><span class="text-gray-900 dark:text-white">{{ getProgress(c.id) }}%</span>
                    </div>
                    <div class="h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                      <div class="h-full bg-primary rounded-full" :style="{ width: `${getProgress(c.id)}%` }" />
                    </div>
                  </div>
                </div>
              </RouterLink>
            </div>
          </section>

          <!-- Badges -->
          <section v-if="gamify.profile.badges.length">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Achievements</h2>
            <div class="grid grid-cols-3 sm:grid-cols-6 gap-4">
              <div v-for="b in gamify.profile.badges.slice(0, 6)" :key="b.id"
                   class="card p-4 flex flex-col items-center text-center hover:border-primary/30 transition-all group">
                <div class="text-3xl mb-2 group-hover:scale-110 transition-transform">{{ b.icon }}</div>
                <p class="text-xs font-bold text-gray-700 dark:text-gray-200">{{ b.name }}</p>
              </div>
            </div>
          </section>
        </div>

        <!-- PROFILE TAB -->
        <div v-else-if="tab === 'profile'" class="max-w-2xl mx-auto">
          <div class="card p-8">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-8">Edit Profile</h2>
            <div class="flex items-center gap-5 mb-8 pb-8 border-b border-gray-100 dark:border-white/5">
              <div class="relative group cursor-pointer" @click="avatarInput?.click()">
                <div class="w-20 h-20 rounded-full overflow-hidden bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                  <img v-if="auth.user?.avatar" :src="auth.user.avatar" class="w-full h-full object-cover" />
                  <span v-else class="text-2xl font-bold text-primary">{{ auth.user?.name?.[0] }}</span>
                </div>
                <div class="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">Edit</div>
              </div>
              <div>
                <p class="font-bold text-gray-900 dark:text-white">{{ auth.user?.name }}</p>
                <p class="text-sm text-gray-500">{{ auth.user?.email }}</p>
                <button @click="avatarInput?.click()" class="text-xs text-primary font-bold mt-1 hover:underline">Change photo</button>
              </div>
            </div>
            <div class="space-y-5">
              <div>
                <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Full Name</label>
                <input v-model="profileForm.name" type="text" class="w-full px-4 py-3 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-surface-950 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Phone Number</label>
                <input v-model="profileForm.phone" type="tel" placeholder="+91 00000 00000" class="w-full px-4 py-3 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-surface-950 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Bio</label>
                <textarea v-model="profileForm.bio" rows="3" placeholder="Tell us a bit about yourself…" class="w-full px-4 py-3 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-surface-950 text-gray-900 dark:text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
              </div>
              <button @click="saveProfile" :disabled="profileSaving" class="btn-primary w-full py-3 font-bold">
                <span v-if="profileSaving">Saving…</span>
                <span v-else-if="profileSaved">✓ Profile Saved!</span>
                <span v-else>Save Changes</span>
              </button>
            </div>
          </div>
        </div>

        <!-- ASSIGNMENTS TAB -->
        <div v-else-if="tab === 'assignments'" class="space-y-6">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">My Assignments</h2>
          <div v-if="assignmentStore.loading" class="card p-10 text-center text-gray-400">Loading…</div>
          <div v-else-if="!mySubmissions.length" class="card py-16 text-center">
            <div class="text-4xl mb-4">📝</div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">No assignments yet</h3>
            <p class="text-gray-500">Assignments from your courses will appear here.</p>
          </div>
          <div v-else class="space-y-4">
            <div v-for="sub in mySubmissions" :key="sub.id" class="card p-6 flex items-start gap-5">
              <div class="text-2xl shrink-0">{{ sub.status === 'reviewed' ? '✅' : '⏳' }}</div>
              <div class="flex-1 min-w-0">
                <h3 class="font-bold text-gray-900 dark:text-white">{{ sub.title }}</h3>
                <p class="text-sm text-gray-500 mt-1">{{ sub.courseName }}</p>
                <div class="flex items-center gap-3 mt-3">
                  <span :class="['px-3 py-1 rounded-full text-xs font-bold', sub.status === 'reviewed' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400']">
                    {{ sub.status === 'reviewed' ? 'Reviewed' : 'Pending Review' }}
                  </span>
                  <span v-if="sub.grade != null" class="text-sm font-black text-primary">{{ sub.grade }}/100</span>
                </div>
                <p v-if="sub.feedback" class="text-sm text-gray-600 dark:text-gray-300 mt-3 bg-gray-50 dark:bg-white/5 rounded-lg p-3 italic">
                  "{{ sub.feedback }}"
                </p>
              </div>
              <span class="text-xs text-gray-400 shrink-0">{{ new Date(sub.submittedAt).toLocaleDateString('en-IN') }}</span>
            </div>
          </div>

          <!-- Quick submit -->
          <div class="card p-8">
            <h3 class="font-bold text-gray-900 dark:text-white mb-6">Submit an Assignment</h3>
            <AssignmentUploader
              assignment-id="general"
              assignment-title="General Submission"
              :course-name="enrolledCourses[0]?.title"
              @submitted="assignmentStore.fetchSubmissions()" />
          </div>
        </div>

        <!-- MENTOR TAB -->
        <div v-else-if="tab === 'mentors'">
          <div v-if="mentorStore.assignedMentor" class="card max-w-4xl mx-auto overflow-hidden flex flex-col md:flex-row">
            <div class="md:w-72 bg-primary-50 dark:bg-primary-900/20 p-10 flex flex-col items-center text-center shrink-0">
              <img v-if="mentorStore.assignedMentor.avatar" :src="mentorStore.assignedMentor.avatar"
                   class="w-28 h-28 rounded-full border-4 border-white dark:border-surface-900 shadow-lg mb-5 object-cover" />
              <div v-else class="w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center text-4xl font-bold text-primary mb-5">
                {{ mentorStore.assignedMentor.name?.[0] }}
              </div>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-1">{{ mentorStore.assignedMentor.name }}</h3>
              <p class="text-primary text-xs font-bold uppercase tracking-widest mb-6">Your Mentor</p>
              <button @click="chatOpen = true" class="btn-primary w-full py-3 text-sm shadow-lg shadow-primary/20">💬 Message Mentor</button>
              <a v-if="mentorStore.assignedMentor.email" :href="`mailto:${mentorStore.assignedMentor.email}`"
                 class="btn-outline w-full py-3 text-sm mt-3">✉️ Send Email</a>
            </div>
            <div class="flex-1 p-10 bg-white dark:bg-surface-900">
              <div class="mb-8">
                <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Biography</p>
                <p class="text-gray-600 dark:text-gray-300 leading-relaxed">{{ mentorStore.assignedMentor.bio }}</p>
              </div>
              <div class="mb-8">
                <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Expertise</p>
                <div class="flex flex-wrap gap-2">
                  <span v-for="exp in mentorStore.assignedMentor.expertise" :key="exp"
                        class="px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full text-xs font-bold">
                    {{ exp }}
                  </span>
                </div>
              </div>
              <div>
                <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Availability</p>
                <p class="text-gray-900 dark:text-white font-medium">{{ mentorStore.assignedMentor.schedule ?? 'Mon–Fri, 10 AM – 6 PM IST' }}</p>
              </div>
            </div>
          </div>
          <div v-else class="card py-20 text-center">
            <div class="text-4xl mb-4">🎓</div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">No mentor assigned yet</h3>
            <p class="text-gray-500">Contact your administrator to get a mentor assigned to you.</p>
          </div>
        </div>

        <!-- ACHIEVEMENTS TAB -->
        <div v-else-if="tab === 'achievements'" class="space-y-8">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">All Achievements</h2>
          <div v-if="!gamify.profile.badges.length" class="card py-16 text-center">
            <div class="text-4xl mb-4">🏆</div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">No badges yet</h3>
            <p class="text-gray-500">Complete lessons and quizzes to earn your first badge.</p>
          </div>
          <div v-else class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            <div v-for="b in gamify.profile.badges" :key="b.id"
                 class="card p-5 flex flex-col items-center text-center hover:border-primary/30 hover:shadow-md transition-all group">
              <div class="text-4xl mb-3 group-hover:scale-110 transition-transform">{{ b.icon }}</div>
              <h4 class="text-xs font-bold text-gray-900 dark:text-white">{{ b.name }}</h4>
              <p class="text-[10px] text-gray-400 mt-1 leading-tight">{{ b.description ?? '' }}</p>
            </div>
          </div>
        </div>

        <!-- ANNOUNCEMENTS TAB -->
        <div v-else-if="tab === 'announcements'" class="space-y-4 max-w-3xl">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Announcements & Updates</h2>
          <div v-for="ann in ANNOUNCEMENTS" :key="ann.id" class="card p-6 flex gap-5">
            <div class="text-2xl shrink-0">{{ ann.icon }}</div>
            <div class="flex-1">
              <div class="flex items-start justify-between gap-4">
                <h3 class="font-bold text-gray-900 dark:text-white">{{ ann.title }}</h3>
                <span class="text-xs text-gray-400 shrink-0">{{ ann.date }}</span>
              </div>
              <p class="text-sm text-gray-500 mt-2 leading-relaxed">{{ ann.body }}</p>
              <a v-if="ann.link" :href="ann.link" class="text-xs font-bold text-primary hover:underline mt-3 inline-block">Join Session →</a>
            </div>
          </div>
        </div>

        <!-- BILLING TAB -->
        <div v-else-if="tab === 'billing'" class="max-w-3xl space-y-6">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Billing & Subscriptions</h2>
          <div class="card p-6 flex items-center justify-between">
            <div>
              <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Current Plan</p>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white">Pro Learner</h3>
              <p class="text-sm text-gray-500 mt-1">Full access to all courses and mentorship</p>
            </div>
            <div class="text-right">
              <p class="text-2xl font-black text-gray-900 dark:text-white">₹999<span class="text-sm font-normal text-gray-400">/mo</span></p>
              <span class="inline-block mt-2 px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-bold rounded-full">Active</span>
            </div>
          </div>
          <div class="card overflow-hidden">
            <div class="p-5 border-b border-gray-100 dark:border-white/5">
              <h3 class="font-bold text-gray-900 dark:text-white">Transaction History</h3>
            </div>
            <table class="w-full text-sm">
              <thead class="bg-gray-50 dark:bg-white/5">
                <tr>
                  <th v-for="h in ['Date', 'Description', 'Amount', 'Status']" :key="h"
                      class="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest">{{ h }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50 dark:divide-white/5">
                <tr v-for="tx in BILLING_HISTORY" :key="tx.id" class="hover:bg-gray-50/50 dark:hover:bg-white/2 transition-colors">
                  <td class="px-5 py-4 text-gray-500">{{ tx.date }}</td>
                  <td class="px-5 py-4 font-medium text-gray-900 dark:text-white">{{ tx.desc }}</td>
                  <td class="px-5 py-4 font-bold text-gray-900 dark:text-white">{{ tx.amount }}</td>
                  <td class="px-5 py-4">
                    <span :class="['px-2.5 py-1 rounded-full text-xs font-bold', tx.status === 'Paid' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400']">{{ tx.status }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useCourseStore } from '../stores/course'
import { useGamificationStore } from '../stores/gamification'
import { useMentorStore } from '../stores/mentor'
import { useAssignmentStore } from '../stores/assignment'
import MentorChat from '../components/MentorChat.vue'
import AssignmentUploader from '../components/AssignmentUploader.vue'

const auth = useAuthStore()
const courseStore = useCourseStore()
const gamify = useGamificationStore()
const mentorStore = useMentorStore()
const assignmentStore = useAssignmentStore()

const tab = ref('overview')
const chatOpen = ref(false)
const avatarInput = ref<HTMLInputElement | null>(null)

// Profile editing
const profileForm = ref({ name: auth.user?.name ?? '', phone: auth.user?.phone ?? '', bio: auth.user?.bio ?? '' })
const profileSaving = ref(false)
const profileSaved = ref(false)

const TABS = [
  { key: 'overview', label: 'Dashboard' },
  { key: 'profile', label: 'My Profile' },
  { key: 'assignments', label: 'Assignments' },
  { key: 'mentors', label: 'My Mentor' },
  { key: 'achievements', label: 'Achievements' },
  { key: 'announcements', label: 'Updates' },
  { key: 'billing', label: 'Billing' },
]

const ANNOUNCEMENTS = [
  { id: 1, icon: '📡', title: 'Live Q&A Session – React Advanced', body: 'Join us this Saturday at 11 AM IST for a live Q&A with your instructor.', date: '2 May 2026', link: '#' },
  { id: 2, icon: '📢', title: 'New Course Added: TypeScript Mastery', body: 'A brand new course on TypeScript has just been added to the catalog. Enroll now!', date: '28 Apr 2026', link: null },
  { id: 3, icon: '🏆', title: 'Leaderboard Reset – New Month', body: 'The monthly leaderboard has been reset. Start earning XP to climb the ranks!', date: '1 May 2026', link: null },
]

const BILLING_HISTORY = [
  { id: 1, date: '1 May 2026', desc: 'Pro Learner – Monthly Subscription', amount: '₹999', status: 'Paid' },
  { id: 2, date: '1 Apr 2026', desc: 'Pro Learner – Monthly Subscription', amount: '₹999', status: 'Paid' },
  { id: 3, date: '1 Mar 2026', desc: 'Pro Learner – Monthly Subscription', amount: '₹999', status: 'Paid' },
]

const enrolledCourses = computed(() =>
  courseStore.courses.filter(c => auth.user?.enrolledCourses?.includes(c.id))
)

const mySubmissions = computed(() =>
  assignmentStore.submissions.filter(s => s.studentId === String(auth.user?.id))
)

const getProgress = (id: string) => auth.user?.courseProgress?.[id] ?? 0

async function handleAvatarUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  await auth.uploadAvatar(file)
}

async function saveProfile() {
  profileSaving.value = true
  profileSaved.value = false
  await auth.updateProfile(profileForm.value)
  profileSaving.value = false
  profileSaved.value = true
  setTimeout(() => profileSaved.value = false, 3000)
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

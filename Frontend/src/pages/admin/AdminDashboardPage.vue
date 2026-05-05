<template>
  <div class="max-w-7xl mx-auto py-8 px-4">
    <!-- Professional Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-gray-100 dark:border-white/5">
      <div>
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Executive Overview</h1>
        <p class="mt-1 text-gray-500 font-medium">Platform performance, revenue growth, and student engagement.</p>
      </div>
      <div class="flex items-center gap-3">
        <button class="btn-outline flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Export Data
        </button>
        <button class="btn-primary">Generate Report</button>
      </div>
    </div>

    <!-- Key Metrics Grid -->
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      <div v-for="(stat, i) in stats" :key="i" class="card p-6 flex flex-col justify-between">
        <div class="flex items-center justify-between mb-4">
          <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">{{ stat.label }}</span>
          <div class="p-2 rounded-lg bg-gray-50 dark:bg-white/5 text-primary">
            <component :is="stat.svgIcon" class="w-5 h-5" />
          </div>
        </div>
        <div>
          <h3 class="text-3xl font-bold text-gray-900 dark:text-white">{{ stat.value }}</h3>
          <div class="flex items-center gap-2 mt-2">
            <span :class="['text-xs font-bold px-2 py-0.5 rounded-full', stat.trend > 0 ? 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400']">
              {{ stat.trend > 0 ? '+' : '' }}{{ stat.trend }}%
            </span>
            <span class="text-[11px] text-gray-400 font-medium">from last month</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Admin Operations Hub -->
    <div class="mb-12">
      <h2 class="text-sm font-bold text-gray-400 uppercase tracking-[0.2em] mb-6">Management Modules</h2>
      <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
        <RouterLink v-for="link in adminLinks" :key="link.to" :to="link.to" 
                    class="card p-4 flex flex-col items-center justify-center gap-3 hover:border-primary hover:bg-primary/5 transition-all group border-gray-100">
          <span class="text-2xl grayscale group-hover:grayscale-0 transition-all">{{ link.icon }}</span>
          <span class="text-[10px] font-bold text-gray-500 group-hover:text-primary uppercase tracking-wider">{{ link.label }}</span>
        </RouterLink>
      </div>
    </div>

    <div class="grid lg:grid-cols-3 gap-10">
      <!-- Activity & Insights -->
      <div class="lg:col-span-2 space-y-10">
        <!-- Analytics Card -->
        <div class="card p-8">
          <div class="flex items-center justify-between mb-8">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">Growth Analytics</h3>
            <div class="flex gap-2">
              <button class="px-3 py-1 text-xs font-bold rounded-md bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300">Revenue</button>
              <button class="px-3 py-1 text-xs font-bold rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">Enrollments</button>
            </div>
          </div>
          
          <div class="h-64 flex items-end justify-between gap-1 pb-2 border-b border-gray-100 dark:border-white/10">
            <div v-for="(h, i) in chartHeights" :key="i" class="flex-1 max-w-[12px] group relative">
              <div class="w-full bg-primary/20 dark:bg-primary/10 rounded-t-[2px] transition-all duration-700" :style="{ height: '100%' }" />
              <div class="absolute bottom-0 w-full bg-primary rounded-t-[2px] transition-all duration-1000 delay-150" :style="{ height: `${h}%` }" />
            </div>
          </div>
          <div class="flex justify-between mt-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            <span>WEEK 01</span><span>WEEK 02</span><span>WEEK 03</span><span>WEEK 04</span>
          </div>
        </div>

        <!-- Data Table -->
        <div class="card overflow-hidden">
          <div class="p-6 border-b border-gray-50 dark:border-white/5 flex items-center justify-between">
            <h3 class="font-bold text-gray-900 dark:text-white">Recent Transactions</h3>
            <button class="text-xs font-bold text-primary tracking-wide uppercase hover:underline">View Ledger</button>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="bg-gray-50 dark:bg-white/5 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                  <th class="px-6 py-4">Participant</th>
                  <th class="px-6 py-4">Product</th>
                  <th class="px-6 py-4 text-right">Value</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50 dark:divide-white/5">
                <tr v-for="i in 5" :key="i" class="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-md bg-primary-50 text-primary-600 flex items-center justify-center font-bold text-xs">JD</div>
                      <div>
                        <div class="font-bold text-gray-900 dark:text-white text-sm">Jane Doe</div>
                        <div class="text-xs text-gray-400 font-medium">Transaction #8129{{i}}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span class="text-sm font-medium text-gray-600 dark:text-gray-300">UX Design Foundations</span>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <span class="font-bold text-gray-900 dark:text-white">₹2,499</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Activity Stream -->
      <div class="space-y-8">
        <div class="card p-8">
          <h3 class="font-bold text-gray-900 dark:text-white mb-6 uppercase text-xs tracking-widest">System Activity</h3>
          <div class="space-y-8">
            <div v-for="i in 5" :key="i" class="flex gap-4 relative">
              <div v-if="i < 5" class="absolute left-[17px] top-8 bottom-[-32px] w-[2px] bg-gray-100 dark:bg-white/5"></div>
              <div class="w-9 h-9 rounded-full bg-white dark:bg-surface-950 border-2 border-primary-100 dark:border-primary-900 flex items-center justify-center shrink-0 z-10">
                <div class="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              </div>
              <div class="pt-1">
                <p class="text-sm font-bold text-gray-900 dark:text-white">New User Registered</p>
                <p class="text-xs text-gray-500 font-medium mt-1">alex.standard@example.com</p>
                <p class="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-wider">2 HOURS AGO</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineComponent, h } from 'vue'

const chartHeights = ref([45, 62, 54, 88, 76, 42, 59, 91, 67, 72, 85, 44, 56, 73, 81])

const adminLinks = [
  { to: '/admin/courses', label: 'Courses', icon: '📚' },
  { to: '/admin/users', label: 'Users', icon: '👥' },
  { to: '/admin/mentors', label: 'Mentors', icon: '🎓' },
  { to: '/admin/assignments', label: 'Tasks', icon: '📝' },
  { to: '/admin/announcements', label: 'Alerts', icon: '📢' },
  { to: '/admin/reports', label: 'Reports', icon: '📊' },
  { to: '/admin/financials', label: 'Finance', icon: '💰' },
  { to: '/admin/settings', label: 'Config', icon: '⚙️' },
]

// Simple SVG Icon components
const IconTrendingUp = defineComponent({ render: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 2 }, [h('path', { d: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' })]) })
const IconUsers = defineComponent({ render: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 2 }, [h('path', { d: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' })]) })
const IconAcademicCap = defineComponent({ render: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 2 }, [h('path', { d: 'M12 14l9-5-9-5-9 5 9 5z' }), h('path', { d: 'M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z' })]) })
const IconCurrencyRupee = defineComponent({ render: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 2 }, [h('path', { d: 'M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z' })]) })

const stats = [
  { label: 'Total Revenue', value: '₹142,500', trend: 12.5, svgIcon: IconCurrencyRupee },
  { label: 'Active Students', value: '2,451', trend: 5.2, svgIcon: IconUsers },
  { label: 'Completions', value: '843', trend: -2.1, svgIcon: IconAcademicCap },
  { label: 'Avg. Rating', value: '4.8', trend: 0.5, svgIcon: IconTrendingUp },
]
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-extrabold text-gray-900 dark:text-white">Manage Users</h2>
      <button class="bg-primary text-white font-semibold px-4 py-2 rounded-xl text-sm">+ Invite User</button>
    </div>
    <div class="grid grid-cols-3 gap-4 mb-6">
      <div v-for="w in widgets" :key="w.label" class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/5 p-5 flex gap-4 items-center">
        <div :class="['w-11 h-11 rounded-xl flex items-center justify-center text-xl', w.color]">{{ w.icon }}</div>
        <div>
          <div class="text-2xl font-extrabold text-gray-900 dark:text-white">{{ w.value }}</div>
          <div class="text-xs text-gray-500">{{ w.label }}</div>
        </div>
      </div>
    </div>
    <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th v-for="h in ['User Details', 'Role', 'Joined Date', 'Enrolled', 'Status', 'Actions']" :key="h"
              class="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{{ h }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in USERS" :key="user.id" class="border-t border-gray-100 dark:border-white/5">
            <td class="px-5 py-3">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{{ user.name[0] }}</div>
                <div>
                  <div class="font-semibold text-gray-900 dark:text-white">{{ user.name }}</div>
                  <div class="text-xs text-gray-500">{{ user.email }}</div>
                </div>
              </div>
            </td>
            <td class="px-5 py-3">
              <span :class="['text-xs font-bold px-2.5 py-1 rounded-full text-white', user.role === 'Admin' ? 'bg-yellow-500' : 'bg-primary']">{{ user.role }}</span>
            </td>
            <td class="px-5 py-3 text-gray-500 text-xs">{{ user.joined }}</td>
            <td class="px-5 py-3 font-semibold text-gray-900 dark:text-white">{{ user.courses }}</td>
            <td class="px-5 py-3">
              <div class="flex items-center gap-1.5">
                <div :class="['w-2 h-2 rounded-full', user.status === 'Active' ? 'bg-green-500' : 'bg-gray-400']" />
                <span :class="['text-xs font-semibold', user.status === 'Active' ? 'text-green-500' : 'text-gray-400']">{{ user.status }}</span>
              </div>
            </td>
            <td class="px-5 py-3 flex gap-2">
              <button @click="assignCourse(user)" class="text-xs border border-gray-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">Assign Course</button>
              <button @click="toggleStatus(user)" :class="['text-xs border rounded-lg px-3 py-1.5 transition-colors', user.status === 'Active' ? 'border-red-200 text-red-500 hover:bg-red-50 dark:border-red-500/30 dark:hover:bg-red-500/10' : 'border-green-200 text-green-500 hover:bg-green-50 dark:border-green-500/30 dark:hover:bg-green-500/10']">{{ user.status === 'Active' ? 'Block' : 'Unblock' }}</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const widgets = [
  { icon: '👥', color: 'bg-blue-100 dark:bg-blue-900/30', value: 4, label: 'Total Users' },
  { icon: '🛡️', color: 'bg-green-100 dark:bg-green-900/30', value: 1, label: 'Admins' },
  { icon: '📈', color: 'bg-teal-100 dark:bg-teal-900/30', value: 3, label: 'Active Learners' },
]
const USERS = ref([
  { id: 1, name: 'Alice Walker', email: 'alice@example.com', role: 'Learner', joined: '2026-03-12', courses: 4, status: 'Active' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'Learner', joined: '2026-04-01', courses: 1, status: 'Active' },
  { id: 3, name: 'Dr. Sarah Chen', email: 'sarah@skillorbit.com', role: 'Admin', joined: '2025-11-20', courses: 0, status: 'Active' },
  { id: 4, name: 'Michael Doe', email: 'michael.doe@example.com', role: 'Learner', joined: '2026-04-18', courses: 2, status: 'Blocked' },
])

function toggleStatus(user: any) {
  user.status = user.status === 'Active' ? 'Blocked' : 'Active'
}

function assignCourse(user: any) {
  alert(`Assign course modal for ${user.name} (Mock)`)
}
</script>

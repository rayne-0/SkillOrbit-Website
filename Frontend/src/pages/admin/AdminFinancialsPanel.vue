<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-extrabold text-gray-900 dark:text-white">Financial Overview</h2>
      <div class="flex gap-3">
        <button class="border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 font-semibold px-4 py-2 rounded-xl text-sm hover:bg-gray-50 transition-colors">Export CSV</button>
        <button class="bg-primary text-white font-semibold px-4 py-2 rounded-xl text-sm">Generate Report</button>
      </div>
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
      <h3 class="px-5 py-4 font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/5">Recent Transactions</h3>
      <table class="w-full text-sm">
        <thead class="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th v-for="h in ['Transaction ID', 'Date', 'Customer', 'Course', 'Amount', 'Status']" :key="h"
              class="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{{ h }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="txn in TRANSACTIONS" :key="txn.id" class="border-t border-gray-100 dark:border-white/5">
            <td class="px-5 py-3 font-mono font-semibold text-xs text-gray-600 dark:text-gray-400">{{ txn.id }}</td>
            <td class="px-5 py-3 text-gray-500">{{ txn.date }}</td>
            <td class="px-5 py-3">{{ txn.user }}</td>
            <td class="px-5 py-3 font-medium">{{ txn.course }}</td>
            <td class="px-5 py-3 font-bold text-gray-900 dark:text-white">{{ txn.amount }}</td>
            <td class="px-5 py-3">
              <span :class="['px-2 py-1 rounded-full text-xs font-semibold', txn.status === 'Success' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400']">{{ txn.status }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
const widgets = [
  { icon: '💰', color: 'bg-yellow-100 dark:bg-yellow-900/30', value: '₹45,200', label: 'Net Revenue (30 days)' },
  { icon: '📈', color: 'bg-teal-100 dark:bg-teal-900/30', value: '+14%', label: 'MoM Growth' },
  { icon: '🔄', color: 'bg-blue-100 dark:bg-blue-900/30', value: '₹1,200', label: 'Refunds Processed' },
]
const TRANSACTIONS = [
  { id: 'TXN-9021', date: '2026-04-19', user: 'Bob Smith', course: 'Advanced React Patterns', amount: '₹1,500', status: 'Success' },
  { id: 'TXN-9020', date: '2026-04-18', user: 'Michael Doe', course: 'Node.js Backend Masterclass', amount: '₹2,200', status: 'Success' },
  { id: 'TXN-9019', date: '2026-04-15', user: 'Alice Walker', course: 'UI/UX Design Fundamentals', amount: '₹1,200', status: 'Refunded' },
]
</script>

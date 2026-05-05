<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Financial Overview</h2>
        <p class="text-sm text-gray-500 mt-1">Revenue, subscriptions, and transaction ledger</p>
      </div>
      <div class="flex gap-3">
        <button @click="exportCSV" class="btn-outline flex items-center gap-2 text-sm py-2 px-4">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          Export CSV
        </button>
        <button @click="generateInvoice" class="btn-primary text-sm py-2 px-4">Generate Report</button>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="w in widgets" :key="w.label" class="card p-5">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">{{ w.label }}</span>
          <span class="text-xl">{{ w.icon }}</span>
        </div>
        <div class="text-2xl font-black text-gray-900 dark:text-white">{{ w.value }}</div>
        <div class="flex items-center gap-1.5 mt-2">
          <span :class="['text-xs font-bold px-2 py-0.5 rounded-full', w.delta > 0 ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400']">
            {{ w.delta > 0 ? '+' : '' }}{{ w.delta }}%
          </span>
          <span class="text-[11px] text-gray-400">vs last month</span>
        </div>
      </div>
    </div>

    <!-- Revenue Chart (bar) -->
    <div class="card p-8">
      <div class="flex items-center justify-between mb-6">
        <h3 class="font-bold text-gray-900 dark:text-white">Monthly Revenue</h3>
        <div class="flex gap-2">
          <button v-for="p in ['3M', '6M', '12M']" :key="p" @click="period = p"
                  :class="['px-3 py-1 rounded-lg text-xs font-bold transition-all', period === p ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-gray-900 dark:hover:text-white']">
            {{ p }}
          </button>
        </div>
      </div>
      <div class="flex items-end gap-2 h-40 pb-2 border-b border-gray-100 dark:border-white/10">
        <div v-for="(bar, i) in chartData" :key="i" class="flex-1 flex flex-col items-center gap-1 group">
          <span class="text-[9px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity font-bold">{{ bar.label }}</span>
          <div class="w-full rounded-t-lg bg-primary/20 dark:bg-primary/10 relative overflow-hidden" :style="{ height: '100%' }">
            <div class="absolute bottom-0 w-full bg-primary rounded-t-lg transition-all duration-700" :style="{ height: `${bar.pct}%` }" />
          </div>
        </div>
      </div>
      <div class="flex justify-between mt-3">
        <span v-for="bar in chartData" :key="bar.month" class="text-[10px] text-gray-400 font-bold">{{ bar.month }}</span>
      </div>
    </div>

    <!-- Subscription Management -->
    <div class="card overflow-hidden">
      <div class="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
        <h3 class="font-bold text-gray-900 dark:text-white">Active Subscriptions</h3>
        <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">{{ subscriptions.length }} total</span>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 dark:bg-white/5">
            <tr>
              <th v-for="h in ['Student', 'Plan', 'Started', 'Renewal', 'Amount', 'Status']" :key="h"
                  class="text-left px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{{ h }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50 dark:divide-white/5">
            <tr v-for="sub in subscriptions" :key="sub.id" class="hover:bg-gray-50/50 dark:hover:bg-white/2 transition-colors">
              <td class="px-5 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary font-bold text-xs shrink-0">{{ sub.name[0] }}</div>
                  <div>
                    <p class="font-bold text-gray-900 dark:text-white text-sm">{{ sub.name }}</p>
                    <p class="text-xs text-gray-400">{{ sub.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-5 py-4 font-medium text-gray-700 dark:text-gray-300">{{ sub.plan }}</td>
              <td class="px-5 py-4 text-gray-500">{{ sub.started }}</td>
              <td class="px-5 py-4 text-gray-500">{{ sub.renewal }}</td>
              <td class="px-5 py-4 font-bold text-gray-900 dark:text-white">{{ sub.amount }}</td>
              <td class="px-5 py-4">
                <span :class="['px-2.5 py-1 rounded-full text-xs font-bold', sub.status === 'Active' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-white/5 text-gray-500']">
                  {{ sub.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Transactions Ledger -->
    <div class="card overflow-hidden">
      <div class="p-6 border-b border-gray-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center gap-4">
        <h3 class="font-bold text-gray-900 dark:text-white flex-1">Transaction Ledger</h3>
        <div class="flex items-center gap-3">
          <select v-model="txnFilter" class="text-xs font-bold border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 bg-white dark:bg-surface-950 text-gray-700 dark:text-gray-300 focus:outline-none">
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="refunded">Refunded</option>
          </select>
          <input v-model="txnSearch" type="text" placeholder="Search…"
                 class="text-xs border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 bg-white dark:bg-surface-950 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/30 w-36" />
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 dark:bg-white/5">
            <tr>
              <th v-for="h in ['TXN ID', 'Date', 'Customer', 'Course', 'Amount', 'Status', 'Action']" :key="h"
                  class="text-left px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{{ h }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50 dark:divide-white/5">
            <tr v-for="txn in filteredTxns" :key="txn.id" class="hover:bg-gray-50/50 dark:hover:bg-white/2 transition-colors group">
              <td class="px-5 py-4 font-mono text-xs font-bold text-gray-500">{{ txn.id }}</td>
              <td class="px-5 py-4 text-gray-500">{{ txn.date }}</td>
              <td class="px-5 py-4 font-medium text-gray-900 dark:text-white">{{ txn.user }}</td>
              <td class="px-5 py-4 text-gray-600 dark:text-gray-300 max-w-[180px] truncate">{{ txn.course }}</td>
              <td class="px-5 py-4 font-black text-gray-900 dark:text-white">{{ txn.amount }}</td>
              <td class="px-5 py-4">
                <span :class="['px-2.5 py-1 rounded-full text-xs font-bold', txn.status === 'Success' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400']">
                  {{ txn.status }}
                </span>
              </td>
              <td class="px-5 py-4">
                <button @click="viewInvoice(txn)" class="text-xs font-bold text-primary hover:underline opacity-0 group-hover:opacity-100 transition-opacity">Invoice</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="!filteredTxns.length" class="py-12 text-center text-gray-400 text-sm">No transactions found.</div>
      </div>
    </div>

    <!-- Invoice Modal -->
    <div v-if="invoiceTxn" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="invoiceTxn = null">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="invoiceTxn = null" />
      <div class="relative bg-white dark:bg-surface-900 rounded-2xl shadow-2xl w-full max-w-md p-8 border border-gray-100 dark:border-white/10">
        <div class="flex items-start justify-between mb-6">
          <div>
            <h3 class="text-xl font-black text-gray-900 dark:text-white">Invoice</h3>
            <p class="text-xs text-gray-400 font-bold mt-1">{{ invoiceTxn.id }}</p>
          </div>
          <button @click="invoiceTxn = null" class="text-gray-400 hover:text-gray-900 dark:hover:text-white text-lg">✕</button>
        </div>
        <div class="space-y-3 mb-6">
          <div class="flex justify-between text-sm"><span class="text-gray-500">Customer</span><span class="font-bold text-gray-900 dark:text-white">{{ invoiceTxn.user }}</span></div>
          <div class="flex justify-between text-sm"><span class="text-gray-500">Product</span><span class="font-bold text-gray-900 dark:text-white">{{ invoiceTxn.course }}</span></div>
          <div class="flex justify-between text-sm"><span class="text-gray-500">Date</span><span class="font-bold text-gray-900 dark:text-white">{{ invoiceTxn.date }}</span></div>
          <div class="flex justify-between text-sm"><span class="text-gray-500">Status</span>
            <span :class="['px-2.5 py-0.5 rounded-full text-xs font-bold', invoiceTxn.status === 'Success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600']">{{ invoiceTxn.status }}</span>
          </div>
          <div class="border-t border-gray-100 dark:border-white/10 pt-3 flex justify-between font-black text-gray-900 dark:text-white"><span>Total</span><span>{{ invoiceTxn.amount }}</span></div>
        </div>
        <button class="btn-primary w-full py-3 text-sm">Download PDF Invoice</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const period = ref('6M')
const txnFilter = ref('all')
const txnSearch = ref('')
const invoiceTxn = ref<any>(null)

const widgets = [
  { icon: '💰', label: 'Net Revenue (30d)', value: '₹45,200', delta: 14 },
  { icon: '📈', label: 'MoM Growth', value: '+14%', delta: 3.2 },
  { icon: '👥', label: 'Active Subscribers', value: '142', delta: 8 },
  { icon: '🔄', label: 'Refunds (30d)', value: '₹1,200', delta: -2 },
]

const chartData = computed(() => {
  const all = [
    { month: 'Oct', label: '₹28k', pct: 55 },
    { month: 'Nov', label: '₹31k', pct: 62 },
    { month: 'Dec', label: '₹38k', pct: 76 },
    { month: 'Jan', label: '₹35k', pct: 70 },
    { month: 'Feb', label: '₹42k', pct: 84 },
    { month: 'Mar', label: '₹39k', pct: 78 },
    { month: 'Apr', label: '₹45k', pct: 90 },
    { month: 'May', label: '₹45k', pct: 92 },
    { month: 'Jun', label: '₹48k', pct: 96 },
    { month: 'Jul', label: '₹50k', pct: 100 },
    { month: 'Aug', label: '₹47k', pct: 94 },
    { month: 'Sep', label: '₹45k', pct: 90 },
  ]
  const count = period.value === '3M' ? 3 : period.value === '6M' ? 6 : 12
  return all.slice(-count)
})

const subscriptions = [
  { id: 1, name: 'Priya Sharma', email: 'priya@example.com', plan: 'Pro Learner', started: '1 Jan 2026', renewal: '1 Jun 2026', amount: '₹999/mo', status: 'Active' },
  { id: 2, name: 'Rahul Gupta', email: 'rahul@example.com', plan: 'Pro Learner', started: '15 Feb 2026', renewal: '15 Jun 2026', amount: '₹999/mo', status: 'Active' },
  { id: 3, name: 'Anjali Mehta', email: 'anjali@example.com', plan: 'Basic', started: '1 Mar 2026', renewal: '1 Jun 2026', amount: '₹499/mo', status: 'Active' },
  { id: 4, name: 'Vikram Singh', email: 'vikram@example.com', plan: 'Pro Learner', started: '10 Dec 2025', renewal: 'Expired', amount: '₹999/mo', status: 'Expired' },
]

const TRANSACTIONS = [
  { id: 'TXN-9024', date: '2 May 2026', user: 'Priya Sharma', course: 'Advanced React Patterns', amount: '₹1,500', status: 'Success' },
  { id: 'TXN-9023', date: '1 May 2026', user: 'Rahul Gupta', course: 'Node.js Backend Masterclass', amount: '₹2,200', status: 'Success' },
  { id: 'TXN-9022', date: '30 Apr 2026', user: 'Anjali Mehta', course: 'UI/UX Design Fundamentals', amount: '₹1,200', status: 'Success' },
  { id: 'TXN-9021', date: '28 Apr 2026', user: 'Bob Smith', course: 'Python for Data Science', amount: '₹1,800', status: 'Success' },
  { id: 'TXN-9020', date: '25 Apr 2026', user: 'Alice Walker', course: 'DevOps with Docker', amount: '₹2,500', status: 'Refunded' },
  { id: 'TXN-9019', date: '20 Apr 2026', user: 'Michael Doe', course: 'TypeScript Mastery', amount: '₹999', status: 'Success' },
  { id: 'TXN-9018', date: '18 Apr 2026', user: 'Sara Khan', course: 'Machine Learning Basics', amount: '₹3,200', status: 'Success' },
]

const filteredTxns = computed(() => {
  let txns = TRANSACTIONS
  if (txnFilter.value !== 'all') txns = txns.filter(t => t.status.toLowerCase() === txnFilter.value)
  if (txnSearch.value.trim()) {
    const q = txnSearch.value.toLowerCase()
    txns = txns.filter(t => t.user.toLowerCase().includes(q) || t.course.toLowerCase().includes(q) || t.id.toLowerCase().includes(q))
  }
  return txns
})

function viewInvoice(txn: any) { invoiceTxn.value = txn }

function exportCSV() {
  const header = 'TXN ID,Date,Customer,Course,Amount,Status\n'
  const rows = TRANSACTIONS.map(t => `${t.id},${t.date},${t.user},${t.course},${t.amount},${t.status}`).join('\n')
  const blob = new Blob([header + rows], { type: 'text/csv' })
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'skillorbit_transactions.csv'; a.click()
}

function generateInvoice() { alert('PDF report generation would be handled by the backend.') }
</script>

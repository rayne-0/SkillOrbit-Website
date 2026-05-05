<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="font-heading text-2xl font-bold text-gray-900 dark:text-white">Assignment Submissions</h2>
        <p class="text-sm text-gray-500">Review pending assignments and provide grades.</p>
      </div>
    </div>

    <div class="card overflow-hidden">
      <table class="w-full text-sm text-left">
        <thead class="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10 text-xs uppercase tracking-wider text-gray-500 font-bold">
          <tr><th class="px-6 py-4">Student</th><th class="px-6 py-4">Assignment</th><th class="px-6 py-4">Status</th><th class="px-6 py-4">Date</th><th class="px-6 py-4 text-right">Action</th></tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-white/10 text-gray-700 dark:text-gray-300">
          <tr v-for="sub in assignmentStore.submissions" :key="sub.id" class="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            <td class="px-6 py-4 font-semibold text-gray-900 dark:text-white">{{ sub.studentName }}</td>
            <td class="px-6 py-4">
              <div class="text-gray-900 dark:text-white font-medium">{{ sub.title }}</div>
              <div class="text-xs text-gray-500">{{ sub.courseName }}</div>
            </td>
            <td class="px-6 py-4">
              <span :class="['px-2 py-1 rounded text-xs font-bold', sub.status === 'reviewed' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400']">
                {{ sub.status === 'reviewed' ? 'Reviewed' : 'Pending' }}
              </span>
            </td>
            <td class="px-6 py-4 text-gray-500 text-xs">{{ new Date(sub.submittedAt).toLocaleDateString() }}</td>
            <td class="px-6 py-4 text-right">
              <button v-if="sub.status === 'pending'" @click="review(sub.id)" class="btn-primary py-1 px-3 text-xs">Review</button>
              <button v-else class="btn-outline py-1 px-3 text-xs">View</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAssignmentStore } from '../../stores/assignment'
const assignmentStore = useAssignmentStore()

function review(id: string) {
  assignmentStore.reviewSubmission(id, 100, 'Excellent work! Everything looks perfect.')
  alert('Mock review applied: 100%')
}
</script>

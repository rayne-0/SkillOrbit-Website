<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="font-heading text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h2>
        <p class="text-sm text-gray-500">View detailed performance reports and download exports.</p>
      </div>
      <div class="flex gap-2">
        <button class="btn-outline py-2 px-4 text-sm font-semibold border-white/20 text-white">⬇ Export PDF</button>
        <button class="btn-primary py-2 px-4 text-sm font-semibold">⬇ Export Excel</button>
      </div>
    </div>

    <div class="grid md:grid-cols-2 gap-8 mb-8">
      <div class="card p-6">
        <h3 class="font-bold text-white mb-4">Course Completion Rates</h3>
        <div class="space-y-4">
          <div v-for="c in [ {n: 'Advanced React Patterns', p: 82}, {n: 'Python Data Science', p: 64}, {n: 'UI/UX Masterclass', p: 45} ]" :key="c.n">
            <div class="flex justify-between text-xs text-gray-400 mb-1">
              <span>{{ c.n }}</span>
              <span class="text-white font-bold">{{ c.p }}%</span>
            </div>
            <div class="h-2 bg-white/10 rounded-full overflow-hidden">
              <div class="h-full bg-accent rounded-full" :style="{ width: c.p + '%' }" />
            </div>
          </div>
        </div>
      </div>

      <div class="card p-6">
        <h3 class="font-bold text-white mb-4">Intern Performance Summary</h3>
        <div class="flex items-center gap-6">
          <div class="relative w-32 h-32 rounded-full border-8 border-white/5 flex flex-col items-center justify-center shrink-0">
            <svg class="absolute inset-0 w-full h-full -rotate-90">
              <circle cx="50%" cy="50%" r="46%" stroke="currentColor" stroke-width="8" fill="none" class="text-primary" stroke-dasharray="100 100" />
            </svg>
            <span class="text-2xl font-bold text-white leading-none">85%</span>
            <span class="text-[10px] text-gray-500 uppercase tracking-wider font-bold mt-1">Avg Score</span>
          </div>
          <div class="space-y-2 flex-1">
            <div class="flex justify-between text-sm"><span class="text-gray-400">Total Assignments</span><span class="text-white font-bold">1,245</span></div>
            <div class="flex justify-between text-sm"><span class="text-gray-400">Assignments Graded</span><span class="text-white font-bold">1,120</span></div>
            <div class="flex justify-between text-sm"><span class="text-gray-400">Average Quiz Score</span><span class="text-white font-bold">78%</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

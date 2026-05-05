<template>
  <div class="overflow-hidden bg-white dark:bg-surface-950">
    <!-- Clean Professional Hero -->
    <section class="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
      <!-- Background Accents -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-50 dark:bg-primary/5 rounded-full blur-[120px] -mr-96 -mt-96" />
        <div class="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent-50 dark:bg-accent/5 rounded-full blur-[100px] -ml-72 -mb-72" />
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 w-full py-20">
        <div class="grid lg:grid-cols-2 gap-16 items-center">
          <div class="animate-fade-right">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-primary-50 dark:bg-primary/10 border border-primary-100 dark:border-primary-900/50 mb-8">
              <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span class="text-[10px] font-bold text-primary-700 dark:text-primary-300 uppercase tracking-widest">Enterprise Learning Platform</span>
            </div>
            
            <h1 class="text-6xl sm:text-7xl font-extrabold text-gray-900 dark:text-white leading-[1.1] tracking-tight mb-8">
              Architecting <span class="text-primary italic">Expertise</span> Through Structured Learning.
            </h1>
            
            <p class="text-xl text-gray-500 font-medium mb-10 leading-relaxed max-w-lg">
              World-class curriculum, verified certifications, and advanced educational frameworks designed for the modern industry.
            </p>
            
            <div class="flex flex-wrap gap-4">
              <RouterLink to="/courses" class="btn-primary text-sm px-10 py-4 uppercase tracking-widest font-bold">Catalog Exploration</RouterLink>
              <RouterLink to="/login" class="btn-outline text-sm px-10 py-4 uppercase tracking-widest font-bold">Account Registration</RouterLink>
            </div>
            
            <div class="flex items-center gap-10 mt-16 pt-10 border-t border-gray-100 dark:border-white/5">
              <div>
                <div class="text-3xl font-black text-gray-900 dark:text-white mb-1">2M+</div>
                <div class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Global Participants</div>
              </div>
              <div>
                <div class="text-3xl font-black text-gray-900 dark:text-white mb-1">4.9/5</div>
                <div class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Market Satisfaction</div>
              </div>
            </div>
          </div>

          <!-- Feature Visualization -->
          <div class="relative hidden lg:block animate-fade-left">
            <div class="relative w-full aspect-square max-w-lg mx-auto">
              <div class="absolute inset-0 bg-gray-50 dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/5 transform rotate-3 scale-95" />
              <div class="absolute inset-0 bg-white dark:bg-surface-900 rounded-3xl border border-gray-100 dark:border-white/10 shadow-2xl overflow-hidden p-10 flex flex-col justify-center">
                 <div class="space-y-8">
                   <div v-for="i in 3" :key="i" class="flex gap-6 items-center">
                     <div class="w-12 h-12 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center shrink-0">
                       <div class="w-4 h-4 rounded-full bg-primary" :style="{ opacity: 1 - (i-1)*0.3 }"></div>
                     </div>
                     <div class="flex-1 space-y-2">
                       <div class="h-2 w-3/4 bg-gray-100 dark:bg-white/10 rounded-full" />
                       <div class="h-1.5 w-1/2 bg-gray-50 dark:bg-white/5 rounded-full" />
                     </div>
                   </div>
                 </div>
                 <div class="mt-12 pt-10 border-t border-gray-50 dark:border-white/5 flex items-center justify-between">
                   <div class="flex -space-x-3">
                     <div v-for="i in 4" :key="i" class="w-10 h-10 rounded-full border-2 border-white dark:border-surface-900 bg-gray-200" />
                   </div>
                   <div class="text-xs font-bold text-primary uppercase tracking-widest">Joining 2.4k others</div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Trusted By Section -->
    <section class="py-12 bg-gray-50 dark:bg-white/5 border-y border-gray-100 dark:border-white/5">
      <div class="max-w-7xl mx-auto px-4">
        <p class="text-center text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mb-10">Strategic Industry Partners</p>
        <div class="flex justify-between items-center opacity-40 grayscale hover:grayscale-0 transition-all duration-700 max-w-5xl mx-auto flex-wrap gap-10">
          <span class="text-xl font-bold tracking-tighter">CORP_ALFA</span>
          <span class="text-xl font-bold tracking-tighter">OMEGA_SYSTEMS</span>
          <span class="text-xl font-bold tracking-tighter">SIGMA_GLOBAL</span>
          <span class="text-xl font-bold tracking-tighter">TECH_CORE</span>
          <span class="text-xl font-bold tracking-tighter">DATA_FLOW</span>
        </div>
      </div>
    </section>

    <!-- Professional Features -->
    <section class="py-32 bg-white dark:bg-surface-950">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="mb-20">
          <h2 class="text-sm font-bold text-primary uppercase tracking-[0.3em] mb-4">Core Competencies</h2>
          <h3 class="text-4xl font-bold text-gray-900 dark:text-white tracking-tight max-w-xl">Advanced learning frameworks for modern industry requirements.</h3>
        </div>

        <div class="grid md:grid-cols-3 gap-10">
          <div v-for="f in FEATURES" :key="f.title" class="card p-10 group hover:border-primary/40 transition-all border-gray-100 flex flex-col h-full">
            <div class="w-14 h-14 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-2xl mb-8 group-hover:scale-110 transition-transform duration-500">
              {{ f.icon }}
            </div>
            <h4 class="text-xl font-bold text-gray-900 dark:text-white mb-4">{{ f.title }}</h4>
            <p class="text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-8 flex-1">
              {{ f.desc }}
            </p>
            <div class="h-0.5 w-8 bg-primary rounded-full" />
          </div>
        </div>
      </div>
    </section>

    <!-- Corporate CTA -->
    <section class="py-32 bg-gray-900 dark:bg-white relative overflow-hidden">
      <div class="absolute inset-0 bg-primary/5 opacity-10" />
      <div class="max-w-4xl mx-auto px-4 text-center relative z-10">
        <h2 class="text-4xl md:text-5xl font-black text-white dark:text-gray-900 mb-8 tracking-tight">Ready to integrate SkillOrbit into your professional roadmap?</h2>
        <p class="text-xl text-gray-400 dark:text-gray-500 mb-12 max-w-2xl mx-auto font-medium">Join an elite network of learners and organizations achieving unprecedented results through our platform.</p>
        <RouterLink to="/login" class="btn-primary text-sm px-12 py-5 uppercase tracking-widest font-bold shadow-2xl">Initialize Registration</RouterLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { onMounted } from 'vue'

const FEATURES = [
  {
    icon: '📊',
    title: 'Adaptive Analytics',
    desc: 'Advanced tracking metrics to monitor progression, engagement, and mastery of core concepts throughout your journey.'
  },
  {
    icon: '🏢',
    title: 'Industry Alignment',
    desc: 'Curriculum designed in coordination with industry leaders to ensure all skills taught are immediately applicable in high-stakes environments.'
  },
  {
    icon: '🔐',
    title: 'Verified Proof',
    desc: 'Secure, cryptographically verifiable certifications that provide definitive proof of your expertise to any organization globally.'
  }
]

onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('is-visible')
    })
  }, { threshold: 0.1 })
  
  document.querySelectorAll('.animate-fade-up, .animate-fade-left, .animate-fade-right').forEach(el => observer.observe(el))
})
</script>

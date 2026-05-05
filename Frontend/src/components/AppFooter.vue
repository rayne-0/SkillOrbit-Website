<template>
  <footer class="bg-white dark:bg-surface-950 border-t border-gray-100 dark:border-white/5 pt-20 pb-10 text-sm text-gray-500">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
        
        <!-- Brand Block -->
        <div class="lg:col-span-2 space-y-6">
          <RouterLink to="/" class="flex items-center gap-2.5 group inline-flex">
            <div class="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-white font-black text-xs tracking-tighter">SO</div>
            <span class="font-bold text-gray-900 dark:text-white text-2xl tracking-tight">Skill<span class="text-primary font-black">Orbit</span></span>
          </RouterLink>
          <p class="leading-relaxed text-gray-500 dark:text-gray-400 max-w-sm">
            Empowering the next generation of digital professionals with structured learning, expert mentorship, and industry-standard certifications.
          </p>
          <div class="flex gap-4 pt-2">
            <a v-for="i in SOCIALS" :key="i.label" href="#" 
               class="w-10 h-10 rounded-lg border border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center justify-center text-gray-400 hover:text-primary transition-all">
               <component :is="i.icon" class="w-5 h-5" />
            </a>
          </div>
        </div>

        <!-- Sitemap -->
        <div v-for="col in LINK_COLS" :key="col.title">
          <h4 class="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-[0.2em] mb-6">{{ col.title }}</h4>
          <ul class="space-y-4">
            <li v-for="l in col.links" :key="l.label">
              <RouterLink v-if="l.to" :to="l.to" class="hover:text-primary transition-colors font-medium">{{ l.label }}</RouterLink>
              <a v-else href="#" class="hover:text-primary transition-colors font-medium">{{ l.label }}</a>
            </li>
          </ul>
        </div>

        <!-- Newsletter Sub -->
        <div class="space-y-6">
          <h4 class="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-[0.2em]">Stay Updated</h4>
          <p class="text-xs leading-relaxed text-gray-400">Receive weekly curriculum updates and career insights.</p>
          <form @submit.prevent="" class="space-y-3">
            <input type="email" placeholder="professional@email.com" 
                   class="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-lg px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-primary/40 transition-all" />
            <button class="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg py-3 text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all">Subscribe Now</button>
          </form>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="pt-10 border-t border-gray-50 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
        <div class="flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest">
          <p>&copy; {{ new Date().getFullYear() }} SkillOrbit Inc.</p>
          <div class="hidden md:flex gap-6">
            <a href="#" class="hover:text-primary transition-colors">Privacy</a>
            <a href="#" class="hover:text-primary transition-colors">Terms</a>
          </div>
        </div>
        <div class="flex items-center gap-2 text-xs font-medium text-gray-400">
          <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          All systems operational
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { h, defineComponent } from 'vue'

const IconTwitter = defineComponent({ render: () => h('svg', { fill: 'currentColor', viewBox: '0 0 24 24' }, [h('path', { d: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' })]) })
const IconLinkedin = defineComponent({ render: () => h('svg', { fill: 'currentColor', viewBox: '0 0 24 24' }, [h('path', { d: 'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z' })]) })
const IconGithub = defineComponent({ render: () => h('svg', { fill: 'currentColor', viewBox: '0 0 24 24' }, [h('path', { d: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12' })]) })

const SOCIALS = [
  { label: 'Twitter', icon: IconTwitter },
  { label: 'LinkedIn', icon: IconLinkedin },
  { label: 'GitHub', icon: IconGithub },
]

const LINK_COLS = [
  {
    title: 'Platform',
    links: [
      { label: 'Browse Courses', to: '/courses' },
      { label: 'Mentor Network', to: '/about' },
      { label: 'Leaderboard', to: '/leaderboard' },
      { label: 'Pricing Plans', to: '/contact' },
    ]
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', to: '#' },
      { label: 'Community Forum', to: '#' },
      { label: 'Career Guide', to: '#' },
      { label: 'Skill Assessment', to: '#' },
    ]
  }
]
</script>

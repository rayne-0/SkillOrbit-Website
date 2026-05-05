<template>
  <div ref="pageRef" class="min-h-screen bg-[#F8F9FA] dark:bg-surface-950 pb-24">
    <!-- Professional Clean Hero -->
    <section class="bg-white dark:bg-surface-900 border-b border-gray-200 dark:border-white/5 py-24 relative overflow-hidden">
      <!-- Subtle Background Accents -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -mr-48 -mt-48" />
        <div class="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[80px] -ml-24 -mb-24" />
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div class="max-w-3xl animate-fade-left">
          <h1 class="text-5xl sm:text-7xl font-bold text-gray-900 dark:text-white tracking-tight mb-8 leading-[1.1]">
            Empowering the Next <span class="text-primary italic">Generation</span> of Professionals
          </h1>
          <p class="text-xl text-gray-600 dark:text-gray-400 font-medium leading-relaxed mb-10">
            SkillOrbit was founded on a simple belief: world-class education shouldn't be locked behind geography or tuition fees. We're on a mission to give every learner on Earth the skills to thrive.
          </p>
          <div class="flex gap-4">
            <RouterLink to="/courses" class="btn-primary px-10 py-4 text-sm font-bold uppercase tracking-widest shadow-lg shadow-primary/20">Explore Curriculum</RouterLink>
            <RouterLink to="/contact" class="btn-outline px-10 py-4 text-sm font-bold uppercase tracking-widest">Partner With Us</RouterLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Executive Overview / Stats -->
    <section class="py-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="grid lg:grid-cols-2 gap-20 items-center">
          <div class="space-y-8 animate-fade-left">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">
              <span class="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              Our Mission
            </div>
            <h2 class="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Accessible Education for a Global Workforce.</h2>
            <div class="space-y-6 text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
              <p>We believe a high-quality education is a fundamental right, not a privilege. SkillOrbit partners with industry-leading experts, top universities, and forward-thinking companies to deliver skills that actually matter in the modern workforce.</p>
              <p>Our learners don't just watch videos — they build real projects, earn recognized credentials, and join a community of millions who are transforming their lives through learning.</p>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4 animate-fade-right">
            <div v-for="s in STATS" :key="s.label" class="card p-8 group hover:border-primary/30 transition-all flex flex-col justify-center bg-white shadow-sm border-gray-100">
              <div class="text-4xl font-black text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">{{ s.value }}</div>
              <div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{{ s.label }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Leadership Panel -->
    <section class="py-24 bg-gray-50 dark:bg-white/5 border-y border-gray-100 dark:border-white/5">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="text-center mb-20">
          <h2 class="text-sm font-bold text-primary uppercase tracking-[0.3em] mb-4">Leadership</h2>
          <h3 class="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Meet the Architects of Your Growth</h3>
        </div>
        
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div v-for="m in TEAM" :key="m.name" class="card group p-0 overflow-hidden bg-white hover:shadow-2xl transition-all border-none">
            <div :style="{ background: m.color }" class="h-48 flex items-center justify-center text-5xl font-black text-white/40 group-hover:text-white/80 transition-all duration-500">
              {{ m.initials }}
            </div>
            <div class="p-8">
              <h4 class="text-lg font-bold text-gray-900 dark:text-white mb-1">{{ m.name }}</h4>
              <p class="text-[10px] font-bold text-primary uppercase tracking-widest mb-6">{{ m.role }}</p>
              <p class="text-sm text-gray-500 font-medium leading-relaxed">{{ m.bio }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Organizational Values -->
    <section class="py-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="text-center mb-20">
          <h2 class="text-sm font-bold text-primary uppercase tracking-[0.3em] mb-4">Philosophy</h2>
          <h3 class="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">What We Stand For</h3>
        </div>
        
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="v in VALUES" :key="v.title" class="card p-10 hover:border-primary/20 transition-all bg-white shadow-sm border-gray-100">
            <div class="text-4xl mb-6">{{ v.icon }}</div>
            <h4 class="text-lg font-bold text-gray-900 dark:text-white mb-3">{{ v.title }}</h4>
            <p class="text-sm text-gray-500 font-medium leading-relaxed">{{ v.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Corporate History -->
    <section class="py-24 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-white/5">
      <div class="max-w-5xl mx-auto px-4 sm:px-6">
        <div class="text-center mb-20">
          <h2 class="text-sm font-bold text-primary uppercase tracking-[0.3em] mb-4">Historical Progression</h2>
          <h3 class="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Our Journey So Far</h3>
        </div>
        
        <div class="space-y-4">
          <div v-for="t in TIMELINE" :key="t.year" class="card p-8 bg-white hover:border-primary/20 transition-all flex flex-col sm:flex-row gap-8 items-start sm:items-center shadow-sm border-gray-100">
            <div class="text-3xl font-black text-primary italic shrink-0">{{ t.year }}</div>
            <div class="h-12 w-px bg-gray-100 hidden sm:block" />
            <div>
              <h4 class="text-lg font-bold text-gray-900 dark:text-white mb-1">{{ t.title }}</h4>
              <p class="text-sm text-gray-500 font-medium">{{ t.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useScrollAnimation } from '../composables/useScrollAnimation'

const pageRef = ref<HTMLElement | null>(null)
useScrollAnimation(pageRef)

const STATS = [
  { value: '5M+', label: 'Global Learners' },
  { value: '180+', label: 'Countries Reached' },
  { value: '92%', label: 'Report Career Impact' },
  { value: '1,200+', label: 'Strategic Partners' },
]

const TEAM = [
  { name: 'Shivam Thakur', role: 'Founder', initials: 'ST', color: '#0056D2', bio: 'Shivam is the mind behind Skill Orbit. With a deep passion for technology and innovation, he laid the foundation of this startup with a mission to make technical learning more accessible and practical.' },
  { name: 'Anurag Roy', role: 'Director', initials: 'AR', color: '#7c3aed', bio: 'Anurag plays a vital role in managing the overall operations of Skill Orbit. From strategic planning to ensuring smooth execution of projects, his strong management skills help the team stay focused.' },
  { name: 'Roshan Kumar', role: 'Managing Director', initials: 'RK', color: '#00BFA5', bio: 'Roshan oversees the direction and development of various initiatives. His technical insights and commitment to excellence ensure that Skill Orbit always maintains the highest standards.' },
  { name: 'Sahil Kumar', role: 'Marketing Director', initials: 'SK', color: '#F5A623', bio: 'Sahil plays a crucial role in market management and traffic control and oversees the security algorithm of the platform.' },
]

const VALUES = [
  { icon: '🌍', title: 'Accessible Education', desc: 'Every person deserves world-class learning, regardless of location, background, or financial situation.' },
  { icon: '🏆', title: 'Excellence in Teaching', desc: 'We partner only with expert instructors who can explain complex ideas in engaging, practical ways.' },
  { icon: '🤝', title: 'Community First', desc: 'Learning is better together. Our global community supports every learner at every step.' },
  { icon: '🔬', title: 'Data-Driven Outcomes', desc: 'We measure what matters — career transitions, salary growth, and real skill acquisition.' },
  { icon: '🚀', title: 'Always Evolving', desc: 'Technology and skills change fast. We update content continuously to stay ahead of the curve.' },
  { icon: '❤️', title: 'Learner Obsessed', desc: 'Every product decision starts with one question: does this make learning better for students?' },
]

const TIMELINE = [
  { year: '2018', title: 'SkillOrbit Founded', desc: 'Started in a garage with 12 courses and a mission to democratize professional education.' },
  { year: '2019', title: 'First 100K Learners', desc: 'Hit 100,000 registered students. Launched mobile app for iOS and Android.' },
  { year: '2020', title: 'Global Expansion', desc: 'Expanded to 50+ countries. Launched multilingual courses. Raised Series A funding.' },
  { year: '2021', title: 'University Partnerships', desc: 'Partnered with 30 universities to offer accredited certificates and micro-degrees.' },
  { year: '2023', title: 'AI-Powered Learning', desc: 'Launched adaptive learning engine that personalizes the learning path for every student.' },
  { year: '2025', title: '5 Million Learners', desc: 'Reached 5 million active students, 15,000+ courses, and partners in 180 countries.' },
]
</script>

<template>
  <div ref="pageRef" class="min-h-screen bg-[#F8F9FA] dark:bg-surface-950">
    <!-- Clean Professional Hero -->
    <section class="bg-white dark:bg-surface-900 border-b border-gray-200 dark:border-white/5 py-24 relative overflow-hidden">
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] -ml-24 -mb-24" />
      </div>

      <div class="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10 animate-fade-up">
        <h1 class="text-5xl sm:text-6xl font-bold text-gray-900 dark:text-white tracking-tight mb-8">
          How Can We <span class="text-primary italic">Help?</span>
        </h1>
        <p class="text-xl text-gray-600 dark:text-gray-400 font-medium leading-relaxed max-w-2xl mx-auto">
          Our team typically responds within 24 hours. We'd love to hear from you — whether you're a learner, instructor, or partner.
        </p>
      </div>
    </section>

    <!-- Main Content Area -->
    <section class="py-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-5 gap-16">
        <!-- Contact Information Blocks -->
        <div class="lg:col-span-2 space-y-6">
          <div v-for="info in CONTACT_INFO" :key="info.title" 
               class="card p-8 group hover:border-primary/40 transition-all flex flex-col h-fit bg-white">
            <div class="text-3xl mb-6 group-hover:scale-110 transition-transform duration-300">{{ info.icon }}</div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">{{ info.title }}</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-6">{{ info.desc }}</p>
            <div class="text-sm font-bold text-primary uppercase tracking-widest">{{ info.cta }}</div>
            <div v-if="info.sub" class="text-xs text-gray-400 mt-2 font-medium">{{ info.sub }}</div>
          </div>

          <!-- Social Connectivity -->
          <div class="card p-8 bg-white">
            <h3 class="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-6">Global Connectivity</h3>
            <div class="flex gap-4">
              <a v-for="s in SOCIALS" :key="s.label" :href="s.href" :aria-label="s.label"
                class="w-11 h-11 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 flex items-center justify-center text-gray-500 hover:text-primary hover:bg-primary/10 transition-all font-bold">
                {{ s.icon }}
              </a>
            </div>
          </div>
        </div>

        <!-- Contact Form Module -->
        <div class="lg:col-span-3">
          <div class="card p-10 bg-white shadow-xl border-none">
            <div v-if="submitted" class="text-center py-16 animate-scale-in">
              <div class="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-3xl mx-auto mb-8">🎉</div>
              <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">Message Received</h2>
              <p class="text-gray-500 font-medium max-w-sm mx-auto">Thanks for reaching out, {{ form.name }}. We'll get back to you at {{ form.email }} within 24 hours.</p>
              <button @click="submitted = false; resetForm()"
                class="mt-10 text-xs font-bold text-primary uppercase tracking-[0.2em] hover:underline">New Inquiry</button>
            </div>
            
            <template v-else>
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-8 tracking-tight">Send Us a Message</h2>
              <div v-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-500/20 text-red-600 rounded-lg p-4 text-sm mb-6 font-medium">{{ error }}</div>
              
              <form @submit.prevent="handleSubmit" class="space-y-8">
                <div class="grid sm:grid-cols-2 gap-8">
                  <div class="space-y-2">
                    <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Your Name</label>
                    <input v-model="form.name" type="text" required class="input py-3 px-4" placeholder="Jane Doe" />
                  </div>
                  <div class="space-y-2">
                    <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                    <input v-model="form.email" type="email" required class="input py-3 px-4" placeholder="you@example.com" />
                  </div>
                </div>
                
                <div class="space-y-2">
                  <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Subject</label>
                  <select v-model="form.type" class="input py-3 px-4 appearance-none">
                    <option v-for="t in TYPES" :key="t">{{ t }}</option>
                  </select>
                </div>
                
                <div class="space-y-2">
                  <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Your Message</label>
                  <textarea v-model="form.message" rows="5" required class="input py-3 px-4 resize-none" placeholder="Tell us more about how we can help…" />
                </div>
                
                <button type="submit" :disabled="loading" 
                        class="btn-primary w-full py-4 uppercase tracking-[0.2em] font-bold text-xs shadow-lg shadow-primary/20">
                  {{ loading ? 'Transmitting…' : 'Send Message →' }}
                </button>
              </form>
            </template>
          </div>
        </div>
      </div>
    </section>

    <!-- Support FAQ Architecture -->
    <section class="py-24 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-white/5">
      <div class="max-w-3xl mx-auto px-4 sm:px-6">
        <div class="text-center mb-16">
          <h2 class="text-sm font-bold text-primary uppercase tracking-[0.3em] mb-4">Support Hub</h2>
          <h3 class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Frequently Asked Questions</h3>
        </div>
        
        <div class="space-y-4">
          <div v-for="(faq, i) in FAQS" :key="i" class="card bg-white overflow-hidden border-gray-100">
            <button @click="openFaq = openFaq === i ? -1 : i" class="w-full flex items-center justify-between px-8 py-6 text-left hover:bg-gray-50 transition-colors">
              <span class="font-bold text-gray-900 dark:text-white text-sm tracking-tight">{{ faq.q }}</span>
              <svg :class="['w-4 h-4 text-gray-400 transition-transform duration-300', openFaq === i ? 'rotate-180' : '']" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
            </button>
            <div v-if="openFaq === i" class="px-8 pb-8 text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium animate-fade-up">
              {{ faq.a }}
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useScrollAnimation } from '../composables/useScrollAnimation'

const pageRef = ref<HTMLElement | null>(null)
useScrollAnimation(pageRef)

const submitted = ref(false)
const loading = ref(false)
const error = ref('')
const openFaq = ref(-1)
const form = reactive({ name: '', email: '', type: 'General Inquiry', message: '' })

const TYPES = ['General Inquiry', 'Course Technical Issue', 'Billing & Payments', 'Become an Instructor', 'Enterprise / Teams', 'Partnership Opportunity', 'Other']

function resetForm() {
  form.name = ''
  form.email = ''
  form.type = 'General Inquiry'
  form.message = ''
}

async function handleSubmit() {
  error.value = ''; loading.value = true
  try {
    const res = await fetch('http://localhost:8000/api/contact/', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form }),
    })
    const data = await res.json()
    if (data.success) submitted.value = true
    else {
      // Simulate success for demo
      submitted.value = true
    }
  } catch {
    submitted.value = true
  } finally { loading.value = false }
}

const CONTACT_INFO = [
  { icon: '📧', title: 'Email Address', desc: 'Reach our helpdesk directly for any technical or course inquiries.', cta: 'helpdesk@skillorbit.online', sub: 'Response within 24 hours' },
  { icon: '📞', title: 'Mobile Contact', desc: 'Speak with our support team during business hours.', cta: '+91 8683045908', sub: 'Mon–Sat, 10am–7pm IST' },
  { icon: '🏢', title: 'Headquarters', desc: 'Office no 201310, Q-Tower, Gaur Yamuna City, Uttar Pradesh', cta: 'Gaur Yamuna City' },
]

const SOCIALS = [
  { icon: '𝕏', label: 'Twitter', href: '#' },
  { icon: 'in', label: 'LinkedIn', href: '#' },
  { icon: '▶', label: 'YouTube', href: '#' },
  { icon: 'f', label: 'Facebook', href: '#' },
  { icon: '📸', label: 'Instagram', href: '#' },
]

const FAQS = [
  { q: 'Are courses on SkillOrbit free?', a: 'Many courses are free. Premium courses range from $9.99–$24.99, and we regularly offer discounts. Financial aid is available for students who qualify.' },
  { q: 'Do I get a certificate after completing a course?', a: 'Yes! Every paid course and most free courses include a shareable Certificate of Completion you can add to LinkedIn or your CV.' },
  { q: 'How do I become an instructor?', a: 'Apply through our instructor portal. We review your subject expertise, teaching ability, and course outline before approving new instructors.' },
  { q: 'Can businesses purchase for teams?', a: 'Yes. SkillOrbit for Teams offers volume licensing, progress tracking, and custom learning paths for organizations of any size.' },
  { q: 'Is there a mobile app?', a: 'Yes! SkillOrbit is available on iOS and Android. You can download lessons for offline viewing.' },
  { q: 'What is your refund policy?', a: 'We offer a 30-day money-back guarantee on all paid courses, no questions asked.' },
]
</script>

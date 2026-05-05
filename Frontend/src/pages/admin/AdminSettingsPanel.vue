<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-extrabold text-gray-900 dark:text-white">Portal Settings</h2>
      <button @click="handleSave" :disabled="saving" class="bg-primary text-white font-semibold px-4 py-2 rounded-xl text-sm hover:bg-primary/90 transition-colors disabled:opacity-50">
        {{ saving ? 'Saving…' : '💾 Save Changes' }}
      </button>
    </div>
    <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/5 p-6">
      <div class="grid md:grid-cols-2 gap-10">
        <!-- General -->
        <div>
          <h3 class="font-bold text-primary border-b border-gray-100 dark:border-white/5 pb-2 mb-5">General Configurations</h3>
          <div class="space-y-4">
            <div>
              <label class="text-xs font-bold text-gray-500 uppercase mb-1 block">Platform Name</label>
              <input type="text" defaultValue="SkillOrbit" class="w-full border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm bg-transparent outline-none focus:border-primary/50" />
            </div>
            <div>
              <label class="text-xs font-bold text-gray-500 uppercase mb-1 block">Support Email</label>
              <input type="email" defaultValue="support@skillorbit.com" class="w-full border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm bg-transparent outline-none focus:border-primary/50" />
            </div>
            <div>
              <label class="text-xs font-bold text-gray-500 uppercase mb-1 block">Default Currency</label>
              <select class="w-full border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm bg-transparent outline-none">
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
          </div>
        </div>
        <!-- Security -->
        <div>
          <h3 class="font-bold text-primary border-b border-gray-100 dark:border-white/5 pb-2 mb-5">Security & Access</h3>
          <div class="space-y-3">
            <div v-for="toggle in TOGGLES" :key="toggle.label" class="flex items-center justify-between p-4 border border-gray-100 dark:border-white/5 rounded-xl">
              <div>
                <div class="font-semibold text-gray-900 dark:text-white text-sm">{{ toggle.label }}</div>
                <div class="text-xs text-gray-500">{{ toggle.desc }}</div>
              </div>
              <button @click="toggle.value = !toggle.value"
                :class="['w-11 h-6 rounded-full transition-colors relative flex-shrink-0', toggle.value ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700']">
                <div :class="['absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform', toggle.value ? 'translate-x-5' : 'translate-x-0.5']" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
const saving = ref(false)
const TOGGLES = reactive([
  { label: 'Maintenance Mode', desc: 'Disable access to the public site', value: false },
  { label: 'Open Registrations', desc: 'Allow new users to sign up', value: true },
  { label: 'Enforce 2FA for Admins', desc: 'Require two-factor auth for panel access', value: true },
])
function handleSave() {
  saving.value = true
  setTimeout(() => { saving.value = false; alert('Settings saved successfully!') }, 1000)
}
</script>

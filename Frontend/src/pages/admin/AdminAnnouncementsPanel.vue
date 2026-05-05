<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="font-heading text-2xl font-bold text-gray-900 dark:text-white">Announcement System</h2>
        <p class="text-sm text-gray-500">Broadcast live classes and notifications to all users.</p>
      </div>
    </div>

    <div class="grid lg:grid-cols-3 gap-8">
      <div class="lg:col-span-1">
        <div class="card p-6 sticky top-24">
          <h3 class="font-bold text-lg text-white mb-4">New Broadcast</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Title</label>
              <input v-model="title" type="text" class="input w-full" placeholder="e.g. Live Q&A Session" />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Type</label>
              <select v-model="type" class="input w-full bg-black/40 text-white border border-white/10">
                <option value="system">System Notification</option>
                <option value="live_class">Live Class Alert</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Message</label>
              <textarea v-model="message" rows="3" class="input w-full resize-none" placeholder="Enter message text..."></textarea>
            </div>
            <div v-if="type === 'live_class'">
              <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Meeting Link</label>
              <input v-model="link" type="text" class="input w-full" placeholder="https://zoom.us/..." />
            </div>
            <button @click="send" class="btn-primary w-full py-2.5">Broadcast Now</button>
          </div>
        </div>
      </div>

      <div class="lg:col-span-2 space-y-4">
        <div v-for="ann in announcementStore.announcements" :key="ann.id" class="card p-5 border-l-4 border-primary flex justify-between items-start">
          <div>
            <h3 class="font-bold text-white mb-1 flex items-center gap-2">
              <span v-if="ann.type === 'live_class'">🔴</span>
              <span v-else>⚙️</span>
              {{ ann.title }}
            </h3>
            <p class="text-sm text-gray-400 mb-2">{{ ann.message }}</p>
            <div class="flex items-center gap-4 text-xs font-semibold">
              <span class="text-gray-500">{{ new Date(ann.date).toLocaleString() }}</span>
              <a v-if="ann.link" :href="ann.link" target="_blank" class="text-primary hover:underline">Link included</a>
            </div>
          </div>
          <button @click="announcementStore.deleteAnnouncement(ann.id)" class="text-xs text-gray-500 hover:text-red-400">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAnnouncementStore } from '../../stores/announcement'
const announcementStore = useAnnouncementStore()

const title = ref('')
const message = ref('')
const type = ref<'system'|'live_class'>('system')
const link = ref('')

function send() {
  if (!title.value.trim() || !message.value.trim()) return
  announcementStore.addAnnouncement({
    id: 'ann-' + Date.now(),
    title: title.value,
    message: message.value,
    type: type.value,
    link: type.value === 'live_class' ? link.value : undefined,
    date: new Date().toISOString(),
    read: false
  })
  title.value = ''
  message.value = ''
  link.value = ''
}
</script>

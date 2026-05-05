<template>
  <div class="min-h-screen flex flex-col bg-white dark:bg-gray-950">
    <AppNavbar />
    <main class="flex-1">
      <RouterView />
    </main>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppNavbar from './AppNavbar.vue'
import AppFooter from './AppFooter.vue'
</script>

<template>
  <div class="min-h-screen bg-surface-950 flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
    <!-- Orbit animation -->
    <div class="relative w-40 h-40 mx-auto mb-10">
      <div class="absolute inset-0 rounded-full border-2 border-dashed border-white/10 animate-spin-slow" />
      <div class="absolute inset-4 rounded-full border border-white/5" />
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <span class="text-white font-black text-2xl">◎</span>
        </div>
      </div>
      <!-- Orbiting planet -->
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="orbit-planet w-6 h-6 rounded-full bg-accent shadow-glow-accent" />
      </div>
      <div class="absolute inset-0 flex items-center justify-center" style="animation-delay:-3s">
        <div class="orbit-planet-slow w-4 h-4 rounded-full bg-primary-300 opacity-70" />
      </div>
    </div>

    <h1 class="font-heading text-7xl font-extrabold text-white mb-3">404</h1>
    <p class="font-heading text-xl font-bold text-gray-300 mb-3">Lost in Orbit</p>
    <p class="text-gray-500 text-sm max-w-md mb-8">The page you're looking for drifted into deep space. Let's get you back on course.</p>
    <div class="flex gap-3 flex-wrap justify-center">
      <RouterLink to="/" class="btn-primary">← Back to Home</RouterLink>
      <RouterLink to="/courses" class="btn-outline border-white/20 text-white hover:bg-white/5">Browse Courses</RouterLink>
    </div>
  </div>
</template>
<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

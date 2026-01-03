<template>
  <div class="relative w-16 h-16 flex items-center justify-center">
    <!-- SVG Container -->
    <svg viewBox="0 0 36 36" class="w-full h-full transform -rotate-90">
      
      <!-- 1. Background Ring (Track) -->
      <path
        class="text-cyan-900/40"
        d="M18 2.0845
           a 15.9155 15.9155 0 0 1 0 31.831
           a 15.9155 15.9155 0 0 1 0 -31.831"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
      />

      <!-- 2. Value Arc (Progress) -->
      <!-- Stroke-dasharray = value, 100 -->
      <path
        class="text-cyan-400 drop-shadow-[0_0_4px_rgba(34,211,238,0.8)]"
        :stroke-dasharray="`${percentage}, 100`"
        d="M18 2.0845
           a 15.9155 15.9155 0 0 1 0 31.831
           a 15.9155 15.9155 0 0 1 0 -31.831"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
        style="transition: stroke-dasharray 1s ease-out;"
      />
    </svg>

    <!-- 3. Inner Label -->
    <div class="absolute inset-0 flex items-center justify-center flex-col">
       <span class="text-[10px] font-bold font-mono text-cyan-50 drop-shadow-md">{{ percentage }}%</span>
    </div>
    
    <!-- 4. Decorative Spinner (Outer Ring) -->
    <div class="absolute inset-[-4px] border border-cyan-500/20 rounded-full border-t-cyan-500/60 animate-spin-slow pointer-events-none"></div>
  </div>
</template>

<script setup>
defineProps({
  percentage: {
    type: Number,
    required: true,
    default: 0
  }
});
</script>

<style scoped>
.animate-spin-slow {
    animation: spin 3s linear infinite;
}
@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
</style>

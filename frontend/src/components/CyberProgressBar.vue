<template>
  <div class="w-full">
    <!-- Label & Value -->
    <div class="flex justify-between items-end mb-1 px-1">
      <span class="text-[10px] font-mono font-bold tracking-widest uppercase transition-colors" :class="labelColorClass">
        {{ label }}
      </span>
      <span class="text-xs font-bold font-mono" :class="colorClass">
        <span class="text-white">{{ displayValue }}%</span>
      </span>
    </div>

    <!-- Bar Container -->
    <div class="h-5 w-full rounded-sm overflow-hidden border backdrop-blur-sm relative"
         :class="containerBorderClass">
      
      <!-- 第一层：总量轨道背景（暗色） -->
      <div class="absolute inset-0 w-full h-full" :class="trackBgClass">
        <!-- Grid Background -->
        <div class="absolute inset-0 opacity-30" 
             style="background-image: linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 8px 100%;">
        </div>
      </div>

      <!-- 第二层：当前进度填充（带发光） -->
      <div 
        class="h-full relative transition-all duration-1000 ease-out flex items-center"
        :class="[bgClass, glowClass]"
        :style="{ width: displayValue + '%', boxShadow: progressGlowShadow }"
      >
        <!-- Glow Light at tip -->
        <div v-if="displayValue > 0" class="absolute right-0 top-0 bottom-0 w-[3px] bg-white shadow-[0_0_15px_white] z-10"></div>
        
        <!-- Animated Scanline -->
        <div class="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer" style="transform: skewX(-20deg);"></div>
      </div>
    </div>
    
    <!-- Decorative Underline -->
    <div class="h-[1px] w-full mt-1" :class="underlineClass"></div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

const props = defineProps({
  label: String,
  value: {
    type: Number,
    default: 0
  },
  color: {
    type: String, // cyan, bright-blue, purple
    default: 'cyan' 
  }
});

// Animate value from 0 to target on mount
const displayValue = ref(0);

// 动画函数 - 必须在 watch 之前定义，因为 watch 使用了 immediate: true
function animateValue(start, end, duration) {
    if (end === 0 && start === 0) return; // 避免不必要的动画
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        // Ease out quart
        const ease = 1 - Math.pow(1 - progress, 4);
        displayValue.value = Math.round(start + (end - start) * ease);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

watch(() => props.value, (newVal) => {
    // Simple lerp animation
    animateValue(displayValue.value, newVal, 1000);
}, { immediate: true }); // 添加 immediate: true 确保初次加载时触发

const containerBorderClass = computed(() => {
    switch(props.color) {
        case 'purple': return 'border-[#FF1493]'; // 霓虹粉边框
        case 'cyan': return 'border-[#00E5FF]';   // 电光蓝边框
        default: return 'border-cyan-400/50';
    }
});

// 轨道背景颜色（暗色版本）
const trackBgClass = computed(() => {
    switch(props.color) {
        case 'purple': return 'bg-[#FF1493]/20'; // 暗粉色轨道
        case 'cyan': return 'bg-[#00E5FF]/20';   // 暗蓝色轨道
        default: return 'bg-black/40';
    }
});

// 进度条发光效果
const progressGlowShadow = computed(() => {
    switch(props.color) {
        case 'purple': return '0 0 15px #FF1493, 0 0 25px #FF69B4';
        case 'cyan': return '0 0 15px #00E5FF, 0 0 25px #00FFFF';
        default: return '0 0 15px currentColor';
    }
});

// 发光效果样式
const glowClass = computed(() => 'animate-glow');

// Label 颜色 - 与进度条相同颜色系
const labelColorClass = computed(() => {
    switch(props.color) {
        case 'purple': return 'text-[#FF69B4]'; // 霓虹粉
        case 'cyan': return 'text-[#00E5FF]';   // 电光蓝
        default: return 'text-cyan-600';
    }
});

const underlineClass = computed(() => {
     switch(props.color) {
        case 'purple': return 'bg-gradient-to-r from-transparent via-[#FF1493]/60 to-transparent'; // 霓虹粉下划线
        case 'cyan': return 'bg-gradient-to-r from-transparent via-[#00E5FF]/60 to-transparent';   // 电光蓝下划线
        default: return 'bg-gradient-to-r from-cyan-900/0 via-cyan-400/50 to-cyan-900/0';
    }
});

const colorClass = computed(() => {
    switch(props.color) {
        case 'purple': return 'text-[#FF69B4] drop-shadow-[0_0_12px_rgba(255,20,147,1)]'; // 霓虹粉文字
        case 'cyan': return 'text-[#00FFFF] drop-shadow-[0_0_12px_rgba(0,229,255,1)]';    // 电光蓝文字
        default: return 'text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,1)]';
    }
});

const bgClass = computed(() => {
    switch(props.color) {
        // 霓虹粉/品红色渐变 - 更鲜艳
        case 'purple': return 'bg-gradient-to-r from-[#FF1493] via-[#FF69B4] to-[#FFB6C1] text-[#FF1493]';
        // 电光蓝渐变 - 更鲜艳
        case 'cyan': return 'bg-gradient-to-r from-[#00BFFF] via-[#00E5FF] to-[#00FFFF] text-[#00E5FF]';
        default: return 'bg-gradient-to-r from-cyan-600 via-cyan-400 to-cyan-300 text-cyan-400';
    }
});
</script>

<style scoped>
@keyframes shimmer {
    0% { transform: translateX(-100%) skewX(-20deg); }
    100% { transform: translateX(200%) skewX(-20deg); }
}
.animate-shimmer {
    animation: shimmer 2s infinite linear;
}

@keyframes glow-pulse {
    0%, 100% { opacity: 1; filter: brightness(1); }
    50% { opacity: 0.9; filter: brightness(1.2); }
}
.animate-glow {
    animation: glow-pulse 2s ease-in-out infinite;
}
</style>

<template>
  <div class="team-stats-container">
    <div class="stats-header">
      <h3 class="stats-title">TEAM LEADER ANALYTICS</h3>
      <div class="stats-subtitle">知识库建设进度统计</div>
    </div>
    
    <div class="stats-content">
      <div class="legend">
        <div class="legend-item">
          <span class="legend-dot kb-ratio"></span>
          <span>知识库占比</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot construction-ratio"></span>
          <span>构建完成率</span>
        </div>
      </div>
      
      <div class="chart-wrapper">
        <div 
          v-for="(stat, index) in teamStats" 
          :key="stat.name"
          class="chart-row"
          :style="{ animationDelay: `${index * 0.05}s` }"
        >
          <div class="tl-name" :title="stat.name">{{ stat.name }}</div>
          <div class="bars-container">
            <!-- KB Ratio Bar -->
            <div class="bar-group">
              <div class="bar-track">
                <div 
                  class="bar-fill kb-bar" 
                  :style="{ width: `${stat.kbRatio}%` }"
                >
                  <span class="bar-value">{{ stat.kbRatio }}%</span>
                </div>
              </div>
              <div class="bar-count">{{ stat.kbCount }}/{{ stat.totalRepos }}</div>
            </div>
            <!-- Construction Ratio Bar -->
            <div class="bar-group">
              <div class="bar-track">
                <div 
                  class="bar-fill construction-bar" 
                  :style="{ width: `${stat.constructionRatio}%` }"
                >
                  <span class="bar-value">{{ stat.constructionRatio }}%</span>
                </div>
              </div>
              <div class="bar-count">{{ stat.constructedCount }}/{{ stat.kbCount }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Scan line effect -->
    <div class="scan-line"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  repos: {
    type: Array,
    default: () => []
  },
  tlNames: {
    type: Array,
    default: () => []
  }
});

const teamStats = computed(() => {
  const stats = props.tlNames.map(name => {
    // Find repos where caretaker contains this TL name
    const tlRepos = props.repos.filter(repo => 
      repo.caretaker && repo.caretaker.includes(name)
    );
    
    const totalRepos = tlRepos.length;
    const kbRepos = tlRepos.filter(repo => repo.knowledgeBase);
    const kbCount = kbRepos.length;
    const constructedCount = kbRepos.filter(repo => repo.hasProfile).length;
    
    // Calculate ratios
    const kbRatio = totalRepos > 0 ? Math.round((kbCount / totalRepos) * 100) : 0;
    const constructionRatio = kbCount > 0 ? Math.round((constructedCount / kbCount) * 100) : 0;
    
    return {
      name,
      totalRepos,
      kbCount,
      constructedCount,
      kbRatio,
      constructionRatio
    };
  });
  
  // Sort by total repos descending
  return stats.sort((a, b) => b.totalRepos - a.totalRepos);
});
</script>

<style scoped>
.team-stats-container {
  position: relative;
  background: rgba(5, 10, 20, 0.9);
  border: 1px solid rgba(6, 182, 212, 0.6);
  border-left: 2px solid #22d3ee;
  padding: 16px;
  font-family: 'Courier New', monospace;
  overflow: hidden;
  max-height: 380px;
  width: 320px;
  clip-path: polygon(
    0 0, 
    100% 0, 
    100% calc(100% - 12px), 
    calc(100% - 12px) 100%, 
    0 100%
  );
  box-shadow: 
    0 0 20px rgba(6, 182, 212, 0.2),
    inset 0 0 30px rgba(6, 182, 212, 0.05);
}

.stats-header {
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(6, 182, 212, 0.4);
}

.stats-title {
  font-size: 11px;
  font-weight: 700;
  color: #22d3ee;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  margin: 0 0 4px 0;
  text-shadow: 0 0 8px rgba(34, 211, 238, 0.6);
}

.stats-subtitle {
  font-size: 9px;
  color: rgba(34, 211, 238, 0.6);
  letter-spacing: 0.1em;
}

.legend {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  font-size: 9px;
  color: rgba(255, 255, 255, 0.7);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 2px;
}

.legend-dot.kb-ratio {
  background: #22d3ee;
  box-shadow: 0 0 6px #22d3ee;
}

.legend-dot.construction-ratio {
  background: #00ff9f;
  box-shadow: 0 0 6px #00ff9f;
}

.chart-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 280px;
  overflow-y: auto;
  padding-right: 4px;
}

.chart-wrapper::-webkit-scrollbar {
  width: 3px;
}

.chart-wrapper::-webkit-scrollbar-track {
  background: rgba(6, 182, 212, 0.1);
}

.chart-wrapper::-webkit-scrollbar-thumb {
  background: rgba(6, 182, 212, 0.4);
  border-radius: 2px;
}

.chart-row {
  display: flex;
  align-items: center;
  gap: 8px;
  animation: fadeInRow 0.3s ease forwards;
  opacity: 0;
}

@keyframes fadeInRow {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.tl-name {
  width: 50px;
  font-size: 10px;
  color: #fff;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 0;
}

.bars-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.bar-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.bar-track {
  flex: 1;
  height: 10px;
  background: rgba(6, 182, 212, 0.1);
  border-radius: 2px;
  overflow: hidden;
  position: relative;
}

.bar-fill {
  height: 100%;
  border-radius: 2px;
  position: relative;
  transition: width 0.8s ease;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 4px;
  min-width: 30px;
}

.bar-fill.kb-bar {
  background: linear-gradient(90deg, rgba(34, 211, 238, 0.3) 0%, #22d3ee 100%);
  box-shadow: 0 0 8px rgba(34, 211, 238, 0.5);
}

.bar-fill.construction-bar {
  background: linear-gradient(90deg, rgba(0, 255, 159, 0.3) 0%, #00ff9f 100%);
  box-shadow: 0 0 8px rgba(0, 255, 159, 0.5);
}

.bar-value {
  font-size: 8px;
  font-weight: 700;
  color: #000;
  text-shadow: none;
}

.bar-count {
  font-size: 8px;
  color: rgba(255, 255, 255, 0.5);
  width: 36px;
  text-align: right;
  flex-shrink: 0;
}

/* Scan line effect */
.scan-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%,
    rgba(34, 211, 238, 0.8) 50%,
    transparent 100%
  );
  animation: scan 3s linear infinite;
  pointer-events: none;
}

@keyframes scan {
  0% { top: 0; opacity: 0.8; }
  50% { opacity: 0.4; }
  100% { top: 100%; opacity: 0.8; }
}

/* Glitch overlay */
.team-stats-container::before {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(6, 182, 212, 0.02) 2px,
    rgba(6, 182, 212, 0.02) 4px
  );
  pointer-events: none;
  z-index: 1;
}

.stats-content {
  position: relative;
  z-index: 2;
}
</style>
